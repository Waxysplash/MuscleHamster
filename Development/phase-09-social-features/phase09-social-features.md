# Phase 09 — Social Features

**Goal:** Enable users to connect with friends, view each other's hamsters and progress, maintain shared friend streaks, and control their social privacy.

**Status:** Planning
**Priority:** HIGH
**Dependencies:** Phase 02 (Authentication), Phase 06 (Streaks), Phase 07 (Customization)
**Platforms:** iOS 15+
**Release Target:** v1.1 (Post-MVP)

---

## Overview

### Current State

- ✅ Social tab exists (placeholder from Phase 01)
- ✅ User authentication and profiles exist
- ✅ Personal streaks and check-in system exist
- ✅ Hamster customization and states exist
- ✅ Points economy exists
- ❌ No friend relationships or requests
- ❌ No way to discover or add friends
- ❌ No friend streak tracking
- ❌ No privacy controls (blocking, visibility)

### Problem / Motivation

Users want to share their fitness journey with friends for mutual motivation. Social accountability (seeing friends' hamsters and maintaining shared streaks) increases engagement and retention. The hamster companion becomes more meaningful when friends can see each other's progress.

### Required Functionality (High-Level)

1. **Friend Discovery & Adding** — Find and connect with friends via username search, phone contacts, or shareable invite links/QR codes
2. **Friends List & Profiles** — View list of friends, see their hamster's state, customizations, and streak info
3. **Friend Streaks** — Maintain shared streak counters that require both users to check in daily
4. **Privacy Controls** — Block users, control profile visibility, manage friend requests
5. **Friend Nudges** — On rest days, send friendly encouragement to friends who haven't checked in

### Out of Scope

- Groups/teams (multiple users, group streaks) — future consideration
- Gifting items between friends — future consideration
- Leaderboards or competitive rankings — explicitly excluded per PRD
- In-app chat or messaging — future consideration
- Real-time presence (online/offline status) — future consideration

### Assumptions

- Backend service layer will handle friend relationships, requests, and data sync
- Phone contacts access requires explicit user permission (iOS Contacts framework)
- Friend discovery via contacts uses phone number hashing (never stored raw) for privacy
- Push notifications for friend requests and friend streak updates build on Phase 08 infrastructure

---

## Implementation Subphases

| Subphase | Title | Description |
|----------|-------|-------------|
| 09.1 | [Friend Data Model and Service Layer](phase09.1-friend-data-model-and-service-layer.md) | Core data models, friend relationships, requests, blocking infrastructure |
| 09.2 | [Add Friends UX](phase09.2-add-friends-ux.md) | Username search, contacts import, invite link/QR code sharing |
| 09.3 | [Friends List and Friend Profile View](phase09.3-friends-list-and-friend-profile-view.md) | Browse friends, view friend's hamster and progress |
| 09.4 | [Friend Streaks](phase09.4-friend-streaks.md) | Shared streak tracking, break/restore mechanics |
| 09.5 | [Privacy Controls](phase09.5-privacy-controls.md) | Blocking, visibility settings, unfriending |
| 09.6 | [Friend Nudges](phase09.6-friend-nudges.md) | Rest-day encouragement pokes to friends |
| 09.7 | [Review](phase09.7-review.md) | Final review and sign-off |

---

## Key Screens/Views

| Screen | Purpose |
|--------|---------|
| Social Tab (Friends List) | Primary hub — list of friends with status, quick actions |
| Add Friends | Discovery methods: search, contacts, invite link |
| Friend Profile | View friend's hamster, customizations, streak info |
| Friend Requests | Pending incoming/outgoing requests |
| Friend Streak Detail | Shared streak with friend, restore options |
| Privacy Settings | Blocking, visibility controls |

---

## Navigation Structure

- **Social Tab** — Main entry point (tab bar)
  - Friends List (default view)
  - Add Friends (button in toolbar)
  - Friend Requests (badge count, accessible from toolbar)
- **Friend Profile** — Push from Friends List, shows friend detail
- **Friend Streak Detail** — Push from Friend Profile or streak section
- **Privacy Settings** — Accessible from Settings > Privacy

---

## Data Model Overview

### Friend Relationship
- Two users connected as friends (mutual relationship after request acceptance)
- Relationship status: pending, accepted, blocked
- Timestamps for request sent, accepted

### Friend Request
- Sender and receiver user IDs
- Status: pending, accepted, declined, cancelled
- Expiration (optional: auto-decline after X days)

### Friend Streak
- Two user IDs (ordered pair)
- Current shared streak count
- Last check-in date for each user
- Streak status: active, at risk, broken
- Previous broken streak (for restore)

### Blocked User
- Blocker user ID, blocked user ID
- Timestamp
- Effect: prevents friend requests, hides profiles from each other

---

## Points Economy (Friend Streaks)

Per PRD Appendix C:
| Action | Points |
|--------|--------|
| Friend streak freeze — self only | 150 |
| Friend streak freeze — pay for both | 300 |

---

## Privacy & Security Considerations

- **Contacts hashing:** Phone numbers from contacts are hashed client-side before sending to backend for matching. Raw phone numbers never transmitted or stored.
- **Blocking:** Blocked users cannot see blocker's profile, send requests, or appear in search results. Blocking is silent (blocked user is not notified).
- **Visibility controls:** Users can hide their profile from non-friends or make it completely private.
- **Friend request limits:** Rate limiting to prevent spam requests.
- **Data minimization:** Only share necessary friend data (no email, no precise location).

---

## Related Phases

- **Phase 02** — Authentication (user identity)
- **Phase 06** — Streaks (personal streak system, foundation for friend streaks)
- **Phase 07** — Customization (hamster appearance shown to friends)
- **Phase 08** — Notifications (friend request alerts, friend streak reminders)

---

## Notes

- **Tone:** All friend-related copy must follow the warm, no-guilt tone. Friend streak breaks should be "Your shared streak with [Name] needs attention" not "You broke your streak!"
- **Accessibility:** Friend list and profiles must be fully VoiceOver accessible. Friend hamster previews should have descriptive labels.
- **Performance:** Friend list should load quickly even with many friends. Consider pagination if needed.
- **Offline:** Friend list should be cached for offline viewing. Actions (add, block, nudge) queue for sync when online.
