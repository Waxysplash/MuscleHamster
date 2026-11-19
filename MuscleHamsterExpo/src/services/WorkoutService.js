// Workout Service - Phase 04
// Enhanced with features from Swift MockWorkoutService
// Includes: Advanced recommendation algorithm, body focus rotation, fitness intent

import { FitnessLevel, FitnessIntent } from '../models/UserProfile';
import {
  WorkoutType,
  DurationBucket,
  DurationBucketInfo,
  BodyFocus,
  Equipment,
  ExerciseType,
  createWorkout,
  createExercise,
} from '../models/Workout';
import { FitnessGoal } from '../models/UserProfile';
import { getMoveGuide } from '../models/MoveGuide';

// Simulate network delay (randomized like Swift version)
const delay = (minMs = 300, maxMs = 800) => {
  const ms = Math.random() * (maxMs - minMs) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ============================================
// MOVE LISTS (beginner reviews, Nov 2026)
// Beginners get their own low-impact lists (no jumping, chair/wall versions).
// Upper- and lower-body workouts get their own moves instead of the full-body list.
// Every move's plain how-to + easier version comes from models/MoveGuide.js.
// ============================================
const MOVES = {
  [WorkoutType.STRENGTH]: ['Push-Ups', 'Squats', 'Lunges', 'Plank', 'Dips', 'Glute Bridges', 'Superman', 'Wall Sit', 'Mountain Climbers'],
  [WorkoutType.CARDIO]: ['Jumping Jacks', 'High Knees', 'Butt Kicks', 'Burpees', 'Skaters', 'Jump Squats', 'Running in Place', 'Box Steps', 'Seal Jacks'],
  [WorkoutType.HIIT]: ['Burpees', 'Jump Squats', 'Mountain Climbers', 'High Knees', 'Tuck Jumps', 'Push-Up Jacks', 'Speed Skaters', 'Plank Jacks', 'Split Jumps'],
  [WorkoutType.YOGA]: ['Cat-Cow', 'Downward Dog', 'Warrior I', 'Warrior II', 'Tree Pose', "Child's Pose", 'Cobra', 'Triangle Pose', 'Pigeon Pose'],
  [WorkoutType.STRETCHING]: ['Neck Rolls', 'Shoulder Stretch', 'Tricep Stretch', 'Quad Stretch', 'Hamstring Stretch', 'Hip Flexor Stretch', 'Calf Stretch', 'Spinal Twist', 'Figure Four Stretch'],
  [WorkoutType.PILATES]: ['The Hundred', 'Roll Up', 'Single Leg Circles', 'Rolling Like a Ball', 'Single Leg Stretch', 'Double Leg Stretch', 'Scissors', 'Criss Cross', 'Teaser'],
  [WorkoutType.MOBILITY]: ['Arm Circles', 'Hip Circles', 'Leg Swings', 'Ankle Rotations', 'Cat-Cow', 'Thread the Needle', "World's Greatest Stretch", '90/90 Stretch', 'Thoracic Rotations'],
  [WorkoutType.CIRCUIT]: ['Push-Ups', 'Squats', 'Plank Hold', 'Jumping Jacks', 'Lunges', 'Mountain Climbers', 'Bicycle Crunches', 'Burpees', 'High Knees'],
};

const BEGINNER_MOVES = {
  [WorkoutType.STRENGTH]: ['Wall Push-Ups', 'Chair Squats', 'Glute Bridges', 'Knee Plank', 'Bird Dog', 'Reverse Lunges', 'Calf Raises', 'Superman', 'Wall Sit'],
  [WorkoutType.CARDIO]: ['Marching in Place', 'Step Jacks', 'Standing Knee Lifts', 'Side Steps', 'Shadow Boxing', 'Butt Kicks', 'Box Steps', 'Running in Place'],
  [WorkoutType.HIIT]: ['Marching in Place', 'Chair Squats', 'Shadow Boxing', 'Step Jacks', 'Standing Knee Lifts', 'Wall Push-Ups', 'Side Steps', 'Glute Bridges', 'Box Steps'],
  [WorkoutType.CIRCUIT]: ['Wall Push-Ups', 'Chair Squats', 'Knee Plank', 'Step Jacks', 'Reverse Lunges', 'Glute Bridges', 'Dead Bug', 'Marching in Place', 'Bird Dog'],
  [WorkoutType.PILATES]: ['Dead Bug', 'Bird Dog', 'Knee Plank', 'Glute Bridges', 'Heel Taps', 'Side-Lying Leg Raises', 'Superman', 'Single Leg Circles', 'Cat-Cow'],
  [WorkoutType.YOGA]: MOVES[WorkoutType.YOGA],
  [WorkoutType.STRETCHING]: MOVES[WorkoutType.STRETCHING],
  [WorkoutType.MOBILITY]: MOVES[WorkoutType.MOBILITY],
};

const FOCUS_MOVES = {
  upper: {
    beginner: ['Wall Push-Ups', 'Knee Push-Ups', 'Superman', 'Arm Circles', 'Knee Plank', 'Bird Dog', 'Shoulder Stretch'],
    intermediate: ['Push-Ups', 'Dips', 'Plank Shoulder Taps', 'Superman', 'Plank', 'Knee Push-Ups', 'Arm Circles'],
    advanced: ['Push-Ups', 'Pike Push-Ups', 'Dips', 'Plank Shoulder Taps', 'Superman', 'Side Plank', 'Plank', 'Arm Circles', 'Push-Up Jacks'],
  },
  lower: {
    beginner: ['Chair Squats', 'Glute Bridges', 'Reverse Lunges', 'Calf Raises', 'Side-Lying Leg Raises', 'Wall Sit', 'Box Steps'],
    intermediate: ['Squats', 'Reverse Lunges', 'Glute Bridges', 'Wall Sit', 'Calf Raises', 'Side-Lying Leg Raises', 'Lunges'],
    advanced: ['Squats', 'Lunges', 'Jump Squats', 'Glute Bridges', 'Wall Sit', 'Split Jumps', 'Calf Raises', 'Side-Lying Leg Raises', 'Box Steps'],
  },
};

const getFocus = (bodyFocus = []) => {
  if (bodyFocus.includes(BodyFocus.UPPER_BODY)) return 'upper';
  if (bodyFocus.includes(BodyFocus.LOWER_BODY)) return 'lower';
  return null;
};

const getMoveNames = (type, difficulty, bodyFocus) => {
  const focus = type === WorkoutType.STRENGTH ? getFocus(bodyFocus) : null;
  if (focus) return FOCUS_MOVES[focus][difficulty] || FOCUS_MOVES[focus].intermediate;
  if (difficulty === FitnessLevel.BEGINNER) return BEGINNER_MOVES[type] || BEGINNER_MOVES[WorkoutType.STRENGTH];
  return MOVES[type] || MOVES[WorkoutType.STRENGTH];
};

const getMoveSeconds = (type, difficulty) => {
  if (type === WorkoutType.YOGA) return 45;
  if (type === WorkoutType.STRETCHING || type === WorkoutType.MOBILITY) return 30;
  if (type === WorkoutType.HIIT) return difficulty === FitnessLevel.BEGINNER ? 30 : 20;
  return difficulty === FitnessLevel.BEGINNER ? 30 : difficulty === FitnessLevel.INTERMEDIATE ? 40 : 45;
};

const makeMove = (id, name, duration, type, extra = {}) => {
  const guide = getMoveGuide(name);
  return {
    ...createExercise({ id, name, instructions: guide.how || '', duration, type }),
    how: guide.how || '',
    easier: guide.easier || null,
    ...extra,
  };
};

// Generate exercises for a workout
const generateExercises = (workoutType, difficulty, duration, bodyFocus = []) => {
  const exercises = [];
  let id = 1;

  exercises.push(makeMove(`ex-${id++}`, 'Warm Up', 60, ExerciseType.WARMUP));

  const names = getMoveNames(workoutType, difficulty, bodyFocus);
  const numExercises = duration === DurationBucket.QUICK ? 3 :
                       duration === DurationBucket.SHORT ? 5 :
                       duration === DurationBucket.MEDIUM ? 7 : 9;
  const circuit = names.slice(0, Math.min(numExercises, names.length));
  const moveSeconds = getMoveSeconds(workoutType, difficulty);
  const restSeconds = difficulty === FitnessLevel.BEGINNER ? 30 : 20;

  // Repeat the moves in rounds until the workout matches its labelled length
  const targetSeconds = (DurationBucketInfo[duration]?.minutes || 15) * 60 - 120; // minus warm-up + cool-down
  let workSeconds = 0;
  let round = 1;

  while (circuit.length > 0) {
    for (let i = 0; i < circuit.length; i++) {
      exercises.push(makeMove(`ex-${id++}`, circuit[i], moveSeconds, ExerciseType.WORK, { round }));
      workSeconds += moveSeconds;
      if (workSeconds >= targetSeconds) break;

      exercises.push({
        ...createExercise({
          id: `ex-${id++}`,
          name: 'Rest',
          instructions: 'Breathe and shake out your arms and legs.',
          duration: restSeconds,
          type: ExerciseType.REST,
        }),
        round,
      });
      workSeconds += restSeconds;
    }
    if (workSeconds >= targetSeconds) break;
    round += 1;
  }

  exercises.push(makeMove(`ex-${id++}`, 'Cool Down', 60, ExerciseType.COOLDOWN));

  // Tell every item how many rounds there are (the player shows "Round 2 of 3")
  const totalRounds = round;
  return exercises.map((e) => ({ ...e, totalRounds }));
};

// Seed workout data
const createSeedWorkouts = () => {
  const workouts = [];

  // Beginner workouts
  workouts.push(createWorkout({
    id: 'w-1',
    name: 'Beginner Full Body',
    description: 'A gentle introduction to strength training for your whole body.',
    category: WorkoutType.STRENGTH,
    difficulty: FitnessLevel.BEGINNER,
    duration: DurationBucket.SHORT,
    fitnessGoals: [FitnessGoal.GET_STRONGER, FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.STRENGTH, FitnessLevel.BEGINNER, DurationBucket.SHORT),
    isNew: true,
  }));

  workouts.push(createWorkout({
    id: 'w-2',
    name: 'Easy Cardio Starter',
    description: 'Get your heart pumping with these beginner-friendly moves.',
    category: WorkoutType.CARDIO,
    difficulty: FitnessLevel.BEGINNER,
    duration: DurationBucket.QUICK,
    fitnessGoals: [FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.CARDIO, FitnessLevel.BEGINNER, DurationBucket.QUICK),
  }));

  workouts.push(createWorkout({
    id: 'w-3',
    name: 'Gentle Yoga Flow',
    description: 'Relax and stretch with this calming yoga session.',
    category: WorkoutType.YOGA,
    difficulty: FitnessLevel.BEGINNER,
    duration: DurationBucket.MEDIUM,
    fitnessGoals: [FitnessGoal.IMPROVE_FLEXIBILITY, FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.YOGA_MAT],
    exercises: generateExercises(WorkoutType.YOGA, FitnessLevel.BEGINNER, DurationBucket.MEDIUM),
    isFeatured: true,
  }));

  workouts.push(createWorkout({
    id: 'w-4',
    name: 'Morning Stretch',
    description: 'Wake up your body with gentle stretches.',
    category: WorkoutType.STRETCHING,
    difficulty: FitnessLevel.BEGINNER,
    duration: DurationBucket.QUICK,
    fitnessGoals: [FitnessGoal.IMPROVE_FLEXIBILITY],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.STRETCHING, FitnessLevel.BEGINNER, DurationBucket.QUICK),
  }));

  // Intermediate workouts
  workouts.push(createWorkout({
    id: 'w-5',
    name: 'Core Crusher',
    description: 'Target your abs and core with this focused workout.',
    category: WorkoutType.PILATES,
    difficulty: FitnessLevel.INTERMEDIATE,
    duration: DurationBucket.SHORT,
    fitnessGoals: [FitnessGoal.GET_STRONGER, FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.CORE],
    equipment: [Equipment.YOGA_MAT],
    exercises: generateExercises(WorkoutType.PILATES, FitnessLevel.INTERMEDIATE, DurationBucket.SHORT),
    isFeatured: true,
  }));

  workouts.push(createWorkout({
    id: 'w-6',
    name: 'Cardio Blast',
    description: 'Get your heart racing with this energetic session.',
    category: WorkoutType.CARDIO,
    difficulty: FitnessLevel.INTERMEDIATE,
    duration: DurationBucket.MEDIUM,
    fitnessGoals: [FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.CARDIO, FitnessLevel.INTERMEDIATE, DurationBucket.MEDIUM),
  }));

  workouts.push(createWorkout({
    id: 'w-7',
    name: 'Upper Body Strength',
    description: 'Build strong arms, chest, and back.',
    category: WorkoutType.STRENGTH,
    difficulty: FitnessLevel.INTERMEDIATE,
    duration: DurationBucket.MEDIUM,
    fitnessGoals: [FitnessGoal.GET_STRONGER],
    bodyFocus: [BodyFocus.UPPER_BODY, BodyFocus.ARMS, BodyFocus.CHEST, BodyFocus.BACK],
    equipment: [Equipment.DUMBBELLS],
    exercises: generateExercises(WorkoutType.STRENGTH, FitnessLevel.INTERMEDIATE, DurationBucket.MEDIUM),
    isNew: true,
  }));

  workouts.push(createWorkout({
    id: 'w-8',
    name: 'HIIT Express',
    description: 'Quick but intense - maximum results in minimum time!',
    category: WorkoutType.HIIT,
    difficulty: FitnessLevel.INTERMEDIATE,
    duration: DurationBucket.QUICK,
    fitnessGoals: [FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.HIIT, FitnessLevel.INTERMEDIATE, DurationBucket.QUICK),
  }));

  // Advanced workouts
  workouts.push(createWorkout({
    id: 'w-9',
    name: 'Power Circuit',
    description: 'A challenging circuit to test your limits.',
    category: WorkoutType.CIRCUIT,
    difficulty: FitnessLevel.ADVANCED,
    duration: DurationBucket.LONG,
    fitnessGoals: [FitnessGoal.GET_STRONGER, FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.DUMBBELLS, Equipment.KETTLEBELL],
    exercises: generateExercises(WorkoutType.CIRCUIT, FitnessLevel.ADVANCED, DurationBucket.LONG),
    isFeatured: true,
  }));

  workouts.push(createWorkout({
    id: 'w-10',
    name: 'Advanced HIIT',
    description: 'High intensity for experienced athletes.',
    category: WorkoutType.HIIT,
    difficulty: FitnessLevel.ADVANCED,
    duration: DurationBucket.MEDIUM,
    fitnessGoals: [FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.HIIT, FitnessLevel.ADVANCED, DurationBucket.MEDIUM),
  }));

  workouts.push(createWorkout({
    id: 'w-11',
    name: 'Leg Day Destroyer',
    description: 'Your legs will thank you... eventually.',
    category: WorkoutType.STRENGTH,
    difficulty: FitnessLevel.ADVANCED,
    duration: DurationBucket.LONG,
    fitnessGoals: [FitnessGoal.GET_STRONGER],
    bodyFocus: [BodyFocus.LOWER_BODY, BodyFocus.LEGS, BodyFocus.GLUTES],
    equipment: [Equipment.DUMBBELLS],
    exercises: generateExercises(WorkoutType.STRENGTH, FitnessLevel.ADVANCED, DurationBucket.LONG),
  }));

  workouts.push(createWorkout({
    id: 'w-12',
    name: 'Advanced Mobility Flow',
    description: 'Deep mobility work for recovery and performance.',
    category: WorkoutType.MOBILITY,
    difficulty: FitnessLevel.ADVANCED,
    duration: DurationBucket.MEDIUM,
    fitnessGoals: [FitnessGoal.IMPROVE_FLEXIBILITY, FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.YOGA_MAT],
    exercises: generateExercises(WorkoutType.MOBILITY, FitnessLevel.ADVANCED, DurationBucket.MEDIUM),
  }));

  // Additional Beginner Workouts (matching Swift catalog)
  workouts.push(createWorkout({
    id: 'w-13',
    name: 'Core Foundations',
    description: 'Build a strong core with beginner-friendly exercises.',
    category: WorkoutType.STRENGTH,
    difficulty: FitnessLevel.BEGINNER,
    duration: DurationBucket.SHORT,
    fitnessGoals: [FitnessGoal.GET_STRONGER, FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.CORE],
    equipment: [Equipment.YOGA_MAT],
    exercises: generateExercises(WorkoutType.PILATES, FitnessLevel.BEGINNER, DurationBucket.SHORT),
  }));

  workouts.push(createWorkout({
    id: 'w-14',
    name: 'Upper Body Introduction',
    description: 'Strengthen your arms, chest, and back with simple movements.',
    category: WorkoutType.STRENGTH,
    difficulty: FitnessLevel.BEGINNER,
    duration: DurationBucket.SHORT,
    fitnessGoals: [FitnessGoal.GET_STRONGER],
    bodyFocus: [BodyFocus.UPPER_BODY, BodyFocus.ARMS, BodyFocus.CHEST],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.STRENGTH, FitnessLevel.BEGINNER, DurationBucket.SHORT),
  }));

  workouts.push(createWorkout({
    id: 'w-15',
    name: 'Lower Body Basics',
    description: 'Build leg strength with squats and lunges.',
    category: WorkoutType.STRENGTH,
    difficulty: FitnessLevel.BEGINNER,
    duration: DurationBucket.SHORT,
    fitnessGoals: [FitnessGoal.GET_STRONGER, FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.LOWER_BODY, BodyFocus.LEGS, BodyFocus.GLUTES],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.STRENGTH, FitnessLevel.BEGINNER, DurationBucket.SHORT),
  }));

  workouts.push(createWorkout({
    id: 'w-16',
    name: 'Beginner HIIT Intro',
    description: 'Low-impact intervals to build endurance.',
    category: WorkoutType.HIIT,
    difficulty: FitnessLevel.BEGINNER,
    duration: DurationBucket.SHORT,
    fitnessGoals: [FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.HIIT, FitnessLevel.BEGINNER, DurationBucket.SHORT),
    isNew: true,
  }));

  workouts.push(createWorkout({
    id: 'w-17',
    name: 'Beginner Cardio Dance',
    description: 'Fun, low-impact cardio moves to get your heart pumping.',
    category: WorkoutType.CARDIO,
    difficulty: FitnessLevel.BEGINNER,
    duration: DurationBucket.MEDIUM,
    fitnessGoals: [FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.CARDIO, FitnessLevel.BEGINNER, DurationBucket.MEDIUM),
  }));

  // Additional Intermediate Workouts
  workouts.push(createWorkout({
    id: 'w-18',
    name: 'Intermediate Strength Circuit',
    description: 'Full-body strength training with compound movements.',
    category: WorkoutType.CIRCUIT,
    difficulty: FitnessLevel.INTERMEDIATE,
    duration: DurationBucket.MEDIUM,
    fitnessGoals: [FitnessGoal.GET_STRONGER, FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.DUMBBELLS],
    exercises: generateExercises(WorkoutType.CIRCUIT, FitnessLevel.INTERMEDIATE, DurationBucket.MEDIUM),
  }));

  workouts.push(createWorkout({
    id: 'w-19',
    name: 'Core Power',
    description: 'Intensive core workout for strength and stability.',
    category: WorkoutType.STRENGTH,
    difficulty: FitnessLevel.INTERMEDIATE,
    duration: DurationBucket.SHORT,
    fitnessGoals: [FitnessGoal.GET_STRONGER],
    bodyFocus: [BodyFocus.CORE],
    equipment: [Equipment.YOGA_MAT],
    exercises: generateExercises(WorkoutType.PILATES, FitnessLevel.INTERMEDIATE, DurationBucket.SHORT),
  }));

  workouts.push(createWorkout({
    id: 'w-20',
    name: 'Leg Day Challenge',
    description: 'Build powerful legs with progressive exercises.',
    category: WorkoutType.STRENGTH,
    difficulty: FitnessLevel.INTERMEDIATE,
    duration: DurationBucket.LONG,
    fitnessGoals: [FitnessGoal.GET_STRONGER],
    bodyFocus: [BodyFocus.LOWER_BODY, BodyFocus.LEGS, BodyFocus.GLUTES],
    equipment: [Equipment.DUMBBELLS],
    exercises: generateExercises(WorkoutType.STRENGTH, FitnessLevel.INTERMEDIATE, DurationBucket.LONG),
  }));

  workouts.push(createWorkout({
    id: 'w-21',
    name: 'Intermediate HIIT Burn',
    description: 'Challenging intervals for maximum fat burn.',
    category: WorkoutType.HIIT,
    difficulty: FitnessLevel.INTERMEDIATE,
    duration: DurationBucket.MEDIUM,
    fitnessGoals: [FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.HIIT, FitnessLevel.INTERMEDIATE, DurationBucket.MEDIUM),
    isFeatured: true,
  }));

  workouts.push(createWorkout({
    id: 'w-22',
    name: 'Pilates Core Focus',
    description: 'Strengthen your core with controlled movements.',
    category: WorkoutType.PILATES,
    difficulty: FitnessLevel.INTERMEDIATE,
    duration: DurationBucket.MEDIUM,
    fitnessGoals: [FitnessGoal.GET_STRONGER, FitnessGoal.IMPROVE_FLEXIBILITY],
    bodyFocus: [BodyFocus.CORE, BodyFocus.FULL_BODY],
    equipment: [Equipment.YOGA_MAT],
    exercises: generateExercises(WorkoutType.PILATES, FitnessLevel.INTERMEDIATE, DurationBucket.MEDIUM),
  }));

  workouts.push(createWorkout({
    id: 'w-23',
    name: 'Mobility Flow',
    description: 'Improve joint mobility and movement quality.',
    category: WorkoutType.MOBILITY,
    difficulty: FitnessLevel.INTERMEDIATE,
    duration: DurationBucket.SHORT,
    fitnessGoals: [FitnessGoal.IMPROVE_FLEXIBILITY, FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.MOBILITY, FitnessLevel.INTERMEDIATE, DurationBucket.SHORT),
  }));

  // Additional Advanced Workouts
  workouts.push(createWorkout({
    id: 'w-24',
    name: 'Advanced Full Body Crusher',
    description: 'Intense full-body workout for experienced athletes.',
    category: WorkoutType.STRENGTH,
    difficulty: FitnessLevel.ADVANCED,
    duration: DurationBucket.LONG,
    fitnessGoals: [FitnessGoal.GET_STRONGER, FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.DUMBBELLS, Equipment.KETTLEBELL],
    exercises: generateExercises(WorkoutType.STRENGTH, FitnessLevel.ADVANCED, DurationBucket.LONG),
  }));

  workouts.push(createWorkout({
    id: 'w-25',
    name: 'Upper Body Power',
    description: 'Advanced upper body strength and power training.',
    category: WorkoutType.STRENGTH,
    difficulty: FitnessLevel.ADVANCED,
    duration: DurationBucket.LONG,
    fitnessGoals: [FitnessGoal.GET_STRONGER],
    bodyFocus: [BodyFocus.UPPER_BODY, BodyFocus.CHEST, BodyFocus.BACK, BodyFocus.SHOULDERS, BodyFocus.ARMS],
    equipment: [Equipment.DUMBBELLS, Equipment.PULL_UP_BAR],
    exercises: generateExercises(WorkoutType.STRENGTH, FitnessLevel.ADVANCED, DurationBucket.LONG),
  }));

  workouts.push(createWorkout({
    id: 'w-26',
    name: 'Cardio Endurance Challenge',
    description: 'Extended cardio session for serious endurance.',
    category: WorkoutType.CARDIO,
    difficulty: FitnessLevel.ADVANCED,
    duration: DurationBucket.LONG,
    fitnessGoals: [FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.JUMP_ROPE],
    exercises: generateExercises(WorkoutType.CARDIO, FitnessLevel.ADVANCED, DurationBucket.LONG),
  }));

  workouts.push(createWorkout({
    id: 'w-27',
    name: 'Advanced Yoga Practice',
    description: 'Challenging yoga poses for flexibility and strength.',
    category: WorkoutType.YOGA,
    difficulty: FitnessLevel.ADVANCED,
    duration: DurationBucket.LONG,
    fitnessGoals: [FitnessGoal.IMPROVE_FLEXIBILITY, FitnessGoal.GET_STRONGER],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.YOGA_MAT],
    exercises: generateExercises(WorkoutType.YOGA, FitnessLevel.ADVANCED, DurationBucket.LONG),
  }));

  workouts.push(createWorkout({
    id: 'w-28',
    name: 'Circuit Training Extreme',
    description: 'Advanced circuit combining strength and cardio.',
    category: WorkoutType.CIRCUIT,
    difficulty: FitnessLevel.ADVANCED,
    duration: DurationBucket.LONG,
    fitnessGoals: [FitnessGoal.GET_STRONGER, FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.DUMBBELLS, Equipment.KETTLEBELL],
    exercises: generateExercises(WorkoutType.CIRCUIT, FitnessLevel.ADVANCED, DurationBucket.LONG),
  }));

  workouts.push(createWorkout({
    id: 'w-29',
    name: 'Quick Power Burn',
    description: 'Intense quick workout for busy schedules.',
    category: WorkoutType.HIIT,
    difficulty: FitnessLevel.ADVANCED,
    duration: DurationBucket.QUICK,
    fitnessGoals: [FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.HIIT, FitnessLevel.ADVANCED, DurationBucket.QUICK),
    isNew: true,
  }));

  workouts.push(createWorkout({
    id: 'w-30',
    name: 'Extreme HIIT',
    description: 'Maximum intensity intervals for peak performance.',
    category: WorkoutType.HIIT,
    difficulty: FitnessLevel.ADVANCED,
    duration: DurationBucket.MEDIUM,
    fitnessGoals: [FitnessGoal.STAY_ACTIVE],
    bodyFocus: [BodyFocus.FULL_BODY],
    equipment: [Equipment.NONE],
    exercises: generateExercises(WorkoutType.HIIT, FitnessLevel.ADVANCED, DurationBucket.MEDIUM),
    isFeatured: true,
  }));

  return workouts;
};

let seedWorkouts = null;

const getSeedWorkouts = () => {
  if (!seedWorkouts) {
    // Rebuild each workout's moves with its body focus (upper/lower-body workouts get their own moves)
    seedWorkouts = createSeedWorkouts().map((w) => {
      const exercises = generateExercises(w.category, w.difficulty, w.duration, w.bodyFocus);
      return { ...w, exercises, totalDurationSeconds: exercises.reduce((sum, ex) => sum + ex.duration, 0) };
    });
  }
  return seedWorkouts;
};

// Synchronous access to the built-in guided workouts (used by SuggestionService)
export const getBuiltInWorkouts = () => getSeedWorkouts();

// Helper to get intersection of two arrays
const arrayIntersection = (arr1, arr2) => arr1.filter(x => arr2.includes(x));

// Helper to check if arrays are disjoint
const areDisjoint = (arr1, arr2) => !arr1.some(x => arr2.includes(x));

// Helper to get set difference
const arrayDifference = (arr1, arr2) => arr1.filter(x => !arr2.includes(x));

// Build a friendly, hamster-toned explanation from the reasons
const buildExplanation = (reasons, profile) => {
  if (reasons.length === 0) {
    return 'A great workout to try!';
  }

  if (reasons.length === 1) {
    return reasons[0];
  }

  // Combine top 2 reasons with friendly connector
  return `${reasons[0]}. ${reasons[1]}.`;
};

// Get duration in approximate minutes for comparison
const getDurationMinutes = (duration) => {
  switch (duration) {
    case DurationBucket.QUICK: return 10;
    case DurationBucket.SHORT: return 15;
    case DurationBucket.MEDIUM: return 25;
    case DurationBucket.LONG: return 35;
    case DurationBucket.EXTENDED: return 45;
    default: return 20;
  }
};

// Service methods
export const WorkoutService = {
  async getAllWorkouts() {
    await delay();
    return getSeedWorkouts();
  },

  async getWorkouts(filters = {}) {
    await delay();
    let workouts = getSeedWorkouts();

    if (filters.category) {
      workouts = workouts.filter((w) => w.category === filters.category);
    }
    if (filters.difficulty) {
      workouts = workouts.filter((w) => w.difficulty === filters.difficulty);
    }
    if (filters.duration) {
      workouts = workouts.filter((w) => w.duration === filters.duration);
    }
    if (filters.goals && filters.goals.length > 0) {
      workouts = workouts.filter((w) =>
        filters.goals.some((g) => w.fitnessGoals.includes(g))
      );
    }
    if (filters.bodyFocus && filters.bodyFocus.length > 0) {
      workouts = workouts.filter((w) =>
        filters.bodyFocus.some((b) => w.bodyFocus.includes(b))
      );
    }

    return workouts;
  },

  async getWorkout(id) {
    await delay(200, 400);
    return getSeedWorkouts().find((w) => w.id === id) || null;
  },

  async getFeaturedWorkouts() {
    await delay();
    return getSeedWorkouts().filter((w) => w.isFeatured);
  },

  async getWorkoutsByCategory(category) {
    await delay();
    return getSeedWorkouts().filter((w) => w.category === category);
  },

  // Enhanced recommendation algorithm matching Swift version
  async getRecommendedWorkouts(profile, options = {}) {
    await delay();
    const workouts = getSeedWorkouts();
    const {
      recentWorkoutIds = [],
      recentBodyFocus = [],
      dislikedWorkoutIds = [],
      lovedWorkoutIds = [],
      limit = 6,
    } = options;

    // Score each workout
    const scoredWorkouts = workouts.map((workout) => {
      let score = 0;
      const reasons = [];

      // 1. Fitness Level Match (highest weight - 30 points)
      if (profile?.fitnessLevel) {
        if (workout.difficulty === profile.fitnessLevel) {
          score += 30;
          reasons.push(`Matches your ${workout.difficulty} level`);
        } else {
          // Penalty for mismatched difficulty
          score -= 20;
        }
      }

      // 2. Fitness Goals Match (up to 25 points)
      if (profile?.fitnessGoals && profile.fitnessGoals.length > 0) {
        const matchingGoals = arrayIntersection(workout.fitnessGoals, profile.fitnessGoals);
        if (matchingGoals.length > 0) {
          score += matchingGoals.length * 10;
          if (matchingGoals.length === 1) {
            reasons.push(`Supports your ${matchingGoals[0].replace(/([A-Z])/g, ' $1').toLowerCase().trim()} goal`);
          } else {
            reasons.push('Aligns with your fitness goals');
          }
        }
      }

      // 3. Fitness Intent Consideration (up to 15 points)
      if (profile?.fitnessIntent) {
        const durationMins = getDurationMinutes(workout.duration);
        if (profile.fitnessIntent === FitnessIntent.IMPROVE) {
          // Prefer longer, more challenging workouts
          if (durationMins >= 25) {
            score += 10;
            reasons.push('Helps push your limits');
          } else if (durationMins >= 15) {
            score += 5;
          }
        } else if (profile.fitnessIntent === FitnessIntent.MAINTAIN) {
          // Prefer moderate duration workouts
          if (workout.duration === DurationBucket.SHORT || workout.duration === DurationBucket.MEDIUM) {
            score += 10;
            reasons.push('Great for staying consistent');
          }
        }
      }

      // 4. Avoid Recently Completed Workouts (penalty of -25 points)
      if (recentWorkoutIds.includes(workout.id)) {
        score -= 25;
        // No reason added - we just deprioritize silently
      }

      // 5. Rotate Body Focus (up to 15 points for fresh areas)
      if (recentBodyFocus.length > 0) {
        const freshAreas = arrayDifference(workout.bodyFocus, recentBodyFocus);
        if (freshAreas.length > 0 && areDisjoint(workout.bodyFocus, recentBodyFocus)) {
          score += 15;
          const areaName = freshAreas[0] || 'different muscles';
          reasons.push(`Works ${areaName.replace(/([A-Z])/g, ' $1').toLowerCase().trim()} for variety`);
        } else if (freshAreas.length > 0) {
          score += 8;
        }
      }

      // 6. Equipment-free bonus for beginners (5 points)
      if (profile?.fitnessLevel === FitnessLevel.BEGINNER && workout.equipment.includes(Equipment.NONE)) {
        score += 5;
        if (!reasons.some(r => r.toLowerCase().includes('equipment'))) {
          reasons.push('No equipment needed');
        }
      }

      // 7. User feedback consideration
      // Strong penalty for disliked workouts (-50 points, effectively removes from recommendations)
      if (dislikedWorkoutIds.includes(workout.id)) {
        score -= 50;
        // No reason added - we quietly deprioritize
      }

      // Bonus for loved workouts (+20 points) - user explicitly enjoyed this
      if (lovedWorkoutIds.includes(workout.id)) {
        score += 20;
        reasons.push('One of your favorites!');
      }

      return { workout, score, reasons };
    });

    // Sort by score (highest first), with stable secondary sort by name
    scoredWorkouts.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return a.workout.name.localeCompare(b.workout.name);
    });

    // Take top results and build explanations
    const topResults = scoredWorkouts.slice(0, limit);

    // Build recommendations with explanations
    let recommendations = topResults.map(({ workout, reasons }) => ({
      ...workout,
      explanation: buildExplanation(reasons, profile),
      relevanceScore: scoredWorkouts.find(s => s.workout.id === workout.id)?.score || 0,
    }));

    // Fallback: if no recommendations, provide beginner-friendly options
    if (recommendations.length === 0) {
      const fallbacks = await this.getFallbackWorkouts(limit);
      recommendations = fallbacks.map(workout => ({
        ...workout,
        explanation: 'A great place to start!',
        relevanceScore: 0,
      }));
    }

    return recommendations;
  },

  // Get recommendations with full explanation data (matching Swift API)
  async getRecommendedWorkoutsWithExplanations(profile, options = {}) {
    const recommendations = await this.getRecommendedWorkouts(profile, options);
    return recommendations.map(rec => ({
      workout: rec,
      explanation: rec.explanation,
      relevanceScore: rec.relevanceScore || 0,
    }));
  },

  async searchWorkouts(query) {
    await delay();
    const lowerQuery = query.toLowerCase();
    return getSeedWorkouts().filter((w) =>
      w.name.toLowerCase().includes(lowerQuery) ||
      w.description.toLowerCase().includes(lowerQuery)
    );
  },

  // Get fallback workouts when filters produce empty results
  async getFallbackWorkouts(limit = 6) {
    const workouts = getSeedWorkouts();
    const fallbacks = workouts.filter(
      w => w.difficulty === FitnessLevel.BEGINNER && w.equipment.includes(Equipment.NONE)
    );
    // Shuffle and return limited
    return fallbacks.sort(() => Math.random() - 0.5).slice(0, limit);
  },

  // Check if catalog has workouts matching criteria
  async hasWorkouts(difficulty = null, category = null) {
    const workouts = getSeedWorkouts();
    if (difficulty && category) {
      return workouts.some(w => w.difficulty === difficulty && w.category === category);
    } else if (difficulty) {
      return workouts.some(w => w.difficulty === difficulty);
    } else if (category) {
      return workouts.some(w => w.category === category);
    }
    return workouts.length > 0;
  },

  // Get new workouts
  async getNewWorkouts() {
    await delay();
    return getSeedWorkouts().filter((w) => w.isNew);
  },

  // Get workouts by body focus
  async getWorkoutsByBodyFocus(bodyFocusAreas) {
    await delay();
    return getSeedWorkouts().filter((w) =>
      bodyFocusAreas.some((focus) => w.bodyFocus.includes(focus))
    );
  },
};
