// User Profile Model - Simplified
// Focused on data that actually influences the app experience

// ============================================
// FITNESS LEVEL
// ============================================

export const FitnessLevel = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

export const FitnessLevelInfo = {
  [FitnessLevel.BEGINNER]: {
    displayName: 'Beginner',
    description: 'New to fitness or getting back into it',
    icon: 'leaf',
  },
  [FitnessLevel.INTERMEDIATE]: {
    displayName: 'Intermediate',
    description: 'Work out regularly, ready for more',
    icon: 'fitness',
  },
  [FitnessLevel.ADVANCED]: {
    displayName: 'Advanced',
    description: 'Experienced and pushing limits',
    icon: 'trophy',
  },
};

// ============================================
// FITNESS GOALS (Outcome-focused)
// ============================================

export const FitnessGoal = {
  STAY_ACTIVE: 'stayActive',
  GET_STRONGER: 'getStronger',
  BUILD_CORE: 'buildCore',
  IMPROVE_FLEXIBILITY: 'improveFlexibility',
};

export const FitnessGoalInfo = {
  [FitnessGoal.STAY_ACTIVE]: {
    displayName: 'Stay Active',
    description: 'Keep moving with quick, easy workouts',
    icon: 'flash',
    // Maps to: Quick Sweats, Desk Workouts
    categories: ['quick_sweats', 'desk'],
  },
  [FitnessGoal.GET_STRONGER]: {
    displayName: 'Get Stronger',
    description: 'Build muscle and increase strength',
    icon: 'barbell',
    // Maps to: Upper Body, Lower Body, Gym workouts
    categories: ['upper_body', 'lower_body', 'legs', 'arms', 'back', 'chest', 'shoulders'],
  },
  [FitnessGoal.BUILD_CORE]: {
    displayName: 'Build Core',
    description: 'Strengthen your core and abs',
    icon: 'ellipse',
    // Maps to: Core
    categories: ['core'],
  },
  [FitnessGoal.IMPROVE_FLEXIBILITY]: {
    displayName: 'Improve Flexibility',
    description: 'Stretch more and move better',
    icon: 'body',
    // Maps to: Flexibility/Yoga content
    categories: ['flexibility', 'yoga', 'stretching'],
  },
};

// ============================================
// WORKOUT DAYS
// ============================================

export const WeekDay = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
};

export const WeekDayInfo = {
  [WeekDay.MONDAY]: { short: 'Mon', letter: 'M' },
  [WeekDay.TUESDAY]: { short: 'Tue', letter: 'T' },
  [WeekDay.WEDNESDAY]: { short: 'Wed', letter: 'W' },
  [WeekDay.THURSDAY]: { short: 'Thu', letter: 'T' },
  [WeekDay.FRIDAY]: { short: 'Fri', letter: 'F' },
  [WeekDay.SATURDAY]: { short: 'Sat', letter: 'S' },
  [WeekDay.SUNDAY]: { short: 'Sun', letter: 'S' },
};

export const WEEK_DAYS_ORDERED = [
  WeekDay.MONDAY,
  WeekDay.TUESDAY,
  WeekDay.WEDNESDAY,
  WeekDay.THURSDAY,
  WeekDay.FRIDAY,
  WeekDay.SATURDAY,
  WeekDay.SUNDAY,
];

// ============================================
// PROFILE STRUCTURE
// ============================================

// Default empty profile
export const createEmptyProfile = () => ({
  // Essential
  hamsterName: null,

  // Fitness preferences (simplified)
  fitnessLevel: null,
  fitnessGoals: [], // Array of FitnessGoal values
  workoutDays: [],  // Array of WeekDay values

  // Profile state
  profileComplete: false,
  profileVersion: 2, // Version 2 = simplified profile

  // Legacy fields (kept for migration)
  // These will be ignored but preserved for existing users
});

// Check if profile needs migration (old format)
export const needsProfileMigration = (profile) => {
  if (!profile) return false;

  // If profile has old fields but no profileVersion or version 1
  const hasOldFields = profile.schedulePreference !== undefined ||
                       profile.preferredWorkoutTime !== undefined ||
                       profile.fitnessIntent !== undefined ||
                       profile.weeklyWorkoutGoal !== undefined;

  const isOldVersion = !profile.profileVersion || profile.profileVersion < 2;

  return hasOldFields && isOldVersion && profile.profileComplete;
};

// Migrate old profile to new format
export const migrateProfile = (oldProfile) => {
  if (!oldProfile) return createEmptyProfile();

  // Map old fitness goals to new ones
  const oldGoals = oldProfile.fitnessGoals || [];
  const newGoals = [];

  // Map old goal types to new
  if (oldGoals.includes('cardio') || oldGoals.includes('generalFitness')) {
    newGoals.push(FitnessGoal.STAY_ACTIVE);
  }
  if (oldGoals.includes('buildMuscle')) {
    newGoals.push(FitnessGoal.GET_STRONGER);
  }
  if (oldGoals.includes('loseFat')) {
    // Map to both stay active and build core
    if (!newGoals.includes(FitnessGoal.STAY_ACTIVE)) {
      newGoals.push(FitnessGoal.STAY_ACTIVE);
    }
    newGoals.push(FitnessGoal.BUILD_CORE);
  }
  if (oldGoals.includes('flexibility')) {
    newGoals.push(FitnessGoal.IMPROVE_FLEXIBILITY);
  }

  // Convert weeklyWorkoutGoal to workout days
  // Default to Mon/Wed/Fri pattern
  let workoutDays = [];
  const weeklyGoal = oldProfile.weeklyWorkoutGoal || 3;

  if (weeklyGoal >= 1) workoutDays.push(WeekDay.MONDAY);
  if (weeklyGoal >= 2) workoutDays.push(WeekDay.WEDNESDAY);
  if (weeklyGoal >= 3) workoutDays.push(WeekDay.FRIDAY);
  if (weeklyGoal >= 4) workoutDays.push(WeekDay.TUESDAY);
  if (weeklyGoal >= 5) workoutDays.push(WeekDay.THURSDAY);
  if (weeklyGoal >= 6) workoutDays.push(WeekDay.SATURDAY);
  if (weeklyGoal >= 7) workoutDays.push(WeekDay.SUNDAY);

  return {
    hamsterName: oldProfile.hamsterName,
    fitnessLevel: oldProfile.fitnessLevel,
    fitnessGoals: newGoals.length > 0 ? newGoals : [FitnessGoal.STAY_ACTIVE],
    workoutDays: workoutDays,
    profileComplete: false, // Mark incomplete so they go through new flow
    profileVersion: 2,
  };
};

// ============================================
// HAMSTER NAME VALIDATION
// ============================================

export const HAMSTER_NAME_MIN_LENGTH = 1;
export const HAMSTER_NAME_MAX_LENGTH = 24;
export const HAMSTER_NAME_PATTERN = /^[a-zA-Z0-9\s\-']+$/;

export const validateHamsterName = (name) => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Your hamster needs a name!' };
  }
  if (name.length > HAMSTER_NAME_MAX_LENGTH) {
    return { valid: false, error: `Name must be ${HAMSTER_NAME_MAX_LENGTH} characters or less` };
  }
  if (!HAMSTER_NAME_PATTERN.test(name)) {
    return { valid: false, error: 'Only letters, numbers, spaces, hyphens, and apostrophes allowed' };
  }
  return { valid: true, error: null };
};

export const HAMSTER_NAME_SUGGESTIONS = ['Hammy', 'Peanut', 'Whiskers', 'Nugget', 'Biscuit', 'Coco'];

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// These are kept so existing code doesn't break
// ============================================

export const SchedulePreference = {
  FIXED: 'fixed',
  FLEXIBLE: 'flexible',
};

export const SchedulePreferenceInfo = {
  [SchedulePreference.FIXED]: {
    displayName: 'Fixed Days',
    description: 'Same days each week',
    icon: 'calendar',
  },
  [SchedulePreference.FLEXIBLE]: {
    displayName: 'Flexible',
    description: 'Any days work',
    icon: 'shuffle',
  },
};

export const WorkoutTime = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  NO_PREFERENCE: 'noPreference',
};

export const WorkoutTimeInfo = {
  [WorkoutTime.MORNING]: { displayName: 'Morning', description: '6am - 12pm', icon: 'sunny' },
  [WorkoutTime.AFTERNOON]: { displayName: 'Afternoon', description: '12pm - 5pm', icon: 'partly-sunny' },
  [WorkoutTime.EVENING]: { displayName: 'Evening', description: '5pm - 10pm', icon: 'moon' },
  [WorkoutTime.NO_PREFERENCE]: { displayName: 'No Preference', description: 'Whenever works!', icon: 'time' },
};

export const FitnessIntent = {
  MAINTAIN: 'maintain',
  IMPROVE: 'improve',
};

export const FitnessIntentInfo = {
  [FitnessIntent.MAINTAIN]: { displayName: 'Maintain', description: 'Keep current level', icon: 'checkmark-circle' },
  [FitnessIntent.IMPROVE]: { displayName: 'Improve', description: 'Push to get better', icon: 'trending-up' },
};
