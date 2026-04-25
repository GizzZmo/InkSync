import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { BookingsStackParamList, Appointment } from '../../types';
import * as appointmentService from '../../services/appointmentService';
import { AppointmentStatus } from '@inksync/shared';

type Props = {
  navigation: NativeStackNavigationProp<BookingsStackParamList, 'AppointmentDetail'>;
  route: RouteProp<BookingsStackParamList, 'AppointmentDetail'>;
};

export default function AppointmentDetailScreen({ navigation, route }: Props) {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService.getAppointmentById(appointmentId)
      .then(setAppointment)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const handleCancel = () => {
    Alert.alert('Cancel Appointment', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes', style: 'destructive', onPress: async () => {
          await appointmentService.cancelAppointment(appointmentId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!appointment) return <View style={styles.container}><Text>Appointment not found</Text></View>;

  const canCancel = [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(appointment.status);
  const canReview = appointment.status === AppointmentStatus.COMPLETED;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{appointment.serviceType}</Text>
      <Text style={styles.status}>{appointment.status}</Text>
      <Text style={styles.label}>Artist</Text>
      <Text style={styles.value}>{appointment.artist.user.firstName} {appointment.artist.user.lastName}</Text>
      <Text style={styles.label}>Date & Time</Text>
      <Text style={styles.value}>{new Date(appointment.startTime).toLocaleString()}</Text>
      <Text style={styles.label}>Deposit</Text>
      <Text style={styles.value}>{appointment.depositPaid ? `$${appointment.depositAmount} (Paid)` : `$${appointment.depositAmount ?? 0} (Unpaid)`}</Text>
      <View style={styles.actions}>
        {canCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.aftercareBtn} onPress={() => navigation.navigate('Aftercare', { appointmentId })}>
          <Text style={styles.aftercareBtnText}>View Aftercare</Text>
        </TouchableOpacity>
        {canReview && (
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => navigation.navigate('ReviewSubmit', {
              appointmentId,
              artistName: `${appointment.artist.user.firstName} ${appointment.artist.user.lastName}`,
            })}
          >
            <Text style={styles.reviewBtnText}>⭐ Leave a Review</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  status: { fontSize: 16, color: '#6366f1', fontWeight: '600', marginBottom: 24 },
  label: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  value: { fontSize: 16, color: '#333', marginBottom: 16 },
  actions: { marginTop: 16, gap: 12 },
  cancelBtn: { backgroundColor: '#fee2e2', borderRadius: 8, padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#ef4444', fontWeight: '600' },
  aftercareBtn: { backgroundColor: '#f0f0ff', borderRadius: 8, padding: 14, alignItems: 'center' },
  aftercareBtnText: { color: '#6366f1', fontWeight: '600' },
  reviewBtn: { backgroundColor: '#fef9c3', borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#fde047' },
  reviewBtnText: { color: '#92400e', fontWeight: '600' },
});
