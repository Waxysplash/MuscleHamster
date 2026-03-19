# Muscle Hamster — Claude Code Context

## What Is This App?

A self-care fitness app where users complete daily exercises to earn points and care for a virtual hamster. The hamster is **hungry, not angry** — no guilt, no shame, just gentle accountability.

---

## Current Status

**🚀 BUILD 37 READY TO SUBMIT**

- **Version**: 1.0.3 (Build 37)
- **App ID**: 6759973700
- **App Store Connect**: https://appstoreconnect.apple.com/apps/6759973700

---

## Key Files

| File | Purpose |
|------|---------|
| `progress.md` | Current status, what's next |
| `A1-new-session-instructions.md` | Session workflow |
| `_archive/` | Historical planning docs (PRD, phases, art prompts) |

---

## Project Structure

```
Muscle Hmaster/
├── CLAUDE.md                        <- You are here
├── progress.md                      <- Current status
├── A1-new-session-instructions.md   <- Session workflow
├── _archive/                        <- Historical planning docs
└── MuscleHamsterExpo/              <- The app (React Native + Expo)
    ├── src/
    │   ├── components/             <- Shared UI components
    │   ├── screens/                <- All screens
    │   ├── services/               <- Business logic
    │   ├── context/                <- React contexts
    │   └── config/                 <- FeatureFlags, AssetImages
    ├── assets/images/              <- Hamster art, shop items
    ├── docs/                       <- Privacy policy, App Store prep
    └── app.config.js               <- Expo config
```

---

## Non-Negotiable Rules

- **Tone**: Warm, playful, kind. NEVER guilt, shame, or pressure.
- **Hamster states**: happy or hungry (hungry = gentle, not angry)
- **No guilt language** in any user-facing copy

---

## Quick Commands

```bash
cd "C:\Users\kamal\Downloads\Muscle Hmaster\Muscle Hmaster\MuscleHamsterExpo"
npx expo start                                    # Run locally
eas build --platform ios --profile production     # Production build
eas submit --platform ios                         # Submit to App Store
```

---

## Firebase

- **Project ID**: muscle-hamster
- **Console**: https://console.firebase.google.com/
- **EAS Secrets**: 9 environment variables configured

---

## Links

- **GitHub**: https://github.com/Waxysplash/MuscleHamster
- **Privacy Policy**: https://waxysplash.github.io/MuscleHamster/privacy-policy.html

---

## Session Protocol

1. Read `progress.md` for current status
2. Do the work
3. Update `progress.md`
4. Push to GitHub:
   ```bash
   git add . && git commit -m "Session N: <summary>" && git push
   ```
