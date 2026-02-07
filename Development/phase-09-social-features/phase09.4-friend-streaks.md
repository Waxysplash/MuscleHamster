# Phase 09.4 — Friend Streaks

**Goal:** Implement shared streak tracking between friends with break detection and restoration mechanics using points.

**Status:** Planning
**Priority:** HIGH
**Dependencies:** Phase 09.1 (Data Models), Phase 09.3 (Friend Profile View), Phase 06 (Personal Streak System)
**Platforms:** iOS 15+

---

## Overview

### Current State

- ✅ Personal streak system exists (Phase 06)
- ✅ Friend data models exist (after 09.1)
- ✅ Friend profile view exists (after 09.3)
- ❌ No friend streak tracking logic
- ❌ No friend streak break/restore flow
- ❌ No friend streak detail view

### Problem / Motivation

Friend streaks add social accountability — knowing a friend is counting on you increases motivation to check in. When friend streaks break, users should have options to restore them, similar to personal streak freezes, but with the added dimension of paying for yourself, your friend, or both.

### Required Functionality

1. **Friend streak creation** — Automatically created when two users become friends
2. **Friend streak increment** — Increment when BOTH friends check in same day
3. **Friend streak break detection** — Detect when either friend misses a day
4. **Friend streak restore flow** — Options to restore with points (self, both)
5. **Friend streak detail view** — Dedicated screen for managing a specific friend streak

---

## Friend Streak Mechanics

### Streak Creation

- When two users become friends, a friend streak is created with count = 0
- The streak starts counting from the first day both check in
- If users were previously friends (unfriended, re-friended), a new streak starts at 0

### Streak Increment Logic

A friend streak increments when:
1. User A checks in (workout OR rest-day task) on calendar day D
2. User B checks in (workout OR rest-day task) on calendar day D
3. The streak count increases by 1

**Calendar Day Definition:**
- Each user's check-in is evaluated in their device's local timezone
- For the streak to increment, both must check in on "the same calendar day" from their own perspective
- Example: User A in EST checks in at 11 PM Monday, User B in PST checks in at 9 PM Monday — both count as Monday, streak increments

### Streak Status States

**Active (both checked in today):**
- Both users have checked in today
- Streak is safe for the day
- Display: green checkmarks for both users

**Waiting (partial check-in):**
- One user has checked in today, the other hasn't yet
- Streak is still active, waiting for second user
- Display: checkmark for one, clock for other
- Message: "Waiting for [Friend] to check in"

**At Risk:**
- It's late in the day and one user hasn't checked in
- Optional: trigger notification to the user who hasn't checked in (via Phase 09.6 nudges)
- Display: warning indicator

**Broken:**
- The previous day ended without both users checking in
- Streak count is now 0 (or pending restore)
- Previous streak count stored for restore option
- Display: broken streak indicator

### Streak Break Detection

On app launch (similar to personal streak validation):

1. For each friend streak where streak > 0:
2. Get the last check-in date for both users
3. If yesterday (day before today) is missing a check-in from EITHER user:
   - Status = broken
   - previousStreak = current streak count
   - currentStreak = 0
4. Update UI to reflect broken status

**Immediate Break (per PRD):**
> "Resets immediately if either user misses a day, regardless of reason."

Unlike personal streaks (which can be frozen beforehand), friend streaks break immediately and can only be restored AFTER the break.

---

## Friend Streak Restore Flow

### Restore Window

- Restore is available only on the day after the streak broke
- Once a new day passes without restore, the broken streak is finalized
- Starting a new streak requires both users to check in again

### Restore Options

Per PRD, when a friend streak breaks:

**Option 1: Restore Self Only (150 points)**
- User pays 150 points to restore THEIR side of the streak
- Their check-in for the missed day is retroactively recorded
- If both users restore their own side, the streak continues
- If only one restores, streak remains broken until other restores or new streak begins

**Option 2: Restore for Both (300 points)**
- User pays 300 points (double) to restore the streak for BOTH users
- Both users' check-ins are retroactively recorded
- Streak continues immediately
- Friend is notified: "[Name] saved your streak together! 🎉"

**Option 3: Let It Go (0 points)**
- Accept the broken streak
- Start fresh on the next day both check in
- Friendly messaging: "That's okay! Your hamsters are excited to start a new streak together."

### Restore Eligibility

- User can only restore if:
  - They have enough points (150 or 300)
  - The streak was broken (not already active)
  - The restore window hasn't passed (same day as break detection)
  - They haven't already restored their side

- User CANNOT restore if:
  - They already checked in today (started new streak)
  - Friend has blocked them
  - Friendship was terminated

---

## Friend Streak Detail View

### Purpose
Dedicated screen for viewing and managing a specific friend streak.

### Access
- From Friend Profile → Friend Streak section tap
- From Home screen friend streak widget (optional future enhancement)

### Layout

**Header:**
- Both users' hamster avatars side by side
- Large streak count in center
- Streak status badge (Active, Waiting, At Risk, Broken)

**Today's Status Section:**
- Visual showing each user's check-in status for today:
  - User's avatar + checkmark or clock
  - Friend's avatar + checkmark or clock
- Message based on status:
  - Both in: "You're both on fire today! 🔥"
  - Waiting for friend: "You're in! [Name] hasn't checked in yet."
  - Waiting for user: "[Name] is in! Time to check in!"
  - Both waiting: "Neither of you have checked in yet. Let's go!"

**Streak Stats:**
- Current streak: X days
- Best streak ever: X days
- Days as streak partners: X (total days since becoming friends)

**If Streak is Broken — Restore Section:**
- Broken streak display: "Your streak ended at X days"
- Hamster reaction (sad but hopeful)
- Restore options:
  - "Restore My Side (150 points)" — shows after purchase: "Waiting for [Name] to restore..."
  - "Restore for Both (300 points)" — shows confirmation: "This saves the streak for you AND [Name]!"
  - "Start Fresh" — dismisses restore, accepts broken streak
- Current points balance displayed
- If insufficient points: friendly message with encouragement

**Actions:**
- "Nudge [Name]" button (if friend hasn't checked in today) — Phase 09.6
- Back navigation

### Restore Confirmation

Before deducting points:
- Confirmation dialog explaining the action
- For "Restore for Both": "[Name] will be notified that you saved the streak!"
- Show points cost and balance after

### Post-Restore State

After successful restore:
- Celebration animation
- "Streak saved! You're back to X days together."
- If restored for both: "We let [Name] know you're a great friend! 💪"
- Return to active streak state

---

## Notifications

### Friend Streak Reminders (via Phase 08 infrastructure)

- If user has checked in but friend hasn't (late in day):
  - Optional: push to user: "[Friend]'s hamster is waiting! Your streak is at risk."
  - Or: rely on friend nudge (Phase 09.6)

### Friend Streak Break Notification

- When friend streak breaks:
  - Push to both users: "Your streak with [Name] ended at X days. Restore it or start fresh!"
  - Tapping opens Friend Streak Detail view

### Friend Restored Notification

- If friend restores for both:
  - Push to the other user: "[Name] saved your streak together! 🎉 You're at X days."

---

## Edge Cases

### Both Users Restore Simultaneously
- If User A and User B both tap "Restore My Side" at the same time:
  - Backend handles idempotently — each pays 150, streak restored
  - Both see success

### One User Restores Self, Other Pays for Both
- If User A taps "Restore My Side" (150 points)
- Then User B taps "Restore for Both" (300 points)
- User B's action should detect A already restored and only charge for B's side (150 points)
- OR: show message "Your friend already restored their side! Just restore yours."

### Friend Unfriends During Restore Window
- If friendship terminated while broken streak exists:
  - Restore option no longer available
  - Streak data cleaned up

### Timezone Edge Cases
- User A checks in at 11:30 PM Monday (their time)
- User B checks in at 12:30 AM Tuesday (their time)
- These are different calendar days — streak for Monday requires A only
- B's check-in counts for Tuesday
- If A doesn't check in Tuesday, streak breaks

### New Friendship, Immediate Check-In
- User A and B become friends
- Both have already checked in today (before becoming friends)
- Friend streak starts at 1 (today counts as first mutual day)

---

## UI States

### Active Streak Display
- Flame icon with count
- Green accent color
- Both users' checkmarks visible

### Waiting State
- Flame icon with count (dimmed)
- One checkmark, one clock
- "Waiting for [Name]"

### At Risk State
- Flame icon with warning
- Orange accent color
- "Check in to keep your streak!"

### Broken State
- Broken flame icon
- Gray accent color
- "Streak ended at X days"
- Restore options visible

---

## Testing Requirements

### Streak Increment Tests
- Streak increments when both check in same day
- Streak doesn't increment if only one checks in
- Streak handles timezone differences correctly

### Streak Break Tests
- Streak breaks when either user misses a day
- Break detection runs correctly on app launch
- Previous streak stored for restore

### Restore Tests
- Restore self only deducts 150 points and marks user as restored
- Restore for both deducts 300 points and restores streak
- Insufficient points shows friendly error
- Restore not available after window passes

### Edge Case Tests
- Simultaneous restore handling
- Unfriend during restore window
- Re-friend after previous streak

---

## Deliverables

1. **Friend streak increment logic** integrated with check-in flow
2. **Friend streak break detection** on app launch
3. **Friend streak detail view** with status display
4. **Restore flow** with three options (self, both, start fresh)
5. **Point deduction** for restore actions
6. **Notifications** for streak breaks and restores
7. **UI states** for all streak conditions

---

## Notes

- Friend streaks should feel collaborative, not competitive — "together" language throughout
- Break messaging should be gentle: "Your streak took a pause" not "You failed your friend"
- Restore for both is a generous gesture — celebrate it warmly
- The 300-point "save both" option adds a nice social/gift mechanic
