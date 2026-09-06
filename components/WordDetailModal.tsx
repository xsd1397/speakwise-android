import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface WordDetailModalProps {
  visible: boolean;
  word: string | null;
  phonetic?: string;
  definition?: string;
  translation?: string;
  examples?: string[];
  onClose: () => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  visible,
  word,
  phonetic,
  definition,
  translation,
  examples = [],
  onClose,
}) => {
  if (!word) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.word}>{word}</Text>
            {phonetic && <Text style={styles.phonetic}>[{phonetic}]</Text>}
            
            {translation && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>释义</Text>
                <Text style={styles.definition}>{translation}</Text>
              </View>
            )}

            {definition && !translation && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Definition</Text>
                <Text style={styles.definition}>{definition}</Text>
              </View>
            )}

            {examples.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>例句</Text>
                {examples.map((item, index) => (
                  <Text key={index} style={styles.example}>
                     {item}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>关闭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    paddingBottom: 10,
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  phonetic: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  definition: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 22,
  },
  example: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    fontStyle: 'italic',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default WordDetailModal;
