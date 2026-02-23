// Feature Flags - Simplified MVP
// Controls which features are enabled. Set to false to defer features to v1.1+

export const FeatureFlags = {
  // DEFERRED FEATURES (OFF for Simplified MVP)

  // Social features: friends, friend streaks, nudges, blocking, privacy controls
  socialFeatures: false,

  // Full workout library with browse, filter, recommendations, workout player
  workoutLibrary: true,

  // Rest day check-in micro-tasks (pet hamster, give treat, log activity)
  restDayCheckIn: false,

  // Complex onboarding questions (fitness level, goals, schedule, etc.)
  complexOnboarding: false,

  // Transaction history view in settings
  transactionHistory: false,

  // Advanced notifications (streak at risk, custom scheduling)
  advancedNotifications: false,

  // Audio system (SFX, music, volume controls)
  audioSystem: false,

  // Tips rotation on home screen
  tipsRotation: false,

  // Rarity system for shop items
  raritySystem: false,

  // Workout feedback (loved/liked/not for me)
  workoutFeedback: false,

  // Growth milestones (hamster aging from baby to mature)
  // When false, hamster is always one stage (adult)
  growthMilestones: false,

  // CORE FEATURES (ON for Simplified MVP)

  // Daily exercise check-in (the ONE action)
  dailyExerciseCheckIn: true,

  // Hamster display and customization
  hamsterCustomization: true,

  // Streak tracking and streak freeze
  streakSystem: true,

  // Points economy and shop
  pointsAndShop: true,

  // Basic notifications (daily reminder on/off)
  basicNotifications: true,

  // NAVIGATION

  // Use tab bar navigation (false = hub navigation from Home)
  tabBarNavigation: true,

  // Simplified onboarding (2 steps: age gate + name hamster)
  simplifiedOnboarding: true,

  // Simplified hamster states (happy/hungry only)
  simplifiedHamsterStates: true,
};

// Helper functions
export const showSocialTab = () => FeatureFlags.socialFeatures;
export const showWorkoutsTab = () => FeatureFlags.workoutLibrary;
export const showRestDayOption = () => FeatureFlags.restDayCheckIn;
export const showTipsCard = () => FeatureFlags.tipsRotation;
export const showAudioSettings = () => FeatureFlags.audioSystem;
export const showPrivacySettings = () => FeatureFlags.socialFeatures;
export const showTransactionHistory = () => FeatureFlags.transactionHistory;
export const showGrowthMilestones = () => FeatureFlags.growthMilestones;

export default FeatureFlags;
