//
//  ActivityService.swift
//  MuscleHamster
//
//  Service for tracking workout completions, managing points, streaks, and hamster state
//  Phase 06.1: Added rest-day check-in support
//  Phase 06.2: Added streak rules engine with validation and status tracking
//  Phase 07.1: Added transaction recording for points wallet transparency
//  Phase 07.4: Added growth progression milestone checking
//  Phase 09.1: Added friend streak update triggering on check-in
//

import Foundation

// MARK: - Activity Service Protocol

protocol ActivityServiceProtocol {
    /// Record a workout completion and calculate rewards
    func recordCompletion(
        workout: Workout,
        exercisesCompleted: Int,
        totalExercises: Int,
        durationSeconds: Int,
        wasPartial: Bool,
        userId: String
    ) async throws -> WorkoutCompletion

    /// Get user stats
    func getUserStats(userId: String) async -> UserStats

    /// Update hamster state based on current activity
    func refreshHamsterState(userId: String) async -> HamsterState

    /// Check if a completion has already been recorded (idempotency check)
    func hasCompletionForWorkout(_ workoutId: String, on date: Date, userId: String) async -> Bool

    /// Record feedback for a workout completion
    func recordFeedback(
        completionId: String,
        workoutId: String,
        feedback: WorkoutFeedback,
        userId: String
    ) async throws

    /// Get feedback for a specific workout (most recent)
    func getFeedbackForWorkout(_ workoutId: String, userId: String) async -> WorkoutFeedback?

    /// Get all disliked workout IDs for recommendation filtering
    func getDislikedWorkoutIds(userId: String) async -> Set<String>

    // MARK: - Rest-Day Check-ins

    /// Record a rest-day check-in and calculate rewards
    func recordRestDayCheckIn(
        activity: RestDayActivity,
        userId: String
    ) async throws -> RestDayCheckIn

    /// Check if user has already checked in today (workout or rest day)
    func hasCheckedInToday(userId: String) async -> Bool

    // MARK: - Streak Rules Engine (Phase 06.2)

    /// Validate and update streak status based on current date
    /// Call this on app launch/foreground to ensure streak is accurate
    /// Returns the validated streak status
    func validateStreak(userId: String) async -> StreakStatus

    /// Get the current streak status without modifying state
    func getStreakStatus(userId: String) async -> StreakStatus

    /// Reset a broken streak (clears previousBrokenStreak after acknowledgement)
    func acknowledgeStreakReset(userId: String) async

    // MARK: - Streak Freeze (Phase 06.3)

    /// Check if the user can restore their broken streak
    func canRestoreStreak(userId: String) async -> Bool

    /// Restore a broken streak by spending points
    /// Returns the result with success/failure and details
    func restoreStreak(userId: String) async throws -> StreakRestoreResult

    // MARK: - Shop Purchases (Phase 07.2)

    /// Record a shop purchase transaction
    /// - Returns: true if transaction was recorded, false if duplicate
    func recordShopPurchase(
        itemId: String,
        itemName: String,
        amount: Int,
        userId: String
    ) async throws -> Bool

    // MARK: - Growth Progression (Phase 07.4)

    /// Check if growth milestone was reached and record it
    /// Call this after workout completion or streak update
    /// - Returns: The new milestone if growth occurred, nil otherwise
    func checkAndRecordGrowth(userId: String) async -> GrowthMilestone?

    /// Get the current growth stage
    func getCurrentGrowthStage(userId: String) async -> GrowthStage

    /// Get pending growth celebration (if any)
    func getPendingGrowthCelebration(userId: String) async -> GrowthMilestone?

    /// Clear the pending growth celebration after it's been shown
    func clearPendingGrowthCelebration(userId: String) async
}

// MARK: - Activity Error

enum ActivityError: LocalizedError {
    case duplicateCompletion
    case saveFailed
    case feedbackSaveFailed
    case completionNotFound
    case alreadyCheckedInToday
    case noStreakToRestore
    case insufficientPoints
    case streakAlreadyActive
    case unknown(String)

    var errorDescription: String? {
        switch self {
        case .duplicateCompletion:
            return "This workout has already been recorded. No worries, your points are safe!"
        case .saveFailed:
            return "Couldn't save your progress right now. Let's try again!"
        case .feedbackSaveFailed:
            return "Couldn't save your feedback right now. No worries!"
        case .completionNotFound:
            return "Couldn't find that workout completion."
        case .alreadyCheckedInToday:
            return "You've already checked in today! Come back tomorrow."
        case .noStreakToRestore:
            return "There's no broken streak to restore."
        case .insufficientPoints:
            return "Not enough points to restore your streak."
        case .streakAlreadyActive:
            return "Your streak is already active!"
        case .unknown(let message):
            return message
        }
    }

    /// Hamster-friendly error message
    var friendlyMessage: String {
        switch self {
        case .duplicateCompletion:
            return "I already counted this workout! You're all good."
        case .saveFailed:
            return "Oops! I couldn't save that. Let's give it another try."
        case .feedbackSaveFailed:
            return "I couldn't save your feedback, but that's okay! Your workout still counts."
        case .completionNotFound:
            return "Hmm, I can't find that workout. But don't worry!"
        case .alreadyCheckedInToday:
            return "We already hung out today! I'll see you tomorrow for more fun."
        case .noStreakToRestore:
            return "Hmm, there's nothing to restore right now. Let's start fresh together!"
        case .insufficientPoints:
            return "You need a few more points to restore your streak. But hey, starting fresh is great too!"
        case .streakAlreadyActive:
            return "Your streak is already going strong! Keep it up!"
        case .unknown:
            return "Something went a little wrong. Let's try again!"
        }
    }
}

// MARK: - Mock Activity Service

actor MockActivityService: ActivityServiceProtocol {
    /// In-memory stats storage (keyed by userId)
    private var statsCache: [String: UserStats] = [:]

    /// Completion IDs for idempotency checks (workoutId + date)
    private var completionKeys: Set<String> = []

    // MARK: - Record Completion

    func recordCompletion(
        workout: Workout,
        exercisesCompleted: Int,
        totalExercises: Int,
        durationSeconds: Int,
        wasPartial: Bool,
        userId: String
    ) async throws -> WorkoutCompletion {
        // Load current stats
        var stats = await getUserStats(userId: userId)

        // Generate completion key for idempotency
        let today = Calendar.current.startOfDay(for: Date())
        let completionKey = "\(userId)_\(workout.id)_\(today.timeIntervalSince1970)"

        // Check for duplicate
        if completionKeys.contains(completionKey) {
            throw ActivityError.duplicateCompletion
        }

        // Calculate streak (check if continuing or starting fresh)
        let newStreak = calculateNewStreak(from: stats)

        // Calculate points
        let points = PointsConfig.calculatePoints(
            exercisesCompleted: exercisesCompleted,
            totalExercises: totalExercises,
            currentStreak: newStreak,
            wasPartial: wasPartial
        )

        // Create completion record
        let completion = WorkoutCompletion(
            id: UUID().uuidString,
            workoutId: workout.id,
            workoutName: workout.name,
            completedAt: Date(),
            exercisesCompleted: exercisesCompleted,
            totalExercises: totalExercises,
            durationSeconds: durationSeconds,
            pointsEarned: points,
            wasPartial: wasPartial
        )

        // Track if streak was broken before this check-in
        let wasStreakBroken = stats.isStreakBroken

        // Update streak first (before transaction recording)
        stats.currentStreak = newStreak
        stats.longestStreak = max(stats.longestStreak, newStreak)
        stats.totalWorkoutsCompleted += 1
        stats.lastActivityDate = Date()
        stats.lastCheckInDate = Date()  // Phase 06.2: Track check-in date for streak validation
        stats.workoutHistory.insert(completion, at: 0)

        // Clear broken streak tracking if starting fresh
        if wasStreakBroken {
            stats.previousBrokenStreak = 0
        }

        // Phase 07.1: Record transaction (this also updates totalPoints)
        let transactionId = PointsTransaction.generateId(
            category: .workout,
            entityId: completion.id,
            date: Date()
        )
        stats.addTransaction(
            id: transactionId,
            type: .earn,
            category: .workout,
            amount: points,
            description: workout.name,
            entityId: completion.id
        )

        // Update hamster state
        stats.hamsterState = calculateHamsterState(for: stats)

        // Phase 07.4: Check for growth milestone
        if let milestone = stats.checkForGrowth() {
            stats.recordGrowth(milestone)
        }

        // Persist
        statsCache[userId] = stats
        stats.save(for: userId)

        // Mark completion as recorded
        completionKeys.insert(completionKey)

        // Phase 09.1: Update friend streaks
        await MockFriendService.shared.updateFriendStreaks(userId: userId)

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 200_000_000)

        return completion
    }

    // MARK: - Get User Stats

    func getUserStats(userId: String) async -> UserStats {
        // Check cache first
        if let cached = statsCache[userId] {
            return cached
        }

        // Try loading from persistence
        if let saved = UserStats.load(for: userId) {
            statsCache[userId] = saved
            return saved
        }

        // Return fresh stats for new users
        let newStats = UserStats()
        statsCache[userId] = newStats
        return newStats
    }

    // MARK: - Refresh Hamster State

    func refreshHamsterState(userId: String) async -> HamsterState {
        var stats = await getUserStats(userId: userId)
        let newState = calculateHamsterState(for: stats)

        if stats.hamsterState != newState {
            stats.hamsterState = newState
            statsCache[userId] = stats
            stats.save(for: userId)
        }

        return newState
    }

    // MARK: - Idempotency Check

    func hasCompletionForWorkout(_ workoutId: String, on date: Date, userId: String) async -> Bool {
        let dayStart = Calendar.current.startOfDay(for: date)
        let completionKey = "\(userId)_\(workoutId)_\(dayStart.timeIntervalSince1970)"
        return completionKeys.contains(completionKey)
    }

    // MARK: - Feedback

    func recordFeedback(
        completionId: String,
        workoutId: String,
        feedback: WorkoutFeedback,
        userId: String
    ) async throws {
        var stats = await getUserStats(userId: userId)

        // Update feedback on the completion in history
        if let index = stats.workoutHistory.firstIndex(where: { $0.id == completionId }) {
            stats.workoutHistory[index].feedback = feedback
        }

        // Store feedback by workoutId for future recommendation influence
        stats.setFeedback(feedback, for: workoutId)

        // Persist
        statsCache[userId] = stats
        stats.save(for: userId)

        // Small delay to simulate network
        try? await Task.sleep(nanoseconds: 100_000_000)
    }

    func getFeedbackForWorkout(_ workoutId: String, userId: String) async -> WorkoutFeedback? {
        let stats = await getUserStats(userId: userId)
        return stats.getFeedback(for: workoutId)
    }

    func getDislikedWorkoutIds(userId: String) async -> Set<String> {
        let stats = await getUserStats(userId: userId)
        return stats.dislikedWorkoutIds
    }

    // MARK: - Rest-Day Check-ins

    func recordRestDayCheckIn(
        activity: RestDayActivity,
        userId: String
    ) async throws -> RestDayCheckIn {
        // Load current stats
        var stats = await getUserStats(userId: userId)

        // Check if already checked in today (either workout or rest day)
        if stats.hasAnyCheckInToday {
            throw ActivityError.alreadyCheckedInToday
        }

        // Calculate streak (same logic as workout)
        let newStreak = calculateNewStreak(from: stats)

        // Calculate points for rest-day activity
        let points = PointsConfig.calculateRestDayPoints(
            activity: activity,
            currentStreak: newStreak
        )

        // Create check-in record
        let checkIn = RestDayCheckIn(
            id: UUID().uuidString,
            activity: activity,
            completedAt: Date(),
            pointsEarned: points
        )

        // Track if streak was broken before this check-in
        let wasStreakBroken = stats.isStreakBroken

        // Update streak first (before transaction recording)
        stats.currentStreak = newStreak
        stats.longestStreak = max(stats.longestStreak, newStreak)
        stats.totalRestDayCheckIns += 1
        stats.lastActivityDate = Date()
        stats.lastCheckInDate = Date()  // Phase 06.2: Track check-in date for streak validation
        stats.restDayHistory.insert(checkIn, at: 0)

        // Clear broken streak tracking if starting fresh
        if wasStreakBroken {
            stats.previousBrokenStreak = 0
        }

        // Phase 07.1: Record transaction (this also updates totalPoints)
        let transactionId = PointsTransaction.generateId(
            category: .restDay,
            entityId: checkIn.id,
            date: Date()
        )
        stats.addTransaction(
            id: transactionId,
            type: .earn,
            category: .restDay,
            amount: points,
            description: activity.displayName,
            entityId: checkIn.id
        )

        // Update hamster state (chillin' for rest day, not as excited as workout)
        stats.hamsterState = calculateHamsterStateForRestDay(for: stats, activity: activity)

        // Persist
        statsCache[userId] = stats
        stats.save(for: userId)

        // Phase 09.1: Update friend streaks
        await MockFriendService.shared.updateFriendStreaks(userId: userId)

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 200_000_000)

        return checkIn
    }

    func hasCheckedInToday(userId: String) async -> Bool {
        let stats = await getUserStats(userId: userId)
        return stats.hasAnyCheckInToday
    }

    // MARK: - Streak Rules Engine (Phase 06.2)

    func validateStreak(userId: String) async -> StreakStatus {
        var stats = await getUserStats(userId: userId)
        let calendar = Calendar.current

        // Get the last check-in date (prefer explicit lastCheckInDate, fall back to lastActivityDate)
        guard let lastCheckIn = stats.lastCheckInDate ?? stats.lastActivityDate else {
            // No activity ever - no validation needed
            return .none
        }

        // If checked in today, streak is active and secure
        if calendar.isDateInToday(lastCheckIn) {
            return .active(days: stats.currentStreak)
        }

        // If checked in yesterday, streak is at risk but still valid
        if calendar.isDateInYesterday(lastCheckIn) {
            return .atRisk(days: stats.currentStreak)
        }

        // More than one day gap - streak is broken
        // Store the broken streak for potential streak freeze (Phase 06.3)
        // and update state
        let brokenStreak = stats.currentStreak
        if brokenStreak > 0 && stats.previousBrokenStreak == 0 {
            // Only store if we haven't already acknowledged this break
            stats.previousBrokenStreak = brokenStreak
            stats.currentStreak = 0
            statsCache[userId] = stats
            stats.save(for: userId)
        }

        // Also update hamster state since streak is broken
        if stats.hamsterState != .hungry {
            stats.hamsterState = .hungry
            statsCache[userId] = stats
            stats.save(for: userId)
        }

        return .broken(previousStreak: stats.previousBrokenStreak)
    }

    func getStreakStatus(userId: String) async -> StreakStatus {
        let stats = await getUserStats(userId: userId)
        return stats.calculateStreakStatus()
    }

    func acknowledgeStreakReset(userId: String) async {
        var stats = await getUserStats(userId: userId)

        // Clear the broken streak after user has acknowledged it
        stats.previousBrokenStreak = 0

        statsCache[userId] = stats
        stats.save(for: userId)
    }

    // MARK: - Streak Freeze (Phase 06.3)

    func canRestoreStreak(userId: String) async -> Bool {
        let stats = await getUserStats(userId: userId)
        return stats.canRestoreStreak
    }

    func restoreStreak(userId: String) async throws -> StreakRestoreResult {
        var stats = await getUserStats(userId: userId)

        // Validate: must have a broken streak to restore
        guard stats.previousBrokenStreak > 0 else {
            throw ActivityError.noStreakToRestore
        }

        // Validate: must not have already started a new streak
        guard !stats.hasAnyCheckInToday else {
            throw ActivityError.streakAlreadyActive
        }

        // Validate: must have enough points
        let cost = PointsConfig.streakFreezeCost
        guard stats.totalPoints >= cost else {
            return StreakRestoreResult(
                success: false,
                restoredStreak: 0,
                pointsSpent: 0,
                message: "You need \(cost) points to restore your streak. You have \(stats.totalPoints) points."
            )
        }

        // Perform the restore
        let restoredStreak = stats.previousBrokenStreak

        // Phase 07.1: Record spend transaction (this also deducts points)
        let transactionId = PointsTransaction.generateId(
            category: .streakFreeze,
            entityId: "freeze_\(restoredStreak)",
            date: Date()
        )
        let transactionRecorded = stats.addTransaction(
            id: transactionId,
            type: .spend,
            category: .streakFreeze,
            amount: cost,
            description: "Streak Freeze (\(restoredStreak)-day streak)",
            entityId: nil
        )

        // If transaction failed (e.g., insufficient points), return failure
        guard transactionRecorded else {
            return StreakRestoreResult(
                success: false,
                restoredStreak: 0,
                pointsSpent: 0,
                message: "Couldn't complete the restore. Please try again."
            )
        }

        // Restore the streak
        stats.currentStreak = restoredStreak
        stats.previousBrokenStreak = 0

        // Set lastCheckInDate to yesterday so the streak is "at risk" until they check in today
        // This prevents gaming the system by restoring and then missing another day
        let calendar = Calendar.current
        if let yesterday = calendar.date(byAdding: .day, value: -1, to: Date()) {
            stats.lastCheckInDate = yesterday
        }

        // Update hamster state - happy that we saved the streak!
        stats.hamsterState = .happy

        // Persist
        statsCache[userId] = stats
        stats.save(for: userId)

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 300_000_000)

        return StreakRestoreResult(
            success: true,
            restoredStreak: restoredStreak,
            pointsSpent: cost,
            message: "Your \(restoredStreak)-day streak has been restored!"
        )
    }

    // MARK: - Shop Purchases (Phase 07.2)

    func recordShopPurchase(
        itemId: String,
        itemName: String,
        amount: Int,
        userId: String
    ) async throws -> Bool {
        var stats = await getUserStats(userId: userId)

        // Generate deterministic transaction ID for idempotency
        let transactionId = PointsTransaction.generateId(
            category: .shopPurchase,
            entityId: itemId,
            date: Date()
        )

        // Check for duplicate (prevents double-charging)
        if stats.hasTransaction(id: transactionId) {
            return false
        }

        // Validate sufficient points
        guard stats.totalPoints >= amount else {
            throw ActivityError.insufficientPoints
        }

        // Record the spend transaction
        let transactionRecorded = stats.addTransaction(
            id: transactionId,
            type: .spend,
            category: .shopPurchase,
            amount: amount,
            description: itemName,
            entityId: itemId
        )

        guard transactionRecorded else {
            throw ActivityError.saveFailed
        }

        // Persist
        statsCache[userId] = stats
        stats.save(for: userId)

        return true
    }

    // MARK: - Growth Progression (Phase 07.4)

    func checkAndRecordGrowth(userId: String) async -> GrowthMilestone? {
        var stats = await getUserStats(userId: userId)

        // Check if growth should occur
        guard let milestone = stats.checkForGrowth() else {
            return nil
        }

        // Record the growth
        stats.recordGrowth(milestone)

        // Persist
        statsCache[userId] = stats
        stats.save(for: userId)

        return milestone
    }

    func getCurrentGrowthStage(userId: String) async -> GrowthStage {
        let stats = await getUserStats(userId: userId)
        return stats.currentGrowthStage
    }

    func getPendingGrowthCelebration(userId: String) async -> GrowthMilestone? {
        let stats = await getUserStats(userId: userId)
        return stats.pendingGrowthCelebration
    }

    func clearPendingGrowthCelebration(userId: String) async {
        var stats = await getUserStats(userId: userId)

        guard stats.pendingGrowthCelebration != nil else {
            return
        }

        stats.clearPendingGrowthCelebration()

        // Persist
        statsCache[userId] = stats
        stats.save(for: userId)
    }

    // MARK: - Private Helpers

    /// Calculate new streak value based on last activity
    private func calculateNewStreak(from stats: UserStats) -> Int {
        guard let lastActivity = stats.lastActivityDate else {
            // First ever activity - start at 1
            return 1
        }

        let calendar = Calendar.current

        // If already worked out today, keep current streak
        if calendar.isDateInToday(lastActivity) {
            return stats.currentStreak
        }

        // If worked out yesterday, increment streak
        if calendar.isDateInYesterday(lastActivity) {
            return stats.currentStreak + 1
        }

        // Otherwise, streak is broken - start fresh at 1
        return 1
    }

    /// Calculate hamster state based on user's activity
    private func calculateHamsterState(for stats: UserStats) -> HamsterState {
        // Just completed a workout today?
        if stats.hasCompletedWorkoutToday {
            // Check for milestones
            if stats.currentStreak >= 7 || stats.totalWorkoutsCompleted % 10 == 0 {
                return .proud
            }
            // On a good streak?
            if stats.currentStreak >= 3 {
                return .excited
            }
            // Default after workout
            return .happy
        }

        // Rest day check-in today?
        if stats.hasRestDayCheckInToday {
            return .chillin
        }

        // Had activity yesterday but not today?
        if let lastActivity = stats.lastActivityDate,
           Calendar.current.isDateInYesterday(lastActivity) {
            return .chillin
        }

        // No recent activity
        return .hungry
    }

    /// Calculate hamster state specifically for rest-day check-ins
    private func calculateHamsterStateForRestDay(for stats: UserStats, activity: RestDayActivity) -> HamsterState {
        // Hamster interactions make them happy
        if activity.isHamsterInteraction {
            // On a good streak, they're excited even on rest days
            if stats.currentStreak >= 3 {
                return .happy
            }
            return .chillin
        }

        // Logging activities keeps them content
        return .chillin
    }
}

// MARK: - Singleton Access

extension MockActivityService {
    static let shared = MockActivityService()
}
