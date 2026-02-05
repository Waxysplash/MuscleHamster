# Phase 06.2 — Personal Streak Rules Engine

## Header
- **Goal:** Define and implement personal streak rules based on daily check-ins (workouts or rest-day micro-tasks).
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 05.2, Phase 06.1
- **Platforms:** iOS (15+)

---

## Required Functionality (high-level)
- Define what qualifies as a daily check-in:
  - Workout completion qualifies
  - Rest-day micro-task completion qualifies
- Streak increments once per day when a qualifying check-in occurs
- Streak resets when a day passes without a check-in (subject to streak freeze in Phase 06.3)
- Prevent double-counting within the same day (“already checked in” behavior)

---

## Edge Cases & Scenarios
- Timezone change and late-night usage
- User opens app multiple times in a day
- User completes workout and rest-day task same day (expected behavior must be unambiguous)
- App background/relaunch around day boundary

---

## Testing Requirements
- Simulate consecutive days of check-ins and confirm streak increments
- Miss a day and confirm reset behavior is consistent (before freeze)
- Verify “already checked in” state prevents duplicate increments

---

## Deliverables
- A robust personal streak system that supports the MVP habit loop.

