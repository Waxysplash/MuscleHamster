# Phase 08.2 — Push Permission UX and Scheduling Rules

## Header
- **Goal:** Request push permission at the right time and schedule gentle reminders aligned to user preferences and schedule type.
- **Status:** In Progress
- **Priority:** MEDIUM
- **Dependencies:** Phase 03 (preferred time + schedule preference), Phase 06 (streak status, check-in tracking)
- **Platforms:** iOS (15+)

---

## Overview

### Current State
- **Notifications toggle exists** in Settings (Phase 01.3) — currently non-functional placeholder
- **NotificationSettingsView** exists as placeholder ("Coming Soon")
- **User preferences available** — `preferredWorkoutTime` (morning/afternoon/evening/noPreference) and `schedulePreference` (fixed/flexible) from onboarding
- **Streak and check-in data available** — `UserStats` tracks check-in status, streak, and hamster state

### Problem / Motivation
Users need gentle reminders to maintain their workout habit without feeling pressured. The notification system must:
- Request permission at a natural moment (not immediately on launch)
- Align reminders with user's stated preferences (workout time, schedule type)
- Use warm, hamster-voiced messaging that matches the app's tone
- Avoid guilt, shame, or aggressive language

### Required Functionality (High-Level)
1. **Permission request flow** — Ask at an appropriate moment with pre-prompt explanation
2. **Notification preferences model** — Store user settings for scheduling
3. **Reminder scheduling logic** — Calculate and schedule local notifications based on user preferences
4. **NotificationSettingsView implementation** — Full settings UI for notification preferences
5. **SettingsView integration** — Connect toggle to real permission and scheduling state

### Out of Scope
- Server-side push notifications (will use local notifications only for MVP)
- Rich media notifications (images, video)
- Notification actions (reply, quick actions)
- Notification grouping/threading
- Scheduled notification for specific workout days (fixed schedule days selection)

### Assumptions
- Using iOS local notifications via UNUserNotificationCenter
- Notifications are hamster-voiced (first-person from the hamster)
- No more than 2 notifications per day
- Quiet hours respected (no notifications between 10pm-7am by default)

---

## UX & Screens (Mobile-First)

### Permission Request Approach

**When to Ask:**
The permission prompt appears after the user completes their FIRST workout (not immediately on launch). This ensures:
- User has invested in the app
- User has context for why reminders would help
- Higher likelihood of permission grant

**Pre-Prompt Screen:**
Before showing the iOS system permission dialog, show a custom "pre-prompt" screen that:
- Explains the benefit in warm, hamster-voiced language
- Shows what kind of reminders they'll receive
- Has clear "Enable Reminders" (primary) and "Not Now" (secondary) options
- Only if user taps "Enable Reminders", show the actual iOS permission dialog

**Copy Examples (Hamster-Voiced):**
- Headline: "Can I send you a little nudge?"
- Body: "I promise I'll be gentle! Just a friendly reminder when it's time for our workout together."
- Primary button: "Yes, Remind Me"
- Secondary button: "Maybe Later"

### Permission Denied State

If user denies permission or taps "Maybe Later":
- App functions fully without notifications
- Settings shows "Notifications Off" with explanation text
- A "Learn How to Enable" link explains how to enable in iOS Settings
- Never nag or repeatedly ask — user made their choice
- After 7 days, can gently surface the option again (once)

### Notification Settings Screen

The NotificationSettingsView should include:

**1. Master Enable/Disable**
- Toggle matching the Settings notifications toggle
- Shows current permission state (enabled/denied/not determined)
- If permission denied, shows guidance to enable in iOS Settings

**2. Reminder Time Section**
- "Preferred Reminder Time" selector
- Options: Morning (8am), Afternoon (1pm), Evening (6pm), or Custom time picker
- Pre-populated from onboarding `preferredWorkoutTime`
- Shows the actual time (e.g., "Morning — around 8:00 AM")

**3. Reminder Types Section**
- "Daily Workout Reminder" toggle — the main reminder
- "Streak at Risk Reminder" toggle — reminds if streak is at risk (enabled by default)
- Each toggle has subtitle explaining what it does

**4. Quiet Hours Section (Optional, can be Phase 08.3)**
- "Quiet Hours" toggle
- Start/end time pickers
- Default: 10:00 PM - 7:00 AM

### Notification Content (Hamster-Voiced)

**Daily Workout Reminder Examples:**
- "Hey! Ready for a little movement today? I'll be cheering you on!"
- "Just a friendly nudge — how about we do a workout together?"
- "Your hamster is getting excited! Time for some fun?"

**Streak at Risk Reminder:**
- "Hey, we haven't worked out together today! Don't worry — there's still time to keep our streak going!"
- "I'm getting a little antsy... want to do a quick workout before the day ends?"

**No Guilt/Shame Examples to AVOID:**
- "You haven't worked out today" (sounds like scolding)
- "Don't break your streak" (creates pressure)
- "You're falling behind" (negative framing)

### States per Screen

**NotificationSettingsView:**
- Loading: While checking permission state
- Enabled: Full settings visible, all controls active
- Denied: Settings visible but disabled, with guidance banner at top
- Not Determined: Pre-prompt CTA to request permission
- Error: If scheduling fails, show friendly error with retry

---

## Feature Sections

### Feature 1: Notification Preferences Model

**Purpose:** Store user notification preferences persistently

**Functionality:**
- Store notification enabled state (separate from iOS permission)
- Store preferred reminder time (hour + minute)
- Store which reminder types are enabled (daily workout, streak at risk)
- Store quiet hours preferences

**Data Requirements:**
- NotificationPreferences struct with all settings
- UserDefaults persistence (similar to AudioPreferences pattern)
- Default values that respect user's onboarding choices

### Feature 2: Permission Request Flow

**Purpose:** Request notification permission at the right moment

**User Flow:**
1. User completes first workout
2. Completion screen shows "Enable Reminders" prompt (subtle, not blocking)
3. User taps "Enable Reminders"
4. Pre-prompt screen appears (custom UI)
5. User taps "Yes, Remind Me"
6. iOS permission dialog appears
7. User grants/denies
8. If granted: schedule first notification, show confirmation
9. If denied: return to app gracefully, no shaming

**Mobile Considerations:**
- Permission state can change externally (iOS Settings)
- App should re-check permission state on foreground
- Handle case where permission was granted then later revoked

### Feature 3: Notification Scheduling Logic

**Purpose:** Calculate and schedule appropriate notification times

**Functionality:**
- Convert user's preferred time to actual notification time
- Consider timezone and daylight saving time
- Reschedule when user changes preferences
- Cancel scheduled notifications when disabled
- Handle streak-at-risk reminders differently (only when applicable)

**Scheduling Rules:**

*Daily Workout Reminder:*
- Scheduled for user's preferred time
- Only fires if user hasn't checked in today
- Checks UserStats.hasAnyCheckInToday before delivery (via notification service extension or app refresh)

*Streak at Risk Reminder:*
- Only scheduled if user has an active streak (currentStreak > 0)
- Fires in evening (6pm or quiet hours start - 2 hours) if no check-in today
- More urgent tone but still gentle

**Edge Cases:**
- Timezone changes: Notifications should fire at correct local time
- Daylight saving: Use calendar-based scheduling, not fixed intervals
- Notification scheduled but user opens app before it fires: Should still be fine (no-op)
- Multiple devices: Local notifications are device-specific (acceptable for MVP)

### Feature 4: NotificationSettingsView Implementation

**Purpose:** Replace placeholder with full notification settings UI

**Functionality:**
- Display current notification permission state
- Allow user to toggle notification preferences
- Show reminder time picker
- Show reminder type toggles
- Provide guidance if permission denied

**User Flow:**
1. User navigates to Settings → Notifications
2. If permission not determined: Show pre-prompt option
3. If permission granted: Show full settings
4. If permission denied: Show guidance banner + disabled settings
5. User changes preference → notification schedule updates immediately

### Feature 5: SettingsView Integration

**Purpose:** Connect main Settings toggle to real notification state

**Functionality:**
- Toggle reflects actual permission + user preference state
- Toggling on triggers permission request if needed
- Toggling off cancels all scheduled notifications
- Subtitle updates based on state

---

## Data, Sync, and Integrations

### Data Relationships
- NotificationPreferences links to UserProfile (uses preferredWorkoutTime as default)
- Notification scheduling reads from UserStats (streak status, check-in status)
- Permission state comes from iOS UNUserNotificationCenter

### Local Persistence
- NotificationPreferences stored in UserDefaults
- Permission state queried from system (not cached)
- Scheduled notification IDs stored for cancellation

### Notifications Integration
- Use UNUserNotificationCenter for all local notifications
- Request permission via requestAuthorization(options: [.alert, .sound, .badge])
- Schedule with UNCalendarNotificationTrigger for time-based delivery
- Use notification identifiers for management (cancel, update)

---

## Edge Cases & Scenarios

**User changes timezone:**
- Notification should fire at correct local time in new timezone
- Use UNCalendarNotificationTrigger which respects timezone

**User changes preferred time:**
- Cancel existing scheduled notification
- Schedule new notification with updated time
- Provide confirmation that change was saved

**App is killed/backgrounded:**
- Local notifications fire regardless of app state
- On app launch, check if notifications are still enabled

**User revokes permission in iOS Settings:**
- On next app foreground, detect revoked permission
- Update UI to show denied state
- Don't nag — just update state

**User completes check-in:**
- Cancel today's workout reminder (already done)
- Keep streak at risk reminder scheduling for tomorrow

**No internet connection:**
- Local notifications don't require internet
- All scheduling happens on-device

**User with "No Preference" workout time:**
- Default to morning (8am) for reminder time
- User can customize in notification settings

---

## Observability

### Analytics Events (High-Level)
- Permission requested (pre-prompt shown)
- Permission granted / denied
- Notification preferences changed
- Notification tapped (deep link to app)

### Error Reporting
- Scheduling failures should be logged
- Permission check failures should be logged

---

## Testing Requirements

### What Needs to Be Tested
- Permission request flow (pre-prompt → system dialog → result)
- Notification scheduling at correct times
- Settings UI reflects correct permission state
- Toggle on/off properly schedules/cancels notifications
- Time preference changes reschedule correctly

### Edge Cases to Verify
- Permission denied → later granted in iOS Settings → app detects correctly
- Timezone change handling
- App backgrounded/killed → notification fires
- No check-in today → reminder fires; check-in done → reminder should cancel

### Device/OS Matrix
- iOS 15, 16, 17
- Various timezones
- Daylight saving time transitions

---

## Implementation Considerations

### Security & Privacy
- Notification content doesn't include sensitive user data
- No user data sent to external servers for notifications (local only)

### Performance & Battery
- Use calendar-based triggers, not timer-based (battery efficient)
- Minimize notification schedule updates (batch when possible)

### User Experience
- All notification copy is warm, hamster-voiced, non-judgmental
- Permission denial is graceful — app works fully without notifications
- Settings are immediately responsive (no loading delays)

---

## Deliverables

1. **NotificationPreferences model** — data model with persistence
2. **NotificationManager service** — singleton managing permission, scheduling, cancellation
3. **Pre-prompt view** — custom UI for pre-permission ask
4. **NotificationSettingsView** — full implementation replacing placeholder
5. **SettingsView updates** — toggle connected to real state
6. **Workout completion integration** — trigger permission request after first workout

---

## Related Phases

- Phase 03 — User preferences (preferredWorkoutTime, schedulePreference)
- Phase 05 — Workout completion (trigger for permission ask)
- Phase 06 — Streak status (used for streak at risk notifications)
- Phase 08.3 — Notification tap routing and today context

---

## Notes

- Local notifications are sufficient for MVP — server push can be added post-MVP
- Notification copy should be reviewed for tone consistency
- Consider A/B testing different reminder times for engagement (post-MVP)
- Quiet hours can be deferred to Phase 08.3 if needed for scope management
