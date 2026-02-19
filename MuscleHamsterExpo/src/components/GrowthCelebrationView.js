// Growth Celebration View - Phase 07.4
// Celebration modal shown when the hamster reaches a new growth stage

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  GrowthStage,
  GrowthStageInfo,
  GrowthTriggerType,
  getPreviousStage,
} from '../models/Growth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Confetti particle component
const ConfettiParticle = ({ delay, startX, color }) => {
  const animY = useRef(new Animated.Value(-50)).current;
  const animX = useRef(new Animated.Value(startX)).current;
  const animOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const wobbleX = Math.random() * 60 - 30;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(animY, {
          toValue: 600,
          duration: 3000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(animX, {
            toValue: startX + wobbleX,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(animX, {
            toValue: startX - wobbleX / 2,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(animOpacity, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        {
          backgroundColor: color,
          transform: [{ translateX: animX }, { translateY: animY }],
          opacity: animOpacity,
        },
      ]}
    />
  );
};

// Confetti container
const ConfettiView = () => {
  const colors = ['#FFD700', '#FF9500', '#FF2D55', '#AF52DE', '#5AC8FA', '#34C759'];
  const particles = [];

  for (let i = 0; i < 30; i++) {
    particles.push(
      <ConfettiParticle
        key={i}
        delay={i * 50}
        startX={Math.random() * SCREEN_WIDTH}
        color={colors[i % colors.length]}
      />
    );
  }

  return <View style={styles.confettiContainer} pointerEvents="none">{particles}</View>;
};

// Stage badge component
const StageBadge = ({ stage, isActive }) => {
  const info = GrowthStageInfo[stage];
  const color = isActive ? info.color : '#8E8E93';

  return (
    <View style={[
      styles.stageBadge,
      isActive && { backgroundColor: `${info.color}20`, borderColor: info.color },
    ]}>
      <Ionicons name={info.icon} size={20} color={color} />
      <Text style={[styles.stageBadgeText, { color }]}>{info.displayName}</Text>
    </View>
  );
};

export default function GrowthCelebrationView({
  visible,
  milestone,
  hamsterName,
  onDismiss,
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Animation values
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const hamsterScale = useRef(new Animated.Value(0.5)).current;
  const speechOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Check for reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  // Animate in when visible
  useEffect(() => {
    if (visible && milestone) {
      animateIn();
    } else {
      // Reset animations
      contentOpacity.setValue(0);
      hamsterScale.setValue(0.5);
      speechOpacity.setValue(0);
      buttonOpacity.setValue(0);
      setShowConfetti(false);
    }
  }, [visible, milestone]);

  const animateIn = () => {
    if (reduceMotion) {
      contentOpacity.setValue(1);
      hamsterScale.setValue(1);
      speechOpacity.setValue(1);
      buttonOpacity.setValue(1);
      return;
    }

    setShowConfetti(true);

    Animated.sequence([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(hamsterScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(speechOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (!visible || !milestone) return null;

  const stageInfo = GrowthStageInfo[milestone.stage];
  const previousStage = getPreviousStage(milestone.stage);
  const stageColor = stageInfo.color;

  const triggerDescription = milestone.triggerType === GrowthTriggerType.WORKOUTS
    ? `${milestone.triggerValue} workouts completed`
    : `${milestone.triggerValue} day streak`;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onDismiss}
    >
      <LinearGradient
        colors={[`${stageColor}50`, `${stageColor}20`]}
        style={styles.container}
      >
        {/* Confetti */}
        {showConfetti && !reduceMotion && <ConfettiView />}

        {/* Content */}
        <View style={styles.content}>
          {/* Headline */}
          <Animated.View style={[styles.headlineContainer, { opacity: contentOpacity }]}>
            <Ionicons name="sparkles" size={40} color="#FFD700" />
            <Text style={styles.headline}>
              <Text style={styles.hamsterNameText}>{hamsterName}</Text>
              {' '}
              <Text>{stageInfo.celebrationHeadline}</Text>
            </Text>
          </Animated.View>

          {/* Stage transition */}
          <Animated.View style={[styles.stageTransition, { opacity: contentOpacity }]}>
            {previousStage && (
              <>
                <StageBadge stage={previousStage} isActive={false} />
                <Ionicons name="arrow-forward" size={24} color="#8E8E93" style={styles.arrow} />
              </>
            )}
            <StageBadge stage={milestone.stage} isActive={true} />
          </Animated.View>

          {/* Hamster avatar */}
          <Animated.View style={[
            styles.hamsterContainer,
            { transform: [{ scale: hamsterScale }] },
          ]}>
            <View style={[styles.hamsterCircle, { backgroundColor: `${stageColor}30` }]}>
              <View style={[styles.hamsterInner, { backgroundColor: `${stageColor}50` }]}>
                <Ionicons name="paw" size={60} color={stageColor} />
              </View>
            </View>
          </Animated.View>

          {/* Speech bubble */}
          <Animated.View style={[styles.speechBubble, { opacity: speechOpacity }]}>
            <Text style={styles.speechText}>
              "{stageInfo.celebrationSpeech}"
            </Text>

            {/* Achievement info */}
            <View style={styles.achievementInfo}>
              <Ionicons
                name={milestone.triggerType === GrowthTriggerType.WORKOUTS ? 'fitness' : 'flame'}
                size={16}
                color="#8E8E93"
              />
              <Text style={styles.achievementText}>{triggerDescription}</Text>
            </View>
          </Animated.View>

          {/* Dismiss button */}
          <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: stageColor }]}
              onPress={onDismiss}
              accessibilityLabel="Hooray! Dismiss celebration"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Hooray!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confettiParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    color: '#000',
  },
  hamsterNameText: {
    color: '#007AFF',
  },
  stageTransition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stageBadgeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  arrow: {
    marginHorizontal: 12,
  },
  hamsterContainer: {
    marginBottom: 24,
  },
  hamsterCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamsterInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubble: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: '100%',
  },
  speechText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#000',
    lineHeight: 24,
  },
  achievementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  achievementText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 24,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
