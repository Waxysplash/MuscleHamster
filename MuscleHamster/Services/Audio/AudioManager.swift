//
//  AudioManager.swift
//  MuscleHamster
//
//  Centralized audio playback manager
//  Phase 08.1: Audio Experience and Settings
//

import Foundation
import AVFoundation
import Combine

// MARK: - Audio Manager

/// Singleton audio manager for all app audio playback
/// Handles sound effects, music, audio session configuration, and interruptions
@MainActor
final class AudioManager: NSObject, ObservableObject {

    // MARK: - Singleton

    static let shared = AudioManager()

    // MARK: - Published Properties

    /// Current audio preferences
    @Published private(set) var preferences: AudioPreferences

    /// Whether music is currently playing
    @Published private(set) var isMusicPlaying: Bool = false

    /// Currently playing music track
    @Published private(set) var currentMusicTrack: MusicTrack?

    // MARK: - Private Properties

    /// Audio player for sound effects (short sounds)
    private var sfxPlayers: [SoundEffect: AVAudioPlayer] = [:]

    /// Audio player for music (longer tracks)
    private var musicPlayer: AVAudioPlayer?

    /// Whether audio session is configured
    private var isAudioSessionConfigured: Bool = false

    /// Whether music was playing before interruption
    private var musicWasPlayingBeforeInterruption: Bool = false

    /// Cancellables for preference observation
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Initialization

    private override init() {
        self.preferences = AudioPreferences.load()
        super.init()
        setupNotificationObservers()
        configureAudioSession()
    }

    // MARK: - Public Methods

    /// Updates audio preferences and applies changes
    func updatePreferences(_ newPreferences: AudioPreferences) {
        let oldPreferences = preferences
        preferences = newPreferences
        preferences.save()

        // Handle immediate changes

        // If global mute turned on, stop all audio
        if newPreferences.globalMute && !oldPreferences.globalMute {
            stopAllAudio()
        }

        // If music disabled, stop music
        if !newPreferences.musicEnabled && oldPreferences.musicEnabled {
            stopMusic()
        }

        // Update volumes on playing audio
        updateVolumes()

        // Reconfigure audio session if mix setting changed
        if newPreferences.mixWithOthers != oldPreferences.mixWithOthers {
            configureAudioSession()
        }
    }

    /// Plays a sound effect (if enabled)
    /// - Parameter sound: The sound effect to play
    func playSFX(_ sound: SoundEffect) {
        guard preferences.canPlaySFX else { return }

        // Check if we have a cached player
        if let player = sfxPlayers[sound] {
            player.volume = preferences.effectiveSFXVolume
            player.currentTime = 0
            player.play()
            return
        }

        // Try to create a new player
        guard let url = Bundle.main.url(forResource: sound.resourceName, withExtension: sound.fileExtension) else {
            // Audio file not found - this is expected during MVP (no assets yet)
            // Log but don't show error to user
            print("AudioManager: Sound effect '\(sound.resourceName)' not found in bundle")
            return
        }

        do {
            let player = try AVAudioPlayer(contentsOf: url)
            player.volume = preferences.effectiveSFXVolume
            player.prepareToPlay()
            sfxPlayers[sound] = player
            player.play()
        } catch {
            print("AudioManager: Failed to play sound effect '\(sound.displayName)': \(error.localizedDescription)")
        }
    }

    /// Starts playing a music track (if enabled)
    /// - Parameter track: The music track to play
    /// - Parameter loop: Whether to loop the track (default: true)
    func playMusic(_ track: MusicTrack, loop: Bool = true) {
        guard preferences.canPlayMusic else { return }

        // Stop any currently playing music
        stopMusic()

        guard let url = Bundle.main.url(forResource: track.resourceName, withExtension: track.fileExtension) else {
            print("AudioManager: Music track '\(track.resourceName)' not found in bundle")
            return
        }

        do {
            let player = try AVAudioPlayer(contentsOf: url)
            player.volume = preferences.effectiveMusicVolume
            player.numberOfLoops = loop ? -1 : 0
            player.delegate = self
            player.prepareToPlay()
            musicPlayer = player
            currentMusicTrack = track
            player.play()
            isMusicPlaying = true
        } catch {
            print("AudioManager: Failed to play music '\(track.displayName)': \(error.localizedDescription)")
        }
    }

    /// Stops currently playing music
    func stopMusic() {
        musicPlayer?.stop()
        musicPlayer = nil
        currentMusicTrack = nil
        isMusicPlaying = false
    }

    /// Pauses currently playing music
    func pauseMusic() {
        guard isMusicPlaying else { return }
        musicPlayer?.pause()
        isMusicPlaying = false
    }

    /// Resumes paused music
    func resumeMusic() {
        guard !isMusicPlaying, musicPlayer != nil, preferences.canPlayMusic else { return }
        musicPlayer?.play()
        isMusicPlaying = true
    }

    /// Stops all audio (SFX and music)
    func stopAllAudio() {
        // Stop all SFX players
        for player in sfxPlayers.values {
            player.stop()
        }
        sfxPlayers.removeAll()

        // Stop music
        stopMusic()
    }

    /// Plays a preview sound effect for settings testing
    func playPreviewSFX() {
        playSFX(.celebration)
    }

    /// Plays a preview of music for settings testing
    func playPreviewMusic() {
        // Play a short clip, don't loop
        if let track = MusicTrack.allCases.first {
            playMusic(track, loop: false)

            // Stop after 5 seconds
            Task {
                try? await Task.sleep(nanoseconds: 5_000_000_000)
                await MainActor.run {
                    if self.currentMusicTrack == track {
                        self.stopMusic()
                    }
                }
            }
        }
    }

    // MARK: - Private Methods

    /// Configures the AVAudioSession based on current preferences
    private func configureAudioSession() {
        let session = AVAudioSession.sharedInstance()

        do {
            if preferences.mixWithOthers {
                // Mix with other apps (podcasts, music continue playing)
                try session.setCategory(.ambient, mode: .default, options: [.mixWithOthers])
            } else {
                // Take exclusive control (other apps pause)
                try session.setCategory(.playback, mode: .default, options: [])
            }
            try session.setActive(true)
            isAudioSessionConfigured = true
        } catch {
            print("AudioManager: Failed to configure audio session: \(error.localizedDescription)")
        }
    }

    /// Updates volume on currently playing audio
    private func updateVolumes() {
        // Update SFX volumes
        for player in sfxPlayers.values {
            player.volume = preferences.effectiveSFXVolume
        }

        // Update music volume
        musicPlayer?.volume = preferences.effectiveMusicVolume
    }

    /// Sets up notification observers for audio interruptions and route changes
    private func setupNotificationObservers() {
        // Audio interruption (phone calls, Siri, etc.)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAudioInterruption),
            name: AVAudioSession.interruptionNotification,
            object: nil
        )

        // Route change (headphones plugged/unplugged)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleRouteChange),
            name: AVAudioSession.routeChangeNotification,
            object: nil
        )
    }

    @objc private func handleAudioInterruption(notification: Notification) {
        guard let userInfo = notification.userInfo,
              let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: typeValue) else {
            return
        }

        switch type {
        case .began:
            // Interruption started (phone call, Siri, etc.)
            musicWasPlayingBeforeInterruption = isMusicPlaying
            pauseMusic()

        case .ended:
            // Interruption ended
            if let optionsValue = userInfo[AVAudioSessionInterruptionOptionKey] as? UInt {
                let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
                if options.contains(.shouldResume) && musicWasPlayingBeforeInterruption {
                    resumeMusic()
                }
            }
            musicWasPlayingBeforeInterruption = false

        @unknown default:
            break
        }
    }

    @objc private func handleRouteChange(notification: Notification) {
        guard let userInfo = notification.userInfo,
              let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
              let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue) else {
            return
        }

        switch reason {
        case .oldDeviceUnavailable:
            // Headphones unplugged - pause music (standard iOS behavior)
            pauseMusic()
        default:
            break
        }
    }
}

// MARK: - AVAudioPlayerDelegate

extension AudioManager: AVAudioPlayerDelegate {
    nonisolated func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        Task { @MainActor in
            // Music finished playing (only matters for non-looping tracks)
            if player === musicPlayer {
                isMusicPlaying = false
                currentMusicTrack = nil
            }
        }
    }

    nonisolated func audioPlayerDecodeErrorDidOccur(_ player: AVAudioPlayer, error: Error?) {
        print("AudioManager: Audio decode error: \(error?.localizedDescription ?? "Unknown error")")
    }
}
