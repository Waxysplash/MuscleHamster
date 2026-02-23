/**
 * HamsterPortrait.js
 * Image-based hamster portrait for home screen
 * Uses composite "wearing" images when items are equipped
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { getHamsterWithEquipment } from '../config/AssetImages';

export default function HamsterPortrait({
  state = 'happy',
  size = 200,
  equippedOutfit = null,
  equippedAccessory = null,
}) {
  // Get the right hamster image (with outfit/accessory if equipped)
  const hamsterImage = getHamsterWithEquipment(state, equippedOutfit, equippedAccessory);

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel={`Your hamster is feeling ${state}`}
      accessibilityRole="image"
    >
      <Image
        source={hamsterImage}
        style={[styles.hamsterImage, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end', // Align hamster to bottom
    alignItems: 'center',
  },
  hamsterImage: {
    // Image fills the container
  },
});
