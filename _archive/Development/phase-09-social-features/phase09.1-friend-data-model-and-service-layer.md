# Phase 09.1 — Friend Data Model and Service Layer

**Goal:** Establish the core data models and service layer for friend relationships, requests, blocking, and friend streaks.

**Status:** Planning
**Priority:** HIGH
**Dependencies:** Phase 02 (Authentication), Phase 06 (Streaks/Activity model)
**Platforms:** iOS 15+

---

## Overview

### Current State

- ✅ User model exists with authentication
- ✅ UserStats and streak system exist
- ✅ ActivityService handles personal activity
- ❌ No friend relationship model
- ❌ No friend request model
- ❌ No friend streak model
- ❌ No friend service layer

### Problem / Motivation

Before building any social UI, we need the foundational data models and service layer that represent friend relationships, handle requests, manage blocking, and track friend streaks. This layer will be consumed by all subsequent social feature subphases.

### Required Functionality

1. **Friend relationship model** — Represent mutual friendship between two users
2. **Friend request model** — Track pending, accepted, declined requests
3. **Friend streak model** — Shared streak counter between two friends
4. **Blocked user model** — Prevent interactions between users
5. **Friend service protocol** — Define operations for friend management
6. **Mock friend service** — In-memory implementation for development/testing

---

## Data Models

### FriendRelationship

Represents a mutual friendship between two users.

**Fields:**
- Unique identifier for the relationship
- User ID of first friend
- User ID of second friend
- Relationship status (pending request, accepted, blocked by either)
- Timestamp when friendship was established
- Reference to friend streak (if exists)

**Behavior:**
- Friendships are mutual — if A is friends with B, B is friends with A
- Only one relationship record exists per user pair (not duplicated)
- Relationship can be terminated by either user (unfriend)

### FriendRequest

Represents a pending friend request from one user to another.

**Fields:**
- Unique identifier
- Sender user ID
- Receiver user ID
- Request status (pending, accepted, declined, cancelled, expired)
- Timestamp sent
- Timestamp responded (if applicable)
- Optional message from sender (future consideration, not MVP)

**Behavior:**
- User can have multiple pending outgoing requests
- User can have multiple pending incoming requests
- Accepting a request creates a FriendRelationship
- Declining or cancelling removes the request
- Duplicate requests to same user should be prevented
- Requests to/from blocked users should be prevented

### FriendStreak

Represents a shared streak between two friends.

**Fields:**
- Unique identifier
- User ID of first friend
- User ID of second friend
- Current streak count
- Last check-in date for first friend
- Last check-in date for second friend
- Streak status (active, at risk, broken)
- Previous broken streak count (for restore)
- Timestamp created
- Timestamp last updated

**Behavior:**
- Friend streak increments when BOTH users check in on the same calendar day
- Friend streak resets to 0 if either user misses a day (no freeze by default)
- Friend streak can be restored by spending points (one or both users)
- "At risk" status when one user has checked in but the other hasn't (late in day)
- Friend streak is separate from personal streak — both can exist independently

### BlockedUser

Represents a blocking relationship (one-directional).

**Fields:**
- Unique identifier
- Blocker user ID (who initiated the block)
- Blocked user ID (who is blocked)
- Timestamp blocked

**Behavior:**
- Blocking is one-directional — A blocks B, but B may not have blocked A
- When blocked, existing friendship is terminated
- Blocked user cannot send friend requests to blocker
- Blocked user cannot see blocker's profile in search
- Blocker cannot see blocked user's profile in search
- Blocking is silent — blocked user is not notified

---

## Friend Service Protocol

### Core Operations

**Friend List:**
- Get all friends for a user (returns list of friend profiles with basic info)
- Get friend count for a user

**Friend Requests:**
- Send friend request (sender, receiver)
- Accept friend request (request ID)
- Decline friend request (request ID)
- Cancel outgoing request (request ID)
- Get pending incoming requests for user
- Get pending outgoing requests for user

**Friend Management:**
- Remove friend (unfriend)
- Check if two users are friends
- Get friend profile (friend's public info: hamster, streak, customizations)

**Blocking:**
- Block user
- Unblock user
- Get blocked users list
- Check if user is blocked by another

**Friend Streaks:**
- Get friend streak for two users
- Update friend streak (called when either user checks in)
- Restore friend streak — self only (costs points)
- Restore friend streak — for both (costs double points)
- Get all friend streaks for a user

**Discovery:**
- Search users by username (with blocked filter)
- Find users by phone number hashes (contacts matching)
- Generate invite link/code for user
- Accept invite link/code

---

## Friend Streak Rules Engine

### Daily Check-In Logic

When a user completes a check-in (workout or rest-day task):

1. Get all friend streaks for that user
2. For each friend streak:
   - Update that user's last check-in date
   - If both users have now checked in today → increment streak count
   - If only this user has checked in → streak status = "active" (waiting for friend)
3. Persist updated friend streaks

### Daily Streak Validation

On app launch (similar to personal streak validation):

1. Get all friend streaks for the user
2. For each friend streak:
   - If EITHER user missed yesterday (no check-in) AND streak > 0:
     - Status = "broken"
     - Store previous streak count
     - Set current streak to 0 (unless restored)
   - If one user checked in yesterday but other didn't:
     - Status = "at risk" or "broken" depending on timing

### Friend Streak Restore

When a friend streak is broken:

1. Either friend can pay 150 points to restore THEIR side
   - Their check-in for the missed day is retroactively recorded
   - If both friends restore, streak continues
2. One friend can pay 300 points to restore for BOTH
   - Both users' check-ins are retroactively recorded
   - Streak continues immediately
3. If neither restores and new day begins, broken streak persists

**Restore Window:** Restore is only available on the day after the streak broke (same as personal streak freeze)

---

## Error Handling

### FriendError Cases

- User not found (invalid user ID)
- Already friends (duplicate request)
- Request not found
- Request already responded
- Cannot friend self
- User blocked (attempting action with blocked user)
- Insufficient points (for streak restore)
- No streak to restore
- Streak already active (cannot restore non-broken streak)
- Rate limited (too many requests in short time)

All errors should have friendly, hamster-voiced messages (no shame language).

---

## Persistence

### Local Storage (UserDefaults/Cache)

- Friends list (for offline viewing)
- Pending friend requests (for badge counts)
- Friend streaks (for Home screen display)
- Blocked users list

### Sync Strategy

- Friends list refreshes on Social tab appear
- Friend streaks refresh on Home screen appear and after check-ins
- Requests refresh periodically and via push notification trigger
- Optimistic UI for actions (show immediately, sync in background)
- Queue failed actions for retry when online

---

## Edge Cases

### Blocking Scenarios
- User A sends request to User B, then B blocks A → request cancelled, A sees "request cancelled"
- User A and B are friends, A blocks B → friendship terminated, B removed from A's list
- User A blocks B, then A searches for B → B not shown in results
- User B (blocked) searches for A → A not shown in results

### Request Scenarios
- User A sends request to B, B already sent request to A → auto-accept both, become friends
- User A sends request to B, then cancels, then sends again → allowed (not rate limited for same user)
- User A has 100+ pending incoming requests → paginate/limit display

### Friend Streak Scenarios
- Friends in different timezones → use calendar day based on each user's device timezone
- Both friends check in at 11:59 PM and 12:01 AM → streak increments if same calendar day per user
- One friend deletes account → friend streak removed, other user notified

---

## Testing Requirements

### Unit Tests
- FriendRequest state transitions (pending → accepted/declined/cancelled)
- FriendStreak increment logic
- FriendStreak break detection
- FriendStreak restore point deduction
- Blocking prevents actions

### Integration Tests
- Full friend request flow: send → accept → unfriend
- Friend streak accumulation over multiple days
- Friend streak break and restore
- Blocking terminates friendship

---

## Deliverables

1. **FriendRelationship** model with all fields and helpers
2. **FriendRequest** model with status enum and transitions
3. **FriendStreak** model with streak status enum and calculations
4. **BlockedUser** model
5. **FriendError** enum with friendly messages
6. **FriendServiceProtocol** defining all operations
7. **MockFriendService** actor implementation with in-memory storage
8. Updates to **ActivityService** to trigger friend streak updates on check-in

---

## Notes

- Friend streak logic is more complex than personal streaks because it involves two users' states
- Consider caching friends list aggressively for performance
- Blocking logic must be checked on every social action (search, request, view)
- All friend-related copy should be warm and encouraging — "Your friend is on fire! 5-day streak together!"
