//
//  Workout.swift
//  MuscleHamster
//
//  Workout model and metadata enums for the workout catalog
//

import Foundation

// MARK: - Exercise

/// An individual exercise within a workout
struct Exercise: Identifiable, Codable, Equatable {
    let id: String
    let name: String
    let instructions: String
    let duration: Int // Duration in seconds
    let type: ExerciseType
    let imageAssetName: String?

    init(
        id: String = UUID().uuidString,
        name: String,
        instructions: String,
        duration: Int,
        type: ExerciseType = .work,
        imageAssetName: String? = nil
    ) {
        self.id = id
        self.name = name
        self.instructions = instructions
        self.duration = duration
        self.type = type
        self.imageAssetName = imageAssetName
    }

    /// Display-friendly duration string
    var displayDuration: String {
        if duration >= 60 {
            let minutes = duration / 60
            let seconds = duration % 60
            if seconds == 0 {
                return "\(minutes) min"
            }
            return "\(minutes):\(String(format: "%02d", seconds))"
        }
        return "\(duration) sec"
    }
}

// MARK: - Exercise Type

enum ExerciseType: String, Codable, CaseIterable, Identifiable {
    case work       // Active exercise
    case rest       // Rest period between exercises
    case warmup     // Warm-up exercise
    case cooldown   // Cool-down exercise

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .work: return "Exercise"
        case .rest: return "Rest"
        case .warmup: return "Warm Up"
        case .cooldown: return "Cool Down"
        }
    }

    var icon: String {
        switch self {
        case .work: return "flame.fill"
        case .rest: return "pause.circle.fill"
        case .warmup: return "sun.max.fill"
        case .cooldown: return "wind"
        }
    }
}

// MARK: - Recommended Workout (with explanation)

/// A workout recommendation with a plain-language explanation of why it was suggested
struct RecommendedWorkout: Identifiable {
    let workout: Workout
    let explanation: String
    let relevanceScore: Int

    var id: String { workout.id }

    /// Creates a recommended workout with explanation
    init(workout: Workout, explanation: String, relevanceScore: Int = 0) {
        self.workout = workout
        self.explanation = explanation
        self.relevanceScore = relevanceScore
    }
}

// MARK: - Workout

struct Workout: Identifiable, Codable, Equatable {
    let id: String
    let name: String
    let description: String

    // Metadata
    let difficulty: FitnessLevel
    let duration: DurationBucket
    let fitnessGoals: Set<FitnessGoal>
    let bodyFocus: Set<BodyFocus>
    let category: WorkoutType

    // Exercises
    let exercises: [Exercise]

    // Additional metadata
    let equipmentRequired: Set<Equipment>
    let calorieEstimate: ClosedRange<Int>?
    let imageAssetName: String?

    init(
        id: String = UUID().uuidString,
        name: String,
        description: String,
        difficulty: FitnessLevel,
        duration: DurationBucket,
        fitnessGoals: Set<FitnessGoal>,
        bodyFocus: Set<BodyFocus>,
        category: WorkoutType,
        exercises: [Exercise] = [],
        equipmentRequired: Set<Equipment> = [],
        calorieEstimate: ClosedRange<Int>? = nil,
        imageAssetName: String? = nil
    ) {
        self.id = id
        self.name = name
        self.description = description
        self.difficulty = difficulty
        self.duration = duration
        self.fitnessGoals = fitnessGoals
        self.bodyFocus = bodyFocus
        self.category = category
        self.exercises = exercises
        self.equipmentRequired = equipmentRequired
        self.calorieEstimate = calorieEstimate
        self.imageAssetName = imageAssetName
    }
}

// MARK: - Workout Helpers

extension Workout {
    /// Default workout for fallback scenarios
    static var placeholder: Workout {
        Workout(
            name: "Quick Workout",
            description: "A simple workout to get you moving",
            difficulty: .beginner,
            duration: .short,
            fitnessGoals: [.generalFitness],
            bodyFocus: [.fullBody],
            category: .strength,
            exercises: [
                Exercise(name: "Warm Up", instructions: "March in place and swing your arms", duration: 30, type: .warmup),
                Exercise(name: "Jumping Jacks", instructions: "Classic jumping jacks at your own pace", duration: 45, type: .work),
                Exercise(name: "Rest", instructions: "Take a breather, you're doing great!", duration: 15, type: .rest),
                Exercise(name: "Bodyweight Squats", instructions: "Keep your back straight and go as low as comfortable", duration: 45, type: .work),
                Exercise(name: "Cool Down", instructions: "Gentle stretching and deep breaths", duration: 30, type: .cooldown),
            ],
            equipmentRequired: [.none]
        )
    }

    /// Display-friendly duration string
    var displayDuration: String {
        duration.timeRange
    }

    /// Display-friendly difficulty string
    var displayDifficulty: String {
        difficulty.displayName
    }

    /// Whether this workout requires no equipment
    var isEquipmentFree: Bool {
        equipmentRequired.isEmpty || equipmentRequired == [.none]
    }

    /// Total duration in seconds calculated from exercises
    var totalDurationSeconds: Int {
        exercises.reduce(0) { $0 + $1.duration }
    }

    /// Display-friendly total duration from exercises
    var displayTotalDuration: String {
        let total = totalDurationSeconds
        if total >= 60 {
            let minutes = total / 60
            let seconds = total % 60
            if seconds == 0 {
                return "\(minutes) min"
            }
            return "\(minutes) min \(seconds) sec"
        }
        return "\(total) sec"
    }
}

// MARK: - Duration Bucket

enum DurationBucket: String, Codable, CaseIterable, Identifiable {
    case quick       // 5-10 minutes
    case short       // 10-20 minutes
    case medium      // 20-30 minutes
    case long        // 30-45 minutes
    case extended    // 45+ minutes

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .quick: return "Quick"
        case .short: return "Short"
        case .medium: return "Medium"
        case .long: return "Long"
        case .extended: return "Extended"
        }
    }

    var timeRange: String {
        switch self {
        case .quick: return "5-10 min"
        case .short: return "10-20 min"
        case .medium: return "20-30 min"
        case .long: return "30-45 min"
        case .extended: return "45+ min"
        }
    }

    var icon: String {
        switch self {
        case .quick: return "bolt.fill"
        case .short: return "timer"
        case .medium: return "clock.fill"
        case .long: return "clock.badge.checkmark.fill"
        case .extended: return "hourglass"
        }
    }

    /// Approximate midpoint in minutes for sorting/calculations
    var approximateMinutes: Int {
        switch self {
        case .quick: return 7
        case .short: return 15
        case .medium: return 25
        case .long: return 37
        case .extended: return 50
        }
    }
}

// MARK: - Body Focus

enum BodyFocus: String, Codable, CaseIterable, Identifiable {
    case upperBody
    case lowerBody
    case core
    case fullBody
    case back
    case arms
    case chest
    case shoulders
    case legs
    case glutes

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .upperBody: return "Upper Body"
        case .lowerBody: return "Lower Body"
        case .core: return "Core"
        case .fullBody: return "Full Body"
        case .back: return "Back"
        case .arms: return "Arms"
        case .chest: return "Chest"
        case .shoulders: return "Shoulders"
        case .legs: return "Legs"
        case .glutes: return "Glutes"
        }
    }

    var icon: String {
        switch self {
        case .upperBody: return "figure.arms.open"
        case .lowerBody: return "figure.walk"
        case .core: return "figure.core.training"
        case .fullBody: return "figure.stand"
        case .back: return "figure.rowing"
        case .arms: return "figure.strengthtraining.traditional"
        case .chest: return "figure.mixed.cardio"
        case .shoulders: return "figure.boxing"
        case .legs: return "figure.run"
        case .glutes: return "figure.hiking"
        }
    }
}

// MARK: - Workout Type

enum WorkoutType: String, Codable, CaseIterable, Identifiable {
    case strength
    case cardio
    case hiit
    case flexibility
    case yoga
    case pilates
    case circuit
    case mobility

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .strength: return "Strength"
        case .cardio: return "Cardio"
        case .hiit: return "HIIT"
        case .flexibility: return "Flexibility"
        case .yoga: return "Yoga"
        case .pilates: return "Pilates"
        case .circuit: return "Circuit"
        case .mobility: return "Mobility"
        }
    }

    var icon: String {
        switch self {
        case .strength: return "dumbbell.fill"
        case .cardio: return "heart.fill"
        case .hiit: return "bolt.heart.fill"
        case .flexibility: return "figure.flexibility"
        case .yoga: return "figure.yoga"
        case .pilates: return "figure.pilates"
        case .circuit: return "arrow.triangle.2.circlepath"
        case .mobility: return "figure.cooldown"
        }
    }

    var description: String {
        switch self {
        case .strength: return "Build muscle and increase strength"
        case .cardio: return "Improve heart health and endurance"
        case .hiit: return "High-intensity interval training"
        case .flexibility: return "Improve range of motion"
        case .yoga: return "Mind-body connection and flexibility"
        case .pilates: return "Core strength and stability"
        case .circuit: return "Full-body combination workouts"
        case .mobility: return "Joint health and movement quality"
        }
    }
}

// MARK: - Equipment

enum Equipment: String, Codable, CaseIterable, Identifiable {
    case none
    case dumbbells
    case resistanceBands
    case kettlebell
    case pullUpBar
    case yogaMat
    case jumpRope
    case bench

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .none: return "No Equipment"
        case .dumbbells: return "Dumbbells"
        case .resistanceBands: return "Resistance Bands"
        case .kettlebell: return "Kettlebell"
        case .pullUpBar: return "Pull-up Bar"
        case .yogaMat: return "Yoga Mat"
        case .jumpRope: return "Jump Rope"
        case .bench: return "Bench"
        }
    }

    var icon: String {
        switch self {
        case .none: return "figure.wave"
        case .dumbbells: return "dumbbell.fill"
        case .resistanceBands: return "lasso"
        case .kettlebell: return "scalemass.fill"
        case .pullUpBar: return "rectangle.split.3x3"
        case .yogaMat: return "rectangle.portrait"
        case .jumpRope: return "lasso.and.sparkles"
        case .bench: return "chair.fill"
        }
    }
}
