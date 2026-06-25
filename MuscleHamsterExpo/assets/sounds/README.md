# Audio Assets — Drop-In Guide

SFX go in this folder (`assets/sounds/`) as `.wav`. Music goes in `assets/music/` as `.mp3`.
Wired in `src/services/AudioService.js` via `require('../../assets/sounds/<name>.wav')`.

Status: ⬜ needed · ✅ sourced & wired · 🤖 Claude generates · 🎧 needs ear-curation

## ⚠️ Important — audio is not audible in-app YET
The play functions (`playSFX`, `playMusic`) exist but are **not called anywhere** in the app, and
`FeatureFlags.audioSystem` is still `false`. To make sounds actually play, a follow-up is needed:
(1) add `playSFX(SoundEffect.X)` call-sites at the right moments, (2) initialize AudioService in App.js,
(3) flip the flag. Sourcing the files (below) is step 0.

## ✅ Already sourced & wired (CC0 — no attribution required)
These were auto-sourced from Kenney CC0 packs, converted to mono 44.1kHz WAV, loudness-normalized.
They're generic/safe; **audition and swap any you don't love** (just drop a replacement with the same name).
- ✅ `button_tap.wav`          ← Kenney *Interface Sounds* `click_001`
- ✅ `exercise_transition.wav` ← Kenney *Interface Sounds* `switch_001`
- ✅ `streak_increment.wav`    ← Kenney *Interface Sounds* `confirmation_001`
- ✅ `purchase.wav`            ← Kenney *Casino Audio* `chips-stack-1`

## 🎧 Still needed — best hand-picked by ear (carry the app's "cozy" character)
- ⬜ `workout_complete.wav`  — warm "ta-da" — Mixkit Win: "Achievement bell"  https://mixkit.co/free-sound-effects/win/
- ⬜ `points_earned.wav`     — bright sparkle — Mixkit Coin: "Fairy arcade sparkle"  https://mixkit.co/free-sound-effects/coin/
- ⬜ `celebration.wav`       — fuller fanfare — Mixkit Win: "Magic sweep game trophy"
- ⬜ `level_up.wav`          — big win — Mixkit Game: "Game experience level increased"  https://mixkit.co/free-sound-effects/game/
- ⬜ `workout_start.wav`     — "power up" cue — Pixabay "power up"  https://pixabay.com/sound-effects/search/power%20up/
- ⬜ `hamster_happy.wav`     — cute squeak (CC0) — Freesound semccab  https://freesound.org/people/semccab/sounds/154381/
- 🤖 `hamster_excited.wav`   — Claude pitches up `hamster_happy` once it exists

## Music (Phase 3 — defer) → ../music/
⬜ `workout_upbeat.mp3` · ⬜ `workout_chill.mp3` · ⬜ `workout_intense.mp3` · ⬜ `ambient.mp3` — Pixabay Music (no attribution), 1–2 min loops.

## Licensing
Kenney + Pixabay + Freesound-CC0 = no attribution. Mixkit = free commercial, no attribution (don't redistribute raw).
iOS note: no `.ogg` (Claude converts to `.wav`).
