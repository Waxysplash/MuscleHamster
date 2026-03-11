# Muscle Hamster — Session Context

**Status:** 🚀 Build 22 submitted to App Store — awaiting review

---

## Quick Start

1. Read `progress.md` for current status
2. Check App Store Connect for review updates: https://appstoreconnect.apple.com/apps/6759973700

---

## What Is This App?

**Muscle Hamster** is a self-care fitness app where users:
- Complete a daily exercise
- Earn points to care for their virtual hamster
- Build streaks and customize their hamster

**Core loop:** Open app → Do daily exercise → Hamster happy → Streak grows → Earn points → Customize

---

## Tone (Non-Negotiable)

- **Warm, playful, kind** — no guilt, no shame, no pressure
- Hamster is **hungry, not angry** when neglected
- Quick choices, low cognitive load

---

## Project Structure

```
Muscle Hmaster/
├── A1-new-session-instructions.md   <- You are here
├── progress.md                       <- Current status
├── CLAUDE.md                         <- Claude Code context
├── _archive/                         <- Historical planning docs
└── MuscleHamsterExpo/               <- The app
    ├── src/                         <- Source code
    ├── assets/images/               <- Art assets
    └── docs/                        <- App Store docs
```

---

## Key Commands

```bash
cd "C:\Users\kamal\Downloads\Muscle Hmaster\Muscle Hmaster\MuscleHamsterExpo"
npx expo start                                    # Run locally
eas build --platform ios --profile production     # Production build
eas submit --platform ios                         # Submit to App Store
```

---

## What's Next

### If Approved
1. Monitor user feedback and reviews
2. Plan v1.1 features
3. Android release

### If Rejected
1. Read Apple's feedback
2. Fix the issue
3. Increment build number in app.config.js
4. Rebuild and resubmit

---

## Session Protocol

### At session end
1. Update `progress.md` with what you did
2. Push to GitHub:
   ```bash
   cd "C:\Users\kamal\Downloads\Muscle Hmaster\Muscle Hmaster\MuscleHamsterExpo"
   git add . && git commit -m "Session N: <summary>" && git push
   ```

---

## Links

- **GitHub**: https://github.com/Waxysplash/MuscleHamster
- **App Store Connect**: https://appstoreconnect.apple.com/apps/6759973700
- **Firebase Console**: https://console.firebase.google.com/
- **Privacy Policy**: https://waxysplash.github.io/MuscleHamster/privacy-policy.html
