# Phase 02.2 — Age Gate and Compliance Behavior

## Header
- **Goal:** Enforce a 13+ age gate prior to account creation and ensure under-13 users cannot proceed.
- **Status:** ✅ IMPLEMENTED
- **Priority:** HIGH
- **Dependencies:** Phase 02.1
- **Platforms:** iOS (15+)

---

## UX & Screens (Mobile-First)

### Key screens/views
- Age gate confirmation screen (13+ requirement)
- Under-13 blocked outcome screen (clear, gentle, compliant)

### Behavior requirements
- Age gate is enforced before account creation is completed
- Under-13 outcome prevents continued use of account creation flows
- Returning users do not repeatedly see the gate once properly completed (unless required by policy changes)

### States
- Clear success path for 13+ confirmation
- Clear blocked path for under-13 confirmation

---

## Edge Cases
- User attempts to bypass by back navigation / app relaunch
- User starts sign-up, backgrounds app, returns mid-flow

---

## Testing Requirements
- Verify 13+ path continues to auth/onboarding
- Verify under-13 path blocks progression reliably
- Verify behavior on relaunch and after logout

---

## Deliverables
- Compliant age gating that is robust across common navigation patterns.

