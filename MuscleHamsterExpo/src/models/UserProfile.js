// User Profile Model - Phase 03

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
    description: 'Regular workouts, ready for more challenge',
    icon: 'fitness',
  },
  [FitnessLevel.ADVANCED]: {
    displayName: 'Advanced',
    description: 'Experienced and pushing limits',
    icon: 'trophy',
  },
};

export const FitnessGoal = {
  CARDIO: 'cardio',
  BUILD_MUSCLE: 'buildMuscle',
  LOSE_FAT: 'loseFat',
  FLEXIBILITY: 'flexibility',
  GENERAL_FITNESS: 'generalFitness',
};

export const FitnessGoalInfo = {
  [FitnessGoal.CARDIO]: {
    displayName: 'Cardio',
    description: 'Improve heart health and endurance',
    icon: 'heart',
  },
  [FitnessGoal.BUILD_MUSCLE]: {
    displayName: 'Build Muscle',
    description: 'Get stronger and build lean muscle',
    icon: 'barbell',
  },
  [FitnessGoal.LOSE_FAT]: {
    displayName: 'Lose Fat',
    description: 'Burn calories and lose weight',
    icon: 'flame',
  },
  [FitnessGoal.FLEXIBILITY]: {
    displayName: 'Flexibility',
    description: 'Improve mobility and reduce stiffness',
    icon: 'body',
  },
  [FitnessGoal.GENERAL_FITNESS]: {
    displayName: 'General Fitness',
    description: 'Overall health and wellness',
    icon: 'star',
  },
};

export const SchedulePreference = {
  FIXED: 'fixed',
  FLEXIBLE: 'flexible',
};

export const SchedulePreferenceInfo = {
  [SchedulePreference.FIXED]: {
    displayName: 'Fixed Days',
    description: 'Same days each week (e.g., Mon/Wed/Fri)',
    icon: 'calendar',
  },
  [SchedulePreference.FLEXIBLE]: {
    displayName: 'Flexible',
    description: 'Any days, as long as I hit my goal',
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
  [WorkoutTime.MORNING]: {
    displayName: 'Morning',
    description: '6am - 12pm',
    icon: 'sunny',
  },
  [WorkoutTime.AFTERNOON]: {
    displayName: 'Afternoon',
    description: '12pm - 5pm',
    icon: 'partly-sunny',
  },
  [WorkoutTime.EVENING]: {
    displayName: 'Evening',
    description: '5pm - 10pm',
    icon: 'moon',
  },
  [WorkoutTime.NO_PREFERENCE]: {
    displayName: 'No Preference',
    description: 'Whenever works!',
    icon: 'time',
  },
};

export const FitnessIntent = {
  MAINTAIN: 'maintain',
  IMPROVE: 'improve',
};

export const FitnessIntentInfo = {
  [FitnessIntent.MAINTAIN]: {
    displayName: 'Maintain',
    description: 'Keep my current fitness level',
    icon: 'checkmark-circle',
  },
  [FitnessIntent.IMPROVE]: {
    displayName: 'Improve',
    description: 'Push myself to get better',
    icon: 'trending-up',
  },
};

// Default empty profile
export const createEmptyProfile = () => ({
  age: null,
  fitnessLevel: null,
  fitnessGoals: [],
  weeklyWorkoutGoal: 3,
  schedulePreference: null,
  preferredWorkoutTime: null,
  fitnessIntent: null,
  hamsterName: null,
  profileComplete: false,
});

// Hamster name validation
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
