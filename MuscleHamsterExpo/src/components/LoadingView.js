import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingView({ message = 'Loading...' }) {
  return (
    <View style={styles.container} accessible accessibilityLabel={message}>
      <ActivityIndicator size="large" color="#FF9500" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFF8F0',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B5D52',
  },
});
