# Phase 04.1 — Workout Catalog and Metadata Strategy

## Header
- **Goal:** Establish the minimum workout catalog structure needed for browse/filter and future personalization.
- **Status:** Planning
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

