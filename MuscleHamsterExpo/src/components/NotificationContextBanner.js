// Notification Context Banner - Phase 08.3
// Contextual banner shown when app opens from a notification tap

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BannerTypeInfo } from '../models/Notification';

export default function NotificationContextBanner({
  context,
  onDismiss,
  onAction,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const dismissTimeoutRef = useRef(null);

  useEffect(() => {
    if (context) {
      animateIn();
    } else {
      setIsVisible(false);
    }

    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, [context]);

  const animateIn = () => {
    setIsVisible(true);

    Animated.parallel([
      Animated.spring(opacity, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Announce for accessibility
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(context.bannerMessage);
    }, 500);

    // Schedule auto-dismiss if applicable
    if (context.shouldAutoDismiss) {
      dismissTimeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, context.autoDismissDelay * 1000);
    }
  };

  const handleDismiss = () => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      opacity.setValue(0);
      translateY.setValue(-20);
      onDismiss?.();
    });
  };

  const handleAction = () => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
    onAction?.();
    handleDismiss();
  };

  if (!isVisible || !context) return null;

  const bannerInfo = BannerTypeInfo[context.bannerType];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bannerInfo.backgroundColor },
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLabel={`${bannerInfo.accessibilityLabel}. ${context.bannerMessage}`}
    >
      {/* Icon */}
      <Ionicons
        name={bannerInfo.icon}
        size={24}
        color={bannerInfo.iconColor}
        style={styles.icon}
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.message}>{context.bannerMessage}</Text>

        {/* Action button */}
        {context.hasActionButton && onAction && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: bannerInfo.iconColor }]}
            onPress={handleAction}
            accessibilityLabel={context.actionButtonTitle}
            accessibilityHint="Opens rest day check-in options"
          >
            <Text style={styles.actionButtonText}>{context.actionButtonTitle}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dismiss button */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={handleDismiss}
        accessibilityLabel="Dismiss"
        accessibilityHint="Dismisses this notification banner"
      >
        <Ionicons name="close" size={16} color="#8E8E93" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    lineHeight: 22,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  dismissButton: {
    padding: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    marginLeft: 8,
  },
});
