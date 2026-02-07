//
//  MockWorkoutService.swift
//  MuscleHamster
//
//  In-memory workout service with seed catalog for MVP development and testing
//

import Foundation

actor MockWorkoutService: WorkoutServiceProtocol {
    // Seed catalog stored in-memory
    private let workouts: [Workout]

    // Simulated network delay range (seconds)
    private let minDelay: Double = 0.3
    private let maxDelay: Double = 0.8

    init() {
        self.workouts = Self.seedCatalog()
    }

    // MARK: - WorkoutServiceProtocol

    func getAllWorkouts() async throws -> [Workout] {
        try await simulateNetworkDelay()
        return workouts
    }

    func getWorkouts(
        difficulty: FitnessLevel?,
        duration: DurationBucket?,
        fitnessGoals: Set<FitnessGoal>?,
        bodyFocus: Set<BodyFocus>?,
        category: WorkoutType?
    ) async throws -> [Workout] {
        try await simulateNetworkDelay()

        var filtered = workouts

        if let difficulty = difficulty {
            filtered = filtered.filter { $0.difficulty == difficulty }
        }

        if let duration = duration {
            filtered = filtered.filter { $0.duration == duration }
        }

        if let goals = fitnessGoals, !goals.isEmpty {
            filtered = filtered.filter { workout in
                !workout.fitnessGoals.isDisjoint(with: goals)
            }
        }

        if let bodyFocus = bodyFocus, !bodyFocus.isEmpty {
            filtered = filtered.filter { workout in
                !workout.bodyFocus.isDisjoint(with: bodyFocus)
            }
        }

        if let category = category {
            filtered = filtered.filter { $0.category == category }
        }

        return filtered
    }

    func getWorkout(by id: String) async throws -> Workout? {
        try await simulateNetworkDelay()
        return workouts.first { $0.id == id }
    }

    func getRecommendedWorkouts(for profile: UserProfile, limit: Int) async throws -> [Workout] {
        let recommendations = try await getRecommendedWorkoutsWithExplanations(
            for: profile,
            recentWorkoutIds: [],
            recentBodyFocus: [],
            dislikedWorkoutIds: [],
            lovedWorkoutIds: [],
            limit: limit
        )
        return recommendations.map { $0.workout }
    }

    func getRecommendedWorkoutsWithExplanations(
        for profile: UserProfile,
        recentWorkoutIds: Set<String>,
        recentBodyFocus: Set<BodyFocus>,
        dislikedWorkoutIds: Set<String>,
        lovedWorkoutIds: Set<String>,
        limit: Int
    ) async throws -> [RecommendedWorkout] {
        try await simulateNetworkDelay()

        // Start with all workouts and score them
        var scoredWorkouts: [(workout: Workout, score: Int, reasons: [String])] = []

        for workout in workouts {
            var score = 0
            var reasons: [String] = []

            // 1. Fitness Level Match (highest weight - 30 points)
            if let userLevel = profile.fitnessLevel {
                if workout.difficulty == userLevel {
                    score += 30
                    reasons.append("Matches your \(userLevel.displayName.lowercased()) level")
                } else {
                    // Penalty for mismatched difficulty (reduces chance of appearing)
                    score -= 20
                }
            }

            // 2. Fitness Goals Match (up to 25 points)
            if !profile.fitnessGoals.isEmpty {
                let matchingGoals = workout.fitnessGoals.intersection(profile.fitnessGoals)
                if !matchingGoals.isEmpty {
                    score += matchingGoals.count * 10
                    let goalNames = matchingGoals.map { $0.displayName }.sorted()
                    if matchingGoals.count == 1 {
                        reasons.append("Supports your \(goalNames[0].lowercased()) goal")
                    } else {
                        reasons.append("Aligns with your fitness goals")
                    }
                }
            }

            // 3. Fitness Intent Consideration (up to 15 points)
            if let intent = profile.fitnessIntent {
                switch intent {
                case .improvement:
                    // Prefer longer, more challenging workouts
                    if workout.duration.approximateMinutes >= 25 {
                        score += 10
                        reasons.append("Helps push your limits")
                    } else if workout.duration.approximateMinutes >= 15 {
                        score += 5
                    }
                case .maintenance:
                    // Prefer moderate duration workouts
                    if workout.duration == .short || workout.duration == .medium {
                        score += 10
                        reasons.append("Great for staying consistent")
                    }
                }
            }

            // 4. Avoid Recently Completed Workouts (penalty of -25 points)
            if recentWorkoutIds.contains(workout.id) {
                score -= 25
                // No reason added - we just deprioritize silently
            }

            // 5. Rotate Body Focus (up to 15 points for fresh areas)
            if !recentBodyFocus.isEmpty {
                let freshAreas = workout.bodyFocus.subtracting(recentBodyFocus)
                if !freshAreas.isEmpty && workout.bodyFocus.isDisjoint(with: recentBodyFocus) {
                    score += 15
                    let areaName = freshAreas.first?.displayName ?? "different muscles"
                    reasons.append("Works \(areaName.lowercased()) for variety")
                } else if !freshAreas.isEmpty {
                    score += 8
                }
            }

            // 6. Equipment-free bonus for beginners (5 points)
            if profile.fitnessLevel == .beginner && workout.isEquipmentFree {
                score += 5
                if !reasons.contains(where: { $0.lowercased().contains("equipment") }) {
                    reasons.append("No equipment needed")
                }
            }

            // 7. User feedback consideration
            // Strong penalty for disliked workouts (-50 points, effectively removes from recommendations)
            if dislikedWorkoutIds.contains(workout.id) {
                score -= 50
                // No reason added - we quietly deprioritize
            }

            // Bonus for loved workouts (+20 points) - user explicitly enjoyed this
            if lovedWorkoutIds.contains(workout.id) {
                score += 20
                reasons.append("One of your favorites!")
            }

            scoredWorkouts.append((workout, score, reasons))
        }

        // Sort by score (highest first), with stable secondary sort by name
        scoredWorkouts.sort { lhs, rhs in
            if lhs.score != rhs.score {
                return lhs.score > rhs.score
            }
            return lhs.workout.name < rhs.workout.name
        }

        // Take top results and build RecommendedWorkout with explanations
        let topResults = scoredWorkouts.prefix(limit)

        // If we have too few positive-scored results, include fallbacks
        var recommendations: [RecommendedWorkout] = []

        for item in topResults {
            // Build a friendly explanation
            let explanation = buildExplanation(reasons: item.reasons, profile: profile)
            recommendations.append(RecommendedWorkout(
                workout: item.workout,
                explanation: explanation,
                relevanceScore: item.score
            ))
        }

        // Fallback: if no recommendations, provide beginner-friendly options
        if recommendations.isEmpty {
            let fallbacks = try await getFallbackWorkouts(limit: limit)
            for workout in fallbacks {
                recommendations.append(RecommendedWorkout(
                    workout: workout,
                    explanation: "A great place to start!",
                    relevanceScore: 0
                ))
            }
        }

        return recommendations
    }

    /// Builds a friendly, hamster-toned explanation from the reasons
    private func buildExplanation(reasons: [String], profile: UserProfile) -> String {
        // If no specific reasons, provide a generic encouraging message
        guard !reasons.isEmpty else {
            return "A great workout to try!"
        }

        // Use the most relevant reason (first one captures the main match)
        // Keep it concise for card display
        if reasons.count == 1 {
            return reasons[0]
        }

        // Combine top 2 reasons with friendly connector
        return "\(reasons[0]). \(reasons[1])."
    }

    func getWorkouts(by category: WorkoutType) async throws -> [Workout] {
        try await simulateNetworkDelay()
        return workouts.filter { $0.category == category }
    }

    func searchWorkouts(query: String) async throws -> [Workout] {
        try await simulateNetworkDelay()
        let lowercased = query.lowercased()
        return workouts.filter { workout in
            workout.name.lowercased().contains(lowercased) ||
            workout.description.lowercased().contains(lowercased)
        }
    }

    // MARK: - Helpers

    private func simulateNetworkDelay() async throws {
        let delay = Double.random(in: minDelay...maxDelay)
        try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
    }

    /// Returns fallback workouts when filters produce empty results
    func getFallbackWorkouts(limit: Int) async throws -> [Workout] {
        // Return beginner-friendly, equipment-free workouts
        let fallbacks = workouts.filter {
            $0.difficulty == .beginner && $0.isEquipmentFree
        }
        return Array(fallbacks.shuffled().prefix(limit))
    }

    /// Check if catalog has workouts matching criteria
    func hasWorkouts(difficulty: FitnessLevel?, category: WorkoutType?) async -> Bool {
        if let difficulty = difficulty, let category = category {
            return workouts.contains { $0.difficulty == difficulty && $0.category == category }
        } else if let difficulty = difficulty {
            return workouts.contains { $0.difficulty == difficulty }
        } else if let category = category {
            return workouts.contains { $0.category == category }
        }
        return !workouts.isEmpty
    }

    // MARK: - Seed Catalog

    private static func seedCatalog() -> [Workout] {
        [
            // BEGINNER WORKOUTS (8)
            Workout(
                name: "Beginner Full Body Basics",
                description: "A gentle introduction to full-body movement with simple exercises",
                difficulty: .beginner,
                duration: .short,
                fitnessGoals: [.generalFitness],
                bodyFocus: [.fullBody],
                category: .strength,
                exercises: generateBeginnerStrengthExercises(),
                equipmentRequired: [.none]
            ),
            Workout(
                name: "Morning Wake-Up Stretch",
                description: "Start your day with gentle stretches to improve flexibility",
                difficulty: .beginner,
                duration: .quick,
                fitnessGoals: [.flexibility],
                bodyFocus: [.fullBody],
                category: .flexibility,
                exercises: generateQuickStretchExercises(),
                equipmentRequired: [.yogaMat]
            ),
            Workout(
                name: "Beginner Cardio Dance",
                description: "Fun, low-impact cardio moves to get your heart pumping",
                difficulty: .beginner,
                duration: .medium,
                fitnessGoals: [.cardio, .fatLoss],
                bodyFocus: [.fullBody],
                category: .cardio,
                exercises: generateBeginnerCardioExercises(),
                equipmentRequired: [.none]
            ),
            Workout(
                name: "Core Foundations",
                description: "Build a strong core with beginner-friendly exercises",
                difficulty: .beginner,
                duration: .short,
                fitnessGoals: [.muscleGain, .generalFitness],
                bodyFocus: [.core],
                category: .strength,
                exercises: generateBeginnerCoreExercises(),
                equipmentRequired: [.yogaMat]
            ),
            Workout(
                name: "Gentle Yoga Flow",
                description: "Relax and stretch with basic yoga poses",
                difficulty: .beginner,
                duration: .medium,
                fitnessGoals: [.flexibility, .generalFitness],
                bodyFocus: [.fullBody],
                category: .yoga,
                exercises: generateBeginnerYogaExercises(),
                equipmentRequired: [.yogaMat]
            ),
            Workout(
                name: "Upper Body Introduction",
                description: "Strengthen your arms, chest, and back with simple movements",
                difficulty: .beginner,
                duration: .short,
                fitnessGoals: [.muscleGain],
                bodyFocus: [.upperBody, .arms, .chest],
                category: .strength,
                exercises: generateBeginnerUpperBodyExercises(),
                equipmentRequired: [.none]
            ),
            Workout(
                name: "Lower Body Basics",
                description: "Build leg strength with squats and lunges",
                difficulty: .beginner,
                duration: .short,
                fitnessGoals: [.muscleGain, .generalFitness],
                bodyFocus: [.lowerBody, .legs, .glutes],
                category: .strength,
                exercises: generateBeginnerLowerBodyExercises(),
                equipmentRequired: [.none]
            ),
            Workout(
                name: "Beginner HIIT Intro",
                description: "Low-impact intervals to build endurance",
                difficulty: .beginner,
                duration: .short,
                fitnessGoals: [.cardio, .fatLoss],
                bodyFocus: [.fullBody],
                category: .hiit,
                exercises: generateBeginnerHIITExercises(),
                equipmentRequired: [.none]
            ),

            // INTERMEDIATE WORKOUTS (8)
            Workout(
                name: "Intermediate Strength Circuit",
                description: "Full-body strength training with compound movements",
                difficulty: .intermediate,
                duration: .medium,
                fitnessGoals: [.muscleGain, .generalFitness],
                bodyFocus: [.fullBody],
                category: .circuit,
                exercises: generateIntermediateCircuitExercises(),
                equipmentRequired: [.dumbbells]
            ),
            Workout(
                name: "Cardio Blast",
                description: "High-energy cardio workout for endurance",
                difficulty: .intermediate,
                duration: .medium,
                fitnessGoals: [.cardio, .fatLoss],
                bodyFocus: [.fullBody],
                category: .cardio,
                exercises: generateIntermediateCardioExercises(),
                equipmentRequired: [.jumpRope]
            ),
            Workout(
                name: "Core Power",
                description: "Intensive core workout for strength and stability",
                difficulty: .intermediate,
                duration: .short,
                fitnessGoals: [.muscleGain],
                bodyFocus: [.core],
                category: .strength,
                exercises: generateIntermediateCoreExercises(),
                equipmentRequired: [.yogaMat]
            ),
            Workout(
                name: "Upper Body Sculpt",
                description: "Build defined arms, shoulders, and back",
                difficulty: .intermediate,
                duration: .long,
                fitnessGoals: [.muscleGain],
                bodyFocus: [.upperBody, .arms, .shoulders, .back],
                category: .strength,
                exercises: generateIntermediateUpperBodyExercises(),
                equipmentRequired: [.dumbbells]
            ),
            Workout(
                name: "Leg Day Challenge",
                description: "Build powerful legs with progressive exercises",
                difficulty: .intermediate,
                duration: .long,
                fitnessGoals: [.muscleGain],
                bodyFocus: [.lowerBody, .legs, .glutes],
                category: .strength,
                exercises: generateIntermediateLegExercises(),
                equipmentRequired: [.dumbbells]
            ),
            Workout(
                name: "Intermediate HIIT Burn",
                description: "Challenging intervals for maximum fat burn",
                difficulty: .intermediate,
                duration: .medium,
                fitnessGoals: [.fatLoss, .cardio],
                bodyFocus: [.fullBody],
                category: .hiit,
                exercises: generateIntermediateHIITExercises(),
                equipmentRequired: [.none]
            ),
            Workout(
                name: "Pilates Core Focus",
                description: "Strengthen your core with controlled movements",
                difficulty: .intermediate,
                duration: .medium,
                fitnessGoals: [.muscleGain, .flexibility],
                bodyFocus: [.core, .fullBody],
                category: .pilates,
                exercises: generateIntermediatePilatesExercises(),
                equipmentRequired: [.yogaMat]
            ),
            Workout(
                name: "Mobility Flow",
                description: "Improve joint mobility and movement quality",
                difficulty: .intermediate,
                duration: .short,
                fitnessGoals: [.flexibility, .generalFitness],
                bodyFocus: [.fullBody],
                category: .mobility,
                exercises: generateIntermediateMobilityExercises(),
                equipmentRequired: [.none]
            ),

            // ADVANCED WORKOUTS (8)
            Workout(
                name: "Advanced Full Body Crusher",
                description: "Intense full-body workout for experienced athletes",
                difficulty: .advanced,
                duration: .long,
                fitnessGoals: [.muscleGain, .generalFitness],
                bodyFocus: [.fullBody],
                category: .strength,
                exercises: generateAdvancedStrengthExercises(),
                equipmentRequired: [.dumbbells, .kettlebell]
            ),
            Workout(
                name: "Extreme HIIT",
                description: "Maximum intensity intervals for peak performance",
                difficulty: .advanced,
                duration: .medium,
                fitnessGoals: [.fatLoss, .cardio],
                bodyFocus: [.fullBody],
                category: .hiit,
                exercises: generateAdvancedHIITExercises(),
                equipmentRequired: [.none]
            ),
            Workout(
                name: "Upper Body Power",
                description: "Advanced upper body strength and power training",
                difficulty: .advanced,
                duration: .extended,
                fitnessGoals: [.muscleGain],
                bodyFocus: [.upperBody, .chest, .back, .shoulders, .arms],
                category: .strength,
                exercises: generateAdvancedUpperBodyExercises(),
                equipmentRequired: [.dumbbells, .pullUpBar]
            ),
            Workout(
                name: "Advanced Leg Destroyer",
                description: "Challenging leg workout for serious gains",
                difficulty: .advanced,
                duration: .extended,
                fitnessGoals: [.muscleGain],
                bodyFocus: [.lowerBody, .legs, .glutes],
                category: .strength,
                exercises: generateAdvancedLegExercises(),
                equipmentRequired: [.dumbbells, .kettlebell]
            ),
            Workout(
                name: "Cardio Endurance Challenge",
                description: "Extended cardio session for serious endurance",
                difficulty: .advanced,
                duration: .extended,
                fitnessGoals: [.cardio],
                bodyFocus: [.fullBody],
                category: .cardio,
                exercises: generateAdvancedCardioExercises(),
                equipmentRequired: [.jumpRope]
            ),
            Workout(
                name: "Advanced Yoga Practice",
                description: "Challenging yoga poses for flexibility and strength",
                difficulty: .advanced,
                duration: .long,
                fitnessGoals: [.flexibility, .muscleGain],
                bodyFocus: [.fullBody],
                category: .yoga,
                exercises: generateAdvancedYogaExercises(),
                equipmentRequired: [.yogaMat]
            ),
            Workout(
                name: "Circuit Training Extreme",
                description: "Advanced circuit combining strength and cardio",
                difficulty: .advanced,
                duration: .long,
                fitnessGoals: [.muscleGain, .cardio, .fatLoss],
                bodyFocus: [.fullBody],
                category: .circuit,
                exercises: generateAdvancedCircuitExercises(),
                equipmentRequired: [.dumbbells, .kettlebell]
            ),
            Workout(
                name: "Quick Power Burn",
                description: "Intense quick workout for busy schedules",
                difficulty: .advanced,
                duration: .quick,
                fitnessGoals: [.fatLoss, .generalFitness],
                bodyFocus: [.fullBody],
                category: .hiit,
                exercises: generateQuickPowerExercises(),
                equipmentRequired: [.none]
            ),
        ]
    }

    // MARK: - Exercise Generators

    // Beginner exercises
    private static func generateBeginnerStrengthExercises() -> [Exercise] {
        [
            Exercise(name: "Warm Up", instructions: "March in place, swing your arms gently", duration: 60, type: .warmup),
            Exercise(name: "Bodyweight Squats", instructions: "Feet shoulder-width apart, lower down like sitting in a chair", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Take a breather, you're doing great!", duration: 20, type: .rest),
            Exercise(name: "Wall Push-ups", instructions: "Hands on wall, lower chest toward wall and push back", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Shake out your arms", duration: 20, type: .rest),
            Exercise(name: "Lunges", instructions: "Step forward, lower back knee toward ground", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Almost there!", duration: 20, type: .rest),
            Exercise(name: "Plank Hold", instructions: "Hold a straight line from head to heels", duration: 30, type: .work),
            Exercise(name: "Cool Down", instructions: "Gentle stretches and deep breaths", duration: 60, type: .cooldown),
        ]
    }

    private static func generateQuickStretchExercises() -> [Exercise] {
        [
            Exercise(name: "Neck Rolls", instructions: "Slowly roll your head in circles", duration: 30, type: .warmup),
            Exercise(name: "Shoulder Rolls", instructions: "Roll shoulders forward and backward", duration: 30, type: .work),
            Exercise(name: "Side Stretch", instructions: "Reach one arm overhead and lean to the side", duration: 45, type: .work),
            Exercise(name: "Forward Fold", instructions: "Bend forward from hips, let arms hang", duration: 45, type: .work),
            Exercise(name: "Quad Stretch", instructions: "Hold one foot behind you, balance on the other", duration: 45, type: .work),
            Exercise(name: "Deep Breaths", instructions: "Close your eyes and take 5 deep breaths", duration: 30, type: .cooldown),
        ]
    }

    private static func generateBeginnerCardioExercises() -> [Exercise] {
        [
            Exercise(name: "March in Place", instructions: "Lift those knees and swing your arms", duration: 60, type: .warmup),
            Exercise(name: "Side Steps", instructions: "Step side to side with some bounce", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Keep moving gently", duration: 20, type: .rest),
            Exercise(name: "Arm Circles", instructions: "Big circles with your arms while stepping", duration: 45, type: .work),
            Exercise(name: "Grapevine", instructions: "Step side, cross behind, step side, tap", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Catch your breath", duration: 20, type: .rest),
            Exercise(name: "Knee Lifts", instructions: "Lift knees to waist height alternating", duration: 45, type: .work),
            Exercise(name: "Cool Down March", instructions: "Slow march and deep breaths", duration: 60, type: .cooldown),
        ]
    }

    private static func generateBeginnerCoreExercises() -> [Exercise] {
        [
            Exercise(name: "Cat-Cow Stretch", instructions: "On all fours, arch and round your back", duration: 45, type: .warmup),
            Exercise(name: "Dead Bug", instructions: "Lie on back, extend opposite arm and leg", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Relax your core", duration: 15, type: .rest),
            Exercise(name: "Bird Dog", instructions: "On all fours, extend opposite arm and leg", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "You're doing amazing!", duration: 15, type: .rest),
            Exercise(name: "Glute Bridge", instructions: "Lie on back, lift hips to ceiling", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Almost done!", duration: 15, type: .rest),
            Exercise(name: "Modified Plank", instructions: "Forearms and knees on ground, hold straight", duration: 30, type: .work),
            Exercise(name: "Child's Pose", instructions: "Sit back on heels, arms extended forward", duration: 45, type: .cooldown),
        ]
    }

    private static func generateBeginnerYogaExercises() -> [Exercise] {
        [
            Exercise(name: "Easy Seated Pose", instructions: "Sit cross-legged, lengthen your spine", duration: 60, type: .warmup),
            Exercise(name: "Cat-Cow Flow", instructions: "Flow between arching and rounding back", duration: 60, type: .work),
            Exercise(name: "Downward Dog", instructions: "Form an inverted V with your body", duration: 45, type: .work),
            Exercise(name: "Warrior I", instructions: "Lunge with arms reaching overhead", duration: 45, type: .work),
            Exercise(name: "Warrior II", instructions: "Open hips, arms extended to sides", duration: 45, type: .work),
            Exercise(name: "Tree Pose", instructions: "Balance on one foot, other foot on calf", duration: 45, type: .work),
            Exercise(name: "Child's Pose", instructions: "Rest and breathe deeply", duration: 60, type: .work),
            Exercise(name: "Savasana", instructions: "Lie flat, close eyes, relax completely", duration: 90, type: .cooldown),
        ]
    }

    private static func generateBeginnerUpperBodyExercises() -> [Exercise] {
        [
            Exercise(name: "Arm Circles", instructions: "Small to large circles with arms extended", duration: 45, type: .warmup),
            Exercise(name: "Wall Push-ups", instructions: "Push away from wall, 10 reps", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Shake out your arms", duration: 20, type: .rest),
            Exercise(name: "Tricep Dips", instructions: "Use a chair, lower and raise yourself", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Great work!", duration: 20, type: .rest),
            Exercise(name: "Superman Hold", instructions: "Lie on stomach, lift arms and legs", duration: 30, type: .work),
            Exercise(name: "Rest", instructions: "Almost there!", duration: 15, type: .rest),
            Exercise(name: "Arm Pulses", instructions: "Arms out to sides, small pulses up", duration: 30, type: .work),
            Exercise(name: "Shoulder Stretch", instructions: "Cross arm across chest and hold", duration: 45, type: .cooldown),
        ]
    }

    private static func generateBeginnerLowerBodyExercises() -> [Exercise] {
        [
            Exercise(name: "Leg Swings", instructions: "Hold wall, swing leg forward and back", duration: 45, type: .warmup),
            Exercise(name: "Squats", instructions: "Sit back into squat, return to standing", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Shake out your legs", duration: 20, type: .rest),
            Exercise(name: "Lunges", instructions: "Alternate stepping forward into lunge", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Halfway there!", duration: 20, type: .rest),
            Exercise(name: "Calf Raises", instructions: "Rise up on toes, lower slowly", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "You've got this!", duration: 15, type: .rest),
            Exercise(name: "Glute Bridges", instructions: "Lie on back, lift hips up", duration: 40, type: .work),
            Exercise(name: "Quad Stretch", instructions: "Hold each foot behind you for 20 sec", duration: 45, type: .cooldown),
        ]
    }

    private static func generateBeginnerHIITExercises() -> [Exercise] {
        [
            Exercise(name: "March in Place", instructions: "Get your heart rate up gently", duration: 45, type: .warmup),
            Exercise(name: "Jumping Jacks", instructions: "Low impact option: step side to side", duration: 30, type: .work),
            Exercise(name: "Rest", instructions: "Breathe!", duration: 20, type: .rest),
            Exercise(name: "High Knees", instructions: "March with high knees, arms pumping", duration: 30, type: .work),
            Exercise(name: "Rest", instructions: "You're doing great!", duration: 20, type: .rest),
            Exercise(name: "Squat Pulses", instructions: "Hold squat, pulse up and down", duration: 30, type: .work),
            Exercise(name: "Rest", instructions: "Almost done!", duration: 20, type: .rest),
            Exercise(name: "Standing Crunches", instructions: "Bring knee to opposite elbow", duration: 30, type: .work),
            Exercise(name: "Cool Down Walk", instructions: "Walk in place, slow breathing", duration: 45, type: .cooldown),
        ]
    }

    // Intermediate exercises
    private static func generateIntermediateCircuitExercises() -> [Exercise] {
        [
            Exercise(name: "Dynamic Warm-up", instructions: "Jumping jacks, high knees, arm swings", duration: 90, type: .warmup),
            Exercise(name: "Dumbbell Squats", instructions: "Hold dumbbells at shoulders, squat deep", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Keep moving", duration: 15, type: .rest),
            Exercise(name: "Push-ups", instructions: "Full push-ups, chest to ground", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Shake it out", duration: 15, type: .rest),
            Exercise(name: "Dumbbell Rows", instructions: "Bend over, row weights to hips", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Halfway point!", duration: 20, type: .rest),
            Exercise(name: "Lunges with Weights", instructions: "Hold dumbbells, alternate lunges", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Push through!", duration: 15, type: .rest),
            Exercise(name: "Plank", instructions: "Hold solid plank position", duration: 45, type: .work),
            Exercise(name: "Cool Down Stretch", instructions: "Full body stretch sequence", duration: 90, type: .cooldown),
        ]
    }

    private static func generateIntermediateCardioExercises() -> [Exercise] {
        [
            Exercise(name: "Jump Rope Warm-up", instructions: "Easy jumps to warm up", duration: 60, type: .warmup),
            Exercise(name: "Jump Rope Fast", instructions: "Pick up the pace!", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Catch your breath", duration: 30, type: .rest),
            Exercise(name: "High Knees", instructions: "Drive knees up fast", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Keep moving", duration: 20, type: .rest),
            Exercise(name: "Jump Rope Intervals", instructions: "30 sec fast, 30 sec slow", duration: 90, type: .work),
            Exercise(name: "Rest", instructions: "You're crushing it!", duration: 30, type: .rest),
            Exercise(name: "Burpees", instructions: "Down, jump back, push-up, jump up", duration: 45, type: .work),
            Exercise(name: "Cool Down", instructions: "Slow walk and stretches", duration: 60, type: .cooldown),
        ]
    }

    private static func generateIntermediateCoreExercises() -> [Exercise] {
        [
            Exercise(name: "Plank Warm-up", instructions: "Hold a light plank to activate", duration: 30, type: .warmup),
            Exercise(name: "Bicycle Crunches", instructions: "Elbow to opposite knee, alternating", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Breathe deep", duration: 15, type: .rest),
            Exercise(name: "Russian Twists", instructions: "Seated, rotate side to side", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Stay focused", duration: 15, type: .rest),
            Exercise(name: "Leg Raises", instructions: "Lie flat, raise legs to ceiling", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Almost there!", duration: 15, type: .rest),
            Exercise(name: "Plank with Shoulder Taps", instructions: "Tap opposite shoulder while planking", duration: 40, type: .work),
            Exercise(name: "Child's Pose", instructions: "Relax and stretch your back", duration: 45, type: .cooldown),
        ]
    }

    private static func generateIntermediateUpperBodyExercises() -> [Exercise] {
        [
            Exercise(name: "Arm Swings", instructions: "Dynamic arm warm-up", duration: 60, type: .warmup),
            Exercise(name: "Dumbbell Press", instructions: "Lie on back, press weights up", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Set up for rows", duration: 20, type: .rest),
            Exercise(name: "Bent Over Rows", instructions: "Hinge at hips, row to chest", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Great form!", duration: 20, type: .rest),
            Exercise(name: "Shoulder Press", instructions: "Press dumbbells overhead", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Stay strong!", duration: 20, type: .rest),
            Exercise(name: "Bicep Curls", instructions: "Curl weights to shoulders", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "One more exercise!", duration: 15, type: .rest),
            Exercise(name: "Tricep Extensions", instructions: "Overhead tricep extensions", duration: 40, type: .work),
            Exercise(name: "Stretch", instructions: "Arm and shoulder stretches", duration: 60, type: .cooldown),
        ]
    }

    private static func generateIntermediateLegExercises() -> [Exercise] {
        [
            Exercise(name: "Leg Swings", instructions: "Dynamic leg warm-up", duration: 60, type: .warmup),
            Exercise(name: "Goblet Squats", instructions: "Hold dumbbell at chest, deep squat", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Shake it out", duration: 20, type: .rest),
            Exercise(name: "Romanian Deadlifts", instructions: "Hinge at hips, weights down legs", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Feel the burn!", duration: 20, type: .rest),
            Exercise(name: "Walking Lunges", instructions: "Lunge forward, keep walking", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Halfway there!", duration: 25, type: .rest),
            Exercise(name: "Sumo Squats", instructions: "Wide stance, toes out, squat deep", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Push through!", duration: 20, type: .rest),
            Exercise(name: "Calf Raises", instructions: "Rise up on toes with weight", duration: 40, type: .work),
            Exercise(name: "Leg Stretches", instructions: "Full lower body stretch", duration: 60, type: .cooldown),
        ]
    }

    private static func generateIntermediateHIITExercises() -> [Exercise] {
        [
            Exercise(name: "Dynamic Warm-up", instructions: "Get your heart pumping", duration: 60, type: .warmup),
            Exercise(name: "Burpees", instructions: "Full burpees, maximum effort", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Quick recovery", duration: 20, type: .rest),
            Exercise(name: "Mountain Climbers", instructions: "Drive knees to chest fast", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Breathe!", duration: 20, type: .rest),
            Exercise(name: "Jump Squats", instructions: "Squat down, explode up", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "You've got this!", duration: 20, type: .rest),
            Exercise(name: "High Knees", instructions: "Sprint in place", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Almost done!", duration: 20, type: .rest),
            Exercise(name: "Plank Jacks", instructions: "Plank position, jump feet out and in", duration: 40, type: .work),
            Exercise(name: "Cool Down", instructions: "Walk it out and stretch", duration: 60, type: .cooldown),
        ]
    }

    private static func generateIntermediatePilatesExercises() -> [Exercise] {
        [
            Exercise(name: "Breathing", instructions: "Deep diaphragmatic breaths", duration: 45, type: .warmup),
            Exercise(name: "The Hundred", instructions: "Pump arms while holding crunch", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Relax your neck", duration: 15, type: .rest),
            Exercise(name: "Roll Up", instructions: "Slowly roll up to seated, roll back down", duration: 50, type: .work),
            Exercise(name: "Single Leg Circles", instructions: "Circle one leg at a time", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Stay centered", duration: 15, type: .rest),
            Exercise(name: "Spine Stretch", instructions: "Seated, reach forward over legs", duration: 45, type: .work),
            Exercise(name: "Swimming", instructions: "Prone, flutter arms and legs", duration: 45, type: .work),
            Exercise(name: "Cool Down Stretch", instructions: "Gentle full-body stretch", duration: 60, type: .cooldown),
        ]
    }

    private static func generateIntermediateMobilityExercises() -> [Exercise] {
        [
            Exercise(name: "Neck Circles", instructions: "Slow controlled neck rotations", duration: 30, type: .warmup),
            Exercise(name: "Shoulder Circles", instructions: "Full range shoulder rotations", duration: 40, type: .work),
            Exercise(name: "Thoracic Rotations", instructions: "Rotate upper back side to side", duration: 45, type: .work),
            Exercise(name: "Hip Circles", instructions: "Large circles with each hip", duration: 45, type: .work),
            Exercise(name: "Leg Swings", instructions: "Front to back, side to side", duration: 45, type: .work),
            Exercise(name: "Ankle Circles", instructions: "Rotate ankles in both directions", duration: 30, type: .work),
            Exercise(name: "World's Greatest Stretch", instructions: "Lunge with rotation", duration: 60, type: .work),
            Exercise(name: "Deep Breathing", instructions: "Relax and breathe deeply", duration: 30, type: .cooldown),
        ]
    }

    // Advanced exercises
    private static func generateAdvancedStrengthExercises() -> [Exercise] {
        [
            Exercise(name: "Dynamic Warm-up", instructions: "Full body activation", duration: 90, type: .warmup),
            Exercise(name: "Dumbbell Thrusters", instructions: "Squat to overhead press", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Stay focused", duration: 20, type: .rest),
            Exercise(name: "Renegade Rows", instructions: "Plank position, row alternating", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Keep the intensity", duration: 20, type: .rest),
            Exercise(name: "Kettlebell Swings", instructions: "Hip hinge, swing to shoulder height", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Halfway!", duration: 25, type: .rest),
            Exercise(name: "Bulgarian Split Squats", instructions: "Rear foot elevated, deep lunge", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Push through!", duration: 20, type: .rest),
            Exercise(name: "Devil Press", instructions: "Burpee with dumbbell snatch", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Almost there!", duration: 20, type: .rest),
            Exercise(name: "Plank to Push-up", instructions: "Forearm plank to hand plank", duration: 45, type: .work),
            Exercise(name: "Cool Down", instructions: "Full body stretch", duration: 90, type: .cooldown),
        ]
    }

    private static func generateAdvancedHIITExercises() -> [Exercise] {
        [
            Exercise(name: "Explosive Warm-up", instructions: "High knees, butt kicks, jumps", duration: 60, type: .warmup),
            Exercise(name: "Burpee Box Jumps", instructions: "Burpee into tuck jump", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "15 seconds only!", duration: 15, type: .rest),
            Exercise(name: "Sprint in Place", instructions: "Maximum speed", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Catch your breath", duration: 15, type: .rest),
            Exercise(name: "Plyo Push-ups", instructions: "Push-up with explosive push", duration: 35, type: .work),
            Exercise(name: "Rest", instructions: "Stay strong!", duration: 15, type: .rest),
            Exercise(name: "Jump Lunges", instructions: "Alternate lunges with jumps", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "You've got this!", duration: 15, type: .rest),
            Exercise(name: "Mountain Climber Sprints", instructions: "As fast as possible", duration: 40, type: .work),
            Exercise(name: "Cool Down", instructions: "Walk and stretch", duration: 60, type: .cooldown),
        ]
    }

    private static func generateAdvancedUpperBodyExercises() -> [Exercise] {
        [
            Exercise(name: "Warm-up", instructions: "Arm circles and push-up holds", duration: 90, type: .warmup),
            Exercise(name: "Pull-ups", instructions: "Full range of motion", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Set up for press", duration: 20, type: .rest),
            Exercise(name: "Dumbbell Bench Press", instructions: "Heavy, controlled reps", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Great work!", duration: 25, type: .rest),
            Exercise(name: "Arnold Press", instructions: "Rotate as you press overhead", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Keep pushing!", duration: 20, type: .rest),
            Exercise(name: "Chin-ups", instructions: "Underhand grip, chin over bar", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Almost there!", duration: 25, type: .rest),
            Exercise(name: "Diamond Push-ups", instructions: "Hands close together", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "One more round!", duration: 20, type: .rest),
            Exercise(name: "Dips", instructions: "Parallel bar dips", duration: 40, type: .work),
            Exercise(name: "Stretch", instructions: "Upper body stretches", duration: 90, type: .cooldown),
        ]
    }

    private static func generateAdvancedLegExercises() -> [Exercise] {
        [
            Exercise(name: "Dynamic Leg Warm-up", instructions: "Lunges, swings, high knees", duration: 90, type: .warmup),
            Exercise(name: "Heavy Goblet Squats", instructions: "Deep squats with heavy weight", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Stay focused", duration: 25, type: .rest),
            Exercise(name: "Kettlebell Swings", instructions: "Power from the hips", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Keep the momentum!", duration: 25, type: .rest),
            Exercise(name: "Jump Squats", instructions: "Explosive power", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Halfway point!", duration: 30, type: .rest),
            Exercise(name: "Single Leg Deadlift", instructions: "Balance and strength", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "You're doing amazing!", duration: 25, type: .rest),
            Exercise(name: "Walking Lunges with Weights", instructions: "Heavy dumbbells", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Final push!", duration: 25, type: .rest),
            Exercise(name: "Wall Sit", instructions: "Hold as long as possible", duration: 60, type: .work),
            Exercise(name: "Stretch", instructions: "Deep leg stretches", duration: 90, type: .cooldown),
        ]
    }

    private static func generateAdvancedCardioExercises() -> [Exercise] {
        [
            Exercise(name: "Jump Rope Warm-up", instructions: "Easy pace warm-up", duration: 90, type: .warmup),
            Exercise(name: "Double Unders", instructions: "Rope passes twice per jump", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Quick recovery", duration: 30, type: .rest),
            Exercise(name: "Sprint Intervals", instructions: "30 sec max effort", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Catch your breath", duration: 30, type: .rest),
            Exercise(name: "Burpee Marathon", instructions: "Continuous burpees", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "You're crushing it!", duration: 30, type: .rest),
            Exercise(name: "Jump Rope Fast", instructions: "Maximum speed", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Keep going!", duration: 30, type: .rest),
            Exercise(name: "Mountain Climbers", instructions: "Explosive speed", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Almost done!", duration: 30, type: .rest),
            Exercise(name: "Final Sprint", instructions: "Leave it all out there", duration: 60, type: .work),
            Exercise(name: "Cool Down Walk", instructions: "Walk and recover", duration: 90, type: .cooldown),
        ]
    }

    private static func generateAdvancedYogaExercises() -> [Exercise] {
        [
            Exercise(name: "Sun Salutation", instructions: "Flow through the sequence", duration: 120, type: .warmup),
            Exercise(name: "Crow Pose", instructions: "Balance on hands, knees on arms", duration: 45, type: .work),
            Exercise(name: "Headstand Prep", instructions: "Work toward headstand", duration: 60, type: .work),
            Exercise(name: "Wheel Pose", instructions: "Full back bend from ground", duration: 45, type: .work),
            Exercise(name: "Warrior III", instructions: "Balance with body parallel to ground", duration: 45, type: .work),
            Exercise(name: "Half Moon", instructions: "Balance with side body open", duration: 45, type: .work),
            Exercise(name: "Firefly Pose", instructions: "Advanced arm balance", duration: 45, type: .work),
            Exercise(name: "Pigeon Pose", instructions: "Deep hip opener", duration: 60, type: .work),
            Exercise(name: "Savasana", instructions: "Full relaxation", duration: 120, type: .cooldown),
        ]
    }

    private static func generateAdvancedCircuitExercises() -> [Exercise] {
        [
            Exercise(name: "Dynamic Warm-up", instructions: "Full body activation", duration: 90, type: .warmup),
            Exercise(name: "Thrusters", instructions: "Squat to press with dumbbells", duration: 45, type: .work),
            Exercise(name: "Box Jumps", instructions: "Explosive jumps onto platform", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Quick recovery", duration: 20, type: .rest),
            Exercise(name: "Kettlebell Swings", instructions: "Power through the hips", duration: 45, type: .work),
            Exercise(name: "Burpees", instructions: "Full explosive burpees", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Stay strong!", duration: 25, type: .rest),
            Exercise(name: "Renegade Rows", instructions: "Plank rows alternating", duration: 45, type: .work),
            Exercise(name: "Jump Lunges", instructions: "Alternate with power", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Final round!", duration: 25, type: .rest),
            Exercise(name: "Devil Press", instructions: "Burpee with dumbbell snatch", duration: 45, type: .work),
            Exercise(name: "Mountain Climbers", instructions: "Sprint to finish", duration: 40, type: .work),
            Exercise(name: "Cool Down", instructions: "Full body stretch", duration: 90, type: .cooldown),
        ]
    }

    private static func generateQuickPowerExercises() -> [Exercise] {
        [
            Exercise(name: "Quick Warm-up", instructions: "Jumping jacks and high knees", duration: 30, type: .warmup),
            Exercise(name: "Burpees", instructions: "Maximum intensity", duration: 30, type: .work),
            Exercise(name: "Rest", instructions: "10 seconds only!", duration: 10, type: .rest),
            Exercise(name: "Jump Squats", instructions: "Explosive power", duration: 30, type: .work),
            Exercise(name: "Rest", instructions: "Quick breath!", duration: 10, type: .rest),
            Exercise(name: "Mountain Climbers", instructions: "Sprint speed", duration: 30, type: .work),
            Exercise(name: "Rest", instructions: "Almost done!", duration: 10, type: .rest),
            Exercise(name: "Plyo Push-ups", instructions: "Explosive push", duration: 25, type: .work),
            Exercise(name: "Deep Breaths", instructions: "Recover and stretch", duration: 30, type: .cooldown),
        ]
    }
}
