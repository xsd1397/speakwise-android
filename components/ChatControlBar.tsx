// components/ChatControlBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';

interface ChatControlBarProps {
  isRecording: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onToggleRecord?: () => void;
  onSelectHint?: (hintText: string) => void;
  disabled?: boolean;
}

export function ChatControlBar({
  isRecording,
  onStartRecording,
  onStopRecording,
  onToggleRecord,
  disabled = false,
}: ChatControlBarProps) {
  const handlePress = () => {
    if (onToggleRecord) {
      onToggleRecord();
    } else if (isRecording && onStopRecording) {
      onStopRecording();
    } else if (!isRecording && onStartRecording) {
      onStartRecording();
    }
  };

  const IconComponent = (isRecording ? MicOff : Mic) as any;
  const iconColor = isRecording ? '#ffffff' : '#2563eb';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording ? styles.recording : styles.idle,
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <IconComponent size={24} color={iconColor} />
        <Text style={[styles.text, isRecording ? styles.textRecording : styles.textIdle]}>
          {isRecording ? '停止录音' : '点击说话'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  idle: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  recording: {
    backgroundColor: '#dc2626',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  textIdle: {
    color: '#2563eb',
  },
  textRecording: {
    color: '#ffffff',
  },
});