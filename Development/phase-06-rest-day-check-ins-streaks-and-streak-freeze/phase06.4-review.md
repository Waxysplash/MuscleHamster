# Phase 06.4 — Review (Required)

## Header
- **Goal:** Validate rest-day check-ins, streak rules, and streak freeze restoration across edge cases.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 06.1–06.3
- **Platforms:** iOS (15+)

---

## Review Methodology

### Flow-by-Flow Audit
- Rest day → micro-task → points awarded → check-in satisfied → streak increments
- Workout day → complete workout → check-in satisfied → streak increments (no double-counting)
- Miss day → open app → restore streak with freeze → streak continues
- Miss day → open app → decline restore → streak resets

### Edge Case Audit
- Late-night usage / timezone change behavior
- Repeated opens and repeated task attempts
- Failure and retry behavior without duplicate awards or charges

---

## Outcome
- **Sign-off** (no issues) or **one comprehensive fix list** applied in this same session.

