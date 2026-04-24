import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList, Artist } from '../../types';
import * as artistService from '../../services/artistService';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'ArtistDetail'>;
  route: RouteProp<HomeStackParamList, 'ArtistDetail'>;
};

export default function ArtistDetailScreen({ navigation, route }: Props) {
  const { artistId } = route.params;
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    artistService.getArtistById(artistId)
      .then(setArtist)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [artistId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!artist) return <View style={styles.container}><Text>Artist not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.name}>{artist.user.firstName} {artist.user.lastName}</Text>
      <Text style={styles.location}>{artist.city}, {artist.state}</Text>
      <Text style={styles.bio}>{artist.bio}</Text>
      <Text style={styles.sectionTitle}>Styles</Text>
      <View style={styles.styleRow}>
        {artist.styles.map((s) => (
          <View key={s} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('BookingCreate', { artistId })}
      >
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  location: { color: '#666', marginBottom: 12 },
  bio: { fontSize: 15, lineHeight: 22, color: '#333', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  styleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: { backgroundColor: '#f0f0ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  chipText: { color: '#6366f1', fontSize: 13 },
  bookButton: { backgroundColor: '#6366f1', borderRadius: 12, padding: 16, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
