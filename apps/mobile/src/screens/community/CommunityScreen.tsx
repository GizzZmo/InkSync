import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../services/apiClient';
import { t } from '../../i18n';

type BlogPost = {
  id: string;
  title: string;
  summary?: string;
  tags: string[];
  publishedAt: string;
  author: { id: string; user: { firstName: string; lastName: string } };
};

type Event = {
  id: string;
  title: string;
  city: string;
  country: string;
  eventType: string;
  startDate: string;
  endDate: string;
};

type ApprenticeshipListing = {
  id: string;
  title: string;
  city: string;
  country: string;
  duration?: string;
  isPaid: boolean;
  artist: { id: string; user: { firstName: string; lastName: string } };
};

type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  tags: string[];
  _count: { lessons: number; enrollments: number };
  instructor: { id: string; user: { firstName: string; lastName: string } };
};

type Tab = 'blog' | 'events' | 'apprenticeships' | 'academy';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function CommunityScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('blog');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [apprenticeships, setApprenticeships] = useState<ApprenticeshipListing[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTab = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      if (tab === 'blog') {
        const res = await apiClient.get('/community/blog');
        setBlogPosts(res.data.posts ?? []);
      } else if (tab === 'events') {
        const res = await apiClient.get('/community/events', { params: { upcoming: true } });
        setEvents(res.data.events ?? []);
      } else if (tab === 'apprenticeships') {
        const res = await apiClient.get('/community/apprenticeships');
        setApprenticeships(res.data.listings ?? []);
      } else if (tab === 'academy') {
        const res = await apiClient.get('/community/academy/courses');
        setCourses(res.data.courses ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTab(activeTab); }, [activeTab, fetchTab]);

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'blog', label: t('community.blog') },
    { key: 'events', label: t('community.events') },
    { key: 'apprenticeships', label: t('community.apprenticeships') },
    { key: 'academy', label: 'Academy' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('nav.community')}</Text>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <>
          {activeTab === 'blog' && (
            <FlatList
              data={blogPosts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('BlogPost', { postId: item.id })}
                >
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.summary ? <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text> : null}
                  <Text style={styles.cardMeta}>
                    {item.author.user.firstName} {item.author.user.lastName}
                    {' · '}{new Date(item.publishedAt).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.empty}>{t('common.noResults')}</Text>}
            />
          )}

          {activeTab === 'events' && (
            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
                >
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMeta}>{item.city}, {item.country}</Text>
                  <Text style={styles.cardMeta}>
                    {new Date(item.startDate).toLocaleDateString()} – {new Date(item.endDate).toLocaleDateString()}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.eventType}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.empty}>{t('common.noResults')}</Text>}
            />
          )}

          {activeTab === 'apprenticeships' && (
            <FlatList
              data={apprenticeships}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.card}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMeta}>
                    {item.artist.user.firstName} {item.artist.user.lastName} · {item.city}
                  </Text>
                  {item.duration ? <Text style={styles.cardSummary}>{item.duration}</Text> : null}
                  <View style={[styles.badge, item.isPaid && styles.badgePaid]}>
                    <Text style={styles.badgeText}>{item.isPaid ? 'Paid' : 'Unpaid'}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.empty}>{t('common.noResults')}</Text>}
            />
          )}

          {activeTab === 'academy' && (
            <FlatList
              data={courses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
                >
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSummary} numberOfLines={2}>{item.description}</Text>
                  <Text style={styles.cardMeta}>
                    {item.instructor.user.firstName} {item.instructor.user.lastName}
                    {' · '}{item._count.lessons} {t('community.lessons')}
                    {' · '}{item._count.enrollments} enrolled
                  </Text>
                  <Text style={styles.price}>
                    {item.isFree ? t('community.free') : `$${Number(item.price).toFixed(2)}`}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.empty}>{t('common.noResults')}</Text>}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  tabBar: { flexDirection: 'row', marginBottom: 16 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#ddd', marginRight: 8,
  },
  tabActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  tabText: { fontSize: 13, color: '#555' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#eee',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cardSummary: { fontSize: 13, color: '#555', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#888' },
  badge: {
    alignSelf: 'flex-start', backgroundColor: '#e0e7ff',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 6,
  },
  badgePaid: { backgroundColor: '#dcfce7' },
  badgeText: { fontSize: 11, color: '#4338ca', fontWeight: '600' },
  price: { fontSize: 14, fontWeight: '700', color: '#6366f1', marginTop: 6 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
