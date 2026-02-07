//
//  AudioSettingsView.swift
//  MuscleHamster
//
//  Audio settings with volume controls and preferences
//  Phase 08.1: Audio Experience and Settings
//

import SwiftUI

struct AudioSettingsView: View {
    // Audio preferences with persistence
    @AppStorage(AudioPreferencesKey.globalMute) private var globalMute = AudioPreferences.defaultGlobalMute
    @AppStorage(AudioPreferencesKey.sfxEnabled) private var sfxEnabled = AudioPreferences.defaultSfxEnabled
    @AppStorage(AudioPreferencesKey.musicEnabled) private var musicEnabled = AudioPreferences.defaultMusicEnabled
    @AppStorage(AudioPreferencesKey.sfxVolume) private var sfxVolume = Double(AudioPreferences.defaultSfxVolume)
    @AppStorage(AudioPreferencesKey.musicVolume) private var musicVolume = Double(AudioPreferences.defaultMusicVolume)
    @AppStorage(AudioPreferencesKey.mixWithOthers) private var mixWithOthers = AudioPreferences.defaultMixWithOthers

    // State for preview feedback
    @State private var isPlayingPreviewSFX = false
    @State private var isPlayingPreviewMusic = false

    /// Whether SFX volume slider should be enabled
    private var canAdjustSFXVolume: Bool {
        !globalMute && sfxEnabled
    }

    /// Whether music volume slider should be enabled
    private var canAdjustMusicVolume: Bool {
        !globalMute && musicEnabled
    }

    /// Whether previews are available
    private var canPreviewSFX: Bool {
        !globalMute && sfxEnabled
    }

    private var canPreviewMusic: Bool {
        !globalMute && musicEnabled
    }

    var body: some View {
        List {
            if globalMute {
                mutedBanner
            }

            volumeSection
            behaviorSection
            testSoundsSection
        }
        .navigationTitle("Audio Settings")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Muted Banner

    private var mutedBanner: some View {
        Section {
            HStack(spacing: 12) {
                Image(systemName: "speaker.slash.fill")
                    .font(.title2)
                    .foregroundStyle(.orange)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Audio is muted")
                        .font(.subheadline)
                        .fontWeight(.medium)

                    Text("Turn off 'Mute All Audio' in Settings to hear sounds.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.vertical, 4)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Audio is muted. Turn off Mute All Audio in Settings to hear sounds.")
    }

    // MARK: - Volume Section

    private var volumeSection: some View {
        Section {
            // Sound Effects Volume
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: sfxVolumeIcon)
                        .font(.title3)
                        .foregroundStyle(canAdjustSFXVolume ? .accentColor : .secondary)
                        .frame(width: 28)

                    Text("Sound Effects")
                        .foregroundStyle(canAdjustSFXVolume ? .primary : .secondary)

                    Spacer()

                    Text("\(Int(sfxVolume * 100))%")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .monospacedDigit()
                }

                Slider(value: $sfxVolume, in: 0...1, step: 0.05) {
                    Text("Sound Effects Volume")
                } minimumValueLabel: {
                    Image(systemName: "speaker.fill")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                } maximumValueLabel: {
                    Image(systemName: "speaker.wave.3.fill")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .disabled(!canAdjustSFXVolume)
                .onChange(of: sfxVolume) { _, _ in
                    updateAudioManager()
                }
            }
            .padding(.vertical, 4)
            .opacity(canAdjustSFXVolume ? 1.0 : 0.5)
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Sound Effects volume")
            .accessibilityValue(canAdjustSFXVolume ? "\(Int(sfxVolume * 100)) percent" : "Unavailable")
            .accessibilityHint(canAdjustSFXVolume ? "Adjust with swipe up or down" : (globalMute ? "Unmute audio first" : "Enable sound effects first"))

            // Music Volume
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "music.note")
                        .font(.title3)
                        .foregroundStyle(canAdjustMusicVolume ? .accentColor : .secondary)
                        .frame(width: 28)

                    Text("Music")
                        .foregroundStyle(canAdjustMusicVolume ? .primary : .secondary)

                    Spacer()

                    Text("\(Int(musicVolume * 100))%")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .monospacedDigit()
                }

                Slider(value: $musicVolume, in: 0...1, step: 0.05) {
                    Text("Music Volume")
                } minimumValueLabel: {
                    Image(systemName: "speaker.fill")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                } maximumValueLabel: {
                    Image(systemName: "speaker.wave.3.fill")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .disabled(!canAdjustMusicVolume)
                .onChange(of: musicVolume) { _, _ in
                    updateAudioManager()
                }
            }
            .padding(.vertical, 4)
            .opacity(canAdjustMusicVolume ? 1.0 : 0.5)
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Music volume")
            .accessibilityValue(canAdjustMusicVolume ? "\(Int(musicVolume * 100)) percent" : "Unavailable")
            .accessibilityHint(canAdjustMusicVolume ? "Adjust with swipe up or down" : (globalMute ? "Unmute audio first" : "Enable music first"))
        } header: {
            Text("Volume Levels")
        }
    }

    // MARK: - Behavior Section

    private var behaviorSection: some View {
        Section {
            Toggle(isOn: $mixWithOthers) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Mix with Other Apps")

                    Text("Play music from other apps alongside workouts")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .onChange(of: mixWithOthers) { _, _ in
                updateAudioManager()
            }
            .accessibilityLabel("Mix with Other Apps")
            .accessibilityValue(mixWithOthers ? "On" : "Off")
            .accessibilityHint("When on, your podcasts and music can play during workouts")
        } header: {
            Text("Audio Behavior")
        } footer: {
            Text(mixWithOthers
                ? "Other apps will continue playing alongside workout audio."
                : "Other apps will pause when workout audio plays.")
        }
    }

    // MARK: - Test Sounds Section

    private var testSoundsSection: some View {
        Section {
            // Preview Sound Effect Button
            Button {
                playPreviewSFX()
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: isPlayingPreviewSFX ? "speaker.wave.2.fill" : "play.circle.fill")
                        .font(.title3)
                        .foregroundStyle(canPreviewSFX ? .accentColor : .secondary)
                        .frame(width: 28)

                    Text("Preview Sound Effect")
                        .foregroundStyle(canPreviewSFX ? .primary : .secondary)

                    Spacer()

                    if isPlayingPreviewSFX {
                        ProgressView()
                            .scaleEffect(0.8)
                    }
                }
            }
            .disabled(!canPreviewSFX || isPlayingPreviewSFX)
            .opacity(canPreviewSFX ? 1.0 : 0.5)
            .accessibilityLabel("Preview Sound Effect")
            .accessibilityHint(canPreviewSFX ? "Double tap to hear a sample sound effect" : "Unavailable while muted or sound effects disabled")

            // Preview Music Button
            Button {
                playPreviewMusic()
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: isPlayingPreviewMusic ? "music.note" : "play.circle.fill")
                        .font(.title3)
                        .foregroundStyle(canPreviewMusic ? .accentColor : .secondary)
                        .frame(width: 28)

                    Text("Preview Music")
                        .foregroundStyle(canPreviewMusic ? .primary : .secondary)

                    Spacer()

                    if isPlayingPreviewMusic {
                        ProgressView()
                            .scaleEffect(0.8)
                    }
                }
            }
            .disabled(!canPreviewMusic || isPlayingPreviewMusic)
            .opacity(canPreviewMusic ? 1.0 : 0.5)
            .accessibilityLabel("Preview Music")
            .accessibilityHint(canPreviewMusic ? "Double tap to hear a sample of workout music" : "Unavailable while muted or music disabled")
        } header: {
            Text("Test Sounds")
        } footer: {
            Text("Your hamster appreciates a good soundtrack!")
        }
    }

    // MARK: - Helper Properties

    /// Icon for SFX volume based on level
    private var sfxVolumeIcon: String {
        if sfxVolume < 0.01 {
            return "speaker.fill"
        } else if sfxVolume < 0.34 {
            return "speaker.wave.1.fill"
        } else if sfxVolume < 0.67 {
            return "speaker.wave.2.fill"
        } else {
            return "speaker.wave.3.fill"
        }
    }

    // MARK: - Actions

    /// Updates AudioManager with current settings
    private func updateAudioManager() {
        let preferences = AudioPreferences(
            globalMute: globalMute,
            soundEffectsEnabled: sfxEnabled,
            musicEnabled: musicEnabled,
            soundEffectsVolume: Float(sfxVolume),
            musicVolume: Float(musicVolume),
            mixWithOthers: mixWithOthers
        )
        Task { @MainActor in
            AudioManager.shared.updatePreferences(preferences)
        }
    }

    /// Plays a preview sound effect
    private func playPreviewSFX() {
        isPlayingPreviewSFX = true
        Task { @MainActor in
            AudioManager.shared.playPreviewSFX()
            // Brief visual feedback
            try? await Task.sleep(nanoseconds: 500_000_000)
            isPlayingPreviewSFX = false
        }
    }

    /// Plays a preview of music
    private func playPreviewMusic() {
        isPlayingPreviewMusic = true
        Task { @MainActor in
            AudioManager.shared.playPreviewMusic()
            // Visual feedback for duration of preview (5 seconds)
            try? await Task.sleep(nanoseconds: 5_000_000_000)
            isPlayingPreviewMusic = false
        }
    }
}

#Preview("Normal") {
    NavigationStack {
        AudioSettingsView()
    }
}

#Preview("Muted") {
    NavigationStack {
        AudioSettingsView()
    }
    .onAppear {
        UserDefaults.standard.set(true, forKey: AudioPreferencesKey.globalMute)
    }
}
