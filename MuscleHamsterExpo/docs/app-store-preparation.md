# Muscle Hamster - App Store Preparation

## App Information

| Field | Value |
|-------|-------|
| **App Name** | Muscle Hamster |
| **Bundle ID** | com.musclehamster.app |
| **Version** | 1.0.0 |
| **Primary Language** | English |
| **Category** | Health & Fitness |
| **Secondary Category** | Lifestyle |

---

## App Store Description

### Short Description (30 characters max)
```
Care for your hamster, get fit!
```

### Subtitle (30 characters max)
```
Workout with your cute buddy
```

### Full Description (4000 characters max)
```
Meet your new workout buddy - a cute hamster who gets stronger every time you do!

Muscle Hamster is a friendly fitness app that makes exercise fun and guilt-free. Complete short workouts to earn points, care for your virtual hamster, and build healthy habits without any pressure.

WHY MUSCLE HAMSTER?

No Guilt, Just Gains
We believe fitness should be fun, not stressful. Your hamster never judges - it just celebrates every workout you complete, big or small.

Short & Sweet Workouts
Choose from gym workouts or at-home exercises. Each workout is designed to fit into your busy schedule - no 2-hour gym sessions required!

Earn Points & Customize
Every workout earns you points that you can spend in the shop. Dress up your hamster with cozy sweaters, cool jerseys, stylish sunglasses, and more!

Build Streaks
Track your progress with workout streaks. Watch your hamster grow from a tiny baby to a mature fitness champion as you build consistent habits.

Track Your Progress
Use the exercise journal to log your weights, reps, and sets. See your strength improve over time with personal records for every exercise.

FEATURES

- 30+ exercises for gym and home workouts
- 6 body part categories (Arms, Chest, Legs, Shoulders, Back, Core)
- At-home exercises with no equipment needed
- Personal exercise journal with progress tracking
- Cute hamster companion that grows with you
- Shop with outfits and accessories
- Workout streaks and daily goals
- Warm, encouraging interface
- Apple Sign In supported

PRIVACY FIRST
Your data stays on your device. We don't sell your information or bombard you with ads.

START TODAY
Download Muscle Hamster and make fitness fun again. Your new workout buddy is waiting!
```

### Keywords (100 characters max)
```
fitness,workout,exercise,hamster,pet,gym,home workout,streaks,health,motivation,cute,gains
```

### Promotional Text (170 characters max, can be updated without app submission)
```
Get fit with your adorable hamster buddy! Complete workouts, earn points, and customize your pet. No guilt, just gains. Download now and start your fitness journey!
```

---

## Screenshots Required

### iPhone Screenshots (Required: 3-10)

| Screen | Description | Size (6.7") | Size (6.5") |
|--------|-------------|-------------|-------------|
| 1 | Home Screen with hamster | 1290 x 2796 | 1284 x 2778 |
| 2 | Workout categories | 1290 x 2796 | 1284 x 2778 |
| 3 | Exercise detail with journal | 1290 x 2796 | 1284 x 2778 |
| 4 | Shop screen | 1290 x 2796 | 1284 x 2778 |
| 5 | Inventory with equipped item | 1290 x 2796 | 1284 x 2778 |
| 6 | Workout completion celebration | 1290 x 2796 | 1284 x 2778 |

### iPad Screenshots (Required if app supports iPad)

| Size | Resolution |
|------|------------|
| 12.9" iPad Pro | 2048 x 2732 |
| 11" iPad Pro | 1668 x 2388 |

### Screenshot Guidelines
- Use high-quality device frames (optional)
- Add captions highlighting key features
- Show the warm cream color scheme
- Feature the hamster prominently
- Demonstrate the workout flow

---

## App Preview Video (Optional but Recommended)

**Duration**: 15-30 seconds
**Resolution**: Same as screenshots

**Suggested Flow**:
1. Open app, show hamster on home screen (3s)
2. Tap into workouts, select a category (3s)
3. Show exercise detail with journal (3s)
4. Complete workout, show celebration (3s)
5. Visit shop, show items (3s)
6. Equip an item on hamster (3s)

---

## Privacy Policy (Required) ✅

### Privacy Policy Files
- **HTML version:** `docs/privacy-policy.html` (for web hosting)
- **Markdown version:** `docs/PRIVACY_POLICY.md` (for GitHub/editing)

### Hosting Options (Choose One)

**Option 1: GitHub Pages (Free, Recommended)**
1. Enable GitHub Pages on your repo (Settings → Pages → Source: main branch)
2. Privacy Policy URL: `https://waxysplash.github.io/MuscleHamster/MuscleHamsterExpo/docs/privacy-policy.html`

**Option 2: Custom Domain**
1. Host `privacy-policy.html` at `https://musclehamster.app/privacy`

**Option 3: Notion/Google Sites (Quick)**
1. Copy content from `PRIVACY_POLICY.md` to a public Notion page or Google Site
2. Use that URL for App Store submission

### Privacy Policy URL (Update After Hosting)
```
https://waxysplash.github.io/MuscleHamster/MuscleHamsterExpo/docs/privacy-policy.html
```

### Policy Covers
- ✅ Data collection (account, profile, activity, technical)
- ✅ Data usage purposes
- ✅ Third-party services (Firebase, Apple Sign In, Google Sign In)
- ✅ Security measures
- ✅ User rights (access, update, delete, portability)
- ✅ Children's privacy (13+ age gate, COPPA compliance)
- ✅ GDPR compliance (EU users)
- ✅ CCPA compliance (California users)
- ✅ Data retention policy
- ✅ Contact information

---

## Age Rating

| Content Type | Rating |
|--------------|--------|
| **Overall Rating** | 4+ (suitable for all ages) |
| Cartoon/Fantasy Violence | None |
| Realistic Violence | None |
| Profanity/Crude Humor | None |
| Horror/Fear Themes | None |
| Medical/Treatment Info | Infrequent/Mild (fitness guidance) |
| Alcohol/Tobacco | None |
| Gambling | None |
| Sexual Content | None |

---

## App Review Information

### Demo Account (if login required)
```
Email: demo@musclehamster.app
Password: [Create demo account]
```

### Review Notes
```
Muscle Hamster is a fitness motivation app with a virtual pet companion.

Key features to review:
1. Home screen shows the hamster's current state
2. "At Gym" and "At Home" workout categories
3. Exercise detail screens with progress journaling
4. Shop where points can be spent on cosmetic items
5. Inventory where items can be equipped on the hamster

No in-app purchases in v1.0.
Apple Sign In is implemented.
No push notifications in v1.0.
```

### Contact Information
```
Name: [Your name]
Email: [Your email]
Phone: [Your phone]
```

---

## Technical Checklist

### Before Submission
- [ ] Update version number in app.config.js
- [ ] Test on multiple device sizes (iPhone SE, iPhone 15 Pro Max, iPad)
- [ ] Verify Apple Sign In works correctly
- [ ] Test offline functionality
- [ ] Remove all console.log statements (or use Logger service)
- [ ] Run through accessibility checker (VoiceOver)
- [ ] Test dark mode appearance (if supported)
- [ ] Verify all images load correctly
- [ ] Check for memory leaks
- [ ] Test on iOS 15+ (minimum supported version)

### Build Commands
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure for App Store
eas build:configure

# Create production build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Required Certificates & Profiles
- [ ] Apple Developer Program membership ($99/year)
- [ ] Distribution certificate
- [ ] App Store provisioning profile
- [ ] Push notification certificate (if using push)

---

## Post-Launch Checklist

- [ ] Monitor crash reports in App Store Connect
- [ ] Respond to user reviews
- [ ] Track download metrics
- [ ] Plan v1.1 update based on feedback
- [ ] Set up App Analytics

---

## Marketing Assets

### App Icon Sizes
| Size | Usage |
|------|-------|
| 1024x1024 | App Store listing |
| 180x180 | iPhone (60pt @3x) |
| 167x167 | iPad Pro (83.5pt @2x) |
| 152x152 | iPad (76pt @2x) |
| 120x120 | iPhone (60pt @2x) |

### Brand Colors
| Name | Hex | Usage |
|------|-----|-------|
| Cream | #FFF8F0 | Background |
| Dark Brown | #4A3728 | Primary text |
| Medium Brown | #6B5D52 | Secondary text |
| Warm Brown | #8B5A2B | Accent |
| Orange | #FF9500 | Highlight/CTA |
| Green | #34C759 | Success |

---

## Notes

This document should be updated as the app evolves. Key dates:
- Initial submission: [TBD]
- App Store approval: [TBD]
- Public launch: [TBD]
