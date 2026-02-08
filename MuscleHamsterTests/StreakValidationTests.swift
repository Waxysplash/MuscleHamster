//
//  StreakValidationTests.swift
//  MuscleHamsterTests
//
//  Unit tests for streak validation logic
//  Phase: Internal Testing & Polish
//

import XCTest
@testable import MuscleHamster

final class StreakValidationTests: XCTestCase {

    // MARK: - Streak Status Tests

    func testCalculateStreakStatus_NoActivity_ReturnsNone() {
        let stats = UserStats()

        let status = stats.calculateStreakStatus()

        if case .none = status {
            // Expected
        } else {
            XCTFail("Expected .none status, got \(status)")
        }
    }

    func testCalculateStreakStatus_CheckedInToday_ReturnsActive() {
        var stats = UserStats()
        stats.currentStreak = 5
        stats.lastCheckInDate = Date()  // Today

        let status = stats.calculateStreakStatus()

        if case .active(let days) = status {
            XCTAssertEqual(days, 5)
        } else {
            XCTFail("Expected .active status, got \(status)")
        }
    }

    func testCalculateStreakStatus_CheckedInYesterday_ReturnsAtRisk() {
        var stats = UserStats()
        stats.currentStreak = 3
        stats.lastCheckInDate = Calendar.current.date(byAdding: .day, value: -1, to: Date())

        let status = stats.calculateStreakStatus()

        if case .atRisk(let days) = status {
            XCTAssertEqual(days, 3)
        } else {
            XCTFail("Expected .atRisk status, got \(status)")
        }
    }

    func testCalculateStreakStatus_MissedMoreThanOneDay_ReturnsBroken() {
        var stats = UserStats()
        stats.currentStreak = 10
        stats.previousBrokenStreak = 10
        stats.lastCheckInDate = Calendar.current.date(byAdding: .day, value: -3, to: Date())

        let status = stats.calculateStreakStatus()

        if case .broken(let previousStreak) = status {
            XCTAssertEqual(previousStreak, 10)
        } else {
            XCTFail("Expected .broken status, got \(status)")
        }
    }

    // MARK: - Is Streak Broken Tests

    func testIsStreakBroken_NoActivity_ReturnsFalse() {
        let stats = UserStats()
        XCTAssertFalse(stats.isStreakBroken)
    }

    func testIsStreakBroken_CheckedInToday_ReturnsFalse() {
        var stats = UserStats()
        stats.lastCheckInDate = Date()
        XCTAssertFalse(stats.isStreakBroken)
    }

    func testIsStreakBroken_CheckedInYesterday_ReturnsFalse() {
        var stats = UserStats()
        stats.lastCheckInDate = Calendar.current.date(byAdding: .day, value: -1, to: Date())
        XCTAssertFalse(stats.isStreakBroken)
    }

    func testIsStreakBroken_MissedTwoDays_ReturnsTrue() {
        var stats = UserStats()
        stats.lastCheckInDate = Calendar.current.date(byAdding: .day, value: -2, to: Date())
        XCTAssertTrue(stats.isStreakBroken)
    }

    // MARK: - Effective Streak Tests

    func testEffectiveStreak_NotBroken_ReturnsCurrentStreak() {
        var stats = UserStats()
        stats.currentStreak = 7
        stats.lastCheckInDate = Date()

        XCTAssertEqual(stats.effectiveStreak, 7)
    }

    func testEffectiveStreak_Broken_ReturnsZero() {
        var stats = UserStats()
        stats.currentStreak = 7
        stats.lastCheckInDate = Calendar.current.date(byAdding: .day, value: -5, to: Date())

        XCTAssertEqual(stats.effectiveStreak, 0)
    }

    // MARK: - Days Since Last Check-In Tests

    func testDaysSinceLastCheckIn_NoActivity_ReturnsNil() {
        let stats = UserStats()
        XCTAssertNil(stats.daysSinceLastCheckIn)
    }

    func testDaysSinceLastCheckIn_Today_ReturnsZero() {
        var stats = UserStats()
        stats.lastCheckInDate = Date()

        XCTAssertEqual(stats.daysSinceLastCheckIn, 0)
    }

    func testDaysSinceLastCheckIn_Yesterday_ReturnsOne() {
        var stats = UserStats()
        stats.lastCheckInDate = Calendar.current.date(byAdding: .day, value: -1, to: Date())

        XCTAssertEqual(stats.daysSinceLastCheckIn, 1)
    }

    func testDaysSinceLastCheckIn_FiveDaysAgo_ReturnsFive() {
        var stats = UserStats()
        stats.lastCheckInDate = Calendar.current.date(byAdding: .day, value: -5, to: Date())

        XCTAssertEqual(stats.daysSinceLastCheckIn, 5)
    }

    // MARK: - Streak Freeze Tests

    func testCanRestoreStreak_NoPreviousStreak_ReturnsFalse() {
        var stats = UserStats()
        stats.totalPoints = 200
        stats.previousBrokenStreak = 0

        XCTAssertFalse(stats.canRestoreStreak)
    }

    func testCanRestoreStreak_NotEnoughPoints_ReturnsFalse() {
        var stats = UserStats()
        stats.totalPoints = 50  // Less than 100
        stats.previousBrokenStreak = 5

        XCTAssertFalse(stats.canRestoreStreak)
    }

    func testCanRestoreStreak_AlreadyCheckedInToday_ReturnsFalse() {
        var stats = UserStats()
        stats.totalPoints = 200
        stats.previousBrokenStreak = 5
        stats.lastCheckInDate = Date()  // Checked in today

        XCTAssertFalse(stats.canRestoreStreak)
    }

    func testCanRestoreStreak_AllConditionsMet_ReturnsTrue() {
        var stats = UserStats()
        stats.totalPoints = 200
        stats.previousBrokenStreak = 5
        stats.lastCheckInDate = Calendar.current.date(byAdding: .day, value: -2, to: Date())

        XCTAssertTrue(stats.canRestoreStreak)
    }

    func testHasBrokenStreakToRestore_WithPreviousStreak_ReturnsTrue() {
        var stats = UserStats()
        stats.previousBrokenStreak = 5
        stats.lastCheckInDate = Calendar.current.date(byAdding: .day, value: -2, to: Date())

        XCTAssertTrue(stats.hasBrokenStreakToRestore)
    }

    func testHasEnoughPointsToRestore_EnoughPoints_ReturnsTrue() {
        var stats = UserStats()
        stats.totalPoints = 100

        XCTAssertTrue(stats.hasEnoughPointsToRestore)
    }

    func testHasEnoughPointsToRestore_NotEnoughPoints_ReturnsFalse() {
        var stats = UserStats()
        stats.totalPoints = 99

        XCTAssertFalse(stats.hasEnoughPointsToRestore)
    }

    // MARK: - Streak Status Properties Tests

    func testStreakStatus_IsAtRisk() {
        let atRisk = StreakStatus.atRisk(days: 5)
        XCTAssertTrue(atRisk.isAtRisk)
        XCTAssertFalse(atRisk.isBroken)
        XCTAssertFalse(atRisk.isSecure)
    }

    func testStreakStatus_IsBroken() {
        let broken = StreakStatus.broken(previousStreak: 10)
        XCTAssertFalse(broken.isAtRisk)
        XCTAssertTrue(broken.isBroken)
        XCTAssertFalse(broken.isSecure)
    }

    func testStreakStatus_IsSecure() {
        let active = StreakStatus.active(days: 7)
        XCTAssertFalse(active.isAtRisk)
        XCTAssertFalse(active.isBroken)
        XCTAssertTrue(active.isSecure)
    }

    func testStreakStatus_DisplayCount() {
        XCTAssertEqual(StreakStatus.active(days: 5).displayCount, 5)
        XCTAssertEqual(StreakStatus.atRisk(days: 3).displayCount, 3)
        XCTAssertEqual(StreakStatus.broken(previousStreak: 10).displayCount, 0)
        XCTAssertEqual(StreakStatus.none.displayCount, 0)
    }
}
