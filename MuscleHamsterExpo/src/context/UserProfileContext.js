// User Profile Context - Phase 03 (with Firestore + SecureStorage)
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { createEmptyProfile } from '../models/UserProfile';
import { saveSecure, getSecure, deleteSecure } from '../services/SecureStorageService';

// DEBUG FLAG - set to true to see alerts about profile loading
const DEBUG_PROFILE = false;

// User-specific storage keys
const getProfileStorageKey = (userId) => `@MuscleHamster:userProfile:${userId}`;
const getOnboardingProgressKey = (userId) => `@MuscleHamster:onboardingProgress:${userId}`;
// PERMANENT onboarding completion flag - never cleared on logout
const getOnboardingCompleteKey = (userId) => `@MuscleHamster:onboardingComplete:${userId}`;

// Legacy keys (for migration)
const LEGACY_PROFILE_KEY = '@MuscleHamster:userProfile';
const LEGACY_ONBOARDING_KEY = '@MuscleHamster:onboardingProgress';

// Helper to clean undefined values (Firestore doesn't accept undefined)
const cleanUndefinedValues = (obj) => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedValues);
  }
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value);
      }
    }
    return cleaned;
  }
  return obj;
};

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
  const justSavedProfile = useRef(false); // Prevent reload after save
  const profileCompleteRef = useRef(false); // Track profile complete status for checks

  const loadProfile = useCallback(async () => {
    if (!currentUser?.id) {
      console.log('No currentUser, skipping profile load');
      setIsLoading(false);
      return;
    }

    // Skip reload if we just saved the profile (prevents onboarding loop)
    if (justSavedProfile.current) {
      console.log('Skipping profile load - just saved');
      justSavedProfile.current = false;
      setIsLoading(false);
      return;
    }

    const userId = currentUser.id;

    // Only skip if we've already loaded for this exact user AND have a complete profile
    if (lastLoadedUserId.current === userId && profileCompleteRef.current) {
      console.log('Profile already loaded for user:', userId);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('=== LOADING PROFILE ===');
    console.log('User ID:', userId);

    if (DEBUG_PROFILE) {
      Alert.alert('Loading Profile', `User ID: ${userId.substring(0, 8)}...`);
    }

    // User-specific storage keys
    const profileKey = getProfileStorageKey(userId);
    const progressKey = getOnboardingProgressKey(userId);
    const completeKey = getOnboardingCompleteKey(userId);

    // STEP 0: Check permanent onboarding completion flag FIRST
    // This is a failsafe that survives logout/login cycles
    let hasCompletedOnboarding = false;
    try {
      const completedFlag = await getSecure(completeKey);
      hasCompletedOnboarding = completedFlag === true;
      console.log('Permanent onboarding flag:', hasCompletedOnboarding);
      if (DEBUG_PROFILE) {
        Alert.alert('Permanent Flag Check', `Key: ${completeKey}\nValue: ${completedFlag}\nCompleted: ${hasCompletedOnboarding}`);
      }
    } catch (e) {
      console.warn('Failed to check onboarding flag:', e);
      if (DEBUG_PROFILE) {
        Alert.alert('Flag Check Error', e.message);
      }
    }

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

      if (DEBUG_PROFILE) {
        Alert.alert('Firestore Response', `Exists: ${docSnap.exists()}`);
      }

      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        console.log('Firestore profileComplete:', firestoreData.profileComplete);

        if (DEBUG_PROFILE) {
          Alert.alert('Firestore Data', `profileComplete: ${firestoreData.profileComplete}\nhamsterName: ${firestoreData.hamsterName || 'none'}`);
        }

        if (firestoreData.profileComplete) {
          // Full profile exists in Firestore - use it
          console.log('=== FOUND COMPLETE PROFILE IN FIRESTORE ===');
          if (DEBUG_PROFILE) {
            Alert.alert('Found Profile!', `From Firestore: ${firestoreData.hamsterName || 'no name'}`);
          }
          setProfile(firestoreData);
          setOnboardingProgress(null);
          lastLoadedUserId.current = userId;
          profileCompleteRef.current = true;

          // Cache to SecureStorage for offline access
          saveSecure(profileKey, firestoreData).catch(e =>
            console.warn('Failed to cache profile locally:', e)
          );
          // Also ensure permanent flag is set
          saveSecure(completeKey, true).catch(e =>
            console.warn('Failed to set onboarding flag:', e)
          );
          setIsLoading(false);
          return;
        } else if (firestoreData.onboardingProgress && !hasCompletedOnboarding) {
          console.log('Profile not complete, restoring onboarding progress');
          if (DEBUG_PROFILE) {
            Alert.alert('Restoring Onboarding', 'Found partial onboarding progress in Firestore');
          }
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
      if (DEBUG_PROFILE) {
        Alert.alert('Firestore Error', isTimeout ? 'Timed out, checking local...' : e.message);
      }
      // Continue to check local storage as fallback
    }

    // Step 2: Fall back to user-specific SecureStorage (offline/timeout case)
    try {
      const localProfile = await getSecure(profileKey);
      const storedProgress = await getSecure(progressKey);

      if (DEBUG_PROFILE) {
        Alert.alert('Checking SecureStorage', `Key: ${profileKey}\nFound: ${localProfile ? 'YES' : 'NO'}`);
      }

      if (localProfile) {
        console.log('Found local profile, profileComplete:', localProfile.profileComplete);

        if (localProfile?.profileComplete) {
          console.log('Using complete local profile as fallback');
          if (DEBUG_PROFILE) {
            Alert.alert('Found Profile!', `From SecureStorage: ${localProfile.hamsterName || 'no name'}`);
          }
          setProfile(localProfile);
          setOnboardingProgress(null);
          lastLoadedUserId.current = userId;
          profileCompleteRef.current = true;
          // Ensure permanent flag is set
          saveSecure(completeKey, true).catch(() => {});
          setIsLoading(false);
          return;
        }
      }

      if (storedProgress && !hasCompletedOnboarding) {
        setOnboardingProgress(storedProgress);
      }
    } catch (localError) {
      console.warn('Failed to load from SecureStorage:', localError);
    }

    // Step 3: If permanent flag says onboarding is complete but we couldn't find the profile,
    // create a minimal profile to prevent re-onboarding
    if (hasCompletedOnboarding) {
      console.log('=== PERMANENT FLAG SET - Creating minimal profile ===');
      if (DEBUG_PROFILE) {
        Alert.alert('Restoring from flag', 'Onboarding was completed before, creating minimal profile');
      }
      const minimalProfile = {
        ...createEmptyProfile(),
        hamsterName: 'Hammy', // Default name
        profileComplete: true,
        userId: userId,
        restoredFromFlag: true,
        updatedAt: Date.now(),
      };
      setProfile(minimalProfile);
      setOnboardingProgress(null);
      lastLoadedUserId.current = userId;
      profileCompleteRef.current = true;

      // Try to save this minimal profile back to storage
      saveSecure(profileKey, minimalProfile).catch(() => {});
      setIsLoading(false);
      return;
    }

    // No profile found anywhere - user needs onboarding
    console.log('No profile found - user needs onboarding');
    if (DEBUG_PROFILE) {
      Alert.alert('No Profile Found', 'User needs to complete onboarding');
    }
    lastLoadedUserId.current = userId;
    setIsLoading(false);
  }, [currentUser?.id]); // Only depend on user ID, not profile state

  // Load profile when user changes
  useEffect(() => {
    if (currentUser?.id) {
      // Reset state when user changes
      if (lastLoadedUserId.current && lastLoadedUserId.current !== currentUser.id) {
        console.log('User changed, resetting profile state');
        setProfile(null);
        setOnboardingProgress(null);
        lastLoadedUserId.current = null;
        profileCompleteRef.current = false;
      }
      loadProfile();
    } else {
      setProfile(null);
      setOnboardingProgress(null);
      lastLoadedUserId.current = null;
      profileCompleteRef.current = false;
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
    const completeKey = getOnboardingCompleteKey(userId);

    // Add timestamp for sync comparison
    const profileWithTimestamp = {
      ...newProfile,
      userId: userId, // Store userId in profile for validation
      updatedAt: Date.now(),
    };

    // Always save to SecureStorage first for immediate local availability
    await saveSecure(profileKey, profileWithTimestamp);

    if (DEBUG_PROFILE) {
      Alert.alert('Saved to SecureStorage', `Key: ${profileKey}\nName: ${profileWithTimestamp.hamsterName}`);
    }

    // Prevent loadProfile from running again after this save
    justSavedProfile.current = true;
    lastLoadedUserId.current = userId; // Mark this user as loaded
    profileCompleteRef.current = !!profileWithTimestamp.profileComplete;
    setProfile(profileWithTimestamp);
    console.log('Saved to user-specific SecureStorage, profileComplete:', profileWithTimestamp.profileComplete);

    // Set PERMANENT onboarding completion flag when profile is complete
    // This flag survives logout/login and ensures user never has to re-onboard
    if (newProfile.profileComplete) {
      await saveSecure(completeKey, true);
      console.log('=== PERMANENT ONBOARDING FLAG SET ===');
      if (DEBUG_PROFILE) {
        Alert.alert('FLAG SET!', `Permanent onboarding flag saved to:\n${completeKey}`);
      }
      await deleteSecure(progressKey);
      setOnboardingProgress(null);
    }

    try {
      // Clean undefined values before saving to Firestore (Firestore doesn't accept undefined)
      const cleanedProfile = cleanUndefinedValues(profileWithTimestamp);

      // Then save to Firestore for cloud sync
      const docRef = doc(db, 'users', userId);
      console.log('Writing to Firestore path: users/' + userId);
      await setDoc(docRef, cleanedProfile, { merge: true });
      console.log('=== PROFILE SAVED TO FIRESTORE ===');
      if (DEBUG_PROFILE) {
        Alert.alert('Profile Saved!', `Saved to Firestore: ${cleanedProfile.hamsterName}`);
      }

      // Clear onboarding progress in Firestore when profile is complete
      if (cleanedProfile.profileComplete) {
        await setDoc(docRef, { onboardingProgress: null }, { merge: true });
        console.log('Onboarding progress cleared in Firestore');
      }
    } catch (e) {
      console.warn('Failed to save profile to Firestore (local save succeeded):', e);
      if (DEBUG_PROFILE) {
        Alert.alert('Firestore Save Failed', `Local save OK. Error: ${e.message}`);
      }
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
      await saveSecure(progressKey, progress);
      setOnboardingProgress(progress);

      // Also save to Firestore (clean undefined values first)
      const cleanedProgress = cleanUndefinedValues(progress);
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, { onboardingProgress: cleanedProgress }, { merge: true });
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
        // NOTE: We intentionally do NOT clear the permanent onboarding flag (completeKey)
        // This ensures users who completed onboarding never have to do it again

        // Clear user-specific local storage (but not the permanent flag)
        await deleteSecure(profileKey);
        await deleteSecure(progressKey);
        // Don't delete from Firestore - just clear local state
        // User data stays in cloud
      }
      setProfile(null);
      setOnboardingProgress(null);
      lastLoadedUserId.current = null;
      profileCompleteRef.current = false;
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
