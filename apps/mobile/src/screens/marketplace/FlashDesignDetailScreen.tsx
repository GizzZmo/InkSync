import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../services/apiClient';

type FlashDesign = {
  id: string; title: string; description?: string; imageUrl: string;
  price: number; style: string; status: string; licensingTerms?: string;
  artist: { id: string; bio: string; user: { firstName: string; lastName: string; avatarUrl?: string } };
};

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { designId: string } };
};

export default function FlashDesignDetailScreen({ navigation, route }: Props) {
  const [design, setDesign] = useState<FlashDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    apiClient.get(`/marketplace/${route.params.designId}`)
      .then((res) => setDesign(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [route.params.designId]);

  const handlePurchase = async () => {
    if (!design) return;
    Alert.alert(
      'Confirm Purchase',
      `Purchase "${design.title}" for $${Number(design.price).toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            setPurchasing(true);
            try {
              await apiClient.post(`/marketplace/${design.id}/purchase`);
              Alert.alert('Success!', 'You have purchased this flash design.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err) {
              Alert.alert('Error', 'Purchase failed. Please try again.');
            } finally {
              setPurchasing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!design) return <View style={styles.container}><Text>Design not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      {design.imageUrl ? (
        <Image source={{ uri: design.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}><Text style={styles.imagePlaceholderText}>🎨</Text></View>
      )}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{design.title}</Text>
          <Text style={styles.price}>${Number(design.price).toFixed(2)}</Text>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>{design.style}</Text></View>
          <View style={[styles.badge, design.status === 'AVAILABLE' ? styles.badgeGreen : styles.badgeGray]}>
            <Text style={styles.badgeText}>{design.status}</Text>
          </View>
        </View>

        {design.description && <Text style={styles.description}>{design.description}</Text>}

        <TouchableOpacity
          style={styles.artistRow}
          onPress={() => navigation.navigate('ArtistDetail', { artistId: design.artist.id })}
        >
          <Text style={styles.artistLabel}>Artist: </Text>
          <Text style={styles.artistName}>{design.artist.user.firstName} {design.artist.user.lastName}</Text>
        </TouchableOpacity>

        {design.licensingTerms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Licensing Terms</Text>
            <Text style={styles.sectionContent}>{design.licensingTerms}</Text>
          </View>
        )}

        {design.status === 'AVAILABLE' && (
          <TouchableOpacity style={styles.purchaseBtn} onPress={handlePurchase} disabled={purchasing}>
            {purchasing ? <ActivityIndicator color="#fff" /> : <Text style={styles.purchaseBtnText}>Purchase Design</Text>}
          </TouchableOpacity>
        )}

        {design.status !== 'AVAILABLE' && (
          <View style={styles.soldBanner}><Text style={styles.soldText}>{design.status}</Text></View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 300 },
  imagePlaceholder: { width: '100%', height: 300, backgroundColor: '#e8e8f0', alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 80 },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', flex: 1, marginRight: 12 },
  price: { fontSize: 24, fontWeight: '700', color: '#6366f1' },
  badgeRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  badge: { backgroundColor: '#e0e0f0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeGreen: { backgroundColor: '#e0f0e0' },
  badgeGray: { backgroundColor: '#f0e0e0' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#333' },
  description: { color: '#555', lineHeight: 22, marginBottom: 16 },
  artistRow: { flexDirection: 'row', marginBottom: 16 },
  artistLabel: { color: '#888' },
  artistName: { color: '#6366f1', fontWeight: '600' },
  section: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 16 },
  sectionTitle: { fontWeight: '700', marginBottom: 6, color: '#333' },
  sectionContent: { color: '#555', lineHeight: 20 },
  purchaseBtn: { backgroundColor: '#6366f1', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  purchaseBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  soldBanner: { backgroundColor: '#f0e0e0', padding: 14, borderRadius: 12, alignItems: 'center' },
  soldText: { color: '#c00', fontWeight: '700', fontSize: 16 },
});
