import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { BookingsStackParamList } from '../../types';
import apiClient from '../../services/apiClient';

type Props = {
  navigation: NativeStackNavigationProp<BookingsStackParamList, 'Aftercare'>;
  route: RouteProp<BookingsStackParamList, 'Aftercare'>;
};

interface Milestone {
  id: string;
  dayNumber: number;
  title: string;
  instructions: string;
  completed: boolean;
}

interface AftercareData {
  id: string;
  instructions: string;
  milestones: Milestone[];
}

export default function AftercareScreen({ route }: Props) {
  const { appointmentId } = route.params;
  const [aftercare, setAftercare] = useState<AftercareData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/aftercare/${appointmentId}`)
      .then((res) => setAftercare(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const handleCompleteMilestone = async (milestoneId: string) => {
    if (!aftercare) return;
    await apiClient.post(`/aftercare/${aftercare.id}/milestones/${milestoneId}/complete`);
    setAftercare({
      ...aftercare,
      milestones: aftercare.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: true } : m
      ),
    });
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!aftercare) return <View style={styles.container}><Text>No aftercare plan yet</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Aftercare Plan</Text>
      <Text style={styles.instructions}>{aftercare.instructions}</Text>
      <Text style={styles.sectionTitle}>Milestones</Text>
      {aftercare.milestones.map((milestone) => (
        <TouchableOpacity
          key={milestone.id}
          style={[styles.milestoneCard, milestone.completed && styles.milestoneCompleted]}
          onPress={() => !milestone.completed && handleCompleteMilestone(milestone.id)}
        >
          <Text style={styles.milestoneDay}>Day {milestone.dayNumber}</Text>
          <Text style={styles.milestoneTitle}>{milestone.title}</Text>
          <Text style={styles.milestoneInstructions}>{milestone.instructions}</Text>
          {milestone.completed && <Text style={styles.completedBadge}>✓ Completed</Text>}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  instructions: { color: '#555', lineHeight: 22, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  milestoneCard: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  milestoneCompleted: { backgroundColor: '#f0fff4', borderColor: '#10b981' },
  milestoneDay: { fontSize: 12, color: '#6366f1', fontWeight: '700', marginBottom: 4 },
  milestoneTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  milestoneInstructions: { color: '#555', lineHeight: 20 },
  completedBadge: { color: '#10b981', fontWeight: '600', marginTop: 8 },
});
