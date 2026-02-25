// Gym Body Part Workouts Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutService } from '../../services/WorkoutService';
import LoadingView from '../../components/LoadingView';

// Sample gym workouts by body part
const GYM_WORKOUTS = {
  legs: [
    { id: 'gym-legs-1', name: 'Back Squat', duration: 'medium', difficulty: 'intermediate', target: 'Quads/Glutes', description: 'The "King of Exercises" for total leg development.' },
    { id: 'gym-legs-2', name: 'Romanian Deadlift', duration: 'medium', difficulty: 'intermediate', target: 'Hamstrings/Glutes', description: 'Focuses on the "hinge" and stretching the hamstrings.' },
    { id: 'gym-legs-3', name: 'Leg Press', duration: 'medium', difficulty: 'beginner', target: 'Quads', description: 'Allows for heavy volume without taxing the lower back.' },
    { id: 'gym-legs-4', name: 'Bulgarian Split Squat', duration: 'short', difficulty: 'advanced', target: 'Quads/Glutes', description: 'A brutal unilateral move that fixes muscle imbalances.' },
    { id: 'gym-legs-5', name: 'Leg Extensions', duration: 'short', difficulty: 'beginner', target: 'Quads Isolation', description: 'Specifically targets the "teardrop" muscle above the knee.' },
    { id: 'gym-legs-6', name: 'Lying Leg Curls', duration: 'short', difficulty: 'beginner', target: 'Hamstrings', description: 'Isolates the hamstrings through knee flexion.' },
    { id: 'gym-legs-7', name: 'Walking Lunges', duration: 'medium', difficulty: 'intermediate', target: 'Glutes/Quads', description: 'Great for functional strength and glute activation.' },
    { id: 'gym-legs-8', name: 'Standing Calf Raises', duration: 'short', difficulty: 'beginner', target: 'Gastrocnemius', description: 'Focuses on the large, visible diamond of the calf.' },
    { id: 'gym-legs-9', name: 'Seated Calf Raises', duration: 'short', difficulty: 'beginner', target: 'Soleus', description: 'Targets the deeper muscle underneath the main calf.' },
    { id: 'gym-legs-10', name: 'Goblet Squats', duration: 'short', difficulty: 'beginner', target: 'Quads/Core', description: 'A front-loaded squat that encourages upright posture.' },
  ],
  arms: [
    { id: 'gym-arms-1', name: 'EZ-Bar Bicep Curl', duration: 'short', difficulty: 'beginner', target: 'Bicep Short Head', description: 'Comfortable grip for heavy loading and bicep thickness.' },
    { id: 'gym-arms-2', name: 'Incline Dumbbell Curl', duration: 'short', difficulty: 'intermediate', target: 'Bicep Long Head', description: 'Places the bicep in a deep stretch for better "peak" height.' },
    { id: 'gym-arms-3', name: 'Hammer Curls', duration: 'short', difficulty: 'beginner', target: 'Brachialis/Forearm', description: 'Targets the side of the arm to make it look wider from the front.' },
    { id: 'gym-arms-4', name: 'Preacher Curls', duration: 'short', difficulty: 'intermediate', target: 'Lower Bicep', description: 'Eliminates momentum to isolate the bottom of the bicep.' },
    { id: 'gym-arms-5', name: 'Concentration Curls', duration: 'short', difficulty: 'beginner', target: 'Bicep Peak', description: 'A classic "finisher" for mind-muscle connection.' },
    { id: 'gym-arms-6', name: 'Skull Crushers', duration: 'short', difficulty: 'intermediate', target: 'Tricep Long Head', description: 'The king of tricep mass, focusing on the back of the arm.' },
    { id: 'gym-arms-7', name: 'Tricep Cable Pushdown', duration: 'short', difficulty: 'beginner', target: 'Tricep Lateral Head', description: 'Shapes the "horseshoe" look on the side of the arm.' },
    { id: 'gym-arms-8', name: 'Overhead Extension', duration: 'short', difficulty: 'intermediate', target: 'Tricep Long Head', description: 'Stretches the tricep under load for maximum growth.' },
    { id: 'gym-arms-9', name: 'Close-Grip Bench Press', duration: 'medium', difficulty: 'intermediate', target: 'Overall Tricep', description: 'A heavy compound movement for tricep power.' },
    { id: 'gym-arms-10', name: 'Dips (Bench or Bar)', duration: 'short', difficulty: 'intermediate', target: 'Lower Tricep', description: 'A versatile movement focusing on the elbow lockout.' },
  ],
  back: [
    { id: 'gym-back-1', name: 'Wide Grip Lat Pulldown', duration: 'medium', difficulty: 'beginner', target: 'Outer Lats', description: 'The primary move for building V-taper width.' },
    { id: 'gym-back-2', name: 'Bent Over Barbell Row', duration: 'medium', difficulty: 'intermediate', target: 'Mid-Back Thickness', description: 'A heavy hitter for the rhomboids and traps.' },
    { id: 'gym-back-3', name: 'Single Arm DB Row', duration: 'short', difficulty: 'intermediate', target: 'Lower Lats', description: 'Allows for a deeper stretch and more focused contraction.' },
    { id: 'gym-back-4', name: 'Pull-Ups (Overhand)', duration: 'short', difficulty: 'advanced', target: 'Lat Width', description: 'The ultimate bodyweight test for a wide back.' },
    { id: 'gym-back-5', name: 'Seated Cable Row', duration: 'medium', difficulty: 'beginner', target: 'Mid-Back/Rhomboids', description: 'Uses a neutral grip to pull the shoulder blades together.' },
    { id: 'gym-back-6', name: 'Straight Arm Pulldown', duration: 'short', difficulty: 'intermediate', target: 'Lat Isolation', description: 'Isolates the lats without involving the biceps.' },
    { id: 'gym-back-7', name: 'Meadows Row', duration: 'short', difficulty: 'advanced', target: 'Lower/Outer Lats', description: 'A staggered-stance landmine row for unique rowing angles.' },
    { id: 'gym-back-8', name: 'Reverse Fly (Dumbbell)', duration: 'short', difficulty: 'beginner', target: 'Rear Delts/Mid-Back', description: 'Targets the small muscles between the shoulder blades.' },
    { id: 'gym-back-9', name: 'Rack Pulls', duration: 'medium', difficulty: 'advanced', target: 'Lower Back/Traps', description: 'A partial deadlift that builds massive posterior chain density.' },
    { id: 'gym-back-10', name: 'Close Grip Pulldown', duration: 'short', difficulty: 'intermediate', target: 'Inner Lats', description: 'Emphasizes the vertical pull with a focus on the lower lat insertion.' },
  ],
  chest: [
    { id: 'gym-chest-1', name: 'Flat Barbell Bench Press', duration: 'medium', difficulty: 'intermediate', target: 'Mid-Pectorals', description: 'The gold standard for overall chest mass and power.' },
    { id: 'gym-chest-2', name: 'Incline Dumbbell Press', duration: 'medium', difficulty: 'intermediate', target: 'Upper Chest', description: 'Focuses on the clavicular head to build that "shelf" look.' },
    { id: 'gym-chest-3', name: 'Decline Hammer Strength', duration: 'medium', difficulty: 'intermediate', target: 'Lower Chest', description: 'Targets the bottom sweep of the pecs with a stable, guided path.' },
    { id: 'gym-chest-4', name: 'Low-to-High Cable Fly', duration: 'short', difficulty: 'intermediate', target: 'Upper/Inner Chest', description: 'Uses a scooping motion to define the upper-inner cleavage.' },
    { id: 'gym-chest-5', name: 'High-to-Low Cable Fly', duration: 'short', difficulty: 'intermediate', target: 'Lower/Outer Chest', description: 'Excellent for stretching the fibers and hitting the lower serratus.' },
    { id: 'gym-chest-6', name: 'Weighted Dips', duration: 'short', difficulty: 'advanced', target: 'Lower Chest', description: 'A powerful bodyweight-plus movement for chest depth.' },
    { id: 'gym-chest-7', name: 'Dumbbell Pullover', duration: 'short', difficulty: 'intermediate', target: 'Chest/Serratus', description: 'Expands the ribcage and hits the "tie-in" between chest and lats.' },
    { id: 'gym-chest-8', name: 'Push-Ups (Diamond)', duration: 'short', difficulty: 'beginner', target: 'Inner Chest/Triceps', description: 'A close-grip variation to emphasize the inner chest line.' },
    { id: 'gym-chest-9', name: 'Machine Chest Press', duration: 'medium', difficulty: 'beginner', target: 'Overall Mass', description: 'Allows for maximum mechanical tension without needing a spotter.' },
    { id: 'gym-chest-10', name: 'Plate Press (Svend Press)', duration: 'quick', difficulty: 'beginner', target: 'Inner Chest', description: 'A constant-tension isometric squeeze using a weight plate.' },
  ],
  shoulders: [
    { id: 'gym-shoulders-1', name: 'Overhead Barbell Press', duration: 'medium', difficulty: 'intermediate', target: 'Front/Side Delts', description: 'A foundational strength move for the entire shoulder girdle.' },
    { id: 'gym-shoulders-2', name: 'Dumbbell Lateral Raise', duration: 'short', difficulty: 'beginner', target: 'Side Delts', description: 'Critical for building shoulder width and the "capped" look.' },
    { id: 'gym-shoulders-3', name: 'Face Pulls', duration: 'short', difficulty: 'beginner', target: 'Rear Delts/Traps', description: 'Essential for shoulder health and rear-end thickness.' },
    { id: 'gym-shoulders-4', name: 'Arnold Press', duration: 'medium', difficulty: 'intermediate', target: 'Front/Side Delts', description: 'A rotating press that increases the range of motion.' },
    { id: 'gym-shoulders-5', name: 'Front Plate Raise', duration: 'short', difficulty: 'beginner', target: 'Front Delts', description: 'Isolates the anterior head often used in pressing movements.' },
    { id: 'gym-shoulders-6', name: 'Upright Rows', duration: 'short', difficulty: 'intermediate', target: 'Side Delts/Traps', description: 'A vertical pull focusing on the traps and lateral deltoids.' },
    { id: 'gym-shoulders-7', name: 'Rear Delt Pec Deck', duration: 'short', difficulty: 'beginner', target: 'Rear Delts', description: 'Machine-based isolation to prevent swinging.' },
    { id: 'gym-shoulders-8', name: 'Single Arm Cable Lateral', duration: 'short', difficulty: 'intermediate', target: 'Side Delts', description: 'Provides constant tension throughout the entire lift.' },
    { id: 'gym-shoulders-9', name: 'Push Press', duration: 'medium', difficulty: 'advanced', target: 'Power/Shoulders', description: 'Uses leg drive to move heavy weight overhead explosively.' },
    { id: 'gym-shoulders-10', name: 'Dumbbell Shrugs', duration: 'short', difficulty: 'beginner', target: 'Upper Traps', description: 'Builds the "yoke" connecting the neck and shoulders.' },
  ],
  core: [
    { id: 'gym-core-1', name: 'Hanging Leg Raises', duration: 'short', difficulty: 'intermediate', target: 'Lower Abs', description: 'Hanging from a pull-up bar, lift your legs to 90 degrees; the ultimate lower-ab builder.' },
    { id: 'gym-core-2', name: 'Cable Crunches', duration: 'short', difficulty: 'intermediate', target: 'Upper/Mid Abs', description: 'Kneeling at a cable station, use a rope attachment to crunch downward under heavy tension.' },
    { id: 'gym-core-3', name: "Captain's Chair Knee Raises", duration: 'short', difficulty: 'beginner', target: 'Lower Abs/Hip Flexors', description: 'A more stable version of the hanging raise using elbow pads for support.' },
    { id: 'gym-core-4', name: 'Ab Wheel Rollouts', duration: 'short', difficulty: 'advanced', target: 'Deep Core/Stability', description: 'A high-intensity move that trains the core to resist extension.' },
    { id: 'gym-core-5', name: 'Pallof Press', duration: 'short', difficulty: 'intermediate', target: 'Obliques/Anti-Rotation', description: 'Holding a cable at chest height, push it out and resist the weight pulling you sideways.' },
    { id: 'gym-core-6', name: 'Russian Twists (Weighted)', duration: 'short', difficulty: 'intermediate', target: 'Obliques', description: 'Seated with feet elevated, rotate a medicine ball or plate from side to side.' },
    { id: 'gym-core-7', name: 'Plank with Weight Plate', duration: 'short', difficulty: 'intermediate', target: 'Total Core', description: 'Increase the difficulty of a standard plank by having a partner place a plate on your back.' },
    { id: 'gym-core-8', name: 'Woodchoppers (Cable)', duration: 'short', difficulty: 'intermediate', target: 'Obliques/Explosiveness', description: 'A diagonal pulling motion that mimics a swinging axe, great for functional power.' },
    { id: 'gym-core-9', name: 'Decline Sit-Ups', duration: 'short', difficulty: 'beginner', target: 'Upper Abs', description: 'Performed on a decline bench to increase the range of motion and resistance.' },
    { id: 'gym-core-10', name: 'Dragon Flags', duration: 'short', difficulty: 'advanced', target: 'Total Core', description: 'Lying on a bench and gripping the top, lift your entire body up in a straight line (advanced).' },
  ],
};


export default function GymBodyPartScreen({ route, navigation }) {
  const { bodyPart } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setWorkouts(GYM_WORKOUTS[bodyPart.id] || []);
      setIsLoading(false);
    }, 300);
  }, [bodyPart]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return '#34C759';
      case 'intermediate':
        return '#FF9500';
      case 'advanced':
        return '#FF3B30';
      default:
        return '#8E8E93';
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
          <View style={[styles.headerIcon, { backgroundColor: bodyPart.color + '20' }]}>
            <Ionicons name={bodyPart.icon} size={28} color={bodyPart.color} />
          </View>
          <Text style={styles.headerTitle}>{bodyPart.name} Workouts</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {workouts.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutCard}
                onPress={() => handleWorkoutPress(workout)}
              >
                <View style={[styles.workoutIcon, { backgroundColor: bodyPart.color + '15' }]}>
                  <Ionicons name="barbell" size={24} color={bodyPart.color} />
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
                <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6DC',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3728',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
