// Routine Context - State management for saved workout routines
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { RoutineService, setRoutineUserId } from '../services/RoutineService';
import { useAuth } from './AuthContext';
import Logger from '../services/LoggerService';

const RoutineContext = createContext(null);

export function RoutineProvider({ children }) {
  const { currentUser } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load routines when user changes
  useEffect(() => {
    const loadRoutines = async () => {
      setIsLoading(true);
      setError(null);

      // Set user ID for the service
      setRoutineUserId(currentUser?.id || null);

      try {
        const loadedRoutines = await RoutineService.getRoutines();
        setRoutines(loadedRoutines);
        Logger.debug('[RoutineContext] Loaded routines:', loadedRoutines.length);
      } catch (err) {
        Logger.error('[RoutineContext] Failed to load routines:', err);
        setError('Failed to load saved routines');
        setRoutines([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutines();
  }, [currentUser?.id]);

  // Create a new routine
  const createRoutine = useCallback(async (name, workouts) => {
    setError(null);

    try {
      const result = await RoutineService.createRoutine({ name, workouts });

      if (result.success) {
        setRoutines(prev => [result.routine, ...prev]);
        Logger.debug('[RoutineContext] Created routine:', result.routine.name);
        return { success: true, routine: result.routine };
      } else {
        setError(result.message || result.error);
        return { success: false, error: result.error, message: result.message };
      }
    } catch (err) {
      Logger.error('[RoutineContext] Failed to create routine:', err);
      setError('Failed to create routine');
      return { success: false, error: err.message };
    }
  }, []);

  // Update an existing routine
  const updateRoutine = useCallback(async (routineId, updates) => {
    setError(null);

    try {
      const result = await RoutineService.updateRoutine(routineId, updates);

      if (result.success) {
        setRoutines(prev =>
          prev.map(r => (r.id === routineId ? result.routine : r))
        );
        Logger.debug('[RoutineContext] Updated routine:', routineId);
        return { success: true, routine: result.routine };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      Logger.error('[RoutineContext] Failed to update routine:', err);
      setError('Failed to update routine');
      return { success: false, error: err.message };
    }
  }, []);

  // Delete a routine
  const deleteRoutine = useCallback(async (routineId) => {
    setError(null);

    try {
      const result = await RoutineService.deleteRoutine(routineId);

      if (result.success) {
        setRoutines(prev => prev.filter(r => r.id !== routineId));
        Logger.debug('[RoutineContext] Deleted routine:', routineId);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      Logger.error('[RoutineContext] Failed to delete routine:', err);
      setError('Failed to delete routine');
      return { success: false, error: err.message };
    }
  }, []);

  // Use a routine (record usage and return workouts)
  const useRoutine = useCallback(async (routineId) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) {
      return { success: false, error: 'Routine not found' };
    }

    // Record usage in background
    RoutineService.recordUsage(routineId).catch(err => {
      Logger.warn('[RoutineContext] Failed to record routine usage:', err);
    });

    // Update local state
    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? { ...r, lastUsedAt: new Date().toISOString(), usageCount: (r.usageCount || 0) + 1 }
          : r
      )
    );

    return {
      success: true,
      workouts: routine.workouts,
      routine,
    };
  }, [routines]);

  // Check if user can create more routines
  const checkCanCreateRoutine = useCallback(async () => {
    try {
      return await RoutineService.canCreateRoutine();
    } catch (err) {
      Logger.error('[RoutineContext] Failed to check routine limit:', err);
      return { canCreate: false, error: err.message };
    }
  }, []);

  // Get sorted routines (most recently used first)
  const getSortedRoutines = useCallback(() => {
    return [...routines].sort((a, b) => {
      // Sort by last used date, most recent first
      if (a.lastUsedAt && b.lastUsedAt) {
        return new Date(b.lastUsedAt) - new Date(a.lastUsedAt);
      }
      if (a.lastUsedAt) return -1;
      if (b.lastUsedAt) return 1;
      // Fall back to creation date
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [routines]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    routines,
    sortedRoutines: getSortedRoutines(),
    isLoading,
    error,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    useRoutine,
    checkCanCreateRoutine,
    clearError,
    freeTierLimit: RoutineService.getFreeTierLimit(),
  };

  return (
    <RoutineContext.Provider value={value}>
      {children}
    </RoutineContext.Provider>
  );
}

export function useRoutines() {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error('useRoutines must be used within a RoutineProvider');
  }
  return context;
}

export default RoutineContext;
