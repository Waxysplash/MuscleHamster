// Fitness Tip Model
// Short bite-sized fitness knowledge, rotates daily

export const TipCategory = {
  NUTRITION: 'nutrition',
  EXERCISE: 'exercise',
  RECOVERY: 'recovery',
  MINDSET: 'mindset',
  FUN_FACT: 'funFact',
};

export const TipCategoryInfo = {
  [TipCategory.NUTRITION]: { displayName: 'Nutrition', icon: 'nutrition', color: '#34C759' },
  [TipCategory.EXERCISE]: { displayName: 'Exercise', icon: 'fitness', color: '#007AFF' },
  [TipCategory.RECOVERY]: { displayName: 'Recovery', icon: 'bed', color: '#5856D6' },
  [TipCategory.MINDSET]: { displayName: 'Mindset', icon: 'happy', color: '#FF9500' },
  [TipCategory.FUN_FACT]: { displayName: 'Fun Fact', icon: 'bulb', color: '#FFCC00' },
};

// Pool of 40 tips
export const fitnessTipPool = [
  { id: 'tip01', text: 'Drinking water before a meal can help you feel full and stay hydrated for your workout.', category: TipCategory.NUTRITION },
  { id: 'tip02', text: 'Your muscles grow during rest, not during the workout itself. Recovery is key!', category: TipCategory.RECOVERY },
  { id: 'tip03', text: 'Even a 10-minute walk counts as exercise and can boost your mood instantly.', category: TipCategory.EXERCISE },
  { id: 'tip04', text: 'Bananas are a great pre-workout snack — they provide quick energy and potassium.', category: TipCategory.NUTRITION },
  { id: 'tip05', text: 'Consistency beats intensity. Showing up regularly matters more than going all-out once.', category: TipCategory.MINDSET },
  { id: 'tip06', text: 'Stretching after a workout helps reduce muscle soreness the next day.', category: TipCategory.RECOVERY },
  { id: 'tip07', text: 'Your heart is a muscle too — cardio makes it stronger and more efficient.', category: TipCategory.FUN_FACT },
  { id: 'tip08', text: 'Protein helps repair muscles. Try to eat some within an hour after exercising.', category: TipCategory.NUTRITION },
  { id: 'tip09', text: 'Setting small, achievable goals helps build the habit of exercising regularly.', category: TipCategory.MINDSET },
  { id: 'tip10', text: 'Sleep is when your body does most of its repair work. Aim for 7-9 hours.', category: TipCategory.RECOVERY },
  { id: 'tip11', text: 'Squats are one of the best exercises — they work your legs, core, and glutes all at once.', category: TipCategory.EXERCISE },
  { id: 'tip12', text: 'The human body has over 600 muscles. Even smiling uses about 12 of them!', category: TipCategory.FUN_FACT },
  { id: 'tip13', text: 'Eating colorful fruits and vegetables gives your body a variety of important nutrients.', category: TipCategory.NUTRITION },
  { id: 'tip14', text: "It takes about 21 days to start forming a habit. You're building something great!", category: TipCategory.MINDSET },
  { id: 'tip15', text: 'Foam rolling can help release tight muscles and improve your range of motion.', category: TipCategory.RECOVERY },
  { id: 'tip16', text: 'Walking 10,000 steps a day is great, but even 4,000 steps has measurable health benefits.', category: TipCategory.EXERCISE },
  { id: 'tip17', text: 'Laughing is actually a mini-workout — it exercises your diaphragm and abs!', category: TipCategory.FUN_FACT },
  { id: 'tip18', text: 'Greek yogurt is packed with protein and makes a great post-workout snack.', category: TipCategory.NUTRITION },
  { id: 'tip19', text: 'Comparing yourself to others can be discouraging. Focus on your own progress!', category: TipCategory.MINDSET },
  { id: 'tip20', text: 'A warm bath or shower after exercise can help relax your muscles.', category: TipCategory.RECOVERY },
  { id: 'tip21', text: 'Planks strengthen your entire core without any equipment needed.', category: TipCategory.EXERCISE },
  { id: 'tip22', text: "Your bones get stronger with exercise too, not just your muscles.", category: TipCategory.FUN_FACT },
  { id: 'tip23', text: 'Nuts and seeds are excellent sources of healthy fats and energy.', category: TipCategory.NUTRITION },
  { id: 'tip24', text: 'Celebrating small wins keeps you motivated on your fitness journey.', category: TipCategory.MINDSET },
  { id: 'tip25', text: 'Ice baths and cold showers can reduce inflammation after intense workouts.', category: TipCategory.RECOVERY },
  { id: 'tip26', text: 'Bodyweight exercises like push-ups and squats can be done anywhere, anytime.', category: TipCategory.EXERCISE },
  { id: 'tip27', text: 'Exercise releases endorphins — natural chemicals that make you feel happy.', category: TipCategory.FUN_FACT },
  { id: 'tip28', text: 'Oatmeal is a slow-releasing carb that gives you steady energy throughout the morning.', category: TipCategory.NUTRITION },
  { id: 'tip29', text: "Rest days aren't lazy days — they're essential for getting stronger.", category: TipCategory.MINDSET },
  { id: 'tip30', text: 'Gentle yoga on rest days can help with flexibility and mental relaxation.', category: TipCategory.RECOVERY },
  { id: 'tip31', text: 'High-intensity interval training (HIIT) can burn calories even after you stop exercising.', category: TipCategory.EXERCISE },
  { id: 'tip32', text: 'The strongest muscle in your body relative to its size is the masseter (jaw muscle).', category: TipCategory.FUN_FACT },
  { id: 'tip33', text: 'Hydration affects performance — even mild dehydration can reduce your strength.', category: TipCategory.NUTRITION },
  { id: 'tip34', text: "Progress isn't always visible. Trust the process and keep going!", category: TipCategory.MINDSET },
  { id: 'tip35', text: 'Magnesium-rich foods like spinach and dark chocolate can help with muscle recovery.', category: TipCategory.RECOVERY },
  { id: 'tip36', text: 'Lunges improve balance and coordination while strengthening your lower body.', category: TipCategory.EXERCISE },
  { id: 'tip37', text: 'Regular exercise can improve your memory and brain function.', category: TipCategory.FUN_FACT },
  { id: 'tip38', text: 'Eating a mix of carbs and protein after a workout helps your body recover faster.', category: TipCategory.NUTRITION },
  { id: 'tip39', text: 'Visualization — imagining yourself completing a workout — can actually improve performance.', category: TipCategory.MINDSET },
  { id: 'tip40', text: 'Active recovery like light walking on rest days promotes blood flow and healing.', category: TipCategory.RECOVERY },
];

// Get today's tip (rotates daily by day-of-year)
export const getTodaysTip = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const doy = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = (doy - 1 + fitnessTipPool.length) % fitnessTipPool.length;
  return fitnessTipPool[index];
};
