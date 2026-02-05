# Phase 07.4 — Growth Progression Milestones

## Header
- **Goal:** Implement hamster growth stages (baby → later stages) triggered by positive milestones and surfaced as a celebratory moment.
- **Status:** Planning
- **Priority:** MEDIUM
- **Dependencies:** Phase 05.2 (history), Phase 06 (streak), Phase 07.3 (display)
- **Platforms:** iOS (15+)

---

## Required Functionality (high-level)
- Hamster starts as baby and progresses through stages over time
- Growth is triggered by cumulative positive milestones (workouts completed and/or streak milestones)
- Growth never regresses and the hamster never “dies”
- Users receive clear, delightful feedback when growth occurs

---

## UX & Screens
- Home reflects current growth stage
- Growth moment: a short, warm celebration that reinforces progress

---

## Edge Cases
- User hits multiple milestones at once (define whether growth can “skip” or progresses one stage at a time)
- Reinstall / restore account (growth stage remains consistent)

---

## Testing Requirements
- Simulate milestone progression and verify stage transitions
- Verify growth moment appears once per milestone and is not repeated incorrectly

---

## Deliverables
- A visible, positive progression system tied to user consistency.

