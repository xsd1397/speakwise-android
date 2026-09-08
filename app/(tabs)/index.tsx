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
} from "react-native";
import * as Speech from "expo-speech";
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import { SCENES } from "../../lib/data";
import { getWordDefinition, lookupWordDefinition, type WordDefinition } from "../../lib/word";
import { WordLookupModal } from "../../components/WordLookupModal";
import {
  replyToDialogue,
  fetchDialogueSuggestions,
  transcribeRecording,
  translateText,
  DialogueMessage,
} from "../../lib/api";

type Scene = (typeof SCENES)[number];

function WordSentence({ text, onWord }: { text: string; onWord: (word: string) => void }) {
  return (
    <Text>
      {text.split(/(\s+)/).map((part, index) =>
        /\s+/.test(part) ? (
          part
        ) : (
          <Text key={`${part}-${index}`} onPress={() => onWord(part)} style={styles.word}>
            {part}
          </Text>
        ),
      )}
    </Text>
  );
}

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionTranslations, setSuggestionTranslations] = useState<Record<number, string>>({});
  const [messageTranslations, setMessageTranslations] = useState<Record<string, string>>({});
  const [translatingId, setTranslatingId] = useState<string | number | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<WordDefinition | null>(null);
  const [selectedExample, setSelectedExample] = useState("");

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!selectedWord) {
      setSelectedDefinition(null);
      return;
    }

    setSelectedDefinition(getWordDefinition(selectedWord));
    let active = true;
    lookupWordDefinition(selectedWord).then((definition) => {
      if (active) setSelectedDefinition(definition);
    });
    return () => {
      active = false;
    };
  }, [selectedWord]);

  const handleWordPress = (word: string, example: string) => {
    setSelectedWord(word);
    setSelectedExample(example);
    Speech.stop();
    Speech.speak(word, { language: "en-US" });
  };

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
    setShowSuggestions(false);
    setSuggestionTranslations({});
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
            setSuggestions(sugs.slice(0, 2));
            setSuggestionTranslations({});
          }
        })
        .catch(() => setSuggestions([]));
    }
  }, [messages, selectedScene]);

  const containsChinese = (value: string) => /[\u3400-\u9FFF]/.test(value);

  // 中文第一次点击发送只翻译并回填输入框，第二次点击才发送。
  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim() || isLoading) return;

    if (!textToSend && containsChinese(content)) {
      setIsLoading(true);
      try {
        const result = await translateText({
          text: content.trim(),
          sourceLanguage: "zh",
          targetLanguage: "en",
        });
        setInputText(result.text);
      } catch (error) {
        console.error("Failed to translate Chinese input:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

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

  // 停止录音并将转写结果放回输入框
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
        const transRes = await transcribeRecording({ audioBase64: base64Data, language: "auto" });
        userText = transRes.text || "Hello! Practice speaking.";
        if (/[\u3400-\u9FFF]/.test(userText)) {
          const english = await translateText({
            text: userText,
            sourceLanguage: "zh",
            targetLanguage: "en",
          });
          userText = english.text;
        }
      } catch (error) {
        console.error("Failed to transcribe or translate recording:", error);
        userText = userText || "Hello! Practice speaking.";
      }

      // 2. 仅将录音转写结果放回输入框，由用户确认后点击 SEND。
      setInputText(userText);
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

  const handleTranslateMessage = async (messageId: string, text: string) => {
    if (messageTranslations[messageId]) {
      setMessageTranslations((current) => {
        const next = { ...current };
        delete next[messageId];
        return next;
      });
      return;
    }
    setTranslatingId(messageId);
    try {
      const result = await translateText({ text, sourceLanguage: "en", targetLanguage: "zh" });
      setMessageTranslations((current) => ({ ...current, [messageId]: result.text }));
    } catch (error) {
      console.error("Failed to translate AI reply:", error);
    } finally {
      setTranslatingId(null);
    }
  };

  const handleTranslateSuggestion = async (index: number, text: string) => {
    if (suggestionTranslations[index]) {
      setSuggestionTranslations((current) => {
        const next = { ...current };
        delete next[index];
        return next;
      });
      return;
    }
    setTranslatingId(index);
    try {
      const result = await translateText({ text, sourceLanguage: "en", targetLanguage: "zh" });
      setSuggestionTranslations((current) => ({ ...current, [index]: result.text }));
    } catch (error) {
      console.error("Failed to translate suggestion:", error);
    } finally {
      setTranslatingId(null);
    }
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
            <WordSentence
              text={msg.text}
              onWord={(word) => handleWordPress(word, msg.text)}
            />

            {/* AI 消息朗读按键 */}
            {msg.role === "assistant" && (
              <View style={styles.messageActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleSpeak(msg.text)}>
                  <Text style={styles.actionButtonText}>🔊 朗读</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleTranslateMessage(msg.id || String(msg.timestamp), msg.text)}
                  disabled={translatingId === (msg.id || String(msg.timestamp))}
                >
                  <Text style={styles.actionButtonText}>
                    {translatingId === (msg.id || String(msg.timestamp))
                      ? "翻译中..."
                      : messageTranslations[msg.id || String(msg.timestamp)]
                        ? "收起中文"
                        : "中文翻译"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {msg.role === "assistant" && messageTranslations[msg.id || String(msg.timestamp)] && (
              <Text style={styles.translationText}>{messageTranslations[msg.id || String(msg.timestamp)]}</Text>
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

      {/* 回复提示默认隐藏，点击灯泡后显示两条 */}
      {showSuggestions && suggestions.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
          {suggestions.map((sug, idx) => (
            <View key={idx} style={styles.suggestionCard}>
              <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSendMessage(sug)}>
                <Text style={styles.suggestionText}>{sug}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleTranslateSuggestion(idx, sug)}>
                <Text style={styles.suggestionTranslationButton}>
                  {translatingId === idx ? "翻译中..." : suggestionTranslations[idx] ? "收起中文" : "中文翻译"}
                </Text>
              </TouchableOpacity>
              {suggestionTranslations[idx] && (
                <Text style={styles.suggestionTranslation}>{suggestionTranslations[idx]}</Text>
              )}
            </View>
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
        <TouchableOpacity
          style={styles.hintButton}
          onPress={() => setShowSuggestions((current) => !current)}
          accessibilityLabel="显示回复提示"
        >
          <Text style={styles.hintButtonText}>💡</Text>
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

      <WordLookupModal
        visible={Boolean(selectedWord)}
        word={selectedWord}
        definition={selectedDefinition}
        example={selectedExample}
        onClose={() => setSelectedWord(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0C0F" },
  header: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#111317", borderBottomWidth: 1, borderBottomColor: "#292C33" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#F2F3F5" },
  scenesContainer: { maxHeight: 60, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#111317", borderBottomWidth: 1, borderBottomColor: "#292C33" },
  sceneChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#162A57", marginRight: 8, height: 36, justifyContent: "center" },
  sceneChipActive: { backgroundColor: "#2F6BEB" },
  sceneChipText: { fontSize: 14, color: "#F2F3F5", fontWeight: "500" },
  sceneChipTextActive: { color: "#F2F3F5" },
  chatContainer: { flex: 1, padding: 16 },
  chatContent: { paddingBottom: 20 },
  messageBubble: { maxWidth: "85%", padding: 12, borderRadius: 16, marginBottom: 12 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#2F6BEB" },
  assistantBubble: { alignSelf: "flex-start", backgroundColor: "#111317" },
  messageText: { fontSize: 15 },
  word: { color: "#F2F3F5", fontSize: 15, lineHeight: 23 },
  userText: { color: "#F2F3F5" },
  assistantText: { color: "#F2F3F5" },
  loadingRow: { flexDirection: "row", alignItems: "center" },
  messageActions: { flexDirection: "row", gap: 10, marginTop: 6 },
  actionButton: { backgroundColor: "#162A57", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  actionButtonText: { fontSize: 12, color: "#9DB9FF", fontWeight: "600" },
  translationText: { color: "#9AA2B4", fontSize: 13, lineHeight: 20, marginTop: 8 },
  suggestionsContainer: { maxHeight: 100, paddingHorizontal: 16, backgroundColor: "#111317", borderTopWidth: 1, borderTopColor: "#292C33" },
  suggestionCard: { marginRight: 10, marginVertical: 7, alignItems: "flex-start" },
  suggestionChip: { backgroundColor: "#162A57", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#3A5FAF" },
  suggestionText: { fontSize: 13, color: "#F2F3F5", maxWidth: 180 },
  suggestionTranslationButton: { color: "#9DB9FF", fontSize: 11, fontWeight: "700", marginTop: 2 },
  suggestionTranslation: { color: "#9AA2B4", fontSize: 11, maxWidth: 180, marginTop: 2 },
  inputContainer: { flexDirection: "row", padding: 12, backgroundColor: "#111317", borderTopWidth: 1, borderTopColor: "#292C33", alignItems: "center" },
  micButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#162A57", justifyContent: "center", alignItems: "center", marginRight: 8 },
  micButtonRecording: { backgroundColor: "#5B2632" },
  micButtonText: { fontSize: 18 },
  hintButton: { width: 34, height: 40, borderRadius: 20, backgroundColor: "#162A57", justifyContent: "center", alignItems: "center", marginRight: 8 },
  hintButtonText: { fontSize: 17 },
  textInput: { flex: 1, height: 40, borderWidth: 1, borderColor: "#3A3D45", borderRadius: 20, paddingHorizontal: 16, backgroundColor: "#151820", color: "#F2F3F5", fontSize: 14 },
  sendButton: { marginLeft: 8, backgroundColor: "#2F6BEB", borderRadius: 20, paddingHorizontal: 16, height: 40, justifyContent: "center", alignItems: "center" },
  sendButtonDisabled: { backgroundColor: "#3A3D45" },
  sendButtonText: { color: "#F2F3F5", fontWeight: "bold", fontSize: 14 },
});