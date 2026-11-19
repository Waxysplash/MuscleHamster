// Steps Card - today's steps on Home, with bonus points at step milestones.
// Renders nothing on devices that can't count steps (Android for now).
// PRIVACY: never send step counts to analytics (Apple §5.1.3(i)).
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useActivity } from '../context/ActivityContext';
import { StepMilestones } from '../models/Activity';
import StepService, { StepPermission } from '../services/StepService';

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
      <TouchableOpacity
        style={styles.card}
        onPress={handleTurnOn}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Turn on step counter"
        accessibilityHint="Lets walking earn points for your hamster"
      >
        <View style={styles.iconWrap}>
          <Ionicons name="walk" size={22} color={ACCENT} />
        </View>
        <View style={styles.inviteText}>
          <Text style={styles.title}>Count your steps</Text>
          <Text style={styles.subtitle}>Walking earns bonus points for {hamsterName}</Text>
        </View>
        <Text style={styles.turnOn}>Turn on</Text>
      </TouchableOpacity>
    );
  }

  // Said no: gentle pointer to Settings, no pressure.
  if (permission === StepPermission.DENIED) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => Platform.OS === 'ios' && Linking.openSettings()}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Step counter is off. Open Settings to turn on Motion and Fitness."
      >
        <View style={styles.iconWrap}>
          <Ionicons name="walk" size={22} color="#8E8E93" />
        </View>
        <View style={styles.inviteText}>
          <Text style={styles.title}>Step counter is off</Text>
          <Text style={styles.subtitle}>Turn on Motion & Fitness in Settings anytime</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </TouchableOpacity>
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
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${formatSteps(current)} steps today. ${
        next ? `${formatSteps(next.steps - current)} steps to ${next.label}.` : 'All step bonuses earned today.'
      }`}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="walk" size={22} color={ACCENT} />
      </View>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.stepsNumber}>{formatSteps(current)}</Text>
          <Text style={styles.stepsLabel}>steps today</Text>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
        </View>

        <Text style={styles.subtitle}>
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
                <Ionicons
                  name={done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={12}
                  color={done ? '#fff' : ACCENT}
                />
                <Text style={[styles.chipText, done && styles.chipTextDone]}>
                  {m.steps >= 1000 ? `${m.steps / 1000}k` : m.steps}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(48,176,199,0.18)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(48,176,199,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  inviteText: {
    flex: 1,
    marginLeft: 12,
  },
  body: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B5D52',
    marginTop: 4,
  },
  turnOn: {
    fontSize: 14,
    fontWeight: '700',
    color: ACCENT,
    marginLeft: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  stepsNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A3728',
  },
  stepsLabel: {
    fontSize: 14,
    color: '#6B5D52',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(48,176,199,0.15)',
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  milestoneRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(48,176,199,0.4)',
  },
  chipDone: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT,
  },
  chipTextDone: {
    color: '#fff',
  },
});
