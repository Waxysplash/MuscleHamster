//
//  WorkoutPlayerView.swift
//  MuscleHamster
//
//  Full-screen workout player with timer, exercise display, and controls
//  Phase 08.2: Added notification prompt after first workout
//

import SwiftUI

struct WorkoutPlayerView: View {
    @StateObject private var viewModel: WorkoutPlayerViewModel
    @EnvironmentObject private var authViewModel: AuthViewModel
    @ObservedObject private var notificationManager = NotificationManager.shared
    @Environment(\.dismiss) private var dismiss

    @State private var showNotificationPrompt = false
    @State private var shouldShowNotificationBanner = false

    init(workout: Workout) {
        _viewModel = StateObject(wrappedValue: WorkoutPlayerViewModel(workout: workout))
    }

    var body: some View {
        ZStack {
            // Background gradient based on exercise type
            backgroundGradient
                .ignoresSafeArea()

            VStack(spacing: 0) {
                switch viewModel.state {
                case .loading:
                    loadingContent
                case .active, .paused, .interrupted:
                    playerContent
                case .completing:
                    completingContent
                case .completed:
                    completedContent
                case .error(let message):
                    errorContent(message: message)
                }
            }
        }
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                if viewModel.state != .completed && viewModel.state != .completing {
                    Button {
                        viewModel.confirmEndWorkout()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.body.weight(.semibold))
                            .foregroundStyle(.white)
                            .padding(8)
                            .background(Color.white.opacity(0.2))
                            .clipShape(Circle())
                    }
                    .accessibilityLabel("End workout")
                    .accessibilityHint("Double tap to end workout early")
                }
            }
        }
        .alert("Skip this exercise?", isPresented: $viewModel.showSkipConfirmation) {
            Button("Skip", role: .destructive) {
                viewModel.skipExercise()
            }
            Button("Keep Going", role: .cancel) {
                viewModel.cancelSkip()
            }
        } message: {
            Text("No worries! Every bit of movement counts.")
        }
        .alert("End workout early?", isPresented: $viewModel.showEndConfirmation) {
            Button("End Workout", role: .destructive) {
                viewModel.endWorkout()
            }
            Button("Keep Going", role: .cancel) {
                viewModel.cancelEndWorkout()
            }
        } message: {
            Text("You've done \(viewModel.completedExercises) of \(viewModel.totalExercises) exercises. Every little bit helps!")
        }
        .task {
            // Pass user context for reward tracking
            viewModel.userId = authViewModel.currentUser?.id
            await viewModel.prepareWorkout()
        }
        .onChange(of: viewModel.state) { _, newState in
            // Check if we should show notification prompt after completion
            if case .completed = newState {
                checkNotificationPrompt()
            }
        }
    }

    /// Check if we should show the notification prompt banner
    private func checkNotificationPrompt() {
        Task { @MainActor in
            // Get total workouts completed
            guard let userId = authViewModel.currentUser?.id else { return }
            let stats = await MockActivityService.shared.getUserStats(userId: userId)

            // Check if notification prompt should be shown
            if notificationManager.shouldShowPermissionPrompt(totalWorkouts: stats.totalWorkoutsCompleted) {
                withAnimation(.easeInOut(duration: 0.3)) {
                    shouldShowNotificationBanner = true
                }
            }
        }
    }

    // MARK: - Background

    private var backgroundGradient: some View {
        let colors: [Color] = {
            guard let exercise = viewModel.currentExercise else {
                return [.accentColor, .accentColor.opacity(0.6)]
            }
            switch exercise.type {
            case .work:
                return [Color.orange, Color.red.opacity(0.8)]
            case .rest:
                return [Color.blue, Color.cyan.opacity(0.8)]
            case .warmup:
                return [Color.yellow.opacity(0.9), Color.orange.opacity(0.8)]
            case .cooldown:
                return [Color.teal, Color.blue.opacity(0.8)]
            }
        }()

        return LinearGradient(
            colors: colors,
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // MARK: - Loading Content

    private var loadingContent: some View {
        VStack(spacing: 24) {
            Spacer()

            ProgressView()
                .scaleEffect(1.5)
                .tint(.white)

            Text("Getting your workout ready...")
                .font(.title3)
                .fontWeight(.medium)
                .foregroundStyle(.white)

            Text("Your hamster is cheering you on!")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.8))

            Spacer()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Loading workout. Your hamster is cheering you on!")
    }

    // MARK: - Player Content

    private var playerContent: some View {
        VStack(spacing: 0) {
            // Progress bar
            progressBar
                .padding(.top, 8)

            Spacer()

            // Exercise info
            exerciseDisplay

            Spacer()

            // Timer
            timerDisplay

            Spacer()

            // Controls
            controlButtons
                .padding(.bottom, 32)
        }
        .padding(.horizontal, 24)
    }

    private var progressBar: some View {
        VStack(spacing: 8) {
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Background track
                    Capsule()
                        .fill(Color.white.opacity(0.3))
                        .frame(height: 6)

                    // Progress fill
                    Capsule()
                        .fill(Color.white)
                        .frame(width: geometry.size.width * viewModel.progress, height: 6)
                        .animation(.easeInOut(duration: 0.3), value: viewModel.progress)
                }
            }
            .frame(height: 6)

            Text(viewModel.exerciseProgressText)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundStyle(.white.opacity(0.8))
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Exercise \(viewModel.exerciseProgressText)")
        .accessibilityValue("\(Int(viewModel.progress * 100)) percent complete")
    }

    private var exerciseDisplay: some View {
        VStack(spacing: 16) {
            if let exercise = viewModel.currentExercise {
                // Exercise type badge
                HStack(spacing: 6) {
                    Image(systemName: exercise.type.icon)
                        .font(.caption)
                    Text(exercise.type.displayName.uppercased())
                        .font(.caption)
                        .fontWeight(.bold)
                        .tracking(1.2)
                }
                .foregroundStyle(.white.opacity(0.9))
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.white.opacity(0.2))
                .cornerRadius(20)

                // Exercise name
                Text(exercise.name)
                    .font(.system(size: 32, weight: .bold))
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.7)

                // Instructions
                Text(exercise.instructions)
                    .font(.body)
                    .foregroundStyle(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
                    .padding(.horizontal, 16)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(exerciseAccessibilityLabel)
    }

    private var exerciseAccessibilityLabel: String {
        guard let exercise = viewModel.currentExercise else { return "No exercise" }
        return "\(exercise.type.displayName): \(exercise.name). \(exercise.instructions)"
    }

    private var timerDisplay: some View {
        VStack(spacing: 8) {
            // Timer circle
            ZStack {
                // Background circle
                Circle()
                    .stroke(Color.white.opacity(0.3), lineWidth: 8)
                    .frame(width: 200, height: 200)

                // Progress ring
                Circle()
                    .trim(from: 0, to: timerProgress)
                    .stroke(Color.white, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .frame(width: 200, height: 200)
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 1), value: timerProgress)

                // Timer text
                VStack(spacing: 4) {
                    Text(viewModel.formattedRemainingTime)
                        .font(.system(size: 56, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .monospacedDigit()

                    if let exercise = viewModel.currentExercise, viewModel.remainingTime >= 60 {
                        Text("of \(exercise.displayDuration)")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.7))
                    }
                }
            }

            // State indicator
            if viewModel.state == .paused {
                Text("PAUSED")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundStyle(.white.opacity(0.9))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 6)
                    .background(Color.white.opacity(0.2))
                    .cornerRadius(12)
            } else if viewModel.state == .interrupted {
                Text("TAP TO RESUME")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundStyle(.white.opacity(0.9))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 6)
                    .background(Color.white.opacity(0.2))
                    .cornerRadius(12)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Timer: \(viewModel.formattedRemainingTime) remaining")
        .accessibilityValue(viewModel.state == .paused ? "Paused" : "Running")
    }

    private var timerProgress: Double {
        guard let exercise = viewModel.currentExercise, exercise.duration > 0 else { return 0 }
        return Double(viewModel.remainingTime) / Double(exercise.duration)
    }

    private var controlButtons: some View {
        HStack(spacing: 32) {
            // Skip button
            Button {
                viewModel.confirmSkip()
            } label: {
                VStack(spacing: 4) {
                    Image(systemName: "forward.fill")
                        .font(.title2)
                    Text("Skip")
                        .font(.caption)
                }
                .foregroundStyle(.white)
                .frame(width: 60, height: 60)
            }
            .accessibilityLabel("Skip exercise")
            .accessibilityHint("Double tap to skip this exercise")

            // Play/Pause button
            Button {
                if viewModel.state == .active {
                    viewModel.pauseTimer()
                } else {
                    viewModel.resumeTimer()
                }
            } label: {
                Image(systemName: viewModel.state == .active ? "pause.fill" : "play.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(viewModel.state == .active ? .accentColor : .white)
                    .frame(width: 80, height: 80)
                    .background(viewModel.state == .active ? Color.white : Color.white.opacity(0.2))
                    .clipShape(Circle())
            }
            .accessibilityLabel(viewModel.state == .active ? "Pause" : "Play")
            .accessibilityHint(viewModel.state == .active ? "Double tap to pause workout" : "Double tap to resume workout")

            // Next button (only visible for last few seconds or when paused)
            Button {
                viewModel.advanceToNextExercise()
            } label: {
                VStack(spacing: 4) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title2)
                    Text(viewModel.isLastExercise ? "Finish" : "Next")
                        .font(.caption)
                }
                .foregroundStyle(.white)
                .frame(width: 60, height: 60)
            }
            .opacity(viewModel.remainingTime <= 5 || viewModel.state == .paused ? 1 : 0.5)
            .accessibilityLabel(viewModel.isLastExercise ? "Finish workout" : "Next exercise")
            .accessibilityHint("Double tap to move to \(viewModel.isLastExercise ? "completion" : "next exercise")")
        }
    }

    // MARK: - Completing Content (Recording Rewards)

    private var completingContent: some View {
        VStack(spacing: 24) {
            Spacer()

            ProgressView()
                .scaleEffect(1.5)
                .tint(.white)

            Text("Recording your awesome work...")
                .font(.title3)
                .fontWeight(.medium)
                .foregroundStyle(.white)

            Text("Your hamster is counting your points!")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.8))

            Spacer()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Recording your workout completion")
    }

    // MARK: - Completed Content

    private var completedContent: some View {
        VStack(spacing: 24) {
            Spacer()

            // Hamster reaction
            VStack(spacing: 12) {
                // Celebration icon based on hamster state
                Image(systemName: celebrationIcon)
                    .font(.system(size: 80))
                    .foregroundStyle(.white)
                    .accessibilityHidden(true)

                VStack(spacing: 8) {
                    Text(celebrationTitle)
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundStyle(.white)

                    Text(celebrationMessage)
                        .font(.title3)
                        .foregroundStyle(.white.opacity(0.9))
                        .multilineTextAlignment(.center)
                }
            }

            // Stats card with points and streak
            VStack(spacing: 16) {
                Text(viewModel.workout.name)
                    .font(.headline)
                    .foregroundStyle(.secondary)

                // Points earned (highlighted)
                if viewModel.pointsEarned > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundStyle(.yellow)
                        Text("+\(viewModel.pointsEarned) points")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundStyle(.accentColor)
                    }
                    .padding(.vertical, 8)
                }

                HStack(spacing: 24) {
                    completionStat(value: "\(viewModel.completedExercises)", label: "Exercises")

                    if let duration = viewModel.completionData?.displayDuration {
                        completionStat(value: duration, label: "Duration")
                    } else {
                        completionStat(value: viewModel.workout.displayDuration, label: "Duration")
                    }

                    // Streak
                    if viewModel.newStreak > 0 {
                        VStack(spacing: 4) {
                            HStack(spacing: 2) {
                                Image(systemName: "flame.fill")
                                    .foregroundStyle(.orange)
                                Text("\(viewModel.newStreak)")
                                    .font(.title2)
                                    .fontWeight(.bold)
                            }
                            Text(viewModel.streakIncreased ? "Streak!" : "Streak")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel(viewModel.streakText)
                    }
                }
            }
            .padding(24)
            .background(Color.white)
            .cornerRadius(20)
            .padding(.horizontal, 32)

            // Notification prompt (shows after first workout if not yet set up)
            if shouldShowNotificationBanner {
                notificationPromptBanner
                    .padding(.horizontal, 24)
                    .padding(.top, 16)
            }

            Spacer()

            // Feedback section (shows before Done button if not yet submitted)
            if !viewModel.feedbackSubmitted {
                feedbackPrompt
                    .padding(.horizontal, 24)
                    .padding(.bottom, 16)
            }

            // Done button
            Button {
                dismiss()
            } label: {
                Text("Done")
                    .font(.headline)
                    .foregroundStyle(.accentColor)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.white)
                    .cornerRadius(14)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
            .accessibilityLabel("Done")
            .accessibilityHint("Double tap to return to workout details")
        }
    }

    // MARK: - Feedback Prompt

    private var feedbackPrompt: some View {
        VStack(spacing: 12) {
            Text("How was this workout?")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundStyle(.white)

            if viewModel.isSubmittingFeedback {
                ProgressView()
                    .tint(.white)
                    .padding(.vertical, 8)
            } else {
                HStack(spacing: 12) {
                    feedbackButton(feedback: .loved)
                    feedbackButton(feedback: .liked)
                    feedbackButton(feedback: .notForMe)
                }

                // Skip option (no shame!)
                Button {
                    viewModel.skipFeedback()
                } label: {
                    Text("Skip")
                        .font(.footnote)
                        .foregroundStyle(.white.opacity(0.7))
                        .padding(.vertical, 8)
                }
                .accessibilityLabel("Skip feedback")
                .accessibilityHint("Double tap to skip giving feedback. That's totally okay!")
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Feedback prompt: How was this workout?")
    }

    private func feedbackButton(feedback: WorkoutFeedback) -> some View {
        Button {
            Task {
                await viewModel.submitFeedback(feedback)
            }
        } label: {
            VStack(spacing: 4) {
                Image(systemName: feedback.icon)
                    .font(.title2)
                Text(feedback.displayName)
                    .font(.caption2)
                    .fontWeight(.medium)
            }
            .foregroundStyle(feedbackButtonForeground(for: feedback))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(feedbackButtonBackground(for: feedback))
            .cornerRadius(12)
        }
        .accessibilityLabel(feedback.displayName)
        .accessibilityHint("Double tap to rate this workout as \(feedback.displayName)")
    }

    private func feedbackButtonForeground(for feedback: WorkoutFeedback) -> Color {
        switch feedback {
        case .loved: return .pink
        case .liked: return .accentColor
        case .notForMe: return .secondary
        }
    }

    private func feedbackButtonBackground(for feedback: WorkoutFeedback) -> Color {
        .white.opacity(0.9)
    }

    // MARK: - Notification Prompt Banner

    private var notificationPromptBanner: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: "bell.badge.fill")
                    .font(.title2)
                    .foregroundStyle(.accentColor)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Want a gentle reminder?")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(.primary)

                    Text("I can nudge you when it's workout time!")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }

            Button {
                showNotificationPrompt = true
            } label: {
                Text("Enable Reminders")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color.accentColor, in: RoundedRectangle(cornerRadius: 8))
            }
            .accessibilityLabel("Enable reminders")
            .accessibilityHint("Opens notification settings to set up workout reminders")
        }
        .padding(16)
        .background(Color.white, in: RoundedRectangle(cornerRadius: 16))
        .sheet(isPresented: $showNotificationPrompt) {
            NotificationPermissionPromptView { granted in
                // Hide banner after prompt
                withAnimation {
                    shouldShowNotificationBanner = false
                }
            }
            .presentationDetents([.medium, .large])
        }
        .accessibilityElement(children: .contain)
    }

    // MARK: - Celebration Helpers

    private var celebrationIcon: String {
        if let state = viewModel.newHamsterState {
            return state.icon
        }
        return "star.circle.fill"
    }

    private var celebrationTitle: String {
        if let state = viewModel.newHamsterState {
            switch state {
            case .proud: return "Incredible!"
            case .excited: return "You're On Fire!"
            case .happy: return "Amazing Work!"
            default: return "Great Job!"
            }
        }
        return "Amazing Work!"
    }

    private var celebrationMessage: String {
        if let state = viewModel.newHamsterState {
            return state.description
        }
        return "Your hamster is so proud of you!"
    }

    private func completionStat(value: String, label: String) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value)")
    }

    // MARK: - Error Content

    private func errorContent(message: String) -> some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 60))
                .foregroundStyle(.white)
                .accessibilityHidden(true)

            VStack(spacing: 8) {
                Text("Oops!")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundStyle(.white)

                Text(message)
                    .font(.body)
                    .foregroundStyle(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()

            Button {
                dismiss()
            } label: {
                Text("Go Back")
                    .font(.headline)
                    .foregroundStyle(.accentColor)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.white)
                    .cornerRadius(14)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
            .accessibilityLabel("Go back")
            .accessibilityHint("Double tap to return to workout details")
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Error. \(message)")
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        WorkoutPlayerView(workout: .placeholder)
    }
    .environmentObject(AuthViewModel())
}
