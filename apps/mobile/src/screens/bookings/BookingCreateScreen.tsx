import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../types';
import * as appointmentService from '../../services/appointmentService';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'BookingCreate'>;
  route: RouteProp<HomeStackParamList, 'BookingCreate'>;
};

export default function BookingCreateScreen({ navigation, route }: Props) {
  const { artistId } = route.params;
  const [form, setForm] = useState({
    serviceType: '',
    description: '',
    startTime: '',
    endTime: '',
    depositAmount: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.serviceType || !form.startTime || !form.endTime) {
      Alert.alert('Error', 'Please fill in service type and times');
      return;
    }
    setLoading(true);
    try {
      const appointment = await appointmentService.createAppointment({
        artistId,
        serviceType: form.serviceType,
        description: form.description || undefined,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : undefined,
      });
      navigation.navigate('AppointmentDetail', { appointmentId: appointment.id });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed';
      Alert.alert('Booking Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Book Appointment</Text>
      <Text style={styles.label}>Service Type *</Text>
      <TextInput style={styles.input} placeholder="e.g. Custom sleeve, Small tattoo" value={form.serviceType} onChangeText={(v) => setForm({ ...form, serviceType: v })} />
      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.textarea]} placeholder="Describe your tattoo idea..." value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline numberOfLines={4} />
      <Text style={styles.label}>Start Time * (ISO format)</Text>
      <TextInput style={styles.input} placeholder="2024-03-15T10:00:00Z" value={form.startTime} onChangeText={(v) => setForm({ ...form, startTime: v })} />
      <Text style={styles.label}>End Time *</Text>
      <TextInput style={styles.input} placeholder="2024-03-15T12:00:00Z" value={form.endTime} onChangeText={(v) => setForm({ ...form, endTime: v })} />
      <Text style={styles.label}>Deposit Amount ($)</Text>
      <TextInput style={styles.input} placeholder="50" value={form.depositAmount} onChangeText={(v) => setForm({ ...form, depositAmount: v })} keyboardType="decimal-pad" />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Booking...' : 'Request Appointment'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16 },
  textarea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#6366f1', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
