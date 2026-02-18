# Phase 03.2 — Hamster Naming and First “Meet” Moment

## Header
- **Goal:** Let users name their hamster and experience a delightful “meet your hamster” moment that motivates the first action.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 03.1
- **Platforms:** iOS (15+)

---

## UX & Screens (Mobile-First)

### Key screens/views
- Hamster naming screen (with simple validation)
- “Meet your hamster” moment in its enclosure (initial state)
- Clear next step: start first workout or explore workouts

### States
- Validation (empty name, overly long names, unsupported characters where relevant)
- Error (saving failure with retry)
- Success (name saved, confirmation)

### Accessibility
- Name input field labeled clearly
- Confirm/continue controls readable and reachable

---

## Edge Cases
- User wants to rename later (should be allowed anytime; implemented later or noted as requirement)
- User re-enters onboarding after logout/login (ensure consistent behavior)

---

## Testing Requirements
- Name set successfully and persists across app relaunch
- Friendly validation and error handling

---

## Deliverables
- Hamster identity established (name) and an emotionally resonant first moment.

