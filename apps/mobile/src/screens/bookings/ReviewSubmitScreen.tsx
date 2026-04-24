import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../services/apiClient';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { appointmentId: string; artistName: string } };
};

export default function ReviewSubmitScreen({ navigation, route }: Props) {
  const { appointmentId, artistName } = route.params;
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Error', 'Please select a rating'); return; }
    setSubmitting(true);
    try {
      await apiClient.post('/reviews', { appointmentId, rating, content: content || undefined });
      Alert.alert('Review Submitted!', 'Thank you for your feedback.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Leave a Review</Text>
      <Text style={styles.subtitle}>for {artistName}</Text>

      <Text style={styles.label}>Rating</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Your Review (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Share your experience..."
        multiline
        numberOfLines={5}
        value={content}
        onChangeText={setContent}
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Review</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#666', marginBottom: 24 },
  label: { fontWeight: '600', marginBottom: 8, color: '#333' },
  stars: { flexDirection: 'row', marginBottom: 20 },
  star: { fontSize: 40, color: '#ddd', marginRight: 8 },
  starActive: { color: '#f59e0b' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14, minHeight: 120, marginBottom: 20 },
  submitBtn: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
