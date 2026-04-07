import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile, getWorkoutPlan, saveWorkoutPlan, getWorkoutHistory } from '../services/storageService';
import { generateWorkoutPlan } from '../services/aiService';
import ExerciseCard from '../components/ExerciseCard';
import StatCard from '../components/StatCard';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';
import { formatDate } from '../utils/formatters';

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const [p, pl, h] = await Promise.all([getUserProfile(), getWorkoutPlan(), getWorkoutHistory()]);
    setProfile(p);
    setPlan(pl);
    setHistory(h);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleGeneratePlan() {
    if (!profile) return;
    setLoading(true);
    try {
      const newPlan = await generateWorkoutPlan(profile);
      await saveWorkoutPlan(newPlan);
      setPlan(newPlan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const currentDayPlan = plan?.weeklySchedule?.[activeDay];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hello, {profile?.name || 'Athlete'} 👋</Text>
            <Text style={styles.subGreeting}>Ready to crush it today?</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="flame-outline" label="Workouts" value={history.length} color={colors.accent} />
          <StatCard icon="calendar-outline" label="Days/week" value={profile?.daysPerWeek || '–'} color={colors.primary} />
          <StatCard icon="trophy-outline" label="Goal" value={profile?.goal?.replace('_', ' ') || '–'} color={colors.warning} />
        </View>

        {!plan ? (
          <View style={styles.emptyPlan}>
            <Ionicons name="sparkles-outline" size={52} color={colors.primary} />
            <Text style={styles.emptyTitle}>No plan yet</Text>
            <Text style={styles.emptySubtext}>Generate a personalized AI workout plan tailored to your goals.</Text>
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGeneratePlan}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color={colors.textPrimary} />
                  <Text style={styles.generateBtnText}>Generate My Plan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.planHeader}>
              <Text style={styles.sectionTitle}>{plan.planName}</Text>
              <TouchableOpacity onPress={handleGeneratePlan} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Ionicons name="refresh-outline" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabsScroll}>
              {plan.weeklySchedule.map((day, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayTab, activeDay === i && styles.dayTabActive]}
                  onPress={() => setActiveDay(i)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayTabText, activeDay === i && styles.dayTabTextActive]}>
                    {day.day}
                  </Text>
                  <Text style={[styles.dayTabFocus, activeDay === i && styles.dayTabFocusActive]}>
                    {day.focus}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {currentDayPlan && (
              <View style={styles.dayContent}>
                <View style={styles.dayMetaRow}>
                  <View style={styles.focusBadge}>
                    <Text style={styles.focusBadgeText}>{currentDayPlan.focus}</Text>
                  </View>
                  <Text style={styles.exerciseCount}>
                    {currentDayPlan.exercises.length} exercises · ~{plan.estimatedDurationMinutes} min
                  </Text>
                </View>

                {currentDayPlan.exercises.map((exercise, i) => (
                  <ExerciseCard
                    key={i}
                    exercise={exercise}
                    index={i}
                    onStartExercise={(ex) => navigation.navigate('ActiveWorkout', { exercise: ex, dayPlan: currentDayPlan })}
                  />
                ))}
              </View>
            )}

            {plan.tips && (
              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>
                  <Ionicons name="bulb-outline" size={16} color={colors.warning} /> Coach Tips
                </Text>
                {plan.tips.map((tip, i) => (
                  <Text key={i} style={styles.tip}>• {tip}</Text>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  greeting: { color: colors.textPrimary, fontSize: fontSizes.xxl, fontWeight: '700' },
  subGreeting: { color: colors.textSecondary, fontSize: fontSizes.md, marginTop: 2 },
  profileBtn: { padding: spacing.xs },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  emptyPlan: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  emptyTitle: { color: colors.textPrimary, fontSize: fontSizes.xl, fontWeight: '700' },
  emptySubtext: { color: colors.textSecondary, fontSize: fontSizes.md, textAlign: 'center' },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  generateBtnText: { color: colors.textPrimary, fontSize: fontSizes.md, fontWeight: '700' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { color: colors.textPrimary, fontSize: fontSizes.lg, fontWeight: '700' },
  dayTabsScroll: { marginBottom: spacing.md },
  dayTab: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    minWidth: 90,
  },
  dayTabActive: { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
  dayTabText: { color: colors.textSecondary, fontSize: fontSizes.sm, fontWeight: '600' },
  dayTabTextActive: { color: colors.primary },
  dayTabFocus: { color: colors.textMuted, fontSize: fontSizes.xs, marginTop: 2 },
  dayTabFocusActive: { color: colors.primary + 'AA' },
  dayContent: { marginBottom: spacing.lg },
  dayMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  focusBadge: { backgroundColor: colors.primary + '25', borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  focusBadgeText: { color: colors.primary, fontSize: fontSizes.xs, fontWeight: '600' },
  exerciseCount: { color: colors.textSecondary, fontSize: fontSizes.sm },
  tipsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    gap: spacing.xs,
  },
  tipsTitle: { color: colors.textPrimary, fontSize: fontSizes.md, fontWeight: '600', marginBottom: spacing.xs },
  tip: { color: colors.textSecondary, fontSize: fontSizes.sm, lineHeight: 20 },
});
