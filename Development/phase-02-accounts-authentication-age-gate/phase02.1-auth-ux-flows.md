# Phase 02.1 — Auth UX Flows

## Header
- **Goal:** Users can sign up, log in, log out, and initiate password recovery with friendly, low-friction UX.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 01
- **Platforms:** iOS (15+)

---

## UX & Screens (Mobile-First)

### Key screens/views
- Welcome / entry (sign up vs log in)
- Sign up (email/password and social entry points as applicable)
- Log in
- Password reset request + confirmation
- Logged-in landing behavior (routes into onboarding if profile incomplete)

### States per screen
- Loading (auth request in progress)
- Error (invalid credentials, account exists, network failure)
- Success (account created, logged in, reset email sent)

### Accessibility
- Clear field labels and error messages readable by VoiceOver
- Focus management that doesn’t trap users in modals

---

## Edge Cases
- Slow network or intermittent connectivity during auth
- User closes app mid-auth and returns later
- Duplicate submission (tap “continue” multiple times)

---

## Testing Requirements
- Create account, log in/out, request password reset
- Verify friendly, non-judgmental error copy
- Verify idempotent behavior under repeated taps / retries

---

## Deliverables
- End-to-end authentication flows usable for MVP testing.

