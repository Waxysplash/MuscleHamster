# Phase 04.2 — Browse and Filter UX

## Header
- **Goal:** Users can browse workouts and filter them by duration, difficulty, and goals without feeling overwhelmed.
- **Status:** IMPLEMENTED
- **Priority:** HIGH
- **Dependencies:** Phase 04.1
- **Platforms:** iOS (15+)

---

## UX & Screens (Mobile-First)

### Key screens/views
- Workout selection/browse screen
- Filter UI (duration, difficulty, goals; optionally body focus)
- Workout detail preview (high-level summary and “start” entry)

### States
- Loading (initial catalog load)
- Empty (no results for selected filters, with guidance to broaden)
- Error (recoverable, retry)

### Accessibility
- Filters readable and operable with VoiceOver
- Clear indication of selected filters and “reset filters”

---

## Edge Cases
- User selects filters that yield zero results (guided recovery)
- User leaves screen and returns (filters persist predictably)

---

## Testing Requirements
- Filtering correctness across all tag combinations
- Reset behavior returns to a sensible default view

---

## Deliverables
- A clear, friendly workout browse experience that supports quick decision-making.

---

## Implementation Notes (Added Feb 6, 2026)

### Files Created
- `Views/Workouts/WorkoutBrowseViewModel.swift` — Filter state management
- `Views/Workouts/WorkoutCardView.swift` — Reusable workout card component
- `Views/Workouts/WorkoutFilterSheet.swift` — Filter modal with 4 sections
- `Views/Workouts/ActiveFiltersView.swift` — Horizontal scroll of removable chips
- `Views/Workouts/CategoryWorkoutsView.swift` — Category browse with filtering
- `Views/Workouts/WorkoutDetailView.swift` — Full workout preview with Start button

### Files Modified
- `Views/Workouts/WorkoutsView.swift` — Added NavigationLinks for browse/detail

### Navigation Flow
```
WorkoutsView
├── [Recommended Card] → WorkoutDetailView
└── [Category Card] → CategoryWorkoutsView
    ├── [Filter Button] → WorkoutFilterSheet (modal)
    └── [Workout Card] → WorkoutDetailView
        └── [Start Workout] → (Phase 05)
```

### Filter UI Design
| Section | Type | Behavior |
|---------|------|----------|
| Duration | Horizontal pills | Single-select |
| Difficulty | List rows | Single-select |
| Goals | List with icons | Multi-select |
| Body Focus | 2-col grid (collapsible) | Multi-select |

### Empty State Handling
- Zero results shows EmptyStateView with "No Matches Found"
- Offers "Clear Filters" action button
- Guides user to adjust filters

### Accessibility
- All filters have VoiceOver labels and hints
- Selection state announced (.isSelected trait)
- Filter button shows active count in badge

