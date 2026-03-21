// Daily Exercise Model
// "The Low Guilt Daily 50" — gentle, accessible exercises for everyone
// One random exercise per day, deterministic per user

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

// Exercise pool — "The Low Guilt Daily 50"
// Organized by category: Mobility & Stretching, Light Cardio, Easy Bodyweight, Quick Wins
export const dailyExercisePool = [
  // ===== MOBILITY & STRETCHING (The "Feel Good" Category) =====
  {
    id: 'reachForSky',
    name: 'Reach for the Sky',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Stand tall and reach your fingertips toward the ceiling. Imagine you\'re trying to grab a snack from the top shelf.',
    icon: 'arrow-up',
    encouragement: "Reaching for the stars! You're stretching so tall!",
  },
  {
    id: 'slowNeckRolls',
    name: 'Slow Neck Rolls',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Gently drop your chin to your chest and slowly roll your head in a full circle. Switch directions halfway through.',
    icon: 'sync',
    encouragement: "Nice and easy! Your neck is thanking you!",
  },
  {
    id: 'shoulderShrugs',
    name: 'Shoulder Shrugs',
    repCount: 20,
    repType: 'reps',
    instruction: 'Pull your shoulders all the way up to your ears, hold for a second, and let them drop heavily.',
    icon: 'body',
    encouragement: "Shrug it off! Bye bye tension!",
  },
  {
    id: 'toeTouchHang',
    name: 'Toe Touch Hang',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Fold forward at the hips and let your arms dangle toward the floor. Keep your knees soft—no need to be flexible!',
    icon: 'arrow-down',
    encouragement: "Just hanging out! Your hamstrings love this!",
  },
  {
    id: 'catCowStretch',
    name: 'Cat-Cow Stretch',
    repCount: 10,
    repType: 'reps',
    instruction: 'On your hands and knees, alternate between arching your back like a spooky cat and letting your belly sink toward the floor.',
    icon: 'paw',
    encouragement: "Meow! Your spine is so happy right now!",
  },
  {
    id: 'sideToSideLean',
    name: 'Side-to-Side Lean',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Reach one arm over your head and lean to the side until you feel a gentle pull along your ribs. Swap sides.',
    icon: 'swap-horizontal',
    encouragement: "Swaying like a tree in the breeze!",
  },
  {
    id: 'hipCircles',
    name: 'Hip Circles',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Place your hands on your hips and draw big circles with your waist, like you\'re using an invisible hula hoop.',
    icon: 'radio-button-off',
    encouragement: "Hula hula! Your hips are getting loosey-goosey!",
  },
  {
    id: 'chestOpener',
    name: 'Chest Opener',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Clasp your hands behind your back and gently pull your shoulders back to open up your chest and heart.',
    icon: 'expand',
    encouragement: "Opening up! Your chest muscles are stretching nicely!",
  },
  {
    id: 'kneeHugs',
    name: 'Knee Hugs',
    repCount: 10,
    repType: 'reps',
    instruction: 'While standing or lying down, pull one knee up toward your chest and give it a quick squeeze before switching.',
    icon: 'heart',
    encouragement: "Hugs for your knees! They deserve it!",
  },
  {
    id: 'wristAnkleCircles',
    name: 'Wrist & Ankle Circles',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Roll your wrists and ankles in circles to "oil the joints" and get rid of any stiffness from sitting.',
    icon: 'sync',
    encouragement: "Circles everywhere! Your joints are waking up!",
  },
  {
    id: 'childsPose',
    name: "Child's Pose",
    repCount: 2,
    repType: 'minutes',
    instruction: 'Kneel on the floor, sit back on your heels, and stretch your arms forward. Just breathe and relax here.',
    icon: 'bed',
    encouragement: "Rest and restore. This is self-care at its finest!",
  },
  {
    id: 'doorwayStretch',
    name: 'The Doorway Stretch',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Place your forearms on a door frame and lean your chest forward slightly to stretch your shoulders.',
    icon: 'home',
    encouragement: "Open up that chest! Feel the stretch!",
  },
  {
    id: 'seatedTwist',
    name: 'Seated Twist',
    repCount: 60,
    repType: 'seconds',
    instruction: 'While sitting in a chair, turn your upper body to look over one shoulder using the chair arm for a light assist.',
    icon: 'refresh',
    encouragement: "Twist and unwind! Your spine loves this!",
  },
  {
    id: 'quadStretch',
    name: 'Quad Stretch',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Stand on one leg (hold a wall for balance!) and pull your heel toward your glute to stretch the front of your thigh.',
    icon: 'body',
    encouragement: "Stretch those quads! They work hard for you!",
  },
  {
    id: 'hamstringKickouts',
    name: 'Hamstring Kick-outs',
    repCount: 20,
    repType: 'reps',
    instruction: 'Gently kick one foot forward at a time, keeping your leg relatively straight to feel a light stretch in the back of the leg.',
    icon: 'footsteps',
    encouragement: "Kick it out! Your hamstrings are loosening up!",
  },

  // ===== LIGHT CARDIO (The "Get Moving" Category) =====
  {
    id: 'hamsterWaddle',
    name: 'The Hamster Waddle',
    repCount: 2,
    repType: 'minutes',
    instruction: 'A casual walk in place. No need to go fast—just keep your feet moving like you\'re exploring a new cage.',
    icon: 'walk',
    encouragement: "Waddle waddle! You look adorable doing this!",
  },
  {
    id: 'invisibleJumpRope',
    name: 'Invisible Jump Rope',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Mimic the hand motion of turning a rope and do tiny, rhythmic bounces on the balls of your feet.',
    icon: 'accessibility',
    encouragement: "Jump jump! Who needs a real rope anyway?",
  },
  {
    id: 'slowHighKnees',
    name: 'Slow Motion High Knees',
    repCount: 60,
    repType: 'seconds',
    instruction: 'March in place with intention. Lift your knees high enough that you could tap them with your hands.',
    icon: 'walk',
    encouragement: "Knees up! You're marching like a champ!",
  },
  {
    id: 'stepTouches',
    name: 'Step-Touches',
    repCount: 90,
    repType: 'seconds',
    instruction: 'Step to the right and tap your left foot next to it, then step to the left and tap your right foot. Simple rhythm.',
    icon: 'musical-notes',
    encouragement: "Side to side! You've got the moves!",
  },
  {
    id: 'armCircles',
    name: 'Arm Circles',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Extend your arms out to the sides and draw small, dinner-plate-sized circles in the air.',
    icon: 'sync',
    encouragement: "Round and round! Your shoulders are warming up!",
  },
  {
    id: 'victoryMarch',
    name: 'The Victory March',
    repCount: 2,
    repType: 'minutes',
    instruction: 'High-energy marching around your room. Imagine you just finished a marathon (or a very long email).',
    icon: 'trophy',
    encouragement: "March on, champion! Every step is a victory!",
  },
  {
    id: 'slowShadowBox',
    name: 'Shadow Boxing (Slow)',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Throw gentle, controlled punches into the air in front of you. Keep your shoulders relaxed.',
    icon: 'hand-left',
    encouragement: "Pow pow! You're a gentle giant!",
  },
  {
    id: 'buttKicks',
    name: 'Butt Kicks',
    repCount: 60,
    repType: 'seconds',
    instruction: 'While walking or jogging in place, try to bring your heels up to touch your glutes with every step.',
    icon: 'footsteps',
    encouragement: "Kick those heels! Your legs are loving this!",
  },
  {
    id: 'wallTaps',
    name: 'Wall Taps',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Stand arm\'s length from a wall and tap it with alternating hands, shifting your weight slightly as you do.',
    icon: 'hand-right',
    encouragement: "Tap tap tap! Coordination champion!",
  },
  {
    id: 'slowJacks',
    name: 'Slow Jacks',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Instead of jumping, step your right foot out and raise your arms, then bring it back and repeat with the left.',
    icon: 'accessibility',
    encouragement: "Easy does it! Low impact, high reward!",
  },
  {
    id: 'kitchenWalk',
    name: 'Kitchen Counter Walk',
    repCount: 2,
    repType: 'minutes',
    instruction: 'Pace back and forth in whatever room you are in. It\'s like a "thinking walk" but for your health.',
    icon: 'walk',
    encouragement: "Pace it out! Every step counts!",
  },
  {
    id: 'torsoTwists',
    name: 'Torso Twists',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Keep your feet planted and gently swing your arms side to side, letting your torso rotate naturally.',
    icon: 'refresh',
    encouragement: "Twist it out! Your core is getting a gentle workout!",
  },

  // ===== EASY BODYWEIGHT (The "Stay Strong" Category) =====
  {
    id: 'wallPushups',
    name: 'Wall Push-ups',
    repCount: 15,
    repType: 'reps',
    instruction: 'Lean against a wall with your hands at shoulder height. Bend your elbows to bring your face close, then push back.',
    icon: 'fitness',
    encouragement: "Push it! Wall push-ups are the best kind!",
  },
  {
    id: 'chairSquats',
    name: 'Chair Squats',
    repCount: 10,
    repType: 'reps',
    instruction: 'Stand in front of a chair, lower your hips until you almost touch the seat, then stand back up.',
    icon: 'body',
    encouragement: "Up and down! Your legs are getting stronger!",
  },
  {
    id: 'calfRaises',
    name: 'Calf Raises',
    repCount: 20,
    repType: 'reps',
    instruction: 'Hold onto something for balance and rise up onto your tiptoes, then slowly lower your heels back down.',
    icon: 'arrow-up',
    encouragement: "Tip-toe champion! Your calves are happy!",
  },
  {
    id: 'shortWallSit',
    name: 'Wall Sit (Short)',
    repCount: 30,
    repType: 'seconds',
    instruction: 'Lean your back against a wall and slide down into a "seated" position. Hold it just long enough to feel the tingle.',
    icon: 'square',
    encouragement: "Hold it! Just 30 seconds of awesome!",
  },
  {
    id: 'tabletopPlank',
    name: 'Tabletop Plank',
    repCount: 45,
    repType: 'seconds',
    instruction: 'Lean your hands on a sturdy table or desk and hold a straight line from your head to your heels.',
    icon: 'remove',
    encouragement: "Sturdy as a table! Your core is working!",
  },
  {
    id: 'gluteSqueezes',
    name: 'Glute Squeezes',
    repCount: 15,
    repType: 'reps',
    instruction: 'While standing still, squeeze your glute muscles as hard as you can, hold for three seconds, and release.',
    icon: 'body',
    encouragement: "Squeeze! No one even knows you're exercising!",
  },
  {
    id: 'standingLegLifts',
    name: 'Standing Leg Lifts',
    repCount: 20,
    repType: 'reps',
    instruction: 'Stand tall and lift one leg out to the side a few inches, then bring it back. Switch after a few reps.',
    icon: 'body',
    encouragement: "Lift those legs! Balance and strength!",
  },
  {
    id: 'airBike',
    name: 'The "Air" Bike',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Lie on your back with your legs in the air and move them in a circular "pedaling" motion.',
    icon: 'bicycle',
    encouragement: "Pedal pedal! Invisible bike champion!",
  },
  {
    id: 'slowBirdDog',
    name: 'Bird-Dog (Slow)',
    repCount: 10,
    repType: 'reps',
    instruction: 'On hands and knees, reach your right arm forward and your left leg back at the same time. Switch and repeat.',
    icon: 'paw',
    encouragement: "Balance master! You're so graceful!",
  },
  {
    id: 'handClaps',
    name: 'Hand Claps',
    repCount: 30,
    repType: 'reps',
    instruction: 'Hold your arms out wide like a giant hug, then bring them together for a big clap in front of you.',
    icon: 'hand-right',
    encouragement: "Clap clap clap! Give yourself applause!",
  },

  // ===== THE "REPEATS" (Quick Wins) =====
  // These appear again to make easy exercises more likely to come up
  {
    id: 'reachForSky2',
    name: 'Reach for the Sky',
    repCount: 60,
    repType: 'seconds',
    instruction: 'One more big stretch to reset your posture and wake up your spine.',
    icon: 'arrow-up',
    encouragement: "Reaching high! You're touching the clouds!",
  },
  {
    id: 'chairSquats2',
    name: 'Chair Squats',
    repCount: 10,
    repType: 'reps',
    instruction: 'A quick set to keep those leg muscles awake and ready for the day.',
    icon: 'body',
    encouragement: "Sit and stand! Your legs are thanking you!",
  },
  {
    id: 'hamsterWaddle2',
    name: 'The Hamster Waddle',
    repCount: 2,
    repType: 'minutes',
    instruction: 'A final casual stroll in place to keep the blood flowing.',
    icon: 'walk',
    encouragement: "Waddle along! Movement is movement!",
  },
  {
    id: 'wallPushups2',
    name: 'Wall Push-ups',
    repCount: 15,
    repType: 'reps',
    instruction: 'A few more easy presses to keep your upper body feeling strong.',
    icon: 'fitness',
    encouragement: "Push those walls! Getting stronger every day!",
  },
  {
    id: 'shoulderShrugs2',
    name: 'Shoulder Shrugs',
    repCount: 20,
    repType: 'reps',
    instruction: 'Shake off any tension you\'ve picked up since the start of these prompts.',
    icon: 'body',
    encouragement: "Shrug away the stress! Feel it melt away!",
  },
  {
    id: 'toeTouchHang2',
    name: 'Toe Touch Hang',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Let gravity do the work one more time to loosen up your lower back.',
    icon: 'arrow-down',
    encouragement: "Hang loose! Your back is stretching nicely!",
  },
  {
    id: 'stepTouches2',
    name: 'Step-Touches',
    repCount: 90,
    repType: 'seconds',
    instruction: 'Get back into that easy side-to-side rhythm for a final bit of movement.',
    icon: 'musical-notes',
    encouragement: "Step step tap! Dancing your way to fitness!",
  },
  {
    id: 'calfRaises2',
    name: 'Calf Raises',
    repCount: 20,
    repType: 'reps',
    instruction: 'Give your ankles and calves one last bit of attention.',
    icon: 'arrow-up',
    encouragement: "Rise up! Those calves are getting stronger!",
  },
  {
    id: 'slowHighKnees2',
    name: 'Slow Motion High Knees',
    repCount: 60,
    repType: 'seconds',
    instruction: 'A final purposeful march to signal that you\'re active and capable.',
    icon: 'walk',
    encouragement: "March march march! You're doing great!",
  },
  {
    id: 'hipCircles2',
    name: 'Hip Circles',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Loosen up the middle of your body to stay mobile and fluid.',
    icon: 'radio-button-off',
    encouragement: "Round and round! Those hips don't lie!",
  },
  {
    id: 'armCircles2',
    name: 'Arm Circles',
    repCount: 60,
    repType: 'seconds',
    instruction: 'Keep those shoulders moving so they don\'t get stiff at your desk.',
    icon: 'sync',
    encouragement: "Circle those arms! Shoulders are warming up!",
  },
  {
    id: 'wallTaps2',
    name: 'Wall Taps',
    repCount: 60,
    repType: 'seconds',
    instruction: 'A simple, grounding movement to bring your focus back to the present.',
    icon: 'hand-right',
    encouragement: "Tap away! Quick hands, quick wins!",
  },
];

// The Final Stretch - shown after every check-in, not a random exercise
export const FINAL_STRETCH_PROMPT = {
  title: 'The Final Stretch',
  instruction: 'Take a massive breath in, reach as high as you can, and exhale everything out.',
  icon: 'sunny',
};

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

// Computed display prompt based on rep type
export const getExerciseDisplayPrompt = (exercise) => {
  const { repCount, repType, name } = exercise;

  switch (repType) {
    case 'seconds':
      return `Hold for ${repCount} Seconds`;
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
