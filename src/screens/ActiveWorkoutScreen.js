import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RepCounter from '../components/RepCounter';
import ExerciseCameraView from '../components/CameraView';
import { saveCompletedWorkout } from '../services/storageService';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';
import { formatDuration } from '../utils/formatters';

export default function ActiveWorkoutScreen({ route, navigation }) {
  const { exercise, dayPlan } = route.params;
  const exercises = dayPlan.exercises;
  const [currentIndex, setCurrentIndex] = useState(exercises.findIndex((e) => e.name === exercise.name) || 0);
  const [completedSets, setCompletedSets] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restRemaining, setRestRemaining] = useState(0);
  const timerRef = useRef(null);
  const restTimerRef = useRef(null);

  const currentExercise = exercises[currentIndex];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (isResting && restRemaining > 0) {
      restTimerRef.current = setTimeout(() => setRestRemaining((r) => r - 1), 1000);
    } else if (isResting && restRemaining === 0) {
      setIsResting(false);
    }
    return () => clearTimeout(restTimerRef.current);
  }, [isResting, restRemaining]);

  function markSetComplete(exerciseName, setIndex) {
    setCompletedSets((prev) => {
      const sets = prev[exerciseName] || [];
      return { ...prev, [exerciseName]: [...sets, setIndex] };
    });
    setIsResting(true);
    setRestRemaining(currentExercise.restSeconds);
  }

  function isSetComplete(exerciseName, setIndex) {
    return (completedSets[exerciseName] || []).includes(setIndex);
  }

  function getTotalCompletedSets() {
    return Object.values(completedSets).reduce((acc, sets) => acc + sets.length, 0);
  }

  function getTotalSets() {
    return exercises.reduce((acc, ex) => acc + ex.sets, 0);
  }

  async function finishWorkout() {
    clearInterval(timerRef.current);
    const session = {
      date: new Date().toISOString(),
      dayFocus: dayPlan.focus,
      durationSeconds: elapsedSeconds,
      exercises: exercises.map((ex) => ({
        name: ex.name,
        setsCompleted: (completedSets[ex.name] || []).length,
        totalSets: ex.sets,
      })),
    };
    await saveCompletedWorkout(session);
    Alert.alert('Workout Complete!', `Great job! You trained for ${formatDuration(elapsedSeconds)}.`, [
      { text: 'Done', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.timerBox}>
          <Ionicons name="time-outline" size={14} color={colors.primary} />
          <Text style={styles.timerText}>{formatDuration(elapsedSeconds)}</Text>
        </View>
        <View style={styles.progressText}>
          <Text style={styles.progressLabel}>{getTotalCompletedSets()}/{getTotalSets()} sets</Text>
        </View>
      </View>

      {isResting && (
        <View style={styles.restBanner}>
          <Ionicons name="hourglass-outline" size={18} color={colors.warning} />
          <Text style={styles.restText}>Rest: {restRemaining}s</Text>
          <TouchableOpacity onPress={() => setIsResting(false)}>
            <Text style={styles.skipRest}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.exerciseNav}>
          {exercises.map((ex, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.navDot, currentIndex === i && styles.navDotActive]}
              onPress={() => setCurrentIndex(i)}
            />
          ))}
        </View>

        <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        <Text style={styles.setsReps}>{currentExercise.sets} sets × {currentExercise.reps} reps</Text>
        <Text style={styles.instructions}>{currentExercise.instructions}</Text>

        <View style={styles.setsGrid}>
          {Array.from({ length: currentExercise.sets }, (_, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.setBtn, isSetComplete(currentExercise.name, i) && styles.setBtnDone]}
              onPress={() => !isSetComplete(currentExercise.name, i) && markSetComplete(currentExercise.name, i)}
              activeOpacity={0.8}
            >
              {isSetComplete(currentExercise.name, i) ? (
                <Ionicons name="checkmark" size={20} color={colors.textPrimary} />
              ) : (
                <Text style={styles.setBtnText}>Set {i + 1}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <RepCounter
          targetReps={currentExercise.reps}
          onComplete={(count) => markSetComplete(currentExercise.name, (completedSets[currentExercise.name] || []).length)}
        />

        <TouchableOpacity style={styles.cameraBtn} onPress={() => setShowCamera(true)} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={18} color={colors.primary} />
          <Text style={styles.cameraBtnText}>Check My Form</Text>
        </TouchableOpacity>

        <View style={styles.exerciseNavBtns}>
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentIndex(currentIndex - 1)}>
              <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
              <Text style={styles.navBtnText}>Previous</Text>
            </TouchableOpacity>
          )}
          {currentIndex < exercises.length - 1 ? (
            <TouchableOpacity style={[styles.navBtn, styles.navBtnNext]} onPress={() => setCurrentIndex(currentIndex + 1)}>
              <Text style={styles.navBtnNextText}>Next Exercise</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishBtn} onPress={finishWorkout} activeOpacity={0.8}>
              <Ionicons name="checkmark-circle" size={20} color={colors.textPrimary} />
              <Text style={styles.finishBtnText}>Finish Workout</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Modal visible={showCamera} animationType="slide" onRequestClose={() => setShowCamera(false)}>
        <ExerciseCameraView onClose={() => setShowCamera(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: { padding: spacing.xs },
  timerBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  timerText: { color: colors.primary, fontSize: fontSizes.sm, fontWeight: '700' },
  progressText: {},
  progressLabel: { color: colors.textSecondary, fontSize: fontSizes.sm },
  restBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warning + '22',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning + '44',
  },
  restText: { color: colors.warning, fontSize: fontSizes.md, fontWeight: '700' },
  skipRest: { color: colors.warning, fontSize: fontSizes.sm, textDecorationLine: 'underline' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  exerciseNav: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', marginBottom: spacing.lg },
  navDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  navDotActive: { backgroundColor: colors.primary, width: 24 },
  exerciseName: { color: colors.textPrimary, fontSize: fontSizes.xxl, fontWeight: '800', marginBottom: spacing.xs },
  setsReps: { color: colors.primary, fontSize: fontSizes.md, fontWeight: '600', marginBottom: spacing.md },
  instructions: { color: colors.textSecondary, fontSize: fontSizes.md, lineHeight: 22, marginBottom: spacing.lg },
  setsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  setBtn: {
    flex: 1,
    minWidth: 80,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  setBtnDone: { backgroundColor: colors.success, borderColor: colors.success },
  setBtnText: { color: colors.textSecondary, fontSize: fontSizes.sm, fontWeight: '600' },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '55',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  cameraBtnText: { color: colors.primary, fontSize: fontSizes.md, fontWeight: '600' },
  exerciseNavBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  navBtnText: { color: colors.textSecondary, fontSize: fontSizes.md, fontWeight: '600' },
  navBtnNext: { backgroundColor: colors.surfaceElevated, borderColor: colors.primary },
  navBtnNextText: { color: colors.primary, fontSize: fontSizes.md, fontWeight: '600' },
  finishBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  finishBtnText: { color: colors.textPrimary, fontSize: fontSizes.md, fontWeight: '700' },
});
