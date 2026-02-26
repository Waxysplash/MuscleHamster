// Journal Service - Track weight and reps for each exercise
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const STORAGE_KEY = '@MuscleHamster:exerciseJournal';

// Current user ID (set by context)
let currentUserId = null;

// In-memory cache
let cachedJournal = null;

// Set the current user ID
export const setJournalUserId = (userId) => {
  if (currentUserId !== userId) {
    currentUserId = userId;
    cachedJournal = null;
  }
};

// Generate a unique exercise key
const getExerciseKey = (exerciseName, category) => {
  // Normalize the name to create a consistent key
  const normalizedName = exerciseName.toLowerCase().replace(/\s+/g, '_');
  const normalizedCategory = (category || 'general').toLowerCase().replace(/\s+/g, '_');
  return `${normalizedCategory}_${normalizedName}`;
};

// Load all journal entries
const loadJournal = async () => {
  if (cachedJournal) return cachedJournal;

  try {
    // Try Firestore first if user is logged in
    if (currentUserId) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 5000)
      );

      const docRef = doc(db, 'exerciseJournals', currentUserId);
      const docSnap = await Promise.race([getDoc(docRef), timeoutPromise]);

      if (docSnap.exists()) {
        cachedJournal = docSnap.data();
        return cachedJournal;
      }
    }

    // Fallback to AsyncStorage
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedJournal = JSON.parse(stored);

      // Migrate to Firestore if user is logged in
      if (currentUserId && cachedJournal) {
        const docRef = doc(db, 'exerciseJournals', currentUserId);
        setDoc(docRef, cachedJournal).catch(e => console.warn('Journal migration failed:', e));
      }

      return cachedJournal;
    }

    // Return empty journal
    cachedJournal = { exercises: {} };
    return cachedJournal;
  } catch (e) {
    console.warn('Failed to load journal:', e);
    cachedJournal = { exercises: {} };
    return cachedJournal;
  }
};

// Save journal to storage
const saveJournal = async (journal) => {
  cachedJournal = journal;

  try {
    // Save to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(journal));

    // Save to Firestore if user is logged in
    if (currentUserId) {
      const docRef = doc(db, 'exerciseJournals', currentUserId);
      setDoc(docRef, journal).catch(e => console.warn('Journal Firestore save failed:', e));
    }
  } catch (e) {
    console.warn('Failed to save journal:', e);
  }
};

// Get entries for a specific exercise
export const getExerciseEntries = async (exerciseName, category) => {
  const journal = await loadJournal();
  const key = getExerciseKey(exerciseName, category);
  return journal.exercises[key]?.entries || [];
};

// Get the most recent entry for an exercise
export const getLastEntry = async (exerciseName, category) => {
  const entries = await getExerciseEntries(exerciseName, category);
  if (entries.length === 0) return null;
  return entries[0]; // Entries are sorted newest first
};

// Add a new journal entry
export const addJournalEntry = async (exerciseName, category, entry) => {
  const journal = await loadJournal();
  const key = getExerciseKey(exerciseName, category);

  // Initialize exercise if not exists
  if (!journal.exercises[key]) {
    journal.exercises[key] = {
      name: exerciseName,
      category: category,
      entries: [],
    };
  }

  // Create the entry
  const newEntry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    sets: entry.sets || [], // Array of { weight, reps }
    notes: entry.notes || '',
  };

  // Add to beginning (newest first)
  journal.exercises[key].entries.unshift(newEntry);

  // Keep only last 50 entries per exercise
  if (journal.exercises[key].entries.length > 50) {
    journal.exercises[key].entries = journal.exercises[key].entries.slice(0, 50);
  }

  await saveJournal(journal);
  return newEntry;
};

// Delete a journal entry
export const deleteJournalEntry = async (exerciseName, category, entryId) => {
  const journal = await loadJournal();
  const key = getExerciseKey(exerciseName, category);

  if (journal.exercises[key]) {
    journal.exercises[key].entries = journal.exercises[key].entries.filter(
      (e) => e.id !== entryId
    );
    await saveJournal(journal);
  }
};

// Update a journal entry
export const updateJournalEntry = async (exerciseName, category, entryId, updates) => {
  const journal = await loadJournal();
  const key = getExerciseKey(exerciseName, category);

  if (journal.exercises[key]) {
    const entryIndex = journal.exercises[key].entries.findIndex((e) => e.id === entryId);
    if (entryIndex !== -1) {
      journal.exercises[key].entries[entryIndex] = {
        ...journal.exercises[key].entries[entryIndex],
        ...updates,
      };
      await saveJournal(journal);
      return journal.exercises[key].entries[entryIndex];
    }
  }
  return null;
};

// Clear cache (call when user logs out)
export const clearJournalCache = () => {
  cachedJournal = null;
};

export const JournalService = {
  setUserId: setJournalUserId,
  getExerciseEntries,
  getLastEntry,
  addJournalEntry,
  deleteJournalEntry,
  updateJournalEntry,
  clearCache: clearJournalCache,
};
