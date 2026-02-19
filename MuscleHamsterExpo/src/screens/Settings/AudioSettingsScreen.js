/**
 * AudioSettingsScreen.js
 * MuscleHamster Expo
 *
 * Audio settings with volume controls and preferences
 * Ported from Phase 08.1: Audio Experience and Settings
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Note: For a full implementation, install @react-native-community/slider
// For now, we'll use TouchableOpacity buttons for volume control

// Storage keys for audio preferences
const AUDIO_STORAGE_KEYS = {
  GLOBAL_MUTE: '@MuscleHamster:audio_globalMute',
  SFX_ENABLED: '@MuscleHamster:audio_sfxEnabled',
  MUSIC_ENABLED: '@MuscleHamster:audio_musicEnabled',
  SFX_VOLUME: '@MuscleHamster:audio_sfxVolume',
  MUSIC_VOLUME: '@MuscleHamster:audio_musicVolume',
  MIX_WITH_OTHERS: '@MuscleHamster:audio_mixWithOthers',
};

// Default audio preferences
const DEFAULT_PREFERENCES = {
  globalMute: false,
  sfxEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.8,
  musicVolume: 0.6,
  mixWithOthers: true,
};

export default function AudioSettingsScreen({ navigation }) {
  const [globalMute, setGlobalMute] = useState(DEFAULT_PREFERENCES.globalMute);
  const [sfxEnabled, setSfxEnabled] = useState(DEFAULT_PREFERENCES.sfxEnabled);
  const [musicEnabled, setMusicEnabled] = useState(DEFAULT_PREFERENCES.musicEnabled);
  const [sfxVolume, setSfxVolume] = useState(DEFAULT_PREFERENCES.sfxVolume);
  const [musicVolume, setMusicVolume] = useState(DEFAULT_PREFERENCES.musicVolume);
  const [mixWithOthers, setMixWithOthers] = useState(DEFAULT_PREFERENCES.mixWithOthers);
  const [isPlayingPreviewSFX, setIsPlayingPreviewSFX] = useState(false);
  const [isPlayingPreviewMusic, setIsPlayingPreviewMusic] = useState(false);

  // Load preferences on mount
  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [])
  );

  const loadPreferences = async () => {
    try {
      const [mute, sfx, music, sfxVol, musicVol, mix] = await Promise.all([
        AsyncStorage.getItem(AUDIO_STORAGE_KEYS.GLOBAL_MUTE),
        AsyncStorage.getItem(AUDIO_STORAGE_KEYS.SFX_ENABLED),
        AsyncStorage.getItem(AUDIO_STORAGE_KEYS.MUSIC_ENABLED),
        AsyncStorage.getItem(AUDIO_STORAGE_KEYS.SFX_VOLUME),
        AsyncStorage.getItem(AUDIO_STORAGE_KEYS.MUSIC_VOLUME),
        AsyncStorage.getItem(AUDIO_STORAGE_KEYS.MIX_WITH_OTHERS),
      ]);

      if (mute !== null) setGlobalMute(JSON.parse(mute));
      if (sfx !== null) setSfxEnabled(JSON.parse(sfx));
      if (music !== null) setMusicEnabled(JSON.parse(music));
      if (sfxVol !== null) setSfxVolume(parseFloat(sfxVol));
      if (musicVol !== null) setMusicVolume(parseFloat(musicVol));
      if (mix !== null) setMixWithOthers(JSON.parse(mix));
    } catch (e) {
      console.warn('Failed to load audio preferences:', e);
    }
  };

  const savePreference = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to save audio preference:', e);
    }
  };

  // Computed properties
  const canAdjustSFXVolume = !globalMute && sfxEnabled;
  const canAdjustMusicVolume = !globalMute && musicEnabled;
  const canPreviewSFX = !globalMute && sfxEnabled;
  const canPreviewMusic = !globalMute && musicEnabled;

  // Get SFX volume icon based on level
  const getSfxVolumeIcon = () => {
    if (sfxVolume < 0.01) return 'volume-mute';
    if (sfxVolume < 0.34) return 'volume-low';
    if (sfxVolume < 0.67) return 'volume-medium';
    return 'volume-high';
  };

  // Handle global mute change from parent settings
  const handleGlobalMuteChange = (value) => {
    setGlobalMute(value);
    savePreference(AUDIO_STORAGE_KEYS.GLOBAL_MUTE, value);
  };

  // Handle SFX enabled change
  const handleSfxEnabledChange = (value) => {
    setSfxEnabled(value);
    savePreference(AUDIO_STORAGE_KEYS.SFX_ENABLED, value);
  };

  // Handle music enabled change
  const handleMusicEnabledChange = (value) => {
    setMusicEnabled(value);
    savePreference(AUDIO_STORAGE_KEYS.MUSIC_ENABLED, value);
  };

  // Handle SFX volume change
  const handleSfxVolumeChange = (value) => {
    setSfxVolume(value);
  };

  const handleSfxVolumeComplete = (value) => {
    savePreference(AUDIO_STORAGE_KEYS.SFX_VOLUME, value);
  };

  // Handle music volume change
  const handleMusicVolumeChange = (value) => {
    setMusicVolume(value);
  };

  const handleMusicVolumeComplete = (value) => {
    savePreference(AUDIO_STORAGE_KEYS.MUSIC_VOLUME, value);
  };

  // Handle mix with others change
  const handleMixWithOthersChange = (value) => {
    setMixWithOthers(value);
    savePreference(AUDIO_STORAGE_KEYS.MIX_WITH_OTHERS, value);
  };

  // Preview sound effect
  const playPreviewSFX = () => {
    if (!canPreviewSFX || isPlayingPreviewSFX) return;

    setIsPlayingPreviewSFX(true);
    // Simulate preview playback
    setTimeout(() => {
      setIsPlayingPreviewSFX(false);
    }, 500);
  };

  // Preview music
  const playPreviewMusic = () => {
    if (!canPreviewMusic || isPlayingPreviewMusic) return;

    setIsPlayingPreviewMusic(true);
    // Simulate preview playback
    setTimeout(() => {
      setIsPlayingPreviewMusic(false);
    }, 3000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Muted Banner */}
      {globalMute && (
        <View style={styles.section}>
          <View style={styles.mutedBanner}>
            <Ionicons name="volume-mute" size={28} color="#FF9500" />
            <View style={styles.mutedTextContainer}>
              <Text style={styles.mutedTitle}>Audio is muted</Text>
              <Text style={styles.mutedSubtitle}>
                Turn off 'Mute All Audio' in Settings to hear sounds.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Enable/Disable Toggles */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Audio Controls</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="volume-high" size={22} color="#34C759" />
              <Text style={styles.rowText}>Sound Effects</Text>
            </View>
            <Switch
              value={sfxEnabled}
              onValueChange={handleSfxEnabledChange}
              trackColor={{ true: '#007AFF' }}
              disabled={globalMute}
              accessibilityLabel="Sound Effects toggle"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="musical-note" size={22} color="#AF52DE" />
              <Text style={styles.rowText}>Music</Text>
            </View>
            <Switch
              value={musicEnabled}
              onValueChange={handleMusicEnabledChange}
              trackColor={{ true: '#007AFF' }}
              disabled={globalMute}
              accessibilityLabel="Music toggle"
            />
          </View>
        </View>
      </View>

      {/* Volume Levels Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Volume Levels</Text>
        <View style={styles.card}>
          {/* Sound Effects Volume */}
          <View style={[styles.volumeRow, !canAdjustSFXVolume && styles.disabledRow]}>
            <View style={styles.volumeHeader}>
              <Ionicons
                name={getSfxVolumeIcon()}
                size={22}
                color={canAdjustSFXVolume ? '#007AFF' : '#8E8E93'}
              />
              <Text style={[styles.volumeLabel, !canAdjustSFXVolume && styles.disabledText]}>
                Sound Effects
              </Text>
              <Text style={styles.volumeValue}>{Math.round(sfxVolume * 100)}%</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Ionicons name="volume-low" size={16} color="#8E8E93" />
              <View style={styles.volumeButtonsContainer}>
                {[0, 0.25, 0.5, 0.75, 1].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.volumeButton,
                      sfxVolume >= level && canAdjustSFXVolume && styles.volumeButtonFilled,
                      !canAdjustSFXVolume && styles.volumeButtonDisabled,
                    ]}
                    onPress={() => {
                      if (canAdjustSFXVolume) {
                        handleSfxVolumeChange(level);
                        handleSfxVolumeComplete(level);
                      }
                    }}
                    disabled={!canAdjustSFXVolume}
                    accessibilityLabel={`Volume ${Math.round(level * 100)}%`}
                  />
                ))}
              </View>
              <Ionicons name="volume-high" size={16} color="#8E8E93" />
            </View>
          </View>

          <View style={styles.separator} />

          {/* Music Volume */}
          <View style={[styles.volumeRow, !canAdjustMusicVolume && styles.disabledRow]}>
            <View style={styles.volumeHeader}>
              <Ionicons
                name="musical-note"
                size={22}
                color={canAdjustMusicVolume ? '#007AFF' : '#8E8E93'}
              />
              <Text style={[styles.volumeLabel, !canAdjustMusicVolume && styles.disabledText]}>
                Music
              </Text>
              <Text style={styles.volumeValue}>{Math.round(musicVolume * 100)}%</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Ionicons name="volume-low" size={16} color="#8E8E93" />
              <View style={styles.volumeButtonsContainer}>
                {[0, 0.25, 0.5, 0.75, 1].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.volumeButton,
                      musicVolume >= level && canAdjustMusicVolume && styles.volumeButtonFilled,
                      !canAdjustMusicVolume && styles.volumeButtonDisabled,
                    ]}
                    onPress={() => {
                      if (canAdjustMusicVolume) {
                        handleMusicVolumeChange(level);
                        handleMusicVolumeComplete(level);
                      }
                    }}
                    disabled={!canAdjustMusicVolume}
                    accessibilityLabel={`Volume ${Math.round(level * 100)}%`}
                  />
                ))}
              </View>
              <Ionicons name="volume-high" size={16} color="#8E8E93" />
            </View>
          </View>
        </View>
      </View>

      {/* Audio Behavior Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Audio Behavior</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLabelExpanded}>
              <Text style={styles.rowText}>Mix with Other Apps</Text>
              <Text style={styles.rowSubText}>
                Play music from other apps alongside workouts
              </Text>
            </View>
            <Switch
              value={mixWithOthers}
              onValueChange={handleMixWithOthersChange}
              trackColor={{ true: '#007AFF' }}
              accessibilityLabel="Mix with Other Apps toggle"
            />
          </View>
        </View>
        <Text style={styles.footerText}>
          {mixWithOthers
            ? 'Other apps will continue playing alongside workout audio.'
            : 'Other apps will pause when workout audio plays.'}
        </Text>
      </View>

      {/* Test Sounds Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Test Sounds</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.previewRow, !canPreviewSFX && styles.disabledRow]}
            onPress={playPreviewSFX}
            disabled={!canPreviewSFX || isPlayingPreviewSFX}
            accessibilityLabel="Preview Sound Effect"
            accessibilityHint={canPreviewSFX ? 'Double tap to hear a sample sound effect' : 'Unavailable while muted or sound effects disabled'}
          >
            <Ionicons
              name={isPlayingPreviewSFX ? 'volume-medium' : 'play-circle'}
              size={24}
              color={canPreviewSFX ? '#007AFF' : '#8E8E93'}
            />
            <Text style={[styles.previewText, !canPreviewSFX && styles.disabledText]}>
              Preview Sound Effect
            </Text>
            {isPlayingPreviewSFX && (
              <ActivityIndicator size="small" color="#007AFF" />
            )}
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={[styles.previewRow, !canPreviewMusic && styles.disabledRow]}
            onPress={playPreviewMusic}
            disabled={!canPreviewMusic || isPlayingPreviewMusic}
            accessibilityLabel="Preview Music"
            accessibilityHint={canPreviewMusic ? 'Double tap to hear a sample of workout music' : 'Unavailable while muted or music disabled'}
          >
            <Ionicons
              name={isPlayingPreviewMusic ? 'musical-note' : 'play-circle'}
              size={24}
              color={canPreviewMusic ? '#007AFF' : '#8E8E93'}
            />
            <Text style={[styles.previewText, !canPreviewMusic && styles.disabledText]}>
              Preview Music
            </Text>
            {isPlayingPreviewMusic && (
              <ActivityIndicator size="small" color="#007AFF" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>
          Your hamster appreciates a good soundtrack!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowLabelExpanded: {
    flex: 1,
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  rowSubText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C7C7CC',
    marginLeft: 48,
  },
  mutedBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mutedTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  mutedTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  mutedSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  volumeRow: {
    padding: 14,
  },
  volumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  volumeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  volumeValue: {
    fontSize: 15,
    color: '#8E8E93',
    fontVariant: ['tabular-nums'],
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeButtonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
  },
  volumeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
  },
  volumeButtonFilled: {
    backgroundColor: '#007AFF',
  },
  volumeButtonDisabled: {
    opacity: 0.3,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  disabledRow: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#8E8E93',
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    marginHorizontal: 16,
    lineHeight: 18,
  },
});
