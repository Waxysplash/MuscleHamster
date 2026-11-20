// SetLogger - fast set logging for one exercise (Storybook redesign, Nov 2026)
// From the design canvas proposal "Exercise + log sets":
// - "Last time" card, and today's sets start from last time's numbers
// - +/- steppers (you can still tap the number and type)
// - "Add a set like the last one"
// - Rest timer, lb/kg switch (remembered), notes
// Used by the gym and At Home exercise pages. The parent saves the entry.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StoryCard, StoryButton } from './ui/Story';
import { Colors, Fonts, Outline } from '../config/theme';

const UNIT_KEY = 'mh_weight_unit';
const REST_CHOICES = [60, 90, 120];
const LB_PER_KG = 2.20462;

const toNum = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};
const tidy = (n) => String(Math.round(n * 10) / 10);
const unitOf = (set) => (set?.unit === 'kg' ? 'kg' : 'lb'); // old entries have no unit: they were lb

// Convert a stored set's weight into the unit on screen
export const weightIn = (set, unit) => {
  const w = toNum(set?.weight);
  if (!w) return 0;
  const from = unitOf(set);
  if (from === unit) return w;
  return unit === 'kg' ? w / LB_PER_KG : w * LB_PER_KG;
};

// "3 sets × 10 at 95 lb" (or "3 sets × 12" with no weight)
export const summarizeEntry = (entry, unit = 'lb') => {
  const sets = (entry?.sets || []).filter((s) => toNum(s.reps) || toNum(s.weight));
  if (sets.length === 0) return null;
  const reps = sets.map((s) => toNum(s.reps));
  const sameReps = reps.every((r) => r === reps[0]);
  const top = Math.max(...sets.map((s) => weightIn(s, unit)));
  const rounded = unit === 'kg' ? Math.round(top * 2) / 2 : Math.round(top);
  const repText = sameReps ? `${reps[0]}` : `${Math.min(...reps)}–${Math.max(...reps)}`;
  return `${sets.length} ${sets.length === 1 ? 'set' : 'sets'} × ${repText}${top ? ` at ${tidy(rounded)} ${unit}` : ''}`;
};

const whenLabel = (dateString) => {
  const d = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  const diff = Math.round((today - day) / 86400000);
  if (diff === 0) return 'Earlier today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatClock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function Stepper({ value, onChange, step, unitLabel, emptyLabel, label, flex = 1 }) {
  const n = toNum(value);
  const change = (delta) => onChange(tidy(Math.max(0, n + delta)));
  return (
    <View style={[styles.field, { flex }]}>
      <Pressable style={styles.stepBtn} onPress={() => change(-step)} accessibilityRole="button" accessibilityLabel={`Less ${label}`} hitSlop={4}>
        <Text style={styles.stepText}>−</Text>
      </Pressable>
      <View style={styles.valueBox}>
        <TextInput
          style={styles.valueInput}
          value={n === 0 && emptyLabel ? '' : String(value)}
          placeholder={emptyLabel || '0'}
          placeholderTextColor={Colors.textSecondary}
          onChangeText={(t) => onChange(t.replace(/[^0-9.,]/g, ''))}
          keyboardType="decimal-pad"
          selectTextOnFocus
          accessibilityLabel={label}
        />
        {!(n === 0 && emptyLabel) ? <Text style={styles.unit}>{unitLabel}</Text> : null}
      </View>
      <Pressable style={styles.stepBtn} onPress={() => change(step)} accessibilityRole="button" accessibilityLabel={`More ${label}`} hitSlop={4}>
        <Text style={styles.stepText}>+</Text>
      </Pressable>
    </View>
  );
}

export default function SetLogger({
  lastEntry,
  weightOptional = false, // At Home: weight is optional ("No weight")
  defaultReps = 10,
  hamsterName = 'your hamster',
  onSave, // async ({ sets, notes }) => boolean (true = saved, clear the form)
}) {
  const [unit, setUnit] = useState('lb');
  const [sets, setSets] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [restLength, setRestLength] = useState(90);
  const [restLeft, setRestLeft] = useState(null); // null = timer not running
  const timerRef = useRef(null);

  // Remembered lb/kg choice
  useEffect(() => {
    AsyncStorage.getItem(UNIT_KEY).then((u) => u === 'kg' && setUnit('kg')).catch(() => {});
  }, []);

  // Start from last time's numbers
  const prefill = (u = unit) => {
    const last = (lastEntry?.sets || []).filter((s) => toNum(s.reps) || toNum(s.weight));
    if (last.length > 0) {
      return last.map((s) => {
        const w = weightIn(s, u);
        return { weight: w ? tidy(u === 'kg' ? Math.round(w * 2) / 2 : Math.round(w)) : '', reps: s.reps ? String(toNum(s.reps)) : '' };
      });
    }
    return [{ weight: '', reps: String(defaultReps) }];
  };

  useEffect(() => {
    setSets(prefill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastEntry?.id]);

  const switchUnit = (u) => {
    if (u === unit) return;
    // Convert what's already typed so 100 lb doesn't become 100 kg
    setSets((cur) =>
      cur.map((s) => {
        const w = toNum(s.weight);
        if (!w) return s;
        const conv = u === 'kg' ? w / LB_PER_KG : w * LB_PER_KG;
        return { ...s, weight: tidy(u === 'kg' ? Math.round(conv * 2) / 2 : Math.round(conv)) };
      })
    );
    setUnit(u);
    AsyncStorage.setItem(UNIT_KEY, u).catch(() => {});
  };

  // Rest timer
  useEffect(() => {
    if (restLeft === null) return undefined;
    if (restLeft <= 0) {
      Vibration.vibrate(400);
      setRestLeft(null);
      return undefined;
    }
    timerRef.current = setTimeout(() => setRestLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(timerRef.current);
  }, [restLeft]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const updateSet = (i, field, value) => setSets((cur) => cur.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  const removeSet = (i) => setSets((cur) => (cur.length > 1 ? cur.filter((_, idx) => idx !== i) : cur));
  const addLikeLast = () => setSets((cur) => [...cur, { ...(cur[cur.length - 1] || { weight: '', reps: String(defaultReps) }) }]);

  const validSets = useMemo(() => sets.filter((s) => toNum(s.reps) > 0 || toNum(s.weight) > 0), [sets]);
  const lastSummary = summarizeEntry(lastEntry, unit);
  const lastTop = lastEntry ? Math.max(0, ...(lastEntry.sets || []).map((s) => weightIn(s, unit))) : 0;
  const nudge = lastTop > 0
    ? `Felt good? Try ${tidy(unit === 'kg' ? Math.round(lastTop * 2) / 2 + 2.5 : Math.round(lastTop) + 5)} ${unit} today.`
    : lastSummary ? 'Felt good? Try one or two more reps today.' : null;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const clean = validSets.map((s) => ({
        weight: toNum(s.weight) ? tidy(toNum(s.weight)) : '',
        reps: toNum(s.reps) ? String(Math.round(toNum(s.reps))) : '',
        unit,
      }));
      const ok = await onSave({ sets: clean, notes: notes.trim() });
      if (ok) {
        setNotes('');
        setRestLeft(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const nothingToSave = validSets.length === 0 && !notes.trim();

  return (
    <View style={{ gap: 12 }}>
      {/* Unit */}
      <View style={styles.unitRow}>
        <Text style={styles.cardTitle}>Log your sets</Text>
        <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="radiogroup" accessibilityLabel="Weight unit">
          {['lb', 'kg'].map((u) => (
            <Pressable
              key={u}
              onPress={() => switchUnit(u)}
              style={[styles.pill, unit === u && { backgroundColor: Colors.brand }]}
              accessibilityRole="radio"
              accessibilityState={{ selected: unit === u }}
              accessibilityLabel={u === 'lb' ? 'Pounds' : 'Kilograms'}
            >
              <Text style={styles.pillText}>{u}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Last time */}
      {lastSummary ? (
        <StoryCard color={Colors.peach} shadow={false} style={{ paddingVertical: 12 }}>
          <Text style={styles.lastLabel}>Last time · {whenLabel(lastEntry.date)}</Text>
          <Text style={styles.lastValue}>{lastSummary}</Text>
          {nudge ? <Text style={styles.lastNudge}>{nudge}</Text> : null}
        </StoryCard>
      ) : (
        <StoryCard color={Colors.peach} shadow={false} style={{ paddingVertical: 12 }}>
          <Text style={styles.lastLabel}>First time</Text>
          <Text style={styles.lastNudge}>Start light. Pick a {weightOptional ? 'number of reps' : 'weight'} you can do with good form, then log it here.</Text>
        </StoryCard>
      )}

      {/* Today's sets */}
      <StoryCard>
        <Text style={[styles.cardTitle, { marginBottom: 4 }]}>Today's sets</Text>
        {sets.map((s, i) => (
          <View key={i} style={styles.setRow}>
            <Pressable
              onLongPress={() => removeSet(i)}
              style={styles.num}
              accessibilityRole="button"
              accessibilityLabel={`Set ${i + 1}`}
              accessibilityHint={sets.length > 1 ? 'Long press to remove this set' : undefined}
            >
              <Text style={styles.numText}>{i + 1}</Text>
            </Pressable>
            <Stepper
              value={s.weight}
              onChange={(v) => updateSet(i, 'weight', v)}
              step={unit === 'kg' ? 2.5 : 5}
              unitLabel={unit}
              emptyLabel={weightOptional ? 'No weight' : undefined}
              label={`weight for set ${i + 1}`}
            />
            <Stepper
              value={s.reps}
              onChange={(v) => updateSet(i, 'reps', v)}
              step={1}
              unitLabel="reps"
              label={`reps for set ${i + 1}`}
              flex={0.8}
            />
            {sets.length > 1 ? (
              <Pressable onPress={() => removeSet(i)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Remove set ${i + 1}`}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        ))}
        <Pressable style={styles.addLike} onPress={addLikeLast} accessibilityRole="button">
          <Text style={styles.addLikeText}>+ Add a set like the last one</Text>
        </Pressable>
      </StoryCard>

      {/* Rest timer */}
      <View style={styles.rest}>
        <Ionicons name="timer-outline" size={22} color={Colors.ink} />
        <View style={{ flex: 1 }}>
          <Text style={styles.restTitle}>Rest timer</Text>
          {restLeft === null ? (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              {REST_CHOICES.map((sec) => (
                <Pressable
                  key={sec}
                  onPress={() => setRestLength(sec)}
                  style={[styles.restChip, restLength === sec && { backgroundColor: Colors.surface }]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: restLength === sec }}
                  accessibilityLabel={`${sec} seconds`}
                >
                  <Text style={styles.restChipText}>{formatClock(sec)}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.restSub}>Breathe. Next set when it hits zero.</Text>
          )}
        </View>
        <Pressable
          onPress={() => setRestLeft(restLeft === null ? restLength : null)}
          style={styles.restGo}
          accessibilityRole="button"
          accessibilityLabel={restLeft === null ? `Start ${restLength} second rest` : `Stop rest timer, ${restLeft} seconds left`}
        >
          <Text style={styles.restClock}>{restLeft === null ? 'Start' : formatClock(restLeft)}</Text>
        </Pressable>
      </View>

      {/* Notes */}
      <TextInput
        style={styles.notes}
        placeholder="Notes (optional): how did it feel?"
        placeholderTextColor={Colors.textSecondary}
        value={notes}
        onChangeText={setNotes}
        multiline
        accessibilityLabel="Notes"
      />

      <StoryButton
        title={saving ? 'Saving...' : validSets.length > 0 ? `Save ${validSets.length} ${validSets.length === 1 ? 'set' : 'sets'} · points for ${hamsterName}` : 'Save note'}
        icon="checkmark"
        onPress={handleSave}
        disabled={saving || nothingToSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  unitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.ink },
  pill: {
    minHeight: 36,
    minWidth: 48,
    paddingHorizontal: 14,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  pillText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink },
  lastLabel: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.brown },
  lastValue: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.ink, marginTop: 2 },
  lastNudge: { fontFamily: Fonts.body, fontSize: 14, color: Colors.ink, marginTop: 2 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E5DDD5',
    borderStyle: 'dashed',
  },
  num: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.ink },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 2,
  },
  stepBtn: { width: 34, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: Fonts.bodyHeavy, fontSize: 20, color: Colors.ink },
  valueBox: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  valueInput: { fontFamily: Fonts.bodyHeavy, fontSize: 17, color: Colors.ink, textAlign: 'center', padding: 0, minWidth: 24 },
  unit: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.textSecondary, marginLeft: 3 },
  addLike: {
    minHeight: 44,
    marginTop: 10,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLikeText: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.ink },
  rest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.sky,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  restTitle: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink },
  restSub: { fontFamily: Fonts.body, fontSize: 14, color: Colors.ink },
  restChip: { borderWidth: 2, borderColor: Colors.ink, borderRadius: 999, paddingHorizontal: 10, minHeight: 30, justifyContent: 'center' },
  restChipText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.ink },
  restGo: {
    minWidth: 72,
    minHeight: 44,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  restClock: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.ink },
  notes: {
    minHeight: 64,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    padding: 12,
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.ink,
    textAlignVertical: 'top',
  },
});
