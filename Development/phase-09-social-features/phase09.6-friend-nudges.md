# Phase 09.6 — Friend Nudges

**Goal:** Enable users to send friendly encouragement to friends who haven't checked in yet today, especially on rest days.

**Status:** Planning
**Priority:** MEDIUM
**Dependencies:** Phase 09.3 (Friend Profile View), Phase 09.4 (Friend Streaks), Phase 08 (Notifications)
**Platforms:** iOS 15+

---

## Overview

### Current State

- ✅ Friends list and profiles exist (after 09.3)
- ✅ Friend streaks exist (after 09.4)
- ✅ Push notification infrastructure exists (Phase 08)
- ❌ No way to encourage friends
- ❌ No nudge sending or receiving

### Problem / Motivation

On rest days, users might need a little encouragement to remember to check in. Friend nudges add a social layer of accountability — a friend's gentle poke is more motivating than a system notification. This also increases engagement by giving users a reason to check their friends' status.

Per the progress.md parking lot:
> "Rest-day nudges: on rest days, encourage/poke friends to get their activity done"

### Required Functionality

1. **Send nudge** — Send a friendly reminder to a friend who hasn't checked in
2. **Receive nudge** — Get notified when a friend nudges you
3. **Nudge limits** — Prevent spam with cooldown/daily limits
4. **Nudge messaging** — Warm, encouraging nudge content

---

## Feature: Send Nudge

### Purpose
Allow users to encourage friends who haven't checked in today.

### When Nudge is Available

A user can nudge a friend when:
- The friend has NOT checked in today (no workout or rest-day task)
- The user HAS checked in today (you're in a position to encourage)
- The user hasn't nudged this friend recently (cooldown)

### Nudge Button Location

**On Friend Profile:**
- Button appears when nudge is available
- Text: "Nudge [Name]" or "Send Encouragement"
- Icon: bell or heart
- Disabled/hidden if:
  - Friend already checked in today
  - User hasn't checked in today
  - Recently nudged (cooldown active)

**On Friends List (Optional):**
- Quick nudge icon on friend rows who need encouragement
- Only shows for friends meeting nudge criteria

### Nudge Flow

1. User views friend who hasn't checked in today
2. User taps "Nudge [Name]"
3. Brief confirmation: "Sending encouragement..."
4. Success: "Sent! [Name]'s hamster will let them know."
5. Button changes to disabled state: "Nudged recently"

### Nudge Cooldown

To prevent spam:
- **Per-friend cooldown:** Can only nudge the same friend once per 8 hours
- **Daily limit (optional):** Max 5 nudges per day across all friends
- Cooldown status shown on button: "Nudge again in 3 hours"

---

## Feature: Receive Nudge

### Purpose
Notify users when a friend sends them encouragement.

### Notification Delivery

When User A nudges User B:

**Push Notification:**
- Title: "[Name] nudged you!"
- Body: "[Name]'s hamster is cheering for you! Time to check in?"
- Tapping opens app to Home screen (to check in)

**In-App Banner:**
- If B opens app and hasn't checked in:
- Show banner at top of Home: "[Name] is rooting for you today!"
- Dismiss on tap or auto-dismiss after viewing

### Nudge Message Variety

Rotate through friendly messages to keep it fresh:

- "[Name] gave your hamster a little cheer! 🎉"
- "[Name]'s hamster is waving at yours! Time to say hi?"
- "Your friend [Name] is thinking of you today!"
- "[Name] sent some encouragement your way! 💪"
- "[Name]'s hamster and yours want to see each other happy!"

### Nudge History (Optional)

- Track who nudged you recently (last 7 days)
- Display in a "Recent Encouragement" section or notification history
- "Thanks" action to acknowledge (future enhancement)

---

## Messaging Guidelines

### Tone Principles

All nudge copy must follow the warm, no-guilt tone:

**DO:**
- "Your friend is cheering for you!"
- "[Name] believes in you!"
- "A little encouragement from [Name]!"
- "Your hamster has a cheerleader!"

**DON'T:**
- "You're about to break your streak!"
- "[Name] is waiting for you!"
- "Don't let [Name] down!"
- "You're behind today!"

### Sender Feedback

When sending a nudge:
- "Your hamster gave [Name]'s hamster a cheer!"
- "[Name]'s hamster got your message!"
- "Encouragement sent!"

---

## Nudge Eligibility Rules

### Sender Requirements
- Must have checked in today (completed workout or rest-day task)
- Cannot be blocked by recipient
- Must be friends with recipient
- Must not have nudged this recipient recently (cooldown)

### Recipient Requirements
- Must NOT have checked in today
- Must not have blocked sender
- Must have notifications enabled (for push delivery)

### Edge Cases

**Sender checks in, then nudges, recipient checks in:**
- Nudge still delivered (harmless)
- Next view of friend profile shows "Already checked in today"

**Recipient blocks sender after receiving nudge:**
- Nudge already delivered, can't be recalled
- Future nudges prevented

**Both friends haven't checked in:**
- Neither can nudge the other
- Nudge button hidden for both
- Message: "Check in first to send encouragement!"

---

## Privacy Considerations

### Opt-Out Option

- Users can disable receiving nudges entirely
- Settings → Notifications → "Friend Nudges" toggle
- When off: friends still see nudge button but delivery is suppressed
- Feedback to sender: "Sent!" (don't reveal opt-out status)

### Visibility

- Only friends can nudge each other (not strangers)
- Blocked users cannot nudge
- Private profiles still receive nudges from existing friends

---

## Accessibility

- Nudge button has clear VoiceOver label: "Nudge [Name], send encouragement"
- Cooldown state announced: "Nudge [Name], available in 3 hours"
- Nudge received notifications readable by VoiceOver
- In-app banner announced when appearing

---

## Data Model

### Nudge Record

Track nudges for cooldown and history:

**Fields:**
- Nudge ID
- Sender user ID
- Recipient user ID
- Timestamp sent
- Type (rest-day encouragement)

**Storage:**
- Store recent nudges locally (for cooldown calculation)
- Sync to backend for delivery
- Prune old nudges (older than 7 days)

---

## Testing Requirements

### Send Nudge Tests
- Nudge available when friend hasn't checked in
- Nudge unavailable when friend already checked in
- Nudge unavailable when user hasn't checked in
- Cooldown prevents rapid re-nudging
- Daily limit enforced (if implemented)

### Receive Nudge Tests
- Push notification delivered with correct content
- In-app banner displays
- Tapping notification opens app correctly
- Opt-out prevents delivery

### Edge Case Tests
- Nudge during recipient's check-in
- Block after nudge sent
- Multiple friends nudging same user

---

## Deliverables

1. **Nudge button** on friend profile view
2. **Nudge sending logic** with cooldown enforcement
3. **Push notification delivery** for nudges
4. **In-app nudge banner** on Home screen
5. **Nudge opt-out toggle** in notification settings
6. **Nudge record tracking** for cooldown and history
7. **Friendly nudge message rotation**

---

## Future Enhancements (Not in Scope)

- "Thanks" response to nudges
- Nudge with custom message
- Nudge reminders for friend streak at-risk situations
- Nudge statistics ("You've encouraged friends 50 times!")
- Nudge badges or rewards

---

## Notes

- Nudges should feel like a friendly wave, not pressure
- The feature should encourage positive interactions between friends
- Consider adding subtle animation when receiving a nudge
- Nudge notifications should be lower priority than streak alerts
- If a user receives many nudges, consider batching: "3 friends are cheering for you!"
