//
//  WorkoutBrowseViewModel.swift
//  MuscleHamster
//
//  ViewModel managing workout browsing, filtering, and state
//

import Foundation

@MainActor
class WorkoutBrowseViewModel: ObservableObject {
    // MARK: - Filter State

    @Published var selectedDuration: DurationBucket?
    @Published var selectedDifficulty: FitnessLevel?
    @Published var selectedGoals: Set<FitnessGoal> = []
    @Published var selectedBodyFocus: Set<BodyFocus> = []
    @Published var selectedCategory: WorkoutType?

    // MARK: - Results State

    @Published var allWorkouts: [Workout] = []
    @Published var filteredWorkouts: [Workout] = []
    @Published var viewState: ViewState = .loading

    // MARK: - Service

    private let workoutService: WorkoutServiceProtocol

    // MARK: - Computed Properties

    var hasActiveFilters: Bool {
        selectedDuration != nil ||
        selectedDifficulty != nil ||
        !selectedGoals.isEmpty ||
        !selectedBodyFocus.isEmpty
    }

    var activeFilterCount: Int {
        var count = 0
        if selectedDuration != nil { count += 1 }
        if selectedDifficulty != nil { count += 1 }
        count += selectedGoals.count
        count += selectedBodyFocus.count
        return count
    }

    /// Returns a list of active filter descriptions for display
    var activeFilterDescriptions: [FilterChip] {
        var chips: [FilterChip] = []

        if let duration = selectedDuration {
            chips.append(FilterChip(id: "duration", label: duration.displayName, type: .duration))
        }

        if let difficulty = selectedDifficulty {
            chips.append(FilterChip(id: "difficulty", label: difficulty.displayName, type: .difficulty))
        }

        for goal in selectedGoals.sorted(by: { $0.displayName < $1.displayName }) {
            chips.append(FilterChip(id: "goal-\(goal.rawValue)", label: goal.displayName, type: .goal(goal)))
        }

        for focus in selectedBodyFocus.sorted(by: { $0.displayName < $1.displayName }) {
            chips.append(FilterChip(id: "focus-\(focus.rawValue)", label: focus.displayName, type: .bodyFocus(focus)))
        }

        return chips
    }

    // MARK: - Init

    init(workoutService: WorkoutServiceProtocol = MockWorkoutService()) {
        self.workoutService = workoutService
    }

    // MARK: - Data Loading

    func loadWorkouts() async {
        viewState = .loading
        do {
            allWorkouts = try await workoutService.getAllWorkouts()
            await applyFilters()
        } catch {
            viewState = .error("I couldn't load the workouts. Let's try again!")
        }
    }

    func loadWorkouts(for category: WorkoutType) async {
        selectedCategory = category
        viewState = .loading
        do {
            allWorkouts = try await workoutService.getWorkouts(by: category)
            await applyFilters()
        } catch {
            viewState = .error("I couldn't find those workouts. Let's try again!")
        }
    }

    // MARK: - Filter Actions

    func applyFilters() async {
        // If no additional filters beyond category, use all workouts
        if !hasActiveFilters {
            filteredWorkouts = allWorkouts
            viewState = allWorkouts.isEmpty ? .empty : .content
            return
        }

        do {
            filteredWorkouts = try await workoutService.getWorkouts(
                difficulty: selectedDifficulty,
                duration: selectedDuration,
                fitnessGoals: selectedGoals.isEmpty ? nil : selectedGoals,
                bodyFocus: selectedBodyFocus.isEmpty ? nil : selectedBodyFocus,
                category: selectedCategory
            )
            viewState = filteredWorkouts.isEmpty ? .empty : .content
        } catch {
            viewState = .error("Something went wrong with the filters. Let's try again!")
        }
    }

    func clearAllFilters() {
        selectedDuration = nil
        selectedDifficulty = nil
        selectedGoals = []
        selectedBodyFocus = []
        // Don't clear category - that's the browse context

        Task {
            await applyFilters()
        }
    }

    func removeFilter(_ chip: FilterChip) {
        switch chip.type {
        case .duration:
            selectedDuration = nil
        case .difficulty:
            selectedDifficulty = nil
        case .goal(let goal):
            selectedGoals.remove(goal)
        case .bodyFocus(let focus):
            selectedBodyFocus.remove(focus)
        }

        Task {
            await applyFilters()
        }
    }

    // MARK: - Filter Toggles

    func toggleDuration(_ duration: DurationBucket) {
        if selectedDuration == duration {
            selectedDuration = nil
        } else {
            selectedDuration = duration
        }
    }

    func toggleDifficulty(_ difficulty: FitnessLevel) {
        if selectedDifficulty == difficulty {
            selectedDifficulty = nil
        } else {
            selectedDifficulty = difficulty
        }
    }

    func toggleGoal(_ goal: FitnessGoal) {
        if selectedGoals.contains(goal) {
            selectedGoals.remove(goal)
        } else {
            selectedGoals.insert(goal)
        }
    }

    func toggleBodyFocus(_ focus: BodyFocus) {
        if selectedBodyFocus.contains(focus) {
            selectedBodyFocus.remove(focus)
        } else {
            selectedBodyFocus.insert(focus)
        }
    }
}

// MARK: - Filter Chip Model

struct FilterChip: Identifiable {
    let id: String
    let label: String
    let type: FilterType
}

enum FilterType {
    case duration
    case difficulty
    case goal(FitnessGoal)
    case bodyFocus(BodyFocus)
}
