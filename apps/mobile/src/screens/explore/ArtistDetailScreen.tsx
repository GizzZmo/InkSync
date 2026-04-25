import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView,
  Image, FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList, Artist, PortfolioImage } from '../../types';
import * as artistService from '../../services/artistService';
import { apiClient } from '../../services/apiClient';

type Review = {
  id: string;
  rating: number;
  content?: string;
  artistResponse?: string;
  client: { firstName: string; lastName: string };
  createdAt: string;
};

type Residency = {
  id: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  announcement?: string;
  studio: { name: string; city: string; state: string };
};

type SimilarArtist = {
  id: string;
  city: string;
  styles: string[];
  user: { firstName: string; lastName: string };
};

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList & { ARPreview: { designUrl?: string }; BookingCreate: { artistId: string } }, 'ArtistDetail'>;
  route: RouteProp<HomeStackParamList, 'ArtistDetail'>;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text key={s} style={[styles.star, s <= rating && styles.starActive]}>★</Text>
      ))}
    </View>
  );
}

export default function ArtistDetailScreen({ navigation, route }: Props) {
  const { artistId } = route.params;
  const [artist, setArtist] = useState<Artist | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [residencies, setResidencies] = useState<Residency[]>([]);
  const [similar, setSimilar] = useState<SimilarArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [artistData, portfolioData, reviewData, residencyData] = await Promise.all([
          artistService.getArtistById(artistId),
          artistService.getArtistPortfolio(artistId, { limit: 6 } as any),
          apiClient.get(`/reviews/artist/${artistId}`),
          apiClient.get(`/residencies`, { params: { artistId, active: true } }),
        ]);
        setArtist(artistData);
        setPortfolio(portfolioData?.images ?? portfolioData?.portfolioImages ?? []);
        setReviews(reviewData.data?.reviews ?? []);
        setAvgRating(reviewData.data?.averageRating ?? 0);
        setResidencies(residencyData.data?.residencies ?? []);

        // Fetch similar artists via style match using artist's top style
        if (artistData?.styles?.length) {
          try {
            const styleRes = await apiClient.post('/style-match/match', {
              description: artistData.styles[0],
              limit: 3,
            });
            const matched: SimilarArtist[] = (styleRes.data?.data?.recommendedArtists ?? [])
              .filter((a: SimilarArtist) => a.id !== artistId)
              .slice(0, 3);
            setSimilar(matched);
          } catch {
            // Similar artists are non-critical, ignore errors
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [artistId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!artist) return <View style={styles.container}><Text>Artist not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.name}>{artist.user.firstName} {artist.user.lastName}</Text>
      <Text style={styles.location}>{artist.city}{artist.state ? `, ${artist.state}` : ''}</Text>
      {avgRating > 0 && (
        <View style={styles.ratingRow}>
          <StarRating rating={Math.round(avgRating)} />
          <Text style={styles.ratingText}>{avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</Text>
        </View>
      )}

      {/* Bio */}
      {artist.bio ? <Text style={styles.bio}>{artist.bio}</Text> : null}

      {/* Styles */}
      <Text style={styles.sectionTitle}>Styles</Text>
      <View style={styles.styleRow}>
        {artist.styles.map((s) => (
          <View key={s} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
        ))}
      </View>

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioRow}>
            {portfolio.map((img) => (
              <Image key={img.id} source={{ uri: img.url }} style={styles.portfolioImage} resizeMode="cover" />
            ))}
          </ScrollView>
        </>
      )}

      {/* AR Preview button */}
      <TouchableOpacity
        style={styles.arBtn}
        onPress={() => navigation.navigate('ARPreview', { designUrl: portfolio[0]?.url })}
      >
        <Text style={styles.arBtnText}>🪞 Preview in AR</Text>
      </TouchableOpacity>

      {/* Book button */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('BookingCreate', { artistId })}
      >
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>

      {/* Active Residencies */}
      {residencies.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Guest Residencies</Text>
          {residencies.map((r) => (
            <View key={r.id} style={styles.residencyCard}>
              <Text style={styles.residencyStudio}>{r.studio.name}</Text>
              <Text style={styles.residencyLocation}>{r.studio.city}, {r.studio.state}</Text>
              <Text style={styles.residencyDates}>
                {new Date(r.startDate).toLocaleDateString()}
                {r.endDate ? ` – ${new Date(r.endDate).toLocaleDateString()}` : ' (ongoing)'}
              </Text>
              {r.announcement ? <Text style={styles.residencyAnnouncement}>{r.announcement}</Text> : null}
            </View>
          ))}
        </>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.slice(0, 5).map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.client.firstName} {review.client.lastName}</Text>
                <StarRating rating={review.rating} />
              </View>
              {review.content ? <Text style={styles.reviewContent}>{review.content}</Text> : null}
              {review.artistResponse ? (
                <View style={styles.artistResponseBox}>
                  <Text style={styles.artistResponseLabel}>Artist's response:</Text>
                  <Text style={styles.artistResponseText}>{review.artistResponse}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </>
      )}

      {/* Similar Artists */}
      {similar.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Similar Artists</Text>
          {similar.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.similarCard}
              onPress={() => navigation.navigate('ArtistDetail', { artistId: a.id })}
            >
              <Text style={styles.similarName}>{a.user.firstName} {a.user.lastName}</Text>
              <Text style={styles.similarSub}>{a.city} · {a.styles.slice(0, 2).join(', ')}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  location: { color: '#666', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  starRow: { flexDirection: 'row' },
  star: { fontSize: 16, color: '#ddd' },
  starActive: { color: '#f59e0b' },
  ratingText: { color: '#555', fontSize: 13 },
  bio: { fontSize: 15, lineHeight: 22, color: '#333', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, marginTop: 8, color: '#111' },
  styleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { backgroundColor: '#f0f0ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  chipText: { color: '#6366f1', fontSize: 13 },
  portfolioRow: { marginBottom: 16 },
  portfolioImage: { width: 120, height: 120, borderRadius: 10, marginRight: 10 },
  arBtn: { backgroundColor: '#f0f0ff', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#c7c9f5' },
  arBtnText: { color: '#6366f1', fontWeight: '600', fontSize: 15 },
  bookButton: { backgroundColor: '#6366f1', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20 },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  residencyCard: { backgroundColor: '#f0fff4', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#bbf7d0' },
  residencyStudio: { fontWeight: '700', fontSize: 15, color: '#065f46' },
  residencyLocation: { color: '#555', fontSize: 13, marginTop: 2 },
  residencyDates: { color: '#888', fontSize: 12, marginTop: 2 },
  residencyAnnouncement: { color: '#374151', fontSize: 13, marginTop: 6, fontStyle: 'italic' },
  reviewCard: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reviewerName: { fontWeight: '600', color: '#333', fontSize: 14 },
  reviewContent: { color: '#555', lineHeight: 20, fontSize: 14 },
  artistResponseBox: { backgroundColor: '#f0f0ff', borderRadius: 8, padding: 10, marginTop: 8 },
  artistResponseLabel: { fontWeight: '600', color: '#6366f1', fontSize: 12, marginBottom: 4 },
  artistResponseText: { color: '#555', fontSize: 13 },
  similarCard: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  similarName: { fontSize: 15, fontWeight: '600', color: '#111' },
  similarSub: { color: '#888', fontSize: 13, marginTop: 2 },
});
