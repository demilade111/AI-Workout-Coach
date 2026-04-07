import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile, getWorkoutHistory, clearAllData } from '../services/storageService';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';
import { formatDuration, capitalizeFirst } from '../utils/formatters';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalTime: 0, avgDuration: 0 });

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  async function loadProfile() {
    const [p, history] = await Promise.all([getUserProfile(), getWorkoutHistory()]);
    setProfile(p);

    if (history.length > 0) {
      const totalTime = history.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
      setStats({
        totalWorkouts: history.length,
        totalTime,
        avgDuration: Math.round(totalTime / history.length),
      });
    }
  }

  function handleReset() {
    Alert.alert(
      'Reset All Data',
      'This will delete your profile, workout plan, and history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            navigation.replace('Onboarding');
          },
        },
      ]
    );
  }

  function InfoRow({ label, value }) {
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
          </View>
          <Text style={styles.name}>{profile?.name || 'Athlete'}</Text>
          <Text style={styles.level}>{capitalizeFirst(profile?.fitnessLevel || '')} Level</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatDuration(stats.totalTime)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatDuration(stats.avgDuration)}</Text>
            <Text style={styles.statLabel}>Avg Session</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Profile Details</Text>
        <View style={styles.card}>
          <InfoRow label="Age" value={profile?.age || '–'} />
          <InfoRow label="Goal" value={profile?.goal?.replace('_', ' ') || '–'} />
          <InfoRow label="Days / Week" value={`${profile?.daysPerWeek || '–'} days`} />
          <InfoRow label="Equipment" value={profile?.equipment?.join(', ') || '–'} />
          {profile?.limitations ? <InfoRow label="Limitations" value={profile.limitations} /> : null}
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('Onboarding')}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={styles.resetBtnText}>Reset All Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: colors.textPrimary, fontSize: fontSizes.xxxl, fontWeight: '700' },
  name: { color: colors.textPrimary, fontSize: fontSizes.xxl, fontWeight: '700' },
  level: { color: colors.textSecondary, fontSize: fontSizes.md, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.textPrimary, fontSize: fontSizes.xl, fontWeight: '700' },
  statLabel: { color: colors.textSecondary, fontSize: fontSizes.xs, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: spacing.sm },
  sectionTitle: { color: colors.textPrimary, fontSize: fontSizes.lg, fontWeight: '700', marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: colors.textSecondary, fontSize: fontSizes.sm },
  infoValue: { color: colors.textPrimary, fontSize: fontSizes.sm, fontWeight: '500', flex: 1, textAlign: 'right' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  editBtnText: { color: colors.primary, fontSize: fontSizes.md, fontWeight: '600' },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error + '55',
    paddingVertical: spacing.md,
  },
  resetBtnText: { color: colors.error, fontSize: fontSizes.md, fontWeight: '600' },
});
