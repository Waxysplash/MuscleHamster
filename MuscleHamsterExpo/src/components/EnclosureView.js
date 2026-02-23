/**
 * EnclosureView.js
 * Hamster enclosure/habitat with background and decorations
 * Uses real artwork from assets/images/
 */

import React from 'react';
import { View, Image, StyleSheet, ImageBackground } from 'react-native';
import HamsterView from './HamsterView';
import { EnclosureBackground, EnclosureItemImages } from '../config/AssetImages';

export default function EnclosureView({
  hamsterState = 'happy',
  width = 300,
  height = 250,
  placedItems = [],
  equippedOutfit = null,
  equippedAccessory = null,
}) {
  const hamsterSize = Math.min(width * 0.5, height * 0.6);

  // Check which enclosure items are placed
  const hasRainbowWheel = placedItems.includes('enc-1');
  const hasHammock = placedItems.includes('enc-2');
  const hasFairyLights = placedItems.includes('enc-8');

  // Item sizes relative to enclosure
  const itemSize = width * 0.25;
  const smallItemSize = width * 0.2;

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Background image */}
      <ImageBackground
        source={EnclosureBackground}
        style={[styles.background, { width, height }]}
        resizeMode="cover"
      >
        {/* Fairy lights at top */}
        {hasFairyLights && EnclosureItemImages['enc-8'] && (
          <View style={[styles.fairyLightsContainer, { width: width * 0.8 }]}>
            <Image
              source={EnclosureItemImages['enc-8']}
              style={styles.fairyLights}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Rainbow wheel on left */}
        {hasRainbowWheel && EnclosureItemImages['enc-1'] && (
          <View style={[styles.wheelContainer, { left: width * 0.02, bottom: height * 0.15 }]}>
            <Image
              source={EnclosureItemImages['enc-1']}
              style={{ width: itemSize, height: itemSize }}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Hammock on right */}
        {hasHammock && EnclosureItemImages['enc-2'] && (
          <View style={[styles.hammockContainer, { right: width * 0.02, top: height * 0.25 }]}>
            <Image
              source={EnclosureItemImages['enc-2']}
              style={{ width: smallItemSize, height: smallItemSize }}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Hamster (positioned in center-bottom of enclosure) */}
        <View style={[styles.hamsterWrapper, { bottom: height * 0.05 }]}>
          <HamsterView
            state={hamsterState}
            size={hamsterSize}
            equippedOutfit={equippedOutfit}
            equippedAccessory={equippedAccessory}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFF8E7',
  },
  background: {
    flex: 1,
  },
  hamsterWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fairyLightsContainer: {
    position: 'absolute',
    top: 5,
    alignSelf: 'center',
    height: 50,
  },
  fairyLights: {
    width: '100%',
    height: '100%',
  },
  wheelContainer: {
    position: 'absolute',
  },
  hammockContainer: {
    position: 'absolute',
  },
});
