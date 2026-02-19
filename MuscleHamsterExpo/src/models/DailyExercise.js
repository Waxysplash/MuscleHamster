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

// Exercise pool — 35 simple bodyweight exercises
export const dailyExercisePool = [
  { id: 'squats', name: 'Squats', repCount: 10, instruction: 'Feet shoulder-width apart, lower your hips like sitting in a chair.', icon: 'body', encouragement: "Those legs are getting stronger! I can feel it!" },
  { id: 'jumpingJacks', name: 'Jumping Jacks', repCount: 20, instruction: 'Jump feet out and arms up, then return to start.', icon: 'accessibility', encouragement: "Wow, you were bouncing like me on my wheel!" },
  { id: 'pushUps', name: 'Push-Ups', repCount: 10, instruction: 'Hands shoulder-width apart, lower your chest to the floor.', icon: 'fitness', encouragement: "So strong! I wish I had arms like that!" },
  { id: 'lunges', name: 'Lunges', repCount: 10, instruction: 'Step forward and lower your back knee toward the ground. Alternate legs.', icon: 'walk', encouragement: "Great strides! You're walking like a champion!" },
  { id: 'plank', name: 'Plank Hold', repCount: 30, instruction: 'Hold a straight-arm plank for 30 seconds. Keep your core tight!', icon: 'remove', encouragement: "Rock solid! Even I couldn't stay that still!" },
  { id: 'highKnees', name: 'High Knees', repCount: 20, instruction: 'Run in place, bringing knees up to hip height.', icon: 'accessibility', encouragement: "Zoom zoom! You're as fast as a hamster on wheels!" },
  { id: 'burpees', name: 'Burpees', repCount: 5, instruction: 'Squat, jump feet back to plank, push-up, jump feet forward, jump up!', icon: 'flash', encouragement: "You did burpees?! You're my hero!" },
  { id: 'mountainClimbers', name: 'Mountain Climbers', repCount: 20, instruction: 'In plank position, alternate driving knees to chest quickly.', icon: 'trending-up', encouragement: "Climbing mountains already! Nothing stops you!" },
  { id: 'sitUps', name: 'Sit-Ups', repCount: 15, instruction: 'Lie on your back, feet flat, curl up toward your knees.', icon: 'body', encouragement: "Those abs are getting stronger every day!" },
  { id: 'calfRaises', name: 'Calf Raises', repCount: 20, instruction: 'Stand on your toes, hold for a second, then lower back down.', icon: 'footsteps', encouragement: "Tip-toe champion! Your calves must be happy!" },
  { id: 'tricepDips', name: 'Tricep Dips', repCount: 10, instruction: 'Use a chair edge. Lower yourself by bending elbows, then push back up.', icon: 'hand-left', encouragement: "Those arms are going to look amazing!" },
  { id: 'gluteBridge', name: 'Glute Bridges', repCount: 15, instruction: 'Lie on your back, push hips up squeezing your glutes at the top.', icon: 'trending-up', encouragement: "Bridge builder! Your glutes are firing!" },
  { id: 'wallSit', name: 'Wall Sit', repCount: 30, instruction: 'Lean against a wall in a sitting position for 30 seconds.', icon: 'square', encouragement: "Wow, 30 seconds! My little legs would give out!" },
  { id: 'bicycleCrunches', name: 'Bicycle Crunches', repCount: 20, instruction: 'Lie on back, alternate touching elbow to opposite knee.', icon: 'bicycle', encouragement: "Pedaling to fitness! What a ride!" },
  { id: 'supermanHold', name: 'Superman Hold', repCount: 20, instruction: 'Lie face-down, lift arms and legs off the ground. Hold 20 seconds.', icon: 'airplane', encouragement: "You're flying! My little cape is fluttering!" },
  { id: 'donkeyKicks', name: 'Donkey Kicks', repCount: 15, instruction: 'On hands and knees, kick one leg back and up. Alternate sides.', icon: 'footsteps', encouragement: "Kick, kick! You're stronger than you think!" },
  { id: 'legRaises', name: 'Leg Raises', repCount: 12, instruction: 'Lie on your back, lift legs straight up, then lower slowly.', icon: 'body', encouragement: "That core control is impressive!" },
  { id: 'armCircles', name: 'Arm Circles', repCount: 20, instruction: '20 forward, then 20 backward. Keep arms extended.', icon: 'sync', encouragement: "Round and round! Your shoulders are warming up nicely!" },
  { id: 'stepUps', name: 'Step-Ups', repCount: 15, instruction: 'Step up onto a sturdy surface, alternate legs.', icon: 'arrow-up', encouragement: "One step at a time, you're going places!" },
  { id: 'inchworms', name: 'Inchworms', repCount: 8, instruction: 'Bend forward, walk hands to plank, then walk feet to hands.', icon: 'bug', encouragement: "Inch by inch, you're getting fitter!" },
  { id: 'sideLunges', name: 'Side Lunges', repCount: 10, instruction: 'Step wide to the side, bending one knee. Alternate sides.', icon: 'walk', encouragement: "Side to side! You're moving like a pro!" },
  { id: 'reverseFlys', name: 'Standing Reverse Flys', repCount: 15, instruction: 'Hinge forward slightly, extend arms out to sides and squeeze shoulder blades.', icon: 'expand', encouragement: "Spread those wings! Your back is getting stronger!" },
  { id: 'kneelingPushUps', name: 'Kneeling Push-Ups', repCount: 12, instruction: 'Push-ups from your knees — great form counts more than anything!', icon: 'fitness', encouragement: "Perfect form! Quality over quantity, always!" },
  { id: 'jumpSquats', name: 'Jump Squats', repCount: 8, instruction: 'Squat down, then explode up into a jump. Land softly.', icon: 'flash', encouragement: "You're jumping like a hamster who found a treat!" },
  { id: 'toeTouch', name: 'Toe Touches', repCount: 15, instruction: 'Stand tall, reach down to touch your toes. Feel the stretch!', icon: 'body', encouragement: "So flexible! Keep reaching for the stars!" },
  { id: 'lateralShuffles', name: 'Lateral Shuffles', repCount: 20, instruction: 'In an athletic stance, shuffle quickly side to side.', icon: 'swap-horizontal', encouragement: "Quick feet! You could dodge anything!" },
  { id: 'hipCircles', name: 'Hip Circles', repCount: 10, instruction: '10 circles each direction. Open up those hips!', icon: 'sync', encouragement: "Hula hoop champion! Those hips are loosening up!" },
  { id: 'boxingPunches', name: 'Air Boxing', repCount: 30, instruction: 'Throw 30 quick punches in the air. Stay light on your feet!', icon: 'hand-left', encouragement: "Pow pow! You're a knockout!" },
  { id: 'skaters', name: 'Skaters', repCount: 12, instruction: 'Leap side to side, landing on one foot. Like speed skating!', icon: 'accessibility', encouragement: "Gliding gracefully! What an athlete!" },
  { id: 'flutterKicks', name: 'Flutter Kicks', repCount: 20, instruction: 'Lie on your back, lift feet slightly, kick up and down in small motions.', icon: 'water', encouragement: "Splash splash! Your core is on fire!" },
  { id: 'reverseLunges', name: 'Reverse Lunges', repCount: 10, instruction: 'Step backward into a lunge. Alternate legs.', icon: 'walk', encouragement: "Going backward to move forward! Love it!" },
  { id: 'singleLegBalance', name: 'Single-Leg Balance', repCount: 30, instruction: 'Stand on one foot for 30 seconds, then switch. Find your center!', icon: 'footsteps', encouragement: "So balanced! You're like a graceful flamingo!" },
  { id: 'seatedTwist', name: 'Seated Twists', repCount: 15, instruction: 'Sit with knees bent, lean back slightly, twist side to side.', icon: 'sync', encouragement: "Twist and shout! Your obliques are loving it!" },
  { id: 'shoulderTaps', name: 'Shoulder Taps', repCount: 16, instruction: 'In plank, tap each shoulder with the opposite hand. Stay stable!', icon: 'hand-left', encouragement: "Tap tap! Your core stability is impressive!" },
  { id: 'starJumps', name: 'Star Jumps', repCount: 10, instruction: 'Jump up spreading arms and legs wide like a star!', icon: 'star', encouragement: "You're a star! Literally and figuratively!" },
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
  if (exercise.id === 'plank' || exercise.id === 'wallSit' || exercise.id === 'supermanHold' || exercise.id === 'singleLegBalance') {
    return `Hold for ${exercise.repCount} Seconds`;
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
