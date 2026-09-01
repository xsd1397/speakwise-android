import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onStartRecord?: () => void;
  onStopRecord?: () => void;
  isRecording?: boolean;
  statusHint?: string;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  onStartRecord,
  onStopRecord,
  isRecording = false,
  statusHint = "点击下方按钮开始/结束录音",
  disabled = false,
}) => {
  const handleRecordPress = () => {
    if (isRecording) {
      if (onStopRecord) onStopRecord();
    } else {
      if (onStartRecord) onStartRecord();
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. 文本输入框 + 纸飞机发送图标 */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder="输入消息..."
          placeholderTextColor="#8E8E93"
          multiline
          editable={!disabled}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!value.trim() || disabled) && styles.sendButtonDisabled]} 
          onPress={onSend}
          disabled={!value.trim() || disabled}
        >
          <Text style={styles.sendIcon}></Text>
        </TouchableOpacity>
      </View>

      {/* 2. 输入框下方：录音提示语与录音控制按钮 */}
      <View style={styles.bottomControls}>
        <Text style={styles.hintText}>{statusHint}</Text>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingActive]}
          onPress={handleRecordPress}
          disabled={disabled}
        >
          <Text style={styles.recordIcon}>{isRecording ? "" : ""}</Text>
          <Text style={styles.recordText}>
            {isRecording ? "停止录音并发送" : "点击开始录音"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#333336',
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    color: '#FFFFFF',
    paddingHorizontal: 8,
  },
  sendButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  sendButtonDisabled: {
    backgroundColor: '#3A3A3C',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomControls: {
    marginTop: 10,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 6,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#30D158',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingActive: {
    backgroundColor: '#FF453A',
  },
  recordIcon: {
    color: '#FFF',
    fontSize: 14,
  },
  recordText: {
    color: '#FFF',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
});
