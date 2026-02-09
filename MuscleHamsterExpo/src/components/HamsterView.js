/**
 * HamsterView.js
 * SVG-based hamster character - Mascot/Sticker style
 * Redesigned with bold outlines, expressive blue eyes, and cuter proportions
 * Now with idle animations: breathing, blinking, and ear wiggle
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Path,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';

// Color palette - Mascot style
const Colors = {
  // Fur colors
  furLight: '#F5A623',
  furMain: '#E08A2D',
  furDark: '#C46A1F',
  furDarkest: '#8B4513',

  // Face/belly
  cream: '#FFF8E7',
  creamDark: '#F5E6D0',

  // Features
  nose: '#FF8B9A',
  noseDark: '#E57283',
  mouth: '#C45C5C',

  // Eyes
  eyeWhite: '#FFFFFF',
  eyeBlue: '#4A90D9',
  eyeBlueDark: '#2E5C8A',
  eyeHighlight: '#FFFFFF',
  pupil: '#1C1C1E',

  // Ears
  earPink: '#FFB5B5',
  earPinkDark: '#E89999',

  // Headband
  headbandWhite: '#FFFFFF',
  headbandRed: '#E54B4B',

  // Outline
  outline: '#2D2D2D',

  // Blush
  blush: '#FFCDD2',
};


// Eye expressions by state
const getEyeExpression = (state) => {
  switch (state) {
    case 'happy':
      return 'sparkle';
    case 'chillin':
      return 'relaxed';
    case 'hungry':
      return 'hopeful';
    case 'sad':
      return 'sad';
    default:
      return 'normal';
  }
};

// Mouth expressions by state
const getMouthExpression = (state) => {
  switch (state) {
    case 'happy':
      return 'big-smile';
    case 'chillin':
      return 'content';
    case 'hungry':
      return 'small-o';
    case 'sad':
      return 'frown';
    default:
      return 'smile';
  }
};

export default function HamsterView({
  state = 'happy',
  size = 150,
  showHeadband = true,
  equippedOutfit = null,
  equippedAccessory = null,
}) {
  const [reduceMotion, setReduceMotion] = useState(false);

  // Animation values
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;

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

  const eyeType = getEyeExpression(state);
  const mouthType = getMouthExpression(state);
  const strokeWidth = 2.5;

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size },
        { transform: [{ scale: breatheAnim }] },
      ]}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <Defs>
          <RadialGradient id="furGradient" cx="50%" cy="30%" r="70%">
            <Stop offset="0%" stopColor={Colors.furLight} />
            <Stop offset="50%" stopColor={Colors.furMain} />
            <Stop offset="100%" stopColor={Colors.furDark} />
          </RadialGradient>
          <RadialGradient id="bellyGradient" cx="50%" cy="30%" r="60%">
            <Stop offset="0%" stopColor={Colors.cream} />
            <Stop offset="100%" stopColor={Colors.creamDark} />
          </RadialGradient>
          <LinearGradient id="earGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={Colors.earPink} />
            <Stop offset="100%" stopColor={Colors.earPinkDark} />
          </LinearGradient>
          <RadialGradient id="eyeGradient" cx="50%" cy="30%" r="60%">
            <Stop offset="0%" stopColor={Colors.eyeBlue} />
            <Stop offset="100%" stopColor={Colors.eyeBlueDark} />
          </RadialGradient>
        </Defs>

        <G>

          {/* === BODY === */}
          <G>
            {/* Body fill */}
            <Ellipse
              cx="50"
              cy="72"
              rx="24"
              ry="20"
              fill="url(#furGradient)"
            />
            {/* Body outline */}
            <Ellipse
              cx="50"
              cy="72"
              rx="24"
              ry="20"
              fill="none"
              stroke={Colors.outline}
              strokeWidth={strokeWidth}
            />

            {/* Belly */}
            <Ellipse
              cx="50"
              cy="74"
              rx="16"
              ry="14"
              fill="url(#bellyGradient)"
            />
            <Ellipse
              cx="50"
              cy="74"
              rx="16"
              ry="14"
              fill="none"
              stroke={Colors.outline}
              strokeWidth={strokeWidth * 0.6}
              opacity="0.3"
            />

            {/* Arms/Paws */}
            <Ellipse
              cx="28"
              cy="68"
              rx="8"
              ry="6"
              fill={Colors.furMain}
              transform="rotate(-15, 28, 68)"
            />
            <Ellipse
              cx="28"
              cy="68"
              rx="8"
              ry="6"
              fill="none"
              stroke={Colors.outline}
              strokeWidth={strokeWidth}
              transform="rotate(-15, 28, 68)"
            />
            <Ellipse
              cx="72"
              cy="68"
              rx="8"
              ry="6"
              fill={Colors.furMain}
              transform="rotate(15, 72, 68)"
            />
            <Ellipse
              cx="72"
              cy="68"
              rx="8"
              ry="6"
              fill="none"
              stroke={Colors.outline}
              strokeWidth={strokeWidth}
              transform="rotate(15, 72, 68)"
            />

            {/* Paw pads */}
            <Circle cx="26" cy="69" r="2" fill={Colors.earPink} />
            <Circle cx="74" cy="69" r="2" fill={Colors.earPink} />

            {/* Feet */}
            <Ellipse cx="38" cy="88" rx="9" ry="5" fill={Colors.furMain} />
            <Ellipse cx="38" cy="88" rx="9" ry="5" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth} />
            <Ellipse cx="62" cy="88" rx="9" ry="5" fill={Colors.furMain} />
            <Ellipse cx="62" cy="88" rx="9" ry="5" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth} />

            {/* Toe beans */}
            <Circle cx="34" cy="88" r="2" fill={Colors.earPink} />
            <Circle cx="38" cy="89" r="2" fill={Colors.earPink} />
            <Circle cx="42" cy="88" r="2" fill={Colors.earPink} />
            <Circle cx="58" cy="88" r="2" fill={Colors.earPink} />
            <Circle cx="62" cy="89" r="2" fill={Colors.earPink} />
            <Circle cx="66" cy="88" r="2" fill={Colors.earPink} />
          </G>

          {/* === EARS (behind head) === */}
          <G>
            {/* Left ear */}
            <Ellipse
              cx="28"
              cy="22"
              rx="10"
              ry="12"
              fill={Colors.furMain}
              transform={state === 'sad' ? 'rotate(-10, 28, 22)' : ''}
            />
            <Ellipse
              cx="28"
              cy="22"
              rx="10"
              ry="12"
              fill="none"
              stroke={Colors.outline}
              strokeWidth={strokeWidth}
              transform={state === 'sad' ? 'rotate(-10, 28, 22)' : ''}
            />
            {/* Inner ear */}
            <Ellipse
              cx="28"
              cy="23"
              rx="6"
              ry="8"
              fill="url(#earGradient)"
              transform={state === 'sad' ? 'rotate(-10, 28, 23)' : ''}
            />

            {/* Right ear */}
            <Ellipse
              cx="72"
              cy="22"
              rx="10"
              ry="12"
              fill={Colors.furMain}
              transform={state === 'sad' ? 'rotate(10, 72, 22)' : ''}
            />
            <Ellipse
              cx="72"
              cy="22"
              rx="10"
              ry="12"
              fill="none"
              stroke={Colors.outline}
              strokeWidth={strokeWidth}
              transform={state === 'sad' ? 'rotate(10, 72, 22)' : ''}
            />
            {/* Inner ear */}
            <Ellipse
              cx="72"
              cy="23"
              rx="6"
              ry="8"
              fill="url(#earGradient)"
              transform={state === 'sad' ? 'rotate(10, 72, 23)' : ''}
            />
          </G>

          {/* === HEAD === */}
          <G>
            {/* Head fill */}
            <Circle
              cx="50"
              cy="40"
              r="28"
              fill="url(#furGradient)"
            />
            {/* Head outline */}
            <Circle
              cx="50"
              cy="40"
              r="28"
              fill="none"
              stroke={Colors.outline}
              strokeWidth={strokeWidth}
            />

            {/* Darker fur on top of head */}
            <Path
              d="M 30 30 Q 50 20, 70 30 Q 65 35, 50 33 Q 35 35, 30 30"
              fill={Colors.furDark}
              opacity="0.5"
            />
          </G>

          {/* === CHEEKS === */}
          <G>
            {/* Left cheek - fluffy */}
            <Ellipse cx="30" cy="48" rx="14" ry="11" fill={Colors.cream} />
            <Ellipse cx="30" cy="48" rx="14" ry="11" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth * 0.5} opacity="0.2" />
            {/* Cheek fluff texture */}
            <Path
              d="M 20 45 Q 22 48, 20 51 M 24 43 Q 26 47, 24 51"
              stroke={Colors.creamDark}
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
            {/* Blush */}
            <Ellipse cx="28" cy="50" rx="5" ry="3" fill={Colors.blush} opacity="0.6" />

            {/* Right cheek - fluffy */}
            <Ellipse cx="70" cy="48" rx="14" ry="11" fill={Colors.cream} />
            <Ellipse cx="70" cy="48" rx="14" ry="11" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth * 0.5} opacity="0.2" />
            {/* Cheek fluff texture */}
            <Path
              d="M 80 45 Q 78 48, 80 51 M 76 43 Q 74 47, 76 51"
              stroke={Colors.creamDark}
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
            {/* Blush */}
            <Ellipse cx="72" cy="50" rx="5" ry="3" fill={Colors.blush} opacity="0.6" />
          </G>

          {/* === CHEST TUFT === */}
          <Path
            d="M 40 58 Q 42 54, 46 56 Q 50 52, 54 56 Q 58 54, 60 58 Q 55 62, 50 60 Q 45 62, 40 58"
            fill={Colors.cream}
          />
          <Path
            d="M 40 58 Q 42 54, 46 56 Q 50 52, 54 56 Q 58 54, 60 58"
            fill="none"
            stroke={Colors.outline}
            strokeWidth={strokeWidth * 0.5}
            opacity="0.3"
          />

          {/* === HEADBAND === */}
          {showHeadband && !equippedAccessory && (
            <G>
              {/* Main headband */}
              <Path
                d="M 24 32 Q 50 22, 76 32"
                stroke={Colors.headbandWhite}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
              {/* Red stripes */}
              <Path
                d="M 24 30 Q 50 20, 76 30"
                stroke={Colors.headbandRed}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M 24 34 Q 50 24, 76 34"
                stroke={Colors.headbandRed}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              {/* Headband outline */}
              <Path
                d="M 24 32 Q 50 22, 76 32"
                stroke={Colors.outline}
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* Headband tails */}
              <Path
                d="M 76 32 Q 80 34, 82 30 Q 84 26, 80 24"
                stroke={Colors.headbandWhite}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M 76 32 Q 80 36, 84 34 Q 88 32, 85 28"
                stroke={Colors.headbandWhite}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Tail stripes */}
              <Path
                d="M 78 31 L 81 27"
                stroke={Colors.headbandRed}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <Path
                d="M 79 34 L 84 31"
                stroke={Colors.headbandRed}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </G>
          )}

          {/* === EYES === */}
          <HamsterEyes type={eyeType} state={state} />

          {/* === NOSE === */}
          <G>
            <Ellipse cx="50" cy="47" rx="4" ry="3" fill={Colors.nose} />
            <Ellipse cx="50" cy="47" rx="4" ry="3" fill="none" stroke={Colors.outline} strokeWidth="1.5" />
            {/* Nose highlight */}
            <Ellipse cx="49" cy="46" rx="1.5" ry="1" fill={Colors.eyeHighlight} opacity="0.7" />
          </G>

          {/* === MOUTH === */}
          <HamsterMouth type={mouthType} />

          {/* === WHISKERS === */}
          <G stroke={Colors.outline} strokeWidth="1" opacity="0.25">
            {/* Left whiskers */}
            <Path d="M 20 46 L 8 43" />
            <Path d="M 19 49 L 6 49" />
            <Path d="M 20 52 L 8 55" />
            {/* Right whiskers */}
            <Path d="M 80 46 L 92 43" />
            <Path d="M 81 49 L 94 49" />
            <Path d="M 80 52 L 92 55" />
          </G>

          {/* === ACCESSORIES === */}
          {equippedAccessory && (
            <HamsterAccessory accessoryId={equippedAccessory} />
          )}

          {/* === OUTFIT === */}
          {equippedOutfit && (
            <HamsterOutfit outfitId={equippedOutfit} />
          )}

          {/* === STATE DECORATIONS === */}
          {state === 'happy' && <HappySparkles />}
          {state === 'hungry' && <HungryIndicator />}
          {state === 'sad' && <SadTear />}
        </G>
      </Svg>
    </Animated.View>
  );
}

// Eye component with mascot style
function HamsterEyes({ type, state }) {
  const strokeWidth = 2;

  switch (type) {
    case 'sparkle':
      // Happy sparkling eyes
      return (
        <G>
          {/* Left eye */}
          <G>
            <Circle cx="38" cy="40" r="7" fill={Colors.eyeWhite} />
            <Circle cx="38" cy="40" r="7" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth} />
            <Circle cx="38" cy="40" r="5" fill="url(#eyeGradient)" />
            <Circle cx="38" cy="40" r="2.5" fill={Colors.pupil} />
            <Circle cx="36" cy="38" r="2" fill={Colors.eyeHighlight} />
            <Circle cx="40" cy="42" r="1" fill={Colors.eyeHighlight} />
          </G>
          {/* Right eye */}
          <G>
            <Circle cx="62" cy="40" r="7" fill={Colors.eyeWhite} />
            <Circle cx="62" cy="40" r="7" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth} />
            <Circle cx="62" cy="40" r="5" fill="url(#eyeGradient)" />
            <Circle cx="62" cy="40" r="2.5" fill={Colors.pupil} />
            <Circle cx="60" cy="38" r="2" fill={Colors.eyeHighlight} />
            <Circle cx="64" cy="42" r="1" fill={Colors.eyeHighlight} />
          </G>
          {/* Sparkle marks */}
          <Path d="M 30 35 L 32 33 L 30 31 L 28 33 Z" fill="#FFD700" />
          <Path d="M 70 35 L 72 33 L 70 31 L 68 33 Z" fill="#FFD700" />
        </G>
      );

    case 'relaxed':
      // Half-lidded content eyes
      return (
        <G>
          <Ellipse cx="38" cy="40" rx="6" ry="4" fill={Colors.eyeWhite} />
          <Ellipse cx="38" cy="40" rx="6" ry="4" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth} />
          <Ellipse cx="38" cy="40" rx="4" ry="3" fill="url(#eyeGradient)" />
          <Circle cx="36" cy="39" r="1.5" fill={Colors.eyeHighlight} />

          <Ellipse cx="62" cy="40" rx="6" ry="4" fill={Colors.eyeWhite} />
          <Ellipse cx="62" cy="40" rx="6" ry="4" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth} />
          <Ellipse cx="62" cy="40" rx="4" ry="3" fill="url(#eyeGradient)" />
          <Circle cx="60" cy="39" r="1.5" fill={Colors.eyeHighlight} />
        </G>
      );

    case 'hopeful':
      // Big puppy eyes
      return (
        <G>
          {/* Left eye - extra big */}
          <Circle cx="38" cy="39" r="8" fill={Colors.eyeWhite} />
          <Circle cx="38" cy="39" r="8" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth} />
          <Circle cx="38" cy="39" r="6" fill="url(#eyeGradient)" />
          <Circle cx="38" cy="39" r="3" fill={Colors.pupil} />
          <Circle cx="35" cy="37" r="2.5" fill={Colors.eyeHighlight} />
          <Circle cx="40" cy="41" r="1.5" fill={Colors.eyeHighlight} />

          {/* Right eye - extra big */}
          <Circle cx="62" cy="39" r="8" fill={Colors.eyeWhite} />
          <Circle cx="62" cy="39" r="8" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth} />
          <Circle cx="62" cy="39" r="6" fill="url(#eyeGradient)" />
          <Circle cx="62" cy="39" r="3" fill={Colors.pupil} />
          <Circle cx="59" cy="37" r="2.5" fill={Colors.eyeHighlight} />
          <Circle cx="64" cy="41" r="1.5" fill={Colors.eyeHighlight} />
        </G>
      );

    case 'sad':
      // Droopy sad eyes
      return (
        <G>
          <Circle cx="38" cy="41" r="6" fill={Colors.eyeWhite} />
          <Circle cx="38" cy="41" r="6" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth} />
          <Circle cx="38" cy="42" r="4" fill="url(#eyeGradient)" />
          <Circle cx="38" cy="42" r="2" fill={Colors.pupil} />
          <Circle cx="36" cy="40" r="1.5" fill={Colors.eyeHighlight} />
          {/* Droopy eyelid */}
          <Path
            d="M 31 38 Q 38 35, 45 39"
            stroke={Colors.furMain}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />

          <Circle cx="62" cy="41" r="6" fill={Colors.eyeWhite} />
          <Circle cx="62" cy="41" r="6" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth} />
          <Circle cx="62" cy="42" r="4" fill="url(#eyeGradient)" />
          <Circle cx="62" cy="42" r="2" fill={Colors.pupil} />
          <Circle cx="60" cy="40" r="1.5" fill={Colors.eyeHighlight} />
          {/* Droopy eyelid */}
          <Path
            d="M 55 39 Q 62 35, 69 38"
            stroke={Colors.furMain}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );

    default:
      // Normal open eyes
      return (
        <G>
          <Circle cx="38" cy="40" r="7" fill={Colors.eyeWhite} />
          <Circle cx="38" cy="40" r="7" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth} />
          <Circle cx="38" cy="40" r="5" fill="url(#eyeGradient)" />
          <Circle cx="38" cy="40" r="2.5" fill={Colors.pupil} />
          <Circle cx="36" cy="38" r="2" fill={Colors.eyeHighlight} />
          <Circle cx="40" cy="42" r="1" fill={Colors.eyeHighlight} />

          <Circle cx="62" cy="40" r="7" fill={Colors.eyeWhite} />
          <Circle cx="62" cy="40" r="7" fill="none" stroke={Colors.outline} strokeWidth={strokeWidth} />
          <Circle cx="62" cy="40" r="5" fill="url(#eyeGradient)" />
          <Circle cx="62" cy="40" r="2.5" fill={Colors.pupil} />
          <Circle cx="60" cy="38" r="2" fill={Colors.eyeHighlight} />
          <Circle cx="64" cy="42" r="1" fill={Colors.eyeHighlight} />
        </G>
      );
  }
}

// Mouth component with teeth
function HamsterMouth({ type }) {
  switch (type) {
    case 'big-smile':
      // Big open smile with teeth
      return (
        <G>
          {/* Mouth opening */}
          <Path
            d="M 42 52 Q 50 62, 58 52"
            fill={Colors.mouth}
          />
          <Path
            d="M 42 52 Q 50 62, 58 52"
            fill="none"
            stroke={Colors.outline}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Teeth */}
          <Path
            d="M 46 52 L 46 55 Q 48 56, 50 55 L 50 52"
            fill={Colors.eyeWhite}
            stroke={Colors.outline}
            strokeWidth="0.5"
          />
          <Path
            d="M 50 52 L 50 55 Q 52 56, 54 55 L 54 52"
            fill={Colors.eyeWhite}
            stroke={Colors.outline}
            strokeWidth="0.5"
          />
          {/* Tongue hint */}
          <Ellipse cx="50" cy="58" rx="4" ry="2" fill="#FF8B8B" opacity="0.7" />
        </G>
      );

    case 'content':
      // Small content smile
      return (
        <G>
          <Path
            d="M 45 52 Q 50 56, 55 52"
            fill="none"
            stroke={Colors.outline}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </G>
      );

    case 'small-o':
      // Small O mouth (hungry/surprised)
      return (
        <G>
          <Ellipse cx="50" cy="54" rx="4" ry="5" fill={Colors.mouth} />
          <Ellipse cx="50" cy="54" rx="4" ry="5" fill="none" stroke={Colors.outline} strokeWidth="2" />
          {/* Small teeth peeking */}
          <Path
            d="M 48 51 L 48 53 L 52 53 L 52 51"
            fill={Colors.eyeWhite}
            stroke={Colors.outline}
            strokeWidth="0.5"
          />
        </G>
      );

    case 'frown':
      // Sad frown
      return (
        <G>
          <Path
            d="M 45 55 Q 50 51, 55 55"
            fill="none"
            stroke={Colors.outline}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </G>
      );

    default:
      // Normal smile with teeth showing
      return (
        <G>
          <Path
            d="M 44 52 Q 50 58, 56 52"
            fill={Colors.mouth}
          />
          <Path
            d="M 44 52 Q 50 58, 56 52"
            fill="none"
            stroke={Colors.outline}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Teeth */}
          <Path
            d="M 47 52 L 47 54 L 53 54 L 53 52"
            fill={Colors.eyeWhite}
            stroke={Colors.outline}
            strokeWidth="0.5"
          />
        </G>
      );
  }
}

// Outfit rendering
function HamsterOutfit({ outfitId }) {
  const outfitColors = {
    'outfit-1': { primary: '#AF52DE', secondary: '#FFECD2' },
    'outfit-2': { primary: '#007AFF', secondary: '#FFFFFF' },
    'outfit-3': { primary: '#FFFFFF', secondary: '#87CEEB' },
  };

  const colors = outfitColors[outfitId];
  if (!colors) return null;

  switch (outfitId) {
    case 'outfit-1': // Cozy Sweater
      return (
        <G>
          <Path
            d="M 28 62 Q 26 72, 28 82 Q 40 88, 50 88 Q 60 88, 72 82 Q 74 72, 72 62 Q 60 56, 50 56 Q 40 56, 28 62 Z"
            fill={colors.primary}
            stroke={Colors.outline}
            strokeWidth="2"
          />
          <Path d="M 30 68 Q 50 71, 70 68" stroke={colors.secondary} strokeWidth="2" fill="none" />
          <Path d="M 30 76 Q 50 79, 70 76" stroke={colors.secondary} strokeWidth="2" fill="none" />
        </G>
      );

    case 'outfit-2': // Athlete Jersey
      return (
        <G>
          <Path
            d="M 30 60 Q 28 70, 30 80 Q 40 85, 50 85 Q 60 85, 70 80 Q 72 70, 70 60 Q 60 55, 50 55 Q 40 55, 30 60 Z"
            fill={colors.primary}
            stroke={Colors.outline}
            strokeWidth="2"
          />
          <Path
            d="M 40 58 Q 38 68, 40 78 L 60 78 Q 62 68, 60 58 Z"
            fill={colors.secondary}
          />
          <Circle cx="50" cy="68" r="5" fill={colors.primary} />
        </G>
      );

    case 'outfit-3': // Bathrobe
      return (
        <G>
          <Path
            d="M 26 58 Q 24 70, 26 85 Q 40 92, 50 92 Q 60 92, 74 85 Q 76 70, 74 58 Q 60 52, 50 52 Q 40 52, 26 58 Z"
            fill={colors.primary}
            stroke={Colors.outline}
            strokeWidth="2"
          />
          <Path d="M 44 56 L 50 72 L 56 56" stroke={Colors.cream} strokeWidth="6" fill="none" />
          <Ellipse cx="50" cy="76" rx="22" ry="3" fill={colors.secondary} />
        </G>
      );

    default:
      return null;
  }
}

// Accessory rendering
function HamsterAccessory({ accessoryId }) {
  switch (accessoryId) {
    case 'acc-1': // Cool Sunglasses
      return (
        <G>
          <Ellipse cx="38" cy="40" rx="10" ry="8" fill="#1C1C1E" />
          <Ellipse cx="62" cy="40" rx="10" ry="8" fill="#1C1C1E" />
          <Path d="M 48 40 Q 50 42, 52 40" stroke="#1C1C1E" strokeWidth="3" fill="none" />
          <Path d="M 28 38 L 22 34" stroke="#1C1C1E" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 72 38 L 78 34" stroke="#1C1C1E" strokeWidth="3" strokeLinecap="round" />
          <Ellipse cx="35" cy="38" rx="3" ry="2" fill="#FFFFFF" opacity="0.3" />
          <Ellipse cx="59" cy="38" rx="3" ry="2" fill="#FFFFFF" opacity="0.3" />
        </G>
      );

    case 'acc-3': // Golden Crown
      return (
        <G>
          <Path
            d="M 28 20 L 28 26 Q 50 30, 72 26 L 72 20 Z"
            fill="#FFD700"
            stroke={Colors.outline}
            strokeWidth="1.5"
          />
          <Path
            d="M 28 20 L 34 8 L 42 18 L 50 4 L 58 18 L 66 8 L 72 20"
            fill="#FFD700"
            stroke={Colors.outline}
            strokeWidth="1.5"
          />
          <Circle cx="50" cy="12" r="3" fill="#FF3B30" />
          <Circle cx="36" cy="15" r="2" fill="#5856D6" />
          <Circle cx="64" cy="15" r="2" fill="#34C759" />
        </G>
      );

    case 'acc-5': // Flower Crown
      return (
        <G>
          <Path
            d="M 22 28 Q 35 18, 50 16 Q 65 18, 78 28"
            stroke="#34C759"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx="32" cy="22" r="7" fill="#FF9FF3" />
          <Circle cx="32" cy="22" r="3" fill="#FFD93D" />
          <Circle cx="50" cy="15" r="8" fill="#FFD93D" />
          <Circle cx="50" cy="15" r="4" fill="#FFFFFF" />
          <Circle cx="68" cy="22" r="7" fill="#FF6B6B" />
          <Circle cx="68" cy="22" r="3" fill="#FFD93D" />
        </G>
      );

    default:
      return null;
  }
}

// Happy sparkles
function HappySparkles() {
  return (
    <G fill="#FFD700">
      <Path d="M 12 30 L 14 26 L 16 30 L 20 28 L 16 30 L 14 34 L 12 30" />
      <Path d="M 84 28 L 86 24 L 88 28 L 92 26 L 88 28 L 86 32 L 84 28" />
      <Circle cx="10" cy="38" r="2" />
      <Circle cx="90" cy="36" r="2" />
    </G>
  );
}

// Hungry indicator
function HungryIndicator() {
  return (
    <G opacity="0.5">
      <Path
        d="M 38 78 Q 41 75, 44 78 Q 47 81, 50 78"
        stroke={Colors.furDark}
        strokeWidth="1.5"
        fill="none"
      />
      <Path
        d="M 50 78 Q 53 75, 56 78 Q 59 81, 62 78"
        stroke={Colors.furDark}
        strokeWidth="1.5"
        fill="none"
      />
    </G>
  );
}

// Sad tear
function SadTear() {
  return (
    <G>
      <Ellipse cx="44" cy="48" rx="2" ry="4" fill="#87CEEB" opacity="0.8" />
      <Circle cx="44" cy="52" r="1.5" fill="#87CEEB" opacity="0.6" />
    </G>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
