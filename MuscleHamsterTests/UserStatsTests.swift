//
//  UserStatsTests.swift
//  MuscleHamsterTests
//
//  Unit tests for UserStats model including transactions and persistence
//  Phase: Internal Testing & Polish
//

import XCTest
@testable import MuscleHamster

final class UserStatsTests: XCTestCase {

    // MARK: - Transaction Tests

    func testAddTransaction_Earn_IncreasesBalance() {
        var stats = UserStats()
        stats.totalPoints = 100

        let result = stats.addTransaction(
            id: "test_1",
            type: .earn,
            category: .workout,
            amount: 50,
            description: "Completed workout"
        )

        XCTAssertTrue(result)
        XCTAssertEqual(stats.totalPoints, 150)
        XCTAssertEqual(stats.transactions.count, 1)
        XCTAssertEqual(stats.transactions.first?.balanceAfter, 150)
    }

    func testAddTransaction_Spend_DecreasesBalance() {
        var stats = UserStats()
        stats.totalPoints = 100

        let result = stats.addTransaction(
            id: "test_1",
            type: .spend,
            category: .shopPurchase,
            amount: 30,
            description: "Bought item"
        )

        XCTAssertTrue(result)
        XCTAssertEqual(stats.totalPoints, 70)
        XCTAssertEqual(stats.transactions.first?.balanceAfter, 70)
    }

    func testAddTransaction_Spend_InsufficientFunds_Fails() {
        var stats = UserStats()
        stats.totalPoints = 50

        let result = stats.addTransaction(
            id: "test_1",
            type: .spend,
            category: .shopPurchase,
            amount: 100,
            description: "Expensive item"
        )

        XCTAssertFalse(result)
        XCTAssertEqual(stats.totalPoints, 50)  // Unchanged
        XCTAssertEqual(stats.transactions.count, 0)
    }

    func testAddTransaction_DuplicateId_Rejected() {
        var stats = UserStats()
        stats.totalPoints = 100

        // First transaction
        let result1 = stats.addTransaction(
            id: "duplicate_id",
            type: .earn,
            category: .workout,
            amount: 50,
            description: "First"
        )

        // Duplicate transaction (same ID)
        let result2 = stats.addTransaction(
            id: "duplicate_id",
            type: .earn,
            category: .workout,
            amount: 50,
            description: "Duplicate"
        )

        XCTAssertTrue(result1)
        XCTAssertFalse(result2)
        XCTAssertEqual(stats.totalPoints, 150)  // Only first applied
        XCTAssertEqual(stats.transactions.count, 1)
    }

    func testHasTransaction_Exists_ReturnsTrue() {
        var stats = UserStats()
        _ = stats.addTransaction(
            id: "test_id",
            type: .earn,
            category: .workout,
            amount: 50,
            description: "Test"
        )

        XCTAssertTrue(stats.hasTransaction(id: "test_id"))
    }

    func testHasTransaction_NotExists_ReturnsFalse() {
        let stats = UserStats()
        XCTAssertFalse(stats.hasTransaction(id: "nonexistent"))
    }

    // MARK: - Transaction Pruning Tests

    func testPruneTransactions_UnderLimit_NoChange() {
        var stats = UserStats()

        for i in 0..<10 {
            _ = stats.addTransaction(
                id: "tx_\(i)",
                type: .earn,
                category: .workout,
                amount: 10,
                description: "Transaction \(i)"
            )
        }

        XCTAssertEqual(stats.transactions.count, 10)
    }

    // MARK: - Recent Transactions Tests

    func testRecentTransactions_ReturnsLimited() {
        var stats = UserStats()

        for i in 0..<100 {
            _ = stats.addTransaction(
                id: "tx_\(i)",
                type: .earn,
                category: .workout,
                amount: 10,
                description: "Transaction \(i)"
            )
        }

        let recent = stats.recentTransactions(limit: 10)
        XCTAssertEqual(recent.count, 10)
    }

    func testTransactions_ForCategory_FiltersCorrectly() {
        var stats = UserStats()

        _ = stats.addTransaction(id: "w1", type: .earn, category: .workout, amount: 50, description: "Workout 1")
        _ = stats.addTransaction(id: "r1", type: .earn, category: .restDay, amount: 15, description: "Rest day")
        _ = stats.addTransaction(id: "w2", type: .earn, category: .workout, amount: 50, description: "Workout 2")
        _ = stats.addTransaction(id: "s1", type: .spend, category: .shopPurchase, amount: 30, description: "Shop")

        let workoutTransactions = stats.transactions(for: .workout)
        XCTAssertEqual(workoutTransactions.count, 2)

        let shopTransactions = stats.transactions(for: .shopPurchase)
        XCTAssertEqual(shopTransactions.count, 1)
    }

    // MARK: - Today's Transactions Tests

    func testTodaysTransactions_FiltersCorrectly() {
        var stats = UserStats()

        // Add today's transaction
        _ = stats.addTransaction(id: "today", type: .earn, category: .workout, amount: 50, description: "Today")

        XCTAssertEqual(stats.todaysTransactions.count, 1)
        XCTAssertEqual(stats.transactionPointsEarnedToday, 50)
    }

    // MARK: - Workout Feedback Tests

    func testSetFeedback_StoresCorrectly() {
        var stats = UserStats()

        stats.setFeedback(.loved, for: "workout_1")
        stats.setFeedback(.notForMe, for: "workout_2")

        XCTAssertEqual(stats.getFeedback(for: "workout_1"), .loved)
        XCTAssertEqual(stats.getFeedback(for: "workout_2"), .notForMe)
        XCTAssertNil(stats.getFeedback(for: "workout_3"))
    }

    func testDislikedWorkoutIds_ReturnsCorrectSet() {
        var stats = UserStats()

        stats.setFeedback(.loved, for: "w1")
        stats.setFeedback(.notForMe, for: "w2")
        stats.setFeedback(.liked, for: "w3")
        stats.setFeedback(.notForMe, for: "w4")

        let disliked = stats.dislikedWorkoutIds
        XCTAssertEqual(disliked.count, 2)
        XCTAssertTrue(disliked.contains("w2"))
        XCTAssertTrue(disliked.contains("w4"))
    }

    func testLovedWorkoutIds_ReturnsCorrectSet() {
        var stats = UserStats()

        stats.setFeedback(.loved, for: "w1")
        stats.setFeedback(.notForMe, for: "w2")
        stats.setFeedback(.loved, for: "w3")

        let loved = stats.lovedWorkoutIds
        XCTAssertEqual(loved.count, 2)
        XCTAssertTrue(loved.contains("w1"))
        XCTAssertTrue(loved.contains("w3"))
    }

    // MARK: - Growth Helpers Tests

    func testCheckForGrowth_ReturnsNilWhenNotReady() {
        let stats = UserStats()
        XCTAssertNil(stats.checkForGrowth())
    }

    func testCheckForGrowth_ReturnsMilestoneWhenReady() {
        var stats = UserStats()
        stats.totalWorkoutsCompleted = 5
        stats.currentGrowthStage = .baby

        let milestone = stats.checkForGrowth()

        XCTAssertNotNil(milestone)
        XCTAssertEqual(milestone?.stage, .juvenile)
    }

    func testRecordGrowth_UpdatesStageAndHistory() {
        var stats = UserStats()
        stats.currentGrowthStage = .baby

        let milestone = GrowthMilestone(
            stage: .juvenile,
            achievedAt: Date(),
            triggerType: .workouts,
            triggerValue: 5
        )

        stats.recordGrowth(milestone)

        XCTAssertEqual(stats.currentGrowthStage, .juvenile)
        XCTAssertEqual(stats.growthHistory.count, 1)
        XCTAssertNotNil(stats.pendingGrowthCelebration)
    }

    func testClearPendingGrowthCelebration() {
        var stats = UserStats()
        stats.pendingGrowthCelebration = GrowthMilestone(
            stage: .juvenile,
            achievedAt: Date(),
            triggerType: .workouts,
            triggerValue: 5
        )

        stats.clearPendingGrowthCelebration()

        XCTAssertNil(stats.pendingGrowthCelebration)
    }

    // MARK: - Check-In Status Tests

    func testHasCompletedWorkoutToday_NoWorkouts_ReturnsFalse() {
        let stats = UserStats()
        XCTAssertFalse(stats.hasCompletedWorkoutToday)
    }

    func testHasRestDayCheckInToday_NoCheckIns_ReturnsFalse() {
        let stats = UserStats()
        XCTAssertFalse(stats.hasRestDayCheckInToday)
    }

    func testHasAnyCheckInToday_NoActivity_ReturnsFalse() {
        let stats = UserStats()
        XCTAssertFalse(stats.hasAnyCheckInToday)
    }

    // MARK: - Next Growth Stage Tests

    func testNextGrowthStage_Baby_ReturnsJuvenile() {
        var stats = UserStats()
        stats.currentGrowthStage = .baby
        XCTAssertEqual(stats.nextGrowthStage, .juvenile)
    }

    func testNextGrowthStage_Mature_ReturnsNil() {
        var stats = UserStats()
        stats.currentGrowthStage = .mature
        XCTAssertNil(stats.nextGrowthStage)
    }
}
