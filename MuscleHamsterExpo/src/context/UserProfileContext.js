// User Profile Context - Phase 03
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createEmptyProfile } from '../models/UserProfile';

const PROFILE_STORAGE_KEY = '@MuscleHamster:userProfile';
const ONBOARDING_PROGRESS_KEY = '@MuscleHamster:onboardingProgress';

const UserProfileContext = createContext(null);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingProgress, setOnboardingProgress] = useState(null);

  // Load profile from storage
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      const storedProgress = await AsyncStorage.getItem(ONBOARDING_PROGRESS_KEY);

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
      if (storedProgress) {
        setOnboardingProgress(JSON.parse(storedProgress));
      }
    } catch (e) {
      console.warn('Failed to load profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (newProfile) => {
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);

      // Clear onboarding progress when profile is complete
      if (newProfile.profileComplete) {
        await AsyncStorage.removeItem(ONBOARDING_PROGRESS_KEY);
        setOnboardingProgress(null);
      }
    } catch (e) {
      console.warn('Failed to save profile:', e);
      throw e;
    }
  };

  const saveOnboardingProgress = async (progress) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(progress));
      setOnboardingProgress(progress);
    } catch (e) {
      console.warn('Failed to save onboarding progress:', e);
    }
  };

  const updateProfile = async (updates) => {
    const newProfile = { ...profile, ...updates };
    await saveProfile(newProfile);
    return newProfile;
  };

  const completeOnboarding = async (profileData) => {
    const completeProfile = {
      ...profileData,
      profileComplete: true,
    };
    await saveProfile(completeProfile);
    return completeProfile;
  };

  const clearProfile = async () => {
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      await AsyncStorage.removeItem(ONBOARDING_PROGRESS_KEY);
      setProfile(null);
      setOnboardingProgress(null);
    } catch (e) {
      console.warn('Failed to clear profile:', e);
    }
  };

  const value = {
    profile,
    isLoading,
    isProfileComplete: profile?.profileComplete === true,
    hasHamsterName: !!profile?.hamsterName,
    onboardingProgress,
    saveProfile,
    updateProfile,
    completeOnboarding,
    saveOnboardingProgress,
    clearProfile,
    loadProfile,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
