# Phase 08.3 — Notification Tap Routing and "Today" Context

## Header
- **Goal:** When users tap a notification, route them to the correct "today" action (workout vs rest-day check-in) safely and contextually.
- **Status:** Implementation Ready
- **Priority:** MEDIUM
- **Dependencies:** Phase 05–06 (Activity system), Phase 08.2 (Notification scheduling)
- **Platforms:** iOS (15+)

---

## Context

Users receive two types of notifications:
1. **Daily Workout Reminder** — Nudges user to work out at their preferred time
2. **Streak At Risk Reminder** — Evening reminder when streak may break

When a user taps either notification, the app should open to the most helpful screen based on their current "today" status. The routing must feel context-aware and helpful, never confusing.

---

## Required Functionality

### 1. Notification Tap Handling

The app must handle notification taps via `UNUserNotificationCenterDelegate`. When a notification is tapped:

1. Parse the notification identifier to determine the notification type (`dailyReminder` or `streakAtRisk`)
2. Determine the user's current "today context" (see below)
3. Route to the appropriate destination
4. Clear the notification badge

### 2. Today Context Determination

The app must determine the user's current status:

| Context | Description |
|---------|-------------|
| **Workout completed today** | User has finished at least one workout today |
| **Rest-day checked in today** | User completed a rest-day micro-task today |
| **No check-in today** | User hasn't done anything today |

**Key helper properties (already exist in `UserStats`):**
- `hasCompletedWorkoutToday` — true if user finished a workout today
- `hasRestDayCheckInToday` — true if user did a rest-day check-in today
- `hasAnyCheckInToday` — true if either of the above is true

### 3. Routing Destinations

Based on notification type and today context:

| Notification Type | Today Context | Destination | Rationale |
|-------------------|---------------|-------------|-----------|
| Daily Reminder | No check-in | Home → highlight workout CTA | User hasn't done anything, nudge toward workout |
| Daily Reminder | Workout done | Home → show celebration | User already worked out, acknowledge it |
| Daily Reminder | Rest-day done | Home → show acknowledgment | User took a rest day, that's okay |
| Streak At Risk | No check-in | Home → highlight "Quick options" | Evening nudge, offer both workout and rest-day |
| Streak At Risk | Any check-in | Home → show streak safe message | Reassure user their streak is protected |

**Important:** All routes should land on Home because:
- Home is the natural "hub" showing hamster state and actions
- It already handles all the relevant display states
- It's safe even if user is partially through other flows

### 4. Pre-Routing Checks (Safe Routing)

Before routing to the action destination, the app must check prerequisites:

| Prerequisite Check | If Not Met | Action |
|--------------------|------------|--------|
| User is authenticated | Not signed in | Route to Welcome screen |
| Onboarding complete | Profile incomplete | Route to Onboarding |
| App can load user data | Network/data error | Route to Home (error state handled there) |

### 5. Notification Context Passing

When the app opens from a notification, it should pass context to the Home screen so it can:
- Show a contextual message if user already checked in ("Your streak is safe!")
- Auto-highlight the appropriate action if user hasn't checked in
- Potentially auto-present the rest-day check-in sheet for streak-at-risk notifications

**Contextual messaging examples:**
- **Already checked in:** "Great work today! Your streak is safe at [X] days."
- **Streak at risk, not checked in:** "There's still time! A quick workout or rest-day check-in will keep your streak going."

---

## Data Model Updates

### AppRoutingState

Create a new observable object for managing app-wide routing state:

```
class AppRoutingState: ObservableObject {
    enum DeepLinkDestination {
        case home
        case homeWithNotificationContext(NotificationContext)
        case workouts
        case restDayCheckIn
    }

    struct NotificationContext {
        let notificationType: NotificationType
        let tappedAt: Date
        var shouldHighlightAction: Bool
        var contextualMessage: String?
    }

    @Published var pendingDestination: DeepLinkDestination?
    @Published var notificationContext: NotificationContext?
}
```

This allows the app to:
1. Set a pending destination when a notification is tapped
2. Pass context to the destination screen
3. Clear the context after it's been displayed

---

## Implementation Architecture

### NotificationManager Updates

Add `UNUserNotificationCenterDelegate` conformance to `NotificationManager`:

1. Set the delegate in `init()` or when the app launches
2. Implement `userNotificationCenter(_:didReceive:withCompletionHandler:)` for tap handling
3. Parse the notification identifier to determine type
4. Call a routing handler to determine and set destination

### App Entry Point Updates

Update `MuscleHamsterApp`:

1. Create and inject `AppRoutingState` as an environment object
2. Configure `NotificationManager` delegate on launch
3. React to `pendingDestination` changes to navigate appropriately

### HomeView Updates

Update `HomeView` to respond to notification context:

1. Check for `notificationContext` from environment
2. If present and user already checked in, show contextual "streak safe" message
3. If present and user hasn't checked in, highlight the relevant action
4. Clear the context after displaying (one-time display)

---

## Edge Cases

### Stale Notification (Tapped After Midnight)

If a notification was scheduled for yesterday but tapped today (e.g., notification sat in notification center overnight):

- The notification is still valid — it was a reminder for "that day"
- Routing should use TODAY's context (current hasAnyCheckInToday status)
- Don't show confusing "yesterday" messaging

**Behavior:** Treat all notification taps as "user wants to engage now" and route based on current context.

### Notification Tapped While App Is Open

If the user taps a notification while the app is in the foreground:

- The notification should still be handled (`willPresent` can show it, `didReceive` handles tap)
- Routing should still occur (may already be on Home, so just update context)
- Clear badge and delivered notifications

### Schedule Changed Since Notification Was Sent

Example: User set reminder for 8 AM, received notification, changed reminder to 6 PM, then tapped the 8 AM notification.

- This is fine — the notification is still valid
- Route based on current context
- Don't try to reconcile old vs new schedule

### User Taps Multiple Notifications

If user has multiple delivered notifications and taps them in sequence:

- Each tap triggers a routing event
- The last tap wins (destination updates)
- Context messages don't stack

### App State at Launch

When the app launches from a notification tap (cold start):

1. `AppDelegate` or `SceneDelegate` receives the launch notification
2. App must wait for auth check to complete before routing
3. Route after auth state is determined

When the app is brought to foreground from a notification tap (warm start):

1. `UNUserNotificationCenterDelegate` receives the response
2. Route immediately (auth state already known)

### Offline Handling

If the app can't load user stats (network error):

- Route to Home anyway (Home handles its own error state)
- Don't block on loading — the notification tap should always feel responsive
- Context message may be unavailable, that's okay

---

## Accessibility Requirements

### VoiceOver Announcements

When routing from a notification:
- VoiceOver should announce the contextual message if one is displayed
- Use `UIAccessibility.post(notification: .announcement, argument:)` for transient messages

### Contextual Message Display

Any "streak safe" or "take action" banners should:
- Have clear accessibility labels
- Use `.accessibilityAddTraits(.isStaticText)` for informational banners
- Auto-dismiss after a reasonable time (8-10 seconds) or on user action

---

## UX Patterns

### Contextual Banner (New Component)

When user taps a notification and lands on Home, show a contextual banner:

**Banner States:**

1. **Streak Safe (already checked in)**
   - Background: Soft green
   - Icon: Checkmark in circle
   - Text: "You're all set! Your streak is safe at [X] days."
   - Auto-dismiss: 8 seconds

2. **Action Needed (streak at risk notification, no check-in)**
   - Background: Soft orange
   - Icon: Flame
   - Text: "There's still time! Check in to keep your streak going."
   - Action button: "Quick Check-in" (opens rest-day sheet)
   - Dismiss: Tap X or complete action

3. **Gentle Nudge (daily reminder, no check-in)**
   - Background: Soft purple
   - Icon: Hamster face
   - Text: "Ready when you are! Your hamster is excited to work out."
   - Auto-dismiss: 8 seconds

### Banner Placement

- Appears at top of Home content (below navigation bar)
- Slides in from top with animation
- Doesn't block other content (pushes content down)
- Single banner at a time (newest wins)

---

## Testing Requirements

### Unit Tests

- Parse notification identifier → correct `NotificationType`
- Today context determination with various `UserStats` configurations
- Routing decision matrix (all combinations of notification type × context)
- Pre-routing checks (unauthenticated, incomplete onboarding)

### Integration Tests

- Notification tap → correct destination reached
- Context passed correctly to destination screen
- Badge cleared after tap
- Multiple notification handling

### Manual Testing Scenarios

1. **Cold start from daily reminder (no check-in)**
   - Tap notification when app is killed
   - Verify app launches to Home
   - Verify contextual banner appears

2. **Warm start from streak-at-risk (already checked in)**
   - Complete a workout
   - Send test notification
   - Tap notification
   - Verify "streak safe" message appears

3. **Logged-out user taps notification**
   - Sign out
   - Send test notification
   - Tap notification
   - Verify Welcome screen appears

4. **Stale notification (next day)**
   - Receive notification
   - Let it sit overnight
   - Tap next morning
   - Verify routing uses today's context

---

## Deliverables

1. **AppRoutingState.swift** — Observable routing state manager
2. **NotificationContextBanner.swift** — Contextual banner component
3. **NotificationManager updates** — UNUserNotificationCenterDelegate implementation
4. **MuscleHamsterApp updates** — Delegate configuration and routing integration
5. **HomeView updates** — Context banner display and action highlighting

---

## Success Criteria

- [ ] Tapping any notification opens the app to a helpful, context-aware state
- [ ] Users who already checked in see reassurance ("streak safe")
- [ ] Users who haven't checked in see gentle encouragement with clear actions
- [ ] Logged-out or incomplete-onboarding users are safely routed to prerequisites
- [ ] Badge is cleared on notification tap
- [ ] Routing is fast and doesn't block on network calls
- [ ] VoiceOver users get appropriate announcements
- [ ] All notification types × context combinations work correctly

---

## Tone Reminders

All messaging must follow the Muscle Hamster tone:
- **Warm, not pushy:** "Ready when you are!" not "You haven't worked out!"
- **Celebratory for success:** "You're all set!" not just "Done"
- **Gentle for nudges:** "There's still time!" not "Hurry!"
- **No guilt language ever**
