/**
 * WheelRunningView.js
 * Animated hamster running on exercise wheel
 * Spinning wheel, bobbing hamster, alternating legs, motion lines
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing, AccessibilityInfo } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Rect,
  Path,
  G,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Line,
} from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

// Colors matching HamsterView palette
const Colors = {
  furLight: '#F5A623',
  furMain: '#E08A2D',
  furDark: '#C46A1F',
  cream: '#FFF8E7',
  creamDark: '#F5E6D0',
  nose: '#FF8B9A',
  noseDark: '#E57283',
  mouth: '#C45C5C',
  eyeWhite: '#FFFFFF',
  eyeBlue: '#4A90D9',
  eyeBlueDark: '#2E5C8A',
  pupil: '#1C1C1E',
  earPink: '#FFB5B5',
  earPinkDark: '#E89999',
  headbandWhite: '#FFFFFF',
  headbandRed: '#E54B4B',
  outline: '#2D2D2D',
  blush: '#FFCDD2',
  // Wheel colors
  wheelRim: '#B0B0B0',
  wheelRimLight: '#D0D0D0',
  spoke: '#A0A0A0',
  hub: '#909090',
  stand: '#A0A0A0',
};

export default function WheelRunningView({ size = 250 }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  // Animation refs
  const wheelSpin = useRef(new Animated.Value(0)).current;
  const hamsterBob = useRef(new Animated.Value(0)).current;
  const legPhase = useRef(new Animated.Value(0)).current;
  const [legFrame, setLegFrame] = useState(false);

  const wheelSize = size * 0.8;
  const wheelR = wheelSize / 2;
  const cx = size / 2;
  const cy = size / 2;
  const hamsterScale = size * 0.0035;

  useEffect(() => {
    const check = async () => {
      const reduced = await AccessibilityInfo.isReduceMotionEnabled();
      setReduceMotion(reduced);
    };
    check();
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub?.remove();
  }, []);

  // Wheel spinning
  useEffect(() => {
    if (reduceMotion) return;
    const spin = Animated.loop(
      Animated.timing(wheelSpin, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [reduceMotion]);

  // Hamster bob
  useEffect(() => {
    if (reduceMotion) return;
    const bob = Animated.loop(
      Animated.sequence([
        Animated.timing(hamsterBob, {
          toValue: 1,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(hamsterBob, {
          toValue: 0,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    bob.start();
    return () => bob.stop();
  }, [reduceMotion]);

  // Leg alternation
  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setLegFrame((prev) => !prev);
    }, 130);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const wheelRotation = wheelSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bobOffset = hamsterBob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const spokeCount = 8;
  const spokes = [];
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i * 360) / spokeCount;
    const rad = (angle * Math.PI) / 180;
    const x1 = cx + Math.cos(rad) * (wheelR * 0.15);
    const y1 = cy + Math.sin(rad) * (wheelR * 0.15);
    const x2 = cx + Math.cos(rad) * (wheelR * 0.88);
    const y2 = cy + Math.sin(rad) * (wheelR * 0.88);
    spokes.push(
      <Line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={Colors.spoke}
        strokeWidth={1.5}
        opacity={0.6}
      />
    );
  }

  // Hamster positioned in lower center of wheel
  const hamsterCX = cx + 2;
  const hamsterCY = cy + wheelR * 0.15;
  const s = hamsterScale;

  // Leg positions based on frame
  const frontLegAngle1 = legFrame ? -50 : -10;
  const frontLegAngle2 = legFrame ? -10 : -50;
  const backLegAngle1 = legFrame ? -40 : 20;
  const backLegAngle2 = legFrame ? 20 : -40;

  return (
    <View
      style={[styles.container, { width: size, height: size * 1.15 }]}
      accessible
      accessibilityLabel="Hamster running on exercise wheel"
    >
      <Svg width={size} height={size * 1.15} viewBox={`0 0 ${size} ${size * 1.15}`}>
        <Defs>
          <RadialGradient id="wFurGrad" cx="50%" cy="30%" r="70%">
            <Stop offset="0%" stopColor={Colors.furLight} />
            <Stop offset="50%" stopColor={Colors.furMain} />
            <Stop offset="100%" stopColor={Colors.furDark} />
          </RadialGradient>
          <RadialGradient id="wBellyGrad" cx="50%" cy="30%" r="60%">
            <Stop offset="0%" stopColor={Colors.cream} />
            <Stop offset="100%" stopColor={Colors.creamDark} />
          </RadialGradient>
          <LinearGradient id="wEarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={Colors.earPink} />
            <Stop offset="100%" stopColor={Colors.earPinkDark} />
          </LinearGradient>
          <RadialGradient id="wEyeGrad" cx="50%" cy="30%" r="60%">
            <Stop offset="0%" stopColor={Colors.eyeBlue} />
            <Stop offset="100%" stopColor={Colors.eyeBlueDark} />
          </RadialGradient>
          <LinearGradient id="wRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={Colors.wheelRimLight} />
            <Stop offset="50%" stopColor={Colors.wheelRim} />
            <Stop offset="100%" stopColor={Colors.wheelRimLight} />
          </LinearGradient>
        </Defs>

        {/* ===== STAND (behind wheel) ===== */}
        <G>
          {/* Left leg */}
          <Path
            d={`M ${cx - 5} ${cy + 2} L ${cx - wheelR * 0.4} ${size * 1.08} L ${cx - wheelR * 0.33} ${size * 1.08} L ${cx - 1} ${cy + 2} Z`}
            fill={Colors.stand}
          />
          {/* Right leg */}
          <Path
            d={`M ${cx + 1} ${cy + 2} L ${cx + wheelR * 0.33} ${size * 1.08} L ${cx + wheelR * 0.4} ${size * 1.08} L ${cx + 5} ${cy + 2} Z`}
            fill={Colors.stand}
          />
          {/* Base */}
          <Rect
            x={cx - wheelR * 0.45}
            y={size * 1.06}
            width={wheelR * 0.9}
            height={size * 0.04}
            rx={3}
            fill={Colors.stand}
          />
        </G>

        {/* ===== SPINNING WHEEL ===== */}
        <AnimatedG
          style={{
            transform: [{ rotate: wheelRotation }],
          }}
          origin={`${cx}, ${cy}`}
        >
          {/* Outer rim */}
          <Circle
            cx={cx}
            cy={cy}
            r={wheelR}
            fill="none"
            stroke="url(#wRimGrad)"
            strokeWidth={wheelR * 0.1}
          />
          {/* Inner tread */}
          <Circle
            cx={cx}
            cy={cy}
            r={wheelR * 0.9}
            fill="none"
            stroke={Colors.wheelRim}
            strokeWidth={1}
            opacity={0.3}
          />
          {/* Spokes */}
          {spokes}
          {/* Hub */}
          <Circle cx={cx} cy={cy} r={wheelR * 0.1} fill={Colors.wheelRimLight} />
          <Circle cx={cx} cy={cy} r={wheelR * 0.05} fill={Colors.hub} />
        </AnimatedG>

        {/* ===== MOTION LINES ===== */}
        {!reduceMotion && (
          <G opacity={0.25}>
            <Line
              x1={cx - wheelR - 15}
              y1={cy - 8}
              x2={cx - wheelR - 5}
              y2={cy - 8}
              stroke={Colors.outline}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Line
              x1={cx - wheelR - 20}
              y1={cy}
              x2={cx - wheelR - 6}
              y2={cy}
              stroke={Colors.outline}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Line
              x1={cx - wheelR - 15}
              y1={cy + 8}
              x2={cx - wheelR - 5}
              y2={cy + 8}
              stroke={Colors.outline}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </G>
        )}

        {/* ===== HAMSTER (on top of wheel, not rotating) ===== */}
        <Animated.View style={{ transform: [{ translateY: bobOffset }] }}>
          <Svg width={size} height={size * 1.15} viewBox={`0 0 ${size} ${size * 1.15}`}>
            <G transform={`translate(${hamsterCX}, ${hamsterCY}) scale(${s})`}>

              {/* Back legs */}
              <G>
                <Ellipse
                  cx={-14}
                  cy={22}
                  rx={5}
                  ry={12}
                  fill={Colors.furMain}
                  stroke={Colors.outline}
                  strokeWidth={1.5}
                  transform={`rotate(${backLegAngle1}, -14, 22)`}
                />
                <Ellipse
                  cx={-5}
                  cy={22}
                  rx={5}
                  ry={12}
                  fill={Colors.furMain}
                  stroke={Colors.outline}
                  strokeWidth={1.5}
                  transform={`rotate(${backLegAngle2}, -5, 22)`}
                />
              </G>

              {/* Body (tilted forward) */}
              <Ellipse
                cx={0}
                cy={4}
                rx={22}
                ry={17}
                fill="url(#wFurGrad)"
                stroke={Colors.outline}
                strokeWidth={2}
                transform="rotate(-8, 0, 4)"
              />

              {/* Belly */}
              <Ellipse
                cx={0}
                cy={6}
                rx={14}
                ry={11}
                fill="url(#wBellyGrad)"
                transform="rotate(-8, 0, 6)"
              />

              {/* Front arms */}
              <G>
                <Ellipse
                  cx={12}
                  cy={10}
                  rx={4}
                  ry={10}
                  fill={Colors.furMain}
                  stroke={Colors.outline}
                  strokeWidth={1.5}
                  transform={`rotate(${frontLegAngle1}, 12, 10)`}
                />
                <Ellipse
                  cx={18}
                  cy={10}
                  rx={4}
                  ry={10}
                  fill={Colors.furMain}
                  stroke={Colors.outline}
                  strokeWidth={1.5}
                  transform={`rotate(${frontLegAngle2}, 18, 10)`}
                />
              </G>

              {/* Head */}
              <Circle
                cx={14}
                cy={-14}
                r={16}
                fill="url(#wFurGrad)"
                stroke={Colors.outline}
                strokeWidth={2}
              />

              {/* Ears */}
              <G>
                <Ellipse cx={4} cy={-28} rx={5} ry={7} fill={Colors.furMain} stroke={Colors.outline} strokeWidth={1.5} transform="rotate(-15, 4, -28)" />
                <Ellipse cx={4} cy={-27} rx={3} ry={4.5} fill="url(#wEarGrad)" transform="rotate(-15, 4, -27)" />
                <Ellipse cx={20} cy={-28} rx={5} ry={7} fill={Colors.furMain} stroke={Colors.outline} strokeWidth={1.5} transform="rotate(10, 20, -28)" />
                <Ellipse cx={20} cy={-27} rx={3} ry={4.5} fill="url(#wEarGrad)" transform="rotate(10, 20, -27)" />
              </G>

              {/* Cheeks */}
              <G>
                <Ellipse cx={2} cy={-8} rx={10} ry={7} fill={Colors.cream} />
                <Ellipse cx={26} cy={-8} rx={10} ry={7} fill={Colors.cream} />
                <Ellipse cx={1} cy={-5} rx={4} ry={2.5} fill={Colors.blush} opacity={0.5} />
                <Ellipse cx={27} cy={-5} rx={4} ry={2.5} fill={Colors.blush} opacity={0.5} />
              </G>

              {/* Eyes - determined running look */}
              <G>
                {/* Left eye */}
                <Circle cx={7} cy={-15} r={5} fill={Colors.eyeWhite} stroke={Colors.outline} strokeWidth={1.5} />
                <Circle cx={7} cy={-15} r={3.5} fill="url(#wEyeGrad)" />
                <Circle cx={7} cy={-15} r={1.8} fill={Colors.pupil} />
                <Circle cx={5.5} cy={-16.5} r={1.5} fill={Colors.eyeWhite} />
                {/* Right eye */}
                <Circle cx={21} cy={-15} r={5} fill={Colors.eyeWhite} stroke={Colors.outline} strokeWidth={1.5} />
                <Circle cx={21} cy={-15} r={3.5} fill="url(#wEyeGrad)" />
                <Circle cx={21} cy={-15} r={1.8} fill={Colors.pupil} />
                <Circle cx={19.5} cy={-16.5} r={1.5} fill={Colors.eyeWhite} />
              </G>

              {/* Nose */}
              <Ellipse cx={14} cy={-8} rx={3} ry={2.2} fill={Colors.nose} stroke={Colors.outline} strokeWidth={1} />
              <Ellipse cx={13} cy={-8.5} rx={1} ry={0.7} fill={Colors.eyeWhite} opacity={0.6} />

              {/* Mouth - open smile */}
              <Path
                d="M 9 -4 Q 14 2, 19 -4"
                fill={Colors.mouth}
                stroke={Colors.outline}
                strokeWidth={1.2}
                strokeLinecap="round"
              />
              {/* Teeth */}
              <Path
                d="M 11 -4 L 11 -2 Q 12.5 -1.5, 14 -2 L 14 -4"
                fill={Colors.eyeWhite}
                stroke={Colors.outline}
                strokeWidth={0.4}
              />
              <Path
                d="M 14 -4 L 14 -2 Q 15.5 -1.5, 17 -2 L 17 -4"
                fill={Colors.eyeWhite}
                stroke={Colors.outline}
                strokeWidth={0.4}
              />

              {/* Headband */}
              <G>
                <Path
                  d="M -2 -22 Q 14 -32, 30 -22"
                  stroke={Colors.headbandWhite}
                  strokeWidth={4}
                  fill="none"
                  strokeLinecap="round"
                />
                <Path
                  d="M -2 -21 Q 14 -31, 30 -21"
                  stroke={Colors.headbandRed}
                  strokeWidth={1.2}
                  fill="none"
                  strokeLinecap="round"
                />
                <Path
                  d="M -2 -23 Q 14 -33, 30 -23"
                  stroke={Colors.headbandRed}
                  strokeWidth={1.2}
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Headband tails */}
                <Path
                  d="M 30 -22 Q 33 -20, 35 -24 Q 37 -28, 34 -30"
                  stroke={Colors.headbandWhite}
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                />
                <Path
                  d="M 30 -22 Q 34 -18, 37 -20 Q 40 -22, 38 -26"
                  stroke={Colors.headbandWhite}
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                />
              </G>

              {/* Whiskers */}
              <G stroke={Colors.outline} strokeWidth={0.8} opacity={0.2}>
                <Line x1={-8} y1={-9} x2={-18} y2={-12} />
                <Line x1={-8} y1={-6} x2={-18} y2={-6} />
                <Line x1={36} y1={-9} x2={46} y2={-12} />
                <Line x1={36} y1={-6} x2={46} y2={-6} />
              </G>

              {/* Happy sparkles */}
              <G fill="#FFD700" opacity={0.8}>
                <Path d="M -16 -20 L -14 -24 L -12 -20 L -8 -22 L -12 -20 L -14 -16 L -16 -20" />
                <Path d="M 40 -18 L 42 -22 L 44 -18 L 48 -20 L 44 -18 L 42 -14 L 40 -18" />
              </G>
            </G>
          </Svg>
        </Animated.View>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
