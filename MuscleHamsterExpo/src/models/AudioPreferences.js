// Audio Preferences Model
// Ported from Swift AudioPreferences.swift
// Phase 08.1: Audio Experience and Settings

import AsyncStorage from '@react-native-async-storage/async-storage';
import Logger from '../services/LoggerService';

// Storage Keys
const AUDIO_STORAGE_KEYS = {
  globalMute: '@audio_globalMute',
  sfxEnabled: '@audio_sfxEnabled',
  musicEnabled: '@audio_musicEnabled',
  sfxVolume: '@audio_sfxVolume',
  musicVolume: '@audio_musicVolume',
  mixWithOthers: '@audio_mixWithOthers',
};

// Default Values
export const AUDIO_DEFAULTS = {
  globalMute: false,
  soundEffectsEnabled: true,
  musicEnabled: true,
  soundEffectsVolume: 0.8,
  musicVolume: 0.5,
  mixWithOthers: true,
};

// Sound Effect Types
export const SoundEffect = {
  BUTTON_TAP: 'button_tap',
  WORKOUT_START: 'workout_start',
  WORKOUT_COMPLETE: 'workout_complete',
  EXERCISE_TRANSITION: 'exercise_transition',
  CELEBRATION: 'celebration',
  POINTS_EARNED: 'points_earned',
  STREAK_INCREMENT: 'streak_increment',
  HAMSTER_HAPPY: 'hamster_happy',
  HAMSTER_EXCITED: 'hamster_excited',
  PURCHASE: 'purchase',
  LEVEL_UP: 'level_up',
};

export const SoundEffectInfo = {
  [SoundEffect.BUTTON_TAP]: { displayName: 'Button Tap', fileExtension: 'wav' },
  [SoundEffect.WORKOUT_START]: { displayName: 'Workout Start', fileExtension: 'wav' },
  [SoundEffect.WORKOUT_COMPLETE]: { displayName: 'Workout Complete', fileExtension: 'wav' },
  [SoundEffect.EXERCISE_TRANSITION]: { displayName: 'Exercise Transition', fileExtension: 'wav' },
  [SoundEffect.CELEBRATION]: { displayName: 'Celebration', fileExtension: 'wav' },
  [SoundEffect.POINTS_EARNED]: { displayName: 'Points Earned', fileExtension: 'wav' },
  [SoundEffect.STREAK_INCREMENT]: { displayName: 'Streak Up', fileExtension: 'wav' },
  [SoundEffect.HAMSTER_HAPPY]: { displayName: 'Happy Hamster', fileExtension: 'wav' },
  [SoundEffect.HAMSTER_EXCITED]: { displayName: 'Excited Hamster', fileExtension: 'wav' },
  [SoundEffect.PURCHASE]: { displayName: 'Purchase', fileExtension: 'wav' },
  [SoundEffect.LEVEL_UP]: { displayName: 'Level Up', fileExtension: 'wav' },
};

// Music Track Types
export const MusicTrack = {
  WORKOUT_UPBEAT: 'workout_upbeat',
  WORKOUT_CHILL: 'workout_chill',
  WORKOUT_INTENSE: 'workout_intense',
  AMBIENT: 'ambient',
};

export const MusicTrackInfo = {
  [MusicTrack.WORKOUT_UPBEAT]: {
    displayName: 'Upbeat',
    description: 'Energetic and motivating',
    fileExtension: 'mp3',
  },
  [MusicTrack.WORKOUT_CHILL]: {
    displayName: 'Chill',
    description: 'Relaxed and steady',
    fileExtension: 'mp3',
  },
  [MusicTrack.WORKOUT_INTENSE]: {
    displayName: 'Intense',
    description: 'High energy for tough workouts',
    fileExtension: 'mp3',
  },
  [MusicTrack.AMBIENT]: {
    displayName: 'Ambient',
    description: 'Calm background sounds',
    fileExtension: 'mp3',
  },
};

// Create default audio preferences
export const createDefaultAudioPreferences = () => ({
  globalMute: AUDIO_DEFAULTS.globalMute,
  soundEffectsEnabled: AUDIO_DEFAULTS.soundEffectsEnabled,
  musicEnabled: AUDIO_DEFAULTS.musicEnabled,
  soundEffectsVolume: AUDIO_DEFAULTS.soundEffectsVolume,
  musicVolume: AUDIO_DEFAULTS.musicVolume,
  mixWithOthers: AUDIO_DEFAULTS.mixWithOthers,
});

// Computed properties helper
export const getAudioComputedProperties = (preferences) => {
  const canPlaySFX = !preferences.globalMute && preferences.soundEffectsEnabled;
  const canPlayMusic = !preferences.globalMute && preferences.musicEnabled;

  return {
    canPlaySFX,
    canPlayMusic,
    effectiveSFXVolume: canPlaySFX ? preferences.soundEffectsVolume : 0,
    effectiveMusicVolume: canPlayMusic ? preferences.musicVolume : 0,
    sfxVolumePercent: Math.round(preferences.soundEffectsVolume * 100),
    musicVolumePercent: Math.round(preferences.musicVolume * 100),
  };
};

// Clamp volume to valid range
export const clampVolume = (volume) => Math.max(0, Math.min(1, volume));

// Load audio preferences from AsyncStorage
export const loadAudioPreferences = async () => {
  try {
    const keys = Object.values(AUDIO_STORAGE_KEYS);
    const pairs = await AsyncStorage.multiGet(keys);

    const stored = {};
    pairs.forEach(([key, value]) => {
      if (value !== null) {
        const shortKey = Object.keys(AUDIO_STORAGE_KEYS).find(
          k => AUDIO_STORAGE_KEYS[k] === key
        );
        if (shortKey) {
          // Parse based on expected type
          if (shortKey === 'sfxVolume' || shortKey === 'musicVolume') {
            stored[shortKey] = parseFloat(value);
          } else {
            stored[shortKey] = JSON.parse(value);
          }
        }
      }
    });

    return {
      globalMute: stored.globalMute ?? AUDIO_DEFAULTS.globalMute,
      soundEffectsEnabled: stored.sfxEnabled ?? AUDIO_DEFAULTS.soundEffectsEnabled,
      musicEnabled: stored.musicEnabled ?? AUDIO_DEFAULTS.musicEnabled,
      soundEffectsVolume: clampVolume(stored.sfxVolume ?? AUDIO_DEFAULTS.soundEffectsVolume),
      musicVolume: clampVolume(stored.musicVolume ?? AUDIO_DEFAULTS.musicVolume),
      mixWithOthers: stored.mixWithOthers ?? AUDIO_DEFAULTS.mixWithOthers,
    };
  } catch (error) {
    Logger.error('AudioPreferences: Failed to load preferences:', error);
    return createDefaultAudioPreferences();
  }
};

// Save audio preferences to AsyncStorage
export const saveAudioPreferences = async (preferences) => {
  try {
    const pairs = [
      [AUDIO_STORAGE_KEYS.globalMute, JSON.stringify(preferences.globalMute)],
      [AUDIO_STORAGE_KEYS.sfxEnabled, JSON.stringify(preferences.soundEffectsEnabled)],
      [AUDIO_STORAGE_KEYS.musicEnabled, JSON.stringify(preferences.musicEnabled)],
      [AUDIO_STORAGE_KEYS.sfxVolume, String(preferences.soundEffectsVolume)],
      [AUDIO_STORAGE_KEYS.musicVolume, String(preferences.musicVolume)],
      [AUDIO_STORAGE_KEYS.mixWithOthers, JSON.stringify(preferences.mixWithOthers)],
    ];

    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    Logger.error('AudioPreferences: Failed to save preferences:', error);
  }
};

// Update a single preference and save
export const updateAudioPreference = async (key, value) => {
  const preferences = await loadAudioPreferences();
  const updated = { ...preferences, [key]: value };
  await saveAudioPreferences(updated);
  return updated;
};
