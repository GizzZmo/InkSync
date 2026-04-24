import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, Artist } from '../../types';
import * as artistService from '../../services/artistService';
import { TattooStyle } from '@inksync/shared';

type Props = { navigation: BottomTabNavigationProp<MainTabParamList, 'Explore'> };

export default function ExploreScreen({ navigation }: Props) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<TattooStyle | undefined>();

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const res = await artistService.getArtists({ city: search || undefined, style: selectedStyle });
      setArtists(res.artists ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArtists(); }, [selectedStyle]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search by city..."
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={fetchArtists}
        returnKeyType="search"
      />
      <FlatList
        horizontal
        data={Object.values(TattooStyle)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.styleChip, selectedStyle === item && styles.styleChipActive]}
            onPress={() => setSelectedStyle(selectedStyle === item ? undefined : item)}
          >
            <Text style={[styles.styleText, selectedStyle === item && styles.styleTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.styleRow}
        showsHorizontalScrollIndicator={false}
      />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={artists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
              <Text style={styles.name}>{item.user.firstName} {item.user.lastName}</Text>
              <Text style={styles.sub}>{item.city} · {item.styles.slice(0, 2).join(', ')}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No artists found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  search: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  styleRow: { marginBottom: 12 },
  styleChip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, marginRight: 8 },
  styleChipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  styleText: { color: '#333', fontSize: 12 },
  styleTextActive: { color: '#fff' },
  card: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  sub: { color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
