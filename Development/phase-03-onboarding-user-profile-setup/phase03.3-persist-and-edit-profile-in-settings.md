# Phase 03.3 — Persist and Edit Profile in Settings

## Header
- **Goal:** Save onboarding preferences reliably and allow edits later without forcing re-onboarding.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 01.3, Phase 03.1–03.2
- **Platforms:** iOS (15+)

---

## Required Functionality (high-level)
- Onboarding preferences are persisted and used by later features (workouts, schedule, notifications)
- Users can edit key profile preferences from Settings
- Incomplete onboarding resumes safely and predictably

---

## UX & Screens
- Settings sections for profile edits (fitness goals, level, intent, weekly goal, schedule preference, preferred time)
- Clear copy indicating edits will affect recommendations and reminders

---

## Edge Cases
- User changes schedule type after building a streak (ensure rules remain consistent)
- User edits goals/level and then returns to workouts (recommendations update)
- Partial data due to interruption mid-save (safe defaults and recovery)

---

## Testing Requirements
- Verify edits persist across relaunch and affect downstream surfaces
- Verify resume behavior for incomplete onboarding

---

## Deliverables
- Stable user profile persistence and an edit surface for ongoing personalization.

