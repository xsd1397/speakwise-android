import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Lightbulb, Volume2, Mic, Sparkles, X } from "lucide-react-native";

interface HintItem {
  en: string;
  zh: string;
}

interface ChatControlBarProps {
  lastAiMessage?: string;
  onSelectHint?: (hintText: string) => void;
  onSendVoice?: () => void;
  isLoading?: boolean;
}

export const ChatControlBar: React.FC<ChatControlBarProps> = ({
  lastAiMessage,
  onSelectHint,
  onSendVoice,
  isLoading = false,
}) => {
  const [hints, setHints] = useState<HintItem[]>([]);
  const [fetchingHints, setFetchingHints] = useState(false);
  const [showHintBox, setShowHintBox] = useState(false);

  // 点击 提示按钮：根据 AI 最新回复请求生成 2 条回复建议
  const handleFetchHints = async () => {
    if (showHintBox) {
      setShowHintBox(false);
      return;
    }

    setFetchingHints(true);
    setShowHintBox(true);

    try {
      // 模拟/联调 AI 提示建议接口（根据上下文 context 动态返回）
      const context = lastAiMessage || "Hello! How can I help you practice English today?";
      
      // 此处可替换为实际项目中的 tRPC / REST Fetch API，如：
      // const res = await fetch(${getBackendApiUrl()}/api/generate-hints, { body: JSON.stringify({ context }) });
      
      // 示例生成符合当前 AI 意思的 2 条建议（带有中英文）
      setTimeout(() => {
        setHints([
          {
            en: "That sounds interesting! Could you tell me more about it?",
            zh: "听起来很有趣！你能多跟我讲讲吗？",
          },
          {
            en: "I completely agree with you. What do you think we should do next?",
            zh: "我完全赞同你。你觉得我们接下来该怎么做？",
          },
        ]);
        setFetchingHints(false);
      }, 600);
    } catch (e) {
      console.error("获取提示失败:", e);
      setFetchingHints(false);
    }
  };

  const handlePickHint = (text: string) => {
    if (onSelectHint) {
      onSelectHint(text);
    }
    setShowHintBox(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* 提示语句回显气泡面板 */}
      {showHintBox && (
        <View style={styles.hintPanel}>
          <View style={styles.hintHeader}>
            <View style={styles.hintTitleRow}>
              <Sparkles size={16} color="#f59e0b" />
              <Text style={styles.hintTitle}>AI 智能表达提示</Text>
            </View>
            <TouchableOpacity onPress={() => setShowHintBox(false)}>
              <X size={16} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {fetchingHints ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#f59e0b" size="small" />
              <Text style={styles.loadingText}>正在根据上下文生成最佳回复...</Text>
            </View>
          ) : (
            <View style={styles.hintList}>
              {hints.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.hintCard}
                  onPress={() => handlePickHint(item.en)}
                >
                  <Text style={styles.hintEn}>{item.en}</Text>
                  <Text style={styles.hintZh}>{item.zh}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 底部控制工具栏 */}
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.btn, showHintBox && styles.btnActive]}
          onPress={handleFetchHints}
          disabled={isLoading}
        >
          <Lightbulb size={18} color={showHintBox ? "#f59e0b" : "#e4e4e7"} />
          <Text style={[styles.btnText, showHintBox && styles.btnTextActive]}>提示</Text>
        </TouchableOpacity>

        {/* 录音按键 */}
        <TouchableOpacity style={styles.micBtn} onPress={onSendVoice} disabled={isLoading}>
          <Mic size={20} color="#18181b" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  hintPanel: {
    backgroundColor: "#18181b",
    borderColor: "#27272a",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  hintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  hintTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hintTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#f59e0b",
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    color: "#a1a1aa",
    fontSize: 12,
  },
  hintList: {
    gap: 8,
  },
  hintCard: {
    backgroundColor: "#27272a",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
  },
  hintEn: {
    color: "#f4f4f5",
    fontSize: 14,
    fontWeight: "500",
  },
  hintZh: {
    color: "#a1a1aa",
    fontSize: 12,
    marginTop: 2,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#09090b",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  btnActive: {
    borderColor: "#f59e0b",
    backgroundColor: "#27272a",
  },
  btnText: {
    color: "#e4e4e7",
    fontSize: 13,
  },
  btnTextActive: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
  },
});
