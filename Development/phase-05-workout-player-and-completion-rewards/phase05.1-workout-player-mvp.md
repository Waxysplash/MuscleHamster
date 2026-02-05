# Phase 05.1 — Workout Player MVP

## Header
- **Goal:** Deliver a reliable, guided workout player that can run through an exercise sequence with timing and interruption safety.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 04
- **Platforms:** iOS (15+)

---

## UX & Screens (Mobile-First)

### Key screens/views
- Workout player screen (exercise name, timer, progress)
- Pause/resume affordance
- “Skip” behavior with guardrails to prevent accidental skipping

### States
- Loading (prepare workout)
- Active (in progress)
- Paused
- Interrupted (app backgrounded / screen locked) with safe resume
- Error (workout data missing/corrupt; offer recovery)

### Accessibility
- Timers and progress information readable by VoiceOver
- Controls labeled clearly (pause, resume, skip, end)

---

## Mobile Considerations
- Backgrounding / relaunch: workout can be resumed predictably or ended safely
- Screen lock: behavior is consistent with user expectations

---

## Testing Requirements
- Start, pause, resume, skip, and finish a workout
- Background app mid-exercise and return
- Lock/unlock screen mid-timer and verify behavior

---

## Deliverables
- A stable workout player foundation ready for completion rewards and streak updates.

