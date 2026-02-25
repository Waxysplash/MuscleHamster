// Gym Exercise Detail Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GymExerciseDetailScreen({ route, navigation }) {
  const { exercise, bodyPart } = route.params;

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

  const getDifficultyLabel = (difficulty) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

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
          <Text style={styles.headerTitle}>Exercise Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Exercise Icon & Name */}
          <View style={styles.heroSection}>
            <View style={[styles.iconCircle, { backgroundColor: bodyPart?.color + '20' || '#FF950020' }]}>
              <Ionicons name="barbell" size={48} color={bodyPart?.color || '#FF9500'} />
            </View>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {exercise.target && (
              <View style={styles.targetBadge}>
                <Ionicons name="locate" size={16} color="#FF9500" />
                <Text style={styles.targetText}>{exercise.target}</Text>
              </View>
            )}
          </View>

          {/* Difficulty */}
          <View style={styles.difficultySection}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }]}>
              <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(exercise.difficulty) }]} />
              <Text style={[styles.difficultyText, { color: getDifficultyColor(exercise.difficulty) }]}>
                {getDifficultyLabel(exercise.difficulty)}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Exercise</Text>
            <Text style={styles.description}>{exercise.description}</Text>
          </View>

          {/* Tips Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips</Text>
            <View style={styles.tipCard}>
              <Ionicons name="bulb" size={24} color="#FF9500" />
              <Text style={styles.tipText}>
                Focus on proper form over heavy weight. Control the movement throughout the full range of motion.
              </Text>
            </View>
          </View>

          {/* Body Part Info */}
          {bodyPart && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: bodyPart.color + '20' }]}>
                  <Ionicons name="fitness" size={24} color={bodyPart.color} />
                </View>
                <Text style={styles.categoryText}>{bodyPart.name} Workout</Text>
              </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6DC',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A3728',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4A3728',
    textAlign: 'center',
    marginBottom: 8,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  targetText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 6,
  },
  difficultySection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  difficultyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3728',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: '#6B5D52',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF0E0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#6B5D52',
    marginLeft: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A3728',
    marginLeft: 14,
  },
});
