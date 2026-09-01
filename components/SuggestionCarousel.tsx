import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

export interface SuggestionItem {
  id: string;
  english: string;
  chinese: string;
}

interface Props {
  suggestions: SuggestionItem[];
  onSelectSuggestion: (text: string) => void;
}

const CARD_WIDTH = 280;
const CARD_MARGIN = 10;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;

export const SuggestionCarousel: React.FC<Props> = ({ suggestions, onSelectSuggestion }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="center"
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => onSelectSuggestion(item.english)}
            style={styles.card}
          >
            {/* 上层：英文提示 */}
            <Text style={styles.englishText} numberOfLines={2}>
              {item.english}
            </Text>
            {/* 下层：中文译文（去除翻译按钮） */}
            <Text style={styles.chineseText} numberOfLines={2}>
              {item.chinese}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 95, marginVertical: 8 },
  scrollContent: { paddingHorizontal: 16 },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
  },
  englishText: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  chineseText: { fontSize: 12, color: '#64748B', lineHeight: 16 },
});