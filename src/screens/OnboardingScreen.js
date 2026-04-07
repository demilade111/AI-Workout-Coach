import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveUserProfile } from '../services/storageService';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

const STEPS = ['basics', 'goal', 'equipment', 'schedule'];

const GOALS = [
  { key: 'lose_weight', label: 'Lose Weight', icon: 'trending-down-outline' },
  { key: 'build_muscle', label: 'Build Muscle', icon: 'barbell-outline' },
  { key: 'improve_endurance', label: 'Endurance', icon: 'pulse-outline' },
  { key: 'stay_active', label: 'Stay Active', icon: 'walk-outline' },
];

const LEVELS = [
  { key: 'beginner', label: 'Beginner', desc: 'Less than 6 months' },
  { key: 'intermediate', label: 'Intermediate', desc: '6 months – 2 years' },
  { key: 'advanced', label: 'Advanced', desc: '2+ years' },
];

const EQUIPMENT_OPTIONS = [
  'No Equipment', 'Dumbbells', 'Barbell', 'Resistance Bands',
  'Pull-up Bar', 'Kettlebell', 'Full Gym',
];

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    fitnessLevel: '',
    goal: '',
    equipment: [],
    daysPerWeek: 3,
    limitations: '',
  });

  function update(key, value) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function toggleEquipment(item) {
    setProfile((prev) => {
      const eq = prev.equipment.includes(item)
        ? prev.equipment.filter((e) => e !== item)
        : [...prev.equipment, item];
      return { ...prev, equipment: eq };
    });
  }

  async function finish() {
    await saveUserProfile(profile);
    navigation.replace('Main');
  }

  function nextStep() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  }

  function prevStep() {
    if (step > 0) setStep(step - 1);
  }

  const canProceed = () => {
    if (step === 0) return profile.name.trim().length > 0 && profile.age.trim().length > 0 && profile.fitnessLevel;
    if (step === 1) return profile.goal;
    if (step === 2) return profile.equipment.length > 0;
    return true;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.progressRow}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
            ))}
          </View>

          {step === 0 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Let's get started</Text>
              <Text style={styles.stepSubtitle}>Tell us a little about yourself</Text>

              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Alex"
                placeholderTextColor={colors.textMuted}
                value={profile.name}
                onChangeText={(v) => update('name', v)}
              />

              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 24"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                value={profile.age}
                onChangeText={(v) => update('age', v)}
              />

              <Text style={styles.inputLabel}>Fitness Level</Text>
              {LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.key}
                  style={[styles.optionCard, profile.fitnessLevel === level.key && styles.optionCardSelected]}
                  onPress={() => update('fitnessLevel', level.key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionLabel}>{level.label}</Text>
                  <Text style={styles.optionDesc}>{level.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>What's your goal?</Text>
              <Text style={styles.stepSubtitle}>We'll tailor your plan around this</Text>

              {GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.key}
                  style={[styles.goalCard, profile.goal === goal.key && styles.optionCardSelected]}
                  onPress={() => update('goal', goal.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={goal.icon} size={28} color={profile.goal === goal.key ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.goalLabel, profile.goal === goal.key && { color: colors.primary }]}>{goal.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Available equipment?</Text>
              <Text style={styles.stepSubtitle}>Select everything you have access to</Text>

              <View style={styles.equipGrid}>
                {EQUIPMENT_OPTIONS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.equipChip, profile.equipment.includes(item) && styles.equipChipSelected]}
                    onPress={() => toggleEquipment(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.equipText, profile.equipment.includes(item) && styles.equipTextSelected]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Schedule</Text>
              <Text style={styles.stepSubtitle}>How many days can you train per week?</Text>

              <View style={styles.daysRow}>
                {[2, 3, 4, 5, 6].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dayBtn, profile.daysPerWeek === d && styles.dayBtnSelected]}
                    onPress={() => update('daysPerWeek', d)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dayBtnText, profile.daysPerWeek === d && styles.dayBtnTextSelected]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Any injuries or limitations? (optional)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="e.g. knee pain, lower back issues..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={profile.limitations}
                onChangeText={(v) => update('limitations', v)}
              />
            </View>
          )}

          <View style={styles.navRow}>
            {step > 0 && (
              <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
                <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
              onPress={nextStep}
              disabled={!canProceed()}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>{step === STEPS.length - 1 ? 'Get My Plan' : 'Continue'}</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  progressRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xl },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  progressDotActive: { backgroundColor: colors.primary },
  stepContainer: { marginBottom: spacing.xl },
  stepTitle: { color: colors.textPrimary, fontSize: fontSizes.xxl, fontWeight: '700', marginBottom: spacing.xs },
  stepSubtitle: { color: colors.textSecondary, fontSize: fontSizes.md, marginBottom: spacing.lg },
  inputLabel: { color: colors.textSecondary, fontSize: fontSizes.sm, fontWeight: '500', marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionCardSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  optionLabel: { color: colors.textPrimary, fontSize: fontSizes.md, fontWeight: '600' },
  optionDesc: { color: colors.textSecondary, fontSize: fontSizes.sm, marginTop: 2 },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  goalLabel: { color: colors.textPrimary, fontSize: fontSizes.lg, fontWeight: '600' },
  equipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  equipChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  equipChipSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
  equipText: { color: colors.textSecondary, fontSize: fontSizes.sm },
  equipTextSelected: { color: colors.primary, fontWeight: '600' },
  daysRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  dayBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  dayBtnSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  dayBtnText: { color: colors.textSecondary, fontSize: fontSizes.lg, fontWeight: '700' },
  dayBtnTextSelected: { color: colors.textPrimary },
  navRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, alignItems: 'center' },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: colors.textPrimary, fontSize: fontSizes.md, fontWeight: '700' },
});
