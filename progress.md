# Muscle Hamster — Progress

**Status:** 🚀 BUILD 26 SUBMITTED — AWAITING APPLE REVIEW
**Version:** 1.0.0 (Build 26)
**Last Updated:** Mar 11, 2026 (Session 57)

---

## App Store Details

| Field | Value |
|-------|-------|
| App ID | 6759973700 |
| Bundle ID | com.musclehamster.app |
| Version | 1.0.0 (Build 26) |
| Status | Waiting for Review |
| Privacy Policy | https://waxysplash.github.io/MuscleHamster/privacy-policy.html |
| Terms of Service | https://waxysplash.github.io/MuscleHamster/terms-of-service.html |
| App Store Connect | https://appstoreconnect.apple.com/apps/6759973700 |

---

## What's Next

### Post-Approval
- [ ] App approved and live on App Store
- [ ] Monitor user feedback and reviews
- [ ] Plan v1.1 features (Social, Workouts library, etc.)
- [ ] Android release via Google Play

### Deferred to v1.1+
- Social features (friends, nudges, friend streaks)
- Workout library + player (browse workouts)
- Rest day check-ins
- Transaction history
- Advanced notifications
- Audio system
- Exercise illustrations

---

## Technical Reference

### Project Structure
```
MuscleHamsterExpo/           <- The app (React Native + Expo)
├── src/
│   ├── components/          <- Shared UI components
│   ├── screens/             <- All screens
│   ├── services/            <- Business logic
│   ├── context/             <- React contexts (Auth, Activity, Inventory, etc.)
│   └── config/              <- FeatureFlags.js, AssetImages.js
├── assets/images/           <- Hamster art, shop items, backgrounds
├── docs/                    <- App Store prep, privacy policy
└── app.config.js            <- Expo config (reads env vars)
```

### Firebase
- **Project ID**: muscle-hamster
- **Console**: https://console.firebase.google.com/
- **Collections**: users, userStats, inventory, customWorkouts, userFavorites
- **EAS Secrets**: 9 environment variables configured for production builds

### Key Files
| File | Purpose |
|------|---------|
| `app.config.js` | Expo config with Firebase env vars |
| `src/config/firebase.js` | Firebase initialization (wrapped in try-catch) |
| `src/context/AuthContext.js` | Auth state management |
| `src/services/LoggerService.js` | Crashlytics integration |

### Quick Commands
```bash
cd "C:\Users\kamal\Downloads\Muscle Hmaster\Muscle Hmaster\MuscleHamsterExpo"
npx expo start                                    # Run locally
eas build --platform ios --profile production     # Production build
eas submit --platform ios                         # Submit to App Store
```

---

## Build History

| Build | Date | Status | Notes |
|-------|------|--------|-------|
| Build 26 | Mar 11, 2026 | Awaiting Review | New code additions |
| Build 22 | Mar 10, 2026 | Superseded | Fixed react-native-svg version |
| Build 21 | Mar 10, 2026 | Rejected | - |
| Build 20 | Mar 10, 2026 | Rejected | Account deletion + age rating fixes |
| Build 6 | Mar 8, 2026 | Rejected | White screen - Firebase env vars missing |
| Build 5 | Mar 5, 2026 | Rejected | iPad crash |

---

## Session Log

### Session 57 (Mar 11, 2026)
- Built and submitted **Build 26** to App Store Connect
- User added new code since Build 22
- Submitted via EAS Submit

### Session 56 (Mar 10, 2026)
- **Pre-submission App Store review audit**
- Researched common App Store rejection reasons (2025-2026)
- Verified all critical areas pass Apple review:
  - Account deletion: ✅ Working (two-step confirmation + re-auth)
  - Privacy Policy: ✅ Live at correct URL
  - Terms of Service: ✅ Live at correct URL
  - No "Coming Soon" stubs: ✅ All deferred features hidden via FeatureFlags
  - Debug logging: ✅ Only in dev mode (`__DEV__`)
  - iPad support: ✅ Responsive design in `src/utils/responsive.js`
- Created comprehensive **Review Notes** for App Store Connect
- Confirmed Age Rating (9+) aligns with onboarding age gate
- Ready for Apple review

### Session 55 (Mar 10, 2026)
- Fixed GitHub Pages 404 error for Privacy Policy and Terms of Service
- Created `docs/terms-of-service.html` (matching privacy policy style)
- Updated SettingsScreen.js to use correct Terms of Service URL
- Fixed GitHub Pages: copied docs to repo root `/docs/` (was nested in MuscleHamsterExpo)
- Both pages now live:
  - https://waxysplash.github.io/MuscleHamster/privacy-policy.html
  - https://waxysplash.github.io/MuscleHamster/terms-of-service.html
- Fixed account deletion `auth/requires-recent-login` error:
  - Added `reauthenticate()` function to AuthContext
  - Added password prompt modal in AccountSettingsScreen
  - User enters password to re-authenticate, then deletion proceeds

### Session 54 (Mar 10, 2026)
- **Build 20 rejected** - Two issues:
  1. Account deletion was "Coming Soon" - Apple requires working deletion
  2. Age Rating metadata had "In-App Controls" marked but not implemented
- **Fixed account deletion**:
  - Added `deleteAccount()` function to AuthContext.js
  - Deletes all Firestore data (users, userStats, inventory, exerciseJournals, userFavorites, customWorkouts)
  - Deletes Firebase Auth account
  - Clears AsyncStorage
  - Two-step confirmation dialog
  - Loading overlay during deletion
- **TODO**: Update Age Rating in App Store Connect (set Parental Controls and Age Assurance to "None")
- Ready for Build 21

### Session 53 (Mar 10, 2026)
- Organized project files
- Archived historical planning docs to `_archive/`
- Compacted progress.md

### Session 52 (Mar 9, 2026)
- Fixed Build 6 rejection (white screen crash)
- Root cause: Firebase credentials not in EAS cloud builds
- Created 9 EAS environment variables for Firebase config
- Added defensive null checks in AuthContext, DailyExerciseCheckInScreen, WorkoutPlayerScreen, InventoryItemPreviewScreen
- Submitted Build 20

---

## Archived Documentation

Historical planning documents moved to `_archive/`:
- Development phases (00-11) — All implemented
- PRD, art prompts, style guides
- Session notes (1-51)

See `_archive/README.md` for details.
