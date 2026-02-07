//
//  UserProfile.swift
//  MuscleHamster
//
//  User profile model storing onboarding preferences for workout personalization
//

import Foundation

// MARK: - User Profile

struct UserProfile: Codable, Equatable {
    var age: Int?
    var fitnessLevel: FitnessLevel?
    var fitnessGoals: Set<FitnessGoal>
    var weeklyWorkoutGoal: Int?
    var schedulePreference: SchedulePreference?
    var preferredWorkoutTime: WorkoutTime?
    var fitnessIntent: FitnessIntent?
    var hamsterName: String?

    /// Current onboarding step (0-indexed). Used to resume after abandonment.
    var currentStep: Int

    init(
        age: Int? = nil,
        fitnessLevel: FitnessLevel? = nil,
        fitnessGoals: Set<FitnessGoal> = [],
        weeklyWorkoutGoal: Int? = nil,
        schedulePreference: SchedulePreference? = nil,
        preferredWorkoutTime: WorkoutTime? = nil,
        fitnessIntent: FitnessIntent? = nil,
        hamsterName: String? = nil,
        currentStep: Int = 0
    ) {
        self.age = age
        self.fitnessLevel = fitnessLevel
        self.fitnessGoals = fitnessGoals
        self.weeklyWorkoutGoal = weeklyWorkoutGoal
        self.schedulePreference = schedulePreference
        self.preferredWorkoutTime = preferredWorkoutTime
        self.fitnessIntent = fitnessIntent
        self.hamsterName = hamsterName
        self.currentStep = currentStep
    }

    /// Whether all required fields are filled
    var isComplete: Bool {
        age != nil &&
        fitnessLevel != nil &&
        !fitnessGoals.isEmpty &&
        weeklyWorkoutGoal != nil &&
        schedulePreference != nil &&
        preferredWorkoutTime != nil &&
        fitnessIntent != nil &&
        hamsterName != nil && !hamsterName!.isEmpty
    }

    // MARK: - Hamster Name Validation

    /// Minimum length for hamster name
    static let hamsterNameMinLength = 1

    /// Maximum length for hamster name
    static let hamsterNameMaxLength = 24

    /// Validates the hamster name and returns an error message if invalid
    static func validateHamsterName(_ name: String) -> String? {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)

        if trimmed.isEmpty {
            return "Your hamster needs a name!"
        }

        if trimmed.count > hamsterNameMaxLength {
            return "That name is a bit long. Try \(hamsterNameMaxLength) characters or less."
        }

        // Allow letters, numbers, spaces, and common punctuation
        let allowedCharacters = CharacterSet.alphanumerics
            .union(.whitespaces)
            .union(CharacterSet(charactersIn: "-'"))

        if trimmed.unicodeScalars.contains(where: { !allowedCharacters.contains($0) }) {
            return "Please use only letters, numbers, spaces, or hyphens."
        }

        return nil
    }

    /// Whether the hamster name is valid
    static func isValidHamsterName(_ name: String) -> Bool {
        validateHamsterName(name) == nil
    }
}

// MARK: - Fitness Level

enum FitnessLevel: String, Codable, CaseIterable, Identifiable {
    case beginner
    case intermediate
    case advanced

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .beginner: return "Beginner"
        case .intermediate: return "Intermediate"
        case .advanced: return "Advanced"
        }
    }

    var description: String {
        switch self {
        case .beginner: return "New to fitness or getting back into it"
        case .intermediate: return "Regular workouts for a few months"
        case .advanced: return "Consistent training for a year or more"
        }
    }
}

// MARK: - Fitness Goals

enum FitnessGoal: String, Codable, CaseIterable, Identifiable {
    case cardio
    case muscleGain
    case fatLoss
    case flexibility
    case generalFitness

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .cardio: return "Cardio & Endurance"
        case .muscleGain: return "Build Muscle"
        case .fatLoss: return "Lose Weight"
        case .flexibility: return "Flexibility & Mobility"
        case .generalFitness: return "General Fitness"
        }
    }

    var icon: String {
        switch self {
        case .cardio: return "heart.fill"
        case .muscleGain: return "dumbbell.fill"
        case .fatLoss: return "flame.fill"
        case .flexibility: return "figure.flexibility"
        case .generalFitness: return "figure.run"
        }
    }
}

// MARK: - Schedule Preference

enum SchedulePreference: String, Codable, CaseIterable, Identifiable {
    case fixed
    case flexible

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .fixed: return "Fixed Schedule"
        case .flexible: return "Flexible Schedule"
        }
    }

    var description: String {
        switch self {
        case .fixed: return "Same days each week (e.g., Mon, Wed, Fri)"
        case .flexible: return "Any days that work for you"
        }
    }
}

// MARK: - Workout Time

enum WorkoutTime: String, Codable, CaseIterable, Identifiable {
    case morning
    case afternoon
    case evening
    case noPreference

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .morning: return "Morning"
        case .afternoon: return "Afternoon"
        case .evening: return "Evening"
        case .noPreference: return "No Preference"
        }
    }

    var timeRange: String {
        switch self {
        case .morning: return "Before noon"
        case .afternoon: return "12pm - 5pm"
        case .evening: return "After 5pm"
        case .noPreference: return "Whenever works"
        }
    }

    var icon: String {
        switch self {
        case .morning: return "sun.horizon.fill"
        case .afternoon: return "sun.max.fill"
        case .evening: return "moon.fill"
        case .noPreference: return "clock.fill"
        }
    }
}

// MARK: - Fitness Intent

enum FitnessIntent: String, Codable, CaseIterable, Identifiable {
    case maintenance
    case improvement

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .maintenance: return "Maintain"
        case .improvement: return "Improve"
        }
    }

    var description: String {
        switch self {
        case .maintenance: return "Keep my current fitness level steady"
        case .improvement: return "Push myself to get stronger and fitter"
        }
    }
}

// MARK: - UserDefaults Persistence

extension UserProfile {
    private static let storageKey = "partialOnboardingProfile"

    /// Save partial progress to UserDefaults
    func saveToUserDefaults() {
        if let encoded = try? JSONEncoder().encode(self) {
            UserDefaults.standard.set(encoded, forKey: Self.storageKey)
        }
    }

    /// Load partial progress from UserDefaults
    static func loadFromUserDefaults() -> UserProfile? {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let profile = try? JSONDecoder().decode(UserProfile.self, from: data) else {
            return nil
        }
        return profile
    }

    /// Clear saved progress from UserDefaults
    static func clearFromUserDefaults() {
        UserDefaults.standard.removeObject(forKey: storageKey)
    }
}
