import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import * as Speech from "expo-speech";
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import { SCENES } from "../../lib/data";
import {
  replyToDialogue,
  fetchDialogueSuggestions,
  transcribeRecording,
  evaluateRecording,
  DialogueMessage,
  EvaluationResult,
} from "../../lib/api";

type Scene = (typeof SCENES)[number];

export default function IndexScreen() {
  const [selectedScene, setSelectedScene] = useState<Scene>(SCENES[0]);
  const [messages, setMessages] = useState<DialogueMessage[]>([
    {
      id: "1",
      role: "assistant",
      text: `Hello! Let's practice conversation for: ${selectedScene.title}. How can I help you today?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationResult | null>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!selectedEvaluation) return;

    const timer = setTimeout(() => {
      setSelectedEvaluation(null);
    }, 10000);

    return () => clearTimeout(timer);
  }, [selectedEvaluation]);

  // 场景切换
  const handleSelectScene = (scene: Scene) => {
    setSelectedScene(scene);
    const initialMsg: DialogueMessage = {
      id: Date.now().toString(),
      role: "assistant",
      text: `Hello! Let's practice conversation for: ${scene.title}. How can I help you today?`,
      timestamp: Date.now(),
    };
    setMessages([initialMsg]);
    setSuggestions([]);
  };

  // 自动获取快捷建议
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "assistant") {
      fetchDialogueSuggestions({
        level: "beginner",
        scene: selectedScene.key,
        history: messages.slice(0, -1).map((m) => ({ role: m.role, text: m.text })),
        aiMessage: lastMsg.text,
      })
        .then((sugs) => {
          if (Array.isArray(sugs)) {
            setSuggestions(sugs);
          }
        })
        .catch(() => setSuggestions([]));
    }
  }, [messages, selectedScene]);

  // 发送文本消息
  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim() || isLoading) return;

    const userMsg: DialogueMessage = {
      id: Date.now().toString(),
      role: "user",
      text: content.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      const response = await replyToDialogue({
        level: "beginner",
        scene: selectedScene.key,
        history: messages.map((m) => ({ role: m.role, text: m.text })),
        userMessage: content.trim(),
      });

      const replyText = response?.reply || response?.message || "I hear you. Let's keep practicing!";
      const assistantMsg: DialogueMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: replyText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Failed to send dialogue message:", error);
      const errorMsg: DialogueMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "❌ Network error or connection failed, please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 开始录音
  const startRecording = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (permission.status !== "granted") {
        alert("Microphone permission is required to record audio.");
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  // 停止录音并提交评分与对话
  const stopAndProcessRecording = async () => {
    if (!isRecording) return;
    try {
      setIsRecording(false);
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) return;

      setIsLoading(true);

      // 将录音文件读取为 Base64
      const blobResp = await fetch(uri);
      const blob = await blobResp.blob();
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const base64 = res.includes(",") ? res.split(",")[1] : res;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // 1. 转译录音文本
      let userText = "";
      try {
        const transRes = await transcribeRecording({ audioBase64: base64Data });
        userText = transRes.text || "Hello! Practice speaking.";
      } catch {
        userText = "Hello! Practice speaking.";
      }

      // 2. 获取发音与语法评分
      let evalRes: EvaluationResult | undefined;
      try {
        evalRes = await evaluateRecording({
          text: userText,
          audioBase64: base64Data,
          level: "beginner",
          scene: selectedScene.key,
        });
      } catch (e) {
        console.error("Evaluation error:", e);
      }

      // 3. 构建用户消息（挂载评分）
      const userMsg: DialogueMessage = {
        id: Date.now().toString(),
        role: "user",
        text: userText,
        timestamp: Date.now(),
        evaluation: evalRes,
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInputText(userText);
      setSelectedEvaluation(evalRes ?? null);

      // 4. 获取 AI 回复
      const response = await replyToDialogue({
        level: "beginner",
        scene: selectedScene.key,
        history: updatedMessages.map((m) => ({ role: m.role, text: m.text })),
        userMessage: userText,
      });

      const replyText = response?.reply || response?.message || "Great effort! Keep practicing!";
      const assistantMsg: DialogueMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: replyText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Error processing recording:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "en-US" });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SpeakWise AI Coach</Text>
      </View>

      {/* 场景选择 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scenesContainer}>
        {SCENES.map((scene) => (
          <TouchableOpacity
            key={scene.key}
            style={[
              styles.sceneChip,
              selectedScene.key === scene.key && styles.sceneChipActive,
            ]}
            onPress={() => handleSelectScene(scene)}
          >
            <Text
              style={[
                styles.sceneChipText,
                selectedScene.key === scene.key && styles.sceneChipTextActive,
              ]}
            >
              {scene.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 消息列表 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id || Math.random().toString()}
            style={[
              styles.messageBubble,
              msg.role === "user" ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.role === "user" ? styles.userText : styles.assistantText,
              ]}
            >
              {msg.text}
            </Text>

            {/* 语音评分挂贴（点击可查看详细评分） */}
            {msg.role === "user" && msg.evaluation && (
              <TouchableOpacity
                style={styles.evalBadge}
                onPress={() => setSelectedEvaluation(msg.evaluation!)}
              >
                <Text style={styles.evalBadgeText}>
                  🎯 得分: {msg.evaluation.score ?? msg.evaluation.overallScore ?? 85} 分 (点击查看分析)
                </Text>
              </TouchableOpacity>
            )}

            {/* AI 消息朗读按键 */}
            {msg.role === "assistant" && (
              <TouchableOpacity
                style={styles.speakButton}
                onPress={() => handleSpeak(msg.text)}
              >
                <Text style={styles.speakButtonText}>🔊 朗读</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingRow]}>
            <ActivityIndicator size="small" color="#4F46E5" />
            <Text style={[styles.assistantText, { marginLeft: 8 }]}>AI 分析与思考中...</Text>
          </View>
        )}
      </ScrollView>

      {/* 快捷推荐回复 */}
      {suggestions.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
          {suggestions.map((sug, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionChip}
              onPress={() => handleSendMessage(sug)}
            >
              <Text style={styles.suggestionText}>{sug}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 底部打字与录音输入栏 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        {/* 录音/停止控制按钮 */}
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonRecording]}
          onPress={isRecording ? stopAndProcessRecording : startRecording}
          disabled={isLoading}
        >
          <Text style={styles.micButtonText}>{isRecording ? "⏹️" : "🎤"}</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder={isRecording ? "正在录音，点击右侧或左侧按钮停止..." : "输入英文或点击麦克风录音..."}
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSendMessage()}
          returnKeyType="send"
          editable={!isRecording}
        />

        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* 评分分析 Modal 弹窗 */}
      <Modal
        visible={!!selectedEvaluation}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedEvaluation(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎯 发音与表达评估分析</Text>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreNumber}>
                {selectedEvaluation?.score ?? selectedEvaluation?.overallScore ?? 85}
              </Text>
              <Text style={styles.scoreLabel}>综合发音得分</Text>
            </View>

            {selectedEvaluation?.feedback && (
              <Text style={styles.feedbackText}>{selectedEvaluation.feedback}</Text>
            )}

            {selectedEvaluation?.pronunciation && selectedEvaluation.pronunciation.length > 0 && (
              <View style={styles.evalDetailBox}>
                <Text style={styles.evalDetailTitle}>🗣️ 发音建议：</Text>
                {selectedEvaluation.pronunciation.map((item, idx) => (
                  <Text key={idx} style={styles.evalDetailItem}>• {item}</Text>
                ))}
              </View>
            )}

            {selectedEvaluation?.grammar && selectedEvaluation.grammar.length > 0 && (
              <View style={styles.evalDetailBox}>
                <Text style={styles.evalDetailTitle}>📝 语法优化：</Text>
                {selectedEvaluation.grammar.map((item, idx) => (
                  <Text key={idx} style={styles.evalDetailItem}>• {item}</Text>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedEvaluation(null)}
            >
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  scenesContainer: {
    maxHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sceneChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    height: 36,
    justifyContent: "center",
  },
  sceneChipActive: {
    backgroundColor: "#4F46E5",
  },
  sceneChipText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  sceneChipTextActive: {
    color: "#FFFFFF",
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  chatContent: {
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#4F46E5",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
  },
  messageText: {
    fontSize: 15,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: "#1F2937",
  },
  evalBadge: {
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  evalBadgeText: {
    fontSize: 12,
    color: "#FEF08A",
    fontWeight: "600",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  speakButton: {
    marginTop: 6,
    alignSelf: "flex-start",
  },
  speakButtonText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "600",
  },
  suggestionsContainer: {
    maxHeight: 50,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  suggestionChip: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    justifyContent: "center",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  suggestionText: {
    fontSize: 13,
    color: "#4338CA",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  micButtonRecording: {
    backgroundColor: "#FEE2E2",
  },
  micButtonText: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    color: "#1F2937",
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  scoreLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  feedbackText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
  },
  evalDetailBox: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  evalDetailTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  evalDetailItem: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
  },
  closeButton: {
    marginTop: 8,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});