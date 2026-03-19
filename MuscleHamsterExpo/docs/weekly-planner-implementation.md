# Weekly Planner - Implementation Plan

**Feature:** Weekly workout scheduling with Home screen integration
**Target Version:** v1.2.0
**Estimated Effort:** Medium-Large

---

## Overview

Transform the Workouts tab from 3 tabs (At Home / At Gym / My Workouts) to 2 tabs (My Plan / Browse), add weekly scheduling, and integrate with Home screen + notifications.

---

## Phase 1: Data Model & Service Layer

**Goal:** Set up Firestore structure and service methods before building UI.

### 1.1 Firestore Collections

```javascript
// Collection: userPreferences (or add to existing users collection)
// Document ID: {userId}

{
  workoutPreferences: {
    daysPerWeek: 3,                    // 1-7
    preferredDays: ["monday", "wednesday", "friday"],
    reminderTime: "07:00",             // 24hr format
    weekStartsOn: "monday",            // always monday for now
    setupCompleted: true,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

// Collection: weeklySchedules
// Document ID: {userId}_{weekStartDate} e.g. "abc123_2026-03-17"

{
  userId: "abc123",
  weekStart: "2026-03-17",             // Monday of that week (ISO date string)
  days: {
    monday: {
      type: "workout",                 // "workout" | "rest" | "empty"
      workoutId: "w-7",                // null if type !== "workout"
      workoutType: "stock",            // "stock" | "custom"
      workoutName: "Upper Body Strength",
      completed: false,
      completedAt: null
    },
    tuesday: {
      type: "empty"
    },
    wednesday: {
      type: "workout",
      workoutId: "w-3",
      workoutType: "stock",
      workoutName: "Gentle Yoga Flow",
      completed: false,
      completedAt: null
    },
    thursday: {
      type: "empty"
    },
    friday: {
      type: "workout",
      workoutId: null,                 // Preference set but no workout chosen
      workoutType: null,
      workoutName: null,
      completed: false,
      completedAt: null
    },
    saturday: {
      type: "empty"
    },
    sunday: {
      type: "rest"
    }
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 1.2 New Service: ScheduleService.js

```javascript
// src/services/ScheduleService.js

// --- Preferences ---
getWorkoutPreferences(userId)
saveWorkoutPreferences(userId, preferences)
hasCompletedSetup(userId)

// --- Weekly Schedule ---
getWeekSchedule(userId, weekStartDate)
createWeekSchedule(userId, weekStartDate, initialDays)
updateDaySchedule(userId, weekStartDate, dayName, dayData)
markDayCompleted(userId, weekStartDate, dayName)

// --- Helpers ---
getCurrentWeekStart()                    // Returns Monday of current week
getWeekStartForDate(date)               // Returns Monday of given date's week
getTodaySchedule(userId)                // Quick access to today's data
hasAnyScheduleThisWeek(userId)          // For showing/hiding week strip

// --- Copy/Repeat ---
copyPreviousWeek(userId)                // Copy last week's schedule
applyPreferencesToWeek(userId, weekStart) // Pre-fill based on preferences
```

### 1.3 Tasks

- [ ] **1.1** Create `ScheduleService.js` with all methods
- [ ] **1.2** Add Firestore security rules for new collections
- [ ] **1.3** Create helper functions for week date calculations
- [ ] **1.4** Write unit tests for date helpers

---

## Phase 2: Schedule Context

**Goal:** Create React context for schedule state management.

### 2.1 New Context: ScheduleContext.js

```javascript
// src/context/ScheduleContext.js

const ScheduleContext = {
  // Preferences
  preferences: { daysPerWeek, preferredDays, reminderTime, setupCompleted },
  savePreferences: async (prefs) => {},

  // Current week schedule
  currentWeekSchedule: { monday: {...}, tuesday: {...}, ... },
  todaySchedule: { type, workoutId, workoutName, completed },

  // Actions
  loadCurrentWeek: async () => {},
  updateDay: async (dayName, dayData) => {},
  markTodayCompleted: async () => {},
  copyLastWeek: async () => {},

  // UI state
  isLoading: false,
  hasScheduleThisWeek: false,           // For showing week strip on Home

  // Setup
  hasCompletedSetup: false,
  completeSetup: async (prefs) => {},
}
```

### 2.2 Tasks

- [ ] **2.1** Create `ScheduleContext.js` with provider
- [ ] **2.2** Add `ScheduleProvider` to App.js
- [ ] **2.3** Create `useSchedule` hook for easy access

---

## Phase 3: Workouts Tab Restructure

**Goal:** Change from 3 tabs to 2 tabs (My Plan / Browse).

### 3.1 Modified Files

**WorkoutsScreen.js** - Major rewrite
- Change tab structure to `[My Plan] [Browse]`
- My Plan tab: Week calendar + today's workout + my workouts list
- Browse tab: Sub-tabs for At Home / At Gym

### 3.2 New Components

```
src/components/Schedule/
├── WeekCalendar.js          # Mon-Sun calendar grid
├── DayCell.js               # Individual day in calendar
├── TodayWorkoutCard.js      # "Today's workout" display
├── ScheduleSetupModal.js    # First-time setup flow
├── AddWorkoutModal.js       # Pick workout for a day
└── MiniWeekStrip.js         # Compact week view for Home
```

### 3.3 WeekCalendar Component

```
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ MON │ TUE │ WED │ THU │ FRI │ SAT │ SUN │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│ 🏋️  │     │ 🧘  │     │ 🏃  │     │ 😴  │
│Upper│     │Yoga │     │HIIT │     │Rest │
│ ✓   │     │     │     │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

- Tap empty day → AddWorkoutModal
- Tap scheduled day → Options (start, change, remove)
- Tap completed day → View summary
- Visual states: empty, scheduled, completed, today highlight

### 3.4 Tasks

- [ ] **3.1** Create `WeekCalendar.js` component
- [ ] **3.2** Create `DayCell.js` component
- [ ] **3.3** Create `TodayWorkoutCard.js` component
- [ ] **3.4** Create `ScheduleSetupModal.js` component
- [ ] **3.5** Create `AddWorkoutModal.js` component
- [ ] **3.6** Rewrite `WorkoutsScreen.js` with new 2-tab layout
- [ ] **3.7** Move At Home / At Gym to sub-tabs under Browse
- [ ] **3.8** Integrate My Workouts list into My Plan tab

---

## Phase 4: Home Screen Integration

**Goal:** Show scheduled workout on Home, add week strip.

### 4.1 Modified Files

**HomeScreen.js**
- Import `useSchedule` context
- Conditional rendering based on `todaySchedule`
- Add `MiniWeekStrip` component (only if `hasScheduleThisWeek`)

### 4.2 New Component: MiniWeekStrip.js

```javascript
// Compact week visualization for Home screen
// Shows: ● (scheduled) ○ (workout day, no pick) 😴 (rest) · (empty)
// Highlights today
// Tappable → navigates to Workouts > My Plan
```

### 4.3 Home Screen Logic

```javascript
// Pseudo-code for Today's Action card

if (todaySchedule?.type === 'workout' && todaySchedule?.workoutId) {
  // Specific workout scheduled
  <ScheduledWorkoutCard
    workout={todaySchedule}
    onStart={() => navigation.navigate('WorkoutPlayer', { id: workoutId })}
  />
} else if (todaySchedule?.type === 'workout' && !todaySchedule?.workoutId) {
  // Workout day but no specific workout
  <PickWorkoutCard
    onPick={() => navigation.navigate('Workouts', { openPicker: true })}
  />
} else if (todaySchedule?.type === 'rest') {
  // Scheduled rest day
  <ScheduledRestDayCard
    onLog={() => navigation.navigate('QuickRestDay')}
  />
} else {
  // No schedule - default experience
  <DailyExerciseCard exercise={todaysExercise} />
}
```

### 4.4 Tasks

- [x] **4.1** Create `MiniWeekStrip.js` component
- [x] **4.2** Create `ScheduledWorkoutCard.js` component (Home) - integrated into HomeScreen
- [x] **4.3** Create `PickWorkoutCard.js` component (Home) - integrated into HomeScreen
- [x] **4.4** Create `ScheduledRestDayCard.js` component (Home) - integrated into HomeScreen
- [x] **4.5** Update `HomeScreen.js` with schedule integration
- [x] **4.6** Add week strip below action card (conditional)

---

## Phase 5: Notifications Integration

**Goal:** Morning notifications based on schedule.

### 5.1 Modified Files

**NotificationService.js**
- New function: `scheduleWorkoutReminder(schedule, preferences)`
- Update reminders when schedule changes
- Cancel/reschedule when preferences change

**Cloud Functions (functions/index.js)**
- New function: `sendMorningReminders` (scheduled function)
- Runs daily at user's preferred time
- Sends context-aware notification based on today's schedule

### 5.2 Notification Logic

```javascript
// Determine notification content
function getMorningNotification(todaySchedule, hamsterName) {
  if (todaySchedule?.type === 'workout' && todaySchedule?.workoutId) {
    return {
      title: "Good morning! 💪",
      body: `Today's workout: ${todaySchedule.workoutName}`,
    };
  } else if (todaySchedule?.type === 'workout') {
    return {
      title: "Good morning! 🏋️",
      body: "Today's a workout day - pick something!",
    };
  } else if (todaySchedule?.type === 'rest') {
    return {
      title: "Good morning! 😴",
      body: "Today's a rest day. Recovery matters!",
    };
  } else {
    return {
      title: `${hamsterName} is hungry! 🐹`,
      body: "Complete today's exercise to keep your streak!",
    };
  }
}
```

### 5.3 Tasks

- [ ] **5.1** Add `scheduleWorkoutReminder()` to NotificationService
- [ ] **5.2** Create Cloud Function for scheduled morning notifications
- [ ] **5.3** Update notification scheduling when schedule changes
- [ ] **5.4** Add reminder time picker to Settings
- [ ] **5.5** Test notification delivery

---

## Phase 6: Settings Integration

**Goal:** Allow users to modify workout preferences.

### 6.1 Modified Files

**SettingsScreen.js** or new **WorkoutPreferencesScreen.js**

### 6.2 New Settings Section

```
WORKOUT SCHEDULE
├── Workout Days          [M W F]     → Opens day picker
├── Morning Reminder      [7:00 AM]   → Opens time picker
└── Reset Preferences     [→]         → Confirmation dialog
```

### 6.3 Tasks

- [ ] **6.1** Create `WorkoutPreferencesScreen.js`
- [ ] **6.2** Add navigation from Settings
- [ ] **6.3** Day picker component
- [ ] **6.4** Time picker integration
- [ ] **6.5** Reset preferences with confirmation

---

## Phase 7: Polish & Edge Cases

**Goal:** Handle edge cases, add finishing touches.

### 7.1 Edge Cases

- [ ] **7.1** Week rollover (Sunday → Monday creates new week doc)
- [ ] **7.2** First launch without schedule (graceful fallback)
- [ ] **7.3** Completing workout marks day as completed
- [ ] **7.4** Timezone handling for week boundaries
- [ ] **7.5** Offline support (schedule should work offline)

### 7.2 Polish

- [ ] **7.6** Animations for week calendar
- [ ] **7.7** Haptic feedback on day selection
- [ ] **7.8** Empty state for My Plan (encourage setup)
- [ ] **7.9** "Copy Last Week" feature
- [ ] **7.10** Week navigation (view past/future weeks)

### 7.3 Testing

- [ ] **7.11** Test on iPhone SE (small screen)
- [ ] **7.12** Test on iPad
- [ ] **7.13** Test week boundary transitions
- [ ] **7.14** Test notification delivery
- [ ] **7.15** Test offline → online sync

---

## Implementation Order

### MVP (v1.2.0) - Core Experience
1. **Phase 1** - Data model & service (foundation)
2. **Phase 2** - Context (state management)
3. **Phase 3** - Workouts tab restructure (main UI)
4. **Phase 4** - Home screen integration (key value)
5. **Phase 5** - Notifications (engagement)

### Fast Follow (v1.2.1)
6. **Phase 6** - Settings integration
7. **Phase 7** - Polish & edge cases

---

## Files Summary

### New Files
```
src/services/ScheduleService.js
src/context/ScheduleContext.js
src/components/Schedule/WeekCalendar.js
src/components/Schedule/DayCell.js
src/components/Schedule/TodayWorkoutCard.js
src/components/Schedule/ScheduleSetupModal.js
src/components/Schedule/AddWorkoutModal.js
src/components/Schedule/MiniWeekStrip.js
src/screens/Home/ScheduledWorkoutCard.js
src/screens/Home/PickWorkoutCard.js
src/screens/Home/ScheduledRestDayCard.js
src/screens/Settings/WorkoutPreferencesScreen.js
```

### Modified Files
```
src/screens/Workout/WorkoutsScreen.js      # Major rewrite
src/screens/Home/HomeScreen.js             # Add schedule integration
src/services/NotificationService.js        # Add schedule reminders
src/navigation/MainTabNavigator.js         # Update if needed
src/context/index.js                       # Export ScheduleContext
App.js                                     # Add ScheduleProvider
functions/index.js                         # Morning notification function
firestore.rules                            # New collection rules
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Timezone confusion | Store dates as ISO strings, calculate week start client-side |
| Notification timing | Use user's local time, test across timezones |
| Breaking existing Workouts tab | Keep existing category screens, just reorganize navigation |
| Offline sync conflicts | Firestore handles this, but test thoroughly |
| Feature creep | Strict MVP scope, defer "nice to haves" |

---

## Definition of Done

- [ ] User can set workout preferences (days/week, which days, reminder time)
- [ ] User can view and edit weekly schedule in My Plan tab
- [ ] User can add workout or rest day to any day
- [ ] Home screen shows scheduled workout/rest day
- [ ] Mini week strip appears on Home when schedule exists
- [ ] Morning notifications reflect schedule
- [ ] Completing a workout marks the day as done
- [ ] Works offline, syncs when online
- [ ] Tested on small phone and tablet
