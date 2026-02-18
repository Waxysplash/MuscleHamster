# Phase 04.3 — Recommendation v0 (Rules-Based and Explainable)

## Header
- **Goal:** Provide “Recommended for you” workouts based on onboarding preferences and early history using simple, explainable rules.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 03, Phase 04.1–04.2
- **Platforms:** iOS (15+)

---

## Required Functionality (high-level)
- Recommendations consider:
  - Fitness goals and fitness level from onboarding
  - Fitness intent (maintenance vs improvement)
  - Preferred duration (if captured)
  - Recent history (once it exists): avoid repeating the exact same workout too often; rotate body focus
- Recommendations remain understandable and controllable:
  - Users can see a short “why this was suggested” explanation in plain language
  - Users can easily choose something else (no coercion)

---

## Edge Cases
- New user with no history (use onboarding only)
- Sparse catalog for a selected goal/difficulty (fallback rules that still feel sensible)

---

## Testing Requirements
- Verify recommendation changes when onboarding preferences change
- Verify recommendation adapts once completion history exists
- Verify “why” explanations never shame the user

---

## Deliverables
- A useful recommendation surface that improves decision-making without needing ML.

