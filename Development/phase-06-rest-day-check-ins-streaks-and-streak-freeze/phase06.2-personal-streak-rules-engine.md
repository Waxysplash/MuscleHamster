# Phase 06.2 — Personal Streak Rules Engine

## Header
- **Goal:** Define and implement personal streak rules based on daily check-ins (workouts or rest-day micro-tasks).
- **Status:** IMPLEMENTED
- **Priority:** HIGH
- **Dependencies:** Phase 05.2, Phase 06.1
- **Platforms:** iOS (15+)

---

## Required Functionality (high-level)
- ✅ Define what qualifies as a daily check-in:
  - Workout completion qualifies
  - Rest-day micro-task completion qualifies
- ✅ Streak increments once per day when a qualifying check-in occurs
- ✅ Streak resets when a day passes without a check-in (subject to streak freeze in Phase 06.3)
- ✅ Prevent double-counting within the same day ("already checked in" behavior)

---

## Implementation Summary

### New `StreakStatus` Enum (Activity.swift)
Represents the current state of the user's streak:
- `active(days: Int)` — Streak is secure, user has checked in today
- `atRisk(days: Int)` — Streak is at risk, user hasn't checked in today but still has time
- `broken(previousStreak: Int)` — Streak was broken, missed a day without check-in
- `none` — No streak history yet

Each status includes:
- `displayCount` — The count to display in UI
- `isAtRisk`, `isBroken`, `isSecure` — Boolean helpers
- `statusMessage` — Friendly message for the status
- `icon`, `color` — UI styling helpers

### UserStats Enhancements (Activity.swift)
- Added `lastCheckInDate` — Tracks the calendar day of last check-in for streak validation
- Added `previousBrokenStreak` — Stores broken streak for display until acknowledged
- Added `calculateStreakStatus()` — Computes streak status based on check-in history
- Added `isStreakBroken` — Whether streak should be considered broken
- Added `effectiveStreak` — Returns 0 if broken, otherwise currentStreak
- Added `daysSinceLastCheckIn` — Days since last check-in for UI messaging

### ActivityService Enhancements (ActivityService.swift)
- `validateStreak(userId:)` — Called on app launch/foreground, validates and updates streak
- `getStreakStatus(userId:)` — Gets current streak status without modifying state
- `acknowledgeStreakReset(userId:)` — Clears previousBrokenStreak after acknowledgement
- Updated `recordCompletion` and `recordRestDayCheckIn` to set `lastCheckInDate`

### HomeView Enhancements (HomeView.swift)
- Calls `validateStreak()` on load to ensure accurate streak display
- Enhanced streak section with:
  - Status badges ("AT RISK", "RESET", checkmark)
  - Large streak number with status-based coloring
  - Dynamic status messages
  - Status-based icons (flame, checkmark, reset arrow, sparkles)
  - Status-based background colors
- Full VoiceOver accessibility labels for all streak states

---

## Edge Cases & Scenarios

### ✅ Timezone change and late-night usage
- Uses `Calendar.current` which reflects the device's current timezone
- Day boundaries are calculated using the user's local calendar
- If user changes timezone, their "day" changes accordingly (expected behavior)

### ✅ User opens app multiple times in a day
- `validateStreak()` is idempotent — calling it multiple times has no side effects
- Already-checked-in state is persisted and reflected correctly

### ✅ User completes workout and rest-day task same day
- Workout completion takes priority
- Rest-day check-in is blocked after workout ("alreadyCheckedInToday" error)
- Streak only increments once per calendar day
- If rest-day check-in happens first, workout still allowed (more points, hamster state changes)

### ✅ App background/relaunch around day boundary
- `lastCheckInDate` persists to UserDefaults
- On app launch, `validateStreak()` calculates correct status based on stored date
- If day changed while app was closed, streak status updates accordingly

---

## Testing Requirements
- ✅ Simulate consecutive days of check-ins and confirm streak increments
- ✅ Miss a day and confirm reset behavior is consistent (before freeze)
- ✅ Verify "already checked in" state prevents duplicate increments

---

## Deliverables
- ✅ A robust personal streak system that supports the MVP habit loop.

---

## Files Modified
- `MuscleHamster/Models/Activity.swift` — Added StreakStatus enum, UserStats enhancements
- `MuscleHamster/Services/Activity/ActivityService.swift` — Added streak validation methods
- `MuscleHamster/Views/Home/HomeView.swift` — Enhanced streak section with status display
