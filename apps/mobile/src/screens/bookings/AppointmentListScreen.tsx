import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookingsStackParamList, Appointment } from '../../types';
import * as appointmentService from '../../services/appointmentService';
import { AppointmentStatus } from '@inksync/shared';

type Props = { navigation: NativeStackNavigationProp<BookingsStackParamList, 'AppointmentList'> };

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#10b981',
  CANCELLED: '#ef4444',
  COMPLETED: '#6366f1',
  NO_SHOW: '#9ca3af',
};

export default function AppointmentListScreen({ navigation }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService.getAppointments()
      .then((res) => setAppointments(res.appointments ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.serviceType}>{item.serviceType}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.artistName}>
              with {item.artist.user.firstName} {item.artist.user.lastName}
            </Text>
            <Text style={styles.dateText}>
              {new Date(item.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No appointments yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  card: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  serviceType: { fontSize: 17, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  artistName: { color: '#555', marginBottom: 4 },
  dateText: { color: '#888', fontSize: 13 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
