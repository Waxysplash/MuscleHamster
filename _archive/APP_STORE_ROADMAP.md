# Muscle Hamster - App Store Roadmap

*Created: 2026-02-09*

## Current Status
The app has all core features built but needs real backend integration and assets before App Store submission.

---

## Phase 1: Foundation (Do First)
**Without these, the app won't function properly**

| Task | Why Critical | Time Estimate | Status |
|------|--------------|---------------|--------|
| Set up Firebase project | Replace placeholder config in `src/config/firebase.js` | 30 min | [x] Done |
| Test Firebase Auth works | Users can actually sign up/log in | 1 hour | [x] Done |
| Apple Sign-In integration | **Required by Apple** if offering any social login | 2-3 hours | [x] Done |
| Google Sign-In integration | Additional sign-in option | 2-3 hours | [x] Done |

### Firebase Setup Steps:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project "MuscleHamster"
3. Enable Authentication (Email/Password + Apple)
4. Create Firestore database
5. Copy config to `src/config/firebase.js`

---

## Phase 2: Core Assets (Do Second)
**App Store won't accept without these**

| Task | Why Critical | Time Estimate | Status |
|------|--------------|---------------|--------|
| App icon (1024x1024) | Required for submission | You provide art | [x] Done |
| Splash screen | First impression | You provide art | [ ] |
| Hamster - Happy/Fed state | Core experience | You provide art | [x] Done |
| Hamster - Chillin' state | Core experience | You provide art | [x] Done |
| Hamster - Hungry state | Core experience | You provide art | [x] Done |
| Hamster - Sad state | Core experience | You provide art | [x] Done |

### Asset Locations:
- App icon: `assets/branding/icon.png`
- Splash: `assets/branding/splash-icon.png`
- Hamster states: `assets/hamster/states/`

---

## Phase 3: App Store Setup (Do Third)

| Task | Why Critical | Time Estimate | Status |
|------|--------------|---------------|--------|
| Apple Developer Account | Can't submit without it | $99 + approval time | [ ] |
| Privacy Policy page | Required by Apple | 1 hour | [ ] |
| App Store screenshots | Required for listing | 1-2 hours | [ ] |
| EAS Build setup | Creates the actual iOS build | 1-2 hours | [ ] |

### EAS Build Commands:
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios
```

---

## Phase 4: Polish (Can Do After Launch)
- [ ] More shop items (outfits, poses, enclosure)
- [ ] Workout content expansion
- [ ] Push notifications (real device integration)
- [ ] Google Sign-In
- [ ] Ads integration
- [ ] Contact import for friends
- [ ] Share link/QR for friend invites

---

## Questions to Answer Before Starting

1. **Do you have a Firebase project created?**
   - Yes / No

2. **Do you have hamster art assets ready?**
   - Yes / No

3. **Do you have an Apple Developer account ($99/year)?**
   - Yes / No

---

## What's Already Done
- [x] Core app flow and navigation
- [x] Onboarding screens (age, fitness level, goals, schedule, hamster naming)
- [x] Welcome screen with hamster logo
- [x] Workout library and player
- [x] Points/streak system
- [x] Shop & inventory UI
- [x] Social features UI
- [x] Settings screens
- [x] Firebase integration code (needs real config)
- [x] Data migration utilities

---

*Resume work by opening this file and checking off completed items!*
