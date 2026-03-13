# Muscle Hamster — Progress

**Status:** v1.0.1 Building - Google Sign-In Fix
**Version:** 1.0.1 (Build 28)
**Last Updated:** Mar 13, 2026 (Session 60)

---

## App Store Details

| Field | Value |
|-------|-------|
| App ID | 6759973700 |
| Bundle ID | com.musclehamster.app |
| Live Version | 1.0.0 (Build 26) |
| Pending Version | 1.0.1 (Build 28) - Building |
| Privacy Policy | https://waxysplash.github.io/MuscleHamster/privacy-policy.html |
| Terms of Service | https://waxysplash.github.io/MuscleHamster/terms-of-service.html |
| App Store Connect | https://appstoreconnect.apple.com/apps/6759973700 |

---

## What's Next

### Immediate
- [ ] Build 28 completes (EAS building)
- [ ] Submit via `eas submit --platform ios`
- [ ] Create version 1.0.1 in App Store Connect
- [ ] Submit for review

### Post v1.0.1
- [x] App approved and live on App Store (v1.0.0)
- [ ] Monitor user feedback and reviews
- [ ] Plan v1.2 features (Social, etc.)
- [ ] Android release via Google Play

### Implemented in v1.1
- [x] Social features (friends, nudges, friend streaks, invite codes)
- [x] Friends tab in navigation
- [x] Push notifications for nudges and friend requests

### Deferred to v1.2+
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
- **Collections**: users, userStats, inventory, customWorkouts, userFavorites, friends, nudges, invites
- **EAS Secrets**: 9 environment variables configured for production builds
- **Cloud Functions**: Push notifications for nudges and friend requests (functions/index.js)

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
| Build 28 | Mar 13, 2026 | Building | v1.0.1 - Google Sign-In fix (native SDK) |
| Build 26 | Mar 11, 2026 | Live | v1.0.0 - First App Store release |
| Build 22 | Mar 10, 2026 | Superseded | Fixed react-native-svg version |
| Build 21 | Mar 10, 2026 | Rejected | - |
| Build 20 | Mar 10, 2026 | Rejected | Account deletion + age rating fixes |
| Build 6 | Mar 8, 2026 | Rejected | White screen - Firebase env vars missing |
| Build 5 | Mar 5, 2026 | Rejected | iPad crash |

---

## Session Log

### Session 60 (Mar 13, 2026)
**v1.0.1 Release - Google Sign-In Hotfix**

- Build 26 (v1.0.0) is live on the App Store
- Google Sign-In broken in v1.0.0 (WebView OAuth blocked by Google)
- Bumped version to 1.0.1 (Build 28)
- Building via EAS (last build credit this cycle)
- Next: Submit Build 28 → Create v1.0.1 in App Store Connect → Submit for review

### Session 59 (Mar 12, 2026)
**CRITICAL FIX: Google Sign-In "OAuth 2.0 policy" error**

**Root Cause:** App was using `expo-auth-session` with `Google.useIdTokenAuthRequest()`
which uses embedded WebViews. Google has blocked OAuth requests from embedded WebViews
since 2021 as a security measure (man-in-the-middle attack prevention).

**Solution:** Replaced with `@react-native-google-signin/google-signin` which uses
the native Google Sign-In SDK (compliant with Google's OAuth 2.0 policies).

**Changes Made:**
1. Installed `@react-native-google-signin/google-signin` package
2. Added config plugin to `app.config.js`
3. Rewrote `SocialAuthService.js` to use native `GoogleSignin.signIn()`
4. Simplified `useGoogleAuth.js` hook to use new native sign-in
5. Updated `AuthContext.js` to sign out from Google on logout
6. Incremented build number to 27

**Files Changed:**
- `package.json` - Added @react-native-google-signin/google-signin
- `app.config.js` - Added config plugin, bumped build to 27
- `src/services/SocialAuthService.js` - Complete rewrite for native SDK
- `src/hooks/useGoogleAuth.js` - Simplified to use SocialAuthService
- `src/context/AuthContext.js` - Added Google sign-out on logout

**Next Steps:**
1. Build: `eas build --platform ios --profile production`
2. Submit: `eas submit --platform ios`
3. Test Google Sign-In in production build

### Session 58 (Mar 11, 2026)
**v1.1 Social Features Implementation**

Migrated social features from AsyncStorage to Firebase Firestore:

1. **FriendService.js** - Complete rewrite for Firebase
   - Invite code system (MH-XXXXXX format)
   - Friends collection with status tracking
   - Nudges collection with read status
   - Invites collection for invite codes
   - Real-time listeners for requests and nudges
   - Offline cache support

2. **FriendContext.js** - Updated for Firebase
   - Real-time subscriptions to friend requests and nudges
   - Invite code actions (getInviteCode, lookupInviteCode, useInviteCode)
   - Push token management

3. **AddFriendsScreen.js** - Redesigned for invite codes
   - Display user's invite code with copy/share
   - Enter friend's code to send request
   - "How it works" explainer
   - Cream/brown color scheme matching app

4. **NotificationService.js** - Push token support
   - registerForPushNotifications() for Expo push tokens
   - Store tokens in Firestore for users
   - clearPushToken() on logout

5. **Cloud Functions** (functions/index.js)
   - onNudgeCreated - sends push notification when nudge is created
   - onFriendRequestCreated - notifies recipient of new request
   - onFriendRequestAccepted - notifies sender when accepted
   - sendPushNotification - callable function for manual sends

6. **FeatureFlags.js** - Enabled social features

7. **MainTabNavigator.js** - Added Friends tab

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
