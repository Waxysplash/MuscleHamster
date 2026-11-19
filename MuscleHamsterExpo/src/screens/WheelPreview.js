/**
 * WheelPreview.js
 * Quick preview screen for the wheel running animation
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import WheelRunningView from '../components/WheelRunningView';

export default function WheelPreview() {
  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#7FB7C2', '#5E9E4F', '#A8E6CF']}
        style={styles.background}
      >
        <Text style={styles.title}>MuscleHamster</Text>
        <Text style={styles.subtitle}>Running on the wheel!</Text>

        <View style={styles.enclosure}>
          <LinearGradient
            colors={['#7FB7C2', '#B8E6F0', '#A8E6CF']}
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
    fontFamily: 'Quicksand_700Bold', fontSize: 28,
    color: '#2D2D2D',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  enclosure: {
    width: 320,
    height: 340,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#7FB7C2',
    shadowColor: '#4A3728',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 2.5,
    borderColor: '#4A3728',
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
    backgroundColor: '#B85A00',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontFamily: 'Nunito_600SemiBold', fontSize: 14,
  },
  caption: {
    marginTop: 12,
    fontFamily: 'Nunito_400Regular', fontSize: 15,
    color: '#555',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
