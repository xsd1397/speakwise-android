import { SuggestionCarousel, SuggestionItem } from '../../components/SuggestionCarousel';
import { ChatControlBar } from '../../components/ChatControlBar';
import { WordLookupModal } from '../../components/WordLookupModal';
import * as Speech from "expo-speech";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { evaluateRecording, getApiBaseUrl, replyToDialogue, getReplySuggestions, transcribeRecording, translateToChinese, translateToEnglish, type DialogueMessage, type EvaluationResult } from "@/lib/api";
import { getLevelLabel, getPracticeDialogue, LEVELS, SCENES, type LevelKey, type SceneKey, type Speaker } from "@/lib/data";
import { getSpeechRate, selectVoiceForSpeaker } from "@/lib/voice";
import { getWordDefinition, lookupWordDefinition, type WordDefinition } from "@/lib/word";
import { useWordbook } from "@/lib/wordbook";

const ModalComponent = Modal ?? View;
const COLORS = { 
  bg: "#0B0C0F", 
  panel: "#111317", 
  panel2: "#151820", 
  border: "#3A3D45", 
  text: "#F2F3F5", 
  muted: "#9AA2B4", 
  blue: "#2F6BEB", 
  blueSoft: "#1D3D86", 
  orange: "#FFB15C", 
  correctionBg: "#1A233A", 
  correctionBorder: "#4A6BEB", 
  success: "#73E2A8",
  statBg: "#182C25"
};

function voiceSpeaker(speaker: Speaker): "Alex" | "Mia" { 
  return ["Mia", "Agent", "Lee", "Landlord", "Receptionist", "Banker", "Server", "StationAgent", "Clerk", "Teacher"].includes(speaker) ? "Mia" : "Alex"; 
}

function WordSentence({ text, onWord }: { text: string; onWord: (word: string) => void }) { 
  return (
    <Text style={styles.sentence}>
      {text.split(/(\s+)/).map((part, i) => 
        /\s+/.test(part) ? (
          part
        ) : (
          <Text key={`${part}-${i}`} onPress={() => onWord(part)} style={styles.word}>
            {part}
          </Text>
        )
      )}
    </Text>
  ); 
}

function CorrectionCard({ original, corrected }: { original: string; corrected: string }) {
  return (
    <View style={styles.correctionCard}>
      <View style={styles.correctionHeader}>
        <Text style={styles.correctionTitle}>✍️ 教师纠错 (Correction)</Text>
      </View>
      <View style={styles.correctionBody}>
        <Text style={styles.correctionLabel}>原句：</Text>
        <Text style={styles.correctionOriginal}>{original}</Text>
        <View style={styles.correctionDivider} />
        <Text style={styles.correctionLabel}>建议：</Text>
        <Text style={styles.correctionCorrected}>{corrected}</Text>
      </View>
    </View>
  );
}

export default function PracticeScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const aiRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const aiRecorderState = useAudioRecorderState(aiRecorder, 250);
  const [level, setLevel] = useState<LevelKey>("beginner");
  const [scene, setScene] = useState<SceneKey>("greetings");
  const [voices, setVoices] = useState<Speech.Voice[]>([]);

  // 单词查询与弹窗控制状态
  const [lookupTargetWord, setLookupTargetWord] = useState<string>("");
  const [isWordLookupVisible, setIsWordLookupVisible] = useState<boolean>(false);

  const { words: savedWords, toggleWord, hasWord } = useWordbook();
  const [translated, setTranslated] = useState<Record<string, boolean>>({});
  const [recordingLine, setRecordingLine] = useState<string | null>(null);
  const [recordingMessage, setRecordingMessage] = useState("点击句子右侧“录音评分”，完成后将在当前句下显示 6 秒评分详情");
  const [aiRecording, setAiRecording] = useState(false);
  const [aiRecordingUri, setAiRecordingUri] = useState<string | null>(null);
  const [aiRecordingMessage, setAiRecordingMessage] = useState("可输入英文或录音，点击【纠错】获取分析");
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [lineEvaluation, setLineEvaluation] = useState<{ lineId: string; result: EvaluationResult } | null>(null);
  const evaluationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [input, setInput] = useState("");
  const [translationLoading, setTranslationLoading] = useState(false);
  const [dialogue, setDialogue] = useState<DialogueMessage[]>([]);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const [stats, setStats] = useState({ rounds: 0, recordings: 0, scores: [] as number[] });
  const averageScore = stats.scores.length > 0 
    ? Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length) 
    : null;

  // 回复提示列表与控制
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsList, setSuggestionsList] = useState<SuggestionItem[]>([
    {
      id: "s1",
      english: "I am doing great, thank you! How about you?",
      chinese: "我过得挺好的，谢谢！你呢？"
    },
    {
      id: "s2",
      english: "Could you please repeat that more slowly?",
      chinese: "你能说得慢一点并重复一次吗？"
    },
    {
      id: "s3",
      english: "That sounds like a wonderful idea!",
      chinese: "听起来真是个不错的主意！"
    }
  ]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const showLineEvaluation = (lineId: string, result: EvaluationResult) => { 
    if (evaluationTimer.current) clearTimeout(evaluationTimer.current); 
    setLineEvaluation({ lineId, result }); 
    evaluationTimer.current = setTimeout(() => setLineEvaluation(null), 6000); 
  };
  
  const lines = useMemo(() => getPracticeDialogue(scene, level), [scene, level]);
  const target = lines[0];

  useEffect(() => { 
    setDialogue([{ role: "assistant", text: target.text, translation: target.translation }]); 
    setTranslated({}); 
    setAiRecordingMessage("可输入英文或录音，点击【纠错】获取分析"); 
  }, [scene, level, target.text]);

  useEffect(() => { 
    Speech.getAvailableVoicesAsync().then(setVoices).catch(() => setVoices([])); 
    return () => { Speech.stop?.(); }; 
  }, []);

  const speak = (text: string, speaker: Speaker = "Alex") => { 
    Speech.stop(); 
    const selection = selectVoiceForSpeaker(voices, voiceSpeaker(speaker)); 
    const options: Speech.SpeechOptions = { 
      language: "en-US", 
      rate: getSpeechRate(level === "beginner" ? .9 : level === "advanced" ? 1.05 : 1), 
      onError: () => setReplyError("系统语音暂时不可用，请检查 Android 语音服务设置。") 
    }; 
    if (selection.voice?.identifier) options.voice = selection.voice.identifier; 
    Speech.speak(text, options); 
  };

  const handleWordClick = (word: string) => {
    const clean = word.replace(/[^\w]/g, '').trim();
    if (clean) {
      setLookupTargetWord(clean);
      setIsWordLookupVisible(true);
    }
  };

  const toggleRecording = async (line = target) => {
    setRecordingError(null); setEvaluation(null);
    if (recorderState.isRecording) { 
      try { 
        await recorder.stop(); 
        const uri = recorder.uri; 
        if (!uri) throw new Error("没有找到录音文件，请重新录制。"); 
        setRecordingLine(null); 
        setRecordingMessage("真实录音已保存，正在准备评分"); 
        if (!getApiBaseUrl()) { setRecordingMessage("真实录音已保存；配置后端地址后可提交评分"); return; } 
        setEvaluationLoading(true); 
        const result = await evaluateRecording(uri, line.text); 
        setEvaluation(result); 
        showLineEvaluation(line.id, result); 
        setRecordingMessage("评分完成：点击句子下方评分详情可立即关闭"); 
        setStats(prev => ({ ...prev, recordings: prev.recordings + 1, scores: [...prev.scores, result.overallScore] }));
      } catch (e) { setRecordingError(e instanceof Error ? e.message : "录音处理失败，请重试。"); } finally { setEvaluationLoading(false); } 
      return; 
    }
    try { 
      const permission = await requestRecordingPermissionsAsync(); 
      if (!permission.granted) throw new Error("需要麦克风权限才能进行真实录音练习。"); 
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "doNotMix", allowsRecording: true }); 
      await recorder.prepareToRecordAsync(); 
      recorder.record(); 
      setRecordingLine(line.id); 
      setRecordingMessage("正在录音 · 再次点击停止并评分"); 
    } catch (e) { setRecordingError(e instanceof Error ? e.message : "无法开始录音，请检查麦克风权限。"); }
  };

  const sendAiRecording = async () => { 
    if (aiRecording) { 
      try { 
        await aiRecorder.stop(); 
        const uri = aiRecorder.uri; 
        setAiRecording(false); 
        if (!uri) throw new Error("没有找到录音文件，请重新录音。"); 
        setAiRecordingUri(uri); 
        setAiRecordingMessage("正在识别语音内容……"); 
        const result = await transcribeRecording(uri, "audio/mp4", "auto"); 
        setInput(result.text); 
        setAiRecordingMessage("录音识别完成，请点击【纠错】获取分析或发送。"); 
      } catch (e) { setAiRecordingMessage(e instanceof Error ? e.message : "语音识别失败，请改用文字输入重试。"); } 
      return; 
    } 
    try { 
      const permission = await requestRecordingPermissionsAsync(); 
      if (!permission.granted) throw new Error("需要麦克风权限才能录音。"); 
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "doNotMix", allowsRecording: true }); 
      await aiRecorder.prepareToRecordAsync(); 
      aiRecorder.record(); 
      setAiRecording(true); 
      setAiRecordingMessage("正在录音，再次点击停止并转写至输入框"); 
    } catch (e) { setAiRecordingMessage(e instanceof Error ? e.message : "无法开始录音，请检查麦克风权限。"); } 
  };

  const handleSendReply = async (textToSend?: string) => {
    const rawMessage = (textToSend ?? input).trim(); 
    if (!rawMessage || replyLoading || translationLoading) return; 
    setReplyError(null); 

    setInput("");
    setReplyLoading(true);
    try {
      const userMessage = rawMessage;
      if (!getApiBaseUrl()) { 
        setReplyError("尚未配置后端地址。"); 
        setDialogue((d) => [...d, { role: "user", text: userMessage }]); 
        return; 
      } 
      const response = await replyToDialogue({ level, scene, history: dialogue, userMessage }); 
      const replyTranslation = response.translation?.trim() || await translateToChinese(response.reply); 
      setDialogue((d) => [
        ...d, 
        { role: "user", text: userMessage, correction: response.correctedEnglish ?? response.correction }, 
        { role: "assistant", text: response.reply, translation: replyTranslation }
      ]); 
      speak(response.reply, "Mia");
      setStats(prev => ({ ...prev, rounds: prev.rounds + 1 }));
    } catch (e) { setReplyError(e instanceof Error ? e.message : "AI 对话暂时不可用。"); } finally { setReplyLoading(false); } 
  };

  const requestSuggestions = async () => {
    const latestAssistant = [...dialogue].reverse().find(m => m.role === "assistant");
    if (!latestAssistant) return;
    setSuggestionsLoading(true);
    try {
      const result = await getReplySuggestions({
        level, scene, 
        history: dialogue.slice(-8).map(m => ({ role: m.role, text: m.text })),
        aiMessage: latestAssistant.text
      });
      // 动态将建议转为 SuggestionItem 轮播卡片格式
      const items: SuggestionItem[] = await Promise.all(
        result.suggestions.map(async (eng, idx) => {
          const chn = await translateToChinese(eng);
          return { id: `s_${idx}_${Date.now()}`, english: eng, chinese: chn };
        })
      );
      setSuggestionsList(items);
      setShowSuggestions(true);
    } catch {
      setReplyError("获取建议失败。");
    } finally {
      setSuggestionsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.nav}>
            <View>
              <Text style={styles.brand}>S 英语口语</Text>
              <Text style={styles.kicker}>SpeakWise · 练习助手</Text>
            </View>
            <View style={styles.statsHeader}>
               <Text style={styles.statItem}>📅 {stats.rounds} 轮</Text>
               <Text style={styles.statItem}>🎤 {stats.recordings} 次</Text>
               <Text style={styles.statItem}>🎯 {averageScore ?? "--"}%</Text>
            </View>
          </View>

          <Text style={styles.breadcrumb}>英语口语 / {SCENES.find((s) => s.key === scene)?.title}</Text>

          <View style={styles.selector}>
            <Text style={styles.sectionLabel}>难度级别</Text>
            <View style={styles.row}>
              {LEVELS.map((item) => (
                <Pressable key={item.key} onPress={() => setLevel(item.key)} style={[styles.level, level === item.key && styles.active]}>
                  <Text style={styles.levelTitle}>{item.title}</Text>
                  <Text style={styles.levelSub}>{item.subtitle}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.sectionLabel, { marginTop: 22 }]}>对话场景</Text>
            <View style={styles.sceneGrid}>
              {SCENES.map((item) => (
                <Pressable key={item.key} onPress={() => setScene(item.key)} style={[styles.scene, scene === item.key && styles.active]}>
                  <Text style={styles.sceneTitle}>{item.title}</Text>
                  <Text style={styles.sceneSub}>{item.subtitle}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={styles.eyebrow}>第 01 课 · {SCENES.find((s) => s.key === scene)?.title}</Text>
          <Text style={styles.heroTitle}>从一句问候开始。</Text>
          <Text style={styles.heroSub}>每句话都能听、能译、能录音评分，点击单词查看发音和释义。</Text>

          <View style={styles.target}>
            <Text style={styles.cardLabel}>本课目标句</Text>
            <WordSentence text={target.text} onWord={(w) => { handleWordClick(w); speak(w, target.speaker); }} />
            <Text style={styles.translation}>{target.translation}</Text>
            <Pressable onPress={() => speak(target.text, target.speaker)} style={styles.primary}>
              <Text style={styles.primaryText}>▶ 播放示范</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.eyebrow}>情景对话</Text>
                <Text style={styles.sectionTitle}>{SCENES.find((s) => s.key === scene)?.title} · 跟读练习</Text>
              </View>
              <Text style={styles.muted}>{lines.length} 句</Text>
            </View>
            {lines.map((line) => (
              <View key={line.id} style={styles.line}>
                <View style={styles.lineTop}>
                  <Text style={styles.speaker}>{line.speaker}</Text>
                  <Text style={styles.role}>{line.speaker === "Alex" ? "练习句" : "对话伙伴"}</Text>
                </View>
                <WordSentence text={line.text} onWord={(w) => { handleWordClick(w); speak(w, line.speaker); }} />
                {translated[line.id] && <Text style={styles.translation}>{line.translation}</Text>}
                <View style={styles.actions}>
                  <Pressable onPress={() => speak(line.text, line.speaker)} style={styles.action}>
                    <Text style={styles.actionText}>语音</Text>
                  </Pressable>
                  <Pressable onPress={() => setTranslated((t) => ({ ...t, [line.id]: !t[line.id] }))} style={styles.action}>
                    <Text style={styles.actionText}>{translated[line.id] ? "收起" : "翻译"}</Text>
                  </Pressable>
                  <Pressable onPress={() => toggleRecording(line)} style={[styles.action, recordingLine === line.id && styles.recording]} accessibilityLabel={recordingLine === line.id ? "停止当前句录音" : "录音"}>
                    <Text style={styles.actionText}>{recordingLine === line.id ? "停止并查看评分" : "录音评分"}</Text>
                  </Pressable>
                </View>
                {lineEvaluation?.lineId === line.id && (
                  <Pressable onPress={() => setLineEvaluation(null)} style={styles.score} accessibilityLabel="关闭评分详情">
                    <Text style={styles.scoreValue}>{lineEvaluation.result.overallScore}</Text>
                    <Text style={styles.helper}>发音 {lineEvaluation.result.pronunciationScore} · 流利度 {lineEvaluation.result.fluencyScore} · 准确度 {lineEvaluation.result.accuracyScore}</Text>
                    <Text style={styles.translation}>{lineEvaluation.result.summary}</Text>
                    <Text style={styles.muted}>点击关闭 · 6 秒后自动隐藏</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          <View style={[styles.card, styles.aiCard]}>
            <Text style={styles.eyebrow}>AI 口语对话</Text>
            <Text style={styles.sectionTitle}>和 AI 练习真实交流</Text>
            <Text style={styles.helper}>AI 回复文字出现时会同时播放语音；你也可以点击回复中的单词查看释义。</Text>
            <View style={styles.thread}>
              {dialogue.length === 0 ? (
                <Text style={styles.muted}>正在准备 AI 对话。</Text>
              ) : (
                dialogue.map((m, i) => (
                  <View key={i} style={[styles.bubble, m.role === "user" ? styles.user : styles.assistant]}>
                    <Text style={styles.role}>{m.role === "user" ? "你" : "AI 教练"}</Text>
                    <WordSentence text={m.text} onWord={(w) => { handleWordClick(w); speak(w, "Alex"); }} />
                    {m.role === "user" && m.correction && <CorrectionCard original={m.text} corrected={m.correction} />}
                    {m.role === "assistant" && <Text style={styles.translation}>{m.translation ?? "暂无中文翻译"}</Text>}
                    <View style={styles.actions}>
                      <Pressable onPress={() => speak(m.text, m.role === "assistant" ? "Mia" : "Alex")} style={styles.action}>
                        <Text style={styles.actionText}>语音</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
            
            {/* 1. 回复提示 Carousel (横向吸附滑动, 去掉翻译按钮, 上英下中) */}
            {showSuggestions && (
              <View style={{ marginTop: 12 }}>
                <SuggestionCarousel
                  suggestions={suggestionsList}
                  onSelectSuggestion={(selectedText) => {
                    setInput(selectedText);
                    setShowSuggestions(false);
                  }}
                />
              </View>
            )}

            <View style={styles.inputRow}>
              <TextInput value={input} onChangeText={setInput} onSubmitEditing={() => handleSendReply()} placeholder="输入英文或录音" placeholderTextColor={COLORS.muted} style={styles.input} accessibilityLabel="输入 AI 对话回复" />
              <Pressable onPress={sendAiRecording} style={[styles.send, aiRecording && styles.recording]} accessibilityLabel={aiRecording ? "停止录音" : "开始录音"}>
                <Text style={styles.primaryText}>{aiRecording ? "■ 停止" : "🎙 录音"}</Text>
              </Pressable>
              <Pressable onPress={() => handleSendReply()} style={styles.send} accessibilityLabel="发送 AI 对话回复">
                {replyLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>发送</Text>}
              </Pressable>
            </View>

            {/* 2. 控制栏：回复提示开关 & 纠错/翻译按钮 */}
            <ChatControlBar
              userInputText={input}
              onSend={(finalText) => handleSendReply(finalText)}
              onToggleSuggestions={() => {
                if (!showSuggestions && suggestionsList.length === 0) {
                  requestSuggestions();
                } else {
                  setShowSuggestions((prev) => !prev);
                }
              }}
            />

            <Text style={styles.helper}>{aiRecordingMessage}</Text>
            {replyError && <Text style={styles.error}>{replyError}</Text>}
          </View>

          <Text style={styles.recordStatus}>{recordingMessage}</Text>
          {recordingError && <Text style={styles.error}>{recordingError}</Text>}
          {evaluationLoading && <ActivityIndicator color={COLORS.blue} />}
          {evaluation && (
            <View style={styles.score}>
              <Text style={styles.scoreValue}>{evaluation.overallScore}</Text>
              <Text style={styles.translation}>{evaluation.transcript}</Text>
              <Text style={styles.helper}>{evaluation.summary}</Text>
            </View>
          )}
          <Pressable onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} style={styles.backTop} accessibilityLabel="返回页面顶部">
            <Text style={styles.actionText}>↑ 返回顶部</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* 3. 查词弹窗 Modal */}
      <WordLookupModal
        visible={isWordLookupVisible}
        word={lookupTargetWord}
        onClose={() => setIsWordLookupVisible(false)}
      />

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ 
  flex: { flex: 1 }, 
  content: { padding: 18, paddingBottom: 40, gap: 16, backgroundColor: COLORS.bg }, 
  nav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, 
  brand: { color: COLORS.text, fontSize: 23, fontWeight: "900" }, 
  kicker: { color: COLORS.muted, fontSize: 11, marginTop: 3 }, 
  wordCount: { color: COLORS.text, backgroundColor: COLORS.blueSoft, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, fontWeight: "900" }, 
  statsHeader: { flexDirection: "row", gap: 12 },
  statItem: { color: COLORS.muted, fontSize: 11, fontWeight: "700", backgroundColor: COLORS.panel, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  breadcrumb: { color: COLORS.muted, fontSize: 14, marginTop: 18 }, 
  selector: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 14, backgroundColor: COLORS.panel }, 
  sectionLabel: { color: COLORS.text, fontSize: 17, fontWeight: "900" }, 
  row: { flexDirection: "row", gap: 10 }, 
  level: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 12, marginTop: 12 }, 
  active: { backgroundColor: COLORS.blue, borderColor: "#78A1FF" }, 
  levelTitle: { color: COLORS.text, fontSize: 17, fontWeight: "900" }, 
  levelSub: { color: COLORS.muted, marginTop: 4 }, 
  sceneGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, 
  scene: { width: "31%", minHeight: 86, borderWidth: 1, borderColor: COLORS.border, borderRadius: 15, padding: 10, marginTop: 10 }, 
  sceneTitle: { color: COLORS.text, fontWeight: "900", fontSize: 14 }, 
  sceneSub: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginTop: 6 }, 
  eyebrow: { color: "#7EA5FF", fontSize: 12, fontWeight: "900", marginTop: 4 }, 
  heroTitle: { color: COLORS.text, fontSize: 32, fontWeight: "900", marginTop: 2 }, 
  heroSub: { color: COLORS.muted, fontSize: 14, lineHeight: 21 }, 
  target: { backgroundColor: "#162A57", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#426FD4" }, 
  card: { backgroundColor: COLORS.panel, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 16 }, 
  cardLabel: { color: "#A9C1FF", fontWeight: "900" }, 
  sentence: { color: COLORS.text, fontSize: 19, lineHeight: 29, fontWeight: "700", marginTop: 9 }, 
  word: { color: COLORS.text }, 
  translation: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 7 }, 
  primary: { backgroundColor: COLORS.blue, alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginTop: 12 }, 
  primaryText: { color: "#fff", fontWeight: "900" }, 
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, 
  sectionTitle: { color: COLORS.text, fontSize: 19, fontWeight: "900", marginTop: 4 }, 
  muted: { color: COLORS.muted, fontSize: 12 }, 
  line: { borderTopWidth: 1, borderTopColor: "#292C33", paddingVertical: 15 }, 
  lineTop: { flexDirection: "row", gap: 8, alignItems: "center" }, 
  speaker: { color: "#8DB0FF", fontWeight: "900" }, 
  role: { color: COLORS.muted, fontSize: 11 }, 
  actions: { flexDirection: "row", gap: 8, marginTop: 11 }, 
  action: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 7 }, 
  actionText: { color: COLORS.text, fontSize: 11, fontWeight: "800" }, 
  recording: { backgroundColor: "#8B3D4A", borderColor: "#D46B7A" }, 
  helper: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 7 }, 
  thread: { gap: 8, marginTop: 14 }, 
  aiCard: { minHeight: 430 }, 
  bubble: { padding: 12, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border }, 
  user: { backgroundColor: "#17213A" }, 
  assistant: { backgroundColor: "#191B20" }, 
  inputRow: { flexDirection: "row", gap: 8, marginTop: 14 }, 
  input: { flex: 1, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, minHeight: 44 }, 
  send: { backgroundColor: COLORS.blue, borderRadius: 10, paddingHorizontal: 14, justifyContent: "center" }, 
  recordStatus: { color: COLORS.muted, textAlign: "center" }, 
  error: { color: "#FF9CA9", fontSize: 12, marginTop: 8 }, 
  score: { backgroundColor: COLORS.statBg, padding: 14, borderRadius: 14 }, 
  scoreValue: { color: "#73E2A8", fontSize: 38, fontWeight: "900" }, 
  backTop: { alignSelf: "center", borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 }, 
  correctionCard: { backgroundColor: COLORS.correctionBg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.correctionBorder, marginTop: 10, overflow: "hidden" },
  correctionHeader: { backgroundColor: COLORS.correctionBorder, padding: 6, paddingHorizontal: 10 },
  correctionTitle: { color: "#fff", fontSize: 12, fontWeight: "900" },
  correctionBody: { padding: 10, gap: 4 },
  correctionLabel: { color: COLORS.muted, fontSize: 11 },
  correctionOriginal: { color: "#FFB15C", fontSize: 13, fontStyle: "italic" },
  correctionCorrected: { color: COLORS.success, fontSize: 14, fontWeight: "700" },
  correctionDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 6 }
});