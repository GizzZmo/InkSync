import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { apiClient } from '../../services/apiClient';
import { t } from '../../i18n';

type DataExportRequest = {
  id: string;
  status: string;
  requestedAt: string;
  downloadUrl?: string;
};

type ArtistBadge = {
  id: string;
  badgeType: string;
  status: string;
  issuedAt?: string;
};

type Props = {
  artistId?: string; // present if the user is an artist
  onAccountDeleted: () => void;
};

const BADGE_TYPES = [
  'VERIFIED_ARTIST',
  'SAFETY_TRAINED',
  'TOP_RATED',
];

export default function GovernanceScreen({ artistId, onAccountDeleted }: Props) {
  const [exports, setExports] = useState<DataExportRequest[]>([]);
  const [badges, setBadges] = useState<ArtistBadge[]>([]);
  const [loadingExports, setLoadingExports] = useState(true);
  const [requestingExport, setRequestingExport] = useState(false);
  const [requestingBadge, setRequestingBadge] = useState(false);

  useEffect(() => {
    fetchExports();
    if (artistId) fetchBadges();
  }, [artistId]);

  const fetchExports = async () => {
    setLoadingExports(true);
    try {
      const res = await apiClient.get('/governance/gdpr/exports');
      setExports(res.data.data ?? []);
    } catch {
      // ignore
    } finally {
      setLoadingExports(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const res = await apiClient.get(`/governance/badges/artist/${artistId}`);
      setBadges(res.data.data ?? []);
    } catch {
      // ignore
    }
  };

  const handleRequestExport = async () => {
    setRequestingExport(true);
    try {
      await apiClient.post('/governance/gdpr/export');
      Alert.alert(t('common.success'), t('governance.dataExportRequested'));
      fetchExports();
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.response?.data?.error ?? t('common.error'));
    } finally {
      setRequestingExport(false);
    }
  };

  const handleRequestBadge = async (badgeType: string) => {
    setRequestingBadge(true);
    try {
      await apiClient.post('/governance/badges/request', { badgeType });
      Alert.alert(t('common.success'), t('governance.badgePending'));
      fetchBadges();
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.response?.data?.error ?? t('common.error'));
    } finally {
      setRequestingBadge(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccount'),
      t('governance.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete('/governance/gdpr/account');
              Alert.alert(t('common.success'), t('governance.accountDeleted'));
              onAccountDeleted();
            } catch {
              Alert.alert(t('common.error'));
            }
          },
        },
      ]
    );
  };

  const statusColor: Record<string, string> = {
    REQUESTED: '#f59e0b',
    PROCESSING: '#3b82f6',
    READY: '#10b981',
    DOWNLOADED: '#6b7280',
    EXPIRED: '#ef4444',
    APPROVED: '#10b981',
    PENDING: '#f59e0b',
    REJECTED: '#ef4444',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Artist Badge Verification */}
      {artistId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.badges')}</Text>

          {BADGE_TYPES.map((badgeType) => {
            const existing = badges.find((b) => b.badgeType === badgeType);
            return (
              <View key={badgeType} style={styles.badgeRow}>
                <View>
                  <Text style={styles.badgeName}>{badgeType.replace(/_/g, ' ')}</Text>
                  {existing && (
                    <Text style={[styles.badgeStatus, { color: statusColor[existing.status] ?? '#666' }]}>
                      {existing.status}
                    </Text>
                  )}
                </View>
                {!existing && (
                  <TouchableOpacity
                    style={styles.requestBtn}
                    onPress={() => handleRequestBadge(badgeType)}
                    disabled={requestingBadge}
                  >
                    <Text style={styles.requestBtnText}>{t('governance.requestVerification')}</Text>
                  </TouchableOpacity>
                )}
                {existing?.status === 'APPROVED' && (
                  <Text style={styles.verifiedCheck}>✓ {t('governance.badgeApproved')}</Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Data Export */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.dataExport')}</Text>
        <Text style={styles.helpText}>
          Request a copy of all your personal data stored in InkSync (GDPR Article 20).
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleRequestExport}
          disabled={requestingExport}
        >
          {requestingExport ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>{t('governance.requestDataExport')}</Text>
          )}
        </TouchableOpacity>

        {loadingExports ? (
          <ActivityIndicator style={{ marginTop: 12 }} />
        ) : (
          exports.map((ex) => (
            <View key={ex.id} style={styles.exportRow}>
              <Text style={styles.exportDate}>
                {new Date(ex.requestedAt).toLocaleDateString()}
              </Text>
              <Text style={[styles.exportStatus, { color: statusColor[ex.status] ?? '#666' }]}>
                {ex.status}
              </Text>
              {ex.downloadUrl && (
                <TouchableOpacity>
                  <Text style={styles.downloadLink}>Download</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

      {/* Account Deletion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.deleteAccount')}</Text>
        <Text style={styles.helpText}>
          Permanently delete your account and anonymize your personal data (GDPR Article 17).
        </Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccount}>
          <Text style={styles.dangerBtnText}>{t('profile.deleteAccount')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  section: {
    margin: 16, padding: 16, backgroundColor: '#f9f9f9',
    borderRadius: 12, borderWidth: 1, borderColor: '#eee',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  helpText: { fontSize: 13, color: '#666', marginBottom: 12 },
  badgeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  badgeName: { fontSize: 14, fontWeight: '600', color: '#333' },
  badgeStatus: { fontSize: 12, marginTop: 2 },
  requestBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: '#6366f1',
  },
  requestBtnText: { fontSize: 12, color: '#6366f1', fontWeight: '600' },
  verifiedCheck: { fontSize: 13, color: '#10b981', fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#6366f1', borderRadius: 10, padding: 12,
    alignItems: 'center', marginBottom: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  exportRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  exportDate: { fontSize: 13, color: '#333' },
  exportStatus: { fontSize: 13, fontWeight: '600' },
  downloadLink: { fontSize: 13, color: '#6366f1', fontWeight: '600' },
  dangerBtn: {
    backgroundColor: '#fee2e2', borderRadius: 10, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5',
  },
  dangerBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 14 },
});
