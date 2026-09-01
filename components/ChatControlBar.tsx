import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { processPreflightCheck, PreflightResult } from '../lib/api';

interface Props {
  userInputText: string;
  onSend: (finalText: string) => void;
  onToggleSuggestions: () => void;
}

export const ChatControlBar: React.FC<Props> = ({ userInputText, onSend, onToggleSuggestions }) => {
  const [loading, setLoading] = useState(false);
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);

  // 点击“纠错”按钮触发预检逻辑
  const handleCorrectionPress = async () => {
    if (!userInputText.trim()) return;
    setLoading(true);

    const result = await processPreflightCheck(userInputText);
    setPreflight(result);
    setLoading(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* 预检草稿/纠错弹出的确认卡片 */}
      {preflight && (
        <View style={styles.preflightCard}>
          {preflight.isEnglish ? (
            // 英文逻辑：纠错流
            <View>
              <Text style={styles.cardTitle}>
                {preflight.hasError ? '⚠️ 口语纠错建议' : '✓ 语句表达标准'}
              </Text>
              {preflight.hasError ? (
                <>
                  <Text style={styles.oldText}>原句：{preflight.originalText}</Text>
                  <Text style={styles.newText}>修正：{preflight.correctedText}</Text>
                  <Text style={styles.explanation}>说明：{preflight.explanation}</Text>
                </>
              ) : (
                <Text style={styles.newText}>未发现语法或拼写错误，可直接发送。</Text>
              )}
            </View>
          ) : (
            // 中文逻辑：原有的翻译草稿流
            <View>
              <Text style={styles.cardTitle}>🌐 翻译为英文草稿</Text>
              <Text style={styles.oldText}>原文：{preflight.originalText}</Text>
              <Text style={styles.newText}>译文：{preflight.translatedText}</Text>
            </View>
          )}

          {/* 卡片底部确认操作 */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setPreflight(null)}>
              <Text style={styles.cancelBtnText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={() => {
                const textToSend = preflight.isEnglish
                  ? (preflight.correctedText || preflight.originalText)
                  : (preflight.translatedText || preflight.originalText);
                setPreflight(null);
                onSend(textToSend);
              }}
            >
              <Text style={styles.sendBtnText}>确认发送</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 底部按钮栏 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.toolBtn} onPress={onToggleSuggestions}>
          <Text style={styles.toolBtnText}>💡 回复提示</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.toolBtn, styles.correctionBtn]} 
          onPress={handleCorrectionPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#4F46E5" />
          ) : (
            <Text style={styles.correctionBtnText}>✏️ 纠错</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingBottom: 10 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  toolBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  toolBtnText: { fontSize: 13, color: '#4338CA', fontWeight: '600' },
  correctionBtn: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  correctionBtnText: { fontSize: 13, color: '#DC2626', fontWeight: '600' },
  preflightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  oldText: { fontSize: 12, color: '#64748B', textDecorationLine: 'line-through' },
  newText: { fontSize: 13, color: '#16A34A', fontWeight: '600', marginTop: 2 },
  explanation: { fontSize: 12, color: '#475569', marginTop: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  cancelBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#F1F5F9' },
  cancelBtnText: { fontSize: 12, color: '#475569' },
  sendBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#4F46E5' },
  sendBtnText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
});