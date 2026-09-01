import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import * as Speech from 'expo-speech';

interface WordDetail {
  word: string;
  phonetic?: string;
  translation?: string;
}

interface WordModalProps {
  visible: boolean;
  word: string | null;
  onClose: () => void;
  onToggleBookmark?: (word: string, isBookmarked: boolean) => void;
  initialIsBookmarked?: boolean;
}

export const WordDetailModal: React.FC<WordModalProps> = ({
  visible,
  word,
  onClose,
  onToggleBookmark,
  initialIsBookmarked = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WordDetail | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const resetAutoCloseTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleClose();
    }, 10000); // 10秒自动隐藏
  };

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const playTTS = (text: string) => {
    Speech.speak(text, { language: 'en-US' });
    resetAutoCloseTimer();
  };

  const toggleBookmark = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    if (word && onToggleBookmark) {
      onToggleBookmark(word, nextState);
    }
    resetAutoCloseTimer();
  };

  useEffect(() => {
    if (visible && word) {
      setIsBookmarked(initialIsBookmarked);
      setLoading(true);
      
      // 秒开渲染基本界面
      setData({ word, phonetic: `/${word}/`, translation: '正在查询...' });

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();

      resetAutoCloseTimer();

      // 点击即播放发音
      Speech.speak(word, { language: 'en-US' });

      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://speakwise-wsicpu2u.manus.space';
      fetch(`${baseUrl}/api/dictionary/lookup?word=${encodeURIComponent(word)}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((resData) => {
          const parsedTranslation = 
            resData.translation || 
            resData.definition || 
            (Array.isArray(resData.meanings) ? resData.meanings.join('; ') : null) ||
            resData.explain || 
            '暂无释义';

          setData({
            word: resData.word || word,
            phonetic: resData.phonetic || `/${word}/`,
            translation: parsedTranslation,
          });
        })
        .catch(() => {
          setData({
            word,
            phonetic: `/${word}/`,
            translation: '暂无中文释义',
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, word]);

  if (!visible || !word) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <Animated.View style={[styles.darkCard, { opacity: fadeAnim }]}>
          {/* 顶部：收藏与关闭 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleBookmark} style={styles.iconBtn}>
              <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkedActive]}>
                {isBookmarked ? "" : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={styles.iconBtn}>
              <Text style={styles.closeIcon}></Text>
            </TouchableOpacity>
          </View>

          {/* 详情区域 */}
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.wordText}>{data?.word}</Text>
              <TouchableOpacity onPress={() => data?.word && playTTS(data.word)}>
                <Text style={styles.audioIcon}></Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.phoneticText}>{data?.phonetic}</Text>

            {loading ? (
              <ActivityIndicator size="small" color="#0A84FF" style={{ marginVertical: 12 }} />
            ) : (
              <Text style={styles.translationText}>{data?.translation}</Text>
            )}
          </View>

          {/* 底部倒计时 */}
          <View style={styles.footer}>
            <Text style={styles.autoHideHint}>无操作 10 秒后自动关闭</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  darkCard: {
    width: '88%',
    maxWidth: 360,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconBtn: { padding: 4 },
  bookmarkIcon: { fontSize: 18, color: '#8E8E93' },
  bookmarkedActive: { color: '#FFD700' },
  closeIcon: { fontSize: 16, color: '#8E8E93' },
  content: { marginVertical: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  wordText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginRight: 8 },
  audioIcon: { fontSize: 18, marginLeft: 4 },
  phoneticText: { fontSize: 14, color: '#0A84FF', marginTop: 4 },
  translationText: { fontSize: 16, color: '#E5E5EA', marginTop: 12, lineHeight: 22 },
  footer: { marginTop: 14, borderTopWidth: 1, borderTopColor: '#2C2C2E', paddingTop: 8, alignItems: 'center' },
  autoHideHint: { fontSize: 11, color: '#636366' },
});
