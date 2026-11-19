// Activity Model - Phase 05-06
import FeatureFlags from '../config/FeatureFlags';

export const HamsterState = {
  HUNGRY: 'hungry',
  CHILLIN: 'chillin',  // Legacy - maps to RESTED
  RESTED: 'rested',    // New state for rest days
  HAPPY: 'happy',
  EXCITED: 'excited',
  PROUD: 'proud',
};

// Get simplified state (hungry, happy, or rested)
// User requested exactly 3 states: Hungry, Happy, Rested
export const getSimplifiedState = (state) => {
  if (!FeatureFlags.simplifiedHamsterStates) return state;

  switch (state) {
    case HamsterState.HUNGRY:
      return HamsterState.HUNGRY;
    case HamsterState.CHILLIN:
    case HamsterState.RESTED:
      return HamsterState.RESTED;  // Rest day = Rested (not Hungry!)
    case HamsterState.HAPPY:
    case HamsterState.EXCITED:
    case HamsterState.PROUD:
      return HamsterState.HAPPY;
    default:
      return HamsterState.HUNGRY;
  }
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
    displayName: 'Rested',
    description: 'Enjoying a well-deserved rest day',
    greeting: "Rest days are important too!",
    icon: 'moon',
    color: '#8B5A2B',
  },
  [HamsterState.RESTED]: {
    displayName: 'Rested',
    description: 'Enjoying a well-deserved rest day',
    greeting: "Rest days are important too!",
    icon: 'moon',
    color: '#8B5A2B',
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
  QUICK_REST: 'quickRest',
  PET_HAMSTER: 'petHamster',
  GIVE_TREAT: 'giveTreat',
  WALK: 'walk',
  STRETCH: 'stretch',
  JOURNAL: 'journal',
  MEDITATE: 'meditate',
};

export const RestDayActivityInfo = {
  [RestDayActivity.QUICK_REST]: {
    displayName: 'Rest Day',
    description: 'Take a well-deserved rest!',
    icon: 'bed',
    pointsAwarded: 5,
    hamsterReaction: "Rest days are important! Your muscles grow while you recover. I'm proud of you for listening to your body!",
    isQuickInteraction: true,
  },
  [RestDayActivity.PET_HAMSTER]: {
    displayName: 'Pet Your Hamster',
    description: 'Show your hamster some love!',
    icon: 'heart',
    pointsAwarded: 3,
    hamsterReaction: "Aww, that feels nice! *happy squeaks*",
    isQuickInteraction: true,
  },
  [RestDayActivity.GIVE_TREAT]: {
    displayName: 'Give a Treat',
    description: 'Share a yummy snack',
    icon: 'nutrition',
    pointsAwarded: 3,
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
  STREAK_FREEZE: 'streakFreeze',
  SHOP_PURCHASE: 'shopPurchase',
  AD_REWARD: 'adReward',
  STEPS: 'steps',
};

export const TransactionCategoryInfo = {
  [TransactionCategory.WORKOUT]: { displayName: 'Workout', icon: 'fitness', color: '#34C759' },
  [TransactionCategory.REST_DAY]: { displayName: 'Rest Day', icon: 'cafe', color: '#5856D6' },
  [TransactionCategory.STREAK_FREEZE]: { displayName: 'Streak Freeze', icon: 'snow', color: '#5AC8FA' },
  [TransactionCategory.SHOP_PURCHASE]: { displayName: 'Shop', icon: 'bag', color: '#FF9500' },
  [TransactionCategory.AD_REWARD]: { displayName: 'Bonus', icon: 'gift', color: '#FF2D55' },
  [TransactionCategory.STEPS]: { displayName: 'Steps', icon: 'walk', color: '#30B0C7' },
};

// Daily step milestones. Each one pays out once per day.
// Step data is health data (Apple §5.1.3(i)): never pass it to analytics.
export const StepMilestones = [
  { id: 'stroll', steps: 2500, points: 5, label: 'Little stroll' },
  { id: 'walk', steps: 5000, points: 10, label: 'Good walk' },
  { id: 'adventure', steps: 10000, points: 15, label: 'Big adventure' },
];

// ============================================
// TRAINING REWARDS (Phase 1 redesign, Nov 2026)
// Every kind of training earns points through ONE path (ActivityService.recordTraining):
// daily exercise, workout player, custom workouts, journal sets, planned-workout ticks.
// - First training of the day earns a bonus and counts for the streak.
// - Effort points scale with what was actually done (exercises, sets or minutes).
// - Training points are capped per day so they can't be farmed.
// - No penalty for stopping early: you earn for what you did.
// - Weekly goal: train on N different days this week for a one-time bonus.
// ============================================
export const TrainingSource = {
  WORKOUT: 'workout',   // guided workout player
  CUSTOM: 'custom',     // logged custom workout
  JOURNAL: 'journal',   // sets logged for one exercise
  PLANNED: 'planned',   // ticked off a planned workout
};

export const TrainingRewards = {
  firstSessionBonus: 20,
  pointsPerExercise: 5,
  pointsPerSet: 3,
  pointsPerMinute: 1,
  plannedWorkoutPoints: 10,
  maxEffortPointsPerSession: 40,
  maxPointsPerExercisePerDay: 15, // journal: same exercise logged several times in a day
  dailyTrainingCap: 80,           // all training points in one day (steps + rest days are separate)
  weeklyGoalBonus: 25,
  defaultWeeklyTarget: 3,
};

// Effort points for one session. Uses the strongest measure rather than adding them up,
// so one workout isn't counted twice (e.g. exercises AND minutes).
export const calculateEffortPoints = ({ exercises = 0, sets = 0, minutes = 0 } = {}) => {
  const byExercises = Math.max(0, exercises) * TrainingRewards.pointsPerExercise;
  const bySets = Math.max(0, sets) * TrainingRewards.pointsPerSet;
  const byMinutes = Math.max(0, Math.floor(minutes)) * TrainingRewards.pointsPerMinute;
  return Math.min(Math.max(byExercises, bySets, byMinutes), TrainingRewards.maxEffortPointsPerSession);
};

// Weekly target = number of workout days picked in onboarding (1-7), else 3.
export const getWeeklyTarget = (profile) => {
  const days = profile?.workoutDays?.length || 0;
  if (days >= 1 && days <= 7) return days;
  return TrainingRewards.defaultWeeklyTarget;
};

// Local Monday of the week, as YYYY-MM-DD (local time, not UTC).
export const getLocalWeekKey = (date = new Date()) => {
  const d = new Date(date);
  const diff = d.getDay() === 0 ? 6 : d.getDay() - 1;
  d.setDate(d.getDate() - diff);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Points calculation config
export const PointsConfig = {
  dailyExercisePoints: 10,
  streakFreezeCost: 100,
  restDayMaxMultiplier: 1.5,

  // Kept for the guided workout player: effort only, no streak multiplier, no early-stop penalty.
  calculateWorkoutPoints: (exercisesCompleted) =>
    calculateEffortPoints({ exercises: exercisesCompleted }),

  calculateRestDayPoints: (basePoints, currentStreak) => {
    const streakMultiplier = Math.min(1 + (currentStreak * 0.07), PointsConfig.restDayMaxMultiplier);
    return Math.round(basePoints * streakMultiplier);
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
  hamsterState: HamsterState.HAPPY, // new friends start happy, not hungry
  workoutHistory: [],
  restDayHistory: [],
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
