# Phase 06.3 — Streak Freeze Restore Flow

## Header
- **Goal:** Let users restore a broken streak by spending points after a missed day, with a clear manual choice.
- **Status:** IMPLEMENTED
- **Priority:** HIGH
- **Dependencies:** Phase 06.2, Phase 07.1 (points wallet expectations)
- **Platforms:** iOS (15+)

---

## UX & Screens (Mobile-First)

### Trigger and user flow
- After a missed day is detected, the next time the user opens the app:
  - Inform them the streak broke in a gentle, non-shaming way
  - Offer an option to spend points to restore the streak (consume one freeze)
  - Provide a clear “not now” option that proceeds with a reset

### States
- Insufficient points (gentle explanation and alternative: accept reset)
- Error during restore (retry safely without double-charging)

### Accessibility
- Choice options are clear and reversible until confirmed

---

## Data Requirements (high-level)
- Track number of freezes owned
- Consume exactly one freeze per restored day
- Record transaction and outcome for troubleshooting

---

## Edge Cases
- User misses multiple days (define whether multiple freezes can be used or only the most recent day)
- User tries to restore after already starting a new streak (define expected behavior)

---

## Testing Requirements
- Miss one day → restore successfully → streak continues
- Miss one day → decline restore → streak resets
- Insufficient points path behaves predictably

---

## Deliverables
- A streak recovery mechanic that feels supportive and respects user agency.

