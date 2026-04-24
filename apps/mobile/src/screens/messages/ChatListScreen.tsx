import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessagesStackParamList, Appointment } from '../../types';
import * as appointmentService from '../../services/appointmentService';

type Props = { navigation: NativeStackNavigationProp<MessagesStackParamList, 'ChatList'> };

export default function ChatListScreen({ navigation }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService.getAppointments()
      .then((res) => setAppointments(res.appointments ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleOpenChat = async (appointment: Appointment) => {
    try {
      const { getChatRoomByAppointment } = await import('../../services/messageService');
      const room = await getChatRoomByAppointment(appointment.id);
      navigation.navigate('ChatRoom', { roomId: room.id, appointmentId: appointment.id });
    } catch {
      console.error('Failed to open chat room');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleOpenChat(item)}>
            <Text style={styles.name}>{item.artist.user.firstName} {item.artist.user.lastName}</Text>
            <Text style={styles.sub}>{item.serviceType} · {new Date(item.startTime).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No conversations yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  sub: { color: '#888', fontSize: 13 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
