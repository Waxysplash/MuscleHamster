/**
 * ThemedAlert.js
 * MuscleHamster Expo
 *
 * Custom alert component matching the app's warm color scheme
 * Replaces native Alert.alert() with cream/brown themed modals
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * ThemedAlert - A custom styled alert modal
 *
 * @param {boolean} visible - Whether the alert is visible
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Array} buttons - Array of button objects: { text, onPress, style }
 *   - style can be 'default', 'cancel', or 'destructive'
 * @param {function} onDismiss - Called when alert is dismissed
 */
export default function ThemedAlert({
  visible = false,
  title = '',
  message = '',
  buttons = [{ text: 'OK' }],
  onDismiss,
}) {
  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const getButtonStyle = (style, isOnly) => {
    const baseStyle = [styles.button];

    if (style === 'cancel') {
      baseStyle.push(styles.buttonCancel);
    } else if (style === 'destructive') {
      baseStyle.push(styles.buttonDestructive);
    } else {
      baseStyle.push(styles.buttonDefault);
    }

    if (isOnly) {
      baseStyle.push(styles.buttonOnly);
    }

    return baseStyle;
  };

  const getButtonTextStyle = (style) => {
    if (style === 'cancel') {
      return [styles.buttonText, styles.buttonTextCancel];
    } else if (style === 'destructive') {
      return [styles.buttonText, styles.buttonTextDestructive];
    }
    return [styles.buttonText, styles.buttonTextDefault];
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          {/* Title */}
          {title ? <Text style={styles.title}>{title}</Text> : null}

          {/* Message */}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {/* Buttons */}
          <View style={[
            styles.buttonContainer,
            buttons.length === 2 && styles.buttonContainerRow,
          ]}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={getButtonStyle(button.style, buttons.length === 1)}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.7}
              >
                <Text style={getButtonTextStyle(button.style)}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 55, 40, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  alertContainer: {
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    padding: 24,
    width: Math.min(SCREEN_WIDTH - 80, 320),
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A3728',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#6B5D52',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 4,
  },
  buttonContainerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonOnly: {
    marginTop: 0,
  },
  buttonDefault: {
    backgroundColor: '#FF9500',
  },
  buttonCancel: {
    backgroundColor: 'rgba(139, 90, 43, 0.12)',
    flex: 1,
  },
  buttonDestructive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDefault: {
    color: '#FFFFFF',
  },
  buttonTextCancel: {
    color: '#8B5A2B',
  },
  buttonTextDestructive: {
    color: '#FFFFFF',
  },
});
