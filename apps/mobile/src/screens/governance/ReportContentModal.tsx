import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { apiClient } from '../../services/apiClient';
import { t } from '../../i18n';

type ReportTargetType = 'REVIEW' | 'BLOG_POST' | 'ARTIST_PROFILE' | 'MESSAGE' | 'FLASH_DESIGN';

type Props = {
  visible: boolean;
  targetType: ReportTargetType;
  targetId: string;
  onClose: () => void;
};

const REPORT_REASONS = [
  'Spam or advertising',
  'Harassment or hate speech',
  'Inappropriate content',
  'Misinformation',
  'Copyright infringement',
  'Other',
];

export function ReportContentModal({ visible, targetType, targetId, onClose }: Props) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      Alert.alert('Error', 'Please select a reason');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/governance/reports', { targetType, targetId, reason, details });
      Alert.alert(t('common.success'), t('governance.reportSubmitted'));
      onClose();
    } catch {
      Alert.alert(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{t('governance.reportContent')}</Text>
          <Text style={styles.label}>{t('governance.reportReason')}</Text>

          {REPORT_REASONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.reasonRow, reason === r && styles.reasonRowSelected]}
              onPress={() => setReason(r)}
            >
              <Text style={[styles.reasonText, reason === r && styles.reasonTextSelected]}>{r}</Text>
            </TouchableOpacity>
          ))}

          <TextInput
            style={styles.textArea}
            placeholder="Additional details (optional)"
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={3}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>{t('common.submit')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 36,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, color: '#666', marginBottom: 8 },
  reasonRow: {
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#eee', marginBottom: 6,
  },
  reasonRowSelected: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  reasonText: { fontSize: 14, color: '#333' },
  reasonTextSelected: { color: '#6366f1', fontWeight: '600' },
  textArea: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10,
    fontSize: 14, marginTop: 10, minHeight: 70, textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 10 },
  cancelBtn: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 8, borderWidth: 1, borderColor: '#ddd',
  },
  cancelBtnText: { fontSize: 14, color: '#666' },
  submitBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#6366f1' },
  submitBtnText: { fontSize: 14, color: '#fff', fontWeight: '600' },
});
