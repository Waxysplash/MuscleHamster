/**
 * HamsterView.js
 * Image-based hamster character with emotion states
 * Uses actual artwork instead of SVG rendering
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated, AccessibilityInfo } from 'react-native';

// Import hamster state images
const hamsterImages = {
  happy: require('../../assets/hamster/states/Neutral.png'),
  chillin: require('../../assets/hamster/states/Relaxed.png'),
  hungry: require('../../assets/hamster/states/hungry.png'),
  sad: require('../../assets/hamster/states/sad.png'),
};

// Fallback to happy/neutral if state not found
const getHamsterImage = (state) => {
  return hamsterImages[state] || hamsterImages.happy;
};

export default function HamsterView({
  state = 'happy',
  size = 150,
  showHeadband = true,
  equippedOutfit = null,
  equippedAccessory = null,
}) {
  const [reduceMotion, setReduceMotion] = useState(false);

  // Animation values
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Check for reduced motion preference
  useEffect(() => {
    const checkReducedMotion = async () => {
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      setReduceMotion(isReduceMotionEnabled);
    };
    checkReducedMotion();

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  // Breathing animation - gentle scale
  useEffect(() => {
    if (reduceMotion) return;

    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();

    return () => breathe.stop();
  }, [reduceMotion, breatheAnim]);

  // Bounce animation for happy state
  useEffect(() => {
    if (reduceMotion || state !== 'happy') {
      bounceAnim.setValue(0);
      return;
    }

    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -5,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    bounce.start();

    return () => bounce.stop();
  }, [reduceMotion, state, bounceAnim]);

  const hamsterImage = getHamsterImage(state);

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size },
        {
          transform: [
            { scale: breatheAnim },
            { translateY: bounceAnim },
          ],
        },
      ]}
      accessibilityLabel={`Your hamster is feeling ${state}`}
      accessibilityRole="image"
    >
      <Image
        source={hamsterImage}
        style={[styles.hamsterImage, { width: size, height: size }]}
        resizeMode="contain"
      />

      {/* Overlay for equipped items - can be expanded later */}
      {equippedAccessory && (
        <View style={styles.accessoryOverlay}>
          {/* Accessory images can be overlaid here */}
        </View>
      )}

      {equippedOutfit && (
        <View style={styles.outfitOverlay}>
          {/* Outfit images can be overlaid here */}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamsterImage: {
    // Image fills the container
  },
  accessoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  outfitOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
