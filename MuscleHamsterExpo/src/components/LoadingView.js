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
    backgroundColor: '#FFF4E6',
  },
  message: {
    marginTop: 16,
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
  },
});
