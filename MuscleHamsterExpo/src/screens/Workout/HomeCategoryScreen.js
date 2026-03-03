// Home Category Workouts Screen
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
import LoadingView from '../../components/LoadingView';
import FavoriteButton from '../../components/FavoriteButton';
import { useCustomWorkouts } from '../../context/CustomWorkoutContext';

// Home category images
const HomeCategoryImages = {
  quick_sweats: require('../../../assets/images/home_quick_sweats.png'),
  lower_body: require('../../../assets/images/home_lower_body.png'),
  upper_body: require('../../../assets/images/home_upper_body.png'),
  core: require('../../../assets/images/home_core.png'),
  desk: require('../../../assets/images/home_desk.png'),
};

// Exercise icon
const ExerciseIcon = require('../../../assets/images/exercise_icon.png');

// Home exercises by category
const HOME_EXERCISES = {
  quick_sweats: [
    { id: 'home-qs-1', name: 'Jumping Jacks', description: 'Do 30 standard jumping jacks (step out one leg at a time if needed).' },
    { id: 'home-qs-2', name: 'High Knees', description: 'Jog in place and bring your knees up to your waist for 30 seconds.' },
    { id: 'home-qs-3', name: 'Invisible Jump Rope', description: 'Hop lightly on your toes and spin your wrists for 1 minute.' },
    { id: 'home-qs-4', name: 'Pacing', description: 'Walk briskly around your room or hallway for 2 straight minutes.' },
  ],
  lower_body: [
    { id: 'home-lb-1', name: 'Air Squats', description: "Stand with feet shoulder-width apart, sit back like you're aiming for a chair, and stand up. Do 15 reps." },
    { id: 'home-lb-2', name: 'Alternating Lunges', description: 'Step forward, drop your back knee toward the floor, and push back up. Do 10 per leg.' },
    { id: 'home-lb-3', name: 'Glute Bridges', description: 'Lie on your back with knees bent, and push your hips to the ceiling 15 times.' },
    { id: 'home-lb-4', name: 'Side Leg Raises', description: 'Lie on your side and lift your top leg toward the ceiling 15 times per side.' },
  ],
  upper_body: [
    { id: 'home-ub-1', name: 'Wall Push-ups', description: "Stand an arm's length from a wall, lean in, and push yourself back out 15 times." },
    { id: 'home-ub-2', name: 'Floor Push-ups', description: 'Do 10 standard push-ups on the floor (drop to your knees to make it easier).' },
    { id: 'home-ub-3', name: 'Chair Dips', description: 'Sit on the edge of a sturdy chair, place hands next to your hips, slide off, and lower yourself down and up 10 times.' },
    { id: 'home-ub-4', name: 'Arm Circles', description: 'Hold your arms straight out to the side and make small forward circles for 30 seconds, then backward for 30 seconds.' },
  ],
  core: [
    { id: 'home-core-1', name: 'Forearm Plank', description: 'Hold a push-up position resting on your forearms for 30 seconds.' },
    { id: 'home-core-2', name: 'Standard Crunches', description: 'Lie on your back, knees bent, and curl your shoulders off the floor 20 times.' },
    { id: 'home-core-3', name: 'Bicycle Crunches', description: 'Lie on your back and touch your right elbow to your left knee, then switch. Do 20 total.' },
    { id: 'home-core-4', name: 'Leg Flutters', description: 'Lie flat, lift your straight legs a few inches off the floor, and kick them up and down for 20 seconds.' },
  ],
  desk: [
    { id: 'home-desk-1', name: 'Calf Raises', description: 'Stand up and push up onto your tiptoes 20 times. Perfect for when your screen is on a "Be Right Back" break.' },
    { id: 'home-desk-2', name: 'Chair Swivels', description: 'Lift your feet off the floor and use your core to twist your desk chair side to side 15 times.' },
    { id: 'home-desk-3', name: 'Seated Leg Extensions', description: 'Sit up straight, fully extend both legs under your desk, squeeze your quads, and lower them back down 15 times.' },
  ],
};

export default function HomeCategoryScreen({ route, navigation }) {
  const { category } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const { favorites, isFavorite } = useCustomWorkouts();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setExercises(HOME_EXERCISES[category.id] || []);
      setIsLoading(false);
    }, 300);
  }, [category]);

  // Sort exercises with favorites at the top
  const sortedExercises = useMemo(() => {
    return [...exercises].sort((a, b) => {
      const aFav = isFavorite(a.id);
      const bFav = isFavorite(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [exercises, favorites, isFavorite]);

  const handleExercisePress = (exercise) => {
    navigation.navigate('HomeExerciseDetail', {
      exercise: exercise,
      category: category,
    });
  };

  if (isLoading) {
    return <LoadingView message="Loading exercises..." />;
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
          <Text style={styles.headerTitle}>{category.name}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Category Image Hero */}
          <View style={styles.heroSection}>
            <View style={[styles.imageContainer, { backgroundColor: category.color + '15' }]}>
              <Image
                source={HomeCategoryImages[category.id]}
                style={styles.categoryImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.exerciseCount}>{exercises.length} exercises</Text>
          </View>

          {/* Exercise List */}
          {sortedExercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() => handleExercisePress(exercise)}
            >
              <View style={[styles.exerciseIcon, { backgroundColor: category.color + '15' }]}>
                <Image source={ExerciseIcon} style={styles.exerciseIconImage} resizeMode="contain" />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDescription} numberOfLines={2}>
                  {exercise.description}
                </Text>
              </View>
              <FavoriteButton workoutId={exercise.id} size={22} />
              <Ionicons name="chevron-forward" size={20} color="#8B5A2B" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))}

          {exercises.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={48} color="#C4B5A8" />
              <Text style={styles.emptyText}>No exercises available</Text>
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
  categoryImage: {
    width: 100,
    height: 100,
  },
  exerciseCount: {
    fontSize: 15,
    color: '#6B5D52',
  },
  exerciseCard: {
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
  exerciseIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIconImage: {
    width: 40,
    height: 40,
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 14,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#6B5D52',
    lineHeight: 20,
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
