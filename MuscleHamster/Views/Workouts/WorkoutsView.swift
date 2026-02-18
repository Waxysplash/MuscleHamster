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
    @State private var recommendedWorkouts: [RecommendedWorkout] = []

    private let workoutService: MockWorkoutService = MockWorkoutService()
    private let activityService: MockActivityService = .shared

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
                recommendedSection
                browseSection
            }
            .padding()
        }
    }

    // MARK: - Recommended Section

    private var recommendedSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Recommended for You")
                    .font(.title2)
                    .fontWeight(.semibold)
                    .accessibilityAddTraits(.isHeader)

                Spacer()

                if hasProfile {
                    Image(systemName: "sparkles")
                        .foregroundStyle(.accentColor)
                        .accessibilityLabel("Personalized for your profile")
                }
            }

            if recommendedWorkouts.isEmpty {
                noRecommendationsPlaceholder
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(recommendedWorkouts) { recommendation in
                            NavigationLink {
                                WorkoutDetailView(workout: recommendation.workout)
                            } label: {
                                recommendedWorkoutCard(recommendation)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
    }

    private var noRecommendationsPlaceholder: some View {
        RoundedRectangle(cornerRadius: 16)
            .fill(Color.accentColor.opacity(0.1))
            .frame(height: 120)
            .overlay {
                VStack {
                    Image(systemName: "sparkles")
                        .font(.title)
                        .foregroundStyle(.accentColor)
                        .accessibilityHidden(true)
                    Text("Complete your profile for personalized recommendations")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
            }
            .accessibilityLabel("Complete your profile to see personalized workout recommendations")
    }

    private func recommendedWorkoutCard(_ recommendation: RecommendedWorkout) -> some View {
        let workout = recommendation.workout

        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: workout.category.icon)
                    .foregroundStyle(.accentColor)
                    .accessibilityHidden(true)
                Spacer()
                Text(workout.displayDuration)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Text(workout.name)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundStyle(.primary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            Text(workout.displayDifficulty)
                .font(.caption2)
                .foregroundStyle(.secondary)

            // "Why this was suggested" explanation
            if !recommendation.explanation.isEmpty {
                Text(recommendation.explanation)
                    .font(.caption2)
                    .foregroundStyle(.accentColor)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
            }
        }
        .frame(width: 160)
        .padding()
        .background(Color.accentColor.opacity(0.1))
        .cornerRadius(12)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(workout.name), \(workout.displayDifficulty), \(workout.displayDuration). \(recommendation.explanation)")
        .accessibilityHint("Double tap to view workout details")
    }

    /// Whether the user has a profile with preferences for personalization
    private var hasProfile: Bool {
        guard let profile = authViewModel.userProfile else { return false }
        return profile.isComplete
    }

    // MARK: - Browse Section

    private var browseSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Browse by Category")
                .font(.title2)
                .fontWeight(.semibold)
                .accessibilityAddTraits(.isHeader)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                ForEach(WorkoutType.allCases) { category in
                    NavigationLink {
                        CategoryWorkoutsView(category: category)
                    } label: {
                        categoryCard(category)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func categoryCard(_ category: WorkoutType) -> some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.15))
                    .frame(width: 48, height: 48)

                Image(systemName: category.icon)
                    .font(.title2)
                    .foregroundStyle(.accentColor)
            }
            .accessibilityHidden(true)

            Text(category.displayName)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundStyle(.primary)

            Text(category.description)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(2)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(16)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(category.displayName) workouts")
        .accessibilityHint(category.description)
    }

    // MARK: - Data Loading

    private func loadContent() async {
        viewState = .loading
        do {
            // Load all workouts
            workouts = try await workoutService.getAllWorkouts()

            // Load personalized recommendations based on user profile
            await loadRecommendations()

            viewState = workouts.isEmpty ? .empty : .content
        } catch {
            viewState = .error("I couldn't find the workouts right now. Let's try again!")
        }
    }

    private func loadRecommendations() async {
        // If user has a profile, get personalized recommendations
        if let profile = authViewModel.userProfile,
           let userId = authViewModel.currentUser?.id,
           profile.isComplete {
            do {
                // Get user's workout feedback for recommendation filtering
                let userStats = await activityService.getUserStats(userId: userId)
                let dislikedIds = userStats.dislikedWorkoutIds
                let lovedIds = userStats.lovedWorkoutIds

                // Get recent workout IDs from history
                let recentWorkoutIds = Set(userStats.recentCompletions.map { $0.workoutId })

                // Get recent body focus areas
                let recentBodyFocus = Set(userStats.recentCompletions.flatMap { completion -> [BodyFocus] in
                    // Look up the workout to get its body focus areas
                    if let workout = workouts.first(where: { $0.id == completion.workoutId }) {
                        return Array(workout.bodyFocus)
                    }
                    return []
                })

                recommendedWorkouts = try await workoutService.getRecommendedWorkoutsWithExplanations(
                    for: profile,
                    recentWorkoutIds: recentWorkoutIds,
                    recentBodyFocus: recentBodyFocus,
                    dislikedWorkoutIds: dislikedIds,
                    lovedWorkoutIds: lovedIds,
                    limit: 5
                )
            } catch {
                // Fallback to non-personalized recommendations
                recommendedWorkouts = workouts.prefix(5).map { workout in
                    RecommendedWorkout(
                        workout: workout,
                        explanation: "A great workout to try!",
                        relevanceScore: 0
                    )
                }
            }
        } else {
            // User hasn't completed profile - show general recommendations
            recommendedWorkouts = workouts.prefix(5).map { workout in
                RecommendedWorkout(
                    workout: workout,
                    explanation: "A great workout to try!",
                    relevanceScore: 0
                )
            }
        }
    }
}

#Preview {
    WorkoutsView()
        .environmentObject(AuthViewModel())
}
