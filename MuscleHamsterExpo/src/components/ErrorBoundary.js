import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logger from '../services/LoggerService';

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 *
 * Prevents the entire app from crashing by showing a friendly error screen
 * and allowing the user to retry.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to our logging service (sends to Crashlytics in production)
    Logger.error('ErrorBoundary caught an error', error);
    Logger.debug('Error component stack:', errorInfo?.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.iconContainer}>
              <Ionicons name="sad-outline" size={64} color="#FF9500" />
            </View>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              Don't worry, your hamster is safe! Let's try that again.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={this.handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Try Again"
            >
              <Ionicons name="refresh" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFF8F0',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,149,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A3728',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6B5D52',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
