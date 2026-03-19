# Weekly Planner Feature - Design Sketch

## Current Workouts Tab Structure
```
┌─────────────────────────────────────┐
│  [At Home]  [At Gym]  [My Workouts] │  <- 3 tabs
├─────────────────────────────────────┤
│                                     │
│   Category cards grid               │
│   (Quick Sweats, Lower Body, etc)   │
│                                     │
└─────────────────────────────────────┘
```

---

## Option A: Add "My Week" as 4th Tab

```
┌───────────────────────────────────────────────┐
│  [My Week]  [At Home]  [At Gym]  [My Workouts]│
└───────────────────────────────────────────────┘

MY WEEK TAB:
┌─────────────────────────────────────┐
│  ← Mar 17-23, 2026 →               │  <- Week selector
├─────────────────────────────────────┤
│                                     │
│  MON  TUE  WED  THU  FRI  SAT  SUN │
│  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐ │
│  │🏋│  │ │  │🧘│  │ │  │🏃│  │ │  │😴│ │
│  │ │  │+│  │ │  │+│  │ │  │+│  │ │ │
│  └─┘  └─┘  └─┘  └─┘  └─┘  └─┘  └─┘ │
│                                     │
├─────────────────────────────────────┤
│  TODAY - MONDAY                     │
│  ┌─────────────────────────────────┐│
│  │ 🏋️ Upper Body Strength         ││
│  │ 20-30 min • Intermediate       ││
│  │         [Start Workout]        ││
│  └─────────────────────────────────┘│
│                                     │
│  UPCOMING                           │
│  Wed: Gentle Yoga Flow              │
│  Fri: Cardio Blast                  │
│  Sun: Rest Day                      │
│                                     │
└─────────────────────────────────────┘
```

**Pros:**
- Clean separation of planning vs browsing
- Familiar tab pattern
- "My Week" as first tab emphasizes planning

**Cons:**
- 4 tabs might feel crowded on smaller phones
- One more tap to get to workout library

---

## Option B: Week Strip at Top (Always Visible)

```
┌─────────────────────────────────────┐
│  THIS WEEK                          │
│  M   T   W   T   F   S   S         │
│  ●   ○   ●   ○   ●   ○   😴        │  <- Dots show planned days
│  ↑today                             │
├─────────────────────────────────────┤
│  TODAY: Upper Body Strength    [▶]  │  <- Quick start today's workout
├─────────────────────────────────────┤
│  [At Home]  [At Gym]  [My Workouts] │
├─────────────────────────────────────┤
│                                     │
│   Category cards grid               │
│                                     │
└─────────────────────────────────────┘
```

**Pros:**
- Week always visible = constant reminder
- Today's workout one tap away
- Library still easily accessible

**Cons:**
- Less space for library content
- More complex screen

---

## Option C: Simplified 2-Tab Approach (RECOMMENDED)

Consolidate to two primary modes: **Plan** and **Browse**

```
┌─────────────────────────────────────┐
│      [My Plan]      [Browse]        │  <- 2 clear tabs
└─────────────────────────────────────┘

MY PLAN TAB:
┌─────────────────────────────────────┐
│  🗓️ This Week                       │
│                                     │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│  │ MON │ TUE │ WED │ THU │ FRI │ SAT │ SUN │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│  │ 🏋️  │  +  │ 🧘  │  +  │ 🏃  │  +  │ 😴  │
│  │Upper│     │Yoga │     │HIIT │     │Rest │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  📅 TODAY - Monday                  │
│  ┌─────────────────────────────────┐│
│  │ Upper Body Strength             ││
│  │ 20-30 min • Intermediate        ││
│  │                                 ││
│  │    [  Start Workout  ]          ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ⭐ My Workouts (3)                 │  <- Quick access to custom
│  └─ Morning Run, Spin Class...     │
│                                     │
└─────────────────────────────────────┘

BROWSE TAB:
┌─────────────────────────────────────┐
│  [At Home]  [At Gym]                │  <- Sub-tabs
├─────────────────────────────────────┤
│                                     │
│   Category cards grid               │
│   (existing UI)                     │
│                                     │
└─────────────────────────────────────┘
```

**Pros:**
- Cleaner mental model: "What am I doing?" vs "What can I do?"
- My Workouts merged into Plan (where it belongs)
- Reduces tab clutter
- Makes planning the primary action

**Cons:**
- Moves existing tabs around (change management)

---

## Interaction: Adding a Workout to a Day

When user taps "+" on an empty day:

```
┌─────────────────────────────────────┐
│  Add Workout for Tuesday            │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🔍 Search workouts...           ││
│  └─────────────────────────────────┘│
│                                     │
│  QUICK OPTIONS                      │
│  ┌─────────────────────────────────┐│
│  │ 😴 Rest Day                     ││  <- Most requested!
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🔁 Repeat Last Week             ││
│  └─────────────────────────────────┘│
│                                     │
│  SUGGESTED FOR YOU                  │
│  (based on what you haven't done)   │
│  ┌─────────────────────────────────┐│
│  │ 🦵 Lower Body Basics            ││
│  │ You did upper body Monday       ││
│  └─────────────────────────────────┘│
│                                     │
│  FROM MY WORKOUTS                   │
│  ┌─────────────────────────────────┐│
│  │ 🚴 Spin Class                   ││
│  └─────────────────────────────────┘│
│                                     │
│  BROWSE ALL →                       │
│                                     │
└─────────────────────────────────────┘
```

---

## Notifications Integration

When a workout is scheduled:
- Morning notification: "Today's workout: Upper Body Strength 💪"
- User can set preferred reminder time in Settings

---

## Data Model

```javascript
// New collection: userSchedule
// Document ID: {userId}_{weekStartDate} e.g. "abc123_2026-03-17"

{
  userId: "abc123",
  weekStart: "2026-03-17",  // Monday
  schedule: {
    monday: {
      type: "workout",        // "workout" | "rest" | "empty"
      workoutId: "w-7",       // reference to workout
      workoutName: "Upper Body Strength",  // denormalized for display
      completed: false,
      completedAt: null
    },
    tuesday: {
      type: "empty"
    },
    wednesday: {
      type: "workout",
      workoutId: "w-3",
      workoutName: "Gentle Yoga Flow",
      completed: false
    },
    // ... etc
    sunday: {
      type: "rest"
    }
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## MVP vs Future

### MVP (v1.1)
- Week view showing Mon-Sun
- Tap day to add workout or rest day
- Today's workout highlighted
- Notifications for scheduled days
- Simple "repeat last week" option

### Future (v1.2+)
- Multi-week view / month calendar
- Workout programs ("4-Week Beginner Plan")
- Streak visualization on calendar
- Drag-and-drop to reschedule
- Smart suggestions based on history

---

---

## Home Screen Integration

The key insight: **If someone planned their week, reward them by showing today's workout on the Home screen.**

### Current Home Screen Structure
```
┌─────────────────────────────────────┐
│     [Hamster Enclosure]             │
│     Name, State, Points             │
├─────────────────────────────────────┤
│                                     │
│  TODAY'S ACTION                     │
│  ┌─────────────────────────────────┐│
│  │ 🏋️ Feed [Hamster Name]!         ││
│  │ Complete your daily exercise    ││
│  └─────────────────────────────────┘│
│                                     │
│  [Streak] [Workouts] [Points]       │
│                                     │
│  [Shop] [Customize] [Rest Day]      │
│                                     │
└─────────────────────────────────────┘
```

### New Home Screen: With Scheduled Workout

When the user has a workout scheduled for today:

```
┌─────────────────────────────────────┐
│     [Hamster Enclosure]             │
│     Name, State, Points             │
├─────────────────────────────────────┤
│                                     │
│  TODAY'S PLAN                       │  <- Changed label
│  ┌─────────────────────────────────┐│
│  │ 🏋️ Upper Body Strength          ││  <- Scheduled workout
│  │ 20-30 min • Intermediate        ││
│  │                                 ││
│  │    [ Start Workout ]            ││
│  └─────────────────────────────────┘│
│                                     │
│  This Week: ● ○ ● ○ ● ○ 😴          │  <- Mini week view (optional)
│                                     │
│  [Streak] [Workouts] [Points]       │
│                                     │
│  [Shop] [Customize] [Rest Day]      │
│                                     │
└─────────────────────────────────────┘
```

### New Home Screen: Scheduled Rest Day

When today is marked as a rest day:

```
┌─────────────────────────────────────┐
│     [Hamster Enclosure]             │
│     (Rest day hamster pose)         │
├─────────────────────────────────────┤
│                                     │
│  REST DAY                           │
│  ┌─────────────────────────────────┐│
│  │ 😴 Scheduled Rest Day           ││
│  │ Recovery is part of the journey ││
│  │                                 ││
│  │    [ Log Rest Day ]             ││  <- Still need to tap to get points
│  └─────────────────────────────────┘│
│                                     │
│  This Week: ● ○ ● ○ ● ○ ●           │
│                       ↑ today       │
│                                     │
└─────────────────────────────────────┘
```

### Home Screen: No Schedule (Default Experience)

Users who don't use the planner see the current experience:

```
┌─────────────────────────────────────┐
│     [Hamster Enclosure]             │
├─────────────────────────────────────┤
│                                     │
│  TODAY'S ACTION                     │
│  ┌─────────────────────────────────┐│
│  │ 🏋️ Feed [Hamster Name]!         ││
│  │ Complete your daily exercise    ││
│  └─────────────────────────────────┘│
│                                     │
│  (no week strip shown)              │
│                                     │
│  [Streak] [Workouts] [Points]       │
│                                     │
│  [Shop] [Customize] [Rest Day]      │
│                                     │
└─────────────────────────────────────┘
```

### The Logic

```javascript
// Pseudo-code for Home screen
const todaysSchedule = getUserScheduleForToday();

if (todaysSchedule?.type === 'workout') {
  // Show scheduled workout card
  <ScheduledWorkoutCard workout={todaysSchedule.workout} />
} else if (todaysSchedule?.type === 'rest') {
  // Show rest day card
  <ScheduledRestDayCard />
} else {
  // No schedule - show default daily exercise
  <DailyExerciseCard />
}

// Only show week strip if user has ANY scheduled days this week
if (hasScheduledDaysThisWeek()) {
  <MiniWeekStrip />
}
```

### Mini Week Strip (Optional Enhancement)

A subtle reminder of the week's plan, shown only if they're using the planner:

```
This Week:  M   T   W   T   F   S   S
            ●   ○   ●   ○   ●   ○   😴
            ↑
          today
```

- `●` = workout scheduled
- `○` = nothing scheduled
- `😴` = rest day
- Tapping the strip goes to the Workouts > My Plan tab

---

## Decision: Option C Selected

Based on your feedback, we're going with:

### Workouts Tab: 2-Tab Layout
```
[My Plan]                    [Browse]
```

### Key Principles
1. **Clean and clear** - Two obvious choices
2. **Not stressful** - Empty days are fine, no pressure
3. **Rewards planning** - Scheduled workout shows on Home
4. **Gradual adoption** - Works great even if you never use the planner

---

## Decisions Made

| Question | Decision |
|----------|----------|
| Week starts | **Monday** to Sunday |
| Empty days in planner | **Blank** (calm, no pressure) |
| Mini week strip on Home | **Yes** - useful visual reminder |
| Morning notifications | **Yes** - always start the day with a notification |

---

## Workout Preferences Setup

When a user first uses the planner (or in Settings), ask their preferences:

### Setup Flow (First Time Opening "My Plan")

```
┌─────────────────────────────────────┐
│                                     │
│  🗓️ Let's Set Up Your Week         │
│                                     │
│  How many days do you want to       │
│  work out each week?                │
│                                     │
│  ┌───┬───┬───┬───┬───┬───┬───┐     │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │     │
│  └───┴───┴───┴───┴───┴───┴───┘     │
│           ↑                         │
│        (selected: 3)                │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Which days work best for you?      │
│                                     │
│  ┌───┬───┬───┬───┬───┬───┬───┐     │
│  │Mon│Tue│Wed│Thu│Fri│Sat│Sun│     │
│  │ ● │   │ ● │   │ ● │   │   │     │
│  └───┴───┴───┴───┴───┴───┴───┘     │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  What time should we remind you?    │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  🔔  7:00 AM                    ││
│  └─────────────────────────────────┘│
│                                     │
│         [ Set Up My Week ]          │
│                                     │
│  ────── or skip for now ──────     │
│                                     │
└─────────────────────────────────────┘
```

### After Setup: Pre-filled Week

Based on their preferences, pre-fill the week with suggested slots:

```
┌─────────────────────────────────────┐
│  🗓️ This Week                       │
│                                     │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│  │ MON │ TUE │ WED │ THU │ FRI │ SAT │ SUN │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│  │ ┌─┐ │     │ ┌─┐ │     │ ┌─┐ │     │     │
│  │ │?│ │     │ │?│ │     │ │?│ │     │     │
│  │ └─┘ │     │ └─┘ │     │ └─┘ │     │     │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘
│                                     │
│  ℹ️ Tap a day to pick a workout     │
│                                     │
└─────────────────────────────────────┘
```

The `?` indicates "workout day - pick something" vs completely blank days.

### Home Screen Reminder (Based on Preferences)

If they've set preferences but haven't filled in today's workout:

```
┌─────────────────────────────────────┐
│  TODAY'S PLAN                       │
│  ┌─────────────────────────────────┐│
│  │ 🏋️ Monday is a workout day!     ││
│  │ You planned to exercise today   ││
│  │                                 ││
│  │    [ Pick a Workout ]           ││
│  └─────────────────────────────────┘│
│                                     │
│  This Week: ○ · ○ · ○ · ·           │
│             ↑                       │
│           today                     │
└─────────────────────────────────────┘
```

Legend for week strip:
- `●` = workout scheduled (specific workout chosen)
- `○` = workout day (preference set, but no specific workout yet)
- `😴` = rest day
- `·` = blank/off day

---

## Morning Notifications

### Notification Content

**Scheduled workout:**
```
🏋️ Good morning! Today's workout: Upper Body Strength
Time to feed your hamster! 💪
```

**Workout day (no specific workout chosen):**
```
🏋️ Good morning! Today's a workout day
Pick something and feed your hamster! 🐹
```

**Rest day:**
```
😴 Good morning! Today's a rest day
Recovery is part of the journey. See you tomorrow! 🐹
```

**No schedule:**
```
🐹 Good morning! Your hamster is hungry
Complete today's exercise to keep your streak going! 🔥
```

### Notification Timing

- Default: 7:00 AM (user's local time)
- Configurable in Settings → Notifications → Reminder Time
- Only send on days they've indicated as workout days (or if no preferences set, send daily)

---

## Settings: Workout Preferences

Add to Settings screen:

```
┌─────────────────────────────────────┐
│  ⚙️ Settings                        │
│                                     │
│  WORKOUT PREFERENCES                │
│  ┌─────────────────────────────────┐│
│  │ Workout Days          M W F    ││  <- Tap to change
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Morning Reminder      7:00 AM  ││  <- Time picker
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Reset Week Preferences    →    ││
│  └─────────────────────────────────┘│
│                                     │
│  NOTIFICATIONS                      │
│  ...                                │
│                                     │
└─────────────────────────────────────┘
```
