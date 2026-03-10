# Phase 04.1 — Workout Catalog and Metadata Strategy

## Header
- **Goal:** Establish the minimum workout catalog structure needed for browse/filter and future personalization.
- **Status:** IMPLEMENTED
- **Priority:** HIGH
- **Dependencies:** Phase 03
- **Platforms:** iOS (15+)

---

## Required Functionality (high-level)
- Define the minimum metadata needed per workout:
  - Difficulty level
  - Duration range
  - Fitness goal tags
  - Body focus tags
- Seed an initial workout set sufficient for MVP testing across levels/goals and durations.

---

## Data Requirements (high-level)
- Workouts can be uniquely identified for activity history and recommendations
- Workouts are categorizable for filtering and “recommended” groupings

---

## Edge Cases
- Sparse catalog for some combinations (ensure UI handles gracefully)
- Conflicting tags or missing metadata (safe defaults and QA visibility)

---

## Testing Requirements
- Verify catalog coverage for each fitness goal and difficulty
- Verify duration buckets are meaningful and consistent

---

## Deliverables
- A usable workout catalog foundation for MVP browse and playback.

---

## Implementation Notes (Added Feb 6, 2026)

### Files Created
- `Models/Workout.swift` — Workout struct + DurationBucket, BodyFocus, WorkoutType, Equipment enums
- `Services/Workout/WorkoutServiceProtocol.swift` — Service protocol
- `Services/Workout/WorkoutError.swift` — Error types
- `Services/Workout/MockWorkoutService.swift` — Mock service with 24 seed workouts

### Files Modified
- `Views/Workouts/WorkoutsView.swift` — Integrated service, replaced placeholder enum
- `MuscleHamster.xcodeproj/project.pbxproj` — Added new files

### Metadata Schema Implemented

| Field | Type | Values |
|-------|------|--------|
| difficulty | FitnessLevel | beginner, intermediate, advanced |
| duration | DurationBucket | quick (5-10 min), short (10-20 min), medium (20-30 min), long (30-45 min), extended (45+ min) |
| fitnessGoals | Set<FitnessGoal> | cardio, muscleGain, fatLoss, flexibility, generalFitness |
| bodyFocus | Set<BodyFocus> | upperBody, lowerBody, core, fullBody, back, arms, chest, shoulders, legs, glutes |
| category | WorkoutType | strength, cardio, hiit, flexibility, yoga, pilates, circuit, mobility |
| equipmentRequired | Set<Equipment> | none, dumbbells, resistanceBands, kettlebell, pullUpBar, yogaMat, jumpRope, bench |

### Seed Catalog Coverage
- 24 total workouts: 8 beginner, 8 intermediate, 8 advanced
- All fitness goals represented
- All workout types represented
- Duration distribution: 3 quick, 7 short, 7 medium, 5 long, 4 extended

