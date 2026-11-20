// Ready-made workouts ("set workouts") on the Workouts tab home view.
// Classic gym split, made doable at home: Chest & Triceps, Back & Biceps, Shoulders, Legs,
// plus Abs, Cardio and Stretch. Each at three levels. Every move has a plain how-to in
// MoveGuide.js. Beginner lists are low-impact (no jumping). Some arm and shoulder moves use
// two water bottles (or cans) as light weights.

export const LEVELS = ['beginner', 'intermediate', 'advanced'];

export const LEVEL_INFO = {
  beginner: { label: 'Beginner', duration: 'short', blurb: 'Gentle and about 15 minutes' },
  intermediate: { label: 'Intermediate', duration: 'medium', blurb: 'A solid session, about 25 minutes' },
  advanced: { label: 'Advanced', duration: 'long', blurb: 'A big one, about 35 minutes' },
};

export const PROGRAMS = [
  {
    id: 'chestTriceps',
    idBase: 100,
    title: 'Chest & Triceps',
    subtitle: 'Push-ups and the backs of your arms',
    about: 'Pushing moves for your chest, plus the triceps on the back of your arms.',
    needs: 'Two water bottles (or cans) for some moves',
    icon: 'arrow-up-circle',
    color: '#FFE3B8', // peach
    type: 'strength',
    bodyFocus: ['upperBody', 'chest', 'arms'],
    moves: {
      beginner: ['Wall Push-Ups', 'Bottle Tricep Kickbacks', 'Knee Push-Ups', 'Chair Dips', 'Shoulder Stretch'],
      intermediate: ['Push-Ups', 'Bottle Tricep Kickbacks', 'Knee Push-Ups', 'Dips', 'Overhead Tricep Stretch Press', 'Plank', 'Tricep Stretch'],
      advanced: ['Push-Ups', 'Diamond Push-Ups', 'Dips', 'Overhead Tricep Stretch Press', 'Push-Up Jacks', 'Bottle Tricep Kickbacks', 'Plank Shoulder Taps', 'Plank', 'Tricep Stretch'],
    },
  },
  {
    id: 'backBiceps',
    idBase: 110,
    title: 'Back & Biceps',
    subtitle: 'Posture and the fronts of your arms',
    about: 'Pulling moves for your back, plus curls for your biceps. Great for posture after sitting.',
    needs: 'Two water bottles and a towel for some moves',
    icon: 'arrow-down-circle',
    color: '#D9EEF2', // sky
    type: 'strength',
    bodyFocus: ['back', 'arms', 'upperBody'],
    moves: {
      beginner: ['Superman', 'Bottle Bicep Curls', 'Prone Y-Raise', 'Towel Bicep Curls', 'Cat-Cow'],
      intermediate: ['Door Towel Rows', 'Bottle Bicep Curls', 'Superman', 'Towel Bicep Curls', 'Reverse Snow Angels', 'Prone Y-Raise', 'Thread the Needle'],
      advanced: ['Door Towel Rows', 'Bottle Bicep Curls', 'Superman', 'Towel Bicep Curls', 'Reverse Snow Angels', 'Prone Y-Raise', 'Bird Dog', 'Side Plank', 'Thread the Needle'],
    },
  },
  {
    id: 'shoulders',
    idBase: 160,
    title: 'Shoulders',
    subtitle: 'Round, strong shoulders',
    about: 'Presses and raises for the front, side and back of your shoulders.',
    needs: 'Two water bottles (or cans)',
    icon: 'expand',
    color: '#FFF0C2', // butter
    type: 'strength',
    bodyFocus: ['shoulders', 'upperBody'],
    moves: {
      beginner: ['Arm Circles', 'Bottle Shoulder Press', 'Bottle Lateral Raises', 'Wall Angels', 'Shoulder Stretch'],
      intermediate: ['Arm Circles', 'Bottle Shoulder Press', 'Bottle Lateral Raises', 'Bottle Front Raises', 'Plank Shoulder Taps', 'Wall Angels', 'Shoulder Stretch'],
      advanced: ['Pike Push-Ups', 'Bottle Shoulder Press', 'Bottle Lateral Raises', 'Bottle Front Raises', 'Plank to Downward Dog', 'Plank Shoulder Taps', 'Reverse Snow Angels', 'Arm Circles', 'Shoulder Stretch'],
    },
  },
  {
    id: 'legs',
    idBase: 120,
    title: 'Legs',
    subtitle: 'Thighs, bottom and calves',
    about: 'Squats, lunges and bridges. Strong legs make every day easier.',
    needs: 'Nothing, just you',
    icon: 'footsteps',
    color: '#DDF2D8', // mint
    type: 'strength',
    bodyFocus: ['lowerBody', 'legs', 'glutes'],
    moves: {
      beginner: ['Chair Squats', 'Glute Bridges', 'Reverse Lunges', 'Calf Raises', 'Side-Lying Leg Raises'],
      intermediate: ['Squats', 'Reverse Lunges', 'Glute Bridges', 'Wall Sit', 'Calf Raises', 'Side-Lying Leg Raises', 'Lunges'],
      advanced: ['Squats', 'Lunges', 'Jump Squats', 'Glute Bridges', 'Wall Sit', 'Split Jumps', 'Calf Raises', 'Side-Lying Leg Raises', 'Box Steps'],
    },
  },
  {
    id: 'abs',
    idBase: 130,
    title: 'Abs',
    subtitle: 'Tummy and lower back',
    about: 'Your core holds you steady. These moves build your abs and protect your back.',
    needs: 'Nothing, just you',
    icon: 'body',
    color: '#F3E6D6', // sand
    type: 'strength',
    bodyFocus: ['core'],
    moves: {
      beginner: ['Dead Bug', 'Crunches', 'Knee Plank', 'Heel Taps', 'Bird Dog'],
      intermediate: ['Crunches', 'Plank', 'Bicycle Crunches', 'Side Plank', 'Russian Twists', 'Dead Bug', 'Heel Taps'],
      advanced: ['Plank', 'Leg Raises', 'Bicycle Crunches', 'Russian Twists', 'Side Plank', 'Mountain Climbers', 'The Hundred', 'Teaser', 'Dead Bug'],
    },
  },
  {
    id: 'cardio',
    idBase: 140,
    title: 'Cardio',
    subtitle: 'Get your heart going',
    about: 'Keep moving to warm up and breathe a bit harder. Good for your heart and your mood.',
    needs: 'Nothing, just you',
    icon: 'heart',
    color: '#FFD6CC', // soft coral
    type: 'cardio',
    bodyFocus: ['fullBody'],
    moves: {
      beginner: ['Marching in Place', 'Step Jacks', 'Standing Knee Lifts', 'Side Steps', 'Shadow Boxing'],
      intermediate: ['Running in Place', 'Jumping Jacks', 'Butt Kicks', 'Shadow Boxing', 'Skaters', 'Box Steps', 'High Knees'],
      advanced: ['Jumping Jacks', 'High Knees', 'Burpees', 'Skaters', 'Jump Squats', 'Mountain Climbers', 'Seal Jacks', 'Tuck Jumps', 'Speed Skaters'],
    },
  },
  {
    id: 'stretch',
    idBase: 150,
    title: 'Stretch',
    subtitle: 'Rest days and loosening up',
    about: 'Slow stretches to feel looser. Great on rest days or after a workout.',
    needs: 'Nothing, just you',
    icon: 'leaf',
    color: '#E8F0D8', // soft sage
    type: 'stretching',
    bodyFocus: ['fullBody'],
    wide: true, // full-width tile under the split
    moves: {
      beginner: ['Neck Rolls', 'Shoulder Stretch', 'Cat-Cow', "Child's Pose", 'Hamstring Stretch'],
      intermediate: ['Neck Rolls', 'Shoulder Stretch', 'Tricep Stretch', 'Quad Stretch', 'Hamstring Stretch', 'Hip Flexor Stretch', 'Spinal Twist'],
      advanced: ['Cat-Cow', "World's Greatest Stretch", '90/90 Stretch', 'Thoracic Rotations', 'Hip Flexor Stretch', 'Figure Four Stretch', 'Pigeon Pose', 'Spinal Twist', "Child's Pose"],
    },
  },
];

// Stable ids (w-<number>, the guided-workout pattern) so saved plans keep working
export const programWorkoutId = (program, levelIndex) => `w-${program.idBase + levelIndex}`;

export const getProgram = (id) => PROGRAMS.find((p) => p.id === id) || null;

export default PROGRAMS;
