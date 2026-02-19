// User Profile Context - Phase 03 (with Firestore)
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { createEmptyProfile } from '../models/UserProfile';

// User-specific storage keys
const getProfileStorageKey = (userId) => `@MuscleHamster:userProfile:${userId}`;
const getOnboardingProgressKey = (userId) => `@MuscleHamster:onboardingProgress:${userId}`;

// Legacy keys (for migration)
const LEGACY_PROFILE_KEY = '@MuscleHamster:userProfile';
const LEGACY_ONBOARDING_KEY = '@MuscleHamster:onboardingProgress';

const UserProfileContext = createContext(null);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingProgress, setOnboardingProgress] = useState(null);
  const lastLoadedUserId = useRef(null);

  const loadProfile = useCallback(async () => {
    if (!currentUser?.id) {
      console.log('No currentUser, skipping profile load');
      setIsLoading(false);
      return;
    }

    const userId = currentUser.id;

    // Prevent duplicate loads for same user
    if (lastLoadedUserId.current === userId && profile?.profileComplete) {
      console.log('Profile already loaded for this user');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('=== LOADING PROFILE ===');
    console.log('User ID:', userId);

    // User-specific storage keys
    const profileKey = getProfileStorageKey(userId);
    const progressKey = getOnboardingProgressKey(userId);

    // Step 1: Always check Firestore FIRST for authoritative data
    // This ensures returning users always get their profile from the cloud
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 8000)
      );

      const docRef = doc(db, 'users', userId);
      console.log('Fetching from Firestore path: users/' + userId);

      const docSnap = await Promise.race([getDoc(docRef), timeoutPromise]);
      console.log('Firestore response - exists:', docSnap.exists());

      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        console.log('Firestore profileComplete:', firestoreData.profileComplete);

        if (firestoreData.profileComplete) {
          // Full profile exists in Firestore - use it
          console.log('=== FOUND COMPLETE PROFILE IN FIRESTORE ===');
          setProfile(firestoreData);
          setOnboardingProgress(null);
          lastLoadedUserId.current = userId;

          // Cache to user-specific AsyncStorage for offline access
          AsyncStorage.setItem(profileKey, JSON.stringify(firestoreData)).catch(e =>
            console.warn('Failed to cache profile locally:', e)
          );
          setIsLoading(false);
          return;
        } else if (firestoreData.onboardingProgress) {
          console.log('Profile not complete, restoring onboarding progress');
          setOnboardingProgress(firestoreData.onboardingProgress);
          setProfile(null);
          lastLoadedUserId.current = userId;
          setIsLoading(false);
          return;
        }
      }

      console.log('No complete profile in Firestore, checking local cache...');
    } catch (e) {
      const isTimeout = e.message === 'Firestore timeout';
      console.warn(isTimeout ? 'Firestore timed out' : 'Firestore failed:', e.message);
      // Continue to check local storage as fallback
    }

    // Step 2: Fall back to user-specific local storage (offline/timeout case)
    try {
      const storedProfile = await AsyncStorage.getItem(profileKey);
      const storedProgress = await AsyncStorage.getItem(progressKey);

      if (storedProfile) {
        const localProfile = JSON.parse(storedProfile);
        console.log('Found local profile, profileComplete:', localProfile.profileComplete);

        if (localProfile?.profileComplete) {
          console.log('Using complete local profile as fallback');
          setProfile(localProfile);
          setOnboardingProgress(null);
          lastLoadedUserId.current = userId;
          setIsLoading(false);
          return;
        }
      }

      if (storedProgress) {
        const localProgress = JSON.parse(storedProgress);
        setOnboardingProgress(localProgress);
      }
    } catch (localError) {
      console.warn('Failed to load from AsyncStorage:', localError);
    }

    // No profile found anywhere - user needs onboarding
    console.log('No profile found - user needs onboarding');
    lastLoadedUserId.current = userId;
    setIsLoading(false);
  }, [currentUser?.id, profile?.profileComplete]);

  // Load profile when user changes
  useEffect(() => {
    if (currentUser?.id) {
      // Reset state when user changes
      if (lastLoadedUserId.current && lastLoadedUserId.current !== currentUser.id) {
        console.log('User changed, resetting profile state');
        setProfile(null);
        setOnboardingProgress(null);
        lastLoadedUserId.current = null;
      }
      loadProfile();
    } else {
      setProfile(null);
      setOnboardingProgress(null);
      lastLoadedUserId.current = null;
      setIsLoading(false);
    }
  }, [currentUser?.id, loadProfile]);

  const saveProfile = async (newProfile) => {
    console.log('=== SAVING PROFILE ===');
    console.log('currentUser:', currentUser?.id);

    if (!currentUser?.id) {
      console.error('No user logged in, cannot save profile');
      throw new Error('No user logged in');
    }

    const userId = currentUser.id;
    const profileKey = getProfileStorageKey(userId);
    const progressKey = getOnboardingProgressKey(userId);

    // Add timestamp for sync comparison
    const profileWithTimestamp = {
      ...newProfile,
      userId: userId, // Store userId in profile for validation
      updatedAt: Date.now(),
    };

    // Always save to AsyncStorage first for immediate local availability
    await AsyncStorage.setItem(profileKey, JSON.stringify(profileWithTimestamp));
    setProfile(profileWithTimestamp);
    console.log('Saved to user-specific AsyncStorage');

    // Clear local onboarding progress when profile is complete
    if (newProfile.profileComplete) {
      await AsyncStorage.removeItem(progressKey);
      setOnboardingProgress(null);
    }

    try {
      // Then save to Firestore for cloud sync
      const docRef = doc(db, 'users', userId);
      console.log('Writing to Firestore path: users/' + userId);
      await setDoc(docRef, profileWithTimestamp, { merge: true });
      console.log('=== PROFILE SAVED TO FIRESTORE ===');

      // Clear onboarding progress in Firestore when profile is complete
      if (profileWithTimestamp.profileComplete) {
        await setDoc(docRef, { onboardingProgress: null }, { merge: true });
        console.log('Onboarding progress cleared in Firestore');
      }
    } catch (e) {
      console.warn('Failed to save profile to Firestore (local save succeeded):', e);
      // Don't throw - local save succeeded, Firestore will sync later
    }
  };

  const saveOnboardingProgress = async (progress) => {
    try {
      if (!currentUser?.id) {
        console.warn('No user logged in, cannot save onboarding progress');
        return;
      }

      const userId = currentUser.id;
      const progressKey = getOnboardingProgressKey(userId);

      // Save locally for quick access during onboarding
      await AsyncStorage.setItem(progressKey, JSON.stringify(progress));
      setOnboardingProgress(progress);

      // Also save to Firestore
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, { onboardingProgress: progress }, { merge: true });
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
    console.log('completeOnboarding called with:', profileData);
    const completeProfile = {
      ...profileData,
      profileComplete: true,
    };
    console.log('Saving complete profile:', completeProfile);
    await saveProfile(completeProfile);
    console.log('Onboarding complete!');
    return completeProfile;
  };

  const clearProfile = async () => {
    try {
      if (currentUser?.id) {
        const userId = currentUser.id;
        const profileKey = getProfileStorageKey(userId);
        const progressKey = getOnboardingProgressKey(userId);

        // Clear user-specific local storage
        await AsyncStorage.removeItem(profileKey);
        await AsyncStorage.removeItem(progressKey);
        // Don't delete from Firestore - just clear local state
        // User data stays in cloud
      }
      setProfile(null);
      setOnboardingProgress(null);
      lastLoadedUserId.current = null;
    } catch (e) {
      console.warn('Failed to clear profile:', e);
    }
  };

  // Debug: Log profile state
  useEffect(() => {
    console.log('Profile state changed:', {
      hasProfile: !!profile,
      profileComplete: profile?.profileComplete,
      hamsterName: profile?.hamsterName,
    });
  }, [profile]);

  const value = {
    profile,
    isLoading,
    isProfileComplete: !!profile?.profileComplete,
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
