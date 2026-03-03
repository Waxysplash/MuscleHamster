// Custom Workout Context - Wraps CustomWorkoutService and FavoritesService
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CustomWorkoutService, setCustomWorkoutUserId } from '../services/CustomWorkoutService';
import { FavoritesService, setFavoritesUserId } from '../services/FavoritesService';
import { useAuth } from './AuthContext';
import { useActivity } from './ActivityContext';

const CustomWorkoutContext = createContext(null);

export const useCustomWorkouts = () => {
  const context = useContext(CustomWorkoutContext);
  if (!context) {
    throw new Error('useCustomWorkouts must be used within a CustomWorkoutProvider');
  }
  return context;
};

export const CustomWorkoutProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { recordWorkoutCompletion } = useActivity();
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    console.log('Loading custom workouts and favorites...');
    try {
      const [workouts, favs] = await Promise.all([
        CustomWorkoutService.getCustomWorkouts(),
        FavoritesService.getFavorites(),
      ]);
      setCustomWorkouts(workouts);
      setFavorites(favs);
      console.log('Custom workouts and favorites loaded');
    } catch (e) {
      console.warn('Failed to load custom workouts:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set user ID when user changes
  useEffect(() => {
    const userId = currentUser?.id || null;
    setCustomWorkoutUserId(userId);
    setFavoritesUserId(userId);

    if (userId) {
      loadData();
    } else {
      setCustomWorkouts([]);
      setFavorites([]);
      setIsLoading(false);
    }
  }, [currentUser?.id, loadData]);

  const addWorkout = useCallback(async (workoutData) => {
    try {
      const result = await CustomWorkoutService.addCustomWorkout(workoutData);
      if (result.success) {
        setCustomWorkouts(prev => [result.workout, ...prev]);
      }
      return result;
    } catch (e) {
      console.warn('Failed to add custom workout:', e);
      throw e;
    }
  }, []);

  const updateWorkout = useCallback(async (workoutId, updates) => {
    try {
      const result = await CustomWorkoutService.updateCustomWorkout(workoutId, updates);
      if (result.success) {
        setCustomWorkouts(prev =>
          prev.map(w => w.id === workoutId ? result.workout : w)
        );
      }
      return result;
    } catch (e) {
      console.warn('Failed to update custom workout:', e);
      throw e;
    }
  }, []);

  const deleteWorkout = useCallback(async (workoutId) => {
    try {
      const result = await CustomWorkoutService.deleteCustomWorkout(workoutId);
      if (result.success) {
        setCustomWorkouts(prev => prev.filter(w => w.id !== workoutId));
      }
      return result;
    } catch (e) {
      console.warn('Failed to delete custom workout:', e);
      throw e;
    }
  }, []);

  const recordProgress = useCallback(async (workoutId, metrics) => {
    try {
      const result = await CustomWorkoutService.recordCompletion(workoutId, metrics);
      if (result.success) {
        // Update local state with new completion count
        setCustomWorkouts(prev =>
          prev.map(w => w.id === workoutId ? result.workout : w)
        );

        // Also record in ActivityService for points
        try {
          const workout = customWorkouts.find(w => w.id === workoutId);
          await recordWorkoutCompletion({
            workoutId,
            workoutName: workout?.name || 'Custom Workout',
            exercisesCompleted: 1,
            totalExercises: 1,
            durationSeconds: (metrics.duration || 0) * 60,
          });
        } catch (activityError) {
          console.warn('Failed to record in activity:', activityError);
          // Don't fail the whole operation if activity recording fails
        }
      }
      return result;
    } catch (e) {
      console.warn('Failed to record progress:', e);
      throw e;
    }
  }, [customWorkouts, recordWorkoutCompletion]);

  const getCompletionHistory = useCallback(async (workoutId) => {
    try {
      return await CustomWorkoutService.getCompletionHistory(workoutId);
    } catch (e) {
      console.warn('Failed to get completion history:', e);
      return [];
    }
  }, []);

  const toggleFavorite = useCallback(async (workoutId) => {
    try {
      const wasFavorited = favorites.includes(workoutId);
      const result = await FavoritesService.toggleFavorite(workoutId);
      if (result.success) {
        if (wasFavorited) {
          setFavorites(prev => prev.filter(id => id !== workoutId));
        } else {
          setFavorites(prev => [workoutId, ...prev]);
        }
      }
      return result;
    } catch (e) {
      console.warn('Failed to toggle favorite:', e);
      throw e;
    }
  }, [favorites]);

  const isFavorite = useCallback((workoutId) => {
    return favorites.includes(workoutId);
  }, [favorites]);

  const value = {
    customWorkouts,
    favorites,
    isLoading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    recordProgress,
    getCompletionHistory,
    toggleFavorite,
    isFavorite,
    refreshData: loadData,
  };

  return (
    <CustomWorkoutContext.Provider value={value}>
      {children}
    </CustomWorkoutContext.Provider>
  );
};
