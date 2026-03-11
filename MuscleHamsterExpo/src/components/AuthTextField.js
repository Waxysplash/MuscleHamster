import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AuthTextField({
  icon,
  placeholder,
  value,
  onChangeText,
  isSecure = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  hint,
  onSubmitEditing,
  returnKeyType,
  inputRef,
  textContentType,
  autoComplete,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // iOS Strong Password workaround: Start with secureTextEntry disabled,
  // enable it only after user starts typing to prevent iOS from showing
  // the Strong Password suggestion which can freeze the input.
  // See: https://github.com/facebook/react-native/issues/21911
  const [secureEntryEnabled, setSecureEntryEnabled] = useState(false);

  // Enable secure entry when user types (only for secure fields on iOS)
  useEffect(() => {
    if (isSecure && Platform.OS === 'ios' && value && value.length > 0 && !secureEntryEnabled) {
      setSecureEntryEnabled(true);
    }
  }, [value, isSecure, secureEntryEnabled]);

  // Reset secure entry state when value is cleared (e.g., form reset)
  useEffect(() => {
    if (isSecure && Platform.OS === 'ios' && (!value || value.length === 0)) {
      setSecureEntryEnabled(false);
    }
  }, [value, isSecure]);

  // Determine actual secure text entry state
  const shouldBeSecure = isSecure && !isPasswordVisible && (Platform.OS !== 'ios' || secureEntryEnabled);

  // On iOS, don't pass password-related textContentType until secure entry is enabled
  // This prevents iOS from showing Strong Password suggestion before user starts typing
  const effectiveTextContentType = Platform.OS === 'ios' && isSecure && !secureEntryEnabled
    ? 'none'
    : textContentType;

  const getBorderColor = () => {
    if (error) return '#FF3B30';
    if (isFocused) return '#FF9500';
    return '#E8DED4';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { borderColor: getBorderColor() }]}>
        <Ionicons
          name={icon}
          size={20}
          color={isFocused ? '#FF9500' : '#8B5A2B'}
          style={styles.icon}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#B8A99A"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={shouldBeSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          textContentType={effectiveTextContentType}
          autoComplete={autoComplete}
          accessibilityLabel={placeholder}
          accessibilityHint={hint || error}
        />
        {isSecure && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            style={styles.eyeButton}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#8B5A2B"
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2E5',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#4A3728',
  },
  eyeButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#FF3B30',
    marginLeft: 4,
  },
  hintText: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 6,
    paddingHorizontal: 4,
  },
});
