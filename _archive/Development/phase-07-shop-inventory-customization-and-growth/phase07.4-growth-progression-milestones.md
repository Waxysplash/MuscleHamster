# Phase 07.4 — Growth Progression Milestones

## Header
- **Goal:** Implement hamster growth stages (baby → juvenile → adult → mature) triggered by positive milestones, surfaced as celebratory moments that reinforce progress.
- **Status:** Ready for Implementation
- **Priority:** MEDIUM
- **Dependencies:** Phase 05.2 (history/stats), Phase 06 (streak tracking), Phase 07.3 (hamster display)
- **Platforms:** iOS (15+)

---

## Required Functionality

### Growth Stages
The hamster progresses through 4 life stages. Growth is **permanent and never regresses** — this is a purely positive progression system that rewards consistency.

| Stage | Display Name | Visual Description | Hamster Personality |
|-------|-------------|-------------------|---------------------|
| `baby` | "Baby" | Small, wide-eyed, extra fluffy | Curious, learning, excited |
| `juvenile` | "Growing" | Slightly larger, more confident | Energetic, eager to please |
| `adult` | "Grown Up" | Full-sized, strong posture | Confident, supportive, proud |
| `mature` | "Wise" | Distinguished, calm appearance | Sage-like, deeply bonded, mentor |

### Growth Thresholds (DECISION)
Growth is triggered by reaching **either** a workout milestone **or** a streak milestone — whichever comes first. This ensures users with different workout frequencies can all see progression.

| Stage | From → To | Workout Milestone | OR | Streak Milestone |
|-------|-----------|-------------------|-----|------------------|
| Baby → Juvenile | `baby` → `juvenile` | 5 workouts completed | OR | 7-day streak achieved |
| Juvenile → Adult | `juvenile` → `adult` | 25 workouts completed | OR | 21-day streak achieved |
| Adult → Mature | `adult` → `mature` | 75 workouts completed | OR | 60-day streak achieved |

**Rationale:**
- **Baby → Juvenile (5 workouts / 7-day streak):** Quick early win to show the system works. Users see growth within their first 1-2 weeks.
- **Juvenile → Adult (25 workouts / 21-day streak):** Meaningful milestone around 1-2 months of regular use. Feels like a real accomplishment.
- **Adult → Mature (75 workouts / 60-day streak):** Aspirational goal for dedicated users. Represents significant commitment (3-6 months).

**Important:** The milestones use **lifetime totals** and **longest streak ever achieved** — not current streak. This means:
- A broken streak doesn't prevent growth
- Growth reflects cumulative effort, not perfect consistency
- Users who take breaks can still progress through workouts

---

## UX & Screens

### Home Screen Integration
The Home screen hamster section displays the current growth stage:

1. **Stage badge** — Small badge below or beside the hamster showing stage name (e.g., "Baby", "Growing")
2. **Visual differentiation** — Hamster icon/size varies by stage (implementation can use different SF Symbols or sizes)
3. **Progress indicator** — Optional: subtle progress toward next stage (e.g., "3/5 workouts to next stage")

### Growth Celebration Moment
When a user triggers a growth milestone, they receive a **warm, delightful celebration**:

#### Trigger Points
Growth is checked and potentially triggered:
- After a workout completion (on the completion screen)
- After streak validation on app launch (if streak milestone was reached)
- **Not** after rest-day check-ins (workouts are the primary growth driver)

#### Celebration Flow
1. **Detection:** System detects milestone reached
2. **Celebration Modal:** A sheet/modal appears with:
   - Celebratory animation/confetti effect
   - "Your hamster grew up!" headline
   - Before/after stage comparison (e.g., "Baby → Growing")
   - Hamster's reaction speech bubble (stage-specific)
   - Achievement badge (optional: track in profile)
   - "Hooray!" dismiss button
3. **Persistence:** Growth stage saved immediately; celebration shown only once per transition

#### Celebration Copy (Hamster-Voiced, Warm)

**Baby → Juvenile:**
- Headline: "[Hamster Name] is growing up!"
- Hamster says: "Look at me! I'm getting bigger and stronger — just like you! We make a great team!"
- Subtext: "5 workouts completed" or "7-day streak achieved"

**Juvenile → Adult:**
- Headline: "[Hamster Name] is all grown up!"
- Hamster says: "Wow, look how far we've come together! I'm so proud of us. Let's keep going!"
- Subtext: "25 workouts completed" or "21-day streak achieved"

**Adult → Mature:**
- Headline: "[Hamster Name] has reached wisdom!"
- Hamster says: "We've been through so much together. I'm honored to be your lifelong workout buddy. You inspire me every day!"
- Subtext: "75 workouts completed" or "60-day streak achieved"

---

## Data Model

### New Enum: `GrowthStage`
```
enum GrowthStage: String, Codable, CaseIterable, Comparable {
    case baby
    case juvenile
    case adult
    case mature

    var displayName: String
    var description: String
    var icon: String (SF Symbol)
    var hamsterSize: CGFloat (relative size multiplier)
    var celebrationMessage: String
    var nextStage: GrowthStage? (nil for mature)
}
```

### New Struct: `GrowthMilestone`
```
struct GrowthMilestone: Codable, Equatable {
    let stage: GrowthStage
    let achievedAt: Date
    let triggerType: GrowthTrigger  // .workouts or .streak
    let triggerValue: Int           // The count that triggered it
}

enum GrowthTrigger: String, Codable {
    case workouts
    case streak
}
```

### Updates to `UserStats`
Add to existing UserStats struct:
- `currentGrowthStage: GrowthStage` — Current hamster stage (default: `.baby`)
- `growthHistory: [GrowthMilestone]` — Record of all stage transitions
- `pendingGrowthCelebration: GrowthStage?` — Stage to celebrate (cleared after shown)

### Computed Properties on UserStats
- `nextGrowthStage: GrowthStage?` — The next stage (nil if mature)
- `workoutsToNextStage: Int?` — Workouts needed for next stage (nil if mature)
- `streakToNextStage: Int?` — Streak days needed for next stage (nil if mature)
- `progressToNextStage: (workouts: Double, streak: Double)?` — 0.0-1.0 progress for each path

### Growth Thresholds Configuration
```
enum GrowthConfig {
    static let juvenileWorkouts = 5
    static let juvenileStreak = 7

    static let adultWorkouts = 25
    static let adultStreak = 21

    static let matureWorkouts = 75
    static let matureStreak = 60

    static func requiredWorkouts(for stage: GrowthStage) -> Int?
    static func requiredStreak(for stage: GrowthStage) -> Int?
    static func checkGrowth(totalWorkouts: Int, longestStreak: Int, currentStage: GrowthStage) -> GrowthStage?
}
```

---

## Service Layer

### ActivityService Updates
Add to `ActivityServiceProtocol`:
- `checkGrowth(userId: String) async -> GrowthStage?` — Check if growth milestone reached, returns new stage or nil
- `recordGrowth(userId: String, stage: GrowthStage, trigger: GrowthTrigger, value: Int) async` — Record stage transition
- `clearPendingGrowthCelebration(userId: String) async` — Clear after celebration shown
- `getCurrentGrowthStage(userId: String) async -> GrowthStage` — Get current stage

### Growth Check Integration Points
Growth should be checked:
1. **After `recordCompletion()`** — Check if workout count triggered growth
2. **After `validateStreak()`** — Check if longest streak triggered growth (only if longestStreak increased)

---

## Edge Cases

### Multiple Milestones at Once
If a user somehow triggers multiple growth stages at once (e.g., imports data, long absence):
- **Behavior:** Progress one stage at a time
- **Celebration:** Show celebration for each stage sequentially (queue celebrations)
- **Rationale:** Each milestone deserves recognition; don't skip the celebration

### Reinstall / Account Restore
- Growth stage is stored with user stats (UserDefaults for MVP, backend later)
- On reinstall: growth stage restored from persisted data
- If data is lost: user starts at baby, but their totalWorkoutsCompleted and longestStreak should also be persisted, so growth will re-trigger on first activity

### Offline / Sync Conflicts (Post-MVP)
- Growth is calculated client-side based on local stats
- When backend sync is implemented, server should validate and be authoritative
- Conflict resolution: always use the higher stage (growth never regresses)

### Growth During Onboarding
- New users start at `baby` stage
- First workout can immediately trigger `juvenile` if they somehow already have stats (edge case)
- More commonly: first 5 workouts over first 1-2 weeks trigger first growth

### Celebration Not Shown (App Crash/Close)
- `pendingGrowthCelebration` persists until cleared
- On next Home load, if pending celebration exists, show it
- Prevents users from missing their celebration moment

---

## Views to Create/Update

### New Views
1. **`GrowthCelebrationView.swift`** — Modal celebration when growth occurs
   - Takes: `newStage: GrowthStage`, `hamsterName: String`, `triggerType: GrowthTrigger`, `triggerValue: Int`
   - Shows: animation, headline, hamster speech, achievement info, dismiss button
   - Accessibility: Announces growth achievement, dismiss button has proper label

### Updated Views
1. **`HomeView.swift`** —
   - Show growth stage badge in hamster section
   - Check for pending growth celebration on load
   - Show GrowthCelebrationView as sheet when pending

2. **`WorkoutPlayerView.swift`** (completion screen) —
   - After recording completion, check for growth
   - If growth triggered, set pending celebration (shown on Home)
   - Or: show celebration inline on completion screen

### Optional Enhancement: Growth Progress in Settings
Add to profile/settings:
- Current stage display
- Progress bars showing distance to next stage
- Growth history (when each stage was achieved)

---

## Accessibility Requirements

### GrowthCelebrationView
- Modal announced as celebration
- Headline uses `.isHeader` trait
- Hamster speech bubble readable
- Dismiss button clearly labeled
- Animation respects "Reduce Motion" setting

### Home Screen Stage Badge
- Stage name readable by VoiceOver
- Combined with hamster description: "[Name] is a [Stage] hamster, feeling [State]"

---

## Testing Requirements

### Unit Tests
- `GrowthConfig.checkGrowth()` returns correct stage for various workout/streak combinations
- Growth is triggered at exact thresholds (not before, not after)
- Multiple milestone skip handled (returns next stage only)
- Already at mature returns nil

### Integration Tests
- Record 5th workout → growth check returns `juvenile`
- Achieve 7-day streak → growth check returns `juvenile`
- Record 25th workout while at `juvenile` → returns `adult`
- Growth persists across app relaunch

### UI Tests
- Growth celebration appears after triggering workout
- Celebration can be dismissed
- Home screen shows new stage after celebration
- Celebration only shows once per stage transition

### Edge Case Tests
- User at `baby` completes 30 workouts at once (bulk import) → shows `juvenile` celebration, then `adult` on next check
- App crash during celebration → shows on next launch
- User already at `mature` completes workout → no growth check, no celebration

---

## Deliverables

1. **`GrowthStage` enum** with display properties and thresholds
2. **`GrowthMilestone` struct** for history tracking
3. **Updated `UserStats`** with growth fields
4. **Updated `ActivityService`** with growth checking and recording
5. **`GrowthCelebrationView`** — Celebration modal
6. **Updated `HomeView`** — Stage badge display and celebration trigger
7. **Growth progress display** (optional: Settings/Profile)

---

## Open Questions (Resolved)

- [x] **Hamster growth thresholds** — Defined above: 5/7 → 25/21 → 75/60 (workouts/streak)
- [x] **Single vs multiple milestone skip** — Progress one stage at a time with queued celebrations
- [x] **Trigger source** — Uses longest streak ever (not current), so broken streaks don't prevent growth

---

## Copy Guidelines

All growth-related copy must follow the Muscle Hamster tone:
- **Warm and celebratory** — This is a positive moment
- **Hamster-voiced** — The hamster talks to the user directly
- **No pressure** — Never imply they should have grown faster
- **Partnership language** — "We did this together", "Look how far we've come"

**Do say:**
- "Your hamster grew up!"
- "Look at us! We're getting stronger together!"
- "I'm so proud of what we've accomplished!"

**Don't say:**
- "Finally!"
- "It took you X days"
- "About time you grew up"
