/**
 * HamsterView.js
 * SVG-based hamster character with states and growth stages
 * Based on hamster-character-style-guide.md
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Path,
  G,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';

// Color palette from style guide
const Colors = {
  mainFur: '#F5A623',
  mainFurDark: '#E09515',
  belly: '#FFECD2',
  bellyDark: '#FFE0B8',
  nose: '#E8919A',
  noseDark: '#D47A84',
  eyes: '#4A3728',
  eyeHighlight: '#FFFFFF',
  headband: '#FF6B6B',
  headbandDark: '#E85555',
  blush: '#FFCDD2',
};

// Outfit colors by ID
const OutfitColors = {
  'outfit-1': { primary: '#AF52DE', secondary: '#FFECD2' }, // Cozy Sweater - purple/cream
  'outfit-2': { primary: '#007AFF', secondary: '#FFFFFF' }, // Athlete Jersey - blue/white
  'outfit-3': { primary: '#FFFFFF', secondary: '#87CEEB' }, // Bathrobe - white/light blue
};

// Accessory colors by ID
const AccessoryColors = {
  'acc-1': '#1C1C1E', // Cool Sunglasses - black
  'acc-3': '#FFD700', // Golden Crown - gold
  'acc-5': '#FF9FF3', // Flower Crown - pink
};

// Growth stage size multipliers
const GrowthSizes = {
  baby: 0.7,
  juvenile: 0.85,
  adult: 1.0,
  mature: 1.05,
};

// Eye expressions by state
const getEyeExpression = (state) => {
  switch (state) {
    case 'happy':
      return 'closed'; // Happy closed eyes (^_^)
    case 'chillin':
      return 'relaxed'; // Half-lidded
    case 'hungry':
      return 'hopeful'; // Big open eyes looking up
    case 'sad':
      return 'sad'; // Droopy, slightly watery
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
  growthStage = 'adult',
  size = 150,
  showHeadband = true,
  accessoryColor = Colors.headband,
  equippedOutfit = null,
  equippedAccessory = null,
}) {
  const outfitColors = equippedOutfit ? OutfitColors[equippedOutfit] : null;
  const accessoryColorValue = equippedAccessory ? AccessoryColors[equippedAccessory] : null;
  const scale = GrowthSizes[growthStage] || 1;
  const scaledSize = size * scale;
  const eyeType = getEyeExpression(state);
  const mouthType = getMouthExpression(state);

  // Adjust proportions for baby (bigger head ratio)
  const isBaby = growthStage === 'baby';
  const headScale = isBaby ? 1.15 : 1;

  return (
    <View style={[styles.container, { width: scaledSize, height: scaledSize }]}>
      <Svg
        width={scaledSize}
        height={scaledSize}
        viewBox="0 0 100 100"
      >
        <Defs>
          <RadialGradient id="furGradient" cx="50%" cy="30%" r="60%">
            <Stop offset="0%" stopColor={Colors.mainFur} />
            <Stop offset="100%" stopColor={Colors.mainFurDark} />
          </RadialGradient>
          <RadialGradient id="bellyGradient" cx="50%" cy="40%" r="50%">
            <Stop offset="0%" stopColor={Colors.belly} />
            <Stop offset="100%" stopColor={Colors.bellyDark} />
          </RadialGradient>
        </Defs>

        {/* Body */}
        <G transform={`scale(${headScale}) translate(${isBaby ? -7.5 : 0}, ${isBaby ? -5 : 0})`}>
          {/* Main body */}
          <Ellipse
            cx="50"
            cy="58"
            rx="32"
            ry="28"
            fill="url(#furGradient)"
          />

          {/* Belly */}
          <Ellipse
            cx="50"
            cy="62"
            rx="22"
            ry="20"
            fill="url(#bellyGradient)"
          />

          {/* Head */}
          <Circle
            cx="50"
            cy="38"
            r="28"
            fill="url(#furGradient)"
          />

          {/* Left ear */}
          <Ellipse
            cx="28"
            cy="18"
            rx="8"
            ry="10"
            fill={Colors.mainFur}
            transform={state === 'sad' ? 'rotate(-15, 28, 18)' : ''}
          />
          <Ellipse
            cx="28"
            cy="19"
            rx="5"
            ry="6"
            fill={Colors.belly}
          />

          {/* Right ear */}
          <Ellipse
            cx="72"
            cy="18"
            rx="8"
            ry="10"
            fill={Colors.mainFur}
            transform={state === 'sad' ? 'rotate(15, 72, 18)' : ''}
          />
          <Ellipse
            cx="72"
            cy="19"
            rx="5"
            ry="6"
            fill={Colors.belly}
          />

          {/* Headband */}
          {showHeadband && (
            <G>
              <Path
                d="M 25 32 Q 50 22, 75 32"
                stroke={accessoryColor}
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              {/* Headband knot */}
              <Circle cx="75" cy="32" r="4" fill={accessoryColor} />
              <Path
                d="M 77 30 L 82 25 M 77 34 L 82 38"
                stroke={accessoryColor}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </G>
          )}

          {/* Left cheek pouch */}
          <Ellipse
            cx="30"
            cy="45"
            rx="12"
            ry="10"
            fill={Colors.belly}
          />
          {/* Blush on left cheek */}
          <Ellipse
            cx="28"
            cy="46"
            rx="6"
            ry="4"
            fill={Colors.blush}
            opacity="0.5"
          />

          {/* Right cheek pouch */}
          <Ellipse
            cx="70"
            cy="45"
            rx="12"
            ry="10"
            fill={Colors.belly}
          />
          {/* Blush on right cheek */}
          <Ellipse
            cx="72"
            cy="46"
            rx="6"
            ry="4"
            fill={Colors.blush}
            opacity="0.5"
          />

          {/* Eyes */}
          <HamsterEyes type={eyeType} />

          {/* Nose */}
          <Ellipse
            cx="50"
            cy="44"
            rx="4"
            ry="3"
            fill={Colors.nose}
          />
          {/* Nose highlight */}
          <Ellipse
            cx="49"
            cy="43"
            rx="1.5"
            ry="1"
            fill={Colors.eyeHighlight}
            opacity="0.6"
          />

          {/* Mouth */}
          <HamsterMouth type={mouthType} />

          {/* Whiskers */}
          <G opacity="0.3" stroke={Colors.mainFurDark} strokeWidth="0.8">
            {/* Left whiskers */}
            <Path d="M 22 42 L 12 40" />
            <Path d="M 22 45 L 10 46" />
            <Path d="M 22 48 L 12 52" />
            {/* Right whiskers */}
            <Path d="M 78 42 L 88 40" />
            <Path d="M 78 45 L 90 46" />
            <Path d="M 78 48 L 88 52" />
          </G>

          {/* Arms/Paws */}
          <Ellipse
            cx="25"
            cy="65"
            rx="8"
            ry="6"
            fill={Colors.mainFur}
            transform="rotate(-20, 25, 65)"
          />
          <Ellipse
            cx="75"
            cy="65"
            rx="8"
            ry="6"
            fill={Colors.mainFur}
            transform="rotate(20, 75, 65)"
          />

          {/* Feet */}
          <Ellipse
            cx="35"
            cy="82"
            rx="10"
            ry="6"
            fill={Colors.mainFur}
          />
          <Ellipse
            cx="65"
            cy="82"
            rx="10"
            ry="6"
            fill={Colors.mainFur}
          />
          {/* Toe beans */}
          <Circle cx="32" cy="83" r="2" fill={Colors.nose} opacity="0.7" />
          <Circle cx="36" cy="84" r="2" fill={Colors.nose} opacity="0.7" />
          <Circle cx="64" cy="84" r="2" fill={Colors.nose} opacity="0.7" />
          <Circle cx="68" cy="83" r="2" fill={Colors.nose} opacity="0.7" />

          {/* Equipped Outfit */}
          {equippedOutfit && outfitColors && (
            <HamsterOutfit outfitId={equippedOutfit} colors={outfitColors} />
          )}

          {/* Equipped Accessory */}
          {equippedAccessory && (
            <HamsterAccessory accessoryId={equippedAccessory} color={accessoryColorValue} />
          )}

          {/* State-specific decorations */}
          {state === 'happy' && <HappySparkles />}
          {state === 'hungry' && <HungryIndicator />}
          {state === 'sad' && <SadTear />}
        </G>
      </Svg>
    </View>
  );
}

// Outfit rendering based on outfit ID
// Body reference: Ellipse cx=50, cy=58, rx=32, ry=28 (body spans x:18-82, y:30-86)
// Belly: cx=50, cy=62, rx=22, ry=20
function HamsterOutfit({ outfitId, colors }) {
  switch (outfitId) {
    case 'outfit-1': // Cozy Sweater - fitted to body curve
      return (
        <G>
          {/* Main sweater body - follows body ellipse */}
          <Path
            d="M 22 55
               Q 20 65, 22 75
               Q 35 82, 50 82
               Q 65 82, 78 75
               Q 80 65, 78 55
               Q 65 48, 50 48
               Q 35 48, 22 55 Z"
            fill={colors.primary}
          />
          {/* Neckline */}
          <Path
            d="M 38 50 Q 50 55, 62 50"
            stroke={colors.secondary}
            strokeWidth="3"
            fill="none"
          />
          {/* Sweater stripes */}
          <Path d="M 25 60 Q 50 63, 75 60" stroke={colors.secondary} strokeWidth="2" opacity="0.5" fill="none" />
          <Path d="M 24 68 Q 50 71, 76 68" stroke={colors.secondary} strokeWidth="2" opacity="0.5" fill="none" />
          <Path d="M 26 76 Q 50 79, 74 76" stroke={colors.secondary} strokeWidth="2" opacity="0.5" fill="none" />
        </G>
      );

    case 'outfit-2': // Athlete Jersey - sporty fit
      return (
        <G>
          {/* Jersey body */}
          <Path
            d="M 24 52
               Q 22 62, 24 72
               Q 35 78, 50 78
               Q 65 78, 76 72
               Q 78 62, 76 52
               Q 65 46, 50 46
               Q 35 46, 24 52 Z"
            fill={colors.primary}
          />
          {/* White panel */}
          <Path
            d="M 38 50
               Q 36 60, 38 70
               L 62 70
               Q 64 60, 62 50 Z"
            fill={colors.secondary}
            opacity="0.9"
          />
          {/* Number */}
          <Circle cx="50" cy="60" r="5" fill={colors.primary} />
        </G>
      );

    case 'outfit-3': // Bathrobe - fluffy and cozy
      return (
        <G>
          {/* Bathrobe body */}
          <Path
            d="M 20 50
               Q 18 62, 20 78
               Q 35 85, 50 85
               Q 65 85, 80 78
               Q 82 62, 80 50
               Q 65 44, 50 44
               Q 35 44, 20 50 Z"
            fill={colors.primary}
          />
          {/* Fluffy collar left */}
          <Path
            d="M 30 48 Q 35 52, 42 56 Q 38 58, 35 55 Q 32 52, 30 48"
            fill={colors.secondary}
          />
          {/* Fluffy collar right */}
          <Path
            d="M 70 48 Q 65 52, 58 56 Q 62 58, 65 55 Q 68 52, 70 48"
            fill={colors.secondary}
          />
          {/* V-neck opening */}
          <Path
            d="M 42 52 L 50 68 L 58 52"
            stroke={Colors.belly}
            strokeWidth="8"
            fill="none"
            strokeLinejoin="round"
          />
          {/* Belt */}
          <Ellipse cx="50" cy="70" rx="28" ry="4" fill={colors.secondary} />
          {/* Belt knot */}
          <Circle cx="50" cy="70" r="4" fill={colors.secondary} />
          <Path d="M 50 74 L 48 82 M 50 74 L 52 82" stroke={colors.secondary} strokeWidth="3" />
        </G>
      );

    default:
      return null;
  }
}

// Accessory rendering based on accessory ID
// Head reference: Circle cx=50, cy=38, r=28 (head spans x:22-78, y:10-66)
// Eyes at around y=36, nose at y=44
function HamsterAccessory({ accessoryId, color }) {
  switch (accessoryId) {
    case 'acc-1': // Cool Sunglasses - sits on face properly
      return (
        <G>
          {/* Left lens */}
          <Ellipse cx="38" cy="36" rx="9" ry="7" fill={color} />
          {/* Right lens */}
          <Ellipse cx="62" cy="36" rx="9" ry="7" fill={color} />
          {/* Bridge */}
          <Path d="M 47 36 Q 50 38, 53 36" stroke={color} strokeWidth="2.5" fill="none" />
          {/* Left arm */}
          <Path d="M 29 34 L 22 30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          {/* Right arm */}
          <Path d="M 71 34 L 78 30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          {/* Lens shine */}
          <Ellipse cx="35" cy="34" rx="3" ry="2" fill="#FFFFFF" opacity="0.3" />
          <Ellipse cx="59" cy="34" rx="3" ry="2" fill="#FFFFFF" opacity="0.3" />
        </G>
      );

    case 'acc-3': // Golden Crown - sits on top of head
      return (
        <G>
          {/* Crown base */}
          <Path
            d="M 28 18 L 28 24 Q 50 28, 72 24 L 72 18 Z"
            fill={color}
          />
          {/* Crown points */}
          <Path
            d="M 28 18 L 32 8 L 38 16 L 50 4 L 62 16 L 68 8 L 72 18"
            fill={color}
            stroke={color}
            strokeWidth="1"
          />
          {/* Jewels */}
          <Circle cx="50" cy="12" r="3" fill="#FF3B30" />
          <Circle cx="36" cy="14" r="2" fill="#5856D6" />
          <Circle cx="64" cy="14" r="2" fill="#34C759" />
          {/* Crown band detail */}
          <Path d="M 30 22 L 70 22" stroke="#B8860B" strokeWidth="2" />
        </G>
      );

    case 'acc-5': // Flower Crown - wraps around head
      return (
        <G>
          {/* Vine base */}
          <Path
            d="M 22 26 Q 35 18, 50 16 Q 65 18, 78 26"
            stroke="#34C759"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Small leaves */}
          <Ellipse cx="30" cy="22" rx="4" ry="2" fill="#2ECC71" transform="rotate(-30, 30, 22)" />
          <Ellipse cx="70" cy="22" rx="4" ry="2" fill="#2ECC71" transform="rotate(30, 70, 22)" />
          {/* Left flower */}
          <Circle cx="32" cy="20" r="6" fill={color} />
          <Circle cx="32" cy="20" r="3" fill="#FFD93D" />
          {/* Center flower */}
          <Circle cx="50" cy="14" r="7" fill="#FFD93D" />
          <Circle cx="50" cy="14" r="3" fill="#FFFFFF" />
          {/* Right flower */}
          <Circle cx="68" cy="20" r="6" fill="#FF6B6B" />
          <Circle cx="68" cy="20" r="3" fill="#FFD93D" />
          {/* Extra small flowers */}
          <Circle cx="42" cy="16" r="4" fill="#87CEEB" />
          <Circle cx="58" cy="16" r="4" fill="#DDA0DD" />
        </G>
      );

    default:
      return null;
  }
}

// Eye component based on expression type
function HamsterEyes({ type }) {
  switch (type) {
    case 'closed':
      // Happy closed eyes (^_^)
      return (
        <G>
          <Path
            d="M 36 36 Q 40 32, 44 36"
            stroke={Colors.eyes}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 56 36 Q 60 32, 64 36"
            stroke={Colors.eyes}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );

    case 'relaxed':
      // Half-lidded relaxed eyes
      return (
        <G>
          <Ellipse cx="40" cy="36" rx="5" ry="3" fill={Colors.eyes} />
          <Ellipse cx="60" cy="36" rx="5" ry="3" fill={Colors.eyes} />
          <Circle cx="38" cy="35" r="1" fill={Colors.eyeHighlight} />
          <Circle cx="58" cy="35" r="1" fill={Colors.eyeHighlight} />
        </G>
      );

    case 'hopeful':
      // Big puppy eyes looking up
      return (
        <G>
          <Circle cx="40" cy="35" r="7" fill={Colors.eyes} />
          <Circle cx="60" cy="35" r="7" fill={Colors.eyes} />
          {/* Large highlights for puppy eyes effect */}
          <Circle cx="38" cy="33" r="2.5" fill={Colors.eyeHighlight} />
          <Circle cx="58" cy="33" r="2.5" fill={Colors.eyeHighlight} />
          <Circle cx="42" cy="37" r="1.2" fill={Colors.eyeHighlight} />
          <Circle cx="62" cy="37" r="1.2" fill={Colors.eyeHighlight} />
        </G>
      );

    case 'sad':
      // Droopy sad eyes
      return (
        <G>
          <Ellipse cx="40" cy="37" rx="5" ry="4" fill={Colors.eyes} />
          <Ellipse cx="60" cy="37" rx="5" ry="4" fill={Colors.eyes} />
          {/* Droopy eyelids */}
          <Path
            d="M 34 34 Q 40 32, 46 35"
            stroke={Colors.mainFur}
            strokeWidth="3"
            fill="none"
          />
          <Path
            d="M 54 35 Q 60 32, 66 34"
            stroke={Colors.mainFur}
            strokeWidth="3"
            fill="none"
          />
          <Circle cx="38" cy="36" r="1.5" fill={Colors.eyeHighlight} />
          <Circle cx="58" cy="36" r="1.5" fill={Colors.eyeHighlight} />
        </G>
      );

    default:
      // Normal open eyes
      return (
        <G>
          <Circle cx="40" cy="36" r="5" fill={Colors.eyes} />
          <Circle cx="60" cy="36" r="5" fill={Colors.eyes} />
          <Circle cx="38" cy="34" r="2" fill={Colors.eyeHighlight} />
          <Circle cx="58" cy="34" r="2" fill={Colors.eyeHighlight} />
        </G>
      );
  }
}

// Mouth component based on expression type
function HamsterMouth({ type }) {
  switch (type) {
    case 'big-smile':
      return (
        <Path
          d="M 42 50 Q 50 58, 58 50"
          stroke={Colors.noseDark}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );

    case 'content':
      return (
        <Path
          d="M 45 50 Q 50 53, 55 50"
          stroke={Colors.noseDark}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      );

    case 'small-o':
      return (
        <Ellipse
          cx="50"
          cy="51"
          rx="3"
          ry="4"
          fill={Colors.noseDark}
        />
      );

    case 'frown':
      return (
        <Path
          d="M 45 52 Q 50 49, 55 52"
          stroke={Colors.noseDark}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      );

    default:
      return (
        <Path
          d="M 45 50 Q 50 54, 55 50"
          stroke={Colors.noseDark}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      );
  }
}

// Happy sparkles decoration
function HappySparkles() {
  return (
    <G fill="#FFD700">
      <Path d="M 15 25 L 17 22 L 19 25 L 22 23 L 19 25 L 17 28 L 15 25" />
      <Path d="M 80 20 L 82 17 L 84 20 L 87 18 L 84 20 L 82 23 L 80 20" />
      <Circle cx="85" cy="28" r="1.5" />
      <Circle cx="12" cy="32" r="1.5" />
    </G>
  );
}

// Hungry belly rumble indicator
function HungryIndicator() {
  return (
    <G opacity="0.4">
      <Path
        d="M 40 70 Q 42 68, 44 70 Q 46 72, 48 70"
        stroke={Colors.mainFurDark}
        strokeWidth="1"
        fill="none"
      />
      <Path
        d="M 52 70 Q 54 68, 56 70 Q 58 72, 60 70"
        stroke={Colors.mainFurDark}
        strokeWidth="1"
        fill="none"
      />
    </G>
  );
}

// Sad tear decoration
function SadTear() {
  return (
    <G>
      <Ellipse
        cx="45"
        cy="42"
        rx="2"
        ry="3"
        fill="#87CEEB"
        opacity="0.7"
      />
    </G>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
