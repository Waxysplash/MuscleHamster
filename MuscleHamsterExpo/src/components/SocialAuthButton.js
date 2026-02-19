import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SocialAuthButton({ provider, onPress }) {
  const isApple = provider === 'apple';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isApple ? styles.appleButton : styles.googleButton,
      ]}
      onPress={onPress}
      accessibilityLabel={`Sign in with ${isApple ? 'Apple' : 'Google'}`}
      accessibilityRole="button"
    >
      <Ionicons
        name={isApple ? 'logo-apple' : 'logo-google'}
        size={20}
        color={isApple ? '#fff' : '#000'}
        style={styles.icon}
      />
      <Text style={[styles.text, isApple ? styles.appleText : styles.googleText]}>
        Continue with {isApple ? 'Apple' : 'Google'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  appleText: {
    color: '#fff',
  },
  googleText: {
    color: '#000',
  },
});
