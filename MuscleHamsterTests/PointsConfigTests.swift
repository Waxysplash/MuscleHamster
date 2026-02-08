//
//  PointsConfigTests.swift
//  MuscleHamsterTests
//
//  Unit tests for points calculation logic
//  Phase: Internal Testing & Polish
//

import XCTest
@testable import MuscleHamster

final class PointsConfigTests: XCTestCase {

    // MARK: - Streak Multiplier Tests

    func testStreakMultiplier_NoStreak_Returns1x() {
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 0), 1.0)
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 1), 1.0)
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 2), 1.0)
    }

    func testStreakMultiplier_3To6Days_Returns1_25x() {
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 3), 1.25)
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 4), 1.25)
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 5), 1.25)
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 6), 1.25)
    }

    func testStreakMultiplier_7To13Days_Returns1_5x() {
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 7), 1.5)
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 10), 1.5)
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 13), 1.5)
    }

    func testStreakMultiplier_14To29Days_Returns1_75x() {
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 14), 1.75)
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 20), 1.75)
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 29), 1.75)
    }

    func testStreakMultiplier_30PlusDays_Returns2x() {
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 30), 2.0)
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 50), 2.0)
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 100), 2.0)
        XCTAssertEqual(PointsConfig.streakMultiplier(for: 365), 2.0)
    }

    // MARK: - Workout Points Calculation Tests

    func testCalculatePoints_BaseWorkout_NoStreak() {
        // Base: 50 + (5 exercises * 5 points each) = 75 points
        // No streak multiplier (1.0x)
        let points = PointsConfig.calculatePoints(
            exercisesCompleted: 5,
            totalExercises: 5,
            currentStreak: 0,
            wasPartial: false
        )
        XCTAssertEqual(points, 75)
    }

    func testCalculatePoints_WithStreak() {
        // Base: 50 + (5 * 5) = 75
        // 7-day streak = 1.5x multiplier
        // 75 * 1.5 = 112.5 → 113 (rounded)
        let points = PointsConfig.calculatePoints(
            exercisesCompleted: 5,
            totalExercises: 5,
            currentStreak: 7,
            wasPartial: false
        )
        XCTAssertEqual(points, 113)
    }

    func testCalculatePoints_PartialCompletion() {
        // Base: 50 + (3 * 5) = 65
        // 1.0x multiplier (no streak)
        // 0.5x partial penalty
        // 65 * 1.0 * 0.5 = 32.5 → 33 (rounded)
        let points = PointsConfig.calculatePoints(
            exercisesCompleted: 3,
            totalExercises: 5,
            currentStreak: 0,
            wasPartial: true
        )
        XCTAssertEqual(points, 33)
    }

    func testCalculatePoints_PartialWithStreak() {
        // Base: 50 + (4 * 5) = 70
        // 14-day streak = 1.75x
        // 70 * 1.75 = 122.5
        // 0.5x partial = 61.25 → 61 (rounded)
        let points = PointsConfig.calculatePoints(
            exercisesCompleted: 4,
            totalExercises: 6,
            currentStreak: 14,
            wasPartial: true
        )
        XCTAssertEqual(points, 61)
    }

    func testCalculatePoints_ZeroExercises() {
        // Edge case: 0 exercises
        // Base: 50 + 0 = 50
        let points = PointsConfig.calculatePoints(
            exercisesCompleted: 0,
            totalExercises: 5,
            currentStreak: 0,
            wasPartial: false
        )
        XCTAssertEqual(points, 50)
    }

    func testCalculatePoints_MaxStreak() {
        // Long streak: 100 days = 2.0x
        // Base: 50 + (10 * 5) = 100
        // 100 * 2.0 = 200
        let points = PointsConfig.calculatePoints(
            exercisesCompleted: 10,
            totalExercises: 10,
            currentStreak: 100,
            wasPartial: false
        )
        XCTAssertEqual(points, 200)
    }

    // MARK: - Rest Day Points Calculation Tests

    func testCalculateRestDayPoints_PetHamster_NoStreak() {
        let points = PointsConfig.calculateRestDayPoints(
            activity: .petHamster,
            currentStreak: 0
        )
        // 10 points * 1.0x = 10
        XCTAssertEqual(points, 10)
    }

    func testCalculateRestDayPoints_Walk_WithStreak() {
        let points = PointsConfig.calculateRestDayPoints(
            activity: .walk,
            currentStreak: 7
        )
        // 15 points * 1.5x = 22.5 → 23
        XCTAssertEqual(points, 23)
    }

    func testCalculateRestDayPoints_CappedAt1_5x() {
        // Rest day multiplier is capped at 1.5x
        let points = PointsConfig.calculateRestDayPoints(
            activity: .meditate,
            currentStreak: 30  // Would be 2.0x for workouts, but capped at 1.5x for rest days
        )
        // 15 points * 1.5x (capped) = 22.5 → 23
        XCTAssertEqual(points, 23)
    }

    // MARK: - Constants Tests

    func testConstants() {
        XCTAssertEqual(PointsConfig.baseWorkoutPoints, 50)
        XCTAssertEqual(PointsConfig.pointsPerExercise, 5)
        XCTAssertEqual(PointsConfig.streakFreezeCost, 100)
        XCTAssertEqual(PointsConfig.partialCompletionMultiplier, 0.5)
    }
}
