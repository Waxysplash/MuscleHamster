# Phase 06.1 — Rest-Day Micro-Tasks

## Header
- **Goal:** Allow rest-day check-ins via very short micro-tasks that maintain streaks and award small points.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 05
- **Platforms:** iOS (15+)

---

## UX & Screens (Mobile-First)

### Key screens/views
- Rest-day check-in prompt from Home
- Micro-task selection:
  - Quick interaction (pet hamster / give treat)
  - Log a positive activity (walk/stretch/journal/meditate)
- Confirmation / reward feedback (small celebration + points)

### States
- Success (check-in recorded, points granted, hamster “chillin’”)
- Error (save failure; retry without double-awarding)

### Accessibility
- Options are clearly labeled and easy to select

---

## Edge Cases
- User completes micro-task after already completing a workout (avoid double check-ins)
- User tries to repeat micro-tasks in the same day (define expected behavior)

---

## Testing Requirements
- Rest day: complete each micro-task type and verify points + check-in state
- Verify Home state changes appropriately after completion

---

## Deliverables
- A rest-day path that sustains streaks and reinforces gentle habit building.

