// Audio Service
// Ported from Swift AudioManager.swift
// Phase 08.1: Audio Experience and Settings
//
// Uses expo-av for audio playback on React Native/Expo

import { Audio } from 'expo-av';
import {
  loadAudioPreferences,
  saveAudioPreferences,
  createDefaultAudioPreferences,
  getAudioComputedProperties,
  SoundEffect,
  MusicTrack,
  MusicTrackInfo,
} from '../models/AudioPreferences';

// Audio file mappings (placeholders - actual assets need to be added)
// These should be require() statements pointing to actual audio files
const SOUND_EFFECT_FILES = {
  [SoundEffect.BUTTON_TAP]: null, // require('../assets/sounds/button_tap.wav')
  [SoundEffect.WORKOUT_START]: null,
  [SoundEffect.WORKOUT_COMPLETE]: null,
  [SoundEffect.EXERCISE_TRANSITION]: null,
  [SoundEffect.CELEBRATION]: null,
  [SoundEffect.POINTS_EARNED]: null,
  [SoundEffect.STREAK_INCREMENT]: null,
  [SoundEffect.HAMSTER_HAPPY]: null,
  [SoundEffect.HAMSTER_EXCITED]: null,
  [SoundEffect.PURCHASE]: null,
  [SoundEffect.LEVEL_UP]: null,
};

const MUSIC_TRACK_FILES = {
  [MusicTrack.WORKOUT_UPBEAT]: null, // require('../assets/music/workout_upbeat.mp3')
  [MusicTrack.WORKOUT_CHILL]: null,
  [MusicTrack.WORKOUT_INTENSE]: null,
  [MusicTrack.AMBIENT]: null,
};

// Singleton state
let _preferences = null;
let _isAudioSessionConfigured = false;
let _sfxPlayers = {};
let _musicPlayer = null;
let _currentMusicTrack = null;
let _isMusicPlaying = false;
let _musicWasPlayingBeforeInterruption = false;
let _listeners = [];

// Event subscription
const notifyListeners = () => {
  const state = getAudioState();
  _listeners.forEach(listener => listener(state));
};

export const subscribeToAudioState = (listener) => {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter(l => l !== listener);
  };
};

// Get current audio state
export const getAudioState = () => ({
  preferences: _preferences || createDefaultAudioPreferences(),
  isMusicPlaying: _isMusicPlaying,
  currentMusicTrack: _currentMusicTrack,
  computed: getAudioComputedProperties(_preferences || createDefaultAudioPreferences()),
});

// Initialize the audio service
export const initializeAudioService = async () => {
  try {
    _preferences = await loadAudioPreferences();
    await configureAudioSession();
    console.log('AudioService: Initialized');
    notifyListeners();
    return _preferences;
  } catch (error) {
    console.error('AudioService: Failed to initialize:', error);
    _preferences = createDefaultAudioPreferences();
    return _preferences;
  }
};

// Configure audio session based on preferences
const configureAudioSession = async () => {
  try {
    const prefs = _preferences || createDefaultAudioPreferences();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: prefs.mixWithOthers,
      playThroughEarpieceAndroid: false,
      // Mix with other apps if preference is set
      interruptionModeIOS: prefs.mixWithOthers
        ? Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS
        : Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      interruptionModeAndroid: prefs.mixWithOthers
        ? Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
        : Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });

    _isAudioSessionConfigured = true;
  } catch (error) {
    console.error('AudioService: Failed to configure audio session:', error);
  }
};

// Update audio preferences
export const updateAudioPreferences = async (newPreferences) => {
  const oldPreferences = _preferences || createDefaultAudioPreferences();
  _preferences = newPreferences;

  try {
    await saveAudioPreferences(newPreferences);

    // Handle immediate changes
    if (newPreferences.globalMute && !oldPreferences.globalMute) {
      await stopAllAudio();
    }

    if (!newPreferences.musicEnabled && oldPreferences.musicEnabled) {
      await stopMusic();
    }

    // Update volumes on playing audio
    await updateVolumes();

    // Reconfigure audio session if mix setting changed
    if (newPreferences.mixWithOthers !== oldPreferences.mixWithOthers) {
      await configureAudioSession();
    }

    notifyListeners();
  } catch (error) {
    console.error('AudioService: Failed to update preferences:', error);
  }
};

// Play a sound effect
export const playSFX = async (soundEffect) => {
  const prefs = _preferences || createDefaultAudioPreferences();
  const computed = getAudioComputedProperties(prefs);

  if (!computed.canPlaySFX) {
    return;
  }

  // Check if we have the sound file
  const soundFile = SOUND_EFFECT_FILES[soundEffect];
  if (!soundFile) {
    console.log(`AudioService: Sound effect '${soundEffect}' file not found (asset not bundled)`);
    return;
  }

  try {
    // Check for cached player
    if (_sfxPlayers[soundEffect]) {
      const player = _sfxPlayers[soundEffect];
      await player.setVolumeAsync(computed.effectiveSFXVolume);
      await player.setPositionAsync(0);
      await player.playAsync();
      return;
    }

    // Create new player
    const { sound } = await Audio.Sound.createAsync(
      soundFile,
      {
        volume: computed.effectiveSFXVolume,
        shouldPlay: true,
      }
    );

    _sfxPlayers[soundEffect] = sound;

    // Set up callback to handle when sound finishes
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        // Optional: unload to free memory
        // sound.unloadAsync();
        // delete _sfxPlayers[soundEffect];
      }
    });
  } catch (error) {
    console.error(`AudioService: Failed to play SFX '${soundEffect}':`, error);
  }
};

// Play music track
export const playMusic = async (track, loop = true) => {
  const prefs = _preferences || createDefaultAudioPreferences();
  const computed = getAudioComputedProperties(prefs);

  if (!computed.canPlayMusic) {
    return;
  }

  // Stop any currently playing music
  await stopMusic();

  // Check if we have the music file
  const musicFile = MUSIC_TRACK_FILES[track];
  if (!musicFile) {
    console.log(`AudioService: Music track '${track}' file not found (asset not bundled)`);
    return;
  }

  try {
    const { sound } = await Audio.Sound.createAsync(
      musicFile,
      {
        volume: computed.effectiveMusicVolume,
        isLooping: loop,
        shouldPlay: true,
      }
    );

    _musicPlayer = sound;
    _currentMusicTrack = track;
    _isMusicPlaying = true;

    // Handle playback status updates
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish && !loop) {
        _isMusicPlaying = false;
        _currentMusicTrack = null;
        notifyListeners();
      }
    });

    notifyListeners();
  } catch (error) {
    console.error(`AudioService: Failed to play music '${track}':`, error);
  }
};

// Stop music
export const stopMusic = async () => {
  if (_musicPlayer) {
    try {
      await _musicPlayer.stopAsync();
      await _musicPlayer.unloadAsync();
    } catch (error) {
      console.error('AudioService: Error stopping music:', error);
    }
    _musicPlayer = null;
  }
  _currentMusicTrack = null;
  _isMusicPlaying = false;
  notifyListeners();
};

// Pause music
export const pauseMusic = async () => {
  if (!_isMusicPlaying || !_musicPlayer) {
    return;
  }

  try {
    await _musicPlayer.pauseAsync();
    _isMusicPlaying = false;
    notifyListeners();
  } catch (error) {
    console.error('AudioService: Failed to pause music:', error);
  }
};

// Resume music
export const resumeMusic = async () => {
  const prefs = _preferences || createDefaultAudioPreferences();
  const computed = getAudioComputedProperties(prefs);

  if (_isMusicPlaying || !_musicPlayer || !computed.canPlayMusic) {
    return;
  }

  try {
    await _musicPlayer.playAsync();
    _isMusicPlaying = true;
    notifyListeners();
  } catch (error) {
    console.error('AudioService: Failed to resume music:', error);
  }
};

// Stop all audio
export const stopAllAudio = async () => {
  // Stop all SFX players
  for (const key of Object.keys(_sfxPlayers)) {
    try {
      await _sfxPlayers[key].stopAsync();
      await _sfxPlayers[key].unloadAsync();
    } catch (error) {
      console.error(`AudioService: Error stopping SFX ${key}:`, error);
    }
  }
  _sfxPlayers = {};

  // Stop music
  await stopMusic();
};

// Update volumes on currently playing audio
const updateVolumes = async () => {
  const prefs = _preferences || createDefaultAudioPreferences();
  const computed = getAudioComputedProperties(prefs);

  // Update SFX volumes
  for (const player of Object.values(_sfxPlayers)) {
    try {
      await player.setVolumeAsync(computed.effectiveSFXVolume);
    } catch (error) {
      // Player might be unloaded
    }
  }

  // Update music volume
  if (_musicPlayer) {
    try {
      await _musicPlayer.setVolumeAsync(computed.effectiveMusicVolume);
    } catch (error) {
      console.error('AudioService: Failed to update music volume:', error);
    }
  }
};

// Play preview sound effect for settings testing
export const playPreviewSFX = async () => {
  await playSFX(SoundEffect.CELEBRATION);
};

// Play preview music for settings testing
export const playPreviewMusic = async () => {
  const tracks = Object.values(MusicTrack);
  if (tracks.length > 0) {
    await playMusic(tracks[0], false);

    // Stop after 5 seconds
    setTimeout(async () => {
      if (_currentMusicTrack === tracks[0]) {
        await stopMusic();
      }
    }, 5000);
  }
};

// Handle app state changes (for audio interruption handling)
export const handleAppStateChange = async (nextAppState) => {
  if (nextAppState === 'active') {
    // App became active - resume music if it was playing
    if (_musicWasPlayingBeforeInterruption) {
      await resumeMusic();
      _musicWasPlayingBeforeInterruption = false;
    }
  } else if (nextAppState === 'background' || nextAppState === 'inactive') {
    // App going to background - save state and pause
    _musicWasPlayingBeforeInterruption = _isMusicPlaying;
    if (_isMusicPlaying) {
      await pauseMusic();
    }
  }
};

// Cleanup - call when unmounting
export const cleanupAudioService = async () => {
  await stopAllAudio();
  _preferences = null;
  _isAudioSessionConfigured = false;
  _listeners = [];
};

// Export AudioService object for consistent API
export const AudioService = {
  initialize: initializeAudioService,
  updatePreferences: updateAudioPreferences,
  playSFX,
  playMusic,
  stopMusic,
  pauseMusic,
  resumeMusic,
  stopAllAudio,
  playPreviewSFX,
  playPreviewMusic,
  handleAppStateChange,
  cleanup: cleanupAudioService,
  subscribe: subscribeToAudioState,
  getState: getAudioState,
};

export default AudioService;
