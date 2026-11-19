// Move Guide - plain-language how-to for every move in the guided workouts.
// Written for complete beginners (beginner reviews, Nov 2026): no gym words, 2-3 short
// sentences, an easier version, and whether the move involves jumping (impact).
// Used by WorkoutService (to build workouts) and the workout player (to teach each move).

export const MOVE_GUIDE = {
  // ---------- Gentle / beginner-friendly strength ----------
  'Wall Push-Ups': {
    how: 'Stand an arm’s length from a wall and put your hands on it at shoulder height. Bend your elbows to bring your chest toward the wall, then push back.',
    easier: 'Stand a little closer to the wall.',
  },
  'Knee Push-Ups': {
    how: 'Kneel and put your hands on the floor under your shoulders. Keep a straight line from knees to head, lower your chest toward the floor, then push back up.',
    easier: 'Do them against a wall instead.',
  },
  'Push-Ups': {
    how: 'Start on your hands and toes, hands under your shoulders, body in a straight line. Lower your chest toward the floor, then push back up.',
    easier: 'Drop your knees to the floor, or push against a wall.',
  },
  'Chair Squats': {
    how: 'Stand in front of a chair, feet hip-width apart. Sit back slowly until you touch the seat, then stand up by pushing through your heels.',
    easier: 'Use your hands on your thighs to help you stand.',
  },
  'Squats': {
    how: 'Stand with feet hip-width apart. Push your hips back and bend your knees like you’re sitting into a chair, keeping your chest up and knees in line with your toes. Stand back up.',
    easier: 'Sit down onto a chair and stand back up.',
  },
  'Reverse Lunges': {
    how: 'Stand tall, holding a chair or wall if you like. Step one foot back and bend both knees a little, then step back to standing. Switch legs each time.',
    easier: 'Take a smaller step back and only bend a little.',
  },
  'Lunges': {
    how: 'Stand tall and take a big step forward. Bend both knees until your back knee is close to the floor, then push back to standing. Switch legs each time.',
    easier: 'Step backwards instead, holding a chair for balance.',
  },
  'Glute Bridges': {
    how: 'Lie on your back with knees bent and feet flat on the floor. Squeeze your bottom and lift your hips until your body makes a straight line from knees to shoulders, then lower slowly.',
    easier: 'Lift your hips only halfway.',
  },
  'Calf Raises': {
    how: 'Stand tall, holding a wall or chair for balance. Rise up onto your toes, pause, then lower your heels slowly.',
    easier: 'Go up only a little way.',
  },
  'Knee Plank': {
    how: 'Rest on your forearms and knees. Keep your back flat like a table and hold still while you breathe normally.',
    easier: 'Hold for a shorter time and rest, then try again.',
  },
  'Plank': {
    how: 'Rest on your forearms and toes with your body in a straight line from head to heels. Tighten your stomach and hold still while you breathe normally.',
    easier: 'Put your knees on the floor.',
  },
  'Plank Hold': {
    how: 'Rest on your forearms and toes with your body in a straight line from head to heels. Tighten your stomach and hold still while you breathe normally.',
    easier: 'Put your knees on the floor.',
  },
  'Bird Dog': {
    how: 'Start on hands and knees. Reach one arm forward and the opposite leg back, hold for a breath, then switch sides.',
    easier: 'Move only the arms, or only the legs.',
  },
  'Dead Bug': {
    how: 'Lie on your back with arms pointing to the ceiling and knees bent above your hips. Slowly lower one arm and the opposite leg toward the floor, then switch.',
    easier: 'Keep your feet on the floor and only move your arms.',
  },
  'Superman': {
    how: 'Lie on your stomach with arms stretched forward. Gently lift your arms, chest and legs a little off the floor, hold for a breath, then lower.',
    easier: 'Lift only your arms, or only your legs.',
  },
  'Wall Sit': {
    how: 'Lean your back against a wall and slide down until your knees are bent. Hold still with your feet flat on the floor.',
    easier: 'Only slide halfway down.',
  },
  'Chair Dips': {
    how: 'Sit on the edge of a sturdy chair, hands gripping the seat beside your hips. Slide your bottom off the seat and bend your elbows a little to lower yourself, then push back up.',
    easier: 'Keep your feet close and only lower a little. Skip this one if your shoulders hurt.',
  },
  'Dips': {
    how: 'Sit on the edge of a sturdy chair, hands gripping the seat beside your hips. Slide your bottom off the seat and bend your elbows to lower yourself, then push back up.',
    easier: 'Keep your knees bent and feet close, and only lower a little. Skip this one if your shoulders hurt.',
  },
  'Side-Lying Leg Raises': {
    how: 'Lie on your side with legs straight and head resting on your arm. Lift your top leg up slowly, then lower it. Switch sides halfway.',
    easier: 'Bend your bottom knee for balance and lift only a little.',
  },
  'Plank Shoulder Taps': {
    how: 'Start at the top of a push-up with feet wide. Tap one shoulder with the opposite hand, put it back, then switch, keeping your hips still.',
    easier: 'Do it with your knees on the floor.',
  },
  'Pike Push-Ups': {
    how: 'Start on hands and feet with your hips high, like an upside-down V. Bend your elbows to bring your head toward the floor, then push back up.',
    easier: 'Do knee push-ups instead.',
  },
  'Side Plank': {
    how: 'Lie on your side and prop yourself up on your forearm. Lift your hips so your body is in a straight line and hold. Switch sides halfway.',
    easier: 'Keep your bottom knee on the floor.',
  },
  'Heel Taps': {
    how: 'Lie on your back with knees bent and feet flat. Lift your head and shoulders a little and reach side to side to touch each heel.',
    easier: 'Keep your head on the floor and just reach side to side.',
  },
  'Bicycle Crunches': {
    how: 'Lie on your back with hands lightly behind your head. Bring one knee in while you turn the opposite elbow toward it, then switch sides slowly.',
    easier: 'Keep your feet on the floor and twist gently.',
  },
  'Mountain Climbers': {
    how: 'Start at the top of a push-up. Bring one knee toward your chest, then switch legs, at a pace you can keep up.',
    easier: 'Step the knees in slowly, or do it with hands on a chair.',
    impact: true,
  },

  // ---------- Cardio: low impact ----------
  'Marching in Place': {
    how: 'Stand tall and march on the spot, lifting your knees and swinging your arms.',
    easier: 'Lift your knees only a little, or march sitting in a chair.',
  },
  'Step Jacks': {
    how: 'Step one foot out to the side while raising your arms overhead, then step back in and lower your arms. Switch sides.',
    easier: 'Keep your arms at shoulder height.',
  },
  'Standing Knee Lifts': {
    how: 'Stand tall and lift one knee up toward your hands, then lower it and lift the other. Keep a steady rhythm.',
    easier: 'Hold a chair for balance and lift lower.',
  },
  'Side Steps': {
    how: 'Step to the side twice, then step back twice, swinging your arms. Keep it light and steady.',
    easier: 'Take smaller steps.',
  },
  'Shadow Boxing': {
    how: 'Stand with knees soft and fists up. Punch forward with one arm and then the other, staying light on your feet.',
    easier: 'Punch slower and keep your feet still.',
  },
  'Butt Kicks': {
    how: 'Jog or walk on the spot, bringing your heels up toward your bottom.',
    easier: 'Walk in place and bring your heels up gently.',
  },
  'Box Steps': {
    how: 'Step up onto the bottom stair or a sturdy step with one foot, then the other, then step back down. Switch the leading foot halfway.',
    easier: 'Hold the railing, or march in place instead.',
  },
  'Running in Place': {
    how: 'Jog gently on the spot, landing softly on the balls of your feet and swinging your arms.',
    easier: 'March in place instead.',
  },

  // ---------- Cardio / intervals: jumping (not for beginners) ----------
  'Jumping Jacks': {
    how: 'Jump your feet out wide while raising your arms overhead, then jump back together with arms down.',
    easier: 'Step one foot out at a time instead of jumping.',
    impact: true,
  },
  'High Knees': {
    how: 'Run on the spot, bringing your knees up toward hip height and pumping your arms.',
    easier: 'March in place, lifting your knees.',
    impact: true,
  },
  'Burpees': {
    how: 'Squat down and put your hands on the floor, step or jump your feet back to a push-up position, bring them back in, then stand up.',
    easier: 'Step your feet back one at a time and skip the jump.',
    impact: true,
  },
  'Skaters': {
    how: 'Hop sideways onto one foot, swinging the other leg behind you, then hop to the other side.',
    easier: 'Step side to side instead of hopping.',
    impact: true,
  },
  'Speed Skaters': {
    how: 'Hop quickly sideways from one foot to the other, swinging your arms across your body.',
    easier: 'Step side to side instead of hopping.',
    impact: true,
  },
  'Jump Squats': {
    how: 'Do a squat, then jump up lightly and land softly back into the next squat.',
    easier: 'Do a normal squat and rise onto your toes instead of jumping.',
    impact: true,
  },
  'Seal Jacks': {
    how: 'Jump your feet out while opening your arms wide to the sides, then jump back in while bringing your hands together in front of you.',
    easier: 'Step out instead of jumping.',
    impact: true,
  },
  'Tuck Jumps': {
    how: 'Jump straight up and bring your knees toward your chest, then land softly with bent knees.',
    easier: 'Do jump squats or normal squats instead.',
    impact: true,
  },
  'Push-Up Jacks': {
    how: 'At the top of a push-up, jump your feet out wide and back in, then do one push-up.',
    easier: 'Step your feet out one at a time and skip the push-up.',
    impact: true,
  },
  'Plank Jacks': {
    how: 'At the top of a push-up, jump your feet out wide and back together, keeping your hips level.',
    easier: 'Step one foot out at a time.',
    impact: true,
  },
  'Split Jumps': {
    how: 'Start in a lunge, jump up and switch legs in the air, then land softly in a lunge on the other side.',
    easier: 'Do regular lunges, stepping instead of jumping.',
    impact: true,
  },

  // ---------- Yoga ----------
  'Cat-Cow': {
    how: 'On hands and knees, breathe in as you let your belly drop and look up. Breathe out as you round your back like a cat. Move slowly with your breath.',
    easier: 'Do it sitting in a chair, hands on your knees.',
  },
  'Downward Dog': {
    how: 'From hands and knees, tuck your toes and lift your hips up and back so your body makes an upside-down V. Let your head hang and breathe.',
    easier: 'Keep your knees bent, or put your hands on a chair seat.',
  },
  'Warrior I': {
    how: 'Step one foot back and turn it slightly out. Bend your front knee and reach both arms up. Switch sides halfway.',
    easier: 'Take a shorter step and keep your hands on your hips.',
  },
  'Warrior II': {
    how: 'Stand with feet wide, front foot pointing forward and back foot turned out. Bend your front knee and stretch your arms out to the sides, looking over your front hand.',
    easier: 'Bend your front knee only a little.',
  },
  'Tree Pose': {
    how: 'Stand on one leg and rest the other foot on your ankle or calf (not the knee). Bring your hands together at your chest. Switch legs halfway.',
    easier: 'Keep your toes on the floor and hold a wall.',
  },
  "Child's Pose": {
    how: 'Kneel, sit back toward your heels and fold forward, resting your forehead down and your arms out in front. Breathe slowly.',
    easier: 'Put a pillow under your chest or hips.',
  },
  'Cobra': {
    how: 'Lie on your stomach with hands under your shoulders. Gently press your chest up, keeping your hips on the floor and elbows bent.',
    easier: 'Stay on your forearms instead of your hands.',
  },
  'Triangle Pose': {
    how: 'Stand with feet wide and legs straight. Reach one hand down toward your shin and the other up to the ceiling. Switch sides halfway.',
    easier: 'Rest your lower hand on your thigh or a chair.',
  },
  'Pigeon Pose': {
    how: 'From hands and knees, bring one knee forward behind your wrist and stretch the other leg back. Sit your hips down gently and breathe. Switch sides halfway.',
    easier: 'Lie on your back and cross one ankle over the other knee instead.',
  },

  // ---------- Stretching ----------
  'Neck Rolls': {
    how: 'Sit or stand tall. Slowly drop one ear toward your shoulder, roll your chin down to your chest, then up to the other side. Never push.',
    easier: 'Just tilt side to side, without rolling.',
  },
  'Shoulder Stretch': {
    how: 'Bring one arm across your chest and gently hold it with the other arm. Switch arms halfway.',
    easier: 'Hold the arm lower, at your elbow.',
  },
  'Tricep Stretch': {
    how: 'Reach one arm up, bend the elbow so your hand drops behind your head, and gently hold the elbow with your other hand. Switch halfway.',
    easier: 'Put your hand on your shoulder instead of behind your head.',
  },
  'Quad Stretch': {
    how: 'Stand tall, holding a wall. Bend one knee and hold your foot behind you, bringing your heel toward your bottom. Switch legs halfway.',
    easier: 'Hold your sock or trouser leg instead of your foot.',
  },
  'Hamstring Stretch': {
    how: 'Sit with one leg straight and the other bent. Lean forward gently over the straight leg until you feel a stretch at the back of it. Switch halfway.',
    easier: 'Bend the straight leg a little.',
  },
  'Hip Flexor Stretch': {
    how: 'Kneel on one knee with the other foot in front. Gently shift your hips forward until you feel a stretch at the front of your back hip. Switch halfway.',
    easier: 'Put a cushion under your knee.',
  },
  'Calf Stretch': {
    how: 'Put your hands on a wall and step one foot back. Keep the back heel down and lean in until you feel a stretch in your calf. Switch halfway.',
    easier: 'Take a shorter step back.',
  },
  'Spinal Twist': {
    how: 'Lie on your back and let both bent knees fall gently to one side, looking the other way. Switch sides halfway.',
    easier: 'Sit in a chair and gently turn to look behind you.',
  },
  'Figure Four Stretch': {
    how: 'Lie on your back with knees bent. Cross one ankle over the other knee and gently pull the bottom leg toward you. Switch halfway.',
    easier: 'Keep your foot on the floor instead of pulling.',
  },

  // ---------- Pilates ----------
  'The Hundred': {
    how: 'Lie on your back with knees bent and lifted. Raise your head a little and pump your straight arms up and down by your sides while breathing steadily.',
    easier: 'Keep your head down and feet on the floor.',
  },
  'Roll Up': {
    how: 'Lie on your back with arms overhead. Slowly curl up to sitting one part of your back at a time, reach toward your toes, then roll back down slowly.',
    easier: 'Bend your knees and only curl up partway.',
  },
  'Single Leg Circles': {
    how: 'Lie on your back with one leg pointing up. Draw small circles with that leg while keeping your hips still. Switch legs halfway.',
    easier: 'Bend the lifted knee and make smaller circles.',
  },
  'Rolling Like a Ball': {
    how: 'Sit hugging your knees, feet just off the floor. Roll back gently onto your upper back and roll up again to balance.',
    easier: 'Just hold the balance without rolling.',
  },
  'Single Leg Stretch': {
    how: 'Lie on your back with head lifted. Pull one knee in while stretching the other leg out, then switch.',
    easier: 'Keep your head down and stretch the leg higher.',
  },
  'Double Leg Stretch': {
    how: 'Lie on your back hugging both knees. Stretch your arms and legs out at the same time, then hug your knees back in.',
    easier: 'Stretch your legs up toward the ceiling, not out low.',
  },
  'Scissors': {
    how: 'Lie on your back with both legs up. Lower one leg toward the floor while the other stays up, then switch, like scissors.',
    easier: 'Bend your knees a little and keep your head down.',
  },
  'Criss Cross': {
    how: 'Lie on your back with hands behind your head. Turn one elbow toward the opposite knee as you stretch the other leg out, then switch.',
    easier: 'Keep your feet on the floor and twist gently.',
  },
  'Teaser': {
    how: 'From lying down, lift your legs and upper body at the same time to balance on your bottom in a V shape, then lower slowly.',
    easier: 'Keep your feet on the floor and just lift your upper body.',
  },

  // ---------- Mobility ----------
  'Arm Circles': {
    how: 'Hold your arms out to the sides and draw small circles, slowly making them bigger. Switch direction halfway.',
    easier: 'Keep the circles small.',
  },
  'Hip Circles': {
    how: 'Stand with hands on your hips and slowly circle your hips, like using a hula hoop. Switch direction halfway.',
    easier: 'Make smaller circles.',
  },
  'Leg Swings': {
    how: 'Hold a wall and gently swing one leg forward and back. Switch legs halfway.',
    easier: 'Make the swings smaller.',
  },
  'Ankle Rotations': {
    how: 'Lift one foot slightly and slowly circle your ankle. Switch direction, then switch feet.',
    easier: 'Do it sitting down.',
  },
  'Thread the Needle': {
    how: 'On hands and knees, slide one arm under your body along the floor, resting your shoulder down. Return and switch sides.',
    easier: 'Make the twist smaller.',
  },
  "World's Greatest Stretch": {
    how: 'Step into a lunge with hands on the floor. Lift the arm closest to your front leg up to the ceiling, then bring it back down. Switch sides.',
    easier: 'Put your back knee down on the floor.',
  },
  '90/90 Stretch': {
    how: 'Sit with both knees bent at right angles, one leg in front and one to the side. Sit tall, then gently switch the knees to the other side.',
    easier: 'Lean back on your hands for support.',
  },
  'Thoracic Rotations': {
    how: 'On hands and knees, put one hand behind your head and turn that elbow up toward the ceiling, then down. Switch sides halfway.',
    easier: 'Do it sitting in a chair, turning gently.',
  },

  // ---------- Warm-up / cool-down ----------
  'Warm Up': {
    how: 'March in place, roll your shoulders and swing your arms gently. You should feel warm, not tired.',
    easier: 'March slowly, or do it sitting down.',
  },
  'Cool Down': {
    how: 'Walk slowly on the spot, then reach your arms up and take a few slow, deep breaths.',
    easier: 'Sit down and breathe slowly.',
  },
};

// Look up a move by name (round suffix ignored). Returns {} when unknown.
export const getMoveGuide = (name = '') => MOVE_GUIDE[name.replace(/ \(round \d+\)$/, '')] || {};

export const isImpactMove = (name) => !!getMoveGuide(name).impact;

// Short plain-English labels for workout categories (used next to HIIT, Pilates, etc.)
export const PLAIN_CATEGORY = {
  strength: 'Get stronger',
  cardio: 'Get your heart going',
  hiit: 'Short bursts with rests',
  yoga: 'Gentle poses and breathing',
  stretching: 'Loosen up',
  pilates: 'Slow, controlled core work',
  mobility: 'Help your joints move easier',
  circuit: 'A mix of moves in a loop',
};
