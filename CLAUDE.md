# Muscle Hamster — Claude Code Context

## What Is This App?

A self-care fitness app where users complete short workouts to earn points and care for a virtual hamster. The hamster is **hungry, not angry** — no guilt, no shame, just gentle accountability. Users build streaks, customize their hamster, and connect with friends.

## Project Status

**Post-MVP — Content & Asset Production (Session 36+)**

- Phases 01–09: COMPLETE (all core features implemented)
- Phase 10 (Hamster Appearance & Enclosure): 10.1 done, waiting on artist assets
- 24 real workouts written with proper exercises and form cues
- 75+ unit tests passing

**What's left before launch:**
1. Hamster artwork (need artist — style guide ready at `Assets/hamster-character-style-guide.md`)
2. Exercise illustrations (~30-50 images)
3. Audio assets (music + SFX)
4. Ad integration (post-MVP)

## Two Codebases

| | Native iOS | Expo (Cross-Platform) |
|---|---|---|
| Path | `MuscleHamster/` | `MuscleHamsterExpo/` |
| Language | Swift / SwiftUI | JavaScript / React Native |
| Target | iOS 15+ | iOS + Android |
| State | Primary, fully implemented | Port of native app |
| Run | Xcode | `cd MuscleHamsterExpo && npm install && npx expo start` |

## Key Files — Read These First

| File | Purpose |
|------|---------|
| `progress.md` | Current status, what's done, what's next, open questions, decisions log |
| `A1-new-session-instructions.md` | Session rules, product principles, MVP scope, terminology |
| `muscle-hamster-prd.md` | Full product requirements |
| `md-file-creation-instructions-for-new-phases.md` | How to write phase docs |
| `Assets/hamster-character-style-guide.md` | Artist handoff guide for hamster art |

## Session Protocol

### Start of session
1. Read `progress.md` for current status
2. Read `A1-new-session-instructions.md` for rules
3. Check the relevant phase doc in `Development/` if doing feature work

### End of session
1. Update `progress.md` (mark completed items, update status, log decisions)
2. Commit and push:
   ```
   git add .
   git commit -m "Session N: <what you did>"
   git push
   ```

## Project Structure

```
MuscleHamster-main/
├── CLAUDE.md                    ← You are here
├── progress.md                  ← Current status & decisions
├── A1-new-session-instructions.md
├── muscle-hamster-prd.md
├── Assets/                      ← Art style guides
├── Development/                 ← Phase docs (phase-00 through phase-10)
│   ├── phase-00-mvp-overview-execution-guidelines/
│   ├── phase-01-app-shell-core-navigation/
│   ├── ...through phase-10...
├── MuscleHamster/               ← Native iOS app (Swift/SwiftUI)
│   ├── MuscleHamsterApp.swift   ← App entry point
│   ├── Models/                  ← Data models (UserProfile, Workout, ShopItem, Friend, etc.)
│   ├── Services/                ← Business logic (Auth, Workout, Shop, Friend, Audio, Notifications)
│   ├── Views/                   ← All UI (Auth, Home, Workout, Settings, Shop, Social, Shared)
│   ├── Utilities/               ← Logger, Persistence helpers
│   └── Assets.xcassets/         ← Images, colors, app icon
├── MuscleHamsterExpo/           ← Expo/React Native cross-platform port
│   ├── src/components/          ← Shared UI components
│   ├── src/screens/             ← Screen-level views
│   ├── src/services/            ← Business logic
│   ├── src/models/              ← Data models
│   ├── src/context/             ← React context providers (Auth, Activity, Friend, etc.)
│   └── src/navigation/          ← Tab + stack navigation
└── MuscleHamsterTests/          ← Unit tests (75+)
```

## Non-Negotiable Rules

- **Tone**: Warm, playful, kind. NEVER guilt, shame, or pressure the user.
- **Hamster states**: fed/happy, chillin', hungry, sad/neglected — hungry means gentle, not angry.
- **Accessibility**: VoiceOver support, 44x44pt touch targets, sufficient contrast.
- **No guilt language** in any user-facing copy, notifications, or UI feedback.

## Tech Decisions Already Made

- **Auth**: Email/password + Apple/Google social login (MockAuthService for now)
- **Persistence**: UserDefaults via PersistenceHelper (no backend yet)
- **Logging**: OSLog-based AppLogger (not print statements)
- **Offline**: Online-only for MVP; local persistence covers app relaunch state
- **Workout visuals**: Static illustrations (not hamster demos) — deferred to post-launch
- **Growth thresholds**: Baby→Juvenile (5 workouts OR 7-day streak), Juvenile→Adult (25 workouts OR 21-day streak), Adult→Mature (75 workouts OR 60-day streak)

## Git

- **Repo**: https://github.com/Waxysplash/MuscleHamster
- **Branch**: `main`
- **Push at end of every session**
