/**
 * HamsterPortrait.js
 * Head-only animated hamster portrait for home screen
 * Cute mascot style with bold outlines, fluffy cheeks, and athletic headband
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Path,
  G,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
} from 'react-native-svg';

// Color palette matching reference style
const Colors = {
  // Fur
  furLight: '#F5A855',
  furMain: '#E8923A',
  furDark: '#C67830',

  // Face/cheeks
  cream: '#FFF8F0',
  creamShadow: '#F5E6D8',

  // Features
  nose: '#FF9CAD',
  noseDark: '#E88A9D',
  mouth: '#C45555',
  tongue: '#FF8080',
  teeth: '#FFFFFF',

  // Eyes
  eyeWhite: '#FFFFFF',
  eyeBlue: '#5B9BD5',
  eyeBlueDark: '#3A6FA0',
  pupil: '#1C1C1E',
  highlight: '#FFFFFF',

  // Ears
  earPink: '#FFB8B8',
  earPinkDark: '#E89999',

  // Headband
  headbandWhite: '#FFFFFF',
  headbandRed: '#E54545',

  // Outline
  outline: '#2D2D2D',

  // Blush
  blush: '#FFCDD2',

  // Sparkle
  sparkle: '#FFD700',

  // Tear
  tear: '#87CEEB',
};

// Animated components
const AnimatedG = Animated.createAnimatedComponent(G);

export default function HamsterPortrait({
  state = 'happy',
  size = 200,
  showHeadband = true,
  equippedAccessory = null,
}) {
  const [reduceMotion, setReduceMotion] = useState(false);

  // Animation values
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const leftEarAnim = useRef(new Animated.Value(0)).current;
  const rightEarAnim = useRef(new Animated.Value(0)).current;

  // Check for reduced motion preference
  useEffect(() => {
    const checkReducedMotion = async () => {
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      setReduceMotion(isReduceMotionEnabled);
    };
    checkReducedMotion();

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  // Breathing animation
  useEffect(() => {
    if (reduceMotion) return;

    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();

    return () => breathe.stop();
  }, [reduceMotion, breatheAnim]);

  // Blink animation
  useEffect(() => {
    if (reduceMotion) return;

    const blink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Random delay between 3-5 seconds
        const delay = 3000 + Math.random() * 2000;
        setTimeout(blink, delay);
      });
    };

    const initialDelay = setTimeout(blink, 2000);
    return () => clearTimeout(initialDelay);
  }, [reduceMotion, blinkAnim]);

  // Ear wiggle animation
  useEffect(() => {
    if (reduceMotion) return;

    const wiggle = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(leftEarAnim, {
            toValue: -5,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rightEarAnim, {
            toValue: 5,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(leftEarAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rightEarAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Random delay between 4-6 seconds
        const delay = 4000 + Math.random() * 2000;
        setTimeout(wiggle, delay);
      });
    };

    const initialDelay = setTimeout(wiggle, 3000);
    return () => clearTimeout(initialDelay);
  }, [reduceMotion, leftEarAnim, rightEarAnim]);

  const strokeWidth = 2.5;
  const viewBoxSize = 100;

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size },
        { transform: [{ scale: breatheAnim }] },
      ]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
        <Defs>
          <RadialGradient id="furGradientPortrait" cx="50%" cy="30%" r="70%">
            <Stop offset="0%" stopColor={Colors.furLight} />
            <Stop offset="50%" stopColor={Colors.furMain} />
            <Stop offset="100%" stopColor={Colors.furDark} />
          </RadialGradient>
          <RadialGradient id="cheekGradientPortrait" cx="50%" cy="40%" r="60%">
            <Stop offset="0%" stopColor={Colors.cream} />
            <Stop offset="100%" stopColor={Colors.creamShadow} />
          </RadialGradient>
          <LinearGradient id="earGradientPortrait" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={Colors.earPink} />
            <Stop offset="100%" stopColor={Colors.earPinkDark} />
          </LinearGradient>
          <RadialGradient id="eyeGradientPortrait" cx="50%" cy="30%" r="60%">
            <Stop offset="0%" stopColor={Colors.eyeBlue} />
            <Stop offset="100%" stopColor={Colors.eyeBlueDark} />
          </RadialGradient>
        </Defs>

        {/* === EARS (behind head) === */}
        <EarsComponent
          state={state}
          strokeWidth={strokeWidth}
          leftEarAnim={leftEarAnim}
          rightEarAnim={rightEarAnim}
          reduceMotion={reduceMotion}
        />

        {/* === HEAD === */}
        <G>
          {/* Head fill - larger for portrait */}
          <Circle cx="50" cy="52" r="38" fill="url(#furGradientPortrait)" />
          {/* Head outline */}
          <Circle
            cx="50"
            cy="52"
            r="38"
            fill="none"
            stroke={Colors.outline}
            strokeWidth={strokeWidth}
          />

          {/* Darker fur on top of head */}
          <Path
            d="M 20 40 Q 50 25, 80 40 Q 70 48, 50 45 Q 30 48, 20 40"
            fill={Colors.furDark}
            opacity="0.4"
          />
        </G>

        {/* === FLUFFY CHEEKS === */}
        <G>
          {/* Left cheek - fluffy, extending outward */}
          <Ellipse cx="25" cy="62" rx="18" ry="14" fill={Colors.cream} />
          <Ellipse
            cx="25"
            cy="62"
            rx="18"
            ry="14"
            fill="none"
            stroke={Colors.outline}
            strokeWidth={strokeWidth * 0.6}
            opacity="0.3"
          />
          {/* Left cheek fur texture */}
          <Path
            d="M 10 58 Q 13 62, 10 66 M 14 55 Q 17 60, 14 65 M 18 53 Q 20 58, 18 63"
            stroke={Colors.creamShadow}
            strokeWidth="1.2"
            fill="none"
            opacity="0.5"
          />
          {/* Left blush */}
          <Ellipse cx="22" cy="65" rx="6" ry="4" fill={Colors.blush} opacity="0.5" />

          {/* Right cheek - fluffy, extending outward */}
          <Ellipse cx="75" cy="62" rx="18" ry="14" fill={Colors.cream} />
          <Ellipse
            cx="75"
            cy="62"
            rx="18"
            ry="14"
            fill="none"
            stroke={Colors.outline}
            strokeWidth={strokeWidth * 0.6}
            opacity="0.3"
          />
          {/* Right cheek fur texture */}
          <Path
            d="M 90 58 Q 87 62, 90 66 M 86 55 Q 83 60, 86 65 M 82 53 Q 80 58, 82 63"
            stroke={Colors.creamShadow}
            strokeWidth="1.2"
            fill="none"
            opacity="0.5"
          />
          {/* Right blush */}
          <Ellipse cx="78" cy="65" rx="6" ry="4" fill={Colors.blush} opacity="0.5" />
        </G>

        {/* === HEADBAND === */}
        {showHeadband && !equippedAccessory && (
          <HeadbandComponent strokeWidth={strokeWidth} />
        )}

        {/* === EYES === */}
        <EyesComponent state={state} blinkAnim={blinkAnim} reduceMotion={reduceMotion} />

        {/* === NOSE === */}
        <G>
          <Ellipse cx="50" cy="60" rx="5" ry="4" fill={Colors.nose} />
          <Ellipse
            cx="50"
            cy="60"
            rx="5"
            ry="4"
            fill="none"
            stroke={Colors.outline}
            strokeWidth="1.5"
          />
          {/* Nose highlight */}
          <Ellipse cx="48" cy="58.5" rx="2" ry="1.2" fill={Colors.highlight} opacity="0.7" />
        </G>

        {/* === MOUTH === */}
        <MouthComponent state={state} />

        {/* === WHISKERS === */}
        <G stroke={Colors.outline} strokeWidth="1" opacity="0.2">
          {/* Left whiskers */}
          <Path d="M 18 58 L 2 54" />
          <Path d="M 16 62 L -1 62" />
          <Path d="M 18 66 L 2 70" />
          {/* Right whiskers */}
          <Path d="M 82 58 L 98 54" />
          <Path d="M 84 62 L 101 62" />
          <Path d="M 82 66 L 98 70" />
        </G>

        {/* === ACCESSORIES === */}
        {equippedAccessory && <AccessoryComponent accessoryId={equippedAccessory} />}

        {/* === STATE DECORATIONS === */}
        {state === 'happy' && <HappySparkles />}
        {state === 'hungry' && <HungryIndicator />}
        {state === 'sad' && <SadTear />}
      </Svg>
    </Animated.View>
  );
}

// Ears component with animation support
function EarsComponent({ state, strokeWidth, leftEarAnim, rightEarAnim, reduceMotion }) {
  const isSad = state === 'sad';

  // For animated ears, we'll use transform in the View wrapper
  // SVG G doesn't support Animated directly, so we handle rotation via state
  const leftRotation = isSad ? -15 : 0;
  const rightRotation = isSad ? 15 : 0;

  return (
    <G>
      {/* Left ear */}
      <G transform={`rotate(${leftRotation}, 28, 30)`}>
        <Ellipse cx="28" cy="30" rx="12" ry="16" fill={Colors.furMain} />
        <Ellipse
          cx="28"
          cy="30"
          rx="12"
          ry="16"
          fill="none"
          stroke={Colors.outline}
          strokeWidth={strokeWidth}
        />
        {/* Inner ear */}
        <Ellipse cx="28" cy="32" rx="7" ry="10" fill="url(#earGradientPortrait)" />
      </G>

      {/* Right ear */}
      <G transform={`rotate(${rightRotation}, 72, 30)`}>
        <Ellipse cx="72" cy="30" rx="12" ry="16" fill={Colors.furMain} />
        <Ellipse
          cx="72"
          cy="30"
          rx="12"
          ry="16"
          fill="none"
          stroke={Colors.outline}
          strokeWidth={strokeWidth}
        />
        {/* Inner ear */}
        <Ellipse cx="72" cy="32" rx="7" ry="10" fill="url(#earGradientPortrait)" />
      </G>
    </G>
  );
}

// Headband component
function HeadbandComponent({ strokeWidth }) {
  return (
    <G>
      {/* Main headband */}
      <Path
        d="M 18 40 Q 50 28, 82 40"
        stroke={Colors.headbandWhite}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      {/* Red stripes */}
      <Path
        d="M 18 38 Q 50 26, 82 38"
        stroke={Colors.headbandRed}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 18 42 Q 50 30, 82 42"
        stroke={Colors.headbandRed}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Headband outline */}
      <Path
        d="M 18 40 Q 50 28, 82 40"
        stroke={Colors.outline}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Headband tails - flowing to the right */}
      <G>
        {/* Top tail */}
        <Path
          d="M 82 40 Q 88 38, 92 34 Q 96 30, 94 26"
          stroke={Colors.headbandWhite}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Bottom tail */}
        <Path
          d="M 82 40 Q 88 42, 94 40 Q 100 38, 98 34"
          stroke={Colors.headbandWhite}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Tail stripes */}
        <Path
          d="M 86 37 L 91 31"
          stroke={Colors.headbandRed}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <Path
          d="M 88 41 L 94 37"
          stroke={Colors.headbandRed}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </G>
    </G>
  );
}

// Eyes component with state expressions and blink animation
function EyesComponent({ state, blinkAnim, reduceMotion }) {
  const strokeWidth = 2;

  // Base eye positions
  const leftEyeX = 38;
  const rightEyeX = 62;
  const eyeY = 50;

  switch (state) {
    case 'happy':
      // Big sparkling eyes
      return (
        <G>
          {/* Left eye */}
          <G>
            <Circle cx={leftEyeX} cy={eyeY} r="9" fill={Colors.eyeWhite} />
            <Circle
              cx={leftEyeX}
              cy={eyeY}
              r="9"
              fill="none"
              stroke={Colors.outline}
              strokeWidth={strokeWidth}
            />
            <Circle cx={leftEyeX} cy={eyeY} r="6" fill="url(#eyeGradientPortrait)" />
            <Circle cx={leftEyeX} cy={eyeY} r="3" fill={Colors.pupil} />
            {/* Sparkle highlights */}
            <Circle cx={leftEyeX - 3} cy={eyeY - 3} r="2.5" fill={Colors.highlight} />
            <Circle cx={leftEyeX + 2} cy={eyeY + 2} r="1.2" fill={Colors.highlight} />
          </G>
          {/* Right eye */}
          <G>
            <Circle cx={rightEyeX} cy={eyeY} r="9" fill={Colors.eyeWhite} />
            <Circle
              cx={rightEyeX}
              cy={eyeY}
              r="9"
              fill="none"
              stroke={Colors.outline}
              strokeWidth={strokeWidth}
            />
            <Circle cx={rightEyeX} cy={eyeY} r="6" fill="url(#eyeGradientPortrait)" />
            <Circle cx={rightEyeX} cy={eyeY} r="3" fill={Colors.pupil} />
            {/* Sparkle highlights */}
            <Circle cx={rightEyeX - 3} cy={eyeY - 3} r="2.5" fill={Colors.highlight} />
            <Circle cx={rightEyeX + 2} cy={eyeY + 2} r="1.2" fill={Colors.highlight} />
          </G>
          {/* Sparkle marks around eyes */}
          <Path d="M 26 44 L 28 41 L 26 38 L 23 41 Z" fill={Colors.sparkle} />
          <Path d="M 74 44 L 77 41 L 74 38 L 71 41 Z" fill={Colors.sparkle} />
        </G>
      );

    case 'chillin':
      // Half-lidded relaxed eyes
      return (
        <G>
          {/* Left eye */}
          <Ellipse cx={leftEyeX} cy={eyeY} rx="8" ry="5" fill={Colors.eyeWhite} />
          <Ellipse
            cx={leftEyeX}
            cy={eyeY}
            rx="8"
            ry="5"
            fill="none"
            stroke={Colors.outline}
            strokeWidth={strokeWidth}
          />
          <Ellipse cx={leftEyeX} cy={eyeY} rx="5" ry="4" fill="url(#eyeGradientPortrait)" />
          <Circle cx={leftEyeX - 2} cy={eyeY - 1} r="1.5" fill={Colors.highlight} />

          {/* Right eye */}
          <Ellipse cx={rightEyeX} cy={eyeY} rx="8" ry="5" fill={Colors.eyeWhite} />
          <Ellipse
            cx={rightEyeX}
            cy={eyeY}
            rx="8"
            ry="5"
            fill="none"
            stroke={Colors.outline}
            strokeWidth={strokeWidth}
          />
          <Ellipse cx={rightEyeX} cy={eyeY} rx="5" ry="4" fill="url(#eyeGradientPortrait)" />
          <Circle cx={rightEyeX - 2} cy={eyeY - 1} r="1.5" fill={Colors.highlight} />
        </G>
      );

    case 'hungry':
      // Extra big puppy eyes
      return (
        <G>
          {/* Left eye - extra large */}
          <Circle cx={leftEyeX} cy={eyeY - 1} r="10" fill={Colors.eyeWhite} />
          <Circle
            cx={leftEyeX}
            cy={eyeY - 1}
            r="10"
            fill="none"
            stroke={Colors.outline}
            strokeWidth={strokeWidth}
          />
          <Circle cx={leftEyeX} cy={eyeY - 1} r="7" fill="url(#eyeGradientPortrait)" />
          <Circle cx={leftEyeX} cy={eyeY - 1} r="3.5" fill={Colors.pupil} />
          <Circle cx={leftEyeX - 3} cy={eyeY - 4} r="3" fill={Colors.highlight} />
          <Circle cx={leftEyeX + 2} cy={eyeY + 1} r="1.5" fill={Colors.highlight} />

          {/* Right eye - extra large */}
          <Circle cx={rightEyeX} cy={eyeY - 1} r="10" fill={Colors.eyeWhite} />
          <Circle
            cx={rightEyeX}
            cy={eyeY - 1}
            r="10"
            fill="none"
            stroke={Colors.outline}
            strokeWidth={strokeWidth}
          />
          <Circle cx={rightEyeX} cy={eyeY - 1} r="7" fill="url(#eyeGradientPortrait)" />
          <Circle cx={rightEyeX} cy={eyeY - 1} r="3.5" fill={Colors.pupil} />
          <Circle cx={rightEyeX - 3} cy={eyeY - 4} r="3" fill={Colors.highlight} />
          <Circle cx={rightEyeX + 2} cy={eyeY + 1} r="1.5" fill={Colors.highlight} />
        </G>
      );

    case 'sad':
      // Droopy sad eyes
      return (
        <G>
          {/* Left eye */}
          <Circle cx={leftEyeX} cy={eyeY + 1} r="8" fill={Colors.eyeWhite} />
          <Circle
            cx={leftEyeX}
            cy={eyeY + 1}
            r="8"
            fill="none"
            stroke={Colors.outline}
            strokeWidth={strokeWidth}
          />
          <Circle cx={leftEyeX} cy={eyeY + 2} r="5" fill="url(#eyeGradientPortrait)" />
          <Circle cx={leftEyeX} cy={eyeY + 2} r="2.5" fill={Colors.pupil} />
          <Circle cx={leftEyeX - 2} cy={eyeY} r="1.5" fill={Colors.highlight} />
          {/* Droopy eyelid */}
          <Path
            d="M 28 46 Q 38 42, 48 47"
            stroke={Colors.furMain}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Right eye */}
          <Circle cx={rightEyeX} cy={eyeY + 1} r="8" fill={Colors.eyeWhite} />
          <Circle
            cx={rightEyeX}
            cy={eyeY + 1}
            r="8"
            fill="none"
            stroke={Colors.outline}
            strokeWidth={strokeWidth}
          />
          <Circle cx={rightEyeX} cy={eyeY + 2} r="5" fill="url(#eyeGradientPortrait)" />
          <Circle cx={rightEyeX} cy={eyeY + 2} r="2.5" fill={Colors.pupil} />
          <Circle cx={rightEyeX - 2} cy={eyeY} r="1.5" fill={Colors.highlight} />
          {/* Droopy eyelid */}
          <Path
            d="M 52 47 Q 62 42, 72 46"
            stroke={Colors.furMain}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );

    default:
      // Normal open eyes
      return (
        <G>
          {/* Left eye */}
          <Circle cx={leftEyeX} cy={eyeY} r="9" fill={Colors.eyeWhite} />
          <Circle
            cx={leftEyeX}
            cy={eyeY}
            r="9"
            fill="none"
            stroke={Colors.outline}
            strokeWidth={strokeWidth}
          />
          <Circle cx={leftEyeX} cy={eyeY} r="6" fill="url(#eyeGradientPortrait)" />
          <Circle cx={leftEyeX} cy={eyeY} r="3" fill={Colors.pupil} />
          <Circle cx={leftEyeX - 3} cy={eyeY - 3} r="2.5" fill={Colors.highlight} />
          <Circle cx={leftEyeX + 2} cy={eyeY + 2} r="1" fill={Colors.highlight} />

          {/* Right eye */}
          <Circle cx={rightEyeX} cy={eyeY} r="9" fill={Colors.eyeWhite} />
          <Circle
            cx={rightEyeX}
            cy={eyeY}
            r="9"
            fill="none"
            stroke={Colors.outline}
            strokeWidth={strokeWidth}
          />
          <Circle cx={rightEyeX} cy={eyeY} r="6" fill="url(#eyeGradientPortrait)" />
          <Circle cx={rightEyeX} cy={eyeY} r="3" fill={Colors.pupil} />
          <Circle cx={rightEyeX - 3} cy={eyeY - 3} r="2.5" fill={Colors.highlight} />
          <Circle cx={rightEyeX + 2} cy={eyeY + 2} r="1" fill={Colors.highlight} />
        </G>
      );
  }
}

// Mouth component
function MouthComponent({ state }) {
  switch (state) {
    case 'happy':
      // Big open smile with teeth and tongue
      return (
        <G>
          {/* Mouth opening */}
          <Path d="M 40 68 Q 50 82, 60 68" fill={Colors.mouth} />
          <Path
            d="M 40 68 Q 50 82, 60 68"
            fill="none"
            stroke={Colors.outline}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Two front teeth */}
          <Path
            d="M 46 68 L 46 72 Q 48 73.5, 50 72 L 50 68"
            fill={Colors.teeth}
            stroke={Colors.outline}
            strokeWidth="0.5"
          />
          <Path
            d="M 50 68 L 50 72 Q 52 73.5, 54 72 L 54 68"
            fill={Colors.teeth}
            stroke={Colors.outline}
            strokeWidth="0.5"
          />
          {/* Tongue */}
          <Ellipse cx="50" cy="76" rx="5" ry="3" fill={Colors.tongue} opacity="0.8" />
        </G>
      );

    case 'chillin':
      // Small content smile
      return (
        <G>
          <Path
            d="M 44 68 Q 50 73, 56 68"
            fill="none"
            stroke={Colors.outline}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </G>
      );

    case 'hungry':
      // Small 'o' shape
      return (
        <G>
          <Ellipse cx="50" cy="70" rx="5" ry="6" fill={Colors.mouth} />
          <Ellipse
            cx="50"
            cy="70"
            rx="5"
            ry="6"
            fill="none"
            stroke={Colors.outline}
            strokeWidth="2"
          />
          {/* Small teeth peeking */}
          <Path
            d="M 47 66 L 47 68.5 L 53 68.5 L 53 66"
            fill={Colors.teeth}
            stroke={Colors.outline}
            strokeWidth="0.5"
          />
        </G>
      );

    case 'sad':
      // Frown
      return (
        <G>
          <Path
            d="M 44 72 Q 50 67, 56 72"
            fill="none"
            stroke={Colors.outline}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </G>
      );

    default:
      // Normal smile with teeth
      return (
        <G>
          <Path d="M 42 68 Q 50 76, 58 68" fill={Colors.mouth} />
          <Path
            d="M 42 68 Q 50 76, 58 68"
            fill="none"
            stroke={Colors.outline}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Teeth */}
          <Path
            d="M 46 68 L 46 71 L 54 71 L 54 68"
            fill={Colors.teeth}
            stroke={Colors.outline}
            strokeWidth="0.5"
          />
        </G>
      );
  }
}

// Accessory component for portrait
function AccessoryComponent({ accessoryId }) {
  switch (accessoryId) {
    case 'acc-1': // Cool Sunglasses
      return (
        <G>
          <Ellipse cx="38" cy="50" rx="12" ry="10" fill="#1C1C1E" />
          <Ellipse cx="62" cy="50" rx="12" ry="10" fill="#1C1C1E" />
          <Path d="M 50 50 Q 52 52, 54 50" stroke="#1C1C1E" strokeWidth="4" fill="none" />
          <Path d="M 26 48 L 18 44" stroke="#1C1C1E" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 74 48 L 82 44" stroke="#1C1C1E" strokeWidth="3" strokeLinecap="round" />
          <Ellipse cx="35" cy="48" rx="4" ry="3" fill="#FFFFFF" opacity="0.3" />
          <Ellipse cx="59" cy="48" rx="4" ry="3" fill="#FFFFFF" opacity="0.3" />
        </G>
      );

    case 'acc-3': // Golden Crown
      return (
        <G>
          <Path
            d="M 22 26 L 22 32 Q 50 38, 78 32 L 78 26 Z"
            fill="#FFD700"
            stroke={Colors.outline}
            strokeWidth="1.5"
          />
          <Path
            d="M 22 26 L 30 10 L 40 24 L 50 4 L 60 24 L 70 10 L 78 26"
            fill="#FFD700"
            stroke={Colors.outline}
            strokeWidth="1.5"
          />
          <Circle cx="50" cy="14" r="4" fill="#FF3B30" />
          <Circle cx="34" cy="18" r="2.5" fill="#5856D6" />
          <Circle cx="66" cy="18" r="2.5" fill="#34C759" />
        </G>
      );

    case 'acc-5': // Flower Crown
      return (
        <G>
          <Path
            d="M 16 36 Q 35 22, 50 20 Q 65 22, 84 36"
            stroke="#34C759"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx="30" cy="28" r="8" fill="#FF9FF3" />
          <Circle cx="30" cy="28" r="4" fill="#FFD93D" />
          <Circle cx="50" cy="20" r="10" fill="#FFD93D" />
          <Circle cx="50" cy="20" r="5" fill="#FFFFFF" />
          <Circle cx="70" cy="28" r="8" fill="#FF6B6B" />
          <Circle cx="70" cy="28" r="4" fill="#FFD93D" />
        </G>
      );

    default:
      return null;
  }
}

// Happy sparkles decoration
function HappySparkles() {
  return (
    <G fill={Colors.sparkle}>
      <Path d="M 8 35 L 10 30 L 12 35 L 17 33 L 12 35 L 10 40 L 8 35" />
      <Path d="M 88 33 L 90 28 L 92 33 L 97 31 L 92 33 L 90 38 L 88 33" />
      <Circle cx="5" cy="45" r="2.5" />
      <Circle cx="95" cy="43" r="2.5" />
      <Circle cx="12" cy="25" r="1.5" />
      <Circle cx="88" cy="23" r="1.5" />
    </G>
  );
}

// Hungry indicator (thought bubble hint)
function HungryIndicator() {
  return (
    <G opacity="0.4">
      {/* Thought bubbles */}
      <Circle cx="85" cy="30" r="3" fill={Colors.outline} />
      <Circle cx="90" cy="22" r="5" fill={Colors.outline} />
      <Circle cx="92" cy="12" r="8" fill={Colors.outline} />
      {/* Food icon inside thought */}
      <Circle cx="92" cy="12" r="4" fill={Colors.furMain} />
    </G>
  );
}

// Sad tear
function SadTear() {
  return (
    <G>
      {/* Tear drop */}
      <Path d="M 44 58 Q 42 64, 44 70 Q 46 72, 48 70 Q 50 64, 48 58 Q 46 56, 44 58" fill={Colors.tear} opacity="0.8" />
      {/* Small tear highlight */}
      <Circle cx="45" cy="64" r="1.5" fill={Colors.highlight} opacity="0.6" />
    </G>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
