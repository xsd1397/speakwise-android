import { useAudioRecorder, useAudioRecorderState, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from "expo-audio";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { evaluateRecording, getApiBaseUrl, replyToDialogue, type DialogueMessage, type EvaluationResult } from "@/lib/api";
import { getLevelLabel, LEVELS, PRACTICE_DIALOGUE, SCENES, type LevelKey, type SceneKey, type Speaker } from "@/lib/data";
import { getSpeechRate, selectVoiceForSpeaker } from "@/lib/voice";

const TARGET_SENTENCE = "Hi, I'm Alex. Nice to meet you.";

export default function PracticeScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [level, setLevel] = useState<LevelKey>("beginner");
  const [scene, setScene] = useState<SceneKey>("greetings");
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingMessage, setRecordingMessage] = useState("点击录音，练习目标句");
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [input, setInput] = useState("");
  const [dialogue, setDialogue] = useState<DialogueMessage[]>([]);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const currentVoiceLabel = useMemo(() => {
    if (voices.length === 0) return "将使用系统默认声音";
    const alex = selectVoiceForSpeaker(voices, "Alex");
    const mia = selectVoiceForSpeaker(voices, "Mia");
    return alex.voice && mia.voice ? "Alex 男声优先 · Mia 女声优先" : "未识别角色声线 · 使用系统默认声音";
  }, [voices]);

  useEffect(() => {
    let active = true;
    Speech.getAvailableVoicesAsync().then((available) => {
      if (active) setVoices(available);
    }).catch(() => {
      if (active) setVoices([]);
    });
    return () => {
      active = false;
      Speech.stop?.();
    };
  }, []);

  const speakLine = (text: string, speaker: Speaker) => {
    Speech.stop?.();
    const selection = selectVoiceForSpeaker(voices, speaker);
    Speech.speak?.(text, {
      language: "en-US",
      voice: selection.voice?.identifier,
      rate: getSpeechRate(level === "beginner" ? 0.9 : level === "advanced" ? 1.05 : 1),
      pitch: 1,
      onError: () => setReplyError("系统语音暂时不可用，请检查 Android 语音服务设置。"),
    });
  };

  const handleRecording = async () => {
    setRecordingError(null);
    setEvaluation(null);
    if (recorderState.isRecording) {
      try {
        await recorder.stop();
        const uri = recorder.uri;
        if (!uri) throw new Error("没有找到录音文件，请重新录制。");
        setRecordingUri(uri);
        setRecordingMessage("真实录音已保存，正在准备评分");
        if (!getApiBaseUrl()) {
          setRecordingMessage("真实录音已保存；配置后端地址后可提交评分");
          return;
        }
        setEvaluationLoading(true);
        const result = await evaluateRecording(uri, TARGET_SENTENCE);
        setEvaluation(result);
        setRecordingMessage("评分完成：结果已绑定本次真实录音");
      } catch (error) {
        setRecordingError(error instanceof Error ? error.message : "录音处理失败，请重试。");
        setRecordingMessage("录音未完成");
      } finally {
        setEvaluationLoading(false);
      }
      return;
    }

    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setRecordingError("需要麦克风权限才能进行真实录音练习。");
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "doNotMix", allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordingMessage("正在录音 · 再次点击停止");
    } catch (error) {
      setRecordingError(error instanceof Error ? error.message : "无法开始录音，请检查麦克风权限。");
    }
  };

  const sendReply = async () => {
    const userMessage = input.trim();
    if (!userMessage || replyLoading) return;
    const nextHistory = [...dialogue, { role: "user" as const, text: userMessage }];
    setDialogue(nextHistory);
    setInput("");
    setReplyError(null);
    if (!getApiBaseUrl()) {
      setReplyError("尚未配置后端地址，已保留你的输入；配置后才能请求真实 AI 回复。");
      return;
    }
    setReplyLoading(true);
    try {
      const response = await replyToDialogue({
        level,
        scene,
        history: dialogue,
        userMessage,
      });
      setDialogue((current) => [...current, { role: "assistant", text: response.reply }]);
      speakLine(response.reply, "Mia");
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : "AI 对话暂时不可用，请稍后重试。");
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.brand}>SpeakWise</Text>
              <Text style={styles.kicker}>英语口语与听力练习</Text>
            </View>
            <View style={styles.statusDotRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Android 首版</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>第 01 课 · 初次见面</Text>
            <Text style={styles.heroTitle}>从一句问候开始。</Text>
            <Text style={styles.heroSubtitle}>选择难度和场景，开始一段可听、可说、可复盘的英语对话。</Text>
          </View>

          <SectionTitle title="难度级别" caption={`当前：${getLevelLabel(level)}`} />
          <View style={styles.segmentRow}>
            {LEVELS.map((item) => (
              <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={`选择${item.title}`} onPress={() => setLevel(item.key)} style={[styles.segment, level === item.key && styles.segmentActive]}>
                <Text style={[styles.segmentTitle, level === item.key && styles.segmentTitleActive]}>{item.title}</Text>
                <Text style={[styles.segmentSubtitle, level === item.key && styles.segmentSubtitleActive]}>{item.subtitle}</Text>
              </Pressable>
            ))}
          </View>

          <SectionTitle title="练习场景" caption="可随时切换" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sceneRow}>
            {SCENES.map((item) => (
              <Pressable key={item.key} onPress={() => setScene(item.key)} style={[styles.sceneChip, scene === item.key && styles.sceneChipActive]}>
                <Text style={[styles.sceneTitle, scene === item.key && styles.sceneTitleActive]}>{item.title}</Text>
                <Text style={[styles.sceneSubtitle, scene === item.key && styles.sceneSubtitleActive]}>{item.subtitle}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.targetCard}>
            <Text style={styles.cardEyebrow}>本课目标句</Text>
            <Text style={styles.targetText}>“{TARGET_SENTENCE}”</Text>
            <View style={styles.cardMetaRow}>
              <Pressable onPress={() => speakLine(TARGET_SENTENCE, "Alex")} style={styles.secondaryButton} accessibilityLabel="播放目标句">
                <Text style={styles.secondaryButtonText}>▶ 播放目标句</Text>
              </Pressable>
              <Text style={styles.voiceMeta}>{currentVoiceLabel}</Text>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionEyebrow}>情景对话</Text>
              <Text style={styles.sectionTitle}>跟读与练习</Text>
            </View>
            <Text style={styles.sectionCount}>{PRACTICE_DIALOGUE.length} 句示例</Text>
          </View>
          <View style={styles.dialogueCard}>
            {PRACTICE_DIALOGUE.map((line) => (
              <View key={line.id} style={styles.dialogueLine}>
                <View style={styles.speakerBadge}>
                  <Text style={styles.speakerName}>{line.speaker}</Text>
                  <Text style={styles.speakerRole}>{line.speaker === "Alex" ? "男声优先" : "女声优先"}</Text>
                </View>
                <View style={styles.dialogueBody}>
                  <Text style={styles.dialogueText}>{line.text}</Text>
                  <Pressable onPress={() => speakLine(line.text, line.speaker)} style={styles.tinyButton} accessibilityLabel={`播放${line.speaker}句子`}>
                    <Text style={styles.tinyButtonText}>▶ 语音</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.practiceCard}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionEyebrow}>真实录音</Text>
                <Text style={styles.sectionTitle}>练习目标句</Text>
              </View>
              <Text style={styles.timer}>{recorderState.isRecording ? `${Math.round(recorderState.durationMillis / 1000)}s` : "00:00"}</Text>
            </View>
            <Text style={styles.recordHint}>{recordingMessage}</Text>
            <Pressable onPress={handleRecording} style={({ pressed }) => [styles.recordButton, recorderState.isRecording && styles.recordButtonActive, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={recorderState.isRecording ? "停止录音" : "开始真实录音"}>
              <Text style={styles.recordButtonIcon}>{recorderState.isRecording ? "■" : "●"}</Text>
              <Text style={styles.recordButtonText}>{recorderState.isRecording ? "停止并评分" : "开始真实录音"}</Text>
            </Pressable>
            {recordingUri && <Text style={styles.successText}>录音文件已保留，评分只会基于这次真实录音。</Text>}
            {recordingError && <Text style={styles.errorText}>{recordingError}</Text>}
            {evaluationLoading && <ActivityIndicator color="#1E64D6" style={styles.loader} />}
            {evaluation && <EvaluationCard result={evaluation} />}
          </View>

          <View style={styles.practiceCard}>
            <Text style={styles.sectionEyebrow}>AI 对话</Text>
            <Text style={styles.sectionTitle}>用英语继续交流</Text>
            <Text style={styles.helperText}>AI 回复显示整句文字，并同时播放整句语音；不会显示逐词高亮。</Text>
            <View style={styles.aiThread}>
              {dialogue.length === 0 ? <Text style={styles.emptyText}>输入一句英文，开始真实 AI 对话。</Text> : dialogue.map((message, index) => (
                <View key={`${message.role}-${index}`} style={[styles.messageBubble, message.role === "user" ? styles.userBubble : styles.aiBubble]}>
                  <Text style={styles.messageRole}>{message.role === "user" ? "你" : "Mia · AI"}</Text>
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              ))}
            </View>
            <View style={styles.inputRow}>
              <TextInput value={input} onChangeText={setInput} onSubmitEditing={sendReply} returnKeyType="done" placeholder="输入英文回复，例如：I enjoy learning English." placeholderTextColor="#94A0B4" style={styles.input} editable={!replyLoading} accessibilityLabel="输入 AI 对话回复" />
              <Pressable onPress={sendReply} style={[styles.sendButton, replyLoading && styles.disabledButton]} disabled={replyLoading} accessibilityLabel="发送 AI 对话回复">
                {replyLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.sendText}>发送</Text>}
              </Pressable>
            </View>
            {replyError && <Text style={styles.errorText}>{replyError}</Text>}
          </View>

          <Pressable onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} style={styles.backTopButton} accessibilityRole="button" accessibilityLabel="返回页面顶部">
            <Text style={styles.backTopText}>↑ 返回顶部</Text>
          </Pressable>
          <Text style={styles.footerNote}>SpeakWise Android 首版 · 真实录音优先 · 数据不可用时明确提示</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function SectionTitle({ title, caption }: { title: string; caption: string }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <Text style={styles.sectionCaption}>{caption}</Text>
    </View>
  );
}

function EvaluationCard({ result }: { result: EvaluationResult }) {
  return (
    <View style={styles.evaluationCard}>
      <View style={styles.scoreRow}>
        <View><Text style={styles.scoreValue}>{result.overallScore}</Text><Text style={styles.scoreLabel}>严格总分</Text></View>
        <View style={styles.scoreMetric}><Text style={styles.metricValue}>{result.transcriptAccuracy}%</Text><Text style={styles.metricLabel}>录音匹配率</Text></View>
        <View style={styles.scoreMetric}><Text style={styles.metricValue}>{Math.round(result.wordErrorRate * 100)}%</Text><Text style={styles.metricLabel}>词错率</Text></View>
      </View>
      <Text style={styles.transcriptLabel}>本次录音转写</Text>
      <Text style={styles.transcriptText}>{result.transcript}</Text>
      <Text style={styles.summaryText}>{result.summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 36, gap: 18 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { color: "#16233B", fontSize: 23, fontWeight: "800", letterSpacing: -0.5 },
  kicker: { color: "#708099", fontSize: 12, marginTop: 3 },
  statusDotRow: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#25B477" },
  statusText: { color: "#637189", fontSize: 11, fontWeight: "700" },
  hero: { paddingTop: 8 },
  eyebrow: { color: "#2A73D9", fontSize: 12, fontWeight: "800", letterSpacing: 0.6 },
  heroTitle: { color: "#14233D", fontSize: 37, fontWeight: "900", letterSpacing: -1.2, marginTop: 8 },
  heroSubtitle: { color: "#748097", fontSize: 14, lineHeight: 21, marginTop: 8 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionLabel: { color: "#263650", fontSize: 14, fontWeight: "800" },
  sectionCaption: { color: "#8A96A8", fontSize: 11 },
  segmentRow: { flexDirection: "row", gap: 10 },
  segment: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E5EBF4", padding: 13 },
  segmentActive: { backgroundColor: "#246BDD", borderColor: "#246BDD" },
  segmentTitle: { color: "#31405A", fontSize: 14, fontWeight: "800" },
  segmentTitleActive: { color: "#FFFFFF" },
  segmentSubtitle: { color: "#8A96A8", fontSize: 10, marginTop: 3 },
  segmentSubtitleActive: { color: "#DCEAFF" },
  sceneRow: { gap: 10, paddingRight: 20 },
  sceneChip: { width: 142, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E5EBF4", padding: 13 },
  sceneChipActive: { backgroundColor: "#EEF5FF", borderColor: "#8DB5F0" },
  sceneTitle: { color: "#31405A", fontSize: 13, fontWeight: "800" },
  sceneTitleActive: { color: "#1E64D6" },
  sceneSubtitle: { color: "#8995A7", fontSize: 10, marginTop: 4 },
  sceneSubtitleActive: { color: "#5F83B9" },
  targetCard: { backgroundColor: "#EAF4FF", borderRadius: 18, borderWidth: 1, borderColor: "#CDE4FC", padding: 18 },
  cardEyebrow: { color: "#2A73D9", fontSize: 12, fontWeight: "800" },
  targetText: { color: "#173E83", fontSize: 25, lineHeight: 34, fontWeight: "800", marginTop: 9 },
  cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  secondaryButton: { borderRadius: 10, borderWidth: 1, borderColor: "#8BB8F4", backgroundColor: "#FFFFFF", paddingHorizontal: 12, paddingVertical: 9 },
  secondaryButtonText: { color: "#1E64D6", fontSize: 12, fontWeight: "800" },
  voiceMeta: { color: "#7085A1", fontSize: 10, flex: 1 },
  sectionEyebrow: { color: "#2A73D9", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  sectionTitle: { color: "#20304A", fontSize: 20, fontWeight: "800", marginTop: 3 },
  sectionCount: { color: "#8B97A8", fontSize: 11 },
  dialogueCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E6EBF3", paddingHorizontal: 14 },
  dialogueLine: { flexDirection: "row", gap: 12, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  speakerBadge: { width: 54 },
  speakerName: { color: "#1E64D6", fontSize: 12, fontWeight: "900" },
  speakerRole: { color: "#9AA5B5", fontSize: 9, marginTop: 3 },
  dialogueBody: { flex: 1 },
  dialogueText: { color: "#2C3D59", fontSize: 14, lineHeight: 21 },
  tinyButton: { alignSelf: "flex-start", marginTop: 8, borderRadius: 8, backgroundColor: "#F3F7FC", paddingHorizontal: 9, paddingVertical: 6 },
  tinyButtonText: { color: "#4C6D99", fontSize: 10, fontWeight: "800" },
  practiceCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E3E9F2", padding: 16 },
  timer: { color: "#62718A", fontSize: 12, fontVariant: ["tabular-nums"] },
  recordHint: { color: "#7F8CA0", fontSize: 12, marginTop: 12 },
  recordButton: { marginTop: 12, minHeight: 54, borderRadius: 14, backgroundColor: "#1E64D6", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 9 },
  recordButtonActive: { backgroundColor: "#C74455" },
  recordButtonIcon: { color: "#FFFFFF", fontSize: 17 },
  recordButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  successText: { color: "#2D8A61", fontSize: 11, marginTop: 10 },
  errorText: { color: "#B33A4C", fontSize: 11, lineHeight: 17, marginTop: 10 },
  loader: { marginTop: 12 },
  evaluationCard: { backgroundColor: "#F5FAFF", borderRadius: 14, padding: 13, marginTop: 13, borderWidth: 1, borderColor: "#D8EAFE" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 18 },
  scoreValue: { color: "#1E64D6", fontSize: 29, fontWeight: "900" },
  scoreLabel: { color: "#6D7D94", fontSize: 10 },
  scoreMetric: { borderLeftWidth: 1, borderLeftColor: "#DCE7F5", paddingLeft: 14 },
  metricValue: { color: "#2A476E", fontSize: 17, fontWeight: "800" },
  metricLabel: { color: "#77859A", fontSize: 10, marginTop: 2 },
  transcriptLabel: { color: "#587395", fontSize: 10, fontWeight: "800", marginTop: 14 },
  transcriptText: { color: "#263A58", fontSize: 13, lineHeight: 19, marginTop: 4 },
  summaryText: { color: "#667791", fontSize: 11, lineHeight: 17, marginTop: 8 },
  helperText: { color: "#8190A4", fontSize: 11, lineHeight: 17, marginTop: 6 },
  aiThread: { minHeight: 92, marginTop: 12, backgroundColor: "#F7F9FC", borderRadius: 12, padding: 10, gap: 8 },
  emptyText: { color: "#9AA5B5", fontSize: 12, paddingVertical: 18, textAlign: "center" },
  messageBubble: { maxWidth: "88%", borderRadius: 12, padding: 10 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#E6F1FF" },
  aiBubble: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E1E8F1" },
  messageRole: { color: "#7590B4", fontSize: 10, fontWeight: "800" },
  messageText: { color: "#2B3D5A", fontSize: 13, lineHeight: 19, marginTop: 3 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  input: { flex: 1, minHeight: 46, borderRadius: 11, borderWidth: 1, borderColor: "#DCE4EE", backgroundColor: "#FFFFFF", paddingHorizontal: 12, color: "#273A57", fontSize: 12 },
  sendButton: { minHeight: 46, paddingHorizontal: 16, borderRadius: 11, backgroundColor: "#1E64D6", alignItems: "center", justifyContent: "center" },
  disabledButton: { opacity: 0.55 },
  sendText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  backTopButton: { alignSelf: "center", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DDE5F0" },
  backTopText: { color: "#50719D", fontSize: 12, fontWeight: "800" },
  footerNote: { color: "#A2ADBA", textAlign: "center", fontSize: 10, lineHeight: 16, paddingHorizontal: 20 },
});
