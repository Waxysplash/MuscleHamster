// Favorite Button - Reusable star toggle component
import React, { useState, useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCustomWorkouts } from '../context/CustomWorkoutContext';

export default function FavoriteButton({ workoutId, size = 24, style }) {
  const { isFavorite, toggleFavorite } = useCustomWorkouts();
  const [isAnimating, setIsAnimating] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const favorited = isFavorite(workoutId);

  const handlePress = async () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Bounce animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await toggleFavorite(workoutId);
    } catch (e) {
      console.warn('Failed to toggle favorite:', e);
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, style]}
      accessibilityLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
      accessibilityRole="button"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={favorited ? 'star' : 'star-outline'}
          size={size}
          color={favorited ? '#FF9500' : '#8B5A2B'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
