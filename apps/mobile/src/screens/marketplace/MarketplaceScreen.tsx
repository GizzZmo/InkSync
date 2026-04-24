import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../services/apiClient';
import { TattooStyle } from '@inksync/shared';

type FlashDesign = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  style: TattooStyle;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  artist: { id: string; user: { firstName: string; lastName: string } };
};

type Props = { navigation: NativeStackNavigationProp<any> };

export default function MarketplaceScreen({ navigation }: Props) {
  const [designs, setDesigns] = useState<FlashDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<TattooStyle | undefined>();

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/marketplace', {
        params: { style: selectedStyle, status: 'AVAILABLE' },
      });
      setDesigns(res.data.designs ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedStyle]);

  useEffect(() => { fetchDesigns(); }, [fetchDesigns]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Flash Marketplace</Text>

      <FlatList
        horizontal
        data={Object.values(TattooStyle)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, selectedStyle === item && styles.chipActive]}
            onPress={() => setSelectedStyle(selectedStyle === item ? undefined : item)}
          >
            <Text style={[styles.chipText, selectedStyle === item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.chipRow}
        showsHorizontalScrollIndicator={false}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={designs}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('FlashDesignDetail', { designId: item.id })}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Text style={styles.cardImagePlaceholderText}>🎨</Text>
                </View>
              )}
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardArtist}>{item.artist.user.firstName} {item.artist.user.lastName}</Text>
              <Text style={styles.cardPrice}>${Number(item.price).toFixed(2)}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No flash designs available</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  chipRow: { marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', marginRight: 8 },
  chipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  chipText: { fontSize: 12, color: '#333' },
  chipTextActive: { color: '#fff' },
  row: { justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#f9f9f9', borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  cardImage: { width: '100%', height: 140 },
  cardImagePlaceholder: { width: '100%', height: 140, backgroundColor: '#e8e8f0', alignItems: 'center', justifyContent: 'center' },
  cardImagePlaceholderText: { fontSize: 40 },
  cardTitle: { fontSize: 13, fontWeight: '600', padding: 8, paddingBottom: 2 },
  cardArtist: { fontSize: 11, color: '#888', paddingHorizontal: 8 },
  cardPrice: { fontSize: 14, fontWeight: '700', color: '#6366f1', padding: 8, paddingTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
