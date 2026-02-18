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
                description: "Build foundational strength with squats, push-ups, lunges, and planks. No equipment needed — perfect for getting started with a simple, effective routine.",
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
                description: "Wake up your body with neck rolls, cat-cow, side stretches, and forward folds. A calm, gentle way to start your day feeling loose and limber.",
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
                description: "Fun, low-impact cardio with step touches, grapevines, knee lifts, and boxer shuffles. No equipment, no jumping required — just move to the rhythm.",
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
                description: "Strengthen your core with dead bugs, bird dogs, glute bridges, and planks. Gentle on your back, effective for building stability.",
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
                description: "Flow through warrior poses, tree pose, bridge, and supine twists. A calming, beginner-friendly sequence that builds flexibility and balance.",
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
                description: "Strengthen arms, chest, and back with wall push-ups, tricep dips, supermans, and inchworms. No weights needed — your body is the equipment.",
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
                description: "Build leg and glute strength with squats, lunges, calf raises, and glute bridges. Simple moves that build a strong foundation.",
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
                description: "Low-impact intervals with jumping jack steps, high knee marches, skater steps, and burpee walk-outs. Build endurance at your own pace.",
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
                description: "Two rounds of goblet squats, push-ups, bent-over rows, lunges, and planks with dumbbells. A complete full-body circuit that builds real strength.",
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
                description: "Jump rope intervals, high knees, burpees, and lateral shuffles. A high-energy session that builds serious cardiovascular endurance.",
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
                description: "Bicycle crunches, Russian twists, leg raises, side planks, and V-ups. An intensive core workout that builds strength and stability from every angle.",
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
                description: "Two rounds of dumbbell presses, rows, shoulder press, curls, and tricep work. Build defined arms, shoulders, and back with progressive supersets.",
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
                description: "Two rounds of goblet squats, Romanian deadlifts, walking lunges, and single-leg bridges with dumbbells. Build powerful legs and strong glutes.",
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
                description: "Two rounds of burpees, mountain climbers, jump squats, and sprawls. Short rest periods keep your heart rate high for maximum calorie burn.",
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
                description: "The Hundred, roll ups, single leg circles, swimming, and side kicks. Classic Pilates exercises that build deep core strength with controlled precision.",
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
                description: "Shoulder CARs, thoracic rotations, hip 90/90 switches, and the World's Greatest Stretch. Improve joint mobility and movement quality throughout your body.",
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
                description: "Two rounds of thrusters, renegade rows, kettlebell swings, Bulgarian split squats, and devil press. A demanding full-body session for experienced athletes.",
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
                description: "Three rounds of burpee tuck jumps, sprints, plyo push-ups, and jump lunges with minimal rest. Maximum intensity for peak cardiovascular performance.",
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
                description: "Three supersets: pull-ups with floor press, Arnold press with chin-ups, diamond push-ups with curls. A complete upper body session with pull-up bar and dumbbells.",
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
                description: "Three rounds of heavy squats, kettlebell swings, Bulgarian splits, and single-leg deadlifts. Builds serious leg strength and power. Not for the faint of heart.",
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
                description: "Three blocks of double unders, sprint intervals, burpee marathons, and mountain climber sprints. An extended session that pushes your cardiovascular limits.",
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
                description: "Crow pose, headstand prep, wheel pose, firefly, and deep hip openers. A challenging practice that builds strength, flexibility, and body awareness.",
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
                description: "Three rounds of thrusters, tuck jumps, kettlebell swings, burpees, renegade rows, and devil press. The ultimate test of strength and conditioning.",
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
                description: "Burpees, jump squats, mountain climbers, plyo push-ups, and sprawl-to-tuck-jumps in under 7 minutes. Maximum intensity when time is short.",
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

    // MARK: Beginner Exercises

    private static func generateBeginnerStrengthExercises() -> [Exercise] {
        // Full Body Basics — short (~13 min)
        [
            Exercise(name: "March in Place", instructions: "Stand tall and march with purpose, lifting knees to hip height. Pump your arms naturally with each step to warm up your whole body.", duration: 120, type: .warmup),
            Exercise(name: "Bodyweight Squats", instructions: "Stand with feet shoulder-width apart. Push hips back and bend knees as if sitting in a chair. Keep your chest up and weight in your heels. Stand back up by driving through your heels.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Shake out your legs and take a few deep breaths.", duration: 25, type: .rest),
            Exercise(name: "Incline Push-Ups", instructions: "Place hands on a sturdy counter or table, shoulder-width apart. Lower your chest toward the surface keeping your body in a straight line. Push back up.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Roll your shoulders and relax your arms.", duration: 25, type: .rest),
            Exercise(name: "Reverse Lunges", instructions: "Step one foot back and lower your back knee toward the floor. Keep your front knee over your ankle. Push through your front heel to return. Alternate legs each rep.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "March gently in place to keep blood flowing.", duration: 25, type: .rest),
            Exercise(name: "Glute Bridges", instructions: "Lie on your back with knees bent and feet flat. Press through your heels to lift your hips until your body forms a straight line from shoulders to knees. Squeeze at the top.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Stay on your back and take a breath.", duration: 25, type: .rest),
            Exercise(name: "Dead Bugs", instructions: "Lie on your back with arms reaching up and knees at 90 degrees. Slowly extend one arm overhead and the opposite leg straight out, keeping your lower back pressed to the floor. Switch sides.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Almost there — one more exercise!", duration: 25, type: .rest),
            Exercise(name: "Wall Sit", instructions: "Lean against a wall and slide down until your thighs are parallel to the floor. Keep knees directly above your ankles. Hold this position and breathe.", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Stand up slowly and shake out your legs.", duration: 25, type: .rest),
            Exercise(name: "Forearm Plank", instructions: "Rest on forearms and toes with your body in a straight line from head to heels. Engage your core and breathe steadily. Don't let your hips sag or pike up.", duration: 40, type: .work),
            Exercise(name: "Cool Down Stretch", instructions: "Reach overhead and lean side to side, touch your toes, pull each heel to your glutes, and cross each arm across your chest. Hold each stretch for a few slow breaths.", duration: 120, type: .cooldown),
        ]
    }

    private static func generateQuickStretchExercises() -> [Exercise] {
        // Morning Wake-Up Stretch — quick (~7 min)
        [
            Exercise(name: "Deep Breathing", instructions: "Stand or sit comfortably. Inhale deeply through your nose for 4 counts, hold for 2, exhale slowly through your mouth for 6. Let each breath settle your body.", duration: 45, type: .warmup),
            Exercise(name: "Neck Rolls", instructions: "Drop your chin to your chest, then slowly roll your head to the right, back, left, and forward in a smooth circle. Reverse direction halfway through.", duration: 45, type: .work),
            Exercise(name: "Shoulder Rolls and Shrugs", instructions: "Roll your shoulders forward in big circles 5 times, then reverse. Follow with shrugs — lift shoulders to your ears, hold 2 seconds, then drop.", duration: 50, type: .work),
            Exercise(name: "Cat-Cow Stretch", instructions: "On hands and knees, alternate between arching your back and dropping your belly toward the floor. Move with your breath — inhale as you arch, exhale as you round.", duration: 60, type: .work),
            Exercise(name: "Standing Side Stretch", instructions: "Stand tall and reach one arm overhead. Lean gently to the opposite side until you feel a stretch along your ribcage. Hold 15 seconds, then switch sides.", duration: 50, type: .work),
            Exercise(name: "Standing Forward Fold", instructions: "Feet hip-width apart, hinge at your hips and fold forward. Let your arms hang heavy. Bend your knees slightly if your hamstrings are tight. Sway gently.", duration: 50, type: .work),
            Exercise(name: "Standing Quad Stretch", instructions: "Stand on one leg and pull your opposite heel toward your glutes. Keep knees together and stand tall. Hold a wall for balance if needed. Switch after 20 seconds.", duration: 50, type: .work),
            Exercise(name: "Chest Opener", instructions: "Clasp hands behind your back and gently lift your arms while squeezing your shoulder blades together. Open your chest wide and take several deep breaths.", duration: 45, type: .cooldown),
        ]
    }

    private static func generateBeginnerCardioExercises() -> [Exercise] {
        // Beginner Cardio Dance — medium (~22 min)
        [
            Exercise(name: "Easy March", instructions: "March in place at a comfortable pace. Lift your knees and swing your arms gently to warm up. Gradually pick up the pace.", duration: 120, type: .warmup),
            Exercise(name: "Step Touches", instructions: "Step to the right and tap your left foot beside it, then step left and tap right. Add some bounce and swing your arms side to side with the rhythm.", duration: 90, type: .work),
            Exercise(name: "Rest", instructions: "Keep moving gently — slow your pace but don't stop completely.", duration: 30, type: .rest),
            Exercise(name: "Arm Circle Walking", instructions: "March in place while making big forward arm circles. After 30 seconds, reverse to backward circles. Keep your core engaged throughout.", duration: 75, type: .work),
            Exercise(name: "Grapevine Steps", instructions: "Step to the right, cross your left foot behind, step right again, and tap. Reverse direction. Add a clap on the tap to keep rhythm.", duration: 90, type: .work),
            Exercise(name: "Rest", instructions: "Walk it out and catch your breath.", duration: 30, type: .rest),
            Exercise(name: "Knee Lifts", instructions: "Alternate lifting your knees to waist height. Touch your opposite hand to each knee as it comes up. Find a steady rhythm that feels good.", duration: 75, type: .work),
            Exercise(name: "Side Shuffles", instructions: "Take three quick steps to the right, then three to the left. Stay low with knees slightly bent. Touch the ground at each end if you can.", duration: 75, type: .work),
            Exercise(name: "Rest", instructions: "You're doing great — take a breather!", duration: 30, type: .rest),
            Exercise(name: "Toe Taps", instructions: "Place one foot forward and tap your toe, then quickly switch feet. Pump your arms and gradually pick up speed.", duration: 75, type: .work),
            Exercise(name: "Boxer Shuffle", instructions: "Light bounce on the balls of your feet while throwing easy punches forward. Stay light and keep moving. Switch your lead foot every 20 seconds.", duration: 90, type: .work),
            Exercise(name: "Rest", instructions: "Walk slowly in a small circle. Almost there!", duration: 30, type: .rest),
            Exercise(name: "Jumping Jack Steps", instructions: "Step one foot out to the side and raise your arms, then return. Alternate sides. Add a small hop when you're ready for more intensity.", duration: 75, type: .work),
            Exercise(name: "Hamstring Curls", instructions: "Stand in place and alternate kicking your heels toward your glutes. Swing your arms in opposition. Keep a steady, brisk pace.", duration: 75, type: .work),
            Exercise(name: "Rest", instructions: "Slow march in place. One more round!", duration: 30, type: .rest),
            Exercise(name: "High Knee March", instructions: "March briskly, gradually lifting your knees higher. Pump your arms with energy. This is your final push — give it some extra effort!", duration: 90, type: .work),
            Exercise(name: "Cool Down Walk", instructions: "Walk slowly in place, letting your heart rate come down. Roll your shoulders, shake out your arms, and take slow, deep breaths.", duration: 150, type: .cooldown),
        ]
    }

    private static func generateBeginnerCoreExercises() -> [Exercise] {
        // Core Foundations — short (~11 min)
        [
            Exercise(name: "Cat-Cow Warm-Up", instructions: "Start on hands and knees. Inhale as you drop your belly and look up, then exhale as you round your back and tuck your chin. Flow slowly between positions with your breath.", duration: 90, type: .warmup),
            Exercise(name: "Dead Bugs", instructions: "Lie on your back with arms pointing up and knees bent at 90 degrees. Slowly lower your right arm and left leg toward the floor, keeping your lower back flat against the ground. Return and switch sides.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Stay on your back and relax for a moment.", duration: 25, type: .rest),
            Exercise(name: "Bird Dogs", instructions: "From hands and knees, extend your right arm forward and left leg back simultaneously. Keep your hips level and core tight. Hold 2 seconds, return, and switch sides.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Return to all fours and take a breath.", duration: 25, type: .rest),
            Exercise(name: "Glute Bridges", instructions: "Lie on your back with knees bent and feet flat. Drive through your heels to lift your hips. Squeeze your glutes at the top and hold 2 seconds before lowering slowly.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Lower your hips and relax.", duration: 25, type: .rest),
            Exercise(name: "Heel Taps", instructions: "Lie on your back with knees bent. Lift your head and shoulders slightly. Reach down to tap your right heel with your right hand, then left with left. Keep your core braced.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Lower your head and rest your neck.", duration: 25, type: .rest),
            Exercise(name: "Modified Side Plank", instructions: "Lie on your side with your bottom knee on the ground. Prop up on your forearm and lift your hips off the floor. Hold steady in a straight line. Switch sides halfway.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "One more exercise — you've got this!", duration: 25, type: .rest),
            Exercise(name: "Forearm Plank", instructions: "On forearms and toes (or knees for an easier option), hold your body in a straight line. Pull your belly button toward your spine and breathe steadily.", duration: 40, type: .work),
            Exercise(name: "Child's Pose", instructions: "Sit back onto your heels with arms extended forward on the floor. Rest your forehead down and breathe deeply. Let your lower back relax completely.", duration: 90, type: .cooldown),
        ]
    }

    private static func generateBeginnerYogaExercises() -> [Exercise] {
        // Gentle Yoga Flow — medium (~21 min)
        [
            Exercise(name: "Seated Breathing", instructions: "Sit cross-legged with a tall spine. Close your eyes and breathe deeply — inhale for 4 counts, exhale for 6. Let each breath calm and center you.", duration: 150, type: .warmup),
            Exercise(name: "Cat-Cow Flow", instructions: "On hands and knees, inhale as you arch your back and look up (Cow). Exhale as you round your spine and tuck your chin (Cat). Flow smoothly with each breath.", duration: 90, type: .work),
            Exercise(name: "Downward-Facing Dog", instructions: "From all fours, tuck your toes and lift your hips high. Press your chest toward your thighs and reach your heels toward the floor. Pedal your feet gently to loosen up.", duration: 90, type: .work),
            Exercise(name: "Low Lunge — Right Side", instructions: "Step your right foot between your hands. Lower your back knee to the floor and sink your hips forward gently. Raise your arms overhead and breathe into the stretch.", duration: 60, type: .work),
            Exercise(name: "Low Lunge — Left Side", instructions: "Step your left foot forward between your hands. Lower your back knee down and let your hips sink. Reach your arms overhead. Breathe steadily.", duration: 60, type: .work),
            Exercise(name: "Warrior I — Right Side", instructions: "Right foot forward in a lunge, back foot turned out 45 degrees. Bend your front knee and reach arms overhead. Square your hips forward and stand strong.", duration: 60, type: .work),
            Exercise(name: "Warrior I — Left Side", instructions: "Switch legs. Left foot forward, back foot angled out. Bend your front knee, arms overhead. Hips face forward. Feel the power in your legs.", duration: 60, type: .work),
            Exercise(name: "Warrior II — Right Side", instructions: "From Warrior I, open your hips and arms to the sides. Gaze over your right fingertips. Front knee bent to 90 degrees. Shoulders relaxed and level.", duration: 60, type: .work),
            Exercise(name: "Warrior II — Left Side", instructions: "Switch sides. Open your hips wide, arms extended. Gaze over your left fingertips. Keep your front knee tracking over your toes.", duration: 60, type: .work),
            Exercise(name: "Tree Pose", instructions: "Stand on your left foot. Place your right sole on your inner calf or thigh — avoid the knee. Hands at prayer or overhead. Find a focal point for balance. Switch sides halfway.", duration: 90, type: .work),
            Exercise(name: "Standing Forward Fold", instructions: "Fold forward from your hips with a soft bend in your knees. Let gravity pull you down. Grab opposite elbows and sway gently side to side.", duration: 60, type: .work),
            Exercise(name: "Bridge Pose", instructions: "Lie on your back with knees bent. Press into your feet to lift your hips toward the ceiling. Interlace your fingers underneath and roll your shoulders open.", duration: 60, type: .work),
            Exercise(name: "Supine Twist", instructions: "Lying on your back, hug knees to your chest, then drop both knees to the right. Extend arms out to a T and look left. Breathe into the twist. Switch sides halfway.", duration: 90, type: .work),
            Exercise(name: "Child's Pose", instructions: "Kneel and fold forward with arms extended. Rest your forehead on the mat and let your whole body soften and release.", duration: 90, type: .work),
            Exercise(name: "Savasana", instructions: "Lie flat on your back, arms at your sides with palms up. Close your eyes and release all tension. Breathe naturally and rest completely.", duration: 180, type: .cooldown),
        ]
    }

    private static func generateBeginnerUpperBodyExercises() -> [Exercise] {
        // Upper Body Introduction — short (~11 min)
        [
            Exercise(name: "Arm Circles", instructions: "Extend arms straight out to the sides. Start with small forward circles and gradually make them larger. Reverse direction after 30 seconds.", duration: 90, type: .warmup),
            Exercise(name: "Wall Push-Ups", instructions: "Stand arm's length from a wall, hands at chest height and shoulder-width apart. Bend your elbows to lower your chest toward the wall, then push back. Keep your body in a straight line.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Shake out your arms gently.", duration: 25, type: .rest),
            Exercise(name: "Chair Tricep Dips", instructions: "Sit on the edge of a sturdy chair with hands beside your hips. Slide forward off the seat and lower yourself by bending elbows to 90 degrees. Press back up. Keep your back close to the chair.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Roll your wrists and relax your hands.", duration: 25, type: .rest),
            Exercise(name: "Superman Hold", instructions: "Lie face down with arms extended forward. Lift your arms, chest, and legs a few inches off the floor simultaneously. Hold for 5 seconds, lower gently, and repeat.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Rest face down and relax your back.", duration: 25, type: .rest),
            Exercise(name: "Arm Pulses", instructions: "Extend arms straight out to the sides at shoulder height. Pulse up about 2 inches and back down in small, controlled movements. Keep arms straight and shoulders down.", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Lower your arms and shake them out.", duration: 25, type: .rest),
            Exercise(name: "Inchworm Walk-Outs", instructions: "Stand tall, fold forward, walk your hands out to a plank position. Hold briefly, then walk your hands back to your feet and stand up. Move slowly with control.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Take a deep breath — one more to go!", duration: 25, type: .rest),
            Exercise(name: "Isometric Chest Squeeze", instructions: "Press palms together in front of your chest with elbows out. Squeeze hard for 10 seconds, release for 5, and repeat. Feel the tension across your chest and arms.", duration: 45, type: .work),
            Exercise(name: "Shoulder and Arm Stretch", instructions: "Cross your right arm across your chest and hold with your left hand for 15 seconds, then switch. Follow with tricep stretches — reach behind your head with each arm.", duration: 90, type: .cooldown),
        ]
    }

    private static func generateBeginnerLowerBodyExercises() -> [Exercise] {
        // Lower Body Basics — short (~12 min)
        [
            Exercise(name: "Leg Swings", instructions: "Hold a wall for balance. Swing one leg forward and back like a pendulum, keeping it relaxed. 10 swings per leg, then 10 side-to-side swings each leg.", duration: 90, type: .warmup),
            Exercise(name: "Bodyweight Squats", instructions: "Feet shoulder-width apart, toes slightly turned out. Sit back and down, keeping heels on the floor and chest up. Go as deep as comfortable. Press through heels to stand.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Shake out your legs.", duration: 25, type: .rest),
            Exercise(name: "Reverse Lunges", instructions: "Step one foot straight back and lower your back knee toward the floor. Keep your front knee over your ankle and chest up. Push through your front heel to stand. Alternate legs.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Walk in place for a few steps.", duration: 25, type: .rest),
            Exercise(name: "Calf Raises", instructions: "Stand with feet hip-width apart near a wall for balance. Rise up onto your toes as high as you can, hold at the top for 2 seconds, then lower slowly.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Flex and point your feet a few times.", duration: 25, type: .rest),
            Exercise(name: "Glute Bridges", instructions: "Lie on your back with knees bent and feet flat. Drive through your heels to lift your hips high. Squeeze your glutes hard at the top. Lower slowly and repeat.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Halfway done — nice work!", duration: 25, type: .rest),
            Exercise(name: "Wall Sit", instructions: "Press your back flat against a wall and slide down until your thighs are parallel to the floor. Keep knees over ankles. Hold steady and breathe.", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Stand up and gently shake your legs.", duration: 25, type: .rest),
            Exercise(name: "Standing Kickbacks", instructions: "Hold a wall for balance. Keep your leg straight and push one foot back behind you, squeezing your glute at the top. Lower with control. Switch legs halfway.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "One more exercise to go!", duration: 25, type: .rest),
            Exercise(name: "Sumo Squat Hold", instructions: "Stand with feet wide and toes pointed out. Lower into a deep squat and hold. Press elbows against your inner knees to gently open your hips. Breathe and hold steady.", duration: 40, type: .work),
            Exercise(name: "Lower Body Stretch", instructions: "Pull each heel to your glutes for a quad stretch, do a standing figure-four for your hips, and stretch calves against a wall. Hold each for 15 seconds per side.", duration: 120, type: .cooldown),
        ]
    }

    private static func generateBeginnerHIITExercises() -> [Exercise] {
        // Beginner HIIT Intro — short (~11 min)
        [
            Exercise(name: "March in Place", instructions: "March briskly to raise your heart rate. Pump your arms and lift your knees. Gradually pick up the pace over the full 2 minutes.", duration: 120, type: .warmup),
            Exercise(name: "Jumping Jack Steps", instructions: "Step one foot out and raise both arms overhead, then step together and lower arms. Alternate sides briskly. Add a hop when you feel ready.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Walk in place and catch your breath.", duration: 25, type: .rest),
            Exercise(name: "High Knee March", instructions: "Drive your knees up toward your chest one at a time. Pump your arms. Go at whatever pace keeps your heart rate up while you can still breathe.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Slow walk in place. You're doing awesome!", duration: 25, type: .rest),
            Exercise(name: "Squat Pulses", instructions: "Lower into a squat position. Instead of standing all the way up, pulse up a few inches and back down. Keep the tension in your legs and stay low.", duration: 35, type: .work),
            Exercise(name: "Rest", instructions: "Stand up and shake out your quads.", duration: 25, type: .rest),
            Exercise(name: "Standing Cross Crunches", instructions: "Bring your right knee up toward your left elbow, engaging your obliques. Return to standing and switch sides. Find a steady rhythm.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Breathe deep — second round!", duration: 30, type: .rest),
            Exercise(name: "Fast Feet", instructions: "Tap your feet as quickly as you can in place, staying on the balls of your feet. Keep your arms ready at your sides. Quick, light steps.", duration: 30, type: .work),
            Exercise(name: "Rest", instructions: "Walk it out.", duration: 25, type: .rest),
            Exercise(name: "Skater Steps", instructions: "Step or hop to the right, swinging your left foot behind. Then hop left. Like speed skating — swing your arms for momentum and balance.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Almost done! One more push!", duration: 25, type: .rest),
            Exercise(name: "Burpee Walk-Outs", instructions: "From standing, bend down, walk your hands out to a plank, hold for a beat, walk hands back, and stand up. A gentler burpee that still gets your heart going.", duration: 40, type: .work),
            Exercise(name: "Cool Down Walk", instructions: "Walk slowly in place for 1 minute, then stretch your quads, hamstrings, and shoulders. Let your heart rate come all the way down.", duration: 120, type: .cooldown),
        ]
    }

    // MARK: Intermediate Exercises

    private static func generateIntermediateCircuitExercises() -> [Exercise] {
        // Intermediate Strength Circuit — medium (~24 min), 2 rounds
        [
            Exercise(name: "Dynamic Warm-Up", instructions: "30 seconds each: jumping jacks, high knees, butt kicks, arm swings, and hip circles. Keep transitions quick to build your heart rate.", duration: 150, type: .warmup),
            // Round 1
            Exercise(name: "Dumbbell Goblet Squats", instructions: "Hold one dumbbell vertically against your chest with both hands. Squat deep with elbows tracking inside your knees. Drive through your heels to stand.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Set the weight down briefly.", duration: 20, type: .rest),
            Exercise(name: "Push-Ups", instructions: "Hands just wider than shoulder-width. Lower your chest to the floor with elbows at about 45 degrees. Push back up keeping a straight body from head to heels.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Roll your wrists.", duration: 20, type: .rest),
            Exercise(name: "Dumbbell Bent-Over Rows", instructions: "Hinge forward at your hips with a flat back, dumbbells hanging below. Pull the weights toward your ribcage, squeezing shoulder blades together. Lower with control.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Stand up and stretch your back.", duration: 20, type: .rest),
            Exercise(name: "Reverse Lunges with Dumbbells", instructions: "Hold dumbbells at your sides. Step back into a lunge, lowering your back knee toward the floor. Keep your torso upright. Alternate legs each rep.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Walk it out.", duration: 20, type: .rest),
            Exercise(name: "Plank with Shoulder Taps", instructions: "High plank position. Tap your left shoulder with your right hand, then switch. Keep hips square to the floor — widen your feet for more stability.", duration: 45, type: .work),
            Exercise(name: "Circuit Rest", instructions: "Walk around, sip water, and reset. Same exercises again in round 2 — you know the moves now!", duration: 60, type: .rest),
            // Round 2
            Exercise(name: "Goblet Squats — Round 2", instructions: "Same deep squats. Chest up, elbows inside knees, drive through heels. You know this one — push the pace if you can.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Quick breather.", duration: 20, type: .rest),
            Exercise(name: "Push-Ups — Round 2", instructions: "Same strong push-ups. Drop to knees if your form starts to break — quality reps beat fast reps every time.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Shake out your arms.", duration: 20, type: .rest),
            Exercise(name: "Bent-Over Rows — Round 2", instructions: "Flat back, pull to your ribcage, squeeze those shoulder blades. Control the weight on the way down.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Stand and breathe.", duration: 20, type: .rest),
            Exercise(name: "Reverse Lunges — Round 2", instructions: "Same alternating lunges with dumbbells. Keep your front knee stable and your torso tall.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Almost there!", duration: 20, type: .rest),
            Exercise(name: "Forearm Plank Hold", instructions: "Forearm plank — hold as steady as you can. Squeeze your quads, glutes, and core. Breathe through it. Don't hold your breath.", duration: 50, type: .work),
            Exercise(name: "Cool Down Stretch", instructions: "Stretch your chest in a doorway, cross-body shoulder pulls, standing quad stretch, forward fold for hamstrings, and child's pose. Hold each 15-20 seconds.", duration: 150, type: .cooldown),
        ]
    }

    private static func generateIntermediateCardioExercises() -> [Exercise] {
        // Cardio Blast — medium (~22 min)
        [
            Exercise(name: "Jump Rope — Easy Pace", instructions: "Easy, steady jumps to warm up. Stay on the balls of your feet with a slight bounce. Keep elbows close to your body and wrists doing the work.", duration: 120, type: .warmup),
            Exercise(name: "Jump Rope — Fast Singles", instructions: "Pick up the pace. One jump per rope revolution, as fast as you can sustain. Stay light on your feet and keep your core tight.", duration: 75, type: .work),
            Exercise(name: "Rest", instructions: "Set the rope down and walk in a small circle.", duration: 30, type: .rest),
            Exercise(name: "High Knees", instructions: "Drive your knees up to hip height as fast as you can. Pump your arms like you're sprinting. Stay on the balls of your feet.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Walk it out and catch your breath.", duration: 30, type: .rest),
            Exercise(name: "Jump Rope — Intervals", instructions: "Alternate 20 seconds fast with 10 seconds slow. Repeat this pattern for the full duration. Push hard during the fast intervals.", duration: 90, type: .work),
            Exercise(name: "Rest", instructions: "Deep breaths. You're crushing it!", duration: 30, type: .rest),
            Exercise(name: "Burpees", instructions: "From standing, squat down and place hands on the floor. Jump feet back to plank, do a push-up, jump feet forward, and explode up with arms overhead.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Walk slowly and let your heart rate settle a bit.", duration: 30, type: .rest),
            Exercise(name: "Jump Rope — Alternating Feet", instructions: "Run in place through the rope, one foot at a time. Like jogging but with the rope. Keep a steady rhythm.", duration: 75, type: .work),
            Exercise(name: "Rest", instructions: "Set the rope down. One more round!", duration: 30, type: .rest),
            Exercise(name: "Lateral Shuffle to Sprint", instructions: "Shuffle sideways 4 steps to the right, then sprint in place for 5 seconds. Shuffle left 4 steps, sprint again. Keep low in the shuffles.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Walk and breathe. Almost done!", duration: 30, type: .rest),
            Exercise(name: "Jump Rope — Final Push", instructions: "Last round of jump rope. Give it everything you've got. Fast, steady, and controlled.", duration: 60, type: .work),
            Exercise(name: "Cool Down", instructions: "Walk slowly for 1 minute. Then stretch your calves, quads, hip flexors, and shoulders. Hold each stretch for 20 seconds.", duration: 150, type: .cooldown),
        ]
    }

    private static func generateIntermediateCoreExercises() -> [Exercise] {
        // Core Power — short (~14 min)
        [
            Exercise(name: "Plank Warm-Up", instructions: "Hold a forearm plank with easy effort to activate your core. Focus on pulling your belly button toward your spine and breathing steadily.", duration: 60, type: .warmup),
            Exercise(name: "Bicycle Crunches", instructions: "Lie on your back with hands behind your head. Lift shoulders off the floor and drive your right elbow toward your left knee while extending the right leg. Alternate smoothly.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Lower down and relax your neck for a moment.", duration: 20, type: .rest),
            Exercise(name: "Russian Twists", instructions: "Sit with knees bent, lean back slightly, and lift feet off the floor. Rotate your torso to touch the ground on each side. Keep your chest up and move from your core.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Set your feet down and breathe.", duration: 20, type: .rest),
            Exercise(name: "Lying Leg Raises", instructions: "Lie flat with hands under your hips for support. Keeping legs straight, raise them to 90 degrees, then lower slowly without touching the floor. Control the descent.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Bend your knees and rest your feet on the floor.", duration: 20, type: .rest),
            Exercise(name: "Plank with Shoulder Taps", instructions: "High plank position. Tap your right hand to your left shoulder, then alternate. Resist the urge to rotate your hips — keep them square.", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Drop to your knees briefly.", duration: 20, type: .rest),
            Exercise(name: "Dead Bug — Slow Tempo", instructions: "On your back, arms up and knees at 90 degrees. Extend opposite arm and leg very slowly — 3 seconds out, 3 seconds back. Keep your lower back glued to the floor.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "One more — finish strong!", duration: 20, type: .rest),
            Exercise(name: "Side Plank Hold", instructions: "Stack your feet and prop up on one forearm. Lift your hips so your body forms a straight line. Hold steady. Switch sides halfway through.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Lower down gently.", duration: 20, type: .rest),
            Exercise(name: "V-Up Crunches", instructions: "Lie flat, then simultaneously lift your legs and upper body to touch your toes at the top. Lower back down with control. Bend knees slightly if needed.", duration: 40, type: .work),
            Exercise(name: "Child's Pose", instructions: "Sit back onto your heels, arms reaching forward. Let your core and back fully relax. Breathe deeply and let gravity stretch you out.", duration: 90, type: .cooldown),
        ]
    }

    private static func generateIntermediateUpperBodyExercises() -> [Exercise] {
        // Upper Body Sculpt — long (~33 min)
        [
            Exercise(name: "Arm Swings and Shoulder Circles", instructions: "Swing your arms across your body and overhead for 30 seconds. Then 30 seconds of big shoulder circles forward and backward. Finish with 30 seconds of push-up hold.", duration: 120, type: .warmup),
            Exercise(name: "Dumbbell Floor Press", instructions: "Lie on your back with knees bent, a dumbbell in each hand at chest level. Press the weights up until arms are straight. Lower until elbows lightly touch the floor. Repeat.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Keep the dumbbells close — next is rows.", duration: 25, type: .rest),
            Exercise(name: "Dumbbell Bent-Over Rows", instructions: "Hinge at your hips with a flat back, arms hanging. Pull both dumbbells toward your lower ribcage, squeezing your shoulder blades at the top. Lower slowly.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Stand up and roll your shoulders.", duration: 25, type: .rest),
            Exercise(name: "Dumbbell Shoulder Press", instructions: "Stand or sit with dumbbells at shoulder height, palms forward. Press both weights overhead until arms are fully extended. Lower back to shoulders with control.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Lower the weights and shake your arms.", duration: 25, type: .rest),
            Exercise(name: "Dumbbell Bicep Curls", instructions: "Stand with dumbbells at your sides, palms facing forward. Curl the weights up toward your shoulders without swinging. Squeeze at the top and lower slowly.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Rotate your wrists gently.", duration: 25, type: .rest),
            Exercise(name: "Overhead Tricep Extensions", instructions: "Hold one dumbbell overhead with both hands. Lower it behind your head by bending your elbows. Keep upper arms close to your ears. Extend back up.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Great first round! Time for round 2.", duration: 40, type: .rest),
            // Round 2
            Exercise(name: "Push-Ups", instructions: "Hands shoulder-width apart. Lower your chest all the way to the floor with elbows at 45 degrees. Push up explosively. Go to knees if needed to keep form.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Quick recovery.", duration: 25, type: .rest),
            Exercise(name: "Single-Arm Dumbbell Rows", instructions: "Place one hand and knee on a bench or chair. Row the dumbbell to your hip with the other arm. Keep your back flat and elbow close. Switch sides halfway.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Stand and stretch your lats.", duration: 25, type: .rest),
            Exercise(name: "Lateral Raises", instructions: "Hold dumbbells at your sides. Raise both arms out to the sides until they're parallel to the floor. Keep a slight bend in your elbows. Lower slowly.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Drop the weights and shake it out.", duration: 25, type: .rest),
            Exercise(name: "Hammer Curls", instructions: "Hold dumbbells with palms facing each other. Curl both weights up keeping the neutral grip. This targets your brachialis and forearms along with biceps.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Almost done! Two more exercises.", duration: 25, type: .rest),
            Exercise(name: "Diamond Push-Ups", instructions: "Place your hands close together under your chest, forming a diamond shape with thumbs and fingers. Lower and press. These really target triceps.", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Final exercise — bring it home!", duration: 25, type: .rest),
            Exercise(name: "Dumbbell Shrugs", instructions: "Hold heavy dumbbells at your sides. Shrug your shoulders straight up toward your ears. Hold at the top for 2 seconds. Lower slowly. Repeat.", duration: 45, type: .work),
            Exercise(name: "Upper Body Stretch", instructions: "Doorway chest stretch (30 sec), cross-body shoulder stretch each arm (20 sec), overhead tricep stretch each arm (20 sec), and wrist flexor stretches.", duration: 150, type: .cooldown),
        ]
    }

    private static func generateIntermediateLegExercises() -> [Exercise] {
        // Leg Day Challenge — long (~33 min)
        [
            Exercise(name: "Dynamic Leg Warm-Up", instructions: "30 seconds each: bodyweight squats, leg swings front-to-back, leg swings side-to-side, walking lunges, and high knees. Get those legs ready to work.", duration: 150, type: .warmup),
            Exercise(name: "Dumbbell Goblet Squats", instructions: "Hold a dumbbell at your chest. Squat deep — try to get your hip crease below your knees. Elbows inside your knees, chest proud. Drive through heels to stand.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Walk in a small circle.", duration: 25, type: .rest),
            Exercise(name: "Dumbbell Romanian Deadlifts", instructions: "Hold dumbbells in front of your thighs. Hinge at hips pushing your butt back, lowering weights along your legs. Feel the stretch in your hamstrings. Stand by squeezing your glutes.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Stand and shake your legs.", duration: 25, type: .rest),
            Exercise(name: "Walking Lunges with Dumbbells", instructions: "Hold dumbbells at your sides. Step forward into a deep lunge, then drive through the front heel to step the back foot forward into the next lunge.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Set the weights down. Halfway through round 1!", duration: 30, type: .rest),
            Exercise(name: "Dumbbell Sumo Squats", instructions: "Wide stance, toes pointed out about 45 degrees. Hold one dumbbell hanging between your legs. Squat deep, keeping your knees tracking over your toes. Stand and squeeze.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Stretch your inner thighs briefly.", duration: 25, type: .rest),
            Exercise(name: "Dumbbell Calf Raises", instructions: "Hold dumbbells at your sides. Rise up onto your toes as high as possible, pause at the top for 2 seconds, then lower slowly. Stand on a step edge for more range.", duration: 50, type: .work),
            Exercise(name: "Round Rest", instructions: "Walk around, sip water. Round 2 coming up — same exercises, dig deeper!", duration: 60, type: .rest),
            // Round 2
            Exercise(name: "Goblet Squats — Round 2", instructions: "Deep squats again. Focus on tempo — 3 seconds down, pause at the bottom, drive up. Really control it this round.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Quick breather.", duration: 25, type: .rest),
            Exercise(name: "Romanian Deadlifts — Round 2", instructions: "Same hip hinge. Push your butt way back and feel that hamstring stretch. Keep the dumbbells close to your legs the entire time.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Stand tall and breathe.", duration: 25, type: .rest),
            Exercise(name: "Reverse Lunges with Dumbbells", instructions: "Step back into a lunge instead of forward — easier on the knees. Lower your back knee toward the floor. Alternate legs with each rep.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "You're doing great — almost there!", duration: 25, type: .rest),
            Exercise(name: "Single-Leg Glute Bridges", instructions: "Lie on your back, one foot flat on the floor, other leg extended up. Drive through the planted heel to lift hips. Squeeze your glute at the top. Switch legs halfway.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "One more!", duration: 25, type: .rest),
            Exercise(name: "Wall Sit with Dumbbell", instructions: "Back against the wall, thighs parallel to the floor. Hold a dumbbell on your lap for extra resistance. Breathe through the burn and hold steady.", duration: 50, type: .work),
            Exercise(name: "Lower Body Stretch", instructions: "Deep stretches: forward fold (30 sec), pigeon pose each side (30 sec), kneeling hip flexor stretch each side (20 sec), calf stretch against wall (20 sec each).", duration: 180, type: .cooldown),
        ]
    }

    private static func generateIntermediateHIITExercises() -> [Exercise] {
        // Intermediate HIIT Burn — medium (~22 min), 2 rounds
        [
            Exercise(name: "Dynamic Warm-Up", instructions: "Build intensity gradually: 30 seconds easy jog in place, 30 seconds high knees, 30 seconds jumping jacks. Get your whole body warm and ready.", duration: 120, type: .warmup),
            // Round 1
            Exercise(name: "Burpees", instructions: "Squat, hands down, jump back to plank, chest to floor, push up, jump feet forward, explode upward. Full range of motion every rep.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Walk in place. Quick recovery only!", duration: 20, type: .rest),
            Exercise(name: "Mountain Climbers", instructions: "In plank position, drive your knees toward your chest one at a time as fast as you can. Keep hips low and core braced.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Hold plank for a moment, then stand.", duration: 20, type: .rest),
            Exercise(name: "Jump Squats", instructions: "Squat down until thighs are parallel, then explode upward, leaving the ground. Land softly by bending your knees on impact.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Breathe! You've got this.", duration: 20, type: .rest),
            Exercise(name: "High Knees Sprint", instructions: "Sprint in place driving your knees up as high and fast as possible. Pump your arms. Maximum effort for the full duration.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Walk it out.", duration: 20, type: .rest),
            Exercise(name: "Plank Jacks", instructions: "Start in high plank. Jump your feet out wide, then back together — like a jumping jack but in plank position. Keep your core tight.", duration: 35, type: .work),
            Exercise(name: "Round Rest", instructions: "Walk around slowly, sip water. Great first round! Reset for round 2.", duration: 60, type: .rest),
            // Round 2
            Exercise(name: "Burpees — Round 2", instructions: "Same full burpees. If you need to, step back instead of jumping — just keep moving through every rep.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Quick walk.", duration: 20, type: .rest),
            Exercise(name: "Mountain Climbers — Round 2", instructions: "Same speed, same form. Hips low, knees driving. Push through the burn.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Stand and breathe.", duration: 20, type: .rest),
            Exercise(name: "Jump Squats — Round 2", instructions: "Explode up on every rep. If legs are tired, do regular fast squats instead. Keep moving.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Almost done!", duration: 20, type: .rest),
            Exercise(name: "Lateral High Knees", instructions: "High knees while moving sideways. 5 steps right, then 5 left. Keep knees high and pace fast.", duration: 35, type: .work),
            Exercise(name: "Rest", instructions: "Final exercise!", duration: 20, type: .rest),
            Exercise(name: "Sprawls", instructions: "Like a burpee without the push-up — squat, jump back to plank, immediately jump feet back to hands, and stand. Fast and explosive.", duration: 35, type: .work),
            Exercise(name: "Cool Down", instructions: "Walk slowly for 1 minute. Then stretch quads, hamstrings, hip flexors, chest, and shoulders. Hold each 20 seconds. Let your heart rate come all the way down.", duration: 150, type: .cooldown),
        ]
    }

    private static func generateIntermediatePilatesExercises() -> [Exercise] {
        // Pilates Core Focus — medium (~23 min)
        [
            Exercise(name: "Pilates Breathing", instructions: "Lie on your back with knees bent. Practice lateral breathing — expand your ribcage sideways as you inhale, drawing your navel to your spine as you exhale.", duration: 90, type: .warmup),
            Exercise(name: "The Hundred", instructions: "Lift your head, shoulders, and legs off the mat. Arms straight by your sides. Pump arms up and down in small, vigorous movements. Inhale 5 pumps, exhale 5 pumps.", duration: 75, type: .work),
            Exercise(name: "Rest", instructions: "Lower everything down and relax your neck.", duration: 20, type: .rest),
            Exercise(name: "Roll Up", instructions: "Lie flat with arms overhead. Slowly curl up one vertebra at a time, reaching toward your toes. Then roll back down with the same control. Keep it smooth, no jerking.", duration: 60, type: .work),
            Exercise(name: "Single Leg Circles", instructions: "Lie on your back, one leg extended toward the ceiling. Draw circles with that leg — across the body, down, around, and back up. 5 circles each direction, then switch.", duration: 75, type: .work),
            Exercise(name: "Rest", instructions: "Hug your knees to your chest.", duration: 20, type: .rest),
            Exercise(name: "Rolling Like a Ball", instructions: "Sit in a tight ball, holding your shins. Roll backward to your shoulder blades and back up to balance. Use your abs to control the movement — not momentum.", duration: 60, type: .work),
            Exercise(name: "Single Leg Stretch", instructions: "Lie on your back, curl up. Pull one knee to your chest while extending the other leg out. Switch smoothly. Keep your shoulders lifted and core pulled in.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Lower down and breathe.", duration: 20, type: .rest),
            Exercise(name: "Double Leg Stretch", instructions: "Curl up and hug both knees. Extend arms overhead and legs out straight simultaneously. Circle arms around and hug knees back in. Smooth and controlled.", duration: 60, type: .work),
            Exercise(name: "Spine Stretch Forward", instructions: "Sit tall with legs extended wider than your hips. Reach forward over your legs, rounding your spine like a C-curve. Stack back up one vertebra at a time.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Sit tall and breathe.", duration: 20, type: .rest),
            Exercise(name: "Swimming", instructions: "Lie face down, arms extended. Lift opposite arm and leg, then switch in a flutter pattern. Keep your gaze down and neck long. Breathe: inhale 5 beats, exhale 5.", duration: 60, type: .work),
            Exercise(name: "Side Kicks", instructions: "Lie on your side, propped on your elbow. Lift your top leg and swing it forward and back in a controlled kick. 10 each direction, then switch sides.", duration: 75, type: .work),
            Exercise(name: "Rest", instructions: "Roll onto your back.", duration: 20, type: .rest),
            Exercise(name: "Shoulder Bridge", instructions: "Lie on your back, feet flat. Lift hips into a bridge. Extend one leg toward the ceiling, lower it to knee height, and lift back up. 5 reps each leg.", duration: 60, type: .work),
            Exercise(name: "Cool Down Stretch", instructions: "Hug knees to chest and rock gently. Then stretch into a full-body reach on your back, arms overhead and legs long. Finish with a gentle seated forward fold.", duration: 120, type: .cooldown),
        ]
    }

    private static func generateIntermediateMobilityExercises() -> [Exercise] {
        // Mobility Flow — short (~14 min)
        [
            Exercise(name: "Neck Circles and Tilts", instructions: "Slowly circle your head 5 times in each direction. Then gently tilt ear to each shoulder, holding for 10 seconds per side. Move slowly and never force.", duration: 60, type: .warmup),
            Exercise(name: "Shoulder CARs", instructions: "Controlled Articular Rotations: extend one arm and slowly trace the biggest circle you can. Go forward 5 times, backward 5 times. Keep your torso completely still. Switch arms.", duration: 75, type: .work),
            Exercise(name: "Thoracic Rotations", instructions: "On hands and knees, place one hand behind your head. Rotate that elbow toward the ceiling, opening your chest. Then rotate down toward the opposite arm. 8 reps per side.", duration: 75, type: .work),
            Exercise(name: "Hip 90/90 Switches", instructions: "Sit with both knees bent at 90 degrees, one in front and one to the side. Rotate both knees to switch positions. Move slowly and feel the stretch in your hips.", duration: 75, type: .work),
            Exercise(name: "Deep Squat Hold with Rotation", instructions: "Sink into a deep bodyweight squat with feet flat. Place one hand on the floor and reach the other arm to the ceiling, rotating your upper back. Switch sides. 30 seconds each.", duration: 75, type: .work),
            Exercise(name: "Leg Swings — All Directions", instructions: "Hold a wall. Swing each leg 10 times front-to-back, then 10 times side-to-side. Keep the swings controlled and gradually increase range of motion.", duration: 75, type: .work),
            Exercise(name: "World's Greatest Stretch", instructions: "Step into a lunge, place both hands on the floor. Rotate one arm to the ceiling, hold 5 seconds. Bring it back, straighten the front leg for hamstring stretch. 4 per side.", duration: 90, type: .work),
            Exercise(name: "Ankle CARs and Calf Stretch", instructions: "Slowly circle each ankle 10 times in each direction. Then step one foot back into a calf stretch against the wall — 20 seconds per side, both straight and bent knee.", duration: 75, type: .work),
            Exercise(name: "Spinal Waves", instructions: "Stand tall. Slowly round forward from your head, rolling down one vertebra at a time until you're folded over. Then reverse, stacking back up from the bottom. Smooth and flowing.", duration: 60, type: .work),
            Exercise(name: "Deep Breathing", instructions: "Stand or sit comfortably. Take 5 deep breaths — in through the nose for 4, hold 2, out through the mouth for 6. Feel your body more open and mobile.", duration: 45, type: .cooldown),
        ]
    }

    // MARK: Advanced Exercises

    private static func generateAdvancedStrengthExercises() -> [Exercise] {
        // Advanced Full Body Crusher — long (~35 min), 2 rounds
        [
            Exercise(name: "Dynamic Full-Body Warm-Up", instructions: "1 minute: jumping jacks. 1 minute: inchworm walk-outs. 1 minute: bodyweight squats with a twist at the top. Get fully warm before the heavy work.", duration: 180, type: .warmup),
            // Round 1
            Exercise(name: "Dumbbell Thrusters", instructions: "Hold dumbbells at shoulder height. Squat deep, then drive up explosively and press the weights overhead in one fluid motion. Lower and repeat without pausing.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Set the weights down and walk.", duration: 25, type: .rest),
            Exercise(name: "Renegade Rows", instructions: "In push-up position with hands on dumbbells. Do a push-up, then row the right dumbbell to your hip, set it down, row left. That's one rep. Keep hips square.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Hold plank for a moment, then stand.", duration: 25, type: .rest),
            Exercise(name: "Kettlebell Swings", instructions: "Stand with feet wider than shoulders. Hike the kettlebell back between your legs, then snap your hips forward to swing it to chest height. Power comes from your hips, not your arms.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Set the bell down. Shake out your hands.", duration: 25, type: .rest),
            Exercise(name: "Bulgarian Split Squats — Right Leg", instructions: "Place your rear foot on a chair or bench behind you. Hold dumbbells at your sides. Lower until your front thigh is parallel. Drive through your front heel.", duration: 55, type: .work),
            Exercise(name: "Bulgarian Split Squats — Left Leg", instructions: "Switch legs. Same depth, same control. Keep your front knee tracking over your toes and your torso upright.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Walk it off. Halfway through round 1!", duration: 30, type: .rest),
            Exercise(name: "Devil Press", instructions: "Start standing with dumbbells on the floor. Burpee down, grab the bells, and in one explosive motion swing them overhead as you stand. Lower and repeat.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Walk and breathe.", duration: 25, type: .rest),
            Exercise(name: "Plank to Push-Up", instructions: "Start on forearms. Press up to high plank one arm at a time, then lower back down. Alternate which arm leads. Keep your hips as still as possible.", duration: 50, type: .work),
            Exercise(name: "Round Rest", instructions: "Walk around, get water. Reset mentally for round 2 — same exercises, same fire.", duration: 75, type: .rest),
            // Round 2
            Exercise(name: "Thrusters — Round 2", instructions: "Deep squat, explosive press. Keep the rhythm and power up. If you need to go lighter on weights, do it — form over ego.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Quick break.", duration: 20, type: .rest),
            Exercise(name: "Renegade Rows — Round 2", instructions: "Push-up, row right, row left. Control the rotation. Your core should be screaming by now — that means it's working.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Stand and breathe.", duration: 20, type: .rest),
            Exercise(name: "Kettlebell Swings — Round 2", instructions: "Same powerful hip snap. The bell should feel weightless at the top. Squeeze your glutes at the top of each swing.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Set it down. Almost there!", duration: 25, type: .rest),
            Exercise(name: "Alternating Reverse Lunges with Dumbbells", instructions: "Step back into a deep lunge with dumbbells at sides. Drive through the front heel. Alternate legs. Keep your torso upright.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Final exercise!", duration: 20, type: .rest),
            Exercise(name: "Dumbbell Man Makers", instructions: "Burpee with dumbbells, add a push-up, row each side, then clean and press overhead. The ultimate compound move. Control every phase.", duration: 50, type: .work),
            Exercise(name: "Cool Down Stretch", instructions: "Full body: child's pose (30 sec), pigeon each side (30 sec), forward fold (30 sec), chest doorway stretch (30 sec), shoulder cross-body (20 sec each).", duration: 180, type: .cooldown),
        ]
    }

    private static func generateAdvancedHIITExercises() -> [Exercise] {
        // Extreme HIIT — medium (~23 min), 3 rounds with short rest
        [
            Exercise(name: "Explosive Warm-Up", instructions: "Build fast: 20 sec high knees, 20 sec butt kicks, 20 sec squat jumps, 20 sec mountain climbers, 20 sec burpees. No rest between. Get your engine running.", duration: 120, type: .warmup),
            // Round 1
            Exercise(name: "Burpee Tuck Jumps", instructions: "Full burpee with a push-up, but instead of a regular jump at the top, explode into a tuck jump — drive knees to chest in the air. Land soft.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "15 seconds — that's it. Walk.", duration: 15, type: .rest),
            Exercise(name: "Sprint in Place", instructions: "Maximum speed. Drive those knees, pump those arms. Pretend you're chasing down a finish line. Do not pace yourself.", duration: 35, type: .work),
            Exercise(name: "Rest", instructions: "Catch your breath.", duration: 15, type: .rest),
            Exercise(name: "Plyometric Push-Ups", instructions: "Lower into a push-up, then push off the ground explosively so your hands leave the floor. Land with soft elbows and go straight into the next rep.", duration: 30, type: .work),
            Exercise(name: "Rest", instructions: "Stay strong!", duration: 15, type: .rest),
            Exercise(name: "Jump Lunges", instructions: "Lunge position. Jump and switch legs in the air, landing in the opposite lunge. Stay low and keep the switches fast and controlled.", duration: 35, type: .work),
            Exercise(name: "Rest", instructions: "Walk. Round 1 done!", duration: 15, type: .rest),
            Exercise(name: "Mountain Climber Sprints", instructions: "Plank position. Drive knees to chest as fast as humanly possible. Hips stay low. Think: controlled chaos.", duration: 35, type: .work),
            Exercise(name: "Round Rest", instructions: "Walk around slowly. Sip water. Reset mentally. Two more rounds.", duration: 45, type: .rest),
            // Round 2
            Exercise(name: "Burpee Tuck Jumps — Round 2", instructions: "Same explosive burpees with tuck jumps. If you can't tuck, do a regular jump — but commit to full effort.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Quick walk.", duration: 15, type: .rest),
            Exercise(name: "Squat Jump to Sprawl", instructions: "Explode into a squat jump. On landing, immediately drop into a sprawl (hands down, jump feet back, jump feet in). Stand and repeat.", duration: 35, type: .work),
            Exercise(name: "Rest", instructions: "Breathe.", duration: 15, type: .rest),
            Exercise(name: "Plyo Push-Ups — Round 2", instructions: "Same explosive push-ups. Drop to knees between reps if needed, but make each push-up explosive.", duration: 30, type: .work),
            Exercise(name: "Rest", instructions: "Stand and shake arms.", duration: 15, type: .rest),
            Exercise(name: "Lateral Bound to Sprint", instructions: "Bound sideways 3 steps to the right, then sprint in place 5 seconds. Bound left, sprint. Stay athletic and low.", duration: 35, type: .work),
            Exercise(name: "Rest", instructions: "Last round coming up!", duration: 15, type: .rest),
            Exercise(name: "Star Jumps", instructions: "From a squat, explode upward spreading arms and legs into a star shape. Land softly back in the squat. Maximum height every rep.", duration: 30, type: .work),
            Exercise(name: "Round Rest", instructions: "Walk it out. Final round. Leave nothing in the tank.", duration: 45, type: .rest),
            // Round 3
            Exercise(name: "Burpees — Final Round", instructions: "Full burpees, full effort. Push-up at the bottom, jump at the top. Every single rep counts. This is the last push.", duration: 35, type: .work),
            Exercise(name: "Rest", instructions: "10 seconds. Almost done.", duration: 10, type: .rest),
            Exercise(name: "All-Out Sprint in Place", instructions: "30 seconds. Everything you have left. Knees high, arms pumping, maximum effort. Leave it all here.", duration: 30, type: .work),
            Exercise(name: "Cool Down", instructions: "Walk slowly for 2 minutes. Then stretch: quads (30 sec each), hamstrings (30 sec each), hip flexors (30 sec each), chest stretch, shoulder stretch. Breathe deeply.", duration: 180, type: .cooldown),
        ]
    }

    private static func generateAdvancedUpperBodyExercises() -> [Exercise] {
        // Upper Body Power — extended (~47 min), 3 supersets
        [
            Exercise(name: "Upper Body Warm-Up", instructions: "Arm circles (30 sec), band pull-aparts or arm swings (30 sec), push-up hold (30 sec), hanging from pull-up bar (30 sec). Get shoulders, chest, and back warm.", duration: 150, type: .warmup),
            // Superset 1: Push/Pull
            Exercise(name: "Pull-Ups", instructions: "Overhand grip, hands just wider than shoulders. Pull your chin above the bar, squeezing your lats. Lower with full control. If needed, use a band or do negatives (slow lowering).", duration: 70, type: .work),
            Exercise(name: "Rest", instructions: "Shake out your arms — press is next.", duration: 25, type: .rest),
            Exercise(name: "Dumbbell Floor Press", instructions: "Lie on the floor, dumbbells at chest height. Press up until arms are locked out. The floor limits range of motion, protecting your shoulders. Lower until elbows touch the floor.", duration: 70, type: .work),
            Exercise(name: "Rest", instructions: "Set weights down. Back to the bar.", duration: 30, type: .rest),
            Exercise(name: "Pull-Ups — Set 2", instructions: "Same form. If your grip is fading, switch to chin-ups (palms facing you) for a bicep assist. Full range of motion every rep.", duration: 65, type: .work),
            Exercise(name: "Rest", instructions: "Quick break.", duration: 25, type: .rest),
            Exercise(name: "Floor Press — Set 2", instructions: "Same controlled press. Push for the same rep count as set 1. Keep your feet flat on the floor and core braced.", duration: 65, type: .work),
            Exercise(name: "Superset Rest", instructions: "Walk around and sip water. Next superset targets shoulders and arms.", duration: 60, type: .rest),
            // Superset 2: Shoulders and Arms
            Exercise(name: "Arnold Press", instructions: "Start with dumbbells at shoulder height, palms facing you. As you press overhead, rotate your palms to face forward. Reverse on the way down. Full rotation, full press.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Lower the weights.", duration: 25, type: .rest),
            Exercise(name: "Chin-Ups", instructions: "Underhand (supinated) grip, shoulder-width. Pull until chin clears the bar. Squeeze your biceps at the top. Lower slowly — 3 seconds down.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Drop from the bar and breathe.", duration: 25, type: .rest),
            Exercise(name: "Arnold Press — Set 2", instructions: "Same rotation press. Control the weight through the full range. Don't rush the rotation.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Quick shake.", duration: 25, type: .rest),
            Exercise(name: "Chin-Ups — Set 2", instructions: "Same underhand grip. Slow negatives if you can't get full reps — jump up and lower in 5 seconds.", duration: 55, type: .work),
            Exercise(name: "Superset Rest", instructions: "Walk and recover. Final superset — isolation finishers.", duration: 60, type: .rest),
            // Superset 3: Isolation Finishers
            Exercise(name: "Diamond Push-Ups", instructions: "Hands close together under your chest, forming a diamond with thumbs and index fingers. Lower chest to hands, press back up. Intense tricep focus.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Shake out your triceps.", duration: 20, type: .rest),
            Exercise(name: "Dumbbell Hammer Curls", instructions: "Hold dumbbells with palms facing each other (neutral grip). Curl both weights up without swinging. Squeeze at the top and lower slowly.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Rotate your wrists.", duration: 20, type: .rest),
            Exercise(name: "Dumbbell Lateral Raises", instructions: "Light weights, arms at sides. Raise both arms out to shoulder height. Control the lift — no swinging. Slow 3-second lowering.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Drop the weights.", duration: 20, type: .rest),
            Exercise(name: "Diamond Push-Ups — Set 2", instructions: "Same close-grip push-ups. Go to knees if needed to get quality reps. The burn in your triceps means it's working.", duration: 45, type: .work),
            Exercise(name: "Rest", instructions: "Almost done!", duration: 20, type: .rest),
            Exercise(name: "Bicep Curl 21s", instructions: "7 reps from bottom to halfway, 7 reps from halfway to top, 7 full range reps. No rest between. One of the best bicep finishers there is.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Final exercise!", duration: 20, type: .rest),
            Exercise(name: "Dumbbell Shrugs", instructions: "Heavy dumbbells at your sides. Shrug shoulders straight up to your ears. Hold for 3 seconds at the top, squeezing your traps. Lower slowly.", duration: 50, type: .work),
            Exercise(name: "Upper Body Stretch", instructions: "Doorway chest stretch (30 sec), lat stretch each side (20 sec), overhead tricep stretch each arm (20 sec), cross-body shoulder each arm (20 sec), wrist stretches.", duration: 180, type: .cooldown),
        ]
    }

    private static func generateAdvancedLegExercises() -> [Exercise] {
        // Advanced Leg Destroyer — extended (~48 min), 3 rounds
        [
            Exercise(name: "Dynamic Leg Warm-Up", instructions: "2 minutes: walking lunges, high knees, butt kicks, lateral shuffles, and deep bodyweight squats. Open up hips with 1 minute of leg swings in all directions.", duration: 180, type: .warmup),
            // Round 1
            Exercise(name: "Heavy Goblet Squats", instructions: "Hold the heaviest dumbbell you can manage at your chest. Squat deep — hip crease below knees. Elbows inside knees, chest proud. Explode up.", duration: 65, type: .work),
            Exercise(name: "Rest", instructions: "Walk and shake your legs.", duration: 25, type: .rest),
            Exercise(name: "Kettlebell Swings", instructions: "Explosive hip hinge. The bell should float weightlessly at the top. Snap your hips and squeeze your glutes. Keep your arms relaxed — they're just hooks.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Set the bell down.", duration: 25, type: .rest),
            Exercise(name: "Jump Squats", instructions: "Squat deep, then explode upward as high as you can. Land soft — absorb through your whole foot, bending knees on impact. Reset fully between reps.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Walk it off.", duration: 30, type: .rest),
            Exercise(name: "Single-Leg Romanian Deadlift — Right", instructions: "Hold a dumbbell in your left hand. Hinge forward on your right leg, extending left leg behind you. Lower the weight toward the floor. Squeeze your glute to return.", duration: 55, type: .work),
            Exercise(name: "Single-Leg Romanian Deadlift — Left", instructions: "Switch sides. Dumbbell in right hand, balance on left leg. Same controlled hinge. If balance is tough, lightly touch a wall with your free hand.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Stand and breathe.", duration: 25, type: .rest),
            Exercise(name: "Walking Lunges with Dumbbells", instructions: "Heavy dumbbells at your sides. Deep lunge steps — back knee nearly touching the floor. Drive through the front heel to step into the next lunge.", duration: 60, type: .work),
            Exercise(name: "Round Rest", instructions: "Walk around, get water. Two more rounds. You know what's coming — embrace it.", duration: 75, type: .rest),
            // Round 2
            Exercise(name: "Goblet Squats — Round 2", instructions: "Same deep squats. Try a 3-second pause at the bottom of each rep this round. Own the bottom position.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Quick breather.", duration: 25, type: .rest),
            Exercise(name: "Kettlebell Swings — Round 2", instructions: "Same explosive swings. Focus on a sharper hip snap this round. Power, not endurance.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Set it down.", duration: 25, type: .rest),
            Exercise(name: "Bulgarian Split Squats — Right Leg", instructions: "Rear foot on a chair. Hold dumbbells. Lower until front thigh is parallel. This is where the real work happens. Drive through your front heel.", duration: 55, type: .work),
            Exercise(name: "Bulgarian Split Squats — Left Leg", instructions: "Switch legs. Same depth, same control. Keep your torso upright and core braced.", duration: 55, type: .work),
            Exercise(name: "Rest", instructions: "Two more exercises this round!", duration: 25, type: .rest),
            Exercise(name: "Sumo Squat Pulses", instructions: "Wide stance, toes out. Squat deep and pulse at the bottom — small up-and-down movements without standing fully. Feel the burn in your inner thighs and glutes.", duration: 45, type: .work),
            Exercise(name: "Round Rest", instructions: "Walk it out. Last round — leave nothing.", duration: 75, type: .rest),
            // Round 3 — Finisher
            Exercise(name: "Squat Hold to Calf Raise", instructions: "Hold a half-squat position. Every 5 seconds, rise up onto your toes for a calf raise, then sink back into the squat. Continuous tension.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Stand and shake.", duration: 20, type: .rest),
            Exercise(name: "Reverse Lunges — Alternating", instructions: "No weights needed for this finisher. Fast alternating reverse lunges. Step back, knee down, drive up. Keep the pace high.", duration: 50, type: .work),
            Exercise(name: "Rest", instructions: "Almost done!", duration: 20, type: .rest),
            Exercise(name: "Wall Sit", instructions: "Back flat against the wall, thighs parallel. Hold for the full duration. When it burns, breathe through it. Don't give up early.", duration: 60, type: .work),
            Exercise(name: "Deep Lower Body Stretch", instructions: "Pigeon pose each side (45 sec), kneeling hip flexor stretch each side (30 sec), standing hamstring stretch (30 sec), deep squat hold (30 sec), calf stretch (20 sec each).", duration: 240, type: .cooldown),
        ]
    }

    private static func generateAdvancedCardioExercises() -> [Exercise] {
        // Cardio Endurance Challenge — extended (~47 min)
        [
            Exercise(name: "Jump Rope Warm-Up", instructions: "Easy, steady single jumps for 2 minutes. Then alternate feet (running through the rope) for 1 minute. Focus on rhythm and getting your shoulders warm.", duration: 180, type: .warmup),
            // Block 1
            Exercise(name: "Double Unders", instructions: "Swing the rope fast and jump high enough for it to pass twice under your feet. If doubles are tough, do fast singles and attempt doubles every 5th jump.", duration: 75, type: .work),
            Exercise(name: "Rest", instructions: "Set the rope down. Walk.", duration: 30, type: .rest),
            Exercise(name: "Sprint Intervals", instructions: "Sprint in place for 30 seconds at absolute maximum effort. Then jog slowly for 15 seconds. Repeat until time is up. Leave nothing behind.", duration: 75, type: .work),
            Exercise(name: "Rest", instructions: "Walk and catch your breath.", duration: 30, type: .rest),
            Exercise(name: "Burpee Marathon", instructions: "Continuous burpees at a sustainable pace. Full push-up, full jump. Find a rhythm you can maintain for the entire duration. Don't go out too fast.", duration: 75, type: .work),
            Exercise(name: "Block Rest", instructions: "Walk for a full minute. Sip water. Block 2 coming up.", duration: 60, type: .rest),
            // Block 2
            Exercise(name: "Jump Rope — Fast Singles", instructions: "As fast as you can sustain. Stay on the balls of your feet with minimal ground contact. Quick wrists, relaxed shoulders.", duration: 75, type: .work),
            Exercise(name: "Rest", instructions: "Set the rope down briefly.", duration: 30, type: .rest),
            Exercise(name: "Mountain Climber Sprints", instructions: "Plank position, drive knees to chest as fast as possible. Keep hips low and core tight. This is an all-out effort.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Hold plank briefly, then stand.", duration: 30, type: .rest),
            Exercise(name: "Lateral Shuffle Sprints", instructions: "Shuffle fast to the right 4 steps, touch the ground, shuffle left 4 steps, touch. Stay low, stay fast. Sprint in place for 5 seconds at each end.", duration: 60, type: .work),
            Exercise(name: "Block Rest", instructions: "Walk it out. One more block. You've got this.", duration: 60, type: .rest),
            // Block 3
            Exercise(name: "Jump Rope — Alternating Feet", instructions: "Run through the rope. Start moderate and build to full speed over the duration. Light feet, quick turnover.", duration: 75, type: .work),
            Exercise(name: "Rest", instructions: "Deep breaths.", duration: 30, type: .rest),
            Exercise(name: "High Knees to Burpee", instructions: "10 fast high knees, then drop into a burpee. Stand and repeat. The combination keeps your heart rate maxed.", duration: 60, type: .work),
            Exercise(name: "Rest", instructions: "Walk. Almost there.", duration: 30, type: .rest),
            Exercise(name: "Jump Rope — Final Push", instructions: "Last rope session. Give it everything. Fast singles, attempt doubles, whatever keeps you going at maximum effort. This is your finish line.", duration: 75, type: .work),
            Exercise(name: "Rest", instructions: "Set the rope down.", duration: 30, type: .rest),
            Exercise(name: "All-Out Sprint Finish", instructions: "60 seconds. Sprint in place with absolute maximum effort. Knees high, arms driving. Empty the tank completely. This is the last thing you do.", duration: 60, type: .work),
            Exercise(name: "Cool Down Walk and Stretch", instructions: "Walk slowly for 2 minutes, gradually slowing. Then: calf stretch (30 sec each), quad stretch (30 sec each), hip flexor stretch (30 sec each), shoulder stretch, deep breathing.", duration: 240, type: .cooldown),
        ]
    }

    private static func generateAdvancedYogaExercises() -> [Exercise] {
        // Advanced Yoga Practice — long (~35 min)
        [
            Exercise(name: "Sun Salutation A — 3 Rounds", instructions: "Mountain pose → forward fold → halfway lift → plank → chaturanga → upward dog → downward dog. Hold down dog for 5 breaths. Flow through 3 full rounds smoothly.", duration: 180, type: .warmup),
            Exercise(name: "Warrior III — Right Side", instructions: "From standing, hinge forward and extend your left leg straight behind you. Body parallel to the floor, arms forward or at sides. Find your balance point. Breathe.", duration: 60, type: .work),
            Exercise(name: "Warrior III — Left Side", instructions: "Switch legs. Right leg back, balanced on left. Engage your standing leg glute. Flex the back foot. Gaze at a spot on the floor for balance.", duration: 60, type: .work),
            Exercise(name: "Half Moon — Right Side", instructions: "From Warrior III, place your right hand on the floor (or block). Open your left hip to the ceiling, extending left arm up. Stack hips and shoulders. Hold with steady breathing.", duration: 60, type: .work),
            Exercise(name: "Half Moon — Left Side", instructions: "Switch sides. Left hand down, right hip open to the sky. Flex your top foot and engage both legs. Find the opening through your chest.", duration: 60, type: .work),
            Exercise(name: "Crow Pose", instructions: "Squat with hands on the floor, shoulder-width apart. Place knees on the backs of your upper arms. Lean forward, shifting weight to your hands until feet lift. Hold. Fall is okay — keep trying.", duration: 75, type: .work),
            Exercise(name: "Headstand Preparation", instructions: "Interlace fingers, crown of head on the mat, forearms down. Walk feet in, lift one leg at a time. If you can, extend both legs. Use a wall if needed. Focus on core engagement.", duration: 90, type: .work),
            Exercise(name: "Wheel Pose", instructions: "Lie on your back, feet flat, hands by your ears with fingers pointing toward shoulders. Press up into full backbend. Push through your hands and feet. Hold and breathe into your chest.", duration: 60, type: .work),
            Exercise(name: "Firefly Pose", instructions: "From a forward fold, work your shoulders behind your knees. Plant hands, lean back, and try to extend legs. This is challenging — even a few seconds is a win.", duration: 60, type: .work),
            Exercise(name: "Seated Forward Fold", instructions: "Sit with legs extended. Hinge from your hips (not your lower back) and fold forward over your legs. Reach for your feet or shins. Let gravity pull you deeper with each exhale.", duration: 75, type: .work),
            Exercise(name: "Pigeon Pose — Right Side", instructions: "From downward dog, bring right knee forward behind right wrist. Extend left leg back. Square your hips. Walk your hands forward and fold over your front shin. Deep hip release.", duration: 75, type: .work),
            Exercise(name: "Pigeon Pose — Left Side", instructions: "Switch sides. Left knee forward. Settle your hips and fold forward. Breathe into any tightness. Let your body release gradually.", duration: 75, type: .work),
            Exercise(name: "Shoulder Stand or Legs Up the Wall", instructions: "Roll onto your back. Either lift into shoulder stand (supporting your lower back) or place legs up against a wall. Inversion promotes recovery and calm.", duration: 90, type: .work),
            Exercise(name: "Supine Twist", instructions: "Lying on your back, drop both knees to the right and extend arms. Breathe into the twist. Switch sides halfway. Let your spine decompress.", duration: 90, type: .work),
            Exercise(name: "Savasana", instructions: "Lie flat, arms at sides, palms up. Close your eyes. Release every muscle. Breathe naturally. Stay here for the full duration — this is where the practice integrates.", duration: 240, type: .cooldown),
        ]
    }

    private static func generateAdvancedCircuitExercises() -> [Exercise] {
        // Circuit Training Extreme — long (~35 min), 3 rounds
        [
            Exercise(name: "Dynamic Warm-Up", instructions: "2 minutes of continuous movement: jumping jacks (30s), high knees (30s), bodyweight squats (30s), and push-ups (30s). No rest between.", duration: 150, type: .warmup),
            // Round 1
            Exercise(name: "Dumbbell Thrusters", instructions: "Dumbbells at shoulders. Squat deep, then drive up and press overhead in one explosive motion. The king of full-body exercises. Don't pause between squat and press.", duration: 50, type: .work),
            Exercise(name: "Tuck Jumps", instructions: "From standing, jump as high as you can and pull your knees to your chest at the peak. Land softly with bent knees. Reset briefly between reps.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Walk. Quick recovery.", duration: 20, type: .rest),
            Exercise(name: "Kettlebell Swings", instructions: "Explosive hip snap. Swing to chest height. Glutes squeeze at the top. The bell should float momentarily before dropping back. Power from the hips.", duration: 50, type: .work),
            Exercise(name: "Burpees", instructions: "Full burpees: chest to floor, explosive jump with arms overhead. Every rep is a full rep. Pace yourself — there are 3 rounds.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Stand and breathe.", duration: 25, type: .rest),
            Exercise(name: "Renegade Rows", instructions: "Push-up on dumbbells, then row right, row left. That's one rep. Fight the rotation. Your whole body should be rigid.", duration: 45, type: .work),
            Exercise(name: "Jump Lunges", instructions: "Deep lunge, then explode up and switch legs in the air. Land in the opposite lunge. Soft, controlled landings.", duration: 40, type: .work),
            Exercise(name: "Round Rest", instructions: "Walk around. Sip water. Two more rounds of the same circuit.", duration: 60, type: .rest),
            // Round 2
            Exercise(name: "Thrusters — Round 2", instructions: "Same form, same power. If the weight feels heavy, keep going — this is where the work happens.", duration: 50, type: .work),
            Exercise(name: "Tuck Jumps — Round 2", instructions: "Same explosive jumps. If tucks are gassed, switch to squat jumps. Keep the intensity.", duration: 35, type: .work),
            Exercise(name: "Rest", instructions: "Quick walk.", duration: 20, type: .rest),
            Exercise(name: "Kettlebell Swings — Round 2", instructions: "Sharp hip hinge. The bell doesn't lie — if your hips aren't snapping, it won't float.", duration: 45, type: .work),
            Exercise(name: "Burpees — Round 2", instructions: "Keep the quality. Chest to floor, jump at the top. Step back instead of jumping if needed.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "Walk.", duration: 25, type: .rest),
            Exercise(name: "Devil Press", instructions: "Burpee with dumbbells on the floor. Drop, chest down, then swing the bells directly from the ground to overhead as you stand. One fluid motion.", duration: 45, type: .work),
            Exercise(name: "Mountain Climbers", instructions: "Plank position, sprint your knees to your chest. As fast as you can go while keeping hips low.", duration: 35, type: .work),
            Exercise(name: "Round Rest", instructions: "Last round. Give everything you have left.", duration: 60, type: .rest),
            // Round 3 — Finisher
            Exercise(name: "Thrusters — Final Round", instructions: "Last set of thrusters ever (for today). Make them count. Full depth, full press.", duration: 45, type: .work),
            Exercise(name: "Burpees — Final Round", instructions: "Last burpees. Push through the fatigue. Full reps to the end.", duration: 35, type: .work),
            Exercise(name: "Rest", instructions: "Stand up. One more.", duration: 15, type: .rest),
            Exercise(name: "All-Out Kettlebell Swings", instructions: "Final exercise. Aggressive hip snaps. Every swing is maximum effort. Finish strong.", duration: 40, type: .work),
            Exercise(name: "Cool Down Stretch", instructions: "Walk for 1 minute. Then: child's pose (30 sec), pigeon each side (30 sec), forward fold (30 sec), chest opener (30 sec), deep breathing (1 min).", duration: 180, type: .cooldown),
        ]
    }

    private static func generateQuickPowerExercises() -> [Exercise] {
        // Quick Power Burn — quick (~7 min)
        [
            Exercise(name: "Quick Warm-Up", instructions: "20 seconds jumping jacks, 20 seconds high knees, 20 seconds arm swings. Fast transitions — get warm quickly.", duration: 60, type: .warmup),
            Exercise(name: "Burpees", instructions: "Full burpees at maximum intensity. Chest to floor, explosive jump. No pacing — this workout is short for a reason. Go hard.", duration: 40, type: .work),
            Exercise(name: "Rest", instructions: "10 seconds. Walk.", duration: 10, type: .rest),
            Exercise(name: "Jump Squats", instructions: "Deep squat, explosive jump. Land soft, reset fast, and go again. Maximum height on every rep.", duration: 35, type: .work),
            Exercise(name: "Rest", instructions: "Quick breath.", duration: 10, type: .rest),
            Exercise(name: "Mountain Climber Sprints", instructions: "Plank position, drive knees as fast as possible. Hips low, core tight. Sprint effort for the entire duration.", duration: 35, type: .work),
            Exercise(name: "Rest", instructions: "Stand up. Two more!", duration: 10, type: .rest),
            Exercise(name: "Plyometric Push-Ups", instructions: "Push-up with explosive power — hands leave the floor at the top. Land with soft elbows. If needed, do explosive push-ups from knees.", duration: 30, type: .work),
            Exercise(name: "Rest", instructions: "Last one. Everything you've got.", duration: 10, type: .rest),
            Exercise(name: "Sprawl to Tuck Jump", instructions: "Drop to a sprawl (hands down, feet back, chest to floor), pop up, and immediately explode into a tuck jump. This is the finisher. Go all out.", duration: 30, type: .work),
            Exercise(name: "Cool Down", instructions: "Walk slowly for 30 seconds. Stretch quads, hamstrings, and chest. Take 5 slow, deep breaths. You just crushed a workout in under 7 minutes.", duration: 60, type: .cooldown),
        ]
    }
}
