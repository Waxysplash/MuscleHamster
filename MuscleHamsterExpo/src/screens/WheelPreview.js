/**
 * WheelPreview.js
 * Quick preview screen for the wheel running animation
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import WheelRunningView from '../components/WheelRunningView';

export default function WheelPreview() {
  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#87CEEB', '#4ECDC4', '#A8E6CF']}
        style={styles.background}
      >
        <Text style={styles.title}>MuscleHamster</Text>
        <Text style={styles.subtitle}>Running on the wheel!</Text>

        <View style={styles.enclosure}>
          <LinearGradient
            colors={['#87CEEB', '#B8E6F0', '#A8E6CF']}
            style={styles.enclosureBg}
          >
            <WheelRunningView size={260} />
          </LinearGradient>

          {/* Ground */}
          <View style={styles.ground} />
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Excited</Text>
        </View>

        <Text style={styles.caption}>
          "We're on a roll! Keep up the amazing work!"
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  enclosure: {
    width: 320,
    height: 340,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#87CEEB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  enclosureBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#C08050',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  badge: {
    marginTop: 20,
    backgroundColor: '#FF9500',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  caption: {
    marginTop: 12,
    fontSize: 15,
    color: '#555',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
