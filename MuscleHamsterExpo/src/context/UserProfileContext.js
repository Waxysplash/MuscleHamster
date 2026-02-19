// User Profile Context - Phase 03 (with Firestore)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
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
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingProgress, setOnboardingProgress] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!currentUser?.id) {
      console.log('No currentUser, skipping profile load');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('=== LOADING PROFILE ===');
    console.log('User ID:', currentUser.id);

    // Step 1: Load from AsyncStorage first for immediate availability
    let localProfile = null;
    let localProgress = null;
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      const storedProgress = await AsyncStorage.getItem(ONBOARDING_PROGRESS_KEY);

      if (storedProfile) {
        localProfile = JSON.parse(storedProfile);
        console.log('Found local profile, profileComplete:', localProfile.profileComplete);
      }
      if (storedProgress) {
        localProgress = JSON.parse(storedProgress);
      }

      // If we have a complete local profile, use it immediately
      if (localProfile?.profileComplete) {
        console.log('Using complete local profile');
        setProfile(localProfile);
        setOnboardingProgress(null);
        setIsLoading(false);

        // Sync with Firestore in background (don't await)
        syncWithFirestore(localProfile);
        return;
      }
    } catch (localError) {
      console.warn('Failed to load from AsyncStorage:', localError);
    }

    // Step 2: Try Firestore if no complete local profile
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 5000)
      );

      const docRef = doc(db, 'users', currentUser.id);
      console.log('Fetching from Firestore path: users/' + currentUser.id);

      const docSnap = await Promise.race([getDoc(docRef), timeoutPromise]);
      console.log('Firestore response - exists:', docSnap.exists());

      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        console.log('profileComplete:', firestoreData.profileComplete);

        if (firestoreData.profileComplete) {
          // Full profile exists in Firestore - use it and save locally
          setProfile(firestoreData);
          setOnboardingProgress(null);
          // Cache to AsyncStorage for next time
          AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(firestoreData)).catch(e =>
            console.warn('Failed to cache profile locally:', e)
          );
        } else if (firestoreData.onboardingProgress) {
          console.log('Profile not complete, restoring onboarding progress');
          setOnboardingProgress(firestoreData.onboardingProgress);
          setProfile(null);
        } else {
          // Use local data if available
          if (localProfile) {
            setProfile(localProfile);
          }
          if (localProgress) {
            setOnboardingProgress(localProgress);
          }
        }
      } else {
        // No Firestore data - use local if available
        if (localProfile) {
          setProfile(localProfile);
          // Migrate to Firestore in background
          setDoc(docRef, localProfile).catch(e => console.warn('Migration failed:', e));
        }
        if (localProgress) {
          setOnboardingProgress(localProgress);
        }
      }
    } catch (e) {
      const isTimeout = e.message === 'Firestore timeout';
      console.warn(isTimeout ? 'Firestore timed out' : 'Firestore failed:', e.message);

      // Use local data as fallback
      if (localProfile) {
        setProfile(localProfile);
        console.log('Using local profile as fallback');
      }
      if (localProgress) {
        setOnboardingProgress(localProgress);
      }
    } finally {
      console.log('Profile loading complete');
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  // Background sync with Firestore
  const syncWithFirestore = async (localProfile) => {
    try {
      const docRef = doc(db, 'users', currentUser.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        // If Firestore has newer data, update local
        if (firestoreData.updatedAt > (localProfile.updatedAt || 0)) {
          setProfile(firestoreData);
          await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(firestoreData));
        }
      } else {
        // Push local profile to Firestore
        await setDoc(docRef, localProfile);
      }
    } catch (e) {
      console.warn('Background Firestore sync failed:', e);
    }
  };

  // Load profile when user changes
  useEffect(() => {
    if (currentUser?.id) {
      loadProfile();
    } else {
      setProfile(null);
      setOnboardingProgress(null);
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

    // Add timestamp for sync comparison
    const profileWithTimestamp = {
      ...newProfile,
      updatedAt: Date.now(),
    };

    // Always save to AsyncStorage first for immediate local availability
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileWithTimestamp));
    setProfile(profileWithTimestamp);
    console.log('Saved to AsyncStorage');

    // Clear local onboarding progress when profile is complete
    if (newProfile.profileComplete) {
      await AsyncStorage.removeItem(ONBOARDING_PROGRESS_KEY);
      setOnboardingProgress(null);
    }

    try {
      // Then save to Firestore for cloud sync
      const docRef = doc(db, 'users', currentUser.id);
      console.log('Writing to Firestore path: users/' + currentUser.id);
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
      // Save locally for quick access during onboarding
      await AsyncStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(progress));
      setOnboardingProgress(progress);

      // Also save to Firestore if logged in
      if (currentUser?.id) {
        const docRef = doc(db, 'users', currentUser.id);
        await setDoc(docRef, { onboardingProgress: progress }, { merge: true });
      }
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
        // Don't delete from Firestore - just clear local state
        // User data stays in cloud
      }
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      await AsyncStorage.removeItem(ONBOARDING_PROGRESS_KEY);
      setProfile(null);
      setOnboardingProgress(null);
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
