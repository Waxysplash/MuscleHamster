//
//  WorkoutsView.swift
//  MuscleHamster
//
//  Workouts tab - Browse and select workouts
//

import SwiftUI

struct WorkoutsView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel

    @State private var viewState: ViewState = .loading
    @State private var workouts: [Workout] = []

    private let workoutService: MockWorkoutService = MockWorkoutService()

    var body: some View {
        NavigationStack {
            Group {
                switch viewState {
                case .loading:
                    LoadingView(message: "Loading workouts...")

                case .empty:
                    EmptyStateView(
                        icon: "figure.run",
                        title: "No Workouts Yet",
                        message: "Workouts will appear here once they're ready."
                    )

                case .error(let message):
                    ErrorView(
                        message: message,
                        retryAction: { Task { await loadContent() } }
                    )

                case .content:
                    workoutsContent
                }
            }
            .navigationTitle("Workouts")
        }
        .task {
            await loadContent()
        }
    }

    private var workoutsContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                getMovingSection
                browseAllSection
            }
            .padding()
        }
    }

    // MARK: - Get Moving Section

    /// Beginner-friendly, equipment-free workouts shown as approachable vertical cards
    private var suggestedWorkouts: [Workout] {
        let filtered = workouts.filter { $0.difficulty == .beginner && $0.isEquipmentFree }
        return Array(filtered.prefix(4))
    }

    private var getMovingSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Get Moving")
                    .font(.title2)
                    .fontWeight(.semibold)
                    .accessibilityAddTraits(.isHeader)

                Text("Quick workouts to feel great today")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            if suggestedWorkouts.isEmpty {
                // Fallback if no beginner/equipment-free workouts exist
                noSuggestionsPlaceholder
            } else {
                VStack(spacing: 12) {
                    ForEach(suggestedWorkouts) { workout in
                        NavigationLink {
                            WorkoutDetailView(workout: workout)
                        } label: {
                            suggestedWorkoutCard(workout)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var noSuggestionsPlaceholder: some View {
        RoundedRectangle(cornerRadius: 16)
            .fill(Color.accentColor.opacity(0.1))
            .frame(height: 100)
            .overlay {
                VStack(spacing: 8) {
                    Image(systemName: "figure.run")
                        .font(.title2)
                        .foregroundStyle(.accentColor)
                        .accessibilityHidden(true)
                    Text("More workouts coming soon!")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            .accessibilityLabel("More workouts coming soon")
    }

    private func suggestedWorkoutCard(_ workout: Workout) -> some View {
        HStack(spacing: 16) {
            // Category icon
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.15))
                    .frame(width: 48, height: 48)

                Image(systemName: workout.category.icon)
                    .font(.title3)
                    .foregroundStyle(.accentColor)
            }
            .accessibilityHidden(true)

            // Workout info
            VStack(alignment: .leading, spacing: 4) {
                Text(workout.name)
                    .font(.body)
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)
                    .lineLimit(1)

                Text(workout.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }

            Spacer()

            // Duration badge
            Text("~\(workout.duration.approximateMinutes) min")
                .font(.caption)
                .fontWeight(.medium)
                .foregroundStyle(.accentColor)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color.accentColor.opacity(0.1))
                .clipShape(Capsule())

            Image(systemName: "chevron.right")
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(16)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(workout.name), about \(workout.duration.approximateMinutes) minutes. \(workout.description)")
        .accessibilityHint("Double tap to view workout details")
    }

    // MARK: - Browse All Section

    private var browseAllSection: some View {
        NavigationLink {
            allWorkoutsListView
        } label: {
            HStack {
                Image(systemName: "list.bullet")
                    .foregroundStyle(.accentColor)
                Text("Browse All Workouts")
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)
                Spacer()
                Text("\(workouts.count) workouts")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Browse all \(workouts.count) workouts")
    }

    /// Full catalog list view
    private var allWorkoutsListView: some View {
        List {
            ForEach(WorkoutType.allCases) { category in
                let categoryWorkouts = workouts.filter { $0.category == category }
                if !categoryWorkouts.isEmpty {
                    Section(category.displayName) {
                        ForEach(categoryWorkouts) { workout in
                            NavigationLink {
                                WorkoutDetailView(workout: workout)
                            } label: {
                                HStack(spacing: 12) {
                                    Image(systemName: workout.category.icon)
                                        .foregroundStyle(.accentColor)
                                        .frame(width: 28)

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(workout.name)
                                            .font(.body)
                                            .fontWeight(.medium)
                                        Text("\(workout.displayDifficulty) \u{00B7} \(workout.displayDuration)")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("All Workouts")
    }

    // MARK: - Data Loading

    private func loadContent() async {
        viewState = .loading
        do {
            // Load all workouts
            workouts = try await workoutService.getAllWorkouts()
            viewState = workouts.isEmpty ? .empty : .content
        } catch {
            viewState = .error("I couldn't find the workouts right now. Let's try again!")
        }
    }
}

#Preview {
    WorkoutsView()
        .environmentObject(AuthViewModel())
}
