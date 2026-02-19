// Workout Model - Phase 04-05

export const DurationBucket = {
  QUICK: 'quick',
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
  EXTENDED: 'extended',
};

export const DurationBucketInfo = {
  [DurationBucket.QUICK]: { displayName: 'Quick', range: '5-10 min', minutes: 7 },
  [DurationBucket.SHORT]: { displayName: 'Short', range: '10-20 min', minutes: 15 },
  [DurationBucket.MEDIUM]: { displayName: 'Medium', range: '20-30 min', minutes: 25 },
  [DurationBucket.LONG]: { displayName: 'Long', range: '30-45 min', minutes: 37 },
  [DurationBucket.EXTENDED]: { displayName: 'Extended', range: '45+ min', minutes: 50 },
};

export const BodyFocus = {
  FULL_BODY: 'fullBody',
  UPPER_BODY: 'upperBody',
  LOWER_BODY: 'lowerBody',
  CORE: 'core',
  BACK: 'back',
  CHEST: 'chest',
  ARMS: 'arms',
  LEGS: 'legs',
  GLUTES: 'glutes',
  SHOULDERS: 'shoulders',
};

export const BodyFocusInfo = {
  [BodyFocus.FULL_BODY]: { displayName: 'Full Body', icon: 'body' },
  [BodyFocus.UPPER_BODY]: { displayName: 'Upper Body', icon: 'fitness' },
  [BodyFocus.LOWER_BODY]: { displayName: 'Lower Body', icon: 'walk' },
  [BodyFocus.CORE]: { displayName: 'Core', icon: 'ellipse' },
  [BodyFocus.BACK]: { displayName: 'Back', icon: 'arrow-back' },
  [BodyFocus.CHEST]: { displayName: 'Chest', icon: 'shield' },
  [BodyFocus.ARMS]: { displayName: 'Arms', icon: 'hand-left' },
  [BodyFocus.LEGS]: { displayName: 'Legs', icon: 'footsteps' },
  [BodyFocus.GLUTES]: { displayName: 'Glutes', icon: 'trending-up' },
  [BodyFocus.SHOULDERS]: { displayName: 'Shoulders', icon: 'expand' },
};

export const WorkoutType = {
  STRENGTH: 'strength',
  CARDIO: 'cardio',
  HIIT: 'hiit',
  YOGA: 'yoga',
  STRETCHING: 'stretching',
  PILATES: 'pilates',
  MOBILITY: 'mobility',
  CIRCUIT: 'circuit',
};

export const WorkoutTypeInfo = {
  [WorkoutType.STRENGTH]: { displayName: 'Strength', icon: 'barbell', color: '#FF6B6B', description: 'Build muscle and get stronger' },
  [WorkoutType.CARDIO]: { displayName: 'Cardio', icon: 'heart', color: '#FF9500', description: 'Get your heart pumping' },
  [WorkoutType.HIIT]: { displayName: 'HIIT', icon: 'flash', color: '#FF3B30', description: 'High intensity, maximum results' },
  [WorkoutType.YOGA]: { displayName: 'Yoga', icon: 'leaf', color: '#34C759', description: 'Mind-body connection' },
  [WorkoutType.STRETCHING]: { displayName: 'Stretching', icon: 'body', color: '#5856D6', description: 'Improve flexibility' },
  [WorkoutType.PILATES]: { displayName: 'Pilates', icon: 'ellipse', color: '#AF52DE', description: 'Core strength and control' },
  [WorkoutType.MOBILITY]: { displayName: 'Mobility', icon: 'sync', color: '#00C7BE', description: 'Move better, feel better' },
  [WorkoutType.CIRCUIT]: { displayName: 'Circuit', icon: 'repeat', color: '#FF2D55', description: 'Non-stop action' },
};

export const Equipment = {
  NONE: 'none',
  DUMBBELLS: 'dumbbells',
  KETTLEBELL: 'kettlebell',
  RESISTANCE_BANDS: 'resistanceBands',
  YOGA_MAT: 'yogaMat',
  PULL_UP_BAR: 'pullUpBar',
  JUMP_ROPE: 'jumpRope',
  BENCH: 'bench',
};

export const EquipmentInfo = {
  [Equipment.NONE]: { displayName: 'No Equipment', icon: 'checkmark-circle' },
  [Equipment.DUMBBELLS]: { displayName: 'Dumbbells', icon: 'barbell' },
  [Equipment.KETTLEBELL]: { displayName: 'Kettlebell', icon: 'fitness' },
  [Equipment.RESISTANCE_BANDS]: { displayName: 'Resistance Bands', icon: 'git-pull-request' },
  [Equipment.YOGA_MAT]: { displayName: 'Yoga Mat', icon: 'square' },
  [Equipment.PULL_UP_BAR]: { displayName: 'Pull-up Bar', icon: 'remove' },
  [Equipment.JUMP_ROPE]: { displayName: 'Jump Rope', icon: 'pulse' },
  [Equipment.BENCH]: { displayName: 'Bench', icon: 'bed' },
};

export const ExerciseType = {
  WORK: 'work',
  REST: 'rest',
  WARMUP: 'warmup',
  COOLDOWN: 'cooldown',
};

export const ExerciseTypeInfo = {
  [ExerciseType.WORK]: { displayName: 'Work', icon: 'flash', color: '#FF9500' },
  [ExerciseType.REST]: { displayName: 'Rest', icon: 'pause', color: '#8E8E93' },
  [ExerciseType.WARMUP]: { displayName: 'Warm Up', icon: 'sunny', color: '#FFCC00' },
  [ExerciseType.COOLDOWN]: { displayName: 'Cool Down', icon: 'snow', color: '#5AC8FA' },
};

// Create a workout object
export const createWorkout = ({
  id,
  name,
  description,
  category,
  difficulty,
  duration,
  fitnessGoals = [],
  bodyFocus = [],
  equipment = [Equipment.NONE],
  exercises = [],
  isNew = false,
  isFeatured = false,
}) => ({
  id,
  name,
  description,
  category,
  difficulty,
  duration,
  fitnessGoals,
  bodyFocus,
  equipment,
  exercises,
  isNew,
  isFeatured,
  totalDurationSeconds: exercises.reduce((sum, ex) => sum + ex.duration, 0),
});

// Create an exercise object
export const createExercise = ({
  id,
  name,
  instructions,
  duration,
  type = ExerciseType.WORK,
}) => ({
  id,
  name,
  instructions,
  duration,
  type,
});
