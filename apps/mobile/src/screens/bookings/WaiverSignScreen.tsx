import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { BookingsStackParamList } from '../../types';
import apiClient from '../../services/apiClient';

type Props = {
  navigation: NativeStackNavigationProp<BookingsStackParamList, 'WaiverSign'>;
  route: RouteProp<BookingsStackParamList, 'WaiverSign'>;
};

export default function WaiverSignScreen({ navigation, route }: Props) {
  const { waiverId } = route.params;
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSign = async () => {
    setLoading(true);
    try {
      // In production, collect real signature from SignatureCanvas
      const signatureData = 'data:image/png;base64,placeholder';
      await apiClient.post(`/waivers/${waiverId}/sign`, { signatureData });
      setSigned(true);
      Alert.alert('Success', 'Waiver signed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to sign waiver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tattoo Consent Waiver</Text>
      <Text style={styles.body}>
        By signing this waiver, you acknowledge that tattooing is a permanent procedure and agree to the terms and conditions set by the artist.
      </Text>
      <View style={styles.signatureBox}>
        <Text style={styles.signaturePlaceholder}>Signature Canvas</Text>
        <Text style={styles.signatureNote}>(Signature capture would be rendered here using react-native-signature-canvas)</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSign} disabled={loading || signed}>
        <Text style={styles.buttonText}>{signed ? 'Signed ✓' : loading ? 'Signing...' : 'Sign Waiver'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  body: { color: '#333', lineHeight: 22, marginBottom: 24 },
  signatureBox: { height: 200, borderWidth: 2, borderColor: '#ddd', borderRadius: 8, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  signaturePlaceholder: { color: '#aaa', fontSize: 16 },
  signatureNote: { color: '#bbb', fontSize: 12, textAlign: 'center', padding: 8 },
  button: { backgroundColor: '#6366f1', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
