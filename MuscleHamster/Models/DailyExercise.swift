//
//  DailyExercise.swift
//  MuscleHamster
//
//  Daily check-in exercise model — one random simple exercise per day
//  Deterministic selection using stable hash (same exercise all day for a given user)
//

import Foundation

// MARK: - Daily Exercise

/// A simple bodyweight exercise for the daily check-in
struct DailyExercise: Identifiable, Equatable {
    let id: String
    let name: String
    let instruction: String
    let repCount: Int
    let icon: String  // SF Symbol name
    let encouragement: String  // Hamster-voiced encouragement

    /// Display prompt like "Do 10 Squats"
    var displayPrompt: String {
        "Do \(repCount) \(name)"
    }

    // MARK: - Exercise Pool (~35 exercises)

    static let pool: [DailyExercise] = [
        DailyExercise(id: "squats", name: "Squats", instruction: "Stand with feet shoulder-width apart, lower down like sitting in a chair, then stand back up.", repCount: 10, icon: "figure.strengthtraining.traditional", encouragement: "You crushed those squats! I'm so proud of you!"),
        DailyExercise(id: "jumping_jacks", name: "Jumping Jacks", instruction: "Jump while spreading your arms and legs, then jump back to standing.", repCount: 15, icon: "figure.jumprope", encouragement: "Woohoo! Those jumping jacks got my heart pumping too!"),
        DailyExercise(id: "push_ups", name: "Push-Ups", instruction: "Start in plank position, lower your chest to the floor, then push back up. Knees down is totally fine!", repCount: 8, icon: "figure.strengthtraining.functional", encouragement: "Amazing push-ups! You're getting stronger every day!"),
        DailyExercise(id: "lunges", name: "Lunges", instruction: "Step forward with one leg, lower your hips until both knees are bent, then step back. Alternate legs.", repCount: 10, icon: "figure.walk", encouragement: "Those lunges looked great! Your legs are going to thank you!"),
        DailyExercise(id: "plank_hold", name: "Second Plank Hold", instruction: "Hold a plank position on your forearms and toes. Keep your body in a straight line.", repCount: 20, icon: "figure.core.training", encouragement: "Wow, you held that plank like a champ! Core of steel!"),
        DailyExercise(id: "high_knees", name: "High Knees", instruction: "Jog in place, bringing your knees up toward your chest as high as comfortable.", repCount: 20, icon: "figure.run", encouragement: "Those high knees were awesome! You're a natural!"),
        DailyExercise(id: "calf_raises", name: "Calf Raises", instruction: "Stand on your toes, lifting your heels off the ground, then slowly lower back down.", repCount: 15, icon: "figure.stairs", encouragement: "Nice calf raises! Those legs are getting strong!"),
        DailyExercise(id: "arm_circles", name: "Arm Circles", instruction: "Extend your arms to the sides and make small circles. Switch direction halfway.", repCount: 20, icon: "figure.arms.open", encouragement: "Great arm circles! Feeling loose and limber!"),
        DailyExercise(id: "mountain_climbers", name: "Mountain Climbers", instruction: "In plank position, alternate driving your knees toward your chest quickly.", repCount: 12, icon: "figure.hiking", encouragement: "You climbed that mountain! Nothing can stop us!"),
        DailyExercise(id: "burpees", name: "Burpees", instruction: "Squat down, jump feet back to plank, do a push-up, jump feet forward, then jump up.", repCount: 5, icon: "figure.mixed.cardio", encouragement: "Five burpees! That's seriously impressive. You're a rockstar!"),
        DailyExercise(id: "wall_sit", name: "Second Wall Sit", instruction: "Lean against a wall with your knees at 90 degrees. Hold the position.", repCount: 20, icon: "figure.strengthtraining.traditional", encouragement: "That wall sit was tough but you did it! So strong!"),
        DailyExercise(id: "toe_touches", name: "Toe Touches", instruction: "Stand tall, then bend forward and reach for your toes. It's okay if you can't touch them!", repCount: 10, icon: "figure.flexibility", encouragement: "Great stretching! Flexibility is a superpower!"),
        DailyExercise(id: "glute_bridges", name: "Glute Bridges", instruction: "Lie on your back, knees bent, feet flat. Lift your hips toward the ceiling, squeeze, then lower.", repCount: 12, icon: "figure.pilates", encouragement: "Those bridges were perfect! Your glutes are thanking you!"),
        DailyExercise(id: "bicycle_crunches", name: "Bicycle Crunches", instruction: "Lie on your back, hands behind your head. Alternate touching your elbow to the opposite knee.", repCount: 12, icon: "figure.core.training", encouragement: "Awesome crunches! Your core is getting so strong!"),
        DailyExercise(id: "standing_side_bends", name: "Side Bends", instruction: "Stand with feet hip-width apart, reach one arm overhead and lean to the opposite side. Alternate.", repCount: 10, icon: "figure.flexibility", encouragement: "Nice side bends! That's great for your obliques!"),
        DailyExercise(id: "step_ups", name: "Step-Ups", instruction: "Find a sturdy step or low chair. Step up with one foot, bring the other up, then step down. Alternate.", repCount: 10, icon: "figure.stairs", encouragement: "Those step-ups were great! One step at a time!"),
        DailyExercise(id: "tricep_dips", name: "Tricep Dips", instruction: "Use a sturdy chair edge. Lower your body by bending your elbows, then push back up.", repCount: 8, icon: "figure.strengthtraining.functional", encouragement: "Awesome dips! Those arms are getting toned!"),
        DailyExercise(id: "donkey_kicks", name: "Donkey Kicks", instruction: "On all fours, kick one leg back and up toward the ceiling. Keep your core tight. Alternate legs.", repCount: 10, icon: "figure.pilates", encouragement: "Great donkey kicks! Your hamster is kicking along with you!"),
        DailyExercise(id: "superman_holds", name: "Second Superman Hold", instruction: "Lie face down, extend arms forward. Lift arms, chest, and legs off the ground simultaneously.", repCount: 15, icon: "figure.core.training", encouragement: "You looked like a superhero! Back muscles activated!"),
        DailyExercise(id: "jumping_squats", name: "Jump Squats", instruction: "Do a squat, then explode upward into a jump. Land softly and repeat.", repCount: 8, icon: "figure.jumprope", encouragement: "Those jump squats were explosive! You're getting so powerful!"),
        DailyExercise(id: "hip_circles", name: "Hip Circles", instruction: "Stand on one leg and make circles with the other hip. Switch legs halfway.", repCount: 10, icon: "figure.cooldown", encouragement: "Nice hip circles! Keeping those joints happy and healthy!"),
        DailyExercise(id: "leg_raises", name: "Leg Raises", instruction: "Lie on your back, legs straight. Lift both legs up toward the ceiling, then slowly lower.", repCount: 10, icon: "figure.core.training", encouragement: "Strong leg raises! Your core is really working hard!"),
        DailyExercise(id: "inchworms", name: "Inchworms", instruction: "Stand tall, bend forward, walk hands out to plank, then walk hands back and stand up.", repCount: 5, icon: "figure.flexibility", encouragement: "Inchworms are so fun! Great full-body stretch!"),
        DailyExercise(id: "side_lunges", name: "Side Lunges", instruction: "Step wide to one side, bending that knee while keeping the other leg straight. Alternate.", repCount: 8, icon: "figure.walk", encouragement: "Those side lunges hit different! Great inner thigh work!"),
        DailyExercise(id: "flutter_kicks", name: "Flutter Kicks", instruction: "Lie on your back, lift both legs slightly. Alternate kicking up and down in small movements.", repCount: 15, icon: "figure.core.training", encouragement: "Flutter kicks done! Your abs are on fire (in a good way)!"),
        DailyExercise(id: "shoulder_taps", name: "Shoulder Taps", instruction: "In plank position, tap your left shoulder with your right hand, then switch. Stay stable!", repCount: 10, icon: "figure.strengthtraining.functional", encouragement: "Great shoulder taps! Balance and strength combined!"),
        DailyExercise(id: "reverse_lunges", name: "Reverse Lunges", instruction: "Step one foot backward, lower into a lunge, then return to standing. Alternate legs.", repCount: 10, icon: "figure.walk", encouragement: "Reverse lunges are so good for your legs! Well done!"),
        DailyExercise(id: "seated_twist", name: "Seated Twists", instruction: "Sit on the floor, lean back slightly, and twist your torso side to side. Keep your core engaged.", repCount: 12, icon: "figure.core.training", encouragement: "Those twists felt great, right? Obliques engaged!"),
        DailyExercise(id: "standing_march", name: "Standing Marches", instruction: "March in place, lifting your knees high and swinging your arms. Nice and steady.", repCount: 20, icon: "figure.walk", encouragement: "Great marching! Every step counts toward a healthier you!"),
        DailyExercise(id: "skater_hops", name: "Skater Hops", instruction: "Hop side to side on one foot, swinging your arms like a speed skater.", repCount: 10, icon: "figure.mixed.cardio", encouragement: "Those skater hops were awesome! Great for balance!"),
        DailyExercise(id: "dead_bugs", name: "Dead Bugs", instruction: "Lie on your back, arms up, knees bent at 90 degrees. Extend opposite arm and leg, then switch.", repCount: 10, icon: "figure.pilates", encouragement: "Dead bugs are sneaky hard! Your core did amazing!"),
        DailyExercise(id: "bird_dogs", name: "Bird Dogs", instruction: "On all fours, extend your right arm and left leg simultaneously. Hold, then switch sides.", repCount: 8, icon: "figure.core.training", encouragement: "Bird dogs are so good for balance and core! Nailed it!"),
        DailyExercise(id: "lateral_raises_bodyweight", name: "Arm Lateral Raises", instruction: "Stand with arms at your sides. Raise them out to the sides until shoulder height, then lower slowly.", repCount: 12, icon: "figure.arms.open", encouragement: "Great lateral raises! Those shoulders are getting strong!"),
        DailyExercise(id: "knee_push_ups", name: "Knee Push-Ups", instruction: "Like regular push-ups but with knees on the ground. Lower your chest, then push back up.", repCount: 10, icon: "figure.strengthtraining.functional", encouragement: "Perfect form! Knee push-ups are just as awesome!"),
        DailyExercise(id: "standing_crunches", name: "Standing Crunches", instruction: "Stand tall, bring one knee up while crunching your elbow toward it. Alternate sides.", repCount: 12, icon: "figure.core.training", encouragement: "Standing crunches are underrated! Great job!"),
    ]

    // MARK: - Deterministic Daily Selection

    /// Get today's exercise for a specific user (deterministic — same all day)
    static func todaysExercise(for userId: String) -> DailyExercise {
        let calendar = Calendar.current
        let now = Date()
        let dayOfYear = calendar.ordinality(of: .day, in: .year, for: now) ?? 1
        let year = calendar.component(.year, from: now)

        // Use djb2 hash on userId bytes + day-of-year + year for stable, deterministic selection
        let seed = djb2Hash(userId: userId, dayOfYear: dayOfYear, year: year)

        // Map to pool index
        let index = Int(seed % UInt64(pool.count))
        return pool[index]
    }

    /// djb2 hash — stable across runs (unlike Swift's hashValue which is randomized)
    private static func djb2Hash(userId: String, dayOfYear: Int, year: Int) -> UInt64 {
        let input = "\(userId)_\(dayOfYear)_\(year)"
        var hash: UInt64 = 5381
        for byte in input.utf8 {
            hash = ((hash &<< 5) &+ hash) &+ UInt64(byte)  // hash * 33 + byte
        }
        return hash
    }
}

// MARK: - Daily Exercise Check-In Record

/// Records a completed daily exercise check-in
struct DailyExerciseCheckIn: Codable, Identifiable, Equatable {
    let id: String
    let exerciseId: String
    let exerciseName: String
    let completedAt: Date
    let pointsEarned: Int

    var displayDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: completedAt)
    }
}
