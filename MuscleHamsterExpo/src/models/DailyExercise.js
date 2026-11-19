// Daily Exercise Model
// "The Daily 33" — a balanced mix of strength, cardio, and mobility exercises
// One exercise per day, deterministic per user, cycles through the whole pool before repeating

// djb2 hash — stable across runs (unlike JS's Math.random)
const djb2Hash = (str) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
};

// Local YYYY-MM-DD key for the user's timezone
export const getLocalDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Exercise pool — "The Daily 33"
// A balanced mix of strength, cardio, mobility, and breathing exercises
export const dailyExercisePool = [
  {
    id: 'classicPushUps',
    name: 'Classic Push-Ups',
    repCount: 20,
    repType: 'reps',
    instruction: 'Start in a plank position with hands shoulder-width apart. Lower your chest to the ground, then push back up. Keep your body in a straight line throughout.',
    icon: 'fitness',
    encouragement: "Push it! You're building real strength!",
  },
  {
    id: 'airSquats',
    name: 'Air Squats',
    repCount: 30,
    repType: 'reps',
    instruction: 'Stand with feet shoulder-width apart. Lower your hips back and down like sitting in a chair, then stand back up. Keep your chest up and knees over toes.',
    icon: 'body',
    encouragement: "Squat it out! Your legs are getting stronger!",
  },
  {
    id: 'forearmPlank',
    name: 'Forearm Plank',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Rest on your forearms and toes, keeping your body in a straight line from head to heels. Engage your core and hold steady.',
    icon: 'remove',
    encouragement: "Hold strong! Your core is working hard!",
  },
  {
    id: 'bicycleCrunches',
    name: 'Bicycle Crunches',
    repCount: 40,
    repType: 'reps',
    instruction: 'Lie on your back with hands behind your head. Bring opposite elbow to opposite knee while extending the other leg. Alternate sides in a pedaling motion.',
    icon: 'bicycle',
    encouragement: "Pedal those abs! You're crushing it!",
  },
  {
    id: 'wallSit',
    name: 'Wall Sit',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Lean your back against a wall and slide down until your thighs are parallel to the ground. Hold this seated position against the wall.',
    icon: 'square',
    encouragement: "Hold it! Feel that burn—you've got this!",
  },
  {
    id: 'catCowFlow',
    name: 'Cat-Cow Flow',
    repCount: 10,
    repType: 'reps',
    instruction: 'On hands and knees, alternate between arching your back up like a cat and letting your belly sink while lifting your head. Move smoothly between positions.',
    icon: 'paw',
    encouragement: "Flow with it! Your spine is so happy!",
  },
  {
    id: 'jumpingJacks',
    name: 'Jumping Jacks',
    repCount: 50,
    repType: 'reps',
    instruction: 'Start standing with arms at your sides. Jump while spreading your legs and raising your arms overhead, then jump back to start.',
    icon: 'accessibility',
    encouragement: "Jump jump! Getting that heart pumping!",
  },
  {
    id: 'childsPose',
    name: "Child's Pose",
    repCount: 60,
    repType: 'seconds',
    instruction: 'Kneel on the floor, sit back on your heels, and stretch your arms forward on the ground. Rest your forehead down and breathe deeply.',
    icon: 'bed',
    encouragement: "Rest and restore. This is self-care at its finest!",
  },
  {
    id: 'highKnees',
    name: 'High Knees',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Run in place while driving your knees up toward your chest as high as you can. Pump your arms and keep a quick pace.',
    icon: 'walk',
    encouragement: "Knees up! You're a cardio machine!",
  },
  {
    id: 'standingQuadStretch',
    name: 'Standing Quad Stretch',
    repCount: 30,
    repType: 'seconds',
    instruction: 'Stand on one leg and pull your other heel toward your glute. Hold for 30 seconds, then switch legs. Use a wall for balance if needed.',
    icon: 'body',
    encouragement: "Stretch it out! 30 seconds per leg—you've earned this!",
  },

  // ===== CARDIO & MOVEMENT =====
  {
    id: 'buttKicks',
    name: 'Butt Kicks',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Jog in place while kicking your heels up toward your glutes with each step. Keep a quick, steady rhythm.',
    icon: 'footsteps',
    encouragement: "Kick it up! Your legs are on fire!",
  },
  {
    id: 'skaterJumps',
    name: 'Skater Jumps',
    repCount: 30,
    repType: 'reps',
    instruction: 'Leap sideways from one foot to the other, landing softly and swinging your arms for momentum. Like a speed skater!',
    icon: 'swap-horizontal',
    encouragement: "Glide like a pro! Side to side power!",
  },
  {
    id: 'sealJacks',
    name: 'Seal Jacks',
    repCount: 40,
    repType: 'reps',
    instruction: 'Like jumping jacks, but clap your arms in front of you instead of overhead. Legs jump out and in as usual.',
    icon: 'accessibility',
    encouragement: "Clap clap! Seal of approval!",
  },
  {
    id: 'sprintingInPlace',
    name: 'Sprinting in Place',
    repCount: 45,
    repType: 'seconds',
    instruction: 'Run in place as fast as you can! Pump your arms, drive your knees high, and give it maximum effort.',
    icon: 'flash',
    encouragement: "Go go go! Maximum effort sprint!",
  },

  // ===== STRENGTH & STABILITY =====
  {
    id: 'goodMornings',
    name: 'Good Mornings',
    repCount: 20,
    repType: 'reps',
    instruction: 'Stand with hands behind your head. Keeping your back straight, hinge at the hips until your torso is nearly parallel to the floor, then return to standing.',
    icon: 'sunny',
    encouragement: "Good morning to your hamstrings!",
  },
  {
    id: 'standingSideCrunches',
    name: 'Standing Side Crunches',
    repCount: 30,
    repType: 'reps',
    instruction: 'Stand tall, lift one knee to the side while bringing your elbow down to meet it. Alternate sides with each rep.',
    icon: 'body',
    encouragement: "Crunch those obliques! Side to side!",
  },
  {
    id: 'tricepFloorDips',
    name: 'Tricep Floor Dips',
    repCount: 25,
    repType: 'reps',
    instruction: 'Sit on the floor with hands behind you, fingers pointing forward. Lift your hips slightly and perform small pulsing dips.',
    icon: 'fitness',
    encouragement: "Feel those triceps working!",
  },
  {
    id: 'plankShoulderTaps',
    name: 'Plank Shoulder Taps',
    repCount: 40,
    repType: 'reps',
    instruction: 'In a high plank position, slowly tap your left shoulder with your right hand, then alternate. Keep your hips stable—no rocking!',
    icon: 'hand-right',
    encouragement: "Tap tap! Core stability champion!",
  },
  {
    id: 'wallAngels',
    name: 'Wall Angels',
    repCount: 15,
    repType: 'reps',
    instruction: 'Stand with your back against a wall, elbows and wrists touching the wall. Slowly slide your arms up and down like making a snow angel.',
    icon: 'body',
    encouragement: "Angel wings! Your posture thanks you!",
  },
  {
    id: 'diverPushUps',
    name: 'Diver Push-Ups',
    repCount: 8,
    repType: 'reps',
    instruction: 'Start in Downward Dog. Scoop your chest low to the floor in a wave motion, then arch up into Upward Dog. Reverse the motion to return.',
    icon: 'fitness',
    encouragement: "Dive deep! Full body flow!",
  },
  {
    id: 'proneYRaise',
    name: 'Prone Y-Raise',
    repCount: 20,
    repType: 'reps',
    instruction: 'Lie face down with arms extended in a Y shape. Lift both arms off the floor, squeezing your upper back, then lower slowly.',
    icon: 'arrow-up',
    encouragement: "Y so strong? Because you are!",
  },
  {
    id: 'handMarches',
    name: 'Hand Marches',
    repCount: 60,
    repType: 'seconds',
    instruction: 'In a high plank position, lift one hand slightly off the floor, then the other, like marching in place with your hands.',
    icon: 'hand-left',
    encouragement: "March those hands! Plank power!",
  },
  {
    id: 'shoulderProtraction',
    name: 'Shoulder Protraction',
    repCount: 15,
    repType: 'reps',
    instruction: 'In a plank position, push your spine toward the ceiling rounding your upper back, then let it sink back down. Control the movement.',
    icon: 'body',
    encouragement: "Push and sink! Scapula strength!",
  },
  {
    id: 'cobraPulses',
    name: 'Cobra Pulses',
    repCount: 20,
    repType: 'reps',
    instruction: 'Lie face down with hands by your shoulders. Using your back muscles (not your hands), lift your chest slightly off the floor in small pulses.',
    icon: 'arrow-up',
    encouragement: "Rise up! Strong back, proud chest!",
  },

  // ===== MOBILITY & BREATHING =====
  {
    id: 'boxBreathing',
    name: 'Box Breathing',
    repCount: 4,
    repType: 'reps',
    instruction: 'Breathe in for 4 seconds, hold for 4 seconds, breathe out for 4 seconds, hold for 4 seconds. That\'s one cycle. Complete 4 cycles.',
    icon: 'square',
    encouragement: "Breathe... calm... focus... peace...",
  },
  {
    id: 'balanceTest',
    name: 'Balance Test',
    repCount: 30,
    repType: 'seconds',
    instruction: 'Stand on one leg for 30 seconds, then switch to the other leg. Keep your core engaged and find a focal point.',
    icon: 'body',
    encouragement: "Steady now! Balance mastery!",
  },
  {
    id: 'wristCircles',
    name: 'Wrist Circles',
    repCount: 30,
    repType: 'seconds',
    instruction: 'Extend your arms and rotate your wrists in circles. Do 30 seconds in each direction to loosen up those joints.',
    icon: 'sync',
    encouragement: "Round and round! Happy wrists!",
  },
  {
    id: 'ankleCircles',
    name: 'Ankle Circles',
    repCount: 30,
    repType: 'seconds',
    instruction: 'Lift one foot off the ground and rotate your ankle in circles. 30 seconds per foot, both directions.',
    icon: 'sync',
    encouragement: "Circle those ankles! Mobile feet!",
  },
  {
    id: 'threadTheNeedle',
    name: 'Thread the Needle',
    repCount: 30,
    repType: 'seconds',
    instruction: 'On hands and knees, reach one arm under your body and rotate your torso, resting your shoulder on the ground. 30 seconds per side.',
    icon: 'refresh',
    encouragement: "Thread it through! Spine feels amazing!",
  },
  {
    id: 'deepSquatHold',
    name: 'Deep Squat Hold',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Sink into the bottom of a squat and hold. Keep your heels down, chest up, and breathe. This is primal mobility!',
    icon: 'body',
    encouragement: "Sink low and hold! Primal strength!",
  },
  {
    id: 'calfStretchWall',
    name: 'Calf Stretch (Wall)',
    repCount: 30,
    repType: 'seconds',
    instruction: 'Face a wall, place one foot back with heel down, and lean forward until you feel a stretch in your calf. 30 seconds per leg.',
    icon: 'body',
    encouragement: "Stretch those calves! They work hard for you!",
  },
  {
    id: 'doorwayLatStretch',
    name: 'Doorway Lat Stretch',
    repCount: 30,
    repType: 'seconds',
    instruction: 'Reach one arm high on a doorframe and lean your body away until you feel a stretch along your side. 30 seconds per side.',
    icon: 'home',
    encouragement: "Open up those lats! Feel the length!",
  },

  // ===== POWER MOVES =====
  {
    id: 'airPunchesSpeed',
    name: 'Air Punches (Speed)',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Throw straight punches into the air as fast as you can! Alternate hands rapidly. Maximum speed, stay light on your feet.',
    icon: 'flash',
    encouragement: "Punch punch punch! Speed demon!",
  },
];

// The Final Stretch - shown after every check-in, not a random exercise
export const FINAL_STRETCH_PROMPT = {
  title: 'The Final Stretch',
  instruction: 'Take a massive breath in, reach as high as you can, and exhale everything out.',
  icon: 'sunny',
};

// Pure picker: given a user, date, and prior cycle state, decide today's exercise.
// Cycles through every exercise before repeating. Deterministic per (userId, dateKey).
//
// state: { shownIds: string[], lastAssignment: { dateKey, exerciseId } | null }
// returns: { exercise, nextState }
export const pickExerciseForDate = ({ userId, dateKey, state }) => {
  const shownIds = state?.shownIds || [];
  const lastAssignment = state?.lastAssignment || null;

  // Same day: return the already-assigned exercise without mutating state
  if (lastAssignment && lastAssignment.dateKey === dateKey) {
    const existing = dailyExercisePool.find((e) => e.id === lastAssignment.exerciseId);
    if (existing) {
      return { exercise: existing, nextState: state };
    }
    // Fall through if the stored exercise was removed from the pool
  }

  // Pick from exercises not yet shown in this cycle; reset when the cycle is exhausted
  let available = dailyExercisePool.filter((e) => !shownIds.includes(e.id));
  let baseShown = shownIds;
  if (available.length === 0) {
    available = dailyExercisePool;
    baseShown = [];
  }

  const hash = djb2Hash(`${userId}-${dateKey}`);
  const picked = available[hash % available.length];

  return {
    exercise: picked,
    nextState: {
      shownIds: [...baseShown, picked.id],
      lastAssignment: { dateKey, exerciseId: picked.id },
    },
  };
};

// ============================================
// SCALING BY FITNESS LEVEL (Phase 2)
// Beginners get half the amount, advanced a little more. Gentle mobility/breathing moves
// don't scale. Every exercise has an easier version so nobody opens the app to a wall.
// ============================================
const NO_SCALE = new Set([
  'catCowFlow', 'standingQuadStretch', 'boxBreathing', 'balanceTest', 'wristCircles',
  'ankleCircles', 'threadTheNeedle', 'calfStretchWall', 'doorwayLatStretch', 'childsPose',
]);

export const EASIER_VERSIONS = {
  classicPushUps: 'Knee push-ups, or push-ups against a wall',
  airSquats: 'Sit down onto a chair and stand back up',
  forearmPlank: 'Plank with your knees on the floor',
  bicycleCrunches: 'Keep your feet on the floor and twist slowly',
  wallSit: 'Slide only halfway down the wall',
  catCowFlow: 'Do it sitting in a chair',
  jumpingJacks: 'Step side to side instead of jumping',
  highKnees: 'March in place',
  standingQuadStretch: 'Hold a wall or chair for balance',
  buttKicks: 'Walk in place, bringing your heels up gently',
  skaterJumps: 'Step side to side instead of hopping',
  sealJacks: 'Step out instead of jumping',
  sprintingInPlace: 'Jog or march in place',
  goodMornings: 'A smaller bend, hands on your thighs',
  standingSideCrunches: 'Go slower with a smaller movement',
  tricepFloorDips: 'Keep knees bent and feet close to you',
  plankShoulderTaps: 'Do the taps with your knees down',
  wallAngels: 'Stand one step away from the wall',
  diverPushUps: 'Knee push-ups instead',
  proneYRaise: 'Lift one arm at a time',
  handMarches: 'Do it with your knees down',
  shoulderProtraction: 'Do it standing, hands on a wall',
  cobraPulses: 'Stay on your forearms (sphinx pose)',
  boxBreathing: 'Count to 3 instead of 4',
  balanceTest: 'Lightly hold a wall or chair',
  wristCircles: 'Smaller, slower circles',
  ankleCircles: 'Do it sitting down',
  threadTheNeedle: 'A smaller twist',
  deepSquatHold: 'Hold a doorframe, or squat onto a low step',
  calfStretchWall: 'Take a shorter step back',
  doorwayLatStretch: 'A smaller reach',
  airPunchesSpeed: 'Punch at a steady pace',
  childsPose: 'Put a pillow under your chest or hips',
};

const roundAmount = (n, repType) => {
  if (repType === 'seconds') return Math.max(15, Math.round(n / 5) * 5);
  if (n >= 10) return Math.max(5, Math.round(n / 5) * 5);
  return Math.max(3, Math.round(n));
};

// Returns the exercise with repCount adjusted for the user's level, plus an `easier` tip.
export const scaleDailyExercise = (exercise, fitnessLevel) => {
  if (!exercise) return exercise;
  const easier = EASIER_VERSIONS[exercise.id] || null;
  if (NO_SCALE.has(exercise.id) || exercise.repType === 'breath') {
    return { ...exercise, easier, baseRepCount: exercise.repCount };
  }
  const factor = fitnessLevel === 'advanced' ? 1.25 : fitnessLevel === 'intermediate' ? 1 : 0.5;
  return {
    ...exercise,
    easier,
    baseRepCount: exercise.repCount,
    repCount: factor === 1 ? exercise.repCount : roundAmount(exercise.repCount * factor, exercise.repType),
  };
};

// Computed display prompt based on rep type
export const getExerciseDisplayPrompt = (exercise) => {
  const { repCount, repType, name } = exercise;

  if (/breathing/i.test(name)) {
    return `${repCount} slow rounds of ${name}`;
  }

  switch (repType) {
    case 'seconds':
      return `${name} for ${repCount} seconds`;
    case 'minutes':
      return `Do for ${repCount} Minute${repCount > 1 ? 's' : ''}`;
    case 'breath':
      return 'Take a Deep Breath';
    case 'reps':
    default:
      return `Do ${repCount} ${name}`;
  }
};

// Create a daily exercise check-in record
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
