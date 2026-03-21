# Muscle Hamster — Progress

**Status:** v1.0.3 (Build 41) - Submitted to TestFlight for testing
**Version:** 1.0.3 (Build 41) - Multi-workout selection + UI improvements
**Last Updated:** Mar 20, 2026 (Session 73)

---

## App Store Details

| Field | Value |
|-------|-------|
| App ID | 6759973700 |
| Bundle ID | com.musclehamster.app |
| Live Version | 1.0.0 (Build 26) |
| Pending Version | 1.0.1 - Submitted to App Store |
| Privacy Policy | https://waxysplash.github.io/MuscleHamster/privacy-policy.html |
| Terms of Service | https://waxysplash.github.io/MuscleHamster/terms-of-service.html |
| App Store Connect | https://appstoreconnect.apple.com/apps/6759973700 |

---

## What's Next

### Immediate
- [x] Build v1.0.1 (Google Sign-In fix)
- [x] Submit via EAS
- [ ] Create version 1.0.1 in App Store Connect
- [ ] Add release notes and submit for review
- [ ] v1.0.1 approved

### Post v1.0.1
- [x] App approved and live on App Store (v1.0.0)
- [ ] Monitor user feedback and reviews
- [ ] Plan v1.2 features (Social, etc.)
- [x] Android build completed (AAB ready)
- [x] Set up Google Play Developer account
- [ ] Submit Android to Google Play

### Google Play Submission (In Progress)
- [x] Created Google Play Developer account
- [x] Uploaded AAB (v1.0.1, version code 4)
- [x] Added app icon and feature graphic
- [x] Fixed privacy policy URL (was missing .html extension)
- [ ] Set up Closed Testing (required for new accounts)
- [ ] Recruit 12 testers to opt-in
- [ ] Wait 14 days of closed testing
- [ ] Apply for Production access
- [ ] Submit to Production

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
| v1.0.3 (Build 41) | Mar 20, 2026 | TestFlight | Multi-workout selection testing |
| v1.0.3 (Build 39) | Mar 19, 2026 | Superseded | Bug fixes, removed weekly setup modal |
| v1.0.3 (Build 38) | Mar 19, 2026 | Superseded | Weekly planner improvements + rest day popup |
| v1.0.3 (Build 37) | Mar 19, 2026 | Superseded | Color scheme fixes (60+ files) |
| v1.0.2 (Build 36) | Mar 18, 2026 | Submitted | UI updates, Cloud Functions |
| v1.0.1 | Mar 13, 2026 | Submitted | Google Sign-In fix (native SDK) |
| v1.0.0 (Build 26) | Mar 11, 2026 | Live | First App Store release |
| Build 22 | Mar 10, 2026 | Superseded | Fixed react-native-svg version |
| Build 21 | Mar 10, 2026 | Rejected | - |
| Build 20 | Mar 10, 2026 | Rejected | Account deletion + age rating fixes |
| Build 6 | Mar 8, 2026 | Rejected | White screen - Firebase env vars missing |
| Build 5 | Mar 5, 2026 | Rejected | iPad crash |

---

## Session Log

### Session 73 (Mar 20, 2026)
**Build 41 - TestFlight Testing**

- Bumped build number to 41 (Build 40 was already used on Expo)
- Built and submitted to TestFlight for testing
- Testing multi-workout selection and Session 72 changes

**Features to Test:**
1. Multi-workout selection (select multiple workouts per day)
2. "Save X Workouts" button confirms selection
3. Workout count badge on day cells
4. TodayWorkoutCard shows all scheduled workouts
5. Full day names (Monday instead of Mon)
6. Category images on workout cards
7. No "Rest Day" option in AddWorkoutModal

**Build:** v1.0.3 (Build 41) - Submitted to TestFlight

---

### Session 72 (Mar 19, 2026)
**Workout Planner Fixes + Multi-Workout Selection**

**Issues Fixed:**

1. **Full Day Names:**
   - Changed day labels from abbreviations (Mon, Tue) to full names (Monday, Tuesday, etc.)
   - Updated `DAY_LABELS` in `ScheduleService.js`

2. **Removed Rest Day from Modal:**
   - Removed "Rest Day" quick option from AddWorkoutModal
   - Users can still log rest days from the Home tab

3. **Category Images:**
   - Added gym images to category cards (arms, legs, chest, back, shoulders, core)
   - Uses same images as Browse tab
   - Cardio and Class categories use icon fallback (images to be added later)

4. **Multi-Workout Selection:**
   - Users can now select multiple workouts for a single day
   - Workouts are selected with checkmarks instead of closing modal immediately
   - "Save X Workouts" button confirms selection
   - Pre-populates previously selected workouts when editing a day

5. **Updated Data Structure:**
   - Days now store `workouts` array instead of single `workoutId`
   - Backwards compatible with legacy single-workout format
   - `createWorkoutDay()` accepts both array and single workout formats

6. **Updated UI Components:**
   - `DayCell.js` - Shows workout count badge when multiple workouts
   - `TodayWorkoutCard.js` - Lists all scheduled workouts with individual start buttons
   - `AddWorkoutModal.js` - Multi-select UI with save button

**Files Changed:**
- `src/services/ScheduleService.js` - Full day names, multi-workout data structure
- `src/context/ScheduleContext.js` - Updated scheduleWorkout to accept arrays
- `src/components/Schedule/AddWorkoutModal.js` - Complete rewrite for multi-select + images
- `src/components/Schedule/DayCell.js` - Multi-workout display
- `src/components/Schedule/TodayWorkoutCard.js` - Multi-workout list view
- `src/screens/Workout/WorkoutsScreen.js` - Added handleSelectWorkouts handler

**Next Steps (Session 73):**
1. Test multi-workout selection locally
2. Build 40 and test on TestFlight
3. Submit to App Store when ready

---

### Session 71 (Mar 19, 2026)
**Bug Fixes + Removed Weekly Setup Modal**

**Changes Made:**

1. **Friend Code Input UX Fix:**
   - "MH-" now shown as permanent prefix (not editable)
   - Users only type the 6-character code part
   - Placeholder shows "XXXXXX" instead of "MH-XXXXXX"
   - Better validation for 6-character input

2. **Removed Weekly Setup Modal Feature:**
   - Deleted `ScheduleSetupModal.js` component entirely
   - Removed "Set Up My Week" button and empty state prompt
   - Users can still plan workouts by tapping days on the calendar
   - WeekCalendar and AddWorkoutModal remain for manual planning

**Files Changed:**
- `src/screens/Social/AddFriendsScreen.js` - Fixed friend code input
- `src/screens/Workout/WorkoutsScreen.js` - Removed setup modal references
- `src/components/Schedule/index.js` - Removed ScheduleSetupModal export
- `src/components/Schedule/ScheduleSetupModal.js` - DELETED
- `app.config.js` - Bumped to Build 39

3. **Firebase Deployments:**
   - Deployed Firestore rules
   - Deployed Firestore indexes (5 composite indexes for friend queries)
   - Verified Cloud Functions already deployed (push notifications)

4. **Friend System Code Audit:**
   - Reviewed FriendService.js, FriendContext.js, Friend.js model
   - Reviewed Firestore rules and indexes
   - Reviewed Cloud Functions for push notifications
   - Code is production-ready

**Build:** v1.0.3 (Build 39) - Submitted to TestFlight

**Issues Found During Testing:**
- TBD (testing on TestFlight)

**Next Steps (Session 72):**
1. Test Build 39 on TestFlight
2. Document and fix any issues found
3. Build 40 if needed
4. Submit to App Store when ready

---

### Session 70 (Mar 19, 2026)
**Weekly Planner Improvements + Rest Day Popup**

**Changes Made:**

1. **AddWorkoutModal Complete Rewrite:**
   - New category options: Arms, Legs, Shoulders, Chest, Back, Core, Cardio, Class
   - Added GYM_WORKOUTS object with real exercises from Browse tab (not made-up stock workouts)
   - 2-step flow: Select categories → See matching workouts
   - Matches both built-in GYM_WORKOUTS and user's custom workouts by tags

2. **AddWorkoutScreen Updated:**
   - WORKOUT_TYPES now matches AddWorkoutModal categories
   - Custom workouts save with `tags: [type]` for category matching

3. **Removed Auto-Popup Modal:**
   - "Set up my week" modal no longer appears automatically
   - Only shows when user taps "Set Up My Week" button

4. **QuickRestDayScreen "Already Logged" Popup:**
   - Small bubble popup when user tries to log rest day after already logging activity
   - Cream background, green checkmark, orange "Got It!" button
   - Matches warm color scheme

5. **Friend System Firestore Indexes:**
   - Created `firestore.indexes.json` with 5 composite indexes
   - Fixes "Sign out" error on friend requests

**Build:** v1.0.3 (Build 38) - EAS build completed successfully

**Files Changed:**
- `src/components/Schedule/AddWorkoutModal.js` - Complete rewrite
- `src/screens/Workout/AddWorkoutScreen.js` - Updated WORKOUT_TYPES, added tags
- `src/screens/Workout/WorkoutsScreen.js` - Removed auto-popup
- `src/screens/Activity/QuickRestDayScreen.js` - Added bubble popup styles
- `firestore.indexes.json` - NEW (composite indexes for friends/nudges)

**Next Steps:**
1. Test Build 38 on TestFlight
2. Submit to App Store: `eas submit --platform ios --latest`

---

### Session 69 (Mar 19, 2026)
**Weekly Planner Bug Fixes + Settings Cleanup**

Fixed issues found in Build 37 TestFlight testing:

**Weekly Planner Fixes:**
1. **Setup modal persistence** - "Skip for now" now persists; modal won't reappear after skipping
2. **Removed week navigation arrows** - Calendar now shows just "This Week" without left/right arrows
3. **New 2-step workout selection flow:**
   - Step 1: Select body parts (Chest, Back, Arms, Legs, Core, Cardio, etc.)
   - Step 2: See matching workouts from library and custom workouts

**Settings Cleanup:**
4. **Removed notifications toggle** - Deleted unresponsive toggle from main Settings
5. **Removed duplicate privacy controls** - Deleted "Download my data" and "Delete account" from Privacy (already in Manage Account)

**Files Changed:**
- `src/context/ScheduleContext.js` - Added skipSetup function and hasSkippedSetup state
- `src/screens/Workout/WorkoutsScreen.js` - Use skipSetup when modal dismissed
- `src/components/Schedule/WeekCalendar.js` - Removed navigation arrows
- `src/components/Schedule/AddWorkoutModal.js` - Complete rewrite for 2-step body part flow
- `src/screens/Settings/SettingsScreen.js` - Removed notifications toggle
- `src/screens/Settings/PrivacySettingsScreen.js` - Removed Data & Account section
- `app.config.js` - Bumped to Build 38

---

### Session 68 (Mar 19, 2026)
**Prep for Submission**

- Updated docs to reflect Build 37 as latest
- Pushed all changes to GitHub

---

### Session 67 (Mar 19, 2026)
**App-Wide Color Scheme Audit & Fix**

Fixed 60+ files to ensure consistent warm cream/brown color scheme throughout the app.

**Color Mapping Applied:**
| Old Color | New Color | Purpose |
|-----------|-----------|---------|
| `#fff` / `#ffffff` | `#FFF8F0` | Screen backgrounds |
| `#000` / `#333` | `#4A3728` | Dark text |
| `#666` / `#8E8E93` | `#6B5D52` | Secondary text |
| `#E5E5EA` / `#C7C7CC` | `#E5DDD5` | Borders/dividers |
| `#007AFF` | `#FF9500` | Accent buttons/icons |
| `#F2F2F7` | `rgba(139,90,43,0.08)` | Light backgrounds |

**Components Fixed:**
- `ErrorView.js`, `EmptyStateView.js` - Text colors
- `NotificationPermissionPrompt.js` - Full theme update
- `GrowthCelebrationView.js` - Text and backgrounds
- `ProfileUpdatePrompt.js`, `NotificationContextBanner.js`
- All Schedule components (DayCell, WeekCalendar, AddWorkoutModal, MiniWeekStrip, ScheduleSetupModal, TodayWorkoutCard)

**Screens Fixed:**
- Home, Workout (all screens), Settings (all screens)
- Social (FriendProfile, AddFriends, PendingRequests, BlockedUsers)
- Inventory, Shop, Onboarding

**Verified:**
- Notification toggle properly connected to NotificationService
- Firestore rules up to date for friends/notifications
- Cloud Functions deployed for push notifications

**Build:** v1.0.3 (Build 37) - Submitted to TestFlight

---

### Session 66 (Mar 19, 2026)
**Part 1: Weekly Planner Phase 4 - Home Screen Integration**

Implemented Phase 4 of the Weekly Planner feature - Home screen now shows scheduled workouts.

**New Component:**
- `MiniWeekStrip.js` - Compact week visualization for Home screen

**HomeScreen.js Updates:**
- Schedule-aware action cards (workout/rest/pick workout/default)
- MiniWeekStrip below action card (if user has schedule)

---

**Part 2: Simplified Profile & Onboarding**

Completely rewrote the profile system to be simpler and more useful.

**New Onboarding Flow (5 steps):**
1. Age Gate (9+ confirmation)
2. Fitness Level (Beginner/Intermediate/Advanced)
3. Fitness Goals (multi-select):
   - Stay Active
   - Get Stronger
   - Build Core
   - Improve Flexibility
4. Workout Days (Mon-Sun checklist)
5. Hamster Name

**Removed (no longer collected):**
- Schedule Preference (Fixed/Flexible)
- Preferred Workout Time
- Fitness Intent (Maintain/Improve)
- Weekly Workout Goal number (replaced by day checklist)

**New Fitness Goals (Option B - Outcome-focused):**
- Stay Active → Quick Sweats, Desk Workouts
- Get Stronger → Upper Body, Lower Body, Gym workouts
- Build Core → Core workouts
- Improve Flexibility → Stretching/Yoga content

**Migration for Existing Users:**
- Added `needsProfileMigration()` function to detect old profiles
- Added `ProfileUpdatePrompt.js` modal component
- Shows prompt on HomeScreen for users with old profile format
- Users can update now or skip for later

**Files Changed:**
- `src/models/UserProfile.js` - Simplified model, new goals, migration helpers
- `src/screens/Onboarding/OnboardingScreen.js` - New 5-step flow
- `src/screens/Settings/ProfileSettingsScreen.js` - Simplified to match
- `src/context/UserProfileContext.js` - Added needsMigration state
- `src/components/ProfileUpdatePrompt.js` - NEW migration prompt modal
- `src/screens/Home/HomeScreen.js` - Added ProfileUpdatePrompt

**Part 3: Profile → Schedule Wiring**
- Connected profile.workoutDays to ScheduleContext
- When user sets workout days in profile, schedule auto-populates
- Added effect in ScheduleContext that syncs profile.workoutDays to preferences
- Applied to current week automatically

**Files Changed (Part 3):**
- `src/context/ScheduleContext.js` - Added useUserProfile import, sync effect

**What to Test:**
1. New user onboarding flow (5 steps)
2. Existing user migration prompt on HomeScreen
3. Workout days → schedule sync (change days in profile, schedule updates)
4. MiniWeekStrip on Home screen
5. Schedule-aware action cards (scheduled workout, pick workout, rest day)

### Session 65 (Mar 18, 2026)
**v1.0.3 Bug Fixes**

Fixed 3 bugs reported in v1.0.2:

**1. Notification Toggle Not Working**
- Fixed `handleUserEnabledChange()` in `NotificationSettingsScreen.js`
- Toggle now properly resets to OFF if permission is denied
- Checks return value of `enableNotifications()` before updating state

**2. PendingRequestsScreen Color Scheme**
- Updated header background: `#fff` → `#FFF8F0` (cream)
- Fixed title color: added `#4A3728` (dark brown)
- Updated tab container: `#E5E5EA` → warm brown tint
- Fixed tab text colors to match app theme
- Updated request name, empty state colors

**3. Friend Request Error Handling**
- Added try-catch with permission error detection in `FriendService.js`
- `useInviteCode()` and `sendFriendRequest()` now show helpful error messages
- If permission denied, shows "Please try signing out and back in"

**4. Themed Alerts (App-Wide)**
- Created `ThemedAlert.js` component with cream/brown color scheme
- Created `AlertContext.js` for global alert management
- Replaced native iOS/Android grey alerts with themed alerts across ALL screens
- 20 files updated to use `showAlert()` instead of `Alert.alert()`
- Alerts now match app's warm color scheme (#FFF8F0 background, #4A3728 text)

**Files Changed:**
- `ThemedAlert.js` - New themed alert component
- `AlertContext.js` - New context for showing alerts
- `App.js` - Added AlertProvider wrapper
- `NotificationSettingsScreen.js` - Fixed toggle behavior
- `PendingRequestsScreen.js` - Fixed color scheme + themed alerts
- `FriendService.js` - Better error handling for permission issues
- `app.config.js` - Bumped to v1.0.3 (Build 37)
- All social screens - Themed alerts
- All settings screens - Themed alerts
- All shop screens - Themed alerts
- All workout screens - Themed alerts
- `OnboardingScreen.js` - Themed alerts

**IMPORTANT - Before Building:**
Deploy Firestore rules if not already deployed:
```bash
cd "C:\Users\kamal\Downloads\Muscle Hmaster\Muscle Hmaster\MuscleHamsterExpo"
firebase deploy --only firestore:rules
```

**Next Steps:**
1. Deploy Firestore rules (if friend requests still fail)
2. Test fixes locally: `npx expo start`
3. Build: `eas build --platform ios --profile production`
4. Submit to App Store

### Session 64 (Mar 18, 2026)
**v1.0.2 UI Updates + Cloud Functions Deployed**

**UI Changes:**
1. Moved Shop from bottom tab to Home screen button
2. Added Rest Day button on Home screen (awards 2 points, shows rest hamster)
3. Changed "Today's Action" subtitle to "Complete your daily exercise"
4. Rest day hamster appears until next day after logging rest day
5. Shop back button now says "Home"
6. Enabled Friends tab (social features)
7. Fixed color scheme on new screens (#FFF8F0 cream, #4A3728 dark brown)

**Files Changed:**
- `MainTabNavigator.js` - Removed Shop tab, added QuickRestDay route
- `HomeScreen.js` - Added Shop, Customize, Rest Day buttons row
- `QuickRestDayScreen.js` - New screen for rest day check-in
- `Activity.js` - Added QUICK_REST activity type (2 points)
- `AssetImages.js` - Added rest day hamster image
- `ActivityContext.js` - Added hasLoggedRestDayToday property
- `HamsterPortrait.js` - Added isRestDay prop for rest day hamster
- `FeatureFlags.js` - Enabled socialFeatures
- `FriendProfileScreen.js`, `SocialScreen.js`, `AddFriendsScreen.js` - Fixed colors

**Firebase Cloud Functions Deployed:**
- Fixed npm v11.6.2 bug that caused `npm ci` failures
- Added explicit markdown-it dependencies to functions/package.json
- Successfully deployed all 4 push notification functions

**Next Steps:**
- Build preview version for testing
- Test Rest Day feature
- Test Friends tab
- Submit v1.0.2 to App Store

### Session 63 (Mar 16, 2026)
**Push Notifications Fix**

Diagnosed and fixed critical issues preventing push notifications from working:

**Issues Found:**
1. `expo-notifications` plugin was missing from app.config.js (no iOS APNs entitlements)
2. `registerForPushNotifications()` was never called (push tokens not saved to Firestore)
3. Missing `UIBackgroundModes` configuration for iOS

**Fixes Applied:**
1. **app.config.js**:
   - Added `expo-notifications` plugin with icon and color config
   - Added `UIBackgroundModes: ["remote-notification", "fetch"]` to iOS infoPlist

2. **AuthContext.js**:
   - Imported `registerForPushNotifications` and `clearPushToken`
   - Call `registerForPushNotifications(uid)` when user authenticates
   - Call `clearPushToken(uid)` when user signs out

3. **NotificationService.js**:
   - Enhanced `registerForPushNotifications()` to request permission first
   - Added Android notification channel setup for Android 8+

**Files Changed:**
- `app.config.js`
- `src/context/AuthContext.js`
- `src/services/NotificationService.js`

**Next Steps:**
1. Verify APNs key: `eas credentials` → iOS → Push Notifications
2. Deploy Cloud Functions: `cd functions && npm install && firebase deploy --only functions`
3. Build new version: `eas build --platform ios --profile production`
4. Submit to App Store

### Session 62 (Mar 16, 2026)
**Google Play Console Setup**

- Created Google Play Developer account ($25)
- Uploaded Android AAB (v1.0.1, version code 4) to Play Console
- Wrote short description (76 chars) and full description for Play Store
- Uploaded app icon and feature graphic
- Fixed privacy policy URL error (was `privacy-policy.htm`, needed `.html`)
- Discovered: New Google Play accounts require **14 days of Closed Testing** with **12 opted-in testers** before Production access
- Next steps:
  1. Set up Closed Testing track
  2. Create email list with 12+ testers
  3. Share test link with testers
  4. Wait 14 days
  5. Apply for Production access

**Play Store Descriptions Created:**
- Short: "Care for your hamster by staying active. Daily exercises, streaks & rewards!"
- Full: See session notes

### Session 61 (Mar 13, 2026)
**Android Build Ready**

- Set up Android configuration for EAS builds
- Added `GOOGLE_ANDROID_CLIENT_ID` to EAS secrets
- Downloaded and configured `google-services.json` from Firebase
- Added `googleServicesFile` to android config in `app.config.js`
- Successfully built Android AAB for Google Play
- Next: Set up Google Play Developer account and submit

### Session 60 (Mar 13, 2026)
**v1.0.1 Submitted - Google Sign-In Hotfix**

- Build 26 (v1.0.0) is live on the App Store
- Google Sign-In broken in v1.0.0 (WebView OAuth blocked by Google)
- Upgraded to EAS Starter plan ($19/month) for build credits
- Built and submitted v1.0.1 via EAS
- Bumped development version to 1.0.2 (Build 32)
- Next: Create v1.0.1 in App Store Connect → Submit for review

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
