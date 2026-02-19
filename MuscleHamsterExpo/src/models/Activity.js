// Activity Model - Phase 05-06

export const HamsterState = {
  HUNGRY: 'hungry',
  CHILLIN: 'chillin',
  HAPPY: 'happy',
  EXCITED: 'excited',
  PROUD: 'proud',
};

export const HamsterStateInfo = {
  [HamsterState.HUNGRY]: {
    displayName: 'Hungry',
    description: "I'm getting hungry... time for a workout?",
    greeting: "I'm feeling peckish! Let's earn some food!",
    icon: 'fast-food',
    color: '#FF9500',
  },
  [HamsterState.CHILLIN]: {
    displayName: 'Chillin\'',
    description: 'Relaxing after a good workout',
    greeting: "Ahh, this is nice. We're doing great!",
    icon: 'cafe',
    color: '#5AC8FA',
  },
  [HamsterState.HAPPY]: {
    displayName: 'Happy',
    description: 'Feeling good and well-fed!',
    greeting: "I'm feeling great today!",
    icon: 'happy',
    color: '#34C759',
  },
  [HamsterState.EXCITED]: {
    displayName: 'Excited',
    description: 'On a streak and loving it!',
    greeting: "We're on fire! Keep it up!",
    icon: 'flame',
    color: '#FF3B30',
  },
  [HamsterState.PROUD]: {
    displayName: 'Proud',
    description: 'Celebrating a big milestone!',
    greeting: "I'm so proud of us! We're amazing!",
    icon: 'trophy',
    color: '#FFD700',
  },
};

export const RestDayActivity = {
  PET_HAMSTER: 'petHamster',
  GIVE_TREAT: 'giveTreat',
  WALK: 'walk',
  STRETCH: 'stretch',
  JOURNAL: 'journal',
  MEDITATE: 'meditate',
};

export const RestDayActivityInfo = {
  [RestDayActivity.PET_HAMSTER]: {
    displayName: 'Pet Your Hamster',
    description: 'Show your hamster some love!',
    icon: 'heart',
    pointsAwarded: 10,
    hamsterReaction: "Aww, that feels nice! *happy squeaks*",
    isQuickInteraction: true,
  },
  [RestDayActivity.GIVE_TREAT]: {
    displayName: 'Give a Treat',
    description: 'Share a yummy snack',
    icon: 'nutrition',
    pointsAwarded: 10,
    hamsterReaction: "Mmm, delicious! You're the best!",
    isQuickInteraction: true,
  },
  [RestDayActivity.WALK]: {
    displayName: 'Log a Walk',
    description: 'Even a short walk counts!',
    icon: 'walk',
    pointsAwarded: 15,
    hamsterReaction: "A walk sounds lovely! Fresh air is good for us.",
    isQuickInteraction: false,
  },
  [RestDayActivity.STRETCH]: {
    displayName: 'Log Stretching',
    description: 'Keep those muscles happy',
    icon: 'body',
    pointsAwarded: 15,
    hamsterReaction: "Stretching is so important! Good choice!",
    isQuickInteraction: false,
  },
  [RestDayActivity.JOURNAL]: {
    displayName: 'Journal',
    description: 'Reflect on your progress',
    icon: 'book',
    pointsAwarded: 12,
    hamsterReaction: "Taking time to reflect? That's wonderful!",
    isQuickInteraction: false,
  },
  [RestDayActivity.MEDITATE]: {
    displayName: 'Meditate',
    description: 'A moment of mindfulness',
    icon: 'leaf',
    pointsAwarded: 12,
    hamsterReaction: "Ohmmm... peace and calm. I love it!",
    isQuickInteraction: false,
  },
};

export const WorkoutFeedback = {
  LOVED: 'loved',
  LIKED: 'liked',
  NOT_FOR_ME: 'notForMe',
};

export const WorkoutFeedbackInfo = {
  [WorkoutFeedback.LOVED]: {
    displayName: 'Loved It!',
    icon: 'heart',
    isPositive: true,
  },
  [WorkoutFeedback.LIKED]: {
    displayName: 'Liked It',
    icon: 'thumbs-up',
    isPositive: true,
  },
  [WorkoutFeedback.NOT_FOR_ME]: {
    displayName: 'Not For Me',
    icon: 'thumbs-down',
    isPositive: false,
  },
};

export const StreakStatus = {
  ACTIVE: 'active',
  AT_RISK: 'atRisk',
  BROKEN: 'broken',
  NONE: 'none',
};

export const TransactionType = {
  EARN: 'earn',
  SPEND: 'spend',
};

export const TransactionCategory = {
  WORKOUT: 'workout',
  REST_DAY: 'restDay',
  DAILY_CHECK_IN: 'dailyCheckIn',
  STREAK_FREEZE: 'streakFreeze',
  SHOP_PURCHASE: 'shopPurchase',
  AD_REWARD: 'adReward',
};

export const TransactionCategoryInfo = {
  [TransactionCategory.WORKOUT]: { displayName: 'Workout', icon: 'fitness', color: '#34C759' },
  [TransactionCategory.REST_DAY]: { displayName: 'Rest Day', icon: 'cafe', color: '#5856D6' },
  [TransactionCategory.DAILY_CHECK_IN]: { displayName: 'Daily Exercise', icon: 'checkmark-circle', color: '#007AFF' },
  [TransactionCategory.STREAK_FREEZE]: { displayName: 'Streak Freeze', icon: 'snow', color: '#5AC8FA' },
  [TransactionCategory.SHOP_PURCHASE]: { displayName: 'Shop', icon: 'bag', color: '#FF9500' },
  [TransactionCategory.AD_REWARD]: { displayName: 'Bonus', icon: 'gift', color: '#FF2D55' },
};

// Points calculation config
export const PointsConfig = {
  baseWorkoutPoints: 50,
  pointsPerExercise: 5,
  streakFreezeCost: 100,
  maxStreakMultiplier: 2.0,
  restDayMaxMultiplier: 1.5,
  dailyCheckInBasePoints: 25,
  dailyCheckInMaxMultiplier: 1.5,

  calculateWorkoutPoints: (exercisesCompleted, currentStreak, wasPartial = false) => {
    let points = PointsConfig.baseWorkoutPoints + (exercisesCompleted * PointsConfig.pointsPerExercise);

    // Streak multiplier: 1x at 0, up to 2x at 7+ days
    const streakMultiplier = Math.min(1 + (currentStreak * 0.14), PointsConfig.maxStreakMultiplier);
    points = Math.round(points * streakMultiplier);

    // Partial completion penalty
    if (wasPartial) {
      points = Math.round(points * 0.7);
    }

    return points;
  },

  calculateRestDayPoints: (basePoints, currentStreak) => {
    const streakMultiplier = Math.min(1 + (currentStreak * 0.07), PointsConfig.restDayMaxMultiplier);
    return Math.round(basePoints * streakMultiplier);
  },

  calculateDailyCheckInPoints: (currentStreak) => {
    const streakMultiplier = Math.min(1 + (currentStreak * 0.07), PointsConfig.dailyCheckInMaxMultiplier);
    return Math.round(PointsConfig.dailyCheckInBasePoints * streakMultiplier);
  },
};

// Create default user stats
export const createDefaultUserStats = () => ({
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalWorkoutsCompleted: 0,
  totalRestDayCheckIns: 0,
  lastActivityDate: null,
  lastCheckInDate: null,
  previousBrokenStreak: null,
  hamsterState: HamsterState.HUNGRY,
  workoutHistory: [],
  restDayHistory: [],
  dailyCheckInHistory: [],
  workoutFeedback: {},
  transactions: [],
});

// Create workout completion record
export const createWorkoutCompletion = ({
  id,
  workoutId,
  workoutName,
  completedAt,
  exercisesCompleted,
  totalExercises,
  durationSeconds,
  pointsEarned,
  wasPartial = false,
  feedback = null,
}) => ({
  id,
  workoutId,
  workoutName,
  completedAt,
  exercisesCompleted,
  totalExercises,
  durationSeconds,
  pointsEarned,
  wasPartial,
  feedback,
});

// Create rest day check-in record
export const createRestDayCheckIn = ({
  id,
  activity,
  completedAt,
  pointsEarned,
}) => ({
  id,
  activity,
  completedAt,
  pointsEarned,
});

// Create daily exercise check-in record
export const createDailyExerciseCheckIn = ({
  id,
  exerciseId,
  exerciseName,
  completedAt,
  pointsEarned,
}) => ({
  id,
  exerciseId,
  exerciseName,
  completedAt,
  pointsEarned,
});

// Create transaction record
export const createTransaction = ({
  id,
  type,
  category,
  amount,
  description,
  timestamp,
  entityId = null,
  balanceAfter,
}) => ({
  id,
  type,
  category,
  amount,
  description,
  timestamp,
  entityId,
  balanceAfter,
});
