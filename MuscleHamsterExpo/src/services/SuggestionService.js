// Suggestion Service - picks today's workout from the user's onboarding answers.
// Rules (from the gym-owner review, Phase 2 redesign):
// - Level sets the dose: beginners only see beginner workouts (no HIIT until they've
//   done 10 workouts); intermediate sees beginner + intermediate; advanced sees
//   intermediate + advanced. The user's own level is preferred.
// - Goal picks the content (Stay Active -> cardio/circuit/mobility, Get Stronger ->
//   strength/circuit, Build Core -> pilates + core work, Flexibility -> yoga/stretch/mobility).
// - Time: workouts are bucketed by their REAL length, so "Quick" means quick.
// - Recovery: don't repeat a workout done in the last 3 days or the same body focus as
//   yesterday; after 3 training days in a row, suggest something gentle.
// Deterministic per day (same pick all day), "Shuffle" moves to the next option.
import { getBuiltInWorkouts } from './WorkoutService';
import { WorkoutType, BodyFocus } from '../models/Workout';
import { FitnessLevel, FitnessGoal } from '../models/UserProfile';

export const TimeChoice = {
  QUICK: 'quick',   // about 8 min
  MEDIUM: 'medium', // about 15 min
  LONGER: 'longer', // 25+ min
};

export const TimeChoiceInfo = {
  [TimeChoice.QUICK]: { label: '~8 min', min: 0, max: 12 },
  [TimeChoice.MEDIUM]: { label: '~15 min', min: 12, max: 20 },
  [TimeChoice.LONGER]: { label: '25+ min', min: 20, max: Infinity },
};

const GOAL_TYPES = {
  [FitnessGoal.STAY_ACTIVE]: [WorkoutType.CARDIO, WorkoutType.CIRCUIT, WorkoutType.MOBILITY, WorkoutType.HIIT],
  [FitnessGoal.GET_STRONGER]: [WorkoutType.STRENGTH, WorkoutType.CIRCUIT],
  [FitnessGoal.BUILD_CORE]: [WorkoutType.PILATES],
  [FitnessGoal.IMPROVE_FLEXIBILITY]: [WorkoutType.YOGA, WorkoutType.STRETCHING, WorkoutType.MOBILITY],
};

const GENTLE_TYPES = [WorkoutType.STRETCHING, WorkoutType.MOBILITY, WorkoutType.YOGA];

const LEVEL_ORDER = [FitnessLevel.BEGINNER, FitnessLevel.INTERMEDIATE, FitnessLevel.ADVANCED];

export const getWorkoutMinutes = (workout) =>
  Math.max(1, Math.round((workout.totalDurationSeconds || 0) / 60));

// Default time choice by level if the user hasn't picked one
export const defaultTimeChoice = (level) =>
  level === FitnessLevel.ADVANCED ? TimeChoice.LONGER
  : level === FitnessLevel.INTERMEDIATE ? TimeChoice.MEDIUM
  : TimeChoice.QUICK;

const allowedLevels = (level) => {
  switch (level) {
    case FitnessLevel.ADVANCED: return [FitnessLevel.INTERMEDIATE, FitnessLevel.ADVANCED];
    case FitnessLevel.INTERMEDIATE: return [FitnessLevel.BEGINNER, FitnessLevel.INTERMEDIATE];
    default: return [FitnessLevel.BEGINNER];
  }
};

const dayKey = (d) => new Date(d).toDateString();
const daysAgo = (n, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
};

// Dates the user trained on, from workout history and this week's active days
const getTrainingDays = (stats) => {
  const days = new Set();
  (stats?.workoutHistory || []).forEach((w) => days.add(dayKey(w.completedAt)));
  (stats?.weeklyGoal?.activeDays || []).forEach((d) => days.add(d));
  return days;
};

const isCoreWorkout = (w) => w.bodyFocus?.includes(BodyFocus.CORE) || /core/i.test(w.name);

/**
 * Pick today's suggestions.
 * @param {object} p
 * @param {object} p.profile - user profile (fitnessLevel, fitnessGoals)
 * @param {object} p.stats - activity stats (workoutHistory, weeklyGoal, totalWorkoutsCompleted)
 * @param {string} p.timeChoice - TimeChoice.*
 * @param {number} p.shuffle - how many times the user tapped Shuffle today
 * @param {Date} p.now
 * @returns {{ workout, minutes, reason, needsRecovery, options: number }}
 */
export const getSuggestion = ({ profile, stats, timeChoice, shuffle = 0, now = new Date() }) => {
  const level = profile?.fitnessLevel || FitnessLevel.BEGINNER;
  const goals = profile?.fitnessGoals?.length ? profile.fitnessGoals : [];
  const time = timeChoice || defaultTimeChoice(level);
  const timeInfo = TimeChoiceInfo[time];

  const trainingDays = getTrainingDays(stats);
  const needsRecovery = [1, 2, 3].every((n) => trainingDays.has(dayKey(daysAgo(n, now))));

  const recentIds = new Set(
    (stats?.workoutHistory || [])
      .filter((w) => new Date(w.completedAt) >= daysAgo(3, now))
      .map((w) => w.workoutId)
  );
  const yesterday = dayKey(daysAgo(1, now));
  const yesterdayFocus = new Set(
    (stats?.workoutHistory || [])
      .filter((w) => dayKey(w.completedAt) === yesterday)
      .flatMap((w) => getBuiltInWorkouts().find((b) => b.id === w.workoutId)?.bodyFocus || [])
      .filter((f) => f !== BodyFocus.FULL_BODY)
  );

  const levels = allowedLevels(level);
  const newBeginner = level === FitnessLevel.BEGINNER && (stats?.totalWorkoutsCompleted || 0) < 10;
  const goalTypes = new Set(goals.flatMap((g) => GOAL_TYPES[g] || []));

  const candidates = getBuiltInWorkouts()
    .filter((w) => levels.includes(w.difficulty))
    .filter((w) => !(newBeginner && w.category === WorkoutType.HIIT))
    .map((w) => {
      const minutes = getWorkoutMinutes(w);
      let score = 0;
      const reasons = [];
      if (w.difficulty === level) { score += 3; }
      if (minutes >= timeInfo.min && minutes < timeInfo.max) { score += 4; }
      if (goalTypes.has(w.category) || (goals.includes(FitnessGoal.BUILD_CORE) && isCoreWorkout(w))) {
        score += 3;
        reasons.push('matches your goal');
      }
      if (needsRecovery && GENTLE_TYPES.includes(w.category)) { score += 6; }
      if (recentIds.has(w.id)) { score -= 5; }
      if (w.bodyFocus?.some((f) => yesterdayFocus.has(f))) { score -= 3; }
      return { workout: w, minutes, score, reasons };
    })
    .sort((a, b) => b.score - a.score || a.workout.id.localeCompare(b.workout.id));

  if (candidates.length === 0) return null;

  // Rotate through the strongest options: same pick all day, Shuffle moves on.
  // If only one workout is a strong fit, it always comes first and Shuffle widens the choice.
  const topScore = candidates[0].score;
  const strong = candidates.filter((c) => c.score >= topScore - 2).slice(0, 6);
  const dayIndex = Math.floor(new Date(now).setHours(0, 0, 0, 0) / 86400000);
  let pool;
  let pick;
  if (strong.length > 1) {
    pool = strong;
    pick = pool[(dayIndex + shuffle) % pool.length];
  } else {
    pool = candidates.filter((c) => c.score >= topScore - 4).slice(0, 6);
    pick = pool[shuffle % pool.length];
  }

  let reason;
  if (needsRecovery) {
    reason = "You've trained 3 days in a row. Something gentle today, or take a rest day!";
  } else if (pick.reasons.includes('matches your goal')) {
    reason = `Picked for your goal · ${pick.minutes} min`;
  } else {
    reason = `A good fit for today · ${pick.minutes} min`;
  }

  return { workout: pick.workout, minutes: pick.minutes, reason, needsRecovery, options: pool.length };
};

// A short list for the Workouts tab "Suggested for you" row
export const getSuggestionList = ({ profile, stats, now = new Date(), count = 3 }) => {
  const seen = new Set();
  const list = [];
  for (const time of [TimeChoice.QUICK, TimeChoice.MEDIUM, TimeChoice.LONGER]) {
    for (let shuffle = 0; shuffle < 6 && list.length < count; shuffle++) {
      const s = getSuggestion({ profile, stats, timeChoice: time, shuffle, now });
      if (s && !seen.has(s.workout.id)) {
        seen.add(s.workout.id);
        list.push(s);
        break;
      }
    }
  }
  return list.slice(0, count);
};

export default { getSuggestion, getSuggestionList };
