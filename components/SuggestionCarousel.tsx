import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, StyleSheet } from 'react-native';

export interface SuggestionItem {
  id: string;
  english: string;
  chinese: string;
}

interface Props {
  suggestions: SuggestionItem[];
  onSelectSuggestion: (text: string) => void;
  onSpeakSuggestion?: (text: string) => void;
}

const CARD_WIDTH = 280;
const CARD_MARGIN = 10;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;

export const SuggestionCarousel: React.FC<Props> = ({ suggestions, onSelectSuggestion, onSpeakSuggestion }) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={SNAP_INTERVAL} snapToAlignment="center" contentContainerStyle={styles.scrollContent}>
        {suggestions.slice(0, 2).map((item, index) => (
          <View key={item.id} style={styles.card}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => onSelectSuggestion(item.english)} style={styles.textArea} accessibilityLabel={`选择提示 ${index + 1}`}>
              <Text style={styles.englishText} numberOfLines={3}>{item.english}</Text>
              <Text style={styles.chineseText} numberOfLines={3}>{item.chinese}</Text>
            </TouchableOpacity>
            <Pressable onPress={() => onSpeakSuggestion?.(item.english)} style={styles.voiceButton} accessibilityLabel={`播放提示 ${index + 1}`}>
              <Text style={styles.voiceText}>🔊</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 112, marginVertical: 8 },
  scrollContent: { paddingHorizontal: 16 },
  card: { width: CARD_WIDTH, marginHorizontal: CARD_MARGIN, backgroundColor: '#151820', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#3A3D45', justifyContent: 'center' },
  textArea: { paddingRight: 38 },
  englishText: { fontSize: 14, fontWeight: '600', color: '#F2F3F5', marginBottom: 4 },
  chineseText: { fontSize: 12, color: '#9AA2B4', lineHeight: 16 },
  voiceButton: { position: 'absolute', right: 10, top: '50%', marginTop: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: '#2F6BEB', alignItems: 'center', justifyContent: 'center' },
  voiceText: { fontSize: 16 },
});
