//
//  AudioPreferences.swift
//  MuscleHamster
//
//  Audio settings model with UserDefaults persistence
//  Phase 08.1: Audio Experience and Settings
//

import Foundation
import SwiftUI

// MARK: - Audio Preferences Keys

/// UserDefaults keys for audio settings persistence
enum AudioPreferencesKey {
    static let globalMute = "audio_globalMute"
    static let sfxEnabled = "audio_sfxEnabled"
    static let musicEnabled = "audio_musicEnabled"
    static let sfxVolume = "audio_sfxVolume"
    static let musicVolume = "audio_musicVolume"
    static let mixWithOthers = "audio_mixWithOthers"
}

// MARK: - Audio Preferences

/// User's audio preferences with persistence
/// Access via @AppStorage in views or AudioManager.shared.preferences
struct AudioPreferences {

    // MARK: - Default Values

    static let defaultGlobalMute = false
    static let defaultSfxEnabled = true
    static let defaultMusicEnabled = true
    static let defaultSfxVolume: Float = 0.8
    static let defaultMusicVolume: Float = 0.5
    static let defaultMixWithOthers = true

    // MARK: - Properties

    /// Master mute switch - disables all app audio
    var globalMute: Bool

    /// Sound effects enabled (workout cues, celebrations, UI sounds)
    var soundEffectsEnabled: Bool

    /// Background music enabled
    var musicEnabled: Bool

    /// Sound effects volume (0.0 - 1.0)
    var soundEffectsVolume: Float

    /// Music volume (0.0 - 1.0)
    var musicVolume: Float

    /// Mix with other apps (allows podcasts/music to play alongside)
    var mixWithOthers: Bool

    // MARK: - Computed Properties

    /// Whether sound effects can currently play
    var canPlaySFX: Bool {
        !globalMute && soundEffectsEnabled
    }

    /// Whether music can currently play
    var canPlayMusic: Bool {
        !globalMute && musicEnabled
    }

    /// Effective SFX volume (0 if disabled)
    var effectiveSFXVolume: Float {
        canPlaySFX ? soundEffectsVolume : 0
    }

    /// Effective music volume (0 if disabled)
    var effectiveMusicVolume: Float {
        canPlayMusic ? musicVolume : 0
    }

    /// SFX volume as percentage (0-100)
    var sfxVolumePercent: Int {
        Int(soundEffectsVolume * 100)
    }

    /// Music volume as percentage (0-100)
    var musicVolumePercent: Int {
        Int(musicVolume * 100)
    }

    // MARK: - Initialization

    /// Creates preferences with specified values
    init(
        globalMute: Bool = defaultGlobalMute,
        soundEffectsEnabled: Bool = defaultSfxEnabled,
        musicEnabled: Bool = defaultMusicEnabled,
        soundEffectsVolume: Float = defaultSfxVolume,
        musicVolume: Float = defaultMusicVolume,
        mixWithOthers: Bool = defaultMixWithOthers
    ) {
        self.globalMute = globalMute
        self.soundEffectsEnabled = soundEffectsEnabled
        self.musicEnabled = musicEnabled
        self.soundEffectsVolume = max(0, min(1, soundEffectsVolume))
        self.musicVolume = max(0, min(1, musicVolume))
        self.mixWithOthers = mixWithOthers
    }

    /// Loads preferences from UserDefaults
    static func load() -> AudioPreferences {
        let defaults = UserDefaults.standard

        return AudioPreferences(
            globalMute: defaults.bool(forKey: AudioPreferencesKey.globalMute),
            soundEffectsEnabled: defaults.object(forKey: AudioPreferencesKey.sfxEnabled) as? Bool ?? defaultSfxEnabled,
            musicEnabled: defaults.object(forKey: AudioPreferencesKey.musicEnabled) as? Bool ?? defaultMusicEnabled,
            soundEffectsVolume: defaults.object(forKey: AudioPreferencesKey.sfxVolume) as? Float ?? defaultSfxVolume,
            musicVolume: defaults.object(forKey: AudioPreferencesKey.musicVolume) as? Float ?? defaultMusicVolume,
            mixWithOthers: defaults.object(forKey: AudioPreferencesKey.mixWithOthers) as? Bool ?? defaultMixWithOthers
        )
    }

    /// Saves preferences to UserDefaults
    func save() {
        let defaults = UserDefaults.standard
        defaults.set(globalMute, forKey: AudioPreferencesKey.globalMute)
        defaults.set(soundEffectsEnabled, forKey: AudioPreferencesKey.sfxEnabled)
        defaults.set(musicEnabled, forKey: AudioPreferencesKey.musicEnabled)
        defaults.set(soundEffectsVolume, forKey: AudioPreferencesKey.sfxVolume)
        defaults.set(musicVolume, forKey: AudioPreferencesKey.musicVolume)
        defaults.set(mixWithOthers, forKey: AudioPreferencesKey.mixWithOthers)
    }
}

// MARK: - Sound Effect Types

/// Available sound effect types in the app
enum SoundEffect: String, CaseIterable {
    case buttonTap = "button_tap"
    case workoutStart = "workout_start"
    case workoutComplete = "workout_complete"
    case exerciseTransition = "exercise_transition"
    case celebration = "celebration"
    case pointsEarned = "points_earned"
    case streakIncrement = "streak_increment"
    case hamsterHappy = "hamster_happy"
    case hamsterExcited = "hamster_excited"
    case purchase = "purchase"
    case levelUp = "level_up"

    /// Display name for the sound effect
    var displayName: String {
        switch self {
        case .buttonTap: return "Button Tap"
        case .workoutStart: return "Workout Start"
        case .workoutComplete: return "Workout Complete"
        case .exerciseTransition: return "Exercise Transition"
        case .celebration: return "Celebration"
        case .pointsEarned: return "Points Earned"
        case .streakIncrement: return "Streak Up"
        case .hamsterHappy: return "Happy Hamster"
        case .hamsterExcited: return "Excited Hamster"
        case .purchase: return "Purchase"
        case .levelUp: return "Level Up"
        }
    }

    /// File extension (all sounds are .wav for low latency)
    var fileExtension: String { "wav" }

    /// Bundle resource name
    var resourceName: String { rawValue }
}

// MARK: - Music Track Types

/// Available music tracks in the app
enum MusicTrack: String, CaseIterable {
    case workoutUpbeat = "workout_upbeat"
    case workoutChill = "workout_chill"
    case workoutIntense = "workout_intense"
    case ambient = "ambient"

    /// Display name for the track
    var displayName: String {
        switch self {
        case .workoutUpbeat: return "Upbeat"
        case .workoutChill: return "Chill"
        case .workoutIntense: return "Intense"
        case .ambient: return "Ambient"
        }
    }

    /// Track description
    var description: String {
        switch self {
        case .workoutUpbeat: return "Energetic and motivating"
        case .workoutChill: return "Relaxed and steady"
        case .workoutIntense: return "High energy for tough workouts"
        case .ambient: return "Calm background sounds"
        }
    }

    /// File extension
    var fileExtension: String { "mp3" }

    /// Bundle resource name
    var resourceName: String { rawValue }
}
