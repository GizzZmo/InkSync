import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '@inksync/shared';
import { AuthStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.CLIENT as UserRole,
  });
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await register(form);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      Alert.alert('Registration Failed', msg);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="First Name" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
      <TextInput style={styles.input} placeholder="Last Name" value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
      <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password (min 8 chars)" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry />
      <View style={styles.roleRow}>
        {[UserRole.CLIENT, UserRole.ARTIST].map((r) => (
          <TouchableOpacity key={r} style={[styles.roleBtn, form.role === r && styles.roleBtnActive]} onPress={() => setForm({ ...form, role: r })}>
            <Text style={[styles.roleBtnText, form.role === r && styles.roleBtnTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#6366f1', textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  roleBtnText: { color: '#333' },
  roleBtnTextActive: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#6366f1', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#6366f1', textAlign: 'center', marginTop: 8 },
});
