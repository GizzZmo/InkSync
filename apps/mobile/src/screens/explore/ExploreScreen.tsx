import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../services/apiClient';
import { TattooStyle } from '@inksync/shared';
import { Artist } from '../../types';

type Props = { navigation: NativeStackNavigationProp<any> };

type SearchFilters = {
  q: string;
  style?: TattooStyle;
  minPrice?: string;
  maxPrice?: string;
  nearMe: boolean;
  latitude?: number;
  longitude?: number;
};

export default function ExploreScreen({ navigation }: Props) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [trending, setTrending] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ q: '', nearMe: false });
  const [showFilters, setShowFilters] = useState(false);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await apiClient.get('/search/trending');
      setTrending(res.data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const searchArtists = useCallback(async (f: SearchFilters) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        ...(f.q ? { q: f.q } : {}),
        ...(f.style ? { style: f.style } : {}),
        ...(f.minPrice ? { minPrice: Number(f.minPrice) } : {}),
        ...(f.maxPrice ? { maxPrice: Number(f.maxPrice) } : {}),
        ...(f.nearMe && f.latitude !== undefined ? { lat: f.latitude, lng: f.longitude, radius: 50 } : {}),
        isAvailable: true,
        limit: 20,
      };
      const res = await apiClient.get('/search/artists', { params });
      setArtists(res.data.artists ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
    searchArtists(filters);
  }, [fetchTrending, searchArtists]);

  const handleSearch = () => searchArtists(filters);

  const handleStyleSelect = (style: TattooStyle) => {
    const next = { ...filters, style: filters.style === style ? undefined : style };
    setFilters(next);
    searchArtists(next);
  };

  const handleNearMe = async () => {
    if (filters.nearMe) {
      const next = { ...filters, nearMe: false, latitude: undefined, longitude: undefined };
      setFilters(next);
      searchArtists(next);
      return;
    }
    Alert.alert(
      'Location Access',
      'This feature requires your location. In production this uses the device GPS.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Demo Location',
          onPress: () => {
            // Demo coordinates (New York)
            const next = { ...filters, nearMe: true, latitude: 40.7128, longitude: -74.006 };
            setFilters(next);
            searchArtists(next);
          },
        },
      ]
    );
  };

  const renderArtistCard = ({ item }: { item: Artist }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ArtistDetail', { artistId: item.id })}
    >
      <Text style={styles.name}>{item.user.firstName} {item.user.lastName}</Text>
      <Text style={styles.sub}>{item.city}{item.state ? `, ${item.state}` : ''}</Text>
      <Text style={styles.styleTag}>{item.styles.slice(0, 2).join(' · ')}</Text>
      {item.hourlyRate ? <Text style={styles.rate}>${Number(item.hourlyRate)}/hr</Text> : null}
    </TouchableOpacity>
  );

  const hasResults = artists.length > 0;
  const isSearching = filters.q || filters.style || filters.minPrice || filters.maxPrice || filters.nearMe;

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search artists, city, style..."
          value={filters.q}
          onChangeText={(q) => setFilters((f) => ({ ...f, q }))}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.filterToggleBtn} onPress={() => setShowFilters((v) => !v)}>
          <Text style={styles.filterToggleBtnText}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Style chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {Object.values(TattooStyle).map((style) => (
          <TouchableOpacity
            key={style}
            style={[styles.chip, filters.style === style && styles.chipActive]}
            onPress={() => handleStyleSelect(style)}
          >
            <Text style={[styles.chipText, filters.style === style && styles.chipTextActive]}>{style}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Extra filters */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.priceRow}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min $/hr"
              keyboardType="numeric"
              value={filters.minPrice ?? ''}
              onChangeText={(v) => setFilters((f) => ({ ...f, minPrice: v || undefined }))}
            />
            <Text style={styles.priceSep}>–</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max $/hr"
              keyboardType="numeric"
              value={filters.maxPrice ?? ''}
              onChangeText={(v) => setFilters((f) => ({ ...f, maxPrice: v || undefined }))}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleSearch}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.nearMeBtn, filters.nearMe && styles.nearMeBtnActive]}
            onPress={handleNearMe}
          >
            <Text style={[styles.nearMeBtnText, filters.nearMe && styles.nearMeBtnTextActive]}>
              📍 {filters.nearMe ? 'Near Me (on)' : 'Artists Near Me'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('StyleMatch')}>
          <Text style={styles.actionBtnText}>🤖 AI Style Match</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ARPreview', {})}>
          <Text style={styles.actionBtnText}>🪞 AR Preview</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={isSearching ? artists : trending.length > 0 ? trending : artists}
          keyExtractor={(item) => item.id}
          renderItem={renderArtistCard}
          ListHeaderComponent={
            !isSearching && trending.length > 0 ? (
              <Text style={styles.sectionTitle}>🔥 Trending Artists</Text>
            ) : hasResults ? (
              <Text style={styles.sectionTitle}>Search Results ({artists.length})</Text>
            ) : null
          }
          ListEmptyComponent={<Text style={styles.empty}>No artists found</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  searchRow: { flexDirection: 'row', marginBottom: 10, gap: 8 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14 },
  filterToggleBtn: { backgroundColor: '#f0f0ff', borderRadius: 8, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
  filterToggleBtnText: { fontSize: 18 },
  chipRow: { marginBottom: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, marginRight: 8 },
  chipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  chipText: { color: '#333', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  filtersPanel: { backgroundColor: '#f9f9ff', borderRadius: 10, padding: 12, marginBottom: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  priceInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, fontSize: 13 },
  priceSep: { color: '#888' },
  applyBtn: { backgroundColor: '#6366f1', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 },
  applyBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  nearMeBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, alignItems: 'center' },
  nearMeBtnActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  nearMeBtnText: { color: '#333', fontWeight: '600', fontSize: 13 },
  nearMeBtnTextActive: { color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionBtn: { flex: 1, backgroundColor: '#f0f0ff', borderRadius: 10, padding: 10, alignItems: 'center' },
  actionBtnText: { color: '#6366f1', fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#333' },
  card: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  name: { fontSize: 16, fontWeight: '600', color: '#111' },
  sub: { color: '#888', marginTop: 2, fontSize: 13 },
  styleTag: { color: '#6366f1', fontSize: 12, marginTop: 4 },
  rate: { color: '#333', fontSize: 13, fontWeight: '600', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
