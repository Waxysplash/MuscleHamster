//
//  WorkoutPlayerViewModel.swift
//  MuscleHamster
//
//  Manages workout player state, timer, exercise progression, and app lifecycle
//

import SwiftUI
import Combine

// MARK: - Player State

enum WorkoutPlayerState: Equatable {
    case loading
    case active
    case paused
    case interrupted  // App backgrounded or screen locked
    case completing   // Recording completion and calculating rewards
    case completed
    case error(String)

    static func == (lhs: WorkoutPlayerState, rhs: WorkoutPlayerState) -> Bool {
        switch (lhs, rhs) {
        case (.loading, .loading): return true
        case (.active, .active): return true
        case (.paused, .paused): return true
        case (.interrupted, .interrupted): return true
        case (.completing, .completing): return true
        case (.completed, .completed): return true
        case (.error(let lhsMsg), .error(let rhsMsg)): return lhsMsg == rhsMsg
        default: return false
        }
    }
}

// MARK: - Workout Player ViewModel

@MainActor
class WorkoutPlayerViewModel: ObservableObject {
    // MARK: - Published Properties

    @Published private(set) var state: WorkoutPlayerState = .loading
    @Published private(set) var currentExerciseIndex: Int = 0
    @Published private(set) var remainingTime: Int = 0
    @Published private(set) var isTimerRunning: Bool = false

    // Skip confirmation
    @Published var showSkipConfirmation: Bool = false
    @Published var showEndConfirmation: Bool = false

    // Completion data (populated after workout ends)
    @Published private(set) var completionData: WorkoutCompletion?
    @Published private(set) var newHamsterState: HamsterState?
    @Published private(set) var previousStreak: Int = 0
    @Published private(set) var newStreak: Int = 0

    // Feedback state
    @Published private(set) var feedbackSubmitted: Bool = false
    @Published private(set) var selectedFeedback: WorkoutFeedback?
    @Published private(set) var isSubmittingFeedback: Bool = false
    @Published private(set) var feedbackError: String?

    // MARK: - Workout Data

    let workout: Workout
    private(set) var exercises: [Exercise] = []

    // User context (set by view)
    var userId: String?

    // MARK: - Timer

    private var timer: Timer?
    private var backgroundDate: Date?
    private var workoutStartTime: Date?
    private let activityService: MockActivityService

    // MARK: - Computed Properties

    var currentExercise: Exercise? {
        guard currentExerciseIndex < exercises.count else { return nil }
        return exercises[currentExerciseIndex]
    }

    var progress: Double {
        guard !exercises.isEmpty else { return 0 }
        return Double(currentExerciseIndex) / Double(exercises.count)
    }

    var completedExercises: Int {
        currentExerciseIndex
    }

    var totalExercises: Int {
        exercises.count
    }

    var isLastExercise: Bool {
        currentExerciseIndex == exercises.count - 1
    }

    var canSkip: Bool {
        state == .active || state == .paused
    }

    var elapsedTimeForCurrentExercise: Int {
        guard let exercise = currentExercise else { return 0 }
        return exercise.duration - remainingTime
    }

    // MARK: - Initialization

    init(workout: Workout, activityService: MockActivityService = .shared) {
        self.workout = workout
        self.activityService = activityService
        setupNotifications()
    }

    deinit {
        stopTimer()
        removeNotifications()
    }

    // MARK: - Lifecycle

    func prepareWorkout() async {
        state = .loading

        // Simulate loading (in production, might fetch additional data)
        try? await Task.sleep(nanoseconds: 500_000_000)

        // Validate workout has exercises
        guard !workout.exercises.isEmpty else {
            state = .error("This workout doesn't have any exercises yet. Check back soon!")
            return
        }

        exercises = workout.exercises
        currentExerciseIndex = 0
        workoutStartTime = Date()

        // Load previous streak for comparison
        if let userId = userId {
            let stats = await activityService.getUserStats(userId: userId)
            previousStreak = stats.currentStreak
        }

        if let first = exercises.first {
            remainingTime = first.duration
        }

        state = .active
        startTimer()
    }

    // MARK: - Timer Control

    func startTimer() {
        guard state == .active || state == .interrupted else { return }

        state = .active
        isTimerRunning = true

        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.tick()
            }
        }
    }

    func pauseTimer() {
        guard state == .active else { return }

        state = .paused
        isTimerRunning = false
        timer?.invalidate()
        timer = nil
    }

    func resumeTimer() {
        guard state == .paused || state == .interrupted else { return }

        state = .active
        isTimerRunning = true

        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.tick()
            }
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
        isTimerRunning = false
    }

    private func tick() {
        guard state == .active, remainingTime > 0 else { return }

        remainingTime -= 1

        if remainingTime <= 0 {
            advanceToNextExercise()
        }
    }

    // MARK: - Exercise Navigation

    func advanceToNextExercise() {
        stopTimer()

        if isLastExercise {
            completeWorkout()
            return
        }

        currentExerciseIndex += 1

        if let next = currentExercise {
            remainingTime = next.duration
            startTimer()
        }
    }

    func skipExercise() {
        guard canSkip else { return }
        showSkipConfirmation = false
        advanceToNextExercise()
    }

    func confirmSkip() {
        showSkipConfirmation = true
    }

    func cancelSkip() {
        showSkipConfirmation = false
    }

    // MARK: - End Workout

    func confirmEndWorkout() {
        pauseTimer()
        showEndConfirmation = true
    }

    func cancelEndWorkout() {
        showEndConfirmation = false
        if state == .paused {
            resumeTimer()
        }
    }

    func endWorkout() {
        showEndConfirmation = false
        stopTimer()

        Task {
            await recordCompletion(wasPartial: true)
        }
    }

    private func completeWorkout() {
        stopTimer()

        Task {
            await recordCompletion(wasPartial: false)
        }
    }

    private func recordCompletion(wasPartial: Bool) async {
        guard let userId = userId else {
            // No user context - still show completion but without rewards
            state = .completed
            return
        }

        state = .completing

        // Calculate duration
        let durationSeconds = Int(Date().timeIntervalSince(workoutStartTime ?? Date()))

        do {
            // Record with activity service
            let completion = try await activityService.recordCompletion(
                workout: workout,
                exercisesCompleted: completedExercises + (wasPartial ? 0 : 1), // +1 if we completed the last exercise
                totalExercises: totalExercises,
                durationSeconds: durationSeconds,
                wasPartial: wasPartial,
                userId: userId
            )

            // Store completion data
            completionData = completion

            // Get updated stats for display
            let stats = await activityService.getUserStats(userId: userId)
            newStreak = stats.currentStreak
            newHamsterState = stats.hamsterState

            state = .completed

        } catch {
            // If recording fails, still show completion (don't lose the user's workout)
            // In production, we'd queue for retry
            state = .completed
        }
    }

    // MARK: - App Lifecycle Handling

    private func setupNotifications() {
        NotificationCenter.default.addObserver(
            forName: UIApplication.willResignActiveNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.handleBackgrounding()
            }
        }

        NotificationCenter.default.addObserver(
            forName: UIApplication.didBecomeActiveNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.handleReturningToForeground()
            }
        }
    }

    private func removeNotifications() {
        NotificationCenter.default.removeObserver(self)
    }

    private func handleBackgrounding() {
        guard state == .active else { return }

        backgroundDate = Date()
        stopTimer()
        state = .interrupted
    }

    private func handleReturningToForeground() {
        guard state == .interrupted, let backgroundDate = backgroundDate else { return }

        // Calculate elapsed time while backgrounded
        let elapsed = Int(Date().timeIntervalSince(backgroundDate))

        // Subtract elapsed time from remaining time
        remainingTime = max(0, remainingTime - elapsed)

        self.backgroundDate = nil

        // If timer ran out while backgrounded, advance to next exercise
        if remainingTime <= 0 {
            advanceToNextExercise()
        } else {
            // Resume playing (user can tap to resume)
            state = .paused
        }
    }

    // MARK: - Display Helpers

    var formattedRemainingTime: String {
        let minutes = remainingTime / 60
        let seconds = remainingTime % 60

        if minutes > 0 {
            return String(format: "%d:%02d", minutes, seconds)
        }
        return "\(seconds)"
    }

    var exerciseProgressText: String {
        "\(currentExerciseIndex + 1) of \(exercises.count)"
    }

    var pointsEarned: Int {
        completionData?.pointsEarned ?? 0
    }

    var streakIncreased: Bool {
        newStreak > previousStreak
    }

    var streakText: String {
        if newStreak == 1 {
            return "Streak started!"
        } else if streakIncreased {
            return "\(newStreak) day streak!"
        } else {
            return "\(newStreak) day streak"
        }
    }

    // MARK: - Feedback

    /// Submit feedback for the completed workout
    func submitFeedback(_ feedback: WorkoutFeedback) async {
        guard let userId = userId,
              let completion = completionData else {
            // No user or completion - just mark as done
            feedbackSubmitted = true
            return
        }

        isSubmittingFeedback = true
        feedbackError = nil
        selectedFeedback = feedback

        do {
            try await activityService.recordFeedback(
                completionId: completion.id,
                workoutId: workout.id,
                feedback: feedback,
                userId: userId
            )
            feedbackSubmitted = true
        } catch {
            // Don't block the user - feedback errors are non-critical
            feedbackError = "Couldn't save feedback, but that's okay!"
            feedbackSubmitted = true
        }

        isSubmittingFeedback = false
    }

    /// Skip providing feedback (no shame!)
    func skipFeedback() {
        feedbackSubmitted = true
    }
}
