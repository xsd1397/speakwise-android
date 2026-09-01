import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
<<<<<<< HEAD
=======
import { Ionicons } from '@expo/vector-icons';
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onStartRecord?: () => void;
<<<<<<< HEAD
  onStopRecord?: () => void;
  isRecording?: boolean;
  statusHint?: string;
  disabled?: boolean;
=======
  isRecording?: boolean;
  statusHint?: string;
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  onStartRecord,
<<<<<<< HEAD
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
=======
  isRecording,
  statusHint = "按住或点击下方按钮开始录音"
}) => {
  return (
    <View style={styles.container}>
      {/* 1. 主用户输入框 */}
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder="输入消息..."
<<<<<<< HEAD
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
=======
          multiline
        />
        {/* 发送按钮：无文字，纯纸飞机图标 */}
        <TouchableOpacity style={styles.sendButton} onPress={onSend}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 2. 输入框下方的提示与录音控制区域 */}
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
      <View style={styles.bottomControls}>
        <Text style={styles.hintText}>{statusHint}</Text>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingActive]}
<<<<<<< HEAD
          onPress={handleRecordPress}
          disabled={disabled}
        >
          <Text style={styles.recordIcon}>{isRecording ? "" : ""}</Text>
          <Text style={styles.recordText}>
            {isRecording ? "停止录音并发送" : "点击开始录音"}
=======
          onPress={onStartRecord}
        >
          <Ionicons name={isRecording ? "stop-circle" : "mic"} size={22} color="#FFF" />
          <Text style={styles.recordText}>
            {isRecording ? "停止录音" : "点击录音"}
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

<<<<<<< HEAD
const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
=======
const styles = StyleSheet.StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#FFF',
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    backgroundColor: '#1E1E1E',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#333336',
=======
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
<<<<<<< HEAD
    color: '#FFFFFF',
    paddingHorizontal: 8,
  },
  sendButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 18,
=======
    paddingHorizontal: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
<<<<<<< HEAD
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
=======
  bottomControls: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#888',
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
    marginBottom: 6,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    backgroundColor: '#30D158',
    paddingHorizontal: 20,
=======
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingActive: {
<<<<<<< HEAD
    backgroundColor: '#FF453A',
  },
  recordIcon: {
    color: '#FFF',
    fontSize: 14,
=======
    backgroundColor: '#FF3B30',
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
  },
  recordText: {
    color: '#FFF',
    marginLeft: 6,
    fontWeight: '600',
<<<<<<< HEAD
    fontSize: 14,
=======
>>>>>>> 48900c2 (fix: 修复 JS Bundle 构建报错，添加组件导出与环境变量注入)
  },
});
