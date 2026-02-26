import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AuthTextField from '../../components/AuthTextField';
import SocialAuthButton from '../../components/SocialAuthButton';
import { useAuth } from '../../context/AuthContext';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

export default function SignInScreen({ navigation }) {
  const { signIn, signInWithApple, isAppleAvailable, error, clearError } = useAuth();
  const { signIn: googleSignIn, loading: googleLoading, error: googleError } = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'apple' | 'google' | null

  const passwordRef = useRef();

  const handleAppleSignIn = async () => {
    if (socialLoading) return;
    setSocialLoading('apple');
    clearError();

    await signInWithApple();
    // Auth state listener will handle navigation

    setSocialLoading(null);
  };

  const handleGoogleSignIn = async () => {
    if (socialLoading) return;
    setSocialLoading('google');
    clearError();

    await googleSignIn();
    // Auth state listener will handle navigation
    // Note: loading state is managed by useGoogleAuth hook
  };

  // Validation
  const isValidEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  const emailError = email && !isValidEmail ? 'Please enter a valid email address' : null;

  const isFormValid = isValidEmail && password.length > 0;

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

    const success = await signIn(email, password);

    setIsSubmitting(false);
    // Auth state change will trigger navigation
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Your hamster missed you.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AuthTextField
            icon="mail"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={emailError}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <AuthTextField
            icon="lock-closed"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            isSecure
            returnKeyType="go"
            inputRef={passwordRef}
            onSubmitEditing={handleSubmit}
          />
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => navigation.navigate('PasswordReset')}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Auth Error */}
        {(error || googleError) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error || googleError}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormValid || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          accessibilityLabel={isSubmitting ? 'Waking up your hamster' : 'Sign In'}
          accessibilityRole="button"
        >
          {isSubmitting ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitButtonText}>Waking up your hamster...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        {Platform.OS === 'ios' && isAppleAvailable && (
          <SocialAuthButton
            provider="apple"
            onPress={handleAppleSignIn}
            loading={socialLoading === 'apple'}
            disabled={!!socialLoading || isSubmitting}
          />
        )}
        <SocialAuthButton
          provider="google"
          onPress={handleGoogleSignIn}
          loading={socialLoading === 'google' || googleLoading}
          disabled={!!socialLoading || isSubmitting || googleLoading}
        />

        {/* Sign Up Link */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.linkText}>Don't have an account? Create one</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A3728',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B5D52',
    marginTop: 8,
  },
  form: {
    marginBottom: 0,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: '#8B5A2B',
    fontSize: 14,
  },
  errorBanner: {
    backgroundColor: 'rgba(255,59,48,0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#D4C4B0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8DED4',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B5D52',
    fontSize: 14,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  linkText: {
    color: '#8B5A2B',
    fontSize: 15,
  },
});
