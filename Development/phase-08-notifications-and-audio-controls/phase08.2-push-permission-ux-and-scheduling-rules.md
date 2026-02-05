# Phase 08.2 — Push Permission UX and Scheduling Rules

## Header
- **Goal:** Request push permission at the right time and schedule gentle reminders aligned to user preferences and schedule type.
- **Status:** Planning
- **Priority:** MEDIUM
- **Dependencies:** Phase 03 (preferred time + schedule preference)
- **Platforms:** iOS (15+)

---

## UX & Screens (Mobile-First)

### Permission request approach
- Ask at a sensible moment (not immediately on first launch)
- Explain the benefit in warm, hamster-voiced language
- Provide a clear “not now” path without punishment or repeated nagging

### Scheduling rules (high-level)
- Notifications align with:
  - Preferred workout time
  - Fixed vs flexible schedule preference
  - “Today” status (workout day vs rest day)
- Messaging remains nurturing and avoids guilt/shame

---

## Edge Cases
- Permission denied (ensure app still functions fully; allow re-enable guidance)
- User changes preferred time or schedule (notifications adjust)
- Timezone changes and daylight saving time shifts

---

## Testing Requirements
- Permission granted vs denied paths
- Verify notifications are sent at expected times for fixed schedule users
- Verify flexible schedule users are handled predictably (no confusing reminders)

---

## Deliverables
- A push reminder system that supports retention while preserving the app’s emotional tone.

