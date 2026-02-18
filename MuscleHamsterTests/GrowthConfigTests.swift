//
//  GrowthConfigTests.swift
//  MuscleHamsterTests
//
//  Unit tests for hamster growth progression logic
//  Phase: Internal Testing & Polish
//

import XCTest
@testable import MuscleHamster

final class GrowthConfigTests: XCTestCase {

    // MARK: - Threshold Constants Tests

    func testThresholds_Juvenile() {
        XCTAssertEqual(GrowthConfig.juvenileWorkouts, 5)
        XCTAssertEqual(GrowthConfig.juvenileStreak, 7)
    }

    func testThresholds_Adult() {
        XCTAssertEqual(GrowthConfig.adultWorkouts, 25)
        XCTAssertEqual(GrowthConfig.adultStreak, 21)
    }

    func testThresholds_Mature() {
        XCTAssertEqual(GrowthConfig.matureWorkouts, 75)
        XCTAssertEqual(GrowthConfig.matureStreak, 60)
    }

    // MARK: - Required Workouts Tests

    func testRequiredWorkouts_ForBaby_ReturnsNil() {
        XCTAssertNil(GrowthConfig.requiredWorkouts(for: .baby))
    }

    func testRequiredWorkouts_ForJuvenile_Returns5() {
        XCTAssertEqual(GrowthConfig.requiredWorkouts(for: .juvenile), 5)
    }

    func testRequiredWorkouts_ForAdult_Returns25() {
        XCTAssertEqual(GrowthConfig.requiredWorkouts(for: .adult), 25)
    }

    func testRequiredWorkouts_ForMature_Returns75() {
        XCTAssertEqual(GrowthConfig.requiredWorkouts(for: .mature), 75)
    }

    // MARK: - Required Streak Tests

    func testRequiredStreak_ForBaby_ReturnsNil() {
        XCTAssertNil(GrowthConfig.requiredStreak(for: .baby))
    }

    func testRequiredStreak_ForJuvenile_Returns7() {
        XCTAssertEqual(GrowthConfig.requiredStreak(for: .juvenile), 7)
    }

    func testRequiredStreak_ForAdult_Returns21() {
        XCTAssertEqual(GrowthConfig.requiredStreak(for: .adult), 21)
    }

    func testRequiredStreak_ForMature_Returns60() {
        XCTAssertEqual(GrowthConfig.requiredStreak(for: .mature), 60)
    }

    // MARK: - Check Growth Tests

    func testCheckGrowth_BabyWithEnoughWorkouts_ReturnsJuvenile() {
        let result = GrowthConfig.checkGrowth(
            totalWorkouts: 5,
            longestStreak: 0,
            currentStage: .baby
        )

        XCTAssertNotNil(result)
        XCTAssertEqual(result?.stage, .juvenile)
        XCTAssertEqual(result?.trigger, .workouts)
        XCTAssertEqual(result?.value, 5)
    }

    func testCheckGrowth_BabyWithEnoughStreak_ReturnsJuvenile() {
        let result = GrowthConfig.checkGrowth(
            totalWorkouts: 0,
            longestStreak: 7,
            currentStage: .baby
        )

        XCTAssertNotNil(result)
        XCTAssertEqual(result?.stage, .juvenile)
        XCTAssertEqual(result?.trigger, .streak)
        XCTAssertEqual(result?.value, 7)
    }

    func testCheckGrowth_BabyWithBothConditions_ReturnsWorkoutTrigger() {
        // When both conditions are met, workouts takes precedence
        let result = GrowthConfig.checkGrowth(
            totalWorkouts: 10,
            longestStreak: 10,
            currentStage: .baby
        )

        XCTAssertNotNil(result)
        XCTAssertEqual(result?.stage, .juvenile)
        XCTAssertEqual(result?.trigger, .workouts)
    }

    func testCheckGrowth_BabyNotReady_ReturnsNil() {
        let result = GrowthConfig.checkGrowth(
            totalWorkouts: 3,
            longestStreak: 5,
            currentStage: .baby
        )

        XCTAssertNil(result)
    }

    func testCheckGrowth_JuvenileToAdult_ViaWorkouts() {
        let result = GrowthConfig.checkGrowth(
            totalWorkouts: 25,
            longestStreak: 10,
            currentStage: .juvenile
        )

        XCTAssertNotNil(result)
        XCTAssertEqual(result?.stage, .adult)
        XCTAssertEqual(result?.trigger, .workouts)
    }

    func testCheckGrowth_JuvenileToAdult_ViaStreak() {
        let result = GrowthConfig.checkGrowth(
            totalWorkouts: 10,
            longestStreak: 21,
            currentStage: .juvenile
        )

        XCTAssertNotNil(result)
        XCTAssertEqual(result?.stage, .adult)
        XCTAssertEqual(result?.trigger, .streak)
    }

    func testCheckGrowth_AdultToMature_ViaWorkouts() {
        let result = GrowthConfig.checkGrowth(
            totalWorkouts: 75,
            longestStreak: 30,
            currentStage: .adult
        )

        XCTAssertNotNil(result)
        XCTAssertEqual(result?.stage, .mature)
        XCTAssertEqual(result?.trigger, .workouts)
    }

    func testCheckGrowth_AdultToMature_ViaStreak() {
        let result = GrowthConfig.checkGrowth(
            totalWorkouts: 50,
            longestStreak: 60,
            currentStage: .adult
        )

        XCTAssertNotNil(result)
        XCTAssertEqual(result?.stage, .mature)
        XCTAssertEqual(result?.trigger, .streak)
    }

    func testCheckGrowth_MatureStage_ReturnsNil() {
        // Mature is the max stage - no further growth possible
        let result = GrowthConfig.checkGrowth(
            totalWorkouts: 500,
            longestStreak: 365,
            currentStage: .mature
        )

        XCTAssertNil(result)
    }

    // MARK: - Progress Calculation Tests

    func testProgressToNextStage_Baby() {
        let progress = GrowthConfig.progressToNextStage(
            totalWorkouts: 3,
            longestStreak: 4,
            currentStage: .baby
        )

        XCTAssertNotNil(progress)
        XCTAssertEqual(progress?.workouts, 3.0 / 5.0, accuracy: 0.001)  // 60%
        XCTAssertEqual(progress?.streak, 4.0 / 7.0, accuracy: 0.001)    // ~57%
    }

    func testProgressToNextStage_CapsAt100Percent() {
        let progress = GrowthConfig.progressToNextStage(
            totalWorkouts: 10,  // More than required
            longestStreak: 10,  // More than required
            currentStage: .baby
        )

        XCTAssertNotNil(progress)
        XCTAssertEqual(progress?.workouts, 1.0, accuracy: 0.001)  // Capped at 100%
        XCTAssertEqual(progress?.streak, 1.0, accuracy: 0.001)    // Capped at 100%
    }

    func testProgressToNextStage_Mature_ReturnsNil() {
        let progress = GrowthConfig.progressToNextStage(
            totalWorkouts: 100,
            longestStreak: 100,
            currentStage: .mature
        )

        XCTAssertNil(progress)
    }

    // MARK: - Workouts To Next Stage Tests

    func testWorkoutsToNextStage_Baby() {
        let remaining = GrowthConfig.workoutsToNextStage(
            totalWorkouts: 3,
            currentStage: .baby
        )
        XCTAssertEqual(remaining, 2)  // Need 5, have 3
    }

    func testWorkoutsToNextStage_AlreadyMet() {
        let remaining = GrowthConfig.workoutsToNextStage(
            totalWorkouts: 10,
            currentStage: .baby
        )
        XCTAssertEqual(remaining, 0)  // Already exceeded threshold
    }

    func testWorkoutsToNextStage_Mature() {
        let remaining = GrowthConfig.workoutsToNextStage(
            totalWorkouts: 100,
            currentStage: .mature
        )
        XCTAssertNil(remaining)  // No next stage
    }

    // MARK: - Streak To Next Stage Tests

    func testStreakToNextStage_Juvenile() {
        let remaining = GrowthConfig.streakToNextStage(
            longestStreak: 15,
            currentStage: .juvenile
        )
        XCTAssertEqual(remaining, 6)  // Need 21, have 15
    }

    func testStreakToNextStage_AlreadyMet() {
        let remaining = GrowthConfig.streakToNextStage(
            longestStreak: 25,
            currentStage: .juvenile
        )
        XCTAssertEqual(remaining, 0)  // Already exceeded threshold
    }
}
