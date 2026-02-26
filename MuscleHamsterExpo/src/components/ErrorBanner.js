/**
 * ErrorBanner - Displays error messages with retry option
 *
 * Usage:
 *   <ErrorBanner
 *     message="Failed to load data"
 *     onRetry={() => loadData()}
 *     onDismiss={() => setError(null)}
 *   />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ErrorBanner({
  message = 'Something went wrong',
  onRetry,
  onDismiss,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Ionicons name="alert-circle" size={20} color="#8B5A2B" />
        <Text style={styles.message}>{message}</Text>
      </View>
      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            accessibilityLabel="Try again"
            accessibilityRole="button"
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            accessibilityLabel="Dismiss error"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={20} color="#8B5A2B" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF2E5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DED4',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  message: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4A3728',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
  },
});
