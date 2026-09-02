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
<<<<<<< HEAD
=======
import { Ionicons } from '@expo/vector-icons';
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
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
<<<<<<< HEAD
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

=======
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 10秒无操作自动隐藏倒计时
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
  const resetAutoCloseTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleClose();
<<<<<<< HEAD
    }, 10000); // 10秒自动隐藏
=======
    }, 10000);
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
  };

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(fadeAnim, {
      toValue: 0,
<<<<<<< HEAD
      duration: 150,
=======
      duration: 200,
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const playTTS = (text: string) => {
    Speech.speak(text, { language: 'en-US' });
<<<<<<< HEAD
    resetAutoCloseTimer();
=======
    resetAutoCloseTimer(); // 点击朗读重置10秒倒计时
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
  };

  const toggleBookmark = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    if (word && onToggleBookmark) {
      onToggleBookmark(word, nextState);
    }
<<<<<<< HEAD
    resetAutoCloseTimer();
=======
    resetAutoCloseTimer(); // 点击收藏重置10秒倒计时
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
  };

  useEffect(() => {
    if (visible && word) {
      setIsBookmarked(initialIsBookmarked);
      setLoading(true);
<<<<<<< HEAD
      
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
=======
      setData({ word, phonetic: '/ Loading... /', translation: '加载中...' });

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // 开启 10 秒倒计时
      resetAutoCloseTimer();

      // 请求后端词典接口
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://your-backend-api.com';
      fetch(`${baseUrl}/api/dictionary/lookup?word=${encodeURIComponent(word)}`)
        .then((res) => res.json())
        .then((resData) => {
          setData({
            word: resData.word || word,
            phonetic: resData.phonetic || `/${word}/`,
            translation: resData.translation || '暂无翻译',
          });
        })
        .catch(() => {
          // 接口异常时的降级方案
          setData({
            word,
            phonetic: `/${word}/`,
            translation: '翻译获取失败',
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
          });
        })
        .finally(() => {
          setLoading(false);
<<<<<<< HEAD
=======
          // 弹窗打开后自动朗读发音
          Speech.speak(word, { language: 'en-US' });
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
        });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, word]);

  if (!visible || !word) return null;

  return (
<<<<<<< HEAD
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
=======
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <Animated.View style={[styles.darkCard, { opacity: fadeAnim }]}>
          {/* 顶部操作条：收藏与关闭 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleBookmark} style={styles.iconBtn}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isBookmarked ? '#FFD700' : '#AAA'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={styles.iconBtn}>
              <Ionicons name="close" size={22} color="#AAA" />
            </TouchableOpacity>
          </View>

          {/* 核心深色卡片内容 */}
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.wordText}>{data?.word}</Text>
              <TouchableOpacity onPress={() => data?.word && playTTS(data.word)}>
<<<<<<< HEAD
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
=======
                <Ionicons name="volume-high" size={24} color="#0A84FF" style={styles.audioIcon} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color="#0A84FF" style={{ marginVertical: 10 }} />
            ) : (
              <>
                <Text style={styles.phoneticText}>{data?.phonetic}</Text>
                <Text style={styles.translationText}>{data?.translation}</Text>
              </>
            )}
          </View>

          {/* 底部提示 */}
          <View style={styles.footer}>
            <Text style={styles.autoHideHint}>弹窗将在 10 秒无操作后自动隐藏</Text>
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
=======
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
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
<<<<<<< HEAD
    elevation: 10,
=======
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
<<<<<<< HEAD
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
=======
    marginBottom: 8,
  },
  iconBtn: {
    padding: 4,
  },
  content: {
    marginVertical: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 10,
  },
  audioIcon: {
    marginLeft: 4,
  },
  phoneticText: {
    fontSize: 14,
    color: '#98989D',
    marginTop: 4,
  },
  translationText: {
    fontSize: 16,
    color: '#E5E5EA',
    marginTop: 10,
    lineHeight: 22,
  },
  footer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 8,
    alignItems: 'center',
  },
  autoHideHint: {
    fontSize: 11,
    color: '#636366',
  },
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
});
