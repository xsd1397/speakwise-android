import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ChatControlBar } from './ChatControlBar';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onSendVoice?: (audioUri: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
  onSendVoice 
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleSelectHint = (hintText: string) => {
    onSendMessage(hintText);
  };

  const handleToggleRecord = () => {
    setIsRecording(!isRecording);
    // 录音触发逻辑
  };

  return (
    <View style={styles.outerContainer}>
      {/* 快捷提示词与语音控制栏 */}
      <ChatControlBar
        isRecording={isRecording}
        onToggleRecord={handleToggleRecord}
        onSelectHint={handleSelectHint}
        disabled={isLoading}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="输入消息或点击图标使用语音/提示词..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.disabledButton]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>发送</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#f8fafc',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#93c5fd',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ChatInput;
