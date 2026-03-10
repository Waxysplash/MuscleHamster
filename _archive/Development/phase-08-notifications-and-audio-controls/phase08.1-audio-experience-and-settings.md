# Phase 08.1 — Audio Experience and Settings

## Header
- **Goal:** Implement sound/music controls with persistence, global mute, and category toggles that respect user expectations and iOS audio behavior.
- **Status:** Implementation Ready
- **Priority:** MEDIUM
- **Dependencies:** Phase 01.3 (Settings shell), Phase 05.1 (Workout player context)
- **Platforms:** iOS (15+)

---

## Context

The app has several audio contexts:
1. **Sound Effects (SFX)**: Short audio cues for UI interactions, workout transitions, celebrations, and hamster reactions
2. **Music**: Background workout music and ambient sounds
3. **Haptics**: Device vibrations (handled separately, not audio)

Users expect granular control over audio, and the app must play nicely with other audio sources (podcasts, music apps).

---

## Data Model

### AudioPreferences

```
AudioPreferences:
  - globalMute: Bool (default: false) — Master switch, disables ALL audio
  - soundEffectsEnabled: Bool (default: true) — SFX like taps, celebrations, workout cues
  - musicEnabled: Bool (default: true) — Background music during workouts
  - soundEffectsVolume: Float (0.0-1.0, default: 0.8) — Volume level for SFX
  - musicVolume: Float (0.0-1.0, default: 0.5) — Volume level for music
```

**Persistence:** UserDefaults via @AppStorage keys:
- `audio_globalMute`
- `audio_sfxEnabled`
- `audio_musicEnabled`
- `audio_sfxVolume`
- `audio_musicVolume`

### Category Definitions

| Category | Description | Examples | Default |
|----------|-------------|----------|---------|
| Sound Effects | Short UI feedback sounds | Button taps, workout start/stop chimes, exercise transitions, celebration sounds, hamster reactions | ON |
| Music | Longer background audio | Workout background music, ambient sounds | ON |

---

## UX Requirements

### Settings > Audio Section (SettingsView)

The existing audio section in SettingsView should be enhanced:

1. **Global Mute Toggle** (NEW)
   - Icon: `speaker.slash.fill` when muted, `speaker.wave.2.fill` when active
   - Title: "Mute All Audio"
   - Subtitle: "Silences all sounds and music"
   - When ON: All audio disabled, other toggles appear disabled (grayed out)
   - VoiceOver: "Mute All Audio. Currently [on/off]. Double tap to toggle."

2. **Sound Effects Toggle** (existing, enhance)
   - Icon: `speaker.wave.2.fill`
   - Title: "Sound Effects"
   - Subtitle: "Workout cues, celebrations, and UI sounds"
   - VoiceOver: "Sound Effects. Currently [on/off]. Double tap to toggle."
   - Disabled appearance when globalMute is ON

3. **Music Toggle** (existing, enhance)
   - Icon: `music.note`
   - Title: "Music"
   - Subtitle: "Background music during workouts"
   - VoiceOver: "Music. Currently [on/off]. Double tap to toggle."
   - Disabled appearance when globalMute is ON

4. **Audio Settings Link** (existing)
   - Navigate to AudioSettingsView for volume controls and additional options

### AudioSettingsView (Full Implementation)

Transform from placeholder to functional view:

**Layout:**
```
Navigation Title: "Audio Settings"

[If globalMute is ON]
  Banner: "Audio is muted. Turn off 'Mute All Audio' in Settings to hear sounds."

Section: "Volume Levels"
  - Sound Effects Volume slider (0-100%)
    - Icon preview: speaker.wave.1/2/3 based on level
    - Disabled if globalMute ON or sfxEnabled OFF
  - Music Volume slider (0-100%)
    - Icon preview: based on level
    - Disabled if globalMute ON or musicEnabled OFF

Section: "Audio Behavior"
  - "Mix with Other Apps" toggle (default: ON)
    - Subtitle: "Play music from other apps alongside workouts"
    - When ON: Uses .mixWithOthers audio session option
    - When OFF: App audio takes priority, other apps pause

Section: "Test Sounds"
  - "Preview Sound Effect" button
    - Plays a sample SFX (celebration chime)
    - Disabled if muted or SFX off
  - "Preview Music" button
    - Plays a short music sample
    - Disabled if muted or music off

Footer text: "Your hamster appreciates a good soundtrack!"
```

**Persistence Keys:**
- `audio_mixWithOthers` (Bool, default: true)

---

## Audio Service Layer

### AudioManager (Singleton)

Create an audio management service that centralizes audio playback:

```
AudioManager:
  Properties:
    - preferences: AudioPreferences (loaded from UserDefaults)
    - sfxPlayer: AVAudioPlayer? (for sound effects)
    - musicPlayer: AVAudioPlayer? (for background music)
    - isPlaying: Bool
    - currentTrack: String?

  Methods:
    - playSFX(named:) — Plays a sound effect if enabled
    - playMusic(named:) — Starts background music if enabled
    - stopMusic() — Stops current music
    - pauseMusic() — Pauses current music (for interruptions)
    - resumeMusic() — Resumes paused music
    - updateVolumes() — Applies current volume settings
    - configureAudioSession() — Sets up AVAudioSession
```

**Audio Session Configuration:**
- Category: `.playback` or `.ambient` based on mixWithOthers preference
- Mode: `.default`
- Options: `.mixWithOthers` when enabled
- Must handle:
  - Interruptions (phone calls, Siri)
  - Route changes (headphones plugged/unplugged)
  - Background/foreground transitions

---

## Behavior Requirements

### Global Mute Behavior

When `globalMute` is ON:
- ALL app audio stops immediately (SFX and music)
- Volume sliders appear disabled
- Category toggles appear disabled (but retain their values)
- Music playback stops if currently playing
- System sounds (keyboard clicks, lock sounds) are NOT affected

When `globalMute` turns OFF:
- Audio resumes based on individual category settings
- Music does NOT auto-resume (user must restart workout)

### Category Toggle Behavior

When toggling SFX OFF:
- Any queued sound effects are cancelled
- Change is immediate

When toggling Music OFF:
- Currently playing music stops immediately
- Change is immediate

When toggling categories ON:
- SFX: Next sound effect will play
- Music: Music resumes on next workout start (not auto-resume)

### Volume Changes

- Volume changes are immediate (apply to currently playing audio)
- Sliders should show visual feedback
- Optional: Play a short sample when slider is released (like iOS volume HUD)

### Workout Context

During active workout:
- Toggling audio mid-workout applies immediately
- If user mutes during workout → audio stops → workout continues normally
- If user re-enables → sounds resume from next trigger point (no catchup)

### iOS Audio Coexistence

Default behavior (mixWithOthers ON):
- App audio plays alongside other apps (podcasts, music)
- App audio is mixed at app volume level
- When app goes to background, music continues (if supported)

Exclusive mode (mixWithOthers OFF):
- Other apps pause when workout music starts
- Other apps resume when workout ends
- Standard iOS audio session ducking behavior

### Background/Foreground

- **Backgrounding**: Music can continue (if enabled in capabilities)
- **Returning to foreground**: Audio state restored
- **App termination**: Preferences persist, music does NOT auto-resume on relaunch

---

## Error Handling

### Audio Playback Errors

- If audio file is missing: Log error, continue silently (no user-facing error)
- If audio session fails to configure: Log error, fall back to system defaults
- If playback fails: Log error, skip that sound

No blocking errors for audio issues — audio is enhancement, not core functionality.

---

## Accessibility

### VoiceOver

All controls must have:
- Clear accessibilityLabel
- Current value as accessibilityValue
- Action hint as accessibilityHint

Volume sliders:
- Announce percentage when adjusted
- Label format: "Sound Effects volume, 80 percent"

Muted state:
- Announce "Muted" when applicable
- Disabled controls should announce they are unavailable

### Motion & Sound Sensitivity

- Respect `accessibilityReduceMotion` for any audio-visual sync
- No required audio for core functionality (all audio is enhancement)
- Screen reader users can use app fully without audio

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Toggle mute while workout music playing | Music stops immediately, workout continues |
| Toggle sfx off, then mute on, then mute off | SFX remains off (individual setting preserved) |
| Change volume while nothing playing | New volume applies to next playback |
| Phone call during workout | Music pauses via interruption handler, resumes after call (if still in workout) |
| Headphones disconnected | Music pauses (iOS default behavior) |
| App killed during workout | On relaunch, preferences persist, workout state lost |
| Volume at 0% but enabled | Technically enabled but silent (valid state) |
| First app launch | All defaults apply (sfx ON, music ON, volumes at defaults) |

---

## Testing Requirements

### Functional Tests

1. **Persistence**
   - Toggle each setting, force quit app, relaunch → settings persist
   - Change volumes, relaunch → volumes persist

2. **Mute Behavior**
   - Enable mute → verify no audio plays anywhere
   - Disable mute → verify audio resumes per category settings

3. **Category Toggles**
   - SFX toggle controls sound effects independently
   - Music toggle controls music independently
   - Both respect global mute

4. **Volume Controls**
   - Volume changes apply immediately to playing audio
   - Sliders visually reflect current values
   - Preview buttons respect volume settings

5. **Audio Coexistence**
   - With mixWithOthers ON: other apps play alongside
   - With mixWithOthers OFF: other apps pause

6. **Workout Integration**
   - Mid-workout toggle changes apply immediately
   - Workout continues normally regardless of audio state

### Accessibility Tests

1. VoiceOver can navigate all controls
2. All toggles announce current state
3. Sliders announce percentage values
4. Disabled controls announce unavailable state

---

## Deliverables

1. **AudioPreferences model** — Persisted audio settings
2. **AudioManager service** — Centralized audio playback
3. **Updated SettingsView** — Global mute + enhanced toggles with persistence
4. **Rewritten AudioSettingsView** — Full volume controls and options
5. **Xcode project updates** — New files added

---

## Out of Scope (Future)

- Audio asset files (placeholder/silent stubs are acceptable for MVP)
- Per-exercise audio cues
- Custom workout playlists
- Apple Music / Spotify integration
- Background audio continuation (requires audio background mode capability)
