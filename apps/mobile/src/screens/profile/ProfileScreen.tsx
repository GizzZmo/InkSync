import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      {user && (
        <>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.firstName[0]}</Text>
          </View>
          <Text style={styles.name}>{user.firstName}</Text>
          <Text style={styles.role}>{user.role}</Text>
        </>
      )}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginTop: 40, marginBottom: 16 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  role: { color: '#6366f1', fontSize: 16, marginBottom: 40 },
  logoutBtn: { backgroundColor: '#fee2e2', borderRadius: 8, padding: 14, paddingHorizontal: 32 },
  logoutText: { color: '#ef4444', fontWeight: '600', fontSize: 16 },
});
