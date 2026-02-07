# Phase 09.5 — Privacy Controls

**Goal:** Enable users to control their social privacy through blocking, profile visibility settings, and friend management.

**Status:** Planning
**Priority:** HIGH
**Dependencies:** Phase 09.1 (Data Models), Phase 09.3 (Friends List)
**Platforms:** iOS 15+

---

## Overview

### Current State

- ✅ Friend data models with blocking support exist (after 09.1)
- ✅ Friend service with block/unblock methods exist (after 09.1)
- ✅ Friends list and profile views exist (after 09.3)
- ❌ No privacy settings UI
- ❌ No blocked users management UI
- ❌ No profile visibility controls

### Problem / Motivation

Users need control over their social experience. They should be able to block unwanted users, control who can see their profile and send requests, and manage their friends list safely. Privacy controls build trust and ensure users feel safe in the app.

### Required Functionality

1. **Block users** — Prevent specific users from interacting with you
2. **Unblock users** — Remove users from blocked list
3. **Profile visibility settings** — Control who can see your hamster and progress
4. **Remove friends** — Unfriend users from friends list
5. **Privacy settings screen** — Centralized location for privacy controls

---

## Feature: Block Users

### Purpose
Allow users to prevent unwanted interactions from specific users.

### What Blocking Does

When User A blocks User B:
- B is removed from A's friends list (if they were friends)
- Any friend streak between them is terminated
- B cannot send friend requests to A
- B cannot see A in username search results
- B cannot see A's profile
- A cannot see B in username search results
- A cannot see B's profile (mutual invisibility)
- Any pending friend requests between them are cancelled

### What Blocking Does NOT Do

- Does not notify B that they've been blocked (silent)
- Does not prevent B from using the app normally
- Does not affect B's other friendships or data
- Does not prevent A from unblocking B later

### Block Flow

**From Friend Profile:**
1. User opens friend's profile
2. User taps overflow menu (three dots)
3. User taps "Block [Name]"
4. Confirmation dialog:
   - Title: "Block [Name]?"
   - Message: "They won't be able to see your profile, send you friend requests, or appear in your searches. They won't be notified."
   - Buttons: "Block" (destructive), "Cancel"
5. On confirm:
   - Friend removed from list
   - Navigate back to friends list
   - Brief confirmation: "Blocked"

**From Search Results:**
1. If user accidentally finds someone they want to block:
2. Tap user row to see mini-profile or overflow menu
3. "Block" option available
4. Same confirmation flow

### Blocked Users List

Users can view and manage their blocked users:

1. Settings → Privacy → Blocked Users
2. List of blocked users (avatar, display name, username)
3. Each row has "Unblock" button
4. Empty state: "No blocked users. That's good!"

### Unblock Flow

1. User opens Blocked Users list
2. User taps "Unblock" next to a user
3. Confirmation dialog:
   - Title: "Unblock [Name]?"
   - Message: "They'll be able to find you and send friend requests again."
   - Buttons: "Unblock", "Cancel"
4. On confirm:
   - User removed from blocked list
   - Brief confirmation: "Unblocked"
   - They are NOT automatically re-added as friend (must send new request)

---

## Feature: Profile Visibility Settings

### Purpose
Control who can see your hamster profile and activity.

### Visibility Levels

**Everyone (Default):**
- Anyone can see your profile in search
- Anyone can send you friend requests
- Anyone can view your public profile info (hamster, growth stage, username)
- Friends see additional info (streak, customizations)

**Friends Only:**
- Only your friends can see your full profile
- Non-friends see a limited profile (just username and "Profile is private")
- Anyone can still send friend requests
- You won't appear in username search for non-friends

**Private:**
- Your profile is hidden from everyone except existing friends
- Non-friends cannot send friend requests
- You don't appear in any search results
- Existing friends can still see your profile
- New friends can only be added via invite link/QR (you initiate)

### Visibility Settings UI

Location: Settings → Privacy → Profile Visibility

**Layout:**
- Radio button or segmented control for visibility level
- Each option with clear description:
  - "Everyone — Anyone can find you and see your hamster"
  - "Friends Only — Only friends can see your profile"
  - "Private — You're hidden from search and requests"

**Change Confirmation:**
- When changing to more restrictive level, no confirmation needed
- When changing to less restrictive level, brief info: "Your profile will now be visible to [group]"

---

## Feature: Remove Friends (Unfriend)

### Purpose
Allow users to end friendships without blocking.

### Unfriend vs Block

**Unfriend:**
- Removes the person from your friends list
- They can still find you in search (if visibility allows)
- They can send a new friend request
- Your friend streak ends
- They are notified (removed from their friends list too)

**Block:**
- More severe — prevents all future interaction
- Silent (they don't know they're blocked)

### Unfriend Flow

1. User opens friend's profile
2. User taps overflow menu
3. User taps "Remove Friend"
4. Confirmation dialog:
   - Title: "Remove [Name] as friend?"
   - Message: "You'll no longer see each other's hamsters. Your streak of X days will end. You can reconnect later by sending a new friend request."
   - Buttons: "Remove" (destructive), "Cancel"
5. On confirm:
   - Friendship terminated
   - Friend streak deleted
   - Navigate back to friends list
   - Brief confirmation: "Friend removed"

---

## Feature: Privacy Settings Screen

### Location
Settings → Privacy

### Layout

**Profile Visibility Section:**
- Current visibility setting displayed
- Tap to change → Profile Visibility picker
- Description of current setting

**Blocked Users Section:**
- Count of blocked users: "Blocked Users (X)"
- Tap to manage → Blocked Users list

**Data & Account Section (placeholders for future):**
- "Download My Data" — future data export feature
- "Delete Account" — future account deletion feature
- For now, show these as "Coming Soon" or link to support

**Friend Requests Section:**
- "Allow Friend Requests" toggle
- When off: no one can send you requests (even with invite link)
- Default: on

---

## Privacy Defaults

Per PRD, privacy features should have safe defaults:

| Setting | Default | Rationale |
|---------|---------|-----------|
| Profile Visibility | Everyone | Social features work best when discoverable |
| Allow Friend Requests | On | Easy to connect with friends |
| Blocked Users | Empty | No one blocked initially |

Users who want more privacy can opt into restrictive settings.

---

## Accessibility

- All privacy controls have clear VoiceOver labels
- Block/Unblock actions announce state change
- Visibility options announce their descriptions
- Confirmation dialogs are properly structured for VoiceOver

---

## Edge Cases

### Block Friend with Active Streak
- User blocks a friend with a 50-day streak
- Streak is immediately terminated (no restore option)
- No notification to blocked friend about streak

### Unblock and Re-Friend
- User A unblocks User B
- User A sends friend request to B
- B accepts
- New friendship starts with fresh streak (0)

### Private User Tries to Add Friend
- User with "Private" visibility tries to search for friends
- They can still search (to find people to invite)
- But others can't find them in search
- They must share invite link for others to add them

### Visibility Change with Pending Requests
- User has 5 pending incoming requests
- User changes visibility to "Private"
- Existing pending requests remain (can still accept/decline)
- No new requests will come in

### Block Someone Who Blocked You
- User A blocks User B
- Later, User B tries to block User A
- Both are already invisible to each other
- B's block action succeeds (redundant but harmless)

---

## Data Persistence

- Blocked users list stored locally and synced to backend
- Visibility setting stored locally and synced to backend
- Changes take effect immediately
- Offline changes queued for sync

---

## Testing Requirements

### Block Tests
- Blocking removes friend and streak
- Blocked user can't find blocker in search
- Blocked user can't send requests to blocker
- Blocking is silent (no notification)

### Unblock Tests
- Unblocking removes from blocked list
- Unblocked user can now find and request blocker
- Previous friendship not restored

### Visibility Tests
- "Everyone" allows search and requests
- "Friends Only" hides from non-friend search
- "Private" blocks all search and requests
- Visibility changes take effect immediately

### Unfriend Tests
- Unfriending removes from both users' lists
- Friend streak is deleted
- Removed friend can re-request

---

## Deliverables

1. **Block user flow** from friend profile and search
2. **Unblock user flow** from blocked users list
3. **Blocked users management screen**
4. **Profile visibility settings** with three levels
5. **Remove friend (unfriend) flow** with confirmation
6. **Privacy settings screen** as central hub
7. Integration with FriendService for all operations

---

## Notes

- Privacy is about trust — users should feel in control
- Blocking should be easy to find but not prominent (we hope users don't need it often)
- Unfriending is a gentler action than blocking — reflect that in copy
- All changes should feel immediate — no "takes 24 hours to take effect"
- Consider privacy in all future social features (groups, gifting, etc.)
