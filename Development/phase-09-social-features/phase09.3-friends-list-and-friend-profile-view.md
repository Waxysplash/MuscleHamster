# Phase 09.3 — Friends List and Friend Profile View

**Goal:** Enable users to browse their friends list, view friend hamster profiles, and see friend streak information.

**Status:** IMPLEMENTED
**Priority:** HIGH
**Dependencies:** Phase 09.1 (Data Models), Phase 09.2 (Add Friends)
**Platforms:** iOS 15+

---

## Overview

### Current State

- ✅ Social tab exists (placeholder)
- ✅ Friend data models and service exist (after 09.1)
- ✅ Add Friends flow exists (after 09.2)
- ❌ No friends list UI
- ❌ No friend profile view
- ❌ No friend streak display

### Problem / Motivation

Users who have added friends need a way to see their friends list, check how friends' hamsters are doing, view their streaks, and feel connected to their fitness community. The friends list is the primary destination in the Social tab.

### Required Functionality

1. **Friends list** — Main view showing all friends with quick status info
2. **Friend requests section** — Pending incoming requests with accept/decline actions
3. **Friend profile view** — Detailed view of friend's hamster, customizations, and stats
4. **Friend streak display** — Show shared streak with each friend
5. **Empty states** — Friendly messaging for new users with no friends

---

## UX & Screens

### Social Tab — Friends List (Main View)

The Social tab displays the user's friends list as its primary content.

**Layout:**
- **Toolbar:**
  - Title: "Friends"
  - Add Friends button (plus icon or text)
  - Friend Requests button (if pending requests, show badge count)
- **Content:**
  - If pending incoming requests: "Friend Requests" banner/section at top
  - Friends list (scrollable)
  - Each friend row shows: avatar, name, hamster state, friend streak

**Friend Row Content:**
- Friend's hamster avatar (small, with current outfit/state)
- Friend's display name
- Friend's current hamster state icon (happy, hungry, chillin', etc.)
- Friend streak indicator (flame icon + count, if active)
- Last active indicator (optional: "Active today", "Active 2d ago")
- Tap to view friend profile

**Sorting:**
- Default: Friends with active friend streaks first, then by most recent activity
- Optional: Alphabetical

**States:**
- Loading (skeleton UI or spinner)
- Friends list (with friends)
- Empty (no friends yet) — friendly message with "Add Friends" CTA
- Error (retry option)

### Friend Requests View

Accessible from toolbar button or banner. Shows pending incoming friend requests.

**Layout:**
- List of incoming requests
- Each request shows:
  - Sender's hamster avatar
  - Sender's display name and username
  - "Accept" and "Decline" buttons
- Empty state: "No pending requests"

**Request Actions:**
- Accept: adds friend, removes from requests, shows brief confirmation
- Decline: removes from requests silently (sender sees "cancelled" or nothing)

**Outgoing Requests (Optional):**
- Secondary section or tab showing sent requests that are pending
- Each shows recipient name and "Cancel" option

---

## Feature: Friend Profile View

### Purpose
View detailed information about a friend's hamster, their progress, and your shared streak.

### Screen Layout

**Header Section:**
- Friend's hamster display (large, with current outfit, pose, enclosure items)
- Friend's display name
- Friend's username (@handle)
- Hamster's current state badge (Happy, Hungry, Chillin', etc.)
- Hamster's growth stage badge (Baby, Juvenile, Adult, Mature)

**Stats Section:**
- Friend's current personal streak
- Friend's longest personal streak ever
- Total workouts completed (lifetime)
- Member since date (optional)

**Friend Streak Section (with you):**
- Shared streak count with flame icon
- Streak status indicator:
  - Active: "You're both on fire! 🔥"
  - At Risk: "Waiting for [Name] to check in today"
  - Broken: "Your streak together ended. Start a new one?"
- If broken: offer to start fresh (next check-in from both starts new streak)
- Link to Friend Streak Detail view for restore options

**Customization Preview:**
- Show friend's equipped outfit name
- Show friend's equipped accessory name
- Show enclosure items count
- All read-only (cannot interact with friend's items)

**Actions:**
- "Nudge" button (if friend hasn't checked in today) — covered in Phase 09.6
- Overflow menu (three dots):
  - "Remove Friend" (unfriend)
  - "Block User"

### Read-Only Experience

- User can view but cannot modify anything about friend's hamster
- Customizations are view-only (no equip/purchase on friend's behalf)
- Clear visual distinction that this is friend's profile, not own

---

## Feature: Friend Streak Display

### On Friends List Row

Each friend row shows:
- If active friend streak ≥1: flame icon + streak count
- If no friend streak or streak is 0: no flame shown
- If streak "at risk" today: flame with warning indicator (orange tint)

### On Friend Profile

Dedicated section showing:
- Current friend streak count (large number)
- Streak status with friendly message
- Visual indicator of each user's check-in status today:
  - Checkmark if checked in
  - Clock/waiting icon if not yet
- History (optional): "Your best together: X days"

### Streak Status Messages

- Active (both checked in today): "You both crushed it today! 🎉"
- Active (user checked in, friend hasn't): "You're in! Waiting for [Name]..."
- Active (friend checked in, user hasn't): "[Name] is in! Your turn!"
- At Risk (yesterday incomplete by one): "Check in to save your streak!"
- Broken: "Your streak with [Name] ended at X days. Keep going together?"

---

## Empty States

### No Friends Yet

Show when user has no friends:

**Visual:** Illustration of lonely hamster looking hopeful

**Message:**
- Header: "Your hamster wants friends!"
- Body: "Connect with friends to cheer each other on and build streaks together."
- CTA Button: "Add Friends"

### No Friend Requests

Show in Friend Requests view when none pending:

**Message:** "No pending requests right now. Your hamster is patient!"

---

## Accessibility

- Friends list rows have complete VoiceOver labels: "[Name], [hamster state], [friend streak X days if applicable]"
- Friend profile sections are properly grouped and labeled
- Accept/Decline buttons have clear action labels
- Hamster preview has descriptive label: "[Name]'s hamster, wearing [outfit], looking [state]"
- All actions (nudge, remove, block) are announced

---

## Navigation

- **Social Tab** → Friends List (default)
- **Friends List** → tap friend row → **Friend Profile** (push)
- **Friends List** → toolbar Add → **Add Friends** (push or sheet)
- **Friends List** → toolbar Requests → **Friend Requests** (push or sheet)
- **Friend Profile** → Friend Streak section tap → **Friend Streak Detail** (push)

---

## Data Loading

### Friends List
- Load on tab appear
- Pull-to-refresh support
- Cache friends list for offline viewing
- Show cached data immediately, refresh in background

### Friend Profile
- Load fresh on appear (profile may have changed)
- Show cached data immediately if available, refresh in background
- Graceful handling if friend unfriended or blocked while viewing

### Friend Requests
- Load on view appear
- Auto-refresh after accept/decline actions
- Badge count updates via push notification or periodic poll

---

## Edge Cases

### Friend Removed While Viewing Profile
- If viewing friend profile and they unfriend you:
  - On next refresh, show error: "This profile is no longer available"
  - Navigate back to friends list

### Friend Blocks You
- Friend disappears from friends list
- If viewing their profile, same handling as removal

### You Block Friend While Viewing
- Confirm dialog: "Block [Name]? They won't be able to see your profile or send requests."
- On confirm: navigate back, friend removed from list

### Large Friends List
- If 50+ friends, consider:
  - Pagination or infinite scroll
  - Search/filter option
  - Performance optimization for smooth scrolling

---

## Testing Requirements

### Friends List Tests
- List loads and displays correctly
- Empty state shows when no friends
- Pull-to-refresh works
- Friend streak indicators display correctly

### Friend Requests Tests
- Incoming requests display correctly
- Accept adds friend and removes request
- Decline removes request
- Badge count updates

### Friend Profile Tests
- Profile loads with correct data
- Hamster customizations display correctly
- Stats display correctly
- Remove friend works
- Block user works

---

## Deliverables

1. **Friends list view** as Social tab main content
2. **Friend row component** with avatar, state, streak indicator
3. **Friend requests view** with accept/decline actions
4. **Friend profile view** with hamster display, stats, and friend streak
5. **Empty states** for no friends and no requests
6. **Navigation** between list, profile, and requests
7. **Caching** for offline friends list viewing

---

## Notes

- Friend profile should feel like peeking into a friend's world — warm and inviting
- Streak messaging should encourage, not pressure: "Keep it going!" not "Don't break it!"
- The friends list is the "social hub" — make it feel lively with hamster avatars and activity
- Consider adding subtle animations when friend streaks update
