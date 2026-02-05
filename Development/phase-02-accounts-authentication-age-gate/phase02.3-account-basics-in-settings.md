# Phase 02.3 — Account Basics in Settings

## Header
- **Goal:** Provide clear account state and essential account actions from Settings for MVP testing.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 01.3, Phase 02.1–02.2
- **Platforms:** iOS (15+)

---

## Required Functionality (high-level)
- Settings reflects whether the user is signed in or signed out
- User can log out reliably
- If account deletion is not fully implemented in MVP, provide a clearly labeled placeholder (or a disabled entry) to avoid confusion

---

## UX & Screens
- Account section in Settings shows identity/state in a privacy-safe way
- Clear confirmation for logout (avoid accidental logout)

---

## Edge Cases
- Log out while the app is in a partial onboarding state
- Log out during a network error

---

## Testing Requirements
- Verify logout clears user-specific state and routes appropriately
- Verify returning to app after logout behaves predictably

---

## Deliverables
- A working, user-visible account control surface in Settings.

