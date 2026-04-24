import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../services/apiClient';
import { TattooStyle } from '@inksync/shared';

type Artist = { id: string; city: string; styles: TattooStyle[]; user: { firstName: string; lastName: string } };
type MatchResult = { detectedStyle: TattooStyle; confidence: number; recommendedArtists: Artist[] };

type Props = { navigation: NativeStackNavigationProp<any> };

export default function StyleMatchScreen({ navigation }: Props) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

  const handleMatch = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe your tattoo idea');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/style-match/match', { description });
      setResult(res.data.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to get style recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>AI Style Match</Text>
      <Text style={styles.subtitle}>Describe your tattoo idea and we'll match you with the best artists.</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. A realistic wolf portrait with detailed fur shading..."
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.matchBtn} onPress={handleMatch} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.matchBtnText}>Find My Style</Text>}
      </TouchableOpacity>

      {result && (
        <>
          <View style={styles.resultBanner}>
            <Text style={styles.resultStyle}>Detected Style: {result.detectedStyle}</Text>
            <Text style={styles.resultConfidence}>Confidence: {Math.round(result.confidence * 100)}%</Text>
          </View>
          <Text style={styles.sectionLabel}>Recommended Artists</Text>
          <FlatList
            data={result.recommendedArtists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.artistCard}
                onPress={() => navigation.navigate('ArtistDetail', { artistId: item.id })}
              >
                <Text style={styles.artistName}>{item.user.firstName} {item.user.lastName}</Text>
                <Text style={styles.artistCity}>{item.city}</Text>
                <Text style={styles.artistStyles}>{item.styles.slice(0, 2).join(' · ')}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No artists found for this style</Text>}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#666', fontSize: 14, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14, minHeight: 100, marginBottom: 12 },
  matchBtn: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  matchBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  resultBanner: { backgroundColor: '#f0f0ff', borderRadius: 10, padding: 14, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultStyle: { fontWeight: '700', color: '#6366f1', fontSize: 15 },
  resultConfidence: { color: '#555', fontSize: 13 },
  sectionLabel: { fontWeight: '600', fontSize: 16, marginBottom: 10 },
  artistCard: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  artistName: { fontSize: 16, fontWeight: '600' },
  artistCity: { color: '#888', fontSize: 13, marginTop: 2 },
  artistStyles: { color: '#6366f1', fontSize: 12, marginTop: 2 },
  empty: { textAlign: 'center', color: '#999', marginTop: 30 },
});
