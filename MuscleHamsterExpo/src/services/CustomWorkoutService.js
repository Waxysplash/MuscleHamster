// Custom Workout Service - CRUD + Progress Tracking for User-Created Workouts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { saveSecure, getSecure } from './SecureStorageService';
import { db } from '../config/firebase';

const STORAGE_KEY_PREFIX = '@MuscleHamster:customWorkouts';

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
export const setCustomWorkoutUserId = (userId) => {
  if (currentUserId !== userId) {
    currentUserId = userId;
    cachedData = null;
  }
};

// Generate unique ID
const generateId = () => {
  return `cw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Default data structure
const createDefaultData = () => ({
  customWorkouts: [],
  completionHistory: [],
});

// Load data from Firestore or SecureStorage
const loadData = async () => {
  if (cachedData) return cachedData;

  console.log('Loading custom workouts, userId:', currentUserId);

  try {
    // Try Firestore first if user is logged in
    if (currentUserId) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 5000)
      );

      const docRef = doc(db, 'customWorkouts', currentUserId);
      const docSnap = await Promise.race([getDoc(docRef), timeoutPromise]);

      if (docSnap.exists()) {
        cachedData = docSnap.data();
        console.log('Loaded custom workouts from Firestore');
        return cachedData;
      } else {
        console.log('No custom workouts in Firestore');
      }
    }

    // Fallback to SecureStorage
    const stored = await getSecure(getStorageKey());
    if (stored) {
      cachedData = stored;
      console.log('Loaded custom workouts from SecureStorage');

      // Migrate to Firestore if user is logged in
      if (currentUserId && cachedData) {
        const docRef = doc(db, 'customWorkouts', currentUserId);
        setDoc(docRef, cachedData).catch(e => console.warn('Custom workout migration failed:', e));
      }
    } else {
      console.log('No stored custom workouts, using defaults');
      cachedData = createDefaultData();
    }
  } catch (e) {
    const isTimeout = e.message === 'Firestore timeout';
    if (isTimeout) {
      console.warn('Firestore request timed out, using default data');
    } else {
      console.warn('Failed to load custom workouts:', e.message);
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
      const docRef = doc(db, 'customWorkouts', currentUserId);
      await setDoc(docRef, data);
    } else {
      // Fallback to SecureStorage if not logged in
      await saveSecure(getStorageKey(), data);
    }
  } catch (e) {
    console.warn('Failed to save custom workouts:', e);
    // Fallback to SecureStorage
    try {
      await saveSecure(getStorageKey(), data);
    } catch (localError) {
      console.warn('Local save also failed:', localError);
    }
  }
};

export const CustomWorkoutService = {
  // Get all custom workouts
  async getCustomWorkouts() {
    const data = await loadData();
    return [...data.customWorkouts];
  },

  // Get a single custom workout by ID
  async getCustomWorkout(workoutId) {
    const data = await loadData();
    return data.customWorkouts.find(w => w.id === workoutId) || null;
  },

  // Add a new custom workout
  async addCustomWorkout({ name, type, description, targetType, targetValue }) {
    const data = await loadData();
    const now = new Date().toISOString();

    const newWorkout = {
      id: generateId(),
      name: name.trim(),
      type: type || 'other',
      description: (description || '').trim(),
      targetType: targetType || 'custom',
      targetValue: (targetValue || '').trim(),
      createdAt: now,
      completionCount: 0,
      lastCompletedAt: null,
    };

    const updatedData = {
      ...data,
      customWorkouts: [newWorkout, ...data.customWorkouts],
    };

    await saveData(updatedData);

    return {
      success: true,
      workout: newWorkout,
    };
  },

  // Update an existing custom workout
  async updateCustomWorkout(workoutId, updates) {
    const data = await loadData();
    const workoutIndex = data.customWorkouts.findIndex(w => w.id === workoutId);

    if (workoutIndex === -1) {
      return { success: false, error: 'Workout not found' };
    }

    const updatedWorkout = {
      ...data.customWorkouts[workoutIndex],
      ...updates,
      id: workoutId, // Ensure ID can't be changed
    };

    const updatedWorkouts = [...data.customWorkouts];
    updatedWorkouts[workoutIndex] = updatedWorkout;

    const updatedData = {
      ...data,
      customWorkouts: updatedWorkouts,
    };

    await saveData(updatedData);

    return {
      success: true,
      workout: updatedWorkout,
    };
  },

  // Delete a custom workout
  async deleteCustomWorkout(workoutId) {
    const data = await loadData();
    const workoutExists = data.customWorkouts.some(w => w.id === workoutId);

    if (!workoutExists) {
      return { success: false, error: 'Workout not found' };
    }

    const updatedData = {
      ...data,
      customWorkouts: data.customWorkouts.filter(w => w.id !== workoutId),
      // Also remove completion history for this workout
      completionHistory: data.completionHistory.filter(c => c.workoutId !== workoutId),
    };

    await saveData(updatedData);

    return { success: true };
  },

  // Record a workout completion with metrics
  async recordCompletion(workoutId, metrics = {}) {
    const data = await loadData();
    const now = new Date().toISOString();

    // Find the workout
    const workoutIndex = data.customWorkouts.findIndex(w => w.id === workoutId);
    if (workoutIndex === -1) {
      return { success: false, error: 'Workout not found' };
    }

    // Points earned for completing custom workout
    const pointsEarned = 15;

    // Create completion record
    const completionRecord = {
      id: `cc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workoutId,
      completedAt: now,
      metrics: {
        sets: metrics.sets || null,
        reps: metrics.reps || null,
        weight: metrics.weight || null,
        duration: metrics.duration || null,
        distance: metrics.distance || null,
      },
      notes: (metrics.notes || '').trim(),
      pointsEarned,
    };

    // Update the workout's completion count and last completed date
    const updatedWorkouts = [...data.customWorkouts];
    updatedWorkouts[workoutIndex] = {
      ...updatedWorkouts[workoutIndex],
      completionCount: updatedWorkouts[workoutIndex].completionCount + 1,
      lastCompletedAt: now,
    };

    const updatedData = {
      ...data,
      customWorkouts: updatedWorkouts,
      completionHistory: [completionRecord, ...data.completionHistory].slice(0, 500),
    };

    await saveData(updatedData);

    return {
      success: true,
      completion: completionRecord,
      pointsEarned,
      workout: updatedWorkouts[workoutIndex],
    };
  },

  // Get completion history for a specific workout
  async getCompletionHistory(workoutId) {
    const data = await loadData();
    return data.completionHistory.filter(c => c.workoutId === workoutId);
  },

  // Get all completion history
  async getAllCompletionHistory() {
    const data = await loadData();
    return [...data.completionHistory];
  },

  // Clear all data (for testing)
  async clearAllData() {
    cachedData = null;
    await saveData(createDefaultData());
  },
};
