import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

export interface ChatControlBarProps {
  userInputText?: string;
  onSend?: (text: string) => void;
  onToggleSuggestions: () => void;
}

export function ChatControlBar({ onToggleSuggestions }: ChatControlBarProps) {
  return (
    <View style={styles.container}>
      <Pressable 
        onPress={onToggleSuggestions} 
        style={styles.button}
        accessibilityLabel="回复提示"
      >
        <Text style={styles.buttonText}>回复提示</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1E2330',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A3D45',
  },
  buttonText: {
    color: '#9AA2B4',
    fontSize: 12,
    fontWeight: '600',
  },
});
