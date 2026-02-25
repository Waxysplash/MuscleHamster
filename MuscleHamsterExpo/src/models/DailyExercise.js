// Daily Exercise Model
// One random bodyweight exercise per day, deterministic per user

// djb2 hash — stable across runs (unlike JS's Math.random)
const djb2Hash = (str) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
};

// Get day-of-year (1-based)
const dayOfYear = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Exercise pool — 20 daily check-in exercises organized by category
export const dailyExercisePool = [
  // ===== CARDIO & MOVEMENT =====
  { id: 'walk', name: '10-Minute Walk', repCount: 10, instruction: 'Go for a 10-minute walk outside. Or pace around the house if the weather is bad!', icon: 'walk', encouragement: "Fresh air and movement — my favorite combo!" },
  { id: 'jumpingJacks', name: 'Jumping Jacks', repCount: 30, instruction: 'Jump feet out and arms up, then return to start. Do step-out jacks for a low-impact option.', icon: 'accessibility', encouragement: "Wow, you were bouncing like me on my wheel!" },
  { id: 'highKnees', name: 'High Knees', repCount: 20, instruction: 'Run in place, bringing knees up to hip height. Or forcefully march in place.', icon: 'accessibility', encouragement: "Zoom zoom! You're as fast as a hamster on wheels!" },
  { id: 'shadowBox', name: 'Shadow Boxing', repCount: 2, instruction: 'Shadow box for 2 minutes. Keep your feet moving and punch the air!', icon: 'hand-left', encouragement: "Pow pow! You're a knockout!" },
  { id: 'stairClimb', name: 'Stair Climbs', repCount: 3, instruction: 'Climb up and down a flight of stairs 3 times. Take it one step at a time.', icon: 'arrow-up', encouragement: "One step at a time, you're going places!" },

  // ===== LOWER BODY =====
  { id: 'squats', name: 'Bodyweight Squats', repCount: 15, instruction: 'Feet shoulder-width apart, lower your hips like sitting in a chair. Only go as low as is comfortable.', icon: 'body', encouragement: "Those legs are getting stronger! I can feel it!" },
  { id: 'lunges', name: 'Alternating Lunges', repCount: 15, instruction: 'Step forward and lower your back knee toward the ground. Hold onto a chair or wall for balance if needed.', icon: 'walk', encouragement: "Great strides! You're walking like a champion!" },
  { id: 'calfRaises', name: 'Calf Raises', repCount: 20, instruction: 'Stand on flat ground or the edge of a step. Rise onto your toes, hold, then lower.', icon: 'footsteps', encouragement: "Tip-toe champion! Your calves must be happy!" },
  { id: 'gluteBridges', name: 'Glute Bridges', repCount: 15, instruction: 'Lie on your back, knees bent, and push your hips up. Squeeze at the top!', icon: 'trending-up', encouragement: "Bridge builder! Your glutes are firing!" },
  { id: 'goodMornings', name: 'Good Mornings', repCount: 15, instruction: 'Hands behind head, hinge at the hips until you feel a hamstring stretch.', icon: 'sunny', encouragement: "Good morning to you too! What a great stretch!" },

  // ===== UPPER BODY =====
  { id: 'pushUps', name: 'Push-Ups', repCount: 10, instruction: 'Hands shoulder-width apart, lower your chest to the floor. Drop to your knees or do them against a wall.', icon: 'fitness', encouragement: "So strong! I wish I had arms like that!" },
  { id: 'tricepDips', name: 'Tricep Dips', repCount: 10, instruction: 'Use the edge of a sturdy couch or chair. Lower yourself by bending elbows, then push back up.', icon: 'hand-left', encouragement: "Those arms are going to look amazing!" },
  { id: 'armCircles', name: 'Arm Circles', repCount: 20, instruction: '10 forward, 10 backward — keep your arms straight!', icon: 'sync', encouragement: "Round and round! Your shoulders are warming up nicely!" },
  { id: 'towelPullAparts', name: 'Towel Pull-Aparts', repCount: 30, instruction: 'Hold a towel tight in front of you and pull your hands apart for 30 seconds.', icon: 'expand', encouragement: "Feel that tension! Your back muscles are working!" },
  { id: 'inchworms', name: 'Inchworms', repCount: 10, instruction: 'Walk your hands out to a plank position and walk them back to your feet.', icon: 'bug', encouragement: "Inch by inch, you're getting fitter!" },

  // ===== CORE & HOLDS =====
  { id: 'sitUps', name: 'Sit-Ups', repCount: 20, instruction: 'Lie on your back, feet flat, curl up toward your knees. Keep your neck relaxed.', icon: 'body', encouragement: "Those abs are getting stronger every day!" },
  { id: 'wallSit', name: 'Wall Sit', repCount: 30, instruction: 'Slide down a wall until your knees are at a 90-degree angle. Hold for 30 seconds.', icon: 'square', encouragement: "Wow, 30 seconds! My little legs would give out!" },
  { id: 'plank', name: 'Plank Hold', repCount: 60, instruction: 'Hold a plank for 1 minute. Drop to your knees or rest forearms on a couch if needed.', icon: 'remove', encouragement: "Rock solid! Even I couldn't stay that still!" },
  { id: 'bicycleCrunches', name: 'Bicycle Crunches', repCount: 20, instruction: '10 per side, touching elbow to opposite knee.', icon: 'bicycle', encouragement: "Pedaling to fitness! What a ride!" },
  { id: 'supermanHold', name: 'Superman Hold', repCount: 30, instruction: 'Lie on your stomach and lift your arms and legs off the floor. Hold for 30 seconds.', icon: 'airplane', encouragement: "You're flying! My little cape is fluttering!" },
];

// Get today's exercise for a user (deterministic)
export const getTodaysExercise = (userId) => {
  const now = new Date();
  const doy = dayOfYear(now);
  const year = now.getFullYear();
  const seed = `${userId}-${doy}-${year}`;
  const hash = djb2Hash(seed);
  const index = hash % dailyExercisePool.length;
  return dailyExercisePool[index];
};

// Computed display prompt
export const getExerciseDisplayPrompt = (exercise) => {
  // Time-based exercises (in seconds)
  if (exercise.id === 'plank' || exercise.id === 'wallSit' || exercise.id === 'supermanHold' || exercise.id === 'towelPullAparts') {
    return `Hold for ${exercise.repCount} Seconds`;
  }
  // Minute-based exercises
  if (exercise.id === 'walk') {
    return `Go for a ${exercise.repCount}-Minute Walk`;
  }
  if (exercise.id === 'shadowBox') {
    return `Shadow Box for ${exercise.repCount} Minutes`;
  }
  // Rep-based exercises
  if (exercise.id === 'stairClimb') {
    return `Climb Stairs ${exercise.repCount} Times`;
  }
  return `Do ${exercise.repCount} ${exercise.name}`;
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
