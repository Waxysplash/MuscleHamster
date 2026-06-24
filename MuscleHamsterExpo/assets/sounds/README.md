# Audio Assets — Drop-In Guide

SFX go in this folder (`assets/sounds/`) as `.wav`. Music goes in `assets/music/` as `.mp3`.
Drop the downloaded files in here with the **exact filenames below** (or hand them to Claude unnamed and he'll rename/normalize them). Then Claude wires `src/services/AudioService.js`, flips `FeatureFlags.audioSystem = true`, and the Settings audio screen does the rest.

Status legend:  ⬜ = needed   ✅ = added   🤖 = Claude generates it

## Phase 1 — core 5
- ⬜ `button_tap.wav`        — soft pop (~80ms)            — Pixabay "pop"  https://pixabay.com/sound-effects/search/pop/
- ⬜ `workout_complete.wav`  — "Achievement bell" (0:02)   — Mixkit Win   https://mixkit.co/free-sound-effects/win/
- ⬜ `points_earned.wav`     — "Fairy arcade sparkle" (0:01)— Mixkit Coin  https://mixkit.co/free-sound-effects/coin/
- ⬜ `celebration.wav`       — "Magic sweep game trophy"(0:03)— Mixkit Win https://mixkit.co/free-sound-effects/win/
- ⬜ `hamster_happy.wav`     — "squeak.wav" by semccab (CC0)— Freesound  https://freesound.org/people/semccab/sounds/154381/

## Phase 2 — secondary 6
- ⬜ `workout_start.wav`        — short "power up" cue       — Pixabay "power up"
- ⬜ `exercise_transition.wav`  — "Explainer light pop"(0:01)— Mixkit Whoosh https://mixkit.co/free-sound-effects/whoosh/
- ⬜ `streak_increment.wav`     — "Melodic bonus collect"(0:02)— Mixkit Win
- ⬜ `level_up.wav`             — "Game experience level increased"(0:03)— Mixkit Game https://mixkit.co/free-sound-effects/game/
- ⬜ `purchase.wav`            — "Clinking coins" (0:01)     — Mixkit Money https://mixkit.co/free-sound-effects/money/
- 🤖 `hamster_excited.wav`      — Claude pitches up hamster_happy (no download)

## Phase 3 — music (defer past first audio build) → put in ../music/
- ⬜ `workout_upbeat.mp3` · ⬜ `workout_chill.mp3` · ⬜ `workout_intense.mp3` · ⬜ `ambient.mp3`
  All from Pixabay Music (no attribution): https://pixabay.com/music/   | MP3 ~128kbps, 1–2 min seamless loop

## Licensing (all safe for a paid app)
CC0 (Kenney/Freesound semccab) + Pixabay = no attribution. Mixkit = free commercial, no attribution (don't redistribute raw file standalone). Avoid Non-Commercial; avoid Incompetech unless adding credits.

## iOS note
iOS (expo-av) won't play `.ogg`. Mixkit/Pixabay give `.wav`/`.mp3` = fine. Claude normalizes loudness + trims silence before wiring.

(Full prose version also at: C:\Users\kamal\Downloads\MuscleHamster_Audio_BuildPrep.md)
