# Simplified MVP Specification

**Created:** Feb 21, 2026 (Session 38)
**Status:** APPROVED
**Goal:** Strip Muscle Hamster to its core magic — daily check-in, happy hamster, growing streak.

---

## Core Philosophy

> **30 seconds to joy.** Open app → do one thing → hamster happy → done.

No decisions. No overwhelm. One clear path every day.

---

## The Core Loop

```
Open App
    ↓
Do Today's Exercise (30-60 sec)
    ↓
Hamster Celebrates → Points Earned → Streak Grows
    ↓
(Optional) Browse Shop → Buy Items → Customize Hamster
    ↓
Close App → Come Back Tomorrow
```

---

## What's IN (Simplified MVP)

### 1. Onboarding (2 steps only)
- **Age Gate** — "I am 13 or older" (compliance requirement)
- **Name Your Hamster** — Text input with suggestions, then meet hamster
- **NO**: Fitness level, goals, schedule, frequency, intent questions
- Profile preferences moved to Settings as optional

### 2. Home Screen
- **Hamster Display** — Current state, growth stage, equipped items
- **Today's Exercise Card** — Single exercise, clear "Do It" button
- **Streak Display** — Current streak count, flame icon
- **Points Balance** — Simple counter in header
- **Quick Actions** — "Customize" button to inventory

### 3. Daily Check-In (ONE type only)
- **Daily Exercise** — 35 bodyweight exercises, one per day (deterministic)
- Complete exercise → earn points → streak increments → hamster happy
- **NO**: Rest day check-in, full workout sessions, workout player
- **NO**: Workout library, browse, filter, recommendations

### 4. Hamster System
- **States**: Happy (checked in today), Hungry (hasn't checked in)
- **Growth**: DISABLED — Hamster is always one stage (adult)
- **Customization**: Equip outfit, accessory, place enclosure items
- No growth celebrations

### 5. Points Economy (Simplified)
- **Earn**: Daily check-in (25 base + streak multiplier, cap 1.5x)
- **Spend**: Shop purchases, streak freeze
- **NO**: Transaction history view (just show balance)
- **NO**: Multiple earn sources (workouts, rest days)

### 6. Shop (Simplified)
- **8-12 items total** across outfits, accessories, enclosure
- **NO**: Rarity system (common/uncommon/rare/legendary)
- **NO**: "New" or "Featured" badges
- Simple grid, buy what you want
- Prices: 50-200 points range

### 7. Inventory
- View owned items
- Equip outfit (one at a time)
- Equip accessory (one at a time)
- Place enclosure items (multiple allowed)

### 8. Streak System
- Current streak count
- Streak freeze available (100 points to restore broken streak)
- **NO**: "At risk" warnings, complex status states
- Simple: You have a streak, or you broke it and can restore it

### 9. Settings (Minimal)
- **Hamster name** — Edit
- **Notifications** — Daily reminder toggle (on/off), time picker
- **Account** — Sign out, delete account (placeholder)
- **NO**: Workout schedule, fitness profile editing
- **NO**: Audio settings (defer until audio assets exist)
- **NO**: Privacy controls (no social = not needed)

### 10. Auth
- Keep existing: Sign up, Sign in, Password reset
- Works with age gate

---

## What's OUT (Deferred to v1.1+)

### Social Features (All of Phase 09)
- Friend system, friend requests
- Friend list, friend profiles
- Friend streaks
- Nudges
- Privacy controls, blocking
- QR codes, invite links

### Workout Library (Phase 04-05)
- 24 workout catalog
- Workout player with timer
- Browse, filter, search
- Recommendations engine
- Workout feedback
- Exercise-by-exercise progression

### Rest Day System
- Rest day micro-tasks
- Rest day check-in flow
- "Pet hamster" / "Give treat" interactions

### Complex Onboarding
- Fitness level question
- Fitness goals question
- Weekly frequency question
- Schedule preference question
- Workout time question
- Fitness intent question
- (All moved to optional Settings if we want later)

### Advanced Features
- Transaction history
- Workout history view
- Detailed streak status (at risk, etc.)
- Tips rotation on home screen
- Audio system (SFX, music)
- Advanced notifications (streak at risk, etc.)

---

## What's REMOVED (Not Coming Back)

- Rarity system for shop items
- Multiple check-in types competing for attention
- Workout feedback (loved/liked/not for me)
- Complex hamster state logic (chillin', excited, proud — simplify to happy/hungry)

---

## Screen Structure

| Screen | Purpose |
|--------|---------|
| **Home** | Hamster, daily exercise, streak, points, customize button |
| **Shop** | Simple grid of items to purchase |
| **Inventory** | View owned items, equip/place |
| **Settings** | Hamster name, notifications, account |

**Navigation:** No tab bar needed. Home is the hub with buttons to Shop, Inventory, Settings.

---

## Data Model Simplifications

### UserStats (Simplified)
```
- totalPoints: Int
- currentStreak: Int
- longestStreak: Int
- totalCheckIns: Int
- lastCheckInDate: Date?
- currentGrowthStage: GrowthStage
```

### HamsterState (Simplified)
```
enum HamsterState {
    case happy    // Checked in today
    case hungry   // Hasn't checked in today
}
```

### Remove/Disable
- `workoutHistory` array
- `restDayHistory` array
- `transactions` array
- `workoutFeedback` dictionary
- Complex `StreakStatus` enum (just use: active or broken)

---

## Implementation Approach

### Option A: Feature Flags (Recommended)
- Add `FeatureFlags.swift` with toggles
- Disable features at runtime
- Keep code for future re-enablement
- Cleaner git history

### Option B: Code Removal
- Delete deferred features entirely
- Smaller codebase
- More destructive, harder to bring back

### Recommended: Hybrid
- Feature flag large systems (Social, Workouts)
- Simplify inline where small (hamster states, onboarding steps)
- Remove code that's definitely not coming back (rarities)

---

## Migration Notes

### Existing Users (If Any)
- If user has completed old onboarding → skip to home
- Points/streaks carry over
- Owned items carry over
- Workout history becomes invisible (data preserved)

### New Users
- Experience the simplified 2-step onboarding
- See clean, simple home screen

---

## Success Metrics (Post-Launch)

- **Day 1 retention**: Do users come back tomorrow?
- **Check-in completion rate**: % who complete daily exercise after opening
- **Time to first check-in**: How fast from install to first points?
- **Streak length distribution**: Are people building habits?

---

## Next Steps

1. [ ] Create `FeatureFlags.swift` with toggles for deferred features
2. [ ] Simplify onboarding flow (remove 6 questions)
3. [ ] Simplify home screen (one action, no competing CTAs)
4. [ ] Remove Social tab from navigation
5. [ ] Remove Workouts tab from navigation
6. [ ] Simplify Shop (reduce items, remove rarities)
7. [ ] Simplify Settings (remove advanced options)
8. [ ] Simplify hamster states (happy/hungry only)
9. [ ] Test simplified flow end-to-end
10. [ ] Update progress.md with completion status
