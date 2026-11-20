// Ready-made workouts ("set workouts") shown on the Workouts tab home view.
// Six categories, each at three levels. Every move has a plain how-to in MoveGuide.js.
// Beginner lists are low-impact (no jumping). Built into the workout library by WorkoutService.

export const LEVELS = ['beginner', 'intermediate', 'advanced'];

export const LEVEL_INFO = {
  beginner: { label: 'Beginner', duration: 'short', blurb: 'Gentle and about 15 minutes' },
  intermediate: { label: 'Intermediate', duration: 'medium', blurb: 'A solid session, about 25 minutes' },
  advanced: { label: 'Advanced', duration: 'long', blurb: 'A big one, about 35 minutes' },
};

export const PROGRAMS = [
  {
    id: 'push',
    title: 'Push',
    subtitle: 'Chest, shoulders and arms',
    about: 'Moves where you push away from you, like push-ups. Great for arm and chest strength.',
    icon: 'arrow-up-circle',
    color: '#FFE3B8', // peach
    type: 'strength',
    bodyFocus: ['upperBody', 'chest', 'shoulders', 'arms'],
    moves: {
      beginner: ['Wall Push-Ups', 'Knee Push-Ups', 'Arm Circles', 'Knee Plank', 'Shoulder Stretch'],
      intermediate: ['Push-Ups', 'Knee Push-Ups', 'Dips', 'Plank Shoulder Taps', 'Plank', 'Arm Circles', 'Tricep Stretch'],
      advanced: ['Push-Ups', 'Pike Push-Ups', 'Dips', 'Plank Shoulder Taps', 'Push-Up Jacks', 'Side Plank', 'Plank', 'Arm Circles', 'Tricep Stretch'],
    },
  },
  {
    id: 'pull',
    title: 'Pull',
    subtitle: 'Back and posture',
    about: 'Moves where you pull toward you or lift your back. Good for posture after a day of sitting.',
    icon: 'arrow-down-circle',
    color: '#D9EEF2', // sky
    type: 'strength',
    bodyFocus: ['back', 'upperBody'],
    moves: {
      beginner: ['Superman', 'Bird Dog', 'Prone Y-Raise', 'Reverse Snow Angels', 'Cat-Cow'],
      intermediate: ['Door Towel Rows', 'Superman', 'Prone Y-Raise', 'Reverse Snow Angels', 'Bird Dog', 'Thread the Needle', 'Cat-Cow'],
      advanced: ['Door Towel Rows', 'Superman', 'Prone Y-Raise', 'Reverse Snow Angels', 'Plank Shoulder Taps', 'Side Plank', 'Bird Dog', 'Thread the Needle', 'Cat-Cow'],
    },
  },
  {
    id: 'legs',
    title: 'Legs',
    subtitle: 'Thighs, bottom and calves',
    about: 'Squats, lunges and bridges. Strong legs make every day easier.',
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
    id: 'core',
    title: 'Core',
    subtitle: 'Tummy and lower back',
    about: 'Your core holds you steady. These moves help balance and protect your back.',
    icon: 'body',
    color: '#F3E6D6', // sand
    type: 'strength',
    bodyFocus: ['core'],
    moves: {
      beginner: ['Dead Bug', 'Bird Dog', 'Knee Plank', 'Glute Bridges', 'Heel Taps'],
      intermediate: ['Dead Bug', 'Plank', 'Side Plank', 'Bicycle Crunches', 'Heel Taps', 'Bird Dog', 'Glute Bridges'],
      advanced: ['Plank', 'Side Plank', 'Bicycle Crunches', 'Mountain Climbers', 'Dead Bug', 'The Hundred', 'Scissors', 'Teaser', 'Plank Shoulder Taps'],
    },
  },
  {
    id: 'cardio',
    title: 'Cardio',
    subtitle: 'Get your heart going',
    about: 'Keep moving to warm up and breathe a bit harder. Good for your heart and your mood.',
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
    title: 'Stretch',
    subtitle: 'Loosen up and relax',
    about: 'Slow stretches to feel looser. Great on rest days or after a workout.',
    icon: 'leaf',
    color: '#E8F0D8', // soft sage
    type: 'stretching',
    bodyFocus: ['fullBody'],
    moves: {
      beginner: ['Neck Rolls', 'Shoulder Stretch', 'Cat-Cow', "Child's Pose", 'Hamstring Stretch'],
      intermediate: ['Neck Rolls', 'Shoulder Stretch', 'Tricep Stretch', 'Quad Stretch', 'Hamstring Stretch', 'Hip Flexor Stretch', 'Spinal Twist'],
      advanced: ['Cat-Cow', "World's Greatest Stretch", '90/90 Stretch', 'Thoracic Rotations', 'Hip Flexor Stretch', 'Figure Four Stretch', 'Pigeon Pose', 'Spinal Twist', "Child's Pose"],
    },
  },
];

// Stable ids that match the guided-workout pattern (w-<number>) so plans can open them.
export const programWorkoutId = (programIndex, levelIndex) => `w-${100 + programIndex * 10 + levelIndex}`;

export const getProgram = (id) => PROGRAMS.find((p) => p.id === id) || null;

export default PROGRAMS;
