// Daily Exercise Service
// Persists the user's cycle state (which exercises have been shown) so the
// daily check-in rotates through every exercise in the pool before repeating.

import AsyncStorage from '@react-native-async-storage/async-storage';
import Logger from './LoggerService';
import { pickExerciseForDate, getLocalDateKey } from '../models/DailyExercise';

const STORAGE_KEY_PREFIX = '@muscle_hamster_daily_exercise_state';

const storageKey = (userId) => `${STORAGE_KEY_PREFIX}_${userId || 'guest'}`;

const loadState = async (userId) => {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return { shownIds: [], lastAssignment: null };
    const parsed = JSON.parse(raw);
    return {
      shownIds: Array.isArray(parsed.shownIds) ? parsed.shownIds : [],
      lastAssignment: parsed.lastAssignment || null,
    };
  } catch (err) {
    Logger.warn('[DailyExerciseService] Failed to load state:', err);
    return { shownIds: [], lastAssignment: null };
  }
};

const saveState = async (userId, state) => {
  try {
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch (err) {
    Logger.warn('[DailyExerciseService] Failed to save state:', err);
  }
};

export const getTodaysExercise = async (userId) => {
  const dateKey = getLocalDateKey();
  const state = await loadState(userId);
  const { exercise, nextState } = pickExerciseForDate({ userId, dateKey, state });
  if (nextState !== state) {
    await saveState(userId, nextState);
  }
  return exercise;
};
