# Phase 08.3 — Notification Tap Routing and “Today” Context

## Header
- **Goal:** When users tap a notification, route them to the correct “today” action (workout vs rest-day check-in) safely.
- **Status:** Planning
- **Priority:** MEDIUM
- **Dependencies:** Phase 05–06, Phase 08.2
- **Platforms:** iOS (15+)

---

## Required Functionality (high-level)
- Tapping a notification opens the app into the relevant “today” context:
  - If today is a workout day and user hasn’t checked in: route toward starting a workout
  - If today is a rest day and user hasn’t checked in: route toward micro-task check-in
  - If user already checked in today: route to Home with a positive acknowledgment
- If user is logged out or onboarding is incomplete, route safely to the correct prerequisite step.

---

## Edge Cases
- Notification tapped after schedule/time settings changed
- Notification tapped while offline
- Notification tapped after midnight boundary (stale reminder)

---

## Testing Requirements
- Tap notifications under each “today status” and verify correct routing
- Verify safe behavior for logged-out and partially onboarded users

---

## Deliverables
- A notification experience that feels helpful and context-aware, not confusing.

