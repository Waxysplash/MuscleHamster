// Hold Timer - a simple countdown for seconds-based moves (plank, wall sit, high knees...)
// so beginners don't have to count in their heads. Buzzes 3-2-1 and at the end.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { StoryButton } from './ui/Story';
import { Colors, Fonts } from '../config/theme';

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
      <StoryButton
        variant="secondary"
        size="sm"
        icon={running ? 'pause' : 'play'}
        title={running ? 'Pause' : finished ? 'Again' : remaining < seconds ? 'Keep going' : 'Start timer'}
        accessibilityLabel={running ? 'Pause timer' : finished ? 'Start the timer again' : 'Start timer'}
        onPress={running ? pause : start}
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 16 },
  time: { fontFamily: Fonts.heading, fontSize: 44, color: Colors.ink },
});
