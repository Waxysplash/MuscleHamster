import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import AuthTextField from '../../components/AuthTextField';
import { useAuth } from '../../context/AuthContext';

export default function PasswordResetScreen({ navigation }) {
  const { resetPassword, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validation
  const isValidEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  const emailError = email && !isValidEmail ? 'Please enter a valid email address' : null;

  const isFormValid = isValidEmail;

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    clearError();

    const success = await resetPassword(email);

    setIsSubmitting(false);

    if (success) {
      setShowSuccess(true);
    }
  };

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successContent}>
          <Ionicons name="mail-open" size={70} color="#FF9500" />
          <Text style={styles.successTitle}>Check your inbox!</Text>
          <Text style={styles.successSubtitle}>
            Your hamster just sent a reset link to:
          </Text>
          <Text style={styles.successEmail}>{email}</Text>
          <Text style={styles.successHint}>
            Follow the link in the email to reset your password.
          </Text>
        </View>

        <View style={styles.successActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Back to Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              setShowSuccess(false);
              clearError();
            }}
          >
            <Text style={styles.linkText}>Didn't get the email? Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          <Ionicons name="refresh" size={60} color="#FF9500" />
          <Text style={styles.title}>Let's get you back in!</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </Text>
        </View>

        {/* Form */}
        <AuthTextField
          icon="mail"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          error={emailError}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        {/* Auth Error */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
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
          accessibilityLabel={isSubmitting ? 'Sending reset link' : 'Send Reset Link'}
          accessibilityRole="button"
        >
          {isSubmitting ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitButtonText}>Sending reset link...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Send Reset Link</Text>
          )}
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
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A3728',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B5D52',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
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
  // Success State
  successContainer: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    justifyContent: 'space-between',
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A3728',
    marginTop: 24,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B5D52',
    marginTop: 12,
  },
  successEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A3728',
    marginTop: 4,
  },
  successHint: {
    fontSize: 14,
    color: '#6B5D52',
    marginTop: 16,
    textAlign: 'center',
  },
  successActions: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  primaryButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#8B5A2B',
    fontSize: 15,
  },
});
