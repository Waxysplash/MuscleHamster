import Foundation

// MARK: - Feature Flags
// Controls which features are enabled in the simplified MVP.
// Set flags to false to defer features to v1.1+

enum FeatureFlags {

    // MARK: - Deferred Features (OFF for Simplified MVP)

    /// Social features: friends, friend streaks, nudges, blocking, privacy controls
    static let socialFeatures = false

    /// Full workout library with browse, filter, recommendations, workout player
    static let workoutLibrary = false

    /// Rest day check-in micro-tasks (pet hamster, give treat, log activity)
    static let restDayCheckIn = false

    /// Complex onboarding questions (fitness level, goals, schedule, etc.)
    static let complexOnboarding = false

    /// Transaction history view in settings
    static let transactionHistory = false

    /// Advanced notifications (streak at risk, custom scheduling)
    static let advancedNotifications = false

    /// Audio system (SFX, music, volume controls)
    static let audioSystem = false

    /// Tips rotation on home screen
    static let tipsRotation = false

    /// Rarity system for shop items
    static let raritySystem = false

    /// Workout feedback (loved/liked/not for me)
    static let workoutFeedback = false

    // MARK: - Core Features (ON for Simplified MVP)

    /// Daily exercise check-in (the ONE action)
    static let dailyExerciseCheckIn = true

    /// Hamster display and customization
    static let hamsterCustomization = true

    /// Streak tracking and streak freeze
    static let streakSystem = true

    /// Points economy and shop
    static let pointsAndShop = true

    /// Growth milestones and celebrations (hamster aging from baby to mature)
    /// When false, hamster is always one stage (no growth)
    static let growthMilestones = false

    /// Basic notifications (daily reminder on/off)
    static let basicNotifications = true

    // MARK: - Navigation

    /// Use tab bar navigation (false = hub navigation from Home)
    static let tabBarNavigation = false

    /// Number of shop items to show (simplified = 12, full = 24)
    static let simplifiedShopItemCount = 12

    // MARK: - Onboarding

    /// Number of onboarding steps (simplified = 2: name hamster, meet hamster)
    /// Full = 8 steps including all fitness questions
    static let simplifiedOnboarding = true

    // MARK: - Hamster States

    /// Use simplified hamster states (happy/hungry only)
    /// Full = happy, chillin, hungry, excited, proud
    static let simplifiedHamsterStates = true
}

// MARK: - Feature Flag Helpers

extension FeatureFlags {

    /// Check if any social features should be shown
    static var showSocialTab: Bool {
        socialFeatures
    }

    /// Check if workouts tab should be shown
    static var showWorkoutsTab: Bool {
        workoutLibrary
    }

    /// Check if rest day option should be shown on home
    static var showRestDayOption: Bool {
        restDayCheckIn
    }

    /// Check if tips should rotate on home screen
    static var showTipsCard: Bool {
        tipsRotation
    }

    /// Check if audio settings should be shown
    static var showAudioSettings: Bool {
        audioSystem
    }

    /// Check if privacy settings should be shown (only needed with social)
    static var showPrivacySettings: Bool {
        socialFeatures
    }

    /// Check if workout schedule settings should be shown
    static var showWorkoutScheduleSettings: Bool {
        workoutLibrary
    }

    /// Check if profile editing should show fitness questions
    static var showFitnessProfileEditing: Bool {
        complexOnboarding
    }
}
