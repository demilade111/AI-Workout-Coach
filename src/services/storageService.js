import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_PROFILE: '@ai_coach_user_profile',
  WORKOUT_PLAN: '@ai_coach_workout_plan',
  WORKOUT_HISTORY: '@ai_coach_workout_history',
  COMPLETED_WORKOUTS: '@ai_coach_completed_workouts',
};

export async function saveUserProfile(profile) {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function getUserProfile() {
  const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : null;
}

export async function saveWorkoutPlan(plan) {
  await AsyncStorage.setItem(KEYS.WORKOUT_PLAN, JSON.stringify(plan));
}

export async function getWorkoutPlan() {
  const data = await AsyncStorage.getItem(KEYS.WORKOUT_PLAN);
  return data ? JSON.parse(data) : null;
}

export async function saveCompletedWorkout(session) {
  const existing = await getWorkoutHistory();
  existing.unshift(session);
  const capped = existing.slice(0, 50);
  await AsyncStorage.setItem(KEYS.WORKOUT_HISTORY, JSON.stringify(capped));
}

export async function getWorkoutHistory() {
  const data = await AsyncStorage.getItem(KEYS.WORKOUT_HISTORY);
  return data ? JSON.parse(data) : [];
}

export async function clearAllData() {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
