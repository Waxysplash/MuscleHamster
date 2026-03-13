import { useState, useCallback } from 'react';
import { signInWithGoogle } from '../services/SocialAuthService';

/**
 * Custom hook for Google authentication using native SDK.
 * Uses @react-native-google-signin/google-signin which complies with
 * Google's OAuth 2.0 policies (no embedded WebViews).
 *
 * @returns {{
 *   signIn: () => Promise<{success: boolean, cancelled?: boolean}>,
 *   loading: boolean,
 *   error: string | null,
 *   clearError: () => void
 * }}
 */
export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithGoogle();

      if (result.cancelled) {
        // User cancelled - no error needed
        setLoading(false);
        return { success: false, cancelled: true };
      }

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return { success: false };
      }

      // Auth state listener in AuthContext will handle navigation
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
      setLoading(false);
      return { success: false };
    }
  }, []);

  return {
    signIn,
    loading,
    error,
    clearError,
    // Always ready since native SDK is configured on module load
    isReady: true,
  };
}
