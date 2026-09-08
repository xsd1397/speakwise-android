import * as Speech from "expo-speech";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { WordDefinition } from "@/lib/word";

type WordLookupModalProps = {
  visible: boolean;
  word: string | null;
  definition: WordDefinition | null;
  example: string;
  isSaved?: boolean;
  onSave?: () => void;
  onClose: () => void;
};

export function WordLookupModal({
  visible,
  word,
  definition,
  example,
  isSaved = false,
  onSave,
  onClose,
}: WordLookupModalProps) {
  if (!word) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <View style={styles.titleRow}>
            <Text style={styles.word}>{word}</Text>
            <Pressable
              style={styles.speak}
              onPress={() => {
                Speech.stop();
                Speech.speak(word, { language: "en-US" });
              }}
              accessibilityLabel={`朗读${word}`}
            >
              <Text style={styles.speakText}>🔊</Text>
            </Pressable>
          </View>
          <Text style={styles.phonetic}>{definition?.phonetic || "正在补充音标…"}</Text>
          <Text style={styles.label}>中文意思</Text>
          <Text style={styles.meaning}>{definition?.meaning || "正在查询中文释义…"}</Text>
          <Text style={styles.label}>例句</Text>
          <Text style={styles.example}>{example || "暂无例句"}</Text>
          <View style={styles.actions}>
            {onSave && (
              <Pressable style={styles.primaryButton} onPress={onSave}>
                <Text style={styles.buttonText}>{isSaved ? "已收藏" : "加入生词本"}</Text>
              </Pressable>
            )}
            <Pressable style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryText}>关闭</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,.78)", justifyContent: "flex-end" },
  card: { backgroundColor: "#151820", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  word: { color: "#F2F3F5", fontSize: 30, fontWeight: "900" },
  speak: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#162A57", alignItems: "center", justifyContent: "center" },
  speakText: { fontSize: 19 },
  phonetic: { color: "#8DB0FF", fontSize: 17, minHeight: 24 },
  label: { color: "#9DB9FF", fontSize: 12, fontWeight: "800", marginTop: 9 },
  meaning: { color: "#F2F3F5", fontSize: 17, lineHeight: 24 },
  example: { color: "#D5D9E2", fontSize: 15, lineHeight: 23 },
  actions: { flexDirection: "row", gap: 10, marginTop: 15 },
  primaryButton: { flex: 1, backgroundColor: "#2F6BEB", borderRadius: 11, padding: 12, alignItems: "center" },
  secondaryButton: { flex: 1, borderWidth: 1, borderColor: "#3A3D45", borderRadius: 11, padding: 12, alignItems: "center" },
  buttonText: { color: "#F2F3F5", fontWeight: "800" },
  secondaryText: { color: "#9AA2B4", fontWeight: "800" },
});
