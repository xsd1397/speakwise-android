import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Speech from 'expo-speech';

export interface WordDetail {
  word: string;
  phonetic: string;
  translation: string;
}

interface WordLookupModalProps {
  visible: boolean;
  word: string; // 传进来的要查询的单词
  onClose: () => void;
}

export const WordLookupModal: React.FC<WordLookupModalProps> = ({
  visible,
  word,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [wordDetail, setWordDetail] = useState<WordDetail | null>(null);

  // 清除标点符号
  const cleanWord = word ? word.replace(/[^\w]/g, '').trim() : '';

  useEffect(() => {
    if (visible && cleanWord) {
      // 1. 打开弹窗时，触发实时发音
      playPronunciation(cleanWord);
      // 2. 异步查询音标与中文翻译
      fetchWordDefinition(cleanWord);
    }
  }, [visible, word]);

  // 调用语音合成 (TTS) 发音
  const playPronunciation = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'en-US',
      rate: 0.9,
    });
  };

  // 查询单词音标及释义 (对接免费词典 API，也可替换为你网页端的对应接口)
  const fetchWordDefinition = async (targetWord: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${targetWord}`
      );
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const entry = data[0];
        // 匹配音标
        const phonetic =
          entry.phonetics?.find((p: any) => p.text)?.text || entry.phonetic || '';
        
        // 获取释义 (如果没有中文翻译接口，此处展示简要英文释义或预留中文翻译位)
        const definition =
          entry.meanings?.[0]?.definitions?.[0]?.definition || '暂无详细释义';

        setWordDetail({
          word: targetWord,
          phonetic: phonetic ? `[${phonetic}]` : '',
          translation: definition,
        });
      } else {
        setWordDetail({
          word: targetWord,
          phonetic: '',
          translation: '未找到该单词的释义',
        });
      }
    } catch (error) {
      console.error('Word lookup error:', error);
      setWordDetail({
        word: targetWord,
        phonetic: '',
        translation: '查询失败，请检查网络连接',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 点击背景遮罩关闭弹窗 */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View style={styles.modalCard}>
            {/* 头部：单词 + 音标 + 发音按钮 */}
            <View style={styles.headerRow}>
              <View style={styles.wordGroup}>
                <Text style={styles.wordText}>{cleanWord}</Text>
                {wordDetail?.phonetic ? (
                  <Text style={styles.phoneticText}>{wordDetail.phonetic}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.speakerBtn}
                onPress={() => playPronunciation(cleanWord)}
              >
                <Text style={styles.speakerIcon}>🔊</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* 内容区：显示加载中或翻译结果 */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={styles.loadingText}>正在查询释义...</Text>
              </View>
            ) : (
              <View style={styles.body}>
                <Text style={styles.translationText}>
                  {wordDetail?.translation}
                </Text>
              </View>
            )}

            {/* 底部关闭按钮 */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  wordText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  phoneticText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Platform',
  },
  speakerBtn: {
    padding: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
  speakerIcon: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  loadingContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  body: {
    paddingVertical: 4,
  },
  translationText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  closeBtn: {
    marginTop: 14,
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeBtnText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});