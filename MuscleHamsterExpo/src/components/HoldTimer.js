// Hold Timer - a simple countdown for seconds-based moves (plank, wall sit, high knees...)
// so beginners don't have to count in their heads. Buzzes 3-2-1 and at the end.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HoldTimer({ seconds, onDone }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => () => clearInterval(ref.current), []);
  useEffect(() => { setRemaining(seconds); }, [seconds]);

  const start = () => {
    clearInterval(ref.current);
    let left = remaining > 0 ? remaining : seconds;
    setRemaining(left);
    setRunning(true);
    ref.current = setInterval(() => {
      left -= 1;
      setRemaining(left);
      if (left > 0 && left <= 3) Vibration.vibrate(60);
      if (left <= 0) {
        clearInterval(ref.current);
        Vibration.vibrate(400);
        setRunning(false);
        onDone?.();
      }
    }, 1000);
  };

  const pause = () => {
    clearInterval(ref.current);
    setRunning(false);
  };

  const finished = remaining <= 0;

  return (
    <View style={styles.wrap}>
      <Text style={styles.time} accessibilityLiveRegion="polite" accessibilityLabel={`${remaining} seconds left`}>
        {finished ? 'Done!' : `${remaining}s`}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={running ? pause : start}
        accessibilityRole="button"
        accessibilityLabel={running ? 'Pause timer' : finished ? 'Start the timer again' : 'Start timer'}
      >
        <Ionicons name={running ? 'pause' : 'play'} size={20} color="#fff" />
        <Text style={styles.buttonText}>
          {running ? 'Pause' : finished ? 'Again' : remaining < seconds ? 'Keep going' : 'Start timer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 16 },
  time: { fontSize: 40, fontWeight: '700', color: '#4A3728' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8B5A2B',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 12,
    minHeight: 48,
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
