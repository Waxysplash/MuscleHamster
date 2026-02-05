# Phase 05.2 — Completion Rewards and Activity History

## Header
- **Goal:** On workout completion, award points, update streak/check-in status, update hamster state, and record history.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 05.1
- **Platforms:** iOS (15+)

---

## UX & Screens (Mobile-First)

### Key screens/views
- Workout completion screen (celebration, points earned, streak impact)
- Return-to-Home flow showing hamster “fed/happy”

### States
- Success (rewards granted and reflected)
- Error (reward posting failure; safe retry and avoid double-award)

---

## Data Requirements (high-level)
- Record a workout completion entry containing:
  - When it happened
  - Which workout it was
  - Duration context
  - Points earned
- Ensure the data supports future recommendations and growth milestones.

---

## Edge Cases
- App closes immediately after completion (ensure rewards are not lost)
- Duplicate award risk under retries (idempotent behavior expected)

---

## Testing Requirements
- Complete a workout and verify:
  - Points increase
  - Check-in for the day is satisfied
  - Streak updates as expected (rules defined in Phase 06)
  - Hamster state updates on Home
  - Completion is recorded in history

---

## Deliverables
- A satisfying completion loop that closes the workout experience with immediate reward feedback.

