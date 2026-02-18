//
//  WorkoutServiceProtocol.swift
//  MuscleHamster
//
//  Protocol defining workout catalog operations
//

import Foundation

protocol WorkoutServiceProtocol {
    /// Fetch all available workouts
    /// - Returns: Array of all workouts in the catalog
    /// - Throws: WorkoutError if fetch fails
    func getAllWorkouts() async throws -> [Workout]

    /// Fetch workouts filtered by criteria
    /// - Parameters:
    ///   - difficulty: Filter by difficulty level (optional)
    ///   - duration: Filter by duration bucket (optional)
    ///   - fitnessGoals: Filter by fitness goals - matches any overlap (optional)
    ///   - bodyFocus: Filter by body focus areas - matches any overlap (optional)
    ///   - category: Filter by workout type (optional)
    /// - Returns: Array of workouts matching all specified criteria
    /// - Throws: WorkoutError if fetch fails
    func getWorkouts(
        difficulty: FitnessLevel?,
        duration: DurationBucket?,
        fitnessGoals: Set<FitnessGoal>?,
        bodyFocus: Set<BodyFocus>?,
        category: WorkoutType?
    ) async throws -> [Workout]

    /// Fetch a single workout by ID
    /// - Parameter id: The workout's unique identifier
    /// - Returns: The workout if found, nil otherwise
    /// - Throws: WorkoutError if fetch fails
    func getWorkout(by id: String) async throws -> Workout?

    /// Get recommended workouts based on user profile
    /// - Parameters:
    ///   - profile: User's profile with fitness preferences
    ///   - limit: Maximum number of workouts to return
    /// - Returns: Array of recommended workouts, sorted by relevance
    /// - Throws: WorkoutError if fetch fails
    func getRecommendedWorkouts(for profile: UserProfile, limit: Int) async throws -> [Workout]

    /// Get recommended workouts with explanations based on user profile
    /// - Parameters:
    ///   - profile: User's profile with fitness preferences
    ///   - recentWorkoutIds: IDs of recently completed workouts (to avoid repetition)
    ///   - recentBodyFocus: Body areas recently worked (to encourage rotation)
    ///   - dislikedWorkoutIds: IDs of workouts the user has marked as "not for me"
    ///   - lovedWorkoutIds: IDs of workouts the user has marked as "loved"
    ///   - limit: Maximum number of workouts to return
    /// - Returns: Array of recommended workouts with plain-language explanations
    /// - Throws: WorkoutError if fetch fails
    func getRecommendedWorkoutsWithExplanations(
        for profile: UserProfile,
        recentWorkoutIds: Set<String>,
        recentBodyFocus: Set<BodyFocus>,
        dislikedWorkoutIds: Set<String>,
        lovedWorkoutIds: Set<String>,
        limit: Int
    ) async throws -> [RecommendedWorkout]

    /// Get workouts for a specific category
    /// - Parameter category: The workout type to filter by
    /// - Returns: Array of workouts in the specified category
    /// - Throws: WorkoutError if fetch fails
    func getWorkouts(by category: WorkoutType) async throws -> [Workout]

    /// Search workouts by name or description
    /// - Parameter query: Search query string
    /// - Returns: Array of workouts matching the query
    /// - Throws: WorkoutError if search fails
    func searchWorkouts(query: String) async throws -> [Workout]
}
