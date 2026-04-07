import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRepCounter } from '../hooks/useRepCounter';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

export default function RepCounter({ targetReps, onComplete }) {
  const { repCount, isActive, startCounting, stopCounting, resetCount } = useRepCounter();

  useEffect(() => {
    if (repCount > 0 && repCount >= targetReps) {
      Vibration.vibrate([0, 100, 50, 100]);
      stopCounting();
      onComplete && onComplete(repCount);
    }
  }, [repCount, targetReps]);

  const progress = Math.min(repCount / targetReps, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rep Counter</Text>

      <View style={styles.countCircle}>
        <Text style={styles.countText}>{repCount}</Text>
        <Text style={styles.targetText}>/ {targetReps}</Text>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.hint}>
        {isActive
          ? 'Move your phone with each rep...'
          : 'Press start and perform your reps'}
      </Text>

      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={startCounting} activeOpacity={0.8}>
            <Ionicons name="play" size={20} color={colors.textPrimary} />
            <Text style={styles.primaryBtnText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={stopCounting} activeOpacity={0.8}>
            <Ionicons name="stop" size={20} color={colors.textPrimary} />
            <Text style={styles.primaryBtnText}>Stop</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.resetBtn} onPress={resetCount} activeOpacity={0.8}>
          <Ionicons name="refresh" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  countCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  countText: {
    color: colors.textPrimary,
    fontSize: fontSizes.xxxl,
    fontWeight: '800',
  },
  targetText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  primaryBtnText: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  resetBtn: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
});
