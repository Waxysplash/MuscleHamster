/**
 * HamsterPortrait.js
 * Image-based hamster portrait for home screen
 * Uses actual artwork with emotion states
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

export default function HamsterPortrait({
  state = 'happy',
  size = 200,
  showHeadband = true,
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
          toValue: 1.02,
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
});
