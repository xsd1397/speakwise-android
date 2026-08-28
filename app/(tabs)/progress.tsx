import { useRef } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";

const progressCards = [
  { label: "已完成对话", value: "—", hint: "完成真实练习后显示" },
  { label: "平均准确率", value: "—", hint: "完成录音评分后显示" },
  { label: "生词本", value: "—", hint: "收藏单词后显示" },
];

export default function ProgressScreen() {
  const listRef = useRef<FlatList>(null);
  return (
    <ScreenContainer>
      <FlatList
        ref={listRef}
        data={[]}
        renderItem={null}
        contentContainerStyle={styles.content}
        ListHeaderComponent={(
          <View>
            <View style={styles.headerRow}>
              <View><Text style={styles.brand}>SpeakWise</Text><Text style={styles.kicker}>我的学习进度</Text></View>
              <View style={styles.avatar}><Text style={styles.avatarText}>S</Text></View>
            </View>
            <Text style={styles.title}>稳步进步，持续开口。</Text>
            <Text style={styles.subtitle}>这里会记录你的真实练习结果，不用模拟数字填充。</Text>
            <View style={styles.cardGrid}>
              {progressCards.map((card) => <View key={card.label} style={styles.progressCard}><Text style={styles.progressValue}>{card.value}</Text><Text style={styles.progressLabel}>{card.label}</Text><Text style={styles.progressHint}>{card.hint}</Text></View>)}
            </View>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>◌</Text>
              <Text style={styles.emptyTitle}>完成一次真实练习后，这里会出现你的进度</Text>
              <Text style={styles.emptyText}>SpeakWise 不会预填或伪造评分、学习时长和用户数据。</Text>
            </View>
            <Pressable onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} style={styles.backTop} accessibilityRole="button" accessibilityLabel="返回页面顶部"><Text style={styles.backTopText}>↑ 返回顶部</Text></Pressable>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 30 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { color: "#16233B", fontSize: 23, fontWeight: "800" },
  kicker: { color: "#718098", fontSize: 12, marginTop: 3 },
  avatar: { width: 38, height: 38, borderRadius: 20, backgroundColor: "#EAF4FF", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#1E64D6", fontSize: 16, fontWeight: "900" },
  title: { color: "#162640", fontSize: 32, lineHeight: 39, fontWeight: "900", marginTop: 28, letterSpacing: -0.8 },
  subtitle: { color: "#78869B", fontSize: 14, lineHeight: 21, marginTop: 8 },
  cardGrid: { flexDirection: "row", gap: 8, marginTop: 20 },
  progressCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E4EAF2", padding: 11, minHeight: 112 },
  progressValue: { color: "#1E64D6", fontSize: 24, fontWeight: "900" },
  progressLabel: { color: "#3E506A", fontSize: 11, fontWeight: "800", marginTop: 7 },
  progressHint: { color: "#9AA5B5", fontSize: 9, lineHeight: 13, marginTop: 5 },
  emptyCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E4EAF2", padding: 25, marginTop: 15 },
  emptyIcon: { color: "#7DA9E9", fontSize: 37 },
  emptyTitle: { color: "#3C4F6B", textAlign: "center", fontSize: 14, lineHeight: 21, fontWeight: "800", marginTop: 10 },
  emptyText: { color: "#8A96A8", textAlign: "center", fontSize: 11, lineHeight: 18, marginTop: 8 },
  backTop: { alignSelf: "center", marginTop: 22, borderRadius: 20, borderWidth: 1, borderColor: "#DCE5F0", backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 10 },
  backTopText: { color: "#50719D", fontSize: 12, fontWeight: "800" },
});
