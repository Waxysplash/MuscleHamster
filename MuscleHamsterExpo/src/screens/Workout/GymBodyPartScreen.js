// Gym Body Part Workouts Screen
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutService } from '../../services/WorkoutService';
import LoadingView from '../../components/LoadingView';
import FavoriteButton from '../../components/FavoriteButton';
import { useCustomWorkouts } from '../../context/CustomWorkoutContext';

// Gym body part images
const GymBodyPartImages = {
  legs: require('../../../assets/images/gym_legs.png'),
  arms: require('../../../assets/images/gym_arms.png'),
  back: require('../../../assets/images/gym_back.png'),
  chest: require('../../../assets/images/gym_chest.png'),
  shoulders: require('../../../assets/images/gym_shoulders.png'),
  core: require('../../../assets/images/gym_core.png'),
};

// Exercise icon
const ExerciseIcon = require('../../../assets/images/exercise_icon.png');

// Sample gym workouts by body part
const GYM_WORKOUTS = {
  legs: [
    { id: 'gym-legs-1', name: 'Barbell Back Squat', duration: 'medium', difficulty: 'intermediate', target: 'Quads/Glutes', description: '1. Bar on upper traps; feet shoulder-width. 2. Sit back and down until thighs are parallel to floor. 3. Keep chest up. 4. Drive through heels to stand.' },
    { id: 'gym-legs-2', name: 'Leg Press', duration: 'medium', difficulty: 'beginner', target: 'Quads', description: '1. Sit with feet hip-width on platform. 2. Lower platform until knees are at 90°. 3. Press up without locking your knees. 4. Keep your back flat against the seat.' },
    { id: 'gym-legs-3', name: 'Romanian Deadlift', duration: 'medium', difficulty: 'intermediate', target: 'Hamstrings/Glutes', description: '1. Hold weight at thighs. 2. Hinge at hips, pushing them back with a slight knee bend. 3. Lower weight until you feel a hamstring stretch. 4. Squeeze glutes to stand.' },
    { id: 'gym-legs-4', name: 'Walking Lunges', duration: 'medium', difficulty: 'intermediate', target: 'Glutes/Quads', description: '1. Step forward and lower back knee toward the floor. 2. Both knees should form 90° angles. 3. Push off the front foot to step into the next rep. 4. Keep torso upright.' },
    { id: 'gym-legs-5', name: 'Leg Extensions', duration: 'short', difficulty: 'beginner', target: 'Quads Isolation', description: '1. Sit with shins behind the pad. 2. Straighten legs fully to squeeze the quadriceps. 3. Pause at the top. 4. Lower slowly.' },
    { id: 'gym-legs-6', name: 'Lying Leg Curl', duration: 'short', difficulty: 'beginner', target: 'Hamstrings', description: '1. Lie face down; pads against back of ankles. 2. Curl legs up toward your glutes. 3. Squeeze hamstrings at the top. 4. Lower with control.' },
    { id: 'gym-legs-7', name: 'Goblet Squat', duration: 'short', difficulty: 'beginner', target: 'Quads/Core', description: '1. Hold a weight against your chest. 2. Squat down, elbows passing inside your knees. 3. Keep weight close to body. 4. Drive back up to start.' },
    { id: 'gym-legs-8', name: 'Bulgarian Split Squat', duration: 'short', difficulty: 'advanced', target: 'Quads/Glutes', description: '1. One foot on a bench behind you. 2. Hop front foot out; lower hips until back knee nearly touches floor. 3. Focus on the front leg. 4. Stand back up.' },
    { id: 'gym-legs-9', name: 'Seated Calf Raise', duration: 'short', difficulty: 'beginner', target: 'Soleus', description: '1. Sit with knees under pads; balls of feet on platform. 2. Drop heels for a stretch. 3. Press up onto your toes. 4. Squeeze calves at the top.' },
    { id: 'gym-legs-10', name: 'Hack Squat', duration: 'medium', difficulty: 'intermediate', target: 'Quads', description: '1. Lean back against the machine pads. 2. Lower down into a squat position. 3. The fixed angle allows you to focus purely on the quads. 4. Press back up.' },
    { id: 'gym-legs-11', name: 'Glute Bridge', duration: 'short', difficulty: 'beginner', target: 'Glutes', description: '1. Lie on back; knees bent. 2. Drive hips toward the ceiling. 3. Squeeze glutes hard at the top. 4. Lower slowly.' },
    { id: 'gym-legs-12', name: 'Step-Ups', duration: 'short', difficulty: 'beginner', target: 'Quads/Glutes', description: '1. Place one foot on a sturdy box. 2. Drive through that heel to stand up on the box. 3. Step down with the same leg. 4. Repeat or alternate.' },
    { id: 'gym-legs-13', name: 'Standing Calf Raise', duration: 'short', difficulty: 'beginner', target: 'Gastrocnemius', description: '1. Stand with balls of feet on a ledge. 2. Lower heels as far as possible. 3. Explode up onto your toes. 4. Keep knees "soft" (not locked).' },
    { id: 'gym-legs-14', name: 'Sumo Deadlift', duration: 'medium', difficulty: 'intermediate', target: 'Inner Thighs/Glutes', description: '1. Take a very wide stance; toes pointed out. 2. Hinge and grip the weight. 3. Drive through floor to stand. 4. Targets inner thighs and glutes more than standard deadlifts.' },
    { id: 'gym-legs-15', name: 'Adductor Machine', duration: 'short', difficulty: 'beginner', target: 'Inner Thigh', description: '1. Sit with legs spread against pads. 2. Squeeze legs together toward the center. 3. Control the weight on the way back out. 4. Targets the inner thigh.' },
  ],
  arms: [
    { id: 'gym-arms-1', name: 'Barbell Curls', duration: 'short', difficulty: 'beginner', target: 'Biceps', description: '1. Stand with bar at thighs, palms up. 2. Curl bar toward chest. 3. Keep elbows pinned to your sides. 4. Lower slowly.' },
    { id: 'gym-arms-2', name: 'Tricep Pushdowns', duration: 'short', difficulty: 'beginner', target: 'Triceps', description: '1. Use a cable machine with a bar/rope. 2. Push the weight down until arms are straight. 3. Squeeze triceps at the bottom. 4. Return to chest height.' },
    { id: 'gym-arms-3', name: 'Dumbbell Hammer Curls', duration: 'short', difficulty: 'beginner', target: 'Biceps/Forearms', description: '1. Hold dumbbells with palms facing your body. 2. Curl toward shoulders like a hammer. 3. Keep elbows still. 4. Lower with control.' },
    { id: 'gym-arms-4', name: 'Skull Crushers', duration: 'short', difficulty: 'intermediate', target: 'Triceps', description: '1. Lie flat; hold an EZ bar over your face. 2. Lower bar toward your forehead by bending only at elbows. 3. Press back up. 4. Keep elbows tucked.' },
    { id: 'gym-arms-5', name: 'Preacher Curls', duration: 'short', difficulty: 'intermediate', target: 'Biceps', description: '1. Sit at a preacher bench with arms flat on the pad. 2. Curl the bar toward your chin. 3. This prevents "cheating" with momentum. 4. Lower fully.' },
    { id: 'gym-arms-6', name: 'Overhead DB Extension', duration: 'short', difficulty: 'intermediate', target: 'Triceps', description: '1. Sit or stand; hold one dumbbell overhead with both hands. 2. Lower it behind your head. 3. Press back up toward the ceiling. 4. Keep upper arms vertical.' },
    { id: 'gym-arms-7', name: 'Concentration Curls', duration: 'short', difficulty: 'beginner', target: 'Bicep Peak', description: '1. Sit; lean forward with elbow braced against inner thigh. 2. Curl dumbbell toward your chest. 3. Squeeze at the top. 4. Lower slowly.' },
    { id: 'gym-arms-8', name: 'Dips (Bench or Bar)', duration: 'short', difficulty: 'intermediate', target: 'Triceps', description: '1. Support weight with hands behind you on a bench. 2. Lower hips toward floor by bending elbows. 3. Press back up. 4. Keep back close to the bench.' },
    { id: 'gym-arms-9', name: 'Incline Dumbbell Curl', duration: 'short', difficulty: 'intermediate', target: 'Biceps', description: '1. Lie back on a 45° incline bench. 2. Let arms hang straight down. 3. Curl weights up. 4. The incline provides a massive stretch at the bottom.' },
    { id: 'gym-arms-10', name: 'Cable Overhead Extension', duration: 'short', difficulty: 'intermediate', target: 'Triceps', description: '1. Use a rope attachment; face away from the cable. 2. Step forward; pull rope from behind head to straight in front. 3. Squeeze triceps. 4. Return slowly.' },
    { id: 'gym-arms-11', name: 'Reverse Curls', duration: 'short', difficulty: 'intermediate', target: 'Forearms/Biceps', description: '1. Hold bar with palms facing down (overhand). 2. Curl the bar up. 3. Targets the brachialis and the top of the forearm. 4. Lower with control.' },
    { id: 'gym-arms-12', name: 'Close-Grip Bench Press', duration: 'medium', difficulty: 'intermediate', target: 'Triceps', description: '1. Lie flat; grip bar at shoulder-width. 2. Lower to mid-chest. 3. Keep elbows tucked to sides. 4. Press up explosively.' },
    { id: 'gym-arms-13', name: 'Spider Curls', duration: 'short', difficulty: 'intermediate', target: 'Bicep Peak', description: '1. Lie face-down on an incline bench. 2. Let arms hang straight down. 3. Curl weights toward your forehead. 4. Focuses on the "peak" of the bicep.' },
    { id: 'gym-arms-14', name: 'Wrist Curls', duration: 'short', difficulty: 'beginner', target: 'Forearms', description: '1. Rest forearms on a bench, palms up. 2. Let weight roll to fingertips, then curl wrist upward. 3. Squeeze forearms. 4. Lower slowly.' },
    { id: 'gym-arms-15', name: 'Diamond Push-Ups', duration: 'short', difficulty: 'beginner', target: 'Triceps', description: '1. Get in push-up position with hands forming a "diamond" shape. 2. Lower chest to your hands. 3. Push back up. 4. Keep elbows close to your body.' },
  ],
  back: [
    { id: 'gym-back-1', name: 'Pull-Ups', duration: 'short', difficulty: 'advanced', target: 'Lat Width', description: '1. Grip bar overhand, wider than shoulders. 2. Pull chest toward bar by driving elbows down. 3. Squeeze shoulder blades at the top. 4. Lower with control.' },
    { id: 'gym-back-2', name: 'Lat Pulldown', duration: 'medium', difficulty: 'beginner', target: 'Outer Lats', description: '1. Sit and grip the wide bar overhand. 2. Pull bar to upper chest while leaning slightly back. 3. Focus on "tucking" elbows into back pockets. 4. Return slowly.' },
    { id: 'gym-back-3', name: 'Bent-Over Barbell Row', duration: 'medium', difficulty: 'intermediate', target: 'Mid-Back Thickness', description: '1. Hinge at hips with a flat back. 2. Grip bar overhand. 3. Pull bar to lower stomach, squeezing shoulder blades. 4. Lower until arms are fully extended.' },
    { id: 'gym-back-4', name: 'Seated Cable Row', duration: 'medium', difficulty: 'beginner', target: 'Mid-Back/Rhomboids', description: '1. Sit with feet braced and knees slightly bent. 2. Grip handle; pull toward abdomen. 3. Keep torso upright; don\'t lean back excessively. 4. Stretch forward on the return.' },
    { id: 'gym-back-5', name: 'One-Arm Dumbbell Row', duration: 'short', difficulty: 'intermediate', target: 'Lower Lats', description: '1. Place one knee and hand on a bench. 2. Pull dumbbell to hip with the other hand. 3. Keep elbow close to your side. 4. Lower until you feel a stretch in the lat.' },
    { id: 'gym-back-6', name: 'Deadlift', duration: 'medium', difficulty: 'advanced', target: 'Full Back/Posterior Chain', description: '1. Stand with mid-foot under bar. 2. Hinge to grip bar; keep back flat. 3. Drive through heels to stand up straight. 4. Lower bar by hinging back down.' },
    { id: 'gym-back-7', name: 'T-Bar Row', duration: 'medium', difficulty: 'intermediate', target: 'Mid-Back Thickness', description: '1. Straddle the bar; hinge at hips. 2. Grip handles; pull weight to chest. 3. Squeeze middle back at the top. 4. Control the weight back down.' },
    { id: 'gym-back-8', name: 'Face Pulls', duration: 'short', difficulty: 'beginner', target: 'Rear Delts/Upper Traps', description: '1. Set cable to forehead height. 2. Pull rope toward your ears, pulling ends apart. 3. Rotate knuckles back at the end. 4. Targets rear delts and upper traps.' },
    { id: 'gym-back-9', name: 'Chest-Supported Row', duration: 'short', difficulty: 'beginner', target: 'Upper Back', description: '1. Lie face-down on a 30° incline bench. 2. Row dumbbells up to your sides. 3. This removes lower back strain and isolates the upper back. 4. Lower slowly.' },
    { id: 'gym-back-10', name: 'Straight-Arm Pulldown', duration: 'short', difficulty: 'intermediate', target: 'Lat Isolation', description: '1. Stand facing cable; grip bar with straight arms. 2. Pull bar down to your thighs using only your lats. 3. Keep elbows locked/stiff. 4. Return to eye level.' },
    { id: 'gym-back-11', name: 'Back Extensions', duration: 'short', difficulty: 'beginner', target: 'Lower Back/Glutes', description: '1. Secure feet; hinge forward at the waist. 2. Lift torso until your body is in a straight line. 3. Squeeze lower back and glutes. 4. Do not over-arch at the top.' },
    { id: 'gym-back-12', name: 'Chin-Ups', duration: 'short', difficulty: 'intermediate', target: 'Lats/Biceps', description: '1. Grip bar underhand (palms facing you). 2. Pull chin over the bar. 3. This emphasizes the biceps more than a traditional pull-up. 4. Lower slowly.' },
    { id: 'gym-back-13', name: 'Inverted Row', duration: 'short', difficulty: 'beginner', target: 'Mid-Back', description: '1. Lie under a bar set at waist height. 2. Pull chest to the bar while keeping body in a straight plank. 3. Squeeze shoulder blades. 4. Lower back to start.' },
    { id: 'gym-back-14', name: 'Dumbbell Shrugs', duration: 'short', difficulty: 'beginner', target: 'Upper Traps', description: '1. Stand holding weights at your sides. 2. Lift shoulders straight up toward your ears. 3. Hold for a second; do not roll the shoulders. 4. Lower slowly.' },
    { id: 'gym-back-15', name: 'Superman', duration: 'short', difficulty: 'beginner', target: 'Lower Back/Spinal Erectors', description: '1. Lie face-down with arms and legs extended. 2. Lift chest and thighs off the floor simultaneously. 3. Hold for 2 seconds, engaging the entire spine. 4. Relax back down.' },
  ],
  chest: [
    { id: 'gym-chest-1', name: 'Barbell Bench Press', duration: 'medium', difficulty: 'intermediate', target: 'Mid-Pectorals', description: '1. Lie flat; eyes under the bar. 2. Grip bar slightly wider than shoulders. 3. Lower bar to mid-chest. 4. Press bar up until arms are locked.' },
    { id: 'gym-chest-2', name: 'Dumbbell Bench Press', duration: 'medium', difficulty: 'intermediate', target: 'Mid-Pectorals', description: '1. Sit on bench; kick weights up to chest. 2. Lie back; press weights up. 3. Lower weights until elbows are slightly below the bench. 4. Press back to center.' },
    { id: 'gym-chest-3', name: 'Incline Dumbbell Press', duration: 'medium', difficulty: 'intermediate', target: 'Upper Chest', description: '1. Set bench to 30-45°. 2. Press weights up from shoulders. 3. Lower slowly to upper chest level. 4. Drive weights up and slightly inward.' },
    { id: 'gym-chest-4', name: 'Chest Dip', duration: 'short', difficulty: 'intermediate', target: 'Lower Chest', description: '1. Grip bars; suspend body with locked arms. 2. Lean torso forward. 3. Lower body until elbows are at 90°. 4. Press back up, focusing on the chest squeeze.' },
    { id: 'gym-chest-5', name: 'Cable Fly', duration: 'short', difficulty: 'beginner', target: 'Inner Chest', description: '1. Set pulleys to chest height. 2. Step forward; arms slightly bent. 3. Pull handles together in a wide arc (like a hug). 4. Squeeze at center; return slowly.' },
    { id: 'gym-chest-6', name: 'Push-Ups', duration: 'short', difficulty: 'beginner', target: 'Overall Chest', description: '1. High plank position; hands wider than shoulders. 2. Lower chest until nearly touching the floor. 3. Keep elbows at 45° to body. 4. Push back to start.' },
    { id: 'gym-chest-7', name: 'Pec Deck Machine', duration: 'short', difficulty: 'beginner', target: 'Inner Chest', description: '1. Sit back; grip handles at chest height. 2. Keep a slight bend in elbows. 3. Bring handles together until they touch. 4. Return to starting stretch slowly.' },
    { id: 'gym-chest-8', name: 'Decline Bench Press', duration: 'medium', difficulty: 'intermediate', target: 'Lower Chest', description: '1. Secure feet in pads; lie on decline. 2. Lower bar to the lower part of your chest. 3. Press bar straight up. 4. Maintain a tight arch in the upper back.' },
    { id: 'gym-chest-9', name: 'Dumbbell Pullover', duration: 'short', difficulty: 'intermediate', target: 'Chest/Serratus', description: '1. Lie across bench; hold one dumbbell over chest. 2. Lower weight behind head with slightly bent arms. 3. Feel the stretch in the ribs. 4. Pull weight back over chest.' },
    { id: 'gym-chest-10', name: 'Machine Chest Press', duration: 'medium', difficulty: 'beginner', target: 'Overall Chest', description: '1. Adjust seat so handles are at mid-chest. 2. Sit back; push handles forward until arms lock. 3. Control the weight back to the starting position. 4. Repeat.' },
    { id: 'gym-chest-11', name: 'Incline Barbell Press', duration: 'medium', difficulty: 'intermediate', target: 'Upper Chest', description: '1. Lie on incline bench. 2. Grip bar; lower it to your upper chest/collarbone area. 3. Press bar vertically. 4. Keep shoulder blades pinned back.' },
    { id: 'gym-chest-12', name: 'Low-to-High Cable Fly', duration: 'short', difficulty: 'intermediate', target: 'Upper Chest', description: '1. Set pulleys at the bottom. 2. Palms up; pull handles up and together to eye level. 3. Squeeze upper chest. 4. Lower slowly to the sides.' },
    { id: 'gym-chest-13', name: 'Dumbbell Floor Press', duration: 'short', difficulty: 'intermediate', target: 'Mid Chest/Triceps', description: '1. Lie on floor; knees bent. 2. Press dumbbells up. 3. Lower until triceps touch the floor. 4. Pause for a split second; press back up explosively.' },
    { id: 'gym-chest-14', name: 'Close-Grip Bench Press', duration: 'medium', difficulty: 'intermediate', target: 'Inner Chest/Triceps', description: '1. Lie flat; grip bar at shoulder-width. 2. Lower bar to the bottom of the sternum. 3. Keep elbows tucked close to your ribs. 4. Press bar back up.' },
    { id: 'gym-chest-15', name: 'Landmine Press', duration: 'short', difficulty: 'intermediate', target: 'Upper Chest', description: '1. Stand; hold end of bar at shoulder. 2. Lean slightly into the bar. 3. Press the bar diagonally upward. 4. Squeeze the chest at the top; lower with control.' },
  ],
  shoulders: [
    { id: 'gym-shoulders-1', name: 'Overhead Barbell Press', duration: 'medium', difficulty: 'intermediate', target: 'Front/Side Delts', description: '1. Stand with bar at upper chest. 2. Press bar overhead until arms lock. 3. Keep core tight to avoid arching back. 4. Lower to chin level.' },
    { id: 'gym-shoulders-2', name: 'Dumbbell Lateral Raise', duration: 'short', difficulty: 'beginner', target: 'Side Delts', description: '1. Stand with weights at sides. 2. Raise arms out to the side to shoulder height. 3. Lead with elbows; slight bend. 4. Lower slowly to sides.' },
    { id: 'gym-shoulders-3', name: 'Seated Dumbbell Press', duration: 'medium', difficulty: 'intermediate', target: 'Front/Side Delts', description: '1. Sit on a bench with back support. 2. Press dumbbells from shoulder height to overhead. 3. Touch weights at the top. 4. Lower to ear level.' },
    { id: 'gym-shoulders-4', name: 'Arnold Press', duration: 'medium', difficulty: 'intermediate', target: 'All Three Heads', description: '1. Sit; hold weights with palms facing you. 2. Rotate palms out as you press up. 3. Reverse rotation on the way down. 4. Great for hitting all three heads.' },
    { id: 'gym-shoulders-5', name: 'Front Dumbbell Raise', duration: 'short', difficulty: 'beginner', target: 'Front Delts', description: '1. Stand with weights on thighs. 2. Lift one arm straight in front to eye level. 3. Keep a slight bend in the elbow. 4. Alternate arms or lift both.' },
    { id: 'gym-shoulders-6', name: 'Reverse Cable Fly', duration: 'short', difficulty: 'intermediate', target: 'Rear Delts', description: '1. Set pulleys to chest height. 2. Cross arms and grab opposite handles. 3. Pull arms out and back (wide arc). 4. Squeeze rear delts; return slowly.' },
    { id: 'gym-shoulders-7', name: 'Upright Row', duration: 'short', difficulty: 'intermediate', target: 'Side Delts/Traps', description: '1. Hold bar at thighs, narrow grip. 2. Pull bar up toward chin, leading with elbows. 3. Keep bar close to the body. 4. Lower with control.' },
    { id: 'gym-shoulders-8', name: 'Face Pulls', duration: 'short', difficulty: 'beginner', target: 'Rear Delts/Traps', description: '1. Set cable to forehead height. 2. Pull rope toward forehead, pulling ends apart. 3. Rotate knuckles back at the end. 4. Targets rear delts and traps.' },
    { id: 'gym-shoulders-9', name: 'Bent-Over Rear Delt Fly', duration: 'short', difficulty: 'beginner', target: 'Rear Delts', description: '1. Hinge at hips with flat back. 2. Raise dumbbells out to the sides. 3. Focus on squeezing shoulder blades. 4. Lower weights slowly.' },
    { id: 'gym-shoulders-10', name: 'Smith Machine Press', duration: 'medium', difficulty: 'beginner', target: 'Front/Side Delts', description: '1. Sit under the bar. 2. Press bar overhead. 3. The fixed path allows for safer, heavier lifting. 4. Lower to just below the chin.' },
    { id: 'gym-shoulders-11', name: 'Single-Arm Cable Lateral', duration: 'short', difficulty: 'intermediate', target: 'Side Delts', description: '1. Set pulley to bottom. 2. Reach across body to grab handle. 3. Pull handle out to the side to shoulder height. 4. Focus on constant tension.' },
    { id: 'gym-shoulders-12', name: 'Push Press', duration: 'medium', difficulty: 'advanced', target: 'Power/Shoulders', description: '1. Similar to overhead press. 2. Use a "dip" in the knees to drive the bar up. 3. Use legs to help move heavier weight. 4. Stabilize at the top.' },
    { id: 'gym-shoulders-13', name: 'Barbell Front Raise', duration: 'short', difficulty: 'intermediate', target: 'Front Delts', description: '1. Hold bar at thighs. 2. Lift bar with straight arms to eye level. 3. Do not swing your hips for momentum. 4. Lower slowly.' },
    { id: 'gym-shoulders-14', name: 'Dumbbell Scaption', duration: 'short', difficulty: 'beginner', target: 'Rotator Cuff/Delts', description: '1. Hold weights at sides. 2. Raise arms at a 30° angle forward (the "scapular plane"). 3. Lift to shoulder height. 4. Great for rotator cuff health.' },
    { id: 'gym-shoulders-15', name: 'Bus Driver', duration: 'short', difficulty: 'beginner', target: 'Shoulder Endurance', description: '1. Hold a plate in front of you at chest height. 2. Rotate the plate left and right like a steering wheel. 3. Keep arms locked straight. 4. Excellent for shoulder endurance.' },
  ],
  core: [
    { id: 'gym-core-1', name: 'Plank', duration: 'short', difficulty: 'beginner', target: 'Entire Core', description: '1. Hold a push-up position on elbows. 2. Keep body in a straight line from head to heels. 3. Squeeze glutes and abs tight. 4. Hold for time.' },
    { id: 'gym-core-2', name: 'Hanging Leg Raise', duration: 'short', difficulty: 'intermediate', target: 'Lower Abs', description: '1. Hang from a pull-up bar. 2. Keep legs straight; lift them until parallel to the floor. 3. Lower slowly without swinging. 4. Exhale as you lift.' },
    { id: 'gym-core-3', name: 'Bicycle Crunch', duration: 'short', difficulty: 'beginner', target: 'Obliques/Abs', description: '1. Lie on back; hands behind head. 2. Bring right elbow to left knee while extending right leg. 3. Switch sides in a fluid "pedaling" motion. 4. Keep lower back flat.' },
    { id: 'gym-core-4', name: 'Cable Woodchopper', duration: 'short', difficulty: 'intermediate', target: 'Obliques', description: '1. Stand sideways to a cable machine. 2. Pull the handle diagonally across your body from high to low. 3. Pivot your back foot and rotate your core. 4. Return slowly.' },
    { id: 'gym-core-5', name: 'Ab Wheel Rollout', duration: 'short', difficulty: 'advanced', target: 'Deep Core', description: '1. Kneel on a mat with the wheel in front. 2. Roll forward as far as possible without arching your back. 3. Use your abs to pull yourself back to the start. 4. Keep arms straight.' },
    { id: 'gym-core-6', name: 'Russian Twist', duration: 'short', difficulty: 'intermediate', target: 'Obliques', description: '1. Sit with knees bent, feet slightly off the ground. 2. Lean back at a 45° angle. 3. Rotate your torso to touch a weight to the floor on each side. 4. Keep chest up.' },
    { id: 'gym-core-7', name: 'Dead Bug', duration: 'short', difficulty: 'beginner', target: 'Core Stability', description: '1. Lie on back; arms up and knees at 90°. 2. Lower opposite arm and leg toward the floor simultaneously. 3. Keep lower back pressed into the floor. 4. Return and switch sides.' },
    { id: 'gym-core-8', name: 'Hollow Body Hold', duration: 'short', difficulty: 'intermediate', target: 'Deep Core', description: '1. Lie on back; arms overhead. 2. Lift legs, head, and shoulders slightly off the floor. 3. Only your lower back should touch the ground. 4. Hold the "banana" shape.' },
    { id: 'gym-core-9', name: "Captain's Chair Raise", duration: 'short', difficulty: 'beginner', target: 'Lower Abs', description: '1. Support weight on forearms in the chair. 2. Lift knees toward your chest. 3. Squeeze at the top. 4. Lower slowly to avoid using momentum.' },
    { id: 'gym-core-10', name: 'Side Plank', duration: 'short', difficulty: 'beginner', target: 'Obliques', description: '1. Lie on your side, propped on one elbow. 2. Lift hips until body is in a straight line. 3. Keep hips stacked and don\'t let them sag. 4. Hold for time and switch.' },
    { id: 'gym-core-11', name: 'Bird-Dog', duration: 'short', difficulty: 'beginner', target: 'Lower Back/Core', description: '1. Start on hands and knees. 2. Extend right arm forward and left leg backward. 3. Hold for 2 seconds while keeping hips level. 4. Switch sides.' },
    { id: 'gym-core-12', name: 'Heel Touches', duration: 'short', difficulty: 'beginner', target: 'Upper Abs', description: '1. Lie on back, knees bent, feet flat. 2. Lift shoulders slightly. 3. Reach right hand to touch right heel, then left to left. 4. Keep tension on the abs throughout.' },
    { id: 'gym-core-13', name: 'V-Ups', duration: 'short', difficulty: 'intermediate', target: 'Entire Abs', description: '1. Lie flat on your back. 2. Simultaneously lift torso and legs to touch your toes. 3. Your body should form a "V" shape. 4. Lower with control.' },
    { id: 'gym-core-14', name: 'Pallof Press', duration: 'short', difficulty: 'intermediate', target: 'Anti-Rotation', description: '1. Stand sideways to a cable; hold handle at chest. 2. Press handle straight out in front of you. 3. Resist the cable trying to pull you sideways. 4. Hold for 2 seconds; return to chest.' },
    { id: 'gym-core-15', name: 'Mountain Climbers', duration: 'short', difficulty: 'beginner', target: 'Core/Cardio', description: '1. Start in a high plank. 2. Drive one knee toward your chest. 3. Quickly switch legs as if "running" against the floor. 4. Keep hips low.' },
  ],
};


export default function GymBodyPartScreen({ route, navigation }) {
  const { bodyPart } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);
  const { favorites, isFavorite } = useCustomWorkouts();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setWorkouts(GYM_WORKOUTS[bodyPart.id] || []);
      setIsLoading(false);
    }, 300);
  }, [bodyPart]);

  // Sort workouts with favorites at the top
  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => {
      const aFav = isFavorite(a.id);
      const bFav = isFavorite(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [workouts, favorites, isFavorite]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return '#34C759';
      case 'intermediate':
        return '#FF9500';
      case 'advanced':
        return '#FF3B30';
      default:
        return '#6B5D52';
    }
  };

  const handleWorkoutPress = (workout) => {
    navigation.navigate('GymExerciseDetail', {
      exercise: workout,
      bodyPart: bodyPart,
    });
  };

  if (isLoading) {
    return <LoadingView message="Loading workouts..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#4A3728" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{bodyPart.name}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Body Part Image Hero */}
          <View style={styles.heroSection}>
            <View style={[styles.imageContainer, { backgroundColor: bodyPart.color + '15' }]}>
              <Image
                source={GymBodyPartImages[bodyPart.id]}
                style={[
                  styles.bodyPartImage,
                  bodyPart.id === 'shoulders' && styles.bodyPartImageSmaller
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.exerciseCount}>{workouts.length} exercises</Text>
          </View>

          {/* Exercise List */}
          {sortedWorkouts.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutCard}
                onPress={() => handleWorkoutPress(workout)}
              >
                <View style={[styles.workoutIcon, { backgroundColor: bodyPart.color + '15' }]}>
                  <Image source={ExerciseIcon} style={styles.workoutIconImage} resizeMode="contain" />
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  {workout.target && (
                    <Text style={styles.workoutTarget}>{workout.target}</Text>
                  )}
                  <Text style={styles.workoutDescription}>{workout.description}</Text>
                  <View style={styles.workoutMeta}>
                    <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(workout.difficulty) }]} />
                    <Text style={styles.workoutDifficulty}>
                      {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
                    </Text>
                  </View>
                </View>
                <FavoriteButton workoutId={workout.id} size={22} />
                <Ionicons name="chevron-forward" size={20} color="#8B5A2B" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
          ))}

          {workouts.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={48} color="#C4B5A8" />
              <Text style={styles.emptyText}>No workouts available</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6DC',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3728',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bodyPartImage: {
    width: 100,
    height: 100,
  },
  bodyPartImageSmaller: {
    width: 80,
    height: 80,
  },
  exerciseCount: {
    fontSize: 15,
    color: '#6B5D52',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  workoutIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutIconImage: {
    width: 40,
    height: 40,
  },
  workoutInfo: {
    flex: 1,
    marginLeft: 14,
  },
  workoutName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 2,
  },
  workoutTarget: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FF9500',
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6B5D52',
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  workoutDifficulty: {
    fontSize: 13,
    color: '#6B5D52',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B5D52',
    marginTop: 12,
  },
});
