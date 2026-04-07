import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getWorkoutHistory } from '../services/storageService';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';
import { formatDate, formatDuration } from '../utils/formatters';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getWorkoutHistory().then(setHistory);
    }, [])
  );

  function renderSession({ item }) {
    const completionRate = item.exercises.reduce((acc, ex) => acc + ex.setsCompleted, 0) /
      item.exercises.reduce((acc, ex) => acc + ex.totalSets, 0);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{item.dayFocus} Day</Text>
            <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={12} color={colors.primary} />
            <Text style={styles.durationText}>{formatDuration(item.durationSeconds)}</Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${completionRate * 100}%` }]} />
        </View>
        <Text style={styles.completionText}>{Math.round(completionRate * 100)}% completed</Text>

        <View style={styles.exerciseList}>
          {item.exercises.map((ex, i) => (
            <View key={i} style={styles.exerciseRow}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseSets}>{ex.setsCompleted}/{ex.totalSets} sets</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={56} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptySubtext}>Complete your first workout to see it here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={history}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderSession}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.pageTitle}>Workout History</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  pageTitle: { color: colors.textPrimary, fontSize: fontSizes.xxl, fontWeight: '700', marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardTitle: { color: colors.textPrimary, fontSize: fontSizes.md, fontWeight: '700' },
  cardDate: { color: colors.textSecondary, fontSize: fontSizes.sm, marginTop: 2 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  durationText: { color: colors.primary, fontSize: fontSizes.xs, fontWeight: '600' },
  progressBarBg: { height: 4, backgroundColor: colors.surfaceElevated, borderRadius: 2, marginBottom: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.success, borderRadius: 2 },
  completionText: { color: colors.textSecondary, fontSize: fontSizes.xs, marginBottom: spacing.sm },
  exerciseList: { gap: 4 },
  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between' },
  exerciseName: { color: colors.textSecondary, fontSize: fontSizes.sm },
  exerciseSets: { color: colors.textMuted, fontSize: fontSizes.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emptyTitle: { color: colors.textPrimary, fontSize: fontSizes.xl, fontWeight: '700' },
  emptySubtext: { color: colors.textSecondary, fontSize: fontSizes.md, textAlign: 'center' },
});
