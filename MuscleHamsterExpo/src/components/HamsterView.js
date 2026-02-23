/**
 * HamsterView.js
 * Image-based hamster character with emotion states
 * Uses composite "wearing" images when items are equipped
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import { getHamsterWithEquipment } from '../config/AssetImages';

export default function HamsterView({
  state = 'happy',
  size = 150,
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

  // Get the right hamster image (with outfit/accessory if equipped)
  const hamsterImage = getHamsterWithEquipment(state, equippedOutfit, equippedAccessory);

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
