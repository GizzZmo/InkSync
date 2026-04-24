import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, Artist } from '../../types';
import * as artistService from '../../services/artistService';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;
};

export default function HomeScreen({ navigation }: Props) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    artistService.getArtists({ limit: 10 })
      .then((res) => setArtists(res.artists ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Featured Artists</Text>
      <FlatList
        data={artists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.artistCard}
            onPress={() => navigation.navigate('ArtistDetail', { artistId: item.id })}
          >
            <Text style={styles.artistName}>{item.user.firstName} {item.user.lastName}</Text>
            <Text style={styles.artistCity}>{item.city}, {item.state}</Text>
            <Text style={styles.artistStyles}>{item.styles.join(' · ')}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No artists found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  artistCard: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  artistName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  artistCity: { color: '#666', marginBottom: 4 },
  artistStyles: { color: '#6366f1', fontSize: 12 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
