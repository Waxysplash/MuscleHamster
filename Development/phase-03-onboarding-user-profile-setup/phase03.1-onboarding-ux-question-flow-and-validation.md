# Phase 03.1 — Onboarding UX (Question Flow and Validation)

## Header
- **Goal:** Collect core user preferences in a low-friction, low-cognitive-load onboarding flow.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 02
- **Platforms:** iOS (15+)

---

## UX & Screens (Mobile-First)

### Key screens/views
- Onboarding sequence collecting:
  - Age (captured for personalization; separate from the 13+ gate)
  - Fitness level (beginner/intermediate/hard)
  - Fitness goals (multi-select: cardio, muscle gain, fat loss, flexibility, general fitness)
  - Weekly workout goal (e.g., days per week)
  - Schedule preference (fixed vs flexible)
  - Preferred workout time (broad buckets or specific time)
  - Fitness intent (maintenance vs improvement)

### Navigation
- Clear forward progression with the ability to go back without losing data
- Progress indicator that doesn’t overwhelm

### States per screen
- Validation (inline, friendly)
- Loading (saving/continuing if network involved)
- Error (recoverable, retry)

### Accessibility
- VoiceOver reads question prompts and selected options clearly
- Multi-select controls are understandable and reversible

---

## Edge Cases
- User abandons onboarding mid-flow and returns later (resume safely)
- User changes mind and edits answers (including switching schedule type)
- Slow network while continuing

---

## Testing Requirements
- Complete onboarding with multiple goal combinations and schedule types
- Verify validation and persistence when navigating back/forward
- Verify resume behavior after app restart

---

## Deliverables
- A complete onboarding questionnaire flow ready to power personalization and scheduling.

