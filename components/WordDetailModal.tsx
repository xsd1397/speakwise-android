import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

interface WordDetailModalProps {
  word: string | null;
  onClose: () => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({ word, onClose }) => {
  if (!word) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={!!word}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* 顶部拖拽指示条 */}
          <View style={styles.dragBar} />

          <View style={styles.header}>
            <Text style={styles.wordText}>{word}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.body}>
            <Text style={styles.label}>基本释义</Text>
            <View style={styles.detailBox}>
              <Text style={styles.detailText}>
                点击选中的单词：<Text style={styles.highlight}>{word}</Text>
              </Text>
            </View>
          </View>

          <Pressable style={styles.confirmBtn} onPress={onClose}>
            <Text style={styles.confirmBtnText}>确认并返回</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
  },
  dragBar: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#666666',
  },
  body: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#888888',
  },
  detailBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#333333',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  confirmBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});