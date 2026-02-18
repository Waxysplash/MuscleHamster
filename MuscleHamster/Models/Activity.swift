//
//  Activity.swift
//  MuscleHamster
//
//  Models for tracking workout completions, points, streaks, and hamster state
//  Phase 06.1: Added rest-day micro-tasks and check-ins
//  Phase 06.2: Added streak rules engine (StreakStatus, validation, timezone handling)
//  Phase 07.1: Added points transaction history for wallet transparency
//  Phase 07.4: Added growth progression milestones (baby → juvenile → adult → mature)
//

import Foundation

// MARK: - Growth Progression (Phase 07.4)

/// Hamster growth stages - progression is permanent and never regresses
enum GrowthStage: String, Codable, CaseIterable, Comparable {
    case baby
    case juvenile
    case adult
    case mature

    var displayName: String {
        switch self {
        case .baby: return "Baby"
        case .juvenile: return "Growing"
        case .adult: return "Grown Up"
        case .mature: return "Wise"
        }
    }

    var description: String {
        switch self {
        case .baby: return "A curious little hamster, just starting out"
        case .juvenile: return "Getting bigger and stronger every day"
        case .adult: return "A confident hamster, ready for anything"
        case .mature: return "A wise and experienced companion"
        }
    }

    var icon: String {
        switch self {
        case .baby: return "leaf.fill"
        case .juvenile: return "leaf.arrow.triangle.circlepath"
        case .adult: return "star.fill"
        case .mature: return "crown.fill"
        }
    }

    /// Relative size multiplier for visual display
    var sizeMultiplier: CGFloat {
        switch self {
        case .baby: return 0.7
        case .juvenile: return 0.85
        case .adult: return 1.0
        case .mature: return 1.1
        }
    }

    /// Color associated with this stage
    var color: String {
        switch self {
        case .baby: return "green"
        case .juvenile: return "blue"
        case .adult: return "purple"
        case .mature: return "yellow"
        }
    }

    /// The next stage (nil for mature)
    var nextStage: GrowthStage? {
        switch self {
        case .baby: return .juvenile
        case .juvenile: return .adult
        case .adult: return .mature
        case .mature: return nil
        }
    }

    /// Celebration headline when reaching this stage
    var celebrationHeadline: String {
        switch self {
        case .baby: return "Welcome!" // Not really used, starting stage
        case .juvenile: return "is growing up!"
        case .adult: return "is all grown up!"
        case .mature: return "has reached wisdom!"
        }
    }

    /// Hamster speech for celebration
    var celebrationSpeech: String {
        switch self {
        case .baby: return "I'm so excited to meet you!"
        case .juvenile: return "Look at me! I'm getting bigger and stronger — just like you! We make a great team!"
        case .adult: return "Wow, look how far we've come together! I'm so proud of us. Let's keep going!"
        case .mature: return "We've been through so much together. I'm honored to be your lifelong workout buddy. You inspire me every day!"
        }
    }

    // Comparable conformance for stage ordering
    static func < (lhs: GrowthStage, rhs: GrowthStage) -> Bool {
        let order: [GrowthStage] = [.baby, .juvenile, .adult, .mature]
        guard let lhsIndex = order.firstIndex(of: lhs),
              let rhsIndex = order.firstIndex(of: rhs) else {
            return false
        }
        return lhsIndex < rhsIndex
    }
}

/// What triggered the growth milestone
enum GrowthTrigger: String, Codable {
    case workouts
    case streak

    var displayName: String {
        switch self {
        case .workouts: return "workouts completed"
        case .streak: return "day streak achieved"
        }
    }
}

/// Records a growth milestone achievement
struct GrowthMilestone: Codable, Equatable {
    let stage: GrowthStage
    let achievedAt: Date
    let triggerType: GrowthTrigger
    let triggerValue: Int  // The count that triggered it

    var displayDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: achievedAt)
    }

    var triggerDescription: String {
        "\(triggerValue) \(triggerType.displayName)"
    }
}

/// Growth threshold configuration
enum GrowthConfig {
    // Baby → Juvenile thresholds
    static let juvenileWorkouts = 5
    static let juvenileStreak = 7

    // Juvenile → Adult thresholds
    static let adultWorkouts = 25
    static let adultStreak = 21

    // Adult → Mature thresholds
    static let matureWorkouts = 75
    static let matureStreak = 60

    /// Get required workouts to reach a stage from the previous stage
    static func requiredWorkouts(for stage: GrowthStage) -> Int? {
        switch stage {
        case .baby: return nil  // Starting stage
        case .juvenile: return juvenileWorkouts
        case .adult: return adultWorkouts
        case .mature: return matureWorkouts
        }
    }

    /// Get required streak to reach a stage from the previous stage
    static func requiredStreak(for stage: GrowthStage) -> Int? {
        switch stage {
        case .baby: return nil  // Starting stage
        case .juvenile: return juvenileStreak
        case .adult: return adultStreak
        case .mature: return matureStreak
        }
    }

    /// Check if growth should occur based on current stats
    /// Returns the new stage and trigger if growth should happen, nil otherwise
    static func checkGrowth(
        totalWorkouts: Int,
        longestStreak: Int,
        currentStage: GrowthStage
    ) -> (stage: GrowthStage, trigger: GrowthTrigger, value: Int)? {
        guard let nextStage = currentStage.nextStage else {
            return nil  // Already at max stage
        }

        guard let requiredWorkouts = requiredWorkouts(for: nextStage),
              let requiredStreak = requiredStreak(for: nextStage) else {
            return nil
        }

        // Check workout milestone first (arbitrary choice, both are valid)
        if totalWorkouts >= requiredWorkouts {
            return (nextStage, .workouts, totalWorkouts)
        }

        // Check streak milestone
        if longestStreak >= requiredStreak {
            return (nextStage, .streak, longestStreak)
        }

        return nil
    }

    /// Calculate progress toward next stage (0.0 to 1.0 for each path)
    static func progressToNextStage(
        totalWorkouts: Int,
        longestStreak: Int,
        currentStage: GrowthStage
    ) -> (workouts: Double, streak: Double)? {
        guard let nextStage = currentStage.nextStage,
              let requiredWorkouts = requiredWorkouts(for: nextStage),
              let requiredStreak = requiredStreak(for: nextStage) else {
            return nil  // Already at max stage
        }

        // Calculate progress based on what's needed from current stage to next
        let workoutProgress = min(1.0, Double(totalWorkouts) / Double(requiredWorkouts))
        let streakProgress = min(1.0, Double(longestStreak) / Double(requiredStreak))

        return (workouts: workoutProgress, streak: streakProgress)
    }

    /// Get remaining workouts to next stage
    static func workoutsToNextStage(totalWorkouts: Int, currentStage: GrowthStage) -> Int? {
        guard let nextStage = currentStage.nextStage,
              let required = requiredWorkouts(for: nextStage) else {
            return nil
        }
        return max(0, required - totalWorkouts)
    }

    /// Get remaining streak days to next stage
    static func streakToNextStage(longestStreak: Int, currentStage: GrowthStage) -> Int? {
        guard let nextStage = currentStage.nextStage,
              let required = requiredStreak(for: nextStage) else {
            return nil
        }
        return max(0, required - longestStreak)
    }
}

// MARK: - Points Transactions

/// Type of points transaction
enum TransactionType: String, Codable, CaseIterable {
    case earn   // Points added to balance
    case spend  // Points deducted from balance

    var displayName: String {
        switch self {
        case .earn: return "Earned"
        case .spend: return "Spent"
        }
    }

    var icon: String {
        switch self {
        case .earn: return "plus.circle.fill"
        case .spend: return "minus.circle.fill"
        }
    }

    var color: String {
        switch self {
        case .earn: return "green"
        case .spend: return "orange"
        }
    }
}

/// Category of points transaction for grouping and display
enum TransactionCategory: String, Codable, CaseIterable {
    case workout        // Completed a workout
    case restDay        // Completed rest-day check-in
    case streakFreeze   // Used streak freeze to restore streak
    case shopPurchase   // Purchased item from shop (Phase 07.2)
    case adReward       // Watched rewarded ad (Post-MVP)

    var displayName: String {
        switch self {
        case .workout: return "Workout"
        case .restDay: return "Rest Day"
        case .streakFreeze: return "Streak Freeze"
        case .shopPurchase: return "Shop Purchase"
        case .adReward: return "Bonus Reward"
        }
    }

    var icon: String {
        switch self {
        case .workout: return "figure.run"
        case .restDay: return "leaf.fill"
        case .streakFreeze: return "snowflake"
        case .shopPurchase: return "bag.fill"
        case .adReward: return "gift.fill"
        }
    }
}

/// A single points transaction record
struct PointsTransaction: Codable, Identifiable, Equatable {
    let id: String              // Unique ID for idempotency
    let type: TransactionType   // Earn or spend
    let category: TransactionCategory
    let amount: Int             // Always positive (type determines +/-)
    let description: String     // Human-readable description
    let timestamp: Date         // When the transaction occurred
    let entityId: String?       // Related entity (workout ID, item ID, etc.)
    let balanceAfter: Int       // Running balance after this transaction

    /// The signed amount (+/-)
    var signedAmount: Int {
        switch type {
        case .earn: return amount
        case .spend: return -amount
        }
    }

    /// Formatted signed amount string (+75 or -100)
    var displayAmount: String {
        switch type {
        case .earn: return "+\(amount)"
        case .spend: return "-\(amount)"
        }
    }

    /// Formatted date for display
    var displayDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: timestamp)
    }

    /// Short date for grouping (e.g., "Feb 6")
    var shortDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: timestamp)
    }

    /// Accessibility label for VoiceOver
    var accessibilityLabel: String {
        let action = type == .earn ? "Earned" : "Spent"
        let dateFormatter = DateFormatter()
        dateFormatter.dateStyle = .long
        let dateString = dateFormatter.string(from: timestamp)
        return "\(action) \(amount) points from \(description) on \(dateString)"
    }

    /// Generate a deterministic transaction ID for idempotency
    static func generateId(category: TransactionCategory, entityId: String?, date: Date) -> String {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.year, .month, .day], from: date)
        let dateString = "\(components.year ?? 0)-\(components.month ?? 0)-\(components.day ?? 0)"
        let entityPart = entityId ?? "none"
        return "\(category.rawValue)_\(entityPart)_\(dateString)"
    }
}

// MARK: - Streak Status

/// Represents the current state of the user's streak
enum StreakStatus: Equatable {
    /// Streak is active and secure - user has checked in today
    case active(days: Int)

    /// Streak is at risk - user hasn't checked in today but still has time
    case atRisk(days: Int)

    /// Streak was broken - missed a day without check-in (will reset on next activity)
    case broken(previousStreak: Int)

    /// No streak history yet
    case none

    /// The display count for the streak
    var displayCount: Int {
        switch self {
        case .active(let days): return days
        case .atRisk(let days): return days
        case .broken: return 0
        case .none: return 0
        }
    }

    /// Whether the streak is currently at risk
    var isAtRisk: Bool {
        if case .atRisk = self { return true }
        return false
    }

    /// Whether the streak was broken
    var isBroken: Bool {
        if case .broken = self { return true }
        return false
    }

    /// Whether the streak is secure (checked in today)
    var isSecure: Bool {
        if case .active = self { return true }
        return false
    }

    /// Friendly message for the streak status
    var statusMessage: String {
        switch self {
        case .active(let days):
            if days == 1 {
                return "Great start! Day 1 secured."
            } else if days >= 7 {
                return "You're on fire! \(days) days strong."
            } else {
                return "Streak secured for today!"
            }
        case .atRisk(let days):
            if days == 0 {
                return "Start your streak with a check-in!"
            } else {
                return "Check in to keep your \(days)-day streak!"
            }
        case .broken(let previous):
            if previous > 0 {
                return "Don't worry! Every day is a fresh start."
            } else {
                return "Ready to start your streak?"
            }
        case .none:
            return "Start your journey today!"
        }
    }

    /// Icon for the streak status
    var icon: String {
        switch self {
        case .active(let days) where days >= 7:
            return "flame.fill"
        case .active:
            return "checkmark.circle.fill"
        case .atRisk:
            return "exclamationmark.triangle.fill"
        case .broken:
            return "arrow.counterclockwise"
        case .none:
            return "sparkles"
        }
    }

    /// Color for the streak status
    var color: String {
        switch self {
        case .active(let days) where days >= 7:
            return "red"
        case .active:
            return "green"
        case .atRisk:
            return "orange"
        case .broken, .none:
            return "gray"
        }
    }
}

// MARK: - Rest-Day Micro-Tasks

/// Types of rest-day activities users can log to maintain streaks
enum RestDayActivity: String, Codable, CaseIterable, Identifiable {
    // Quick interactions with hamster
    case petHamster
    case giveTreat

    // Log positive activities
    case walk
    case stretch
    case journal
    case meditate

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .petHamster: return "Pet Hamster"
        case .giveTreat: return "Give Treat"
        case .walk: return "Went for a Walk"
        case .stretch: return "Did Some Stretching"
        case .journal: return "Journaled"
        case .meditate: return "Meditated"
        }
    }

    var description: String {
        switch self {
        case .petHamster: return "Give your hamster some love"
        case .giveTreat: return "Share a snack with your friend"
        case .walk: return "Any walk counts, even a short one"
        case .stretch: return "A few stretches go a long way"
        case .journal: return "Reflect on your journey"
        case .meditate: return "Take a moment to breathe"
        }
    }

    var icon: String {
        switch self {
        case .petHamster: return "hand.wave.fill"
        case .giveTreat: return "carrot.fill"
        case .walk: return "figure.walk"
        case .stretch: return "figure.flexibility"
        case .journal: return "book.fill"
        case .meditate: return "brain.head.profile.fill"
        }
    }

    /// Whether this is a hamster interaction vs logging an activity
    var isHamsterInteraction: Bool {
        switch self {
        case .petHamster, .giveTreat: return true
        case .walk, .stretch, .journal, .meditate: return false
        }
    }

    /// Points awarded for this activity
    var pointsAwarded: Int {
        switch self {
        case .petHamster: return 10
        case .giveTreat: return 10
        case .walk: return 15
        case .stretch: return 15
        case .journal: return 15
        case .meditate: return 15
        }
    }

    /// Hamster reactions to each activity
    var hamsterReaction: String {
        switch self {
        case .petHamster: return "Ooh, that feels nice! Thanks for the pets!"
        case .giveTreat: return "Yum! You're the best!"
        case .walk: return "I love that you went for a walk! Movement is wonderful."
        case .stretch: return "Stretching is so good for you! I'm proud of you."
        case .journal: return "Taking time to reflect — that's really thoughtful!"
        case .meditate: return "A calm mind is a happy mind. You're doing great!"
        }
    }

    /// Quick interactions (hamster-focused)
    static var quickInteractions: [RestDayActivity] {
        [.petHamster, .giveTreat]
    }

    /// Activities user can log
    static var loggableActivities: [RestDayActivity] {
        [.walk, .stretch, .journal, .meditate]
    }
}

/// Records a rest-day check-in
struct RestDayCheckIn: Codable, Identifiable, Equatable {
    let id: String
    let activity: RestDayActivity
    let completedAt: Date
    let pointsEarned: Int

    var displayDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: completedAt)
    }
}

// MARK: - Workout Feedback

/// Simple feedback for a completed workout
enum WorkoutFeedback: String, Codable, CaseIterable, Equatable {
    case loved      // User loved it - strongly recommend similar
    case liked      // User liked it - continue recommending
    case notForMe   // User didn't enjoy it - avoid recommending

    var displayName: String {
        switch self {
        case .loved: return "Loved It"
        case .liked: return "Liked It"
        case .notForMe: return "Not For Me"
        }
    }

    var icon: String {
        switch self {
        case .loved: return "heart.fill"
        case .liked: return "hand.thumbsup.fill"
        case .notForMe: return "hand.thumbsdown"
        }
    }

    /// Whether this feedback is positive (should boost recommendations)
    var isPositive: Bool {
        switch self {
        case .loved, .liked: return true
        case .notForMe: return false
        }
    }
}

// MARK: - Workout Completion

/// Records a completed workout session
struct WorkoutCompletion: Codable, Identifiable, Equatable {
    let id: String
    let workoutId: String
    let workoutName: String
    let completedAt: Date
    let exercisesCompleted: Int
    let totalExercises: Int
    let durationSeconds: Int
    let pointsEarned: Int
    let wasPartial: Bool  // True if user ended early
    var feedback: WorkoutFeedback?  // Optional user feedback

    var completionPercentage: Double {
        guard totalExercises > 0 else { return 0 }
        return Double(exercisesCompleted) / Double(totalExercises)
    }

    var displayDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: completedAt)
    }

    var displayDuration: String {
        let minutes = durationSeconds / 60
        if minutes < 1 {
            return "\(durationSeconds)s"
        }
        return "\(minutes) min"
    }
}

// MARK: - Hamster State

/// The hamster's current mood/state based on recent activity
enum HamsterState: String, Codable, CaseIterable {
    case hungry         // No activity today, needs attention
    case chillin        // Rested, but waiting for activity
    case happy          // Just completed a workout, fed and content
    case excited        // On a streak, extra happy
    case proud          // Major milestone achieved

    var displayName: String {
        switch self {
        case .hungry: return "Hungry"
        case .chillin: return "Chillin'"
        case .happy: return "Happy"
        case .excited: return "Excited"
        case .proud: return "So Proud"
        }
    }

    var description: String {
        switch self {
        case .hungry: return "I could use some snacks! Let's do a workout together."
        case .chillin: return "I'm just hanging out. Ready when you are!"
        case .happy: return "I'm feeling great! Thanks for the workout."
        case .excited: return "We're on a roll! Keep up the amazing work!"
        case .proud: return "Wow, look at us! I'm so proud of what we've done!"
        }
    }

    var greeting: String {
        switch self {
        case .hungry: return "Hey there! I'm getting a little hungry..."
        case .chillin: return "Hey! I'm just lounging around."
        case .happy: return "Hey! I'm so happy to see you!"
        case .excited: return "Hey!! We're doing amazing!"
        case .proud: return "Look at us! We're unstoppable!"
        }
    }

    var icon: String {
        switch self {
        case .hungry: return "fork.knife.circle"
        case .chillin: return "leaf.circle"
        case .happy: return "heart.circle.fill"
        case .excited: return "star.circle.fill"
        case .proud: return "crown.fill"
        }
    }

    var color: String {
        switch self {
        case .hungry: return "orange"
        case .chillin: return "blue"
        case .happy: return "green"
        case .excited: return "yellow"
        case .proud: return "purple"
        }
    }
}

// MARK: - User Stats

/// Tracks user's points, streak, and activity summary
struct UserStats: Codable, Equatable {
    var totalPoints: Int
    var currentStreak: Int
    var longestStreak: Int
    var totalWorkoutsCompleted: Int
    var lastActivityDate: Date?
    var hamsterState: HamsterState
    var workoutHistory: [WorkoutCompletion]
    /// Stores feedback by workoutId for influencing recommendations
    var workoutFeedback: [String: WorkoutFeedback]
    /// Rest-day check-in history
    var restDayHistory: [RestDayCheckIn]
    /// Total rest-day check-ins completed
    var totalRestDayCheckIns: Int
    /// The date of the last qualifying check-in (workout or rest day)
    /// Used for streak validation - tracks the calendar day of last check-in
    var lastCheckInDate: Date?
    /// Streak that was broken (stored for display purposes until reset)
    var previousBrokenStreak: Int
    /// Points transaction history for wallet transparency (Phase 07.1)
    var transactions: [PointsTransaction]

    // MARK: - Growth Progression (Phase 07.4)

    /// Current hamster growth stage (default: baby)
    var currentGrowthStage: GrowthStage
    /// History of growth milestones achieved
    var growthHistory: [GrowthMilestone]
    /// Pending growth celebration to show (cleared after shown)
    var pendingGrowthCelebration: GrowthMilestone?

    /// Maximum number of transactions to keep (prune oldest when exceeded)
    static let maxTransactionCount = 500

    init(
        totalPoints: Int = 0,
        currentStreak: Int = 0,
        longestStreak: Int = 0,
        totalWorkoutsCompleted: Int = 0,
        lastActivityDate: Date? = nil,
        hamsterState: HamsterState = .chillin,
        workoutHistory: [WorkoutCompletion] = [],
        workoutFeedback: [String: WorkoutFeedback] = [:],
        restDayHistory: [RestDayCheckIn] = [],
        totalRestDayCheckIns: Int = 0,
        lastCheckInDate: Date? = nil,
        previousBrokenStreak: Int = 0,
        transactions: [PointsTransaction] = [],
        currentGrowthStage: GrowthStage = .baby,
        growthHistory: [GrowthMilestone] = [],
        pendingGrowthCelebration: GrowthMilestone? = nil
    ) {
        self.totalPoints = totalPoints
        self.currentStreak = currentStreak
        self.longestStreak = longestStreak
        self.totalWorkoutsCompleted = totalWorkoutsCompleted
        self.lastActivityDate = lastActivityDate
        self.hamsterState = hamsterState
        self.workoutHistory = workoutHistory
        self.workoutFeedback = workoutFeedback
        self.restDayHistory = restDayHistory
        self.totalRestDayCheckIns = totalRestDayCheckIns
        self.lastCheckInDate = lastCheckInDate
        self.previousBrokenStreak = previousBrokenStreak
        self.transactions = transactions
        self.currentGrowthStage = currentGrowthStage
        self.growthHistory = growthHistory
        self.pendingGrowthCelebration = pendingGrowthCelebration
    }

    // MARK: - Growth Helpers (Phase 07.4)

    /// The next growth stage (nil if already at mature)
    var nextGrowthStage: GrowthStage? {
        currentGrowthStage.nextStage
    }

    /// Workouts remaining until next stage (nil if at max)
    var workoutsToNextStage: Int? {
        GrowthConfig.workoutsToNextStage(totalWorkouts: totalWorkoutsCompleted, currentStage: currentGrowthStage)
    }

    /// Streak days remaining until next stage (nil if at max)
    var streakToNextStage: Int? {
        GrowthConfig.streakToNextStage(longestStreak: longestStreak, currentStage: currentGrowthStage)
    }

    /// Progress toward next stage (nil if at max)
    var progressToNextStage: (workouts: Double, streak: Double)? {
        GrowthConfig.progressToNextStage(
            totalWorkouts: totalWorkoutsCompleted,
            longestStreak: longestStreak,
            currentStage: currentGrowthStage
        )
    }

    /// Check if growth should occur and return the new milestone if so
    func checkForGrowth() -> GrowthMilestone? {
        guard let result = GrowthConfig.checkGrowth(
            totalWorkouts: totalWorkoutsCompleted,
            longestStreak: longestStreak,
            currentStage: currentGrowthStage
        ) else {
            return nil
        }

        return GrowthMilestone(
            stage: result.stage,
            achievedAt: Date(),
            triggerType: result.trigger,
            triggerValue: result.value
        )
    }

    /// Record growth and set pending celebration
    mutating func recordGrowth(_ milestone: GrowthMilestone) {
        currentGrowthStage = milestone.stage
        growthHistory.append(milestone)
        pendingGrowthCelebration = milestone
    }

    /// Clear the pending celebration after it's been shown
    mutating func clearPendingGrowthCelebration() {
        pendingGrowthCelebration = nil
    }

    // MARK: - Transaction Management

    /// Add a transaction and update balance
    /// Returns false if transaction ID already exists (idempotent)
    @discardableResult
    mutating func addTransaction(
        id: String,
        type: TransactionType,
        category: TransactionCategory,
        amount: Int,
        description: String,
        entityId: String? = nil
    ) -> Bool {
        // Check for duplicate (idempotency)
        if transactions.contains(where: { $0.id == id }) {
            return false
        }

        // Calculate new balance
        let newBalance: Int
        switch type {
        case .earn:
            newBalance = totalPoints + amount
        case .spend:
            // Prevent negative balance
            guard totalPoints >= amount else { return false }
            newBalance = totalPoints - amount
        }

        // Create transaction
        let transaction = PointsTransaction(
            id: id,
            type: type,
            category: category,
            amount: amount,
            description: description,
            timestamp: Date(),
            entityId: entityId,
            balanceAfter: newBalance
        )

        // Update balance
        totalPoints = newBalance

        // Add transaction
        transactions.insert(transaction, at: 0) // Newest first

        // Prune if needed
        pruneTransactions()

        return true
    }

    /// Prune old transactions if count exceeds maximum
    mutating func pruneTransactions() {
        if transactions.count > Self.maxTransactionCount {
            transactions = Array(transactions.prefix(Self.maxTransactionCount))
        }
    }

    /// Get recent transactions (newest first)
    func recentTransactions(limit: Int = 50) -> [PointsTransaction] {
        Array(transactions.prefix(limit))
    }

    /// Get transactions for a specific category
    func transactions(for category: TransactionCategory) -> [PointsTransaction] {
        transactions.filter { $0.category == category }
    }

    /// Get transactions for a specific date
    func transactions(on date: Date) -> [PointsTransaction] {
        let calendar = Calendar.current
        return transactions.filter { calendar.isDate($0.timestamp, inSameDayAs: date) }
    }

    /// Check if a transaction ID already exists
    func hasTransaction(id: String) -> Bool {
        transactions.contains { $0.id == id }
    }

    /// Get today's transactions
    var todaysTransactions: [PointsTransaction] {
        transactions.filter { Calendar.current.isDateInToday($0.timestamp) }
    }

    /// Points earned today (from transactions)
    var transactionPointsEarnedToday: Int {
        todaysTransactions
            .filter { $0.type == .earn }
            .reduce(0) { $0 + $1.amount }
    }

    /// Points spent today (from transactions)
    var pointsSpentToday: Int {
        todaysTransactions
            .filter { $0.type == .spend }
            .reduce(0) { $0 + $1.amount }
    }

    /// Update feedback for a specific workout
    mutating func setFeedback(_ feedback: WorkoutFeedback, for workoutId: String) {
        workoutFeedback[workoutId] = feedback
    }

    /// Get feedback for a specific workout
    func getFeedback(for workoutId: String) -> WorkoutFeedback? {
        workoutFeedback[workoutId]
    }

    /// Get all workouts marked as "not for me"
    var dislikedWorkoutIds: Set<String> {
        Set(workoutFeedback.filter { $0.value == .notForMe }.keys)
    }

    /// Get all workouts marked as loved
    var lovedWorkoutIds: Set<String> {
        Set(workoutFeedback.filter { $0.value == .loved }.keys)
    }

    /// Whether the user has completed a workout today
    var hasCompletedWorkoutToday: Bool {
        guard let lastDate = lastActivityDate else { return false }
        return Calendar.current.isDateInToday(lastDate) && todaysCompletions.count > 0
    }

    /// Alias for backward compatibility
    var hasCompletedToday: Bool {
        hasCompletedWorkoutToday
    }

    /// Whether the user has done a rest-day check-in today
    var hasRestDayCheckInToday: Bool {
        restDayHistory.contains { Calendar.current.isDateInToday($0.completedAt) }
    }

    /// Whether the user has any check-in today (workout or rest day)
    var hasAnyCheckInToday: Bool {
        hasCompletedWorkoutToday || hasRestDayCheckInToday
    }

    /// Today's rest-day check-in, if any
    var todaysRestDayCheckIn: RestDayCheckIn? {
        restDayHistory.first { Calendar.current.isDateInToday($0.completedAt) }
    }

    /// Get today's completions
    var todaysCompletions: [WorkoutCompletion] {
        workoutHistory.filter { Calendar.current.isDateInToday($0.completedAt) }
    }

    /// Points earned today
    var pointsEarnedToday: Int {
        todaysCompletions.reduce(0) { $0 + $1.pointsEarned }
    }

    /// Recent completions (last 7 days)
    var recentCompletions: [WorkoutCompletion] {
        let weekAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date()) ?? Date()
        return workoutHistory.filter { $0.completedAt >= weekAgo }
    }

    // MARK: - Streak Status Calculation

    /// Calculate the current streak status based on check-in history
    /// Uses the device's current calendar/timezone for day boundaries
    func calculateStreakStatus() -> StreakStatus {
        let calendar = Calendar.current

        // No activity ever - brand new user
        guard let lastCheckIn = lastCheckInDate ?? lastActivityDate else {
            return .none
        }

        // Checked in today - streak is active and secure
        if calendar.isDateInToday(lastCheckIn) {
            return .active(days: currentStreak)
        }

        // Checked in yesterday - streak is at risk (can still be saved today)
        if calendar.isDateInYesterday(lastCheckIn) {
            return .atRisk(days: currentStreak)
        }

        // More than one day gap - streak is broken
        // The previousBrokenStreak shows what they lost
        return .broken(previousStreak: previousBrokenStreak > 0 ? previousBrokenStreak : currentStreak)
    }

    /// Whether the streak should be considered broken (missed more than 1 day)
    var isStreakBroken: Bool {
        let calendar = Calendar.current
        guard let lastCheckIn = lastCheckInDate ?? lastActivityDate else {
            return false // No streak to break
        }

        // If checked in today or yesterday, streak is not broken
        return !calendar.isDateInToday(lastCheckIn) && !calendar.isDateInYesterday(lastCheckIn)
    }

    /// The effective streak count (0 if broken, otherwise currentStreak)
    var effectiveStreak: Int {
        isStreakBroken ? 0 : currentStreak
    }

    /// Days since last check-in (for UI messaging)
    var daysSinceLastCheckIn: Int? {
        guard let lastCheckIn = lastCheckInDate ?? lastActivityDate else {
            return nil
        }
        let calendar = Calendar.current
        let startOfToday = calendar.startOfDay(for: Date())
        let startOfLastCheckIn = calendar.startOfDay(for: lastCheckIn)
        return calendar.dateComponents([.day], from: startOfLastCheckIn, to: startOfToday).day
    }

    // MARK: - Streak Freeze Helpers

    /// Whether the user can restore their broken streak
    /// - Must have a previous broken streak to restore
    /// - Must have enough points to pay the cost
    /// - Must not have already checked in today (which would start a new streak)
    var canRestoreStreak: Bool {
        guard previousBrokenStreak > 0 else { return false }
        guard totalPoints >= PointsConfig.streakFreezeCost else { return false }
        guard !hasAnyCheckInToday else { return false }
        return true
    }

    /// Whether the user has a broken streak that could potentially be restored
    /// (regardless of whether they have enough points)
    var hasBrokenStreakToRestore: Bool {
        previousBrokenStreak > 0 && !hasAnyCheckInToday
    }

    /// Whether the user has enough points to restore their streak
    var hasEnoughPointsToRestore: Bool {
        totalPoints >= PointsConfig.streakFreezeCost
    }
}

// MARK: - Streak Freeze

/// Result of a streak restore attempt
struct StreakRestoreResult: Equatable {
    let success: Bool
    let restoredStreak: Int
    let pointsSpent: Int
    let message: String

    /// Hamster reaction to the restore
    var hamsterReaction: String {
        if success {
            if restoredStreak >= 7 {
                return "Phew! That was close! Your amazing \(restoredStreak)-day streak is back!"
            } else if restoredStreak >= 3 {
                return "Yay! I saved your streak! Let's keep going together!"
            } else {
                return "Streak restored! I've got your back, friend."
            }
        } else {
            return "That's okay! We can start fresh together. I believe in you!"
        }
    }
}

// MARK: - Points Constants

/// Points calculation constants
enum PointsConfig {
    /// Base points for completing a workout
    static let baseWorkoutPoints = 50

    /// Bonus points per exercise completed
    static let pointsPerExercise = 5

    /// Cost to restore a broken streak (streak freeze)
    static let streakFreezeCost = 100

    /// Streak multiplier brackets
    static func streakMultiplier(for streak: Int) -> Double {
        switch streak {
        case 0...2: return 1.0
        case 3...6: return 1.25
        case 7...13: return 1.5
        case 14...29: return 1.75
        default: return 2.0  // 30+ days
        }
    }

    /// Partial completion penalty (applies when ending early)
    static let partialCompletionMultiplier = 0.5

    /// Calculate points for a workout completion
    static func calculatePoints(
        exercisesCompleted: Int,
        totalExercises: Int,
        currentStreak: Int,
        wasPartial: Bool
    ) -> Int {
        var points = Double(baseWorkoutPoints)

        // Add per-exercise bonus
        points += Double(exercisesCompleted * pointsPerExercise)

        // Apply streak multiplier
        points *= streakMultiplier(for: currentStreak)

        // Apply partial completion penalty if ended early
        if wasPartial {
            points *= partialCompletionMultiplier
        }

        return Int(points.rounded())
    }

    /// Calculate points for a rest-day check-in
    static func calculateRestDayPoints(
        activity: RestDayActivity,
        currentStreak: Int
    ) -> Int {
        // Base points from the activity itself
        var points = Double(activity.pointsAwarded)

        // Apply streak multiplier (same as workouts but capped at 1.5x for rest days)
        let multiplier = min(streakMultiplier(for: currentStreak), 1.5)
        points *= multiplier

        return Int(points.rounded())
    }
}

// MARK: - UserStats Persistence

extension UserStats {
    /// UserDefaults key format for user stats
    static func storageKey(for userId: String) -> String {
        "userStats_\(userId)"
    }

    /// Save to UserDefaults with proper error logging
    func save(for userId: String) {
        PersistenceHelper.save(self, forKey: Self.storageKey(for: userId), context: "UserStats for \(userId)")
    }

    /// Load from UserDefaults with proper error logging
    static func load(for userId: String) -> UserStats? {
        PersistenceHelper.load(UserStats.self, forKey: storageKey(for: userId), context: "UserStats for \(userId)")
    }

    /// Clear saved stats
    static func clear(for userId: String) {
        PersistenceHelper.remove(forKey: storageKey(for: userId), context: "UserStats for \(userId)")
    }
}
