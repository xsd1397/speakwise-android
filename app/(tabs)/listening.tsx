import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { LISTENING_LINES, type ListeningLine } from "@/lib/data";
import { getSpeechRate, selectVoiceForSpeaker } from "@/lib/voice";

const SPEEDS = [0.75, 1, 1.25] as const;

type Speed = (typeof SPEEDS)[number];

export default function ListeningScreen() {
  const listRef = useRef<FlatList<ListeningLine>>(null);
  const [speed, setSpeed] = useState<Speed>(1);
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notice, setNotice] = useState("正在加载系统英语声线；未匹配时会使用默认声音。 ");
  const [playingAll, setPlayingAll] = useState(false);

  useEffect(() => {
    let active = true;
    Speech.getAvailableVoicesAsync().then((available) => {
      if (!active) return;
      setVoices(available);
      setNotice(available.length > 0 ? "Alex 男声优先 · Mia 女声优先 · 不可用时使用默认声音" : "暂未读取到系统声线，将使用默认英语声音播放");
    }).catch(() => {
      if (active) setNotice("无法读取系统声线，将使用默认英语声音播放");
    });
    return () => {
      active = false;
      Speech.stop?.();
    };
  }, []);

  const speakLine = (line: ListeningLine, onDone?: () => void) => {
    Speech.stop?.();
    const selection = selectVoiceForSpeaker(voices, line.speaker);
    setActiveId(line.id);
    Speech.speak?.(line.text, {
      language: "en-US",
      voice: selection.voice?.identifier,
      rate: getSpeechRate(speed),
      onDone: () => {
        setActiveId(null);
        onDone?.();
      },
      onStopped: () => setActiveId(null),
      onError: () => {
        setActiveId(null);
        setNotice("系统语音播放失败，已回退到默认声音，请检查 Android 语音服务。");
      },
    });
  };

  const playAll = (index = 0) => {
    if (index >= LISTENING_LINES.length) {
      setPlayingAll(false);
      setActiveId(null);
      return;
    }
    setPlayingAll(true);
    listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.35 });
    speakLine(LISTENING_LINES[index], () => playAll(index + 1));
  };

  const stopAll = () => {
    Speech.stop?.();
    setPlayingAll(false);
    setActiveId(null);
  };

  return (
    <ScreenContainer>
      <FlatList
        ref={listRef}
        data={LISTENING_LINES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={() => undefined}
        ListHeaderComponent={(
          <View>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.brand}>SpeakWise</Text>
                <Text style={styles.kicker}>听力训练 · 日常问候</Text>
              </View>
              <View style={styles.countPill}><Text style={styles.countText}>40 句</Text></View>
            </View>
            <Text style={styles.title}>听懂，再开口。</Text>
            <Text style={styles.subtitle}>跟随 Alex 和 Mia 的完整会话，按你的节奏反复听练。</Text>
            <View style={styles.speedCard}>
              <View style={styles.speedTitleRow}>
                <Text style={styles.cardTitle}>播放速度</Text>
                <Text style={styles.currentSpeed}>{speed}×</Text>
              </View>
              <View style={styles.speedRow}>
                {SPEEDS.map((item) => (
                  <Pressable key={item} onPress={() => setSpeed(item)} style={[styles.speedButton, speed === item && styles.speedButtonActive]} accessibilityRole="button" accessibilityLabel={`选择${item}倍速`}>
                    <Text style={[styles.speedText, speed === item && styles.speedTextActive]}>{item}×</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.voiceNotice}><Text style={styles.voiceNoticeDot}>●</Text><Text style={styles.voiceNoticeText}>{notice}</Text></View>
              <Pressable onPress={playingAll ? stopAll : () => playAll()} style={[styles.playAllButton, playingAll && styles.stopButton]} accessibilityRole="button" accessibilityLabel={playingAll ? "停止播放全部" : "播放全部40句"}>
                {playingAll ? <Text style={styles.playAllText}>■ 停止播放</Text> : <Text style={styles.playAllText}>▶ 一键播放 40 句</Text>}
              </Pressable>
            </View>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>逐句练习</Text><Text style={styles.sectionCaption}>点击任意句子播放</Text></View>
          </View>
        )}
        renderItem={({ item, index }) => (
          <View style={[styles.lineCard, activeId === item.id && styles.lineCardActive]}>
            <View style={styles.lineTopRow}>
              <View style={styles.indexBadge}><Text style={styles.indexText}>{String(index + 1).padStart(2, "0")}</Text></View>
              <View style={styles.speakerInfo}><Text style={styles.speakerName}>{item.speaker}</Text><Text style={styles.speakerHint}>{item.speaker === "Alex" ? "男声优先" : "女声优先"}</Text></View>
              {activeId === item.id && <ActivityIndicator color="#1E64D6" size="small" />}
              <Pressable onPress={() => speakLine(item)} style={styles.linePlayButton} accessibilityRole="button" accessibilityLabel={`播放第${index + 1}句`}><Text style={styles.linePlayText}>{activeId === item.id ? "播放中" : "语音"}</Text></Pressable>
            </View>
            <Text style={styles.lineText}>{item.text}</Text>
            <Text style={styles.translation}>{item.translation}</Text>
            <Text style={styles.note}>学习提示：{item.note}</Text>
          </View>
        )}
        ListFooterComponent={(
          <Pressable onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} style={styles.backTop} accessibilityRole="button" accessibilityLabel="返回页面顶部">
            <Text style={styles.backTopText}>↑ 返回顶部</Text>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 34, gap: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { color: "#16233B", fontSize: 23, fontWeight: "800" },
  kicker: { color: "#718098", fontSize: 12, marginTop: 3 },
  countPill: { backgroundColor: "#EAF4FF", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  countText: { color: "#1E64D6", fontSize: 12, fontWeight: "800" },
  title: { color: "#162640", fontSize: 34, fontWeight: "900", marginTop: 22, letterSpacing: -1 },
  subtitle: { color: "#78869B", fontSize: 14, lineHeight: 21, marginTop: 7 },
  speedCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E4EAF2", padding: 15, marginTop: 18 },
  speedTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: "#263750", fontSize: 14, fontWeight: "800" },
  currentSpeed: { color: "#1E64D6", fontSize: 14, fontWeight: "900" },
  speedRow: { flexDirection: "row", gap: 8, marginTop: 11 },
  speedButton: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: "#DDE5F0", alignItems: "center", paddingVertical: 10, backgroundColor: "#FAFBFD" },
  speedButtonActive: { borderColor: "#1E64D6", backgroundColor: "#EAF3FF" },
  speedText: { color: "#718097", fontSize: 13, fontWeight: "800" },
  speedTextActive: { color: "#1E64D6" },
  voiceNotice: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 12 },
  voiceNoticeDot: { color: "#25B477", fontSize: 10 },
  voiceNoticeText: { color: "#76859A", fontSize: 10, flex: 1, lineHeight: 15 },
  playAllButton: { minHeight: 46, borderRadius: 12, backgroundColor: "#1E64D6", alignItems: "center", justifyContent: "center", marginTop: 13 },
  stopButton: { backgroundColor: "#BE4C5D" },
  playAllText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  sectionTitle: { color: "#263750", fontSize: 18, fontWeight: "800" },
  sectionCaption: { color: "#8B98AA", fontSize: 11 },
  lineCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E4EAF2", padding: 14 },
  lineCardActive: { borderColor: "#8CB8F3", backgroundColor: "#F7FBFF" },
  lineTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  indexBadge: { width: 34, height: 28, borderRadius: 8, backgroundColor: "#F0F4F9", alignItems: "center", justifyContent: "center" },
  indexText: { color: "#64758E", fontSize: 10, fontWeight: "900" },
  speakerInfo: { flex: 1 },
  speakerName: { color: "#1E64D6", fontSize: 12, fontWeight: "900" },
  speakerHint: { color: "#9AA5B5", fontSize: 9, marginTop: 2 },
  linePlayButton: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 7, backgroundColor: "#EEF5FF" },
  linePlayText: { color: "#1E64D6", fontSize: 10, fontWeight: "800" },
  lineText: { color: "#2A3C59", fontSize: 14, lineHeight: 21, marginTop: 12 },
  translation: { color: "#7D8BA0", fontSize: 12, lineHeight: 18, marginTop: 7 },
  note: { color: "#9B7B45", backgroundColor: "#FFF8E9", borderRadius: 8, padding: 8, fontSize: 10, lineHeight: 15, marginTop: 10 },
  backTop: { alignSelf: "center", marginTop: 16, borderRadius: 20, borderWidth: 1, borderColor: "#DCE5F0", backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 10 },
  backTopText: { color: "#50719D", fontSize: 12, fontWeight: "800" },
});
