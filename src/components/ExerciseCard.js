import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

export default function ExerciseCard({ exercise, index, onStartExercise }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.setsReps}>
            {exercise.sets} sets × {exercise.reps} reps
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.details}>
          <Text style={styles.instructions}>{exercise.instructions}</Text>

          <View style={styles.tagsRow}>
            {exercise.muscleGroups.map((muscle, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{muscle}</Text>
              </View>
            ))}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{exercise.restSeconds}s rest</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => onStartExercise(exercise)}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle" size={18} color={colors.textPrimary} />
            <Text style={styles.startBtnText}>Start Exercise</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  indexText: {
    color: colors.textPrimary,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  exerciseName: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  setsReps: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    marginTop: 2,
  },
  details: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  instructions: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagText: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  startBtnText: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
