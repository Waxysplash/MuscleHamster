// Steps Card - today's steps on Home, with bonus points at step milestones.
// Renders nothing on devices that can't count steps (Android for now).
// PRIVACY: never send step counts to analytics (Apple §5.1.3(i)).
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, AppState, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useActivity } from '../context/ActivityContext';
import { StepMilestones } from '../models/Activity';
import StepService, { StepPermission } from '../services/StepService';
import { StoryCard, StoryButton, StoryIcon } from './ui/Story';
import { Colors, Fonts, Outline, T } from '../config/theme';

const ACCENT = '#1A7F91'; // darker teal: readable as text and behind white

const formatSteps = (n) => (n || 0).toLocaleString('en-US');

export default function StepsCard({ hamsterName = 'your hamster' }) {
  const { stats, recordStepMilestones } = useActivity();
  const [permission, setPermission] = useState(null); // null = still checking
  const [steps, setSteps] = useState(null);
  const [celebration, setCelebration] = useState(null);

  const baseStepsRef = useRef(0);
  const awardingRef = useRef(false);

  const today = new Date().toDateString();
  const awardedToday =
    stats?.stepMilestones?.date === today ? stats.stepMilestones.awarded || [] : [];

  // Read today's total and keep it live while Home is on screen.
  const refresh = useCallback(async () => {
    const status = await StepService.getPermission();
    setPermission(status);
    if (status !== StepPermission.GRANTED) return null;
    const todaySteps = await StepService.getTodaySteps();
    if (todaySteps !== null) {
      baseStepsRef.current = todaySteps;
      setSteps(todaySteps);
    }
    return todaySteps;
  }, []);

  useFocusEffect(
    useCallback(() => {
      let subscription = null;
      let cancelled = false;

      refresh().then((todaySteps) => {
        if (cancelled || todaySteps === null) return;
        subscription = StepService.watch((sinceSubscribed) => {
          setSteps(baseStepsRef.current + sinceSubscribed);
        });
      });

      const appStateSub = AppState.addEventListener('change', (next) => {
        if (next === 'active') {
          // Re-read the true total (covers steps walked while the app was closed).
          subscription?.remove();
          subscription = null;
          refresh().then((todaySteps) => {
            if (cancelled || todaySteps === null) return;
            subscription = StepService.watch((sinceSubscribed) => {
              setSteps(baseStepsRef.current + sinceSubscribed);
            });
          });
        }
      });

      return () => {
        cancelled = true;
        subscription?.remove();
        appStateSub.remove();
      };
    }, [refresh])
  );

  // Pay out any milestone that was just reached.
  useEffect(() => {
    if (steps === null || awardingRef.current) return;
    const due = StepMilestones.some((m) => steps >= m.steps && !awardedToday.includes(m.id));
    if (!due) return;

    awardingRef.current = true;
    recordStepMilestones(steps)
      .then((result) => {
        if (result?.awarded?.length) {
          const top = result.awarded[result.awarded.length - 1];
          setCelebration(`${top.label}! +${result.pointsEarned} points for ${hamsterName}`);
        }
      })
      .catch(() => {})
      .finally(() => {
        awardingRef.current = false;
      });
  }, [steps, awardedToday, recordStepMilestones, hamsterName]);

  const handleTurnOn = async () => {
    const status = await StepService.requestPermission();
    setPermission(status);
    if (status === StepPermission.GRANTED) refresh();
  };

  // Not supported on this device, or still checking: show nothing.
  if (permission === null || permission === StepPermission.UNAVAILABLE) return null;

  // First time: invite them to turn it on.
  if (permission === StepPermission.UNDETERMINED) {
    return (
      <StoryCard color={Colors.sky} containerStyle={styles.gap}>
        <View style={styles.row}>
          <StoryIcon name="walk" art="steps" color={Colors.surface} />
          <View style={styles.rowText}>
            <Text style={T.heading}>Count your steps</Text>
            <Text style={[T.small, { color: Colors.text }]}>Walking earns bonus points for {hamsterName}</Text>
          </View>
        </View>
        <StoryButton
          title="Turn on"
          variant="secondary"
          size="sm"
          style={{ marginTop: 12 }}
          accessibilityLabel="Turn on step counter"
          accessibilityHint="Lets walking earn points for your hamster"
          onPress={handleTurnOn}
        />
      </StoryCard>
    );
  }

  // Said no: gentle pointer to Settings, no pressure.
  if (permission === StepPermission.DENIED) {
    return (
      <StoryCard color={Colors.surface} containerStyle={styles.gap}>
        <Pressable
          style={styles.row}
          onPress={() => Platform.OS === 'ios' && Linking.openSettings()}
          accessibilityRole="button"
          accessibilityLabel="Step counter is off. Open Settings to turn on Motion and Fitness."
        >
          <StoryIcon name="walk" art="steps" color={Colors.sand} />
          <View style={styles.rowText}>
            <Text style={T.heading}>Step counter is off</Text>
            <Text style={T.small}>Turn on Motion & Fitness in Settings anytime</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={Colors.ink} />
        </Pressable>
      </StoryCard>
    );
  }

  // Granted: show today's steps and progress to the next milestone.
  const current = steps || 0;
  const next = StepMilestones.find((m) => current < m.steps);
  const prevSteps = next
    ? StepMilestones[StepMilestones.indexOf(next) - 1]?.steps || 0
    : StepMilestones[StepMilestones.length - 1].steps;
  const progress = next ? (current - prevSteps) / (next.steps - prevSteps) : 1;

  return (
    <StoryCard color={Colors.sky} containerStyle={styles.gap}>
      <View
        accessible
        accessibilityLabel={`${formatSteps(current)} steps today. ${
          next ? `${formatSteps(next.steps - current)} steps to ${next.label}.` : 'All step bonuses earned today.'
        }`}
      >
        <View style={styles.row}>
          <StoryIcon name="walk" art="steps" color={Colors.surface} />
          <View style={styles.rowText}>
            <View style={styles.headerRow}>
              <Text style={T.title}>{formatSteps(current)}</Text>
              <Text style={[T.small, { color: Colors.text }]}>steps today</Text>
            </View>
          </View>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
        </View>

        <Text style={[T.small, { color: Colors.text, marginTop: 8 }]}>
          {celebration
            ? celebration
            : next
            ? `${formatSteps(next.steps - current)} more to ${next.label} (+${next.points})`
            : `All step bonuses earned today. ${hamsterName} is impressed!`}
        </Text>

        <View style={styles.milestoneRow}>
          {StepMilestones.map((m) => {
            const done = awardedToday.includes(m.id) || current >= m.steps;
            return (
              <View key={m.id} style={[styles.chip, done && styles.chipDone]}>
                {done ? <Ionicons name="checkmark" size={14} color={Colors.ink} /> : null}
                <Text style={styles.chipText}>
                  {m.steps >= 1000 ? `${m.steps / 1000}k` : m.steps}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1, marginLeft: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  track: {
    height: 14,
    borderRadius: 7,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
    marginTop: 12,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: Colors.brand },
  milestoneRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
  },
  chipDone: { backgroundColor: Colors.brand },
  chipText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink },
});
