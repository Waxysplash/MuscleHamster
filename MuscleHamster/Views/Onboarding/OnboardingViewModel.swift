//
//  OnboardingViewModel.swift
//  MuscleHamster
//
//  ObservableObject managing onboarding flow state, navigation, and persistence
//

import SwiftUI

enum OnboardingStep: Int, CaseIterable {
    case age = 0
    case fitnessLevel = 1
    case goals = 2
    case frequency = 3
    case schedule = 4
    case time = 5
    case intent = 6
    case hamsterName = 7
    case meetHamster = 8

    var title: String {
        switch self {
        case .age: return "Your Age"
        case .fitnessLevel: return "Fitness Level"
        case .goals: return "Your Goals"
        case .frequency: return "Weekly Goal"
        case .schedule: return "Schedule Style"
        case .time: return "Preferred Time"
        case .intent: return "Your Focus"
        case .hamsterName: return "Name Your Hamster"
        case .meetHamster: return "Meet Your Hamster"
        }
    }

    static var totalSteps: Int { allCases.count }
}

@MainActor
class OnboardingViewModel: ObservableObject {
    // MARK: - Published Properties

    @Published var currentStep: OnboardingStep = .age
    @Published var profile: UserProfile
    @Published var isLoading = false
    @Published var error: String?
    @Published var showExitConfirmation = false

    // MARK: - Initialization

    init() {
        // Attempt to restore partial progress
        if let savedProfile = UserProfile.loadFromUserDefaults() {
            self.profile = savedProfile
            self.currentStep = OnboardingStep(rawValue: savedProfile.currentStep) ?? .age
        } else {
            self.profile = UserProfile()
        }
    }

    // MARK: - Navigation

    var canGoBack: Bool {
        currentStep.rawValue > 0
    }

    var canProceed: Bool {
        switch currentStep {
        case .age:
            return profile.age != nil && profile.age! >= 13 && profile.age! <= 120
        case .fitnessLevel:
            return profile.fitnessLevel != nil
        case .goals:
            return !profile.fitnessGoals.isEmpty
        case .frequency:
            return profile.weeklyWorkoutGoal != nil && profile.weeklyWorkoutGoal! >= 1 && profile.weeklyWorkoutGoal! <= 7
        case .schedule:
            return profile.schedulePreference != nil
        case .time:
            return profile.preferredWorkoutTime != nil
        case .intent:
            return profile.fitnessIntent != nil
        case .hamsterName:
            return profile.hamsterName != nil && UserProfile.isValidHamsterName(profile.hamsterName!)
        case .meetHamster:
            return true // Always can proceed from the meet screen
        }
    }

    var isLastStep: Bool {
        currentStep.rawValue == OnboardingStep.totalSteps - 1
    }

    var progressFraction: Double {
        Double(currentStep.rawValue + 1) / Double(OnboardingStep.totalSteps)
    }

    func goBack() {
        guard canGoBack else { return }
        currentStep = OnboardingStep(rawValue: currentStep.rawValue - 1) ?? .age
        saveProgress()
    }

    func goNext() {
        guard canProceed else { return }

        if isLastStep {
            // Final step - completion handled by container
            return
        }

        currentStep = OnboardingStep(rawValue: currentStep.rawValue + 1) ?? currentStep
        profile.currentStep = currentStep.rawValue
        saveProgress()
    }

    // MARK: - Profile Updates

    func setAge(_ age: Int) {
        profile.age = age
    }

    func setFitnessLevel(_ level: FitnessLevel) {
        profile.fitnessLevel = level
    }

    func toggleGoal(_ goal: FitnessGoal) {
        if profile.fitnessGoals.contains(goal) {
            profile.fitnessGoals.remove(goal)
        } else {
            profile.fitnessGoals.insert(goal)
        }
    }

    func setWeeklyWorkoutGoal(_ days: Int) {
        profile.weeklyWorkoutGoal = days
    }

    func setSchedulePreference(_ preference: SchedulePreference) {
        profile.schedulePreference = preference
    }

    func setPreferredWorkoutTime(_ time: WorkoutTime) {
        profile.preferredWorkoutTime = time
    }

    func setFitnessIntent(_ intent: FitnessIntent) {
        profile.fitnessIntent = intent
    }

    func setHamsterName(_ name: String) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        profile.hamsterName = trimmed.isEmpty ? nil : trimmed
    }

    // MARK: - Persistence

    private func saveProgress() {
        profile.saveToUserDefaults()
    }

    func clearProgress() {
        UserProfile.clearFromUserDefaults()
        profile = UserProfile()
        currentStep = .age
    }

    // MARK: - Completion

    func completeOnboarding() async -> UserProfile? {
        guard profile.isComplete else {
            error = "Please complete all questions before continuing."
            return nil
        }

        isLoading = true
        error = nil

        // Simulate network delay for saving profile
        try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds

        // Clear partial progress from UserDefaults
        UserProfile.clearFromUserDefaults()

        isLoading = false
        return profile
    }

    func clearError() {
        error = nil
    }
}
