// Routine Service - CRUD for Saved Workout Routines
// A routine is a saved group of workouts with a custom name (e.g., "Upper Body A")
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { saveSecure, getSecure } from './SecureStorageService';
import { db } from '../config/firebase';
import * as Crypto from 'expo-crypto';
import Logger from './LoggerService';

const STORAGE_KEY_PREFIX = '@MuscleHamster:savedRoutines';

// Get user-specific storage key
const getStorageKey = () => {
  if (currentUserId) {
    return `${STORAGE_KEY_PREFIX}:${currentUserId}`;
  }
  return STORAGE_KEY_PREFIX;
};

// Current user ID (set by context)
let currentUserId = null;

// In-memory cache
let cachedData = null;

// Set the current user ID
export const setRoutineUserId = (userId) => {
  if (currentUserId !== userId) {
    currentUserId = userId;
    cachedData = null;
  }
};

// Generate unique ID
const generateId = () => {
  return `routine-${Date.now()}-${Crypto.randomUUID().substring(0, 8)}`;
};

// Default data structure
const createDefaultData = () => ({
  routines: [],
});

// Load data from Firestore or SecureStorage
const loadData = async () => {
  if (cachedData) return cachedData;

  Logger.debug('Loading saved routines, userId:', currentUserId);

  try {
    // Try Firestore first if user is logged in
    if (currentUserId) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 5000)
      );

      const docRef = doc(db, 'savedRoutines', currentUserId);
      const docSnap = await Promise.race([getDoc(docRef), timeoutPromise]);

      if (docSnap.exists()) {
        cachedData = docSnap.data();
        Logger.debug('Loaded saved routines from Firestore:', cachedData.routines?.length || 0);
        return cachedData;
      } else {
        Logger.debug('No saved routines in Firestore');
      }
    }

    // Fallback to SecureStorage
    const stored = await getSecure(getStorageKey());
    if (stored) {
      cachedData = stored;
      Logger.debug('Loaded saved routines from SecureStorage');

      // Migrate to Firestore if user is logged in
      if (currentUserId && cachedData) {
        const docRef = doc(db, 'savedRoutines', currentUserId);
        setDoc(docRef, cachedData).catch(e => Logger.warn('Routine migration failed:', e));
      }
    } else {
      Logger.debug('No stored routines, using defaults');
      cachedData = createDefaultData();
    }
  } catch (e) {
    const isTimeout = e.message === 'Firestore timeout';
    if (isTimeout) {
      Logger.warn('Firestore request timed out, using default data');
    } else {
      Logger.warn('Failed to load saved routines:', e.message);
    }
    cachedData = createDefaultData();
  }

  return cachedData;
};

// Save data to Firestore and cache
const saveData = async (data) => {
  cachedData = data;

  try {
    if (currentUserId) {
      const docRef = doc(db, 'savedRoutines', currentUserId);
      await setDoc(docRef, data);
      Logger.debug('Saved routines to Firestore');
    } else {
      // Fallback to SecureStorage if not logged in
      await saveSecure(getStorageKey(), data);
    }
  } catch (e) {
    Logger.warn('Failed to save routines:', e);
    // Fallback to SecureStorage
    try {
      await saveSecure(getStorageKey(), data);
    } catch (localError) {
      Logger.warn('Local save also failed:', localError);
    }
  }
};

// Free tier limit
const FREE_ROUTINE_LIMIT = 3;

export const RoutineService = {
  // Get all saved routines
  async getRoutines() {
    const data = await loadData();
    return [...(data.routines || [])];
  },

  // Get a single routine by ID
  async getRoutine(routineId) {
    const data = await loadData();
    return data.routines.find(r => r.id === routineId) || null;
  },

  // Check if user can create more routines (free tier limit)
  async canCreateRoutine() {
    const data = await loadData();
    // TODO: Check if user has premium subscription
    const isPremium = false; // Will be updated when subscription is implemented
    if (isPremium) return { canCreate: true };

    const currentCount = data.routines?.length || 0;
    return {
      canCreate: currentCount < FREE_ROUTINE_LIMIT,
      currentCount,
      limit: FREE_ROUTINE_LIMIT,
      isPremium,
    };
  },

  // Create a new routine
  async createRoutine({ name, workouts }) {
    const data = await loadData();
    const now = new Date().toISOString();

    // Check free tier limit
    const { canCreate, currentCount, limit } = await this.canCreateRoutine();
    if (!canCreate) {
      return {
        success: false,
        error: 'limit-reached',
        message: `You've reached the free limit of ${limit} routines. Upgrade to Premium for unlimited routines!`,
      };
    }

    // Validate inputs
    if (!name || !name.trim()) {
      return { success: false, error: 'Name is required' };
    }
    if (!workouts || workouts.length === 0) {
      return { success: false, error: 'At least one workout is required' };
    }

    const newRoutine = {
      id: generateId(),
      name: name.trim(),
      workouts: workouts.map(w => ({
        workoutId: w.workoutId,
        workoutType: w.workoutType || 'gym',
        workoutName: w.workoutName,
      })),
      createdAt: now,
      lastUsedAt: null,
      usageCount: 0,
    };

    const updatedData = {
      ...data,
      routines: [newRoutine, ...(data.routines || [])],
    };

    await saveData(updatedData);

    return {
      success: true,
      routine: newRoutine,
    };
  },

  // Update an existing routine
  async updateRoutine(routineId, updates) {
    const data = await loadData();
    const routineIndex = data.routines.findIndex(r => r.id === routineId);

    if (routineIndex === -1) {
      return { success: false, error: 'Routine not found' };
    }

    const updatedRoutine = {
      ...data.routines[routineIndex],
      ...updates,
      id: routineId, // Ensure ID can't be changed
    };

    // If workouts are updated, normalize them
    if (updates.workouts) {
      updatedRoutine.workouts = updates.workouts.map(w => ({
        workoutId: w.workoutId,
        workoutType: w.workoutType || 'gym',
        workoutName: w.workoutName,
      }));
    }

    const updatedRoutines = [...data.routines];
    updatedRoutines[routineIndex] = updatedRoutine;

    const updatedData = {
      ...data,
      routines: updatedRoutines,
    };

    await saveData(updatedData);

    return {
      success: true,
      routine: updatedRoutine,
    };
  },

  // Record that a routine was used (for sorting by recent usage)
  async recordUsage(routineId) {
    const data = await loadData();
    const routineIndex = data.routines.findIndex(r => r.id === routineId);

    if (routineIndex === -1) {
      return { success: false, error: 'Routine not found' };
    }

    const now = new Date().toISOString();
    const updatedRoutines = [...data.routines];
    updatedRoutines[routineIndex] = {
      ...updatedRoutines[routineIndex],
      lastUsedAt: now,
      usageCount: (updatedRoutines[routineIndex].usageCount || 0) + 1,
    };

    const updatedData = {
      ...data,
      routines: updatedRoutines,
    };

    await saveData(updatedData);

    return { success: true };
  },

  // Delete a routine
  async deleteRoutine(routineId) {
    const data = await loadData();
    const routineExists = data.routines.some(r => r.id === routineId);

    if (!routineExists) {
      return { success: false, error: 'Routine not found' };
    }

    const updatedData = {
      ...data,
      routines: data.routines.filter(r => r.id !== routineId),
    };

    await saveData(updatedData);

    return { success: true };
  },

  // Clear cache (for logout)
  clearCache() {
    cachedData = null;
  },

  // Get free tier info
  getFreeTierLimit() {
    return FREE_ROUTINE_LIMIT;
  },
};

export default RoutineService;
