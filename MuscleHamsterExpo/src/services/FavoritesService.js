// Favorites Service - Manage workout favorites
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { saveSecure, getSecure } from './SecureStorageService';
import { db } from '../config/firebase';

const STORAGE_KEY_PREFIX = '@MuscleHamster:favorites';

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
let cachedFavorites = null;

// Set the current user ID
export const setFavoritesUserId = (userId) => {
  if (currentUserId !== userId) {
    currentUserId = userId;
    cachedFavorites = null;
  }
};

// Default data structure
const createDefaultData = () => ({
  favoriteWorkoutIds: [],
});

// Load favorites from Firestore or SecureStorage
const loadFavorites = async () => {
  if (cachedFavorites) return cachedFavorites;

  console.log('Loading favorites, userId:', currentUserId);

  try {
    // Try Firestore first if user is logged in
    if (currentUserId) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 5000)
      );

      const docRef = doc(db, 'userFavorites', currentUserId);
      const docSnap = await Promise.race([getDoc(docRef), timeoutPromise]);

      if (docSnap.exists()) {
        cachedFavorites = docSnap.data();
        console.log('Loaded favorites from Firestore');
        return cachedFavorites;
      } else {
        console.log('No favorites in Firestore');
      }
    }

    // Fallback to SecureStorage
    const stored = await getSecure(getStorageKey());
    if (stored) {
      cachedFavorites = stored;
      console.log('Loaded favorites from SecureStorage');

      // Migrate to Firestore if user is logged in
      if (currentUserId && cachedFavorites) {
        const docRef = doc(db, 'userFavorites', currentUserId);
        setDoc(docRef, cachedFavorites).catch(e => console.warn('Favorites migration failed:', e));
      }
    } else {
      console.log('No stored favorites, using defaults');
      cachedFavorites = createDefaultData();
    }
  } catch (e) {
    const isTimeout = e.message === 'Firestore timeout';
    if (isTimeout) {
      console.warn('Firestore request timed out, using default favorites');
    } else {
      console.warn('Failed to load favorites:', e.message);
    }
    cachedFavorites = createDefaultData();
  }

  return cachedFavorites;
};

// Save favorites to Firestore and cache
const saveFavorites = async (data) => {
  cachedFavorites = data;

  try {
    if (currentUserId) {
      const docRef = doc(db, 'userFavorites', currentUserId);
      await setDoc(docRef, data);
    } else {
      // Fallback to SecureStorage if not logged in
      await saveSecure(getStorageKey(), data);
    }
  } catch (e) {
    console.warn('Failed to save favorites:', e);
    // Fallback to SecureStorage
    try {
      await saveSecure(getStorageKey(), data);
    } catch (localError) {
      console.warn('Local save also failed:', localError);
    }
  }
};

export const FavoritesService = {
  // Get all favorite workout IDs
  async getFavorites() {
    const data = await loadFavorites();
    return [...data.favoriteWorkoutIds];
  },

  // Check if a workout is favorited
  async isFavorite(workoutId) {
    const data = await loadFavorites();
    return data.favoriteWorkoutIds.includes(workoutId);
  },

  // Add a workout to favorites
  async addFavorite(workoutId) {
    const data = await loadFavorites();

    // Already favorited
    if (data.favoriteWorkoutIds.includes(workoutId)) {
      return { success: true, alreadyFavorited: true };
    }

    const updatedData = {
      ...data,
      favoriteWorkoutIds: [workoutId, ...data.favoriteWorkoutIds],
    };

    await saveFavorites(updatedData);

    return { success: true };
  },

  // Remove a workout from favorites
  async removeFavorite(workoutId) {
    const data = await loadFavorites();

    // Not in favorites
    if (!data.favoriteWorkoutIds.includes(workoutId)) {
      return { success: true, notFavorited: true };
    }

    const updatedData = {
      ...data,
      favoriteWorkoutIds: data.favoriteWorkoutIds.filter(id => id !== workoutId),
    };

    await saveFavorites(updatedData);

    return { success: true };
  },

  // Toggle favorite status
  async toggleFavorite(workoutId) {
    const data = await loadFavorites();
    const isFavorited = data.favoriteWorkoutIds.includes(workoutId);

    if (isFavorited) {
      return this.removeFavorite(workoutId);
    } else {
      return this.addFavorite(workoutId);
    }
  },

  // Clear all favorites (for testing)
  async clearAllFavorites() {
    cachedFavorites = null;
    await saveFavorites(createDefaultData());
  },
};
