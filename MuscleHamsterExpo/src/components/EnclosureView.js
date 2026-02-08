/**
 * EnclosureView.js
 * Hamster enclosure/habitat with background and decorations
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Ellipse,
  Path,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import HamsterView from './HamsterView';

// Enclosure colors from style guide
const Colors = {
  skyTop: '#87CEEB',
  skyBottom: '#4ECDC4',
  grassLight: '#A8E6CF',
  grassDark: '#7BC47F',
  ground: '#8B7355',
  groundLight: '#A08060',
  wood: '#DEB887',
  woodDark: '#B8860B',
  flower1: '#FF6B6B',
  flower2: '#FFD93D',
  flower3: '#FF9FF3',
  leaf: '#2ECC71',
};

export default function EnclosureView({
  hamsterState = 'happy',
  growthStage = 'adult',
  width = 300,
  height = 250,
  showWheel = true,
  showPlants = true,
  showBowl = true,
  placedItems = [],
  equippedOutfit = null,
  equippedAccessory = null,
}) {
  const hamsterSize = Math.min(width * 0.45, height * 0.55);

  // Check if specific enclosure items are placed
  const hasRainbowWheel = placedItems.includes('enc-1');
  const hasHammock = placedItems.includes('enc-2');
  const hasCastle = placedItems.includes('enc-3');
  const hasPlants = placedItems.includes('enc-4') || showPlants;
  const hasTunnel = placedItems.includes('enc-5');
  const hasTreehouse = placedItems.includes('enc-6');
  const hasPool = placedItems.includes('enc-7');
  const hasFairyLights = placedItems.includes('enc-8');

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Background SVG */}
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={Colors.skyTop} />
            <Stop offset="100%" stopColor={Colors.skyBottom} />
          </LinearGradient>
          <LinearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={Colors.grassLight} />
            <Stop offset="100%" stopColor={Colors.grassDark} />
          </LinearGradient>
          <LinearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={Colors.groundLight} />
            <Stop offset="100%" stopColor={Colors.ground} />
          </LinearGradient>
        </Defs>

        {/* Sky background */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#skyGradient)" />

        {/* Clouds */}
        <G opacity="0.7">
          <Cloud x={width * 0.15} y={height * 0.1} scale={0.8} />
          <Cloud x={width * 0.7} y={height * 0.15} scale={0.6} />
          <Cloud x={width * 0.45} y={height * 0.05} scale={0.5} />
        </G>

        {/* Sun */}
        <G>
          <Circle cx={width * 0.85} cy={height * 0.15} r={20} fill="#FFD93D" />
          <Circle cx={width * 0.85} cy={height * 0.15} r={16} fill="#FFEB3B" />
          {/* Sun rays */}
          <G stroke="#FFD93D" strokeWidth="2" opacity="0.6">
            <Path d={`M ${width * 0.85} ${height * 0.15 - 28} L ${width * 0.85} ${height * 0.15 - 35}`} />
            <Path d={`M ${width * 0.85} ${height * 0.15 + 28} L ${width * 0.85} ${height * 0.15 + 35}`} />
            <Path d={`M ${width * 0.85 - 28} ${height * 0.15} L ${width * 0.85 - 35} ${height * 0.15}`} />
            <Path d={`M ${width * 0.85 + 28} ${height * 0.15} L ${width * 0.85 + 35} ${height * 0.15}`} />
          </G>
        </G>

        {/* Hills in background */}
        <Path
          d={`M 0 ${height * 0.55} Q ${width * 0.25} ${height * 0.4}, ${width * 0.5} ${height * 0.55} T ${width} ${height * 0.5} L ${width} ${height * 0.65} L 0 ${height * 0.65} Z`}
          fill={Colors.grassLight}
          opacity="0.5"
        />

        {/* Main grass area */}
        <Path
          d={`M 0 ${height * 0.6} Q ${width * 0.3} ${height * 0.55}, ${width * 0.5} ${height * 0.6} T ${width} ${height * 0.58} L ${width} ${height} L 0 ${height} Z`}
          fill="url(#grassGradient)"
        />

        {/* Ground/dirt path */}
        <Ellipse
          cx={width * 0.5}
          cy={height * 0.85}
          rx={width * 0.35}
          ry={height * 0.12}
          fill="url(#groundGradient)"
        />

        {/* Grass tufts */}
        <GrassTufts width={width} height={height} />

        {/* Exercise wheel - rainbow if purchased */}
        {(showWheel || hasRainbowWheel) && (
          <G transform={`translate(${width * 0.12}, ${height * 0.45})`}>
            <ExerciseWheel size={width * 0.22} rainbow={hasRainbowWheel} />
          </G>
        )}

        {/* Hammock */}
        {hasHammock && (
          <G transform={`translate(${width * 0.7}, ${height * 0.35})`}>
            <Hammock width={width * 0.2} />
          </G>
        )}

        {/* Mini Castle */}
        {hasCastle && (
          <G transform={`translate(${width * 0.75}, ${height * 0.45})`}>
            <MiniCastle size={width * 0.18} />
          </G>
        )}

        {/* Adventure Tunnel */}
        {hasTunnel && (
          <G transform={`translate(${width * 0.55}, ${height * 0.72})`}>
            <AdventureTunnel width={width * 0.25} />
          </G>
        )}

        {/* Treehouse */}
        {hasTreehouse && (
          <G transform={`translate(${width * 0.02}, ${height * 0.25})`}>
            <Treehouse size={width * 0.2} />
          </G>
        )}

        {/* Tiny Pool */}
        {hasPool && (
          <G transform={`translate(${width * 0.6}, ${height * 0.75})`}>
            <TinyPool size={width * 0.15} />
          </G>
        )}

        {/* Fairy Lights */}
        {hasFairyLights && (
          <FairyLights width={width} height={height} />
        )}

        {/* Plants/flowers */}
        {showPlants && (
          <G>
            <Flower x={width * 0.08} y={height * 0.58} color={Colors.flower1} />
            <Flower x={width * 0.88} y={height * 0.55} color={Colors.flower2} />
            <Flower x={width * 0.92} y={height * 0.62} color={Colors.flower3} />
            <Plant x={width * 0.05} y={height * 0.65} />
            <Plant x={width * 0.9} y={height * 0.68} />
          </G>
        )}

        {/* Food bowl */}
        {showBowl && (
          <G transform={`translate(${width * 0.75}, ${height * 0.7})`}>
            <FoodBowl size={width * 0.12} />
          </G>
        )}

        {/* Small decorative elements */}
        <G opacity="0.6">
          <Circle cx={width * 0.2} cy={height * 0.88} r={3} fill="#A08060" />
          <Circle cx={width * 0.65} cy={height * 0.9} r={2} fill="#A08060" />
          <Circle cx={width * 0.4} cy={height * 0.92} r={2.5} fill="#A08060" />
        </G>
      </Svg>

      {/* Hamster (positioned in center-bottom of enclosure) */}
      <View style={[styles.hamsterWrapper, { bottom: height * 0.08 }]}>
        <HamsterView
          state={hamsterState}
          growthStage={growthStage}
          size={hamsterSize}
          showHeadband={!equippedAccessory}
          equippedOutfit={equippedOutfit}
          equippedAccessory={equippedAccessory}
        />
      </View>
    </View>
  );
}

// Cloud component
function Cloud({ x, y, scale = 1 }) {
  return (
    <G transform={`translate(${x}, ${y}) scale(${scale})`}>
      <Circle cx="0" cy="0" r="15" fill="#FFFFFF" />
      <Circle cx="12" cy="-5" r="12" fill="#FFFFFF" />
      <Circle cx="24" cy="0" r="14" fill="#FFFFFF" />
      <Circle cx="10" cy="8" r="10" fill="#FFFFFF" />
      <Circle cx="20" cy="6" r="11" fill="#FFFFFF" />
    </G>
  );
}

// Exercise wheel component
function ExerciseWheel({ size, rainbow = false }) {
  const radius = size / 2;
  const wheelColor = rainbow ? '#FF6B6B' : Colors.flower1;
  const rainbowColors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6'];

  return (
    <G>
      {/* Stand */}
      <Rect
        x={radius - 4}
        y={radius + 5}
        width={8}
        height={size * 0.4}
        fill={Colors.woodDark}
        rx={2}
      />
      <Rect
        x={radius - 15}
        y={radius + size * 0.4}
        width={30}
        height={6}
        fill={Colors.wood}
        rx={3}
      />

      {/* Wheel - rainbow or solid */}
      {rainbow ? (
        <G>
          {rainbowColors.map((color, i) => {
            const angle = (i * 60) * Math.PI / 180;
            const x1 = radius + Math.cos(angle) * (radius - 2);
            const y1 = radius + Math.sin(angle) * (radius - 2);
            const x2 = radius + Math.cos(angle + Math.PI) * (radius - 2);
            const y2 = radius + Math.sin(angle + Math.PI) * (radius - 2);
            return (
              <Path
                key={i}
                d={`M ${x1} ${y1} A ${radius - 2} ${radius - 2} 0 0 1 ${radius + Math.cos(angle + Math.PI/3) * (radius - 2)} ${radius + Math.sin(angle + Math.PI/3) * (radius - 2)}`}
                stroke={color}
                strokeWidth={5}
                fill="none"
              />
            );
          })}
        </G>
      ) : (
        <>
          <Circle
            cx={radius}
            cy={radius}
            r={radius}
            fill="none"
            stroke={wheelColor}
            strokeWidth={4}
          />
          <Circle
            cx={radius}
            cy={radius}
            r={radius - 6}
            fill="none"
            stroke={wheelColor}
            strokeWidth={2}
            opacity={0.5}
          />
        </>
      )}

      {/* Wheel spokes */}
      <G stroke={rainbow ? '#FFD700' : wheelColor} strokeWidth={2} opacity={0.7}>
        <Path d={`M ${radius} ${radius - radius + 6} L ${radius} ${radius + radius - 6}`} />
        <Path d={`M ${radius - radius + 6} ${radius} L ${radius + radius - 6} ${radius}`} />
        <Path d={`M ${radius - radius * 0.6} ${radius - radius * 0.6} L ${radius + radius * 0.6} ${radius + radius * 0.6}`} />
        <Path d={`M ${radius + radius * 0.6} ${radius - radius * 0.6} L ${radius - radius * 0.6} ${radius + radius * 0.6}`} />
      </G>

      {/* Center hub */}
      <Circle cx={radius} cy={radius} r={6} fill={rainbow ? '#FFD700' : Colors.woodDark} />
      <Circle cx={radius} cy={radius} r={3} fill={rainbow ? '#FFFFFF' : Colors.wood} />
    </G>
  );
}

// Hammock component
function Hammock({ width }) {
  return (
    <G>
      {/* Posts */}
      <Rect x={0} y={0} width={4} height={40} fill={Colors.wood} />
      <Rect x={width - 4} y={0} width={4} height={40} fill={Colors.wood} />
      {/* Hammock fabric */}
      <Path
        d={`M 4 10 Q ${width/2} 30, ${width - 4} 10`}
        stroke="#FF9FF3"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={`M 4 10 Q ${width/2} 25, ${width - 4} 10`}
        stroke="#FFB8D9"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
    </G>
  );
}

// Mini Castle component
function MiniCastle({ size }) {
  return (
    <G>
      {/* Main tower */}
      <Rect x={size * 0.2} y={size * 0.3} width={size * 0.6} height={size * 0.7} fill="#E5E5EA" />
      {/* Left tower */}
      <Rect x={0} y={size * 0.4} width={size * 0.25} height={size * 0.6} fill="#D1D1D6" />
      {/* Right tower */}
      <Rect x={size * 0.75} y={size * 0.4} width={size * 0.25} height={size * 0.6} fill="#D1D1D6" />
      {/* Roofs */}
      <Path d={`M ${size * 0.2} ${size * 0.3} L ${size * 0.5} 0 L ${size * 0.8} ${size * 0.3} Z`} fill="#FF6B6B" />
      <Path d={`M 0 ${size * 0.4} L ${size * 0.125} ${size * 0.15} L ${size * 0.25} ${size * 0.4} Z`} fill="#FF6B6B" />
      <Path d={`M ${size * 0.75} ${size * 0.4} L ${size * 0.875} ${size * 0.15} L ${size} ${size * 0.4} Z`} fill="#FF6B6B" />
      {/* Door */}
      <Path d={`M ${size * 0.4} ${size} L ${size * 0.4} ${size * 0.7} A ${size * 0.1} ${size * 0.1} 0 0 1 ${size * 0.6} ${size * 0.7} L ${size * 0.6} ${size}`} fill="#8B4513" />
      {/* Windows */}
      <Circle cx={size * 0.5} cy={size * 0.5} r={size * 0.08} fill="#87CEEB" />
    </G>
  );
}

// Adventure Tunnel component
function AdventureTunnel({ width }) {
  return (
    <G>
      <Ellipse cx={0} cy={10} rx={12} ry={10} fill="#5856D6" />
      <Rect x={0} y={0} width={width} height={20} fill="#7C3AED" />
      <Ellipse cx={width} cy={10} rx={12} ry={10} fill="#5856D6" />
      {/* Tunnel opening */}
      <Ellipse cx={0} cy={10} rx={8} ry={7} fill="#1C1C1E" />
      <Ellipse cx={width} cy={10} rx={8} ry={7} fill="#1C1C1E" />
    </G>
  );
}

// Treehouse component
function Treehouse({ size }) {
  return (
    <G>
      {/* Tree trunk */}
      <Rect x={size * 0.4} y={size * 0.5} width={size * 0.2} height={size * 0.5} fill="#8B4513" />
      {/* Leaves */}
      <Circle cx={size * 0.5} cy={size * 0.35} r={size * 0.35} fill="#34C759" />
      <Circle cx={size * 0.3} cy={size * 0.45} r={size * 0.25} fill="#2ECC71" />
      <Circle cx={size * 0.7} cy={size * 0.45} r={size * 0.25} fill="#2ECC71" />
      {/* House */}
      <Rect x={size * 0.25} y={size * 0.3} width={size * 0.5} height={size * 0.3} fill={Colors.wood} />
      <Path d={`M ${size * 0.2} ${size * 0.3} L ${size * 0.5} ${size * 0.1} L ${size * 0.8} ${size * 0.3} Z`} fill="#FF6B6B" />
      {/* Window */}
      <Rect x={size * 0.4} y={size * 0.38} width={size * 0.2} height={size * 0.15} fill="#87CEEB" />
    </G>
  );
}

// Tiny Pool component
function TinyPool({ size }) {
  return (
    <G>
      <Ellipse cx={size / 2} cy={size * 0.6} rx={size / 2} ry={size * 0.3} fill="#5AC8FA" />
      <Ellipse cx={size / 2} cy={size * 0.55} rx={size * 0.4} ry={size * 0.22} fill="#87CEEB" />
      {/* Water ripples */}
      <Path
        d={`M ${size * 0.3} ${size * 0.55} Q ${size * 0.4} ${size * 0.5}, ${size * 0.5} ${size * 0.55}`}
        stroke="#FFFFFF"
        strokeWidth={1}
        fill="none"
        opacity={0.5}
      />
    </G>
  );
}

// Fairy Lights component
function FairyLights({ width, height }) {
  const lights = [];
  const colors = ['#FF6B6B', '#FFD93D', '#5AC8FA', '#FF9FF3', '#34C759'];

  for (let i = 0; i < 8; i++) {
    const x = (width / 9) * (i + 1);
    const y = height * 0.12 + Math.sin(i * 0.8) * 8;
    lights.push(
      <G key={i}>
        <Circle cx={x} cy={y} r={4} fill={colors[i % colors.length]} />
        <Circle cx={x} cy={y} r={2} fill="#FFFFFF" opacity={0.6} />
      </G>
    );
  }

  return (
    <G>
      {/* String */}
      <Path
        d={`M 0 ${height * 0.1} Q ${width * 0.25} ${height * 0.15}, ${width * 0.5} ${height * 0.1} T ${width} ${height * 0.12}`}
        stroke="#1C1C1E"
        strokeWidth={1}
        fill="none"
        opacity={0.5}
      />
      {lights}
    </G>
  );
}

// Flower component
function Flower({ x, y, color }) {
  return (
    <G transform={`translate(${x}, ${y})`}>
      {/* Stem */}
      <Path
        d="M 0 0 L 0 20"
        stroke={Colors.leaf}
        strokeWidth={2}
      />
      {/* Leaf */}
      <Ellipse cx="-4" cy="12" rx="5" ry="3" fill={Colors.leaf} transform="rotate(-30, -4, 12)" />
      {/* Petals */}
      <Circle cx="0" cy="-5" r="5" fill={color} />
      <Circle cx="5" cy="0" r="5" fill={color} />
      <Circle cx="0" cy="5" r="5" fill={color} />
      <Circle cx="-5" cy="0" r="5" fill={color} />
      {/* Center */}
      <Circle cx="0" cy="0" r="4" fill="#FFD93D" />
    </G>
  );
}

// Plant component
function Plant({ x, y }) {
  return (
    <G transform={`translate(${x}, ${y})`}>
      <Ellipse cx="0" cy="0" rx="8" ry="15" fill={Colors.leaf} transform="rotate(-15)" />
      <Ellipse cx="8" cy="-5" rx="6" ry="12" fill={Colors.grassLight} transform="rotate(15)" />
      <Ellipse cx="-6" cy="-3" rx="5" ry="10" fill={Colors.grassDark} transform="rotate(-25)" />
    </G>
  );
}

// Grass tufts component
function GrassTufts({ width, height }) {
  const tufts = [];
  const y = height * 0.6;

  for (let i = 0; i < 8; i++) {
    const x = (width / 9) * (i + 0.5);
    tufts.push(
      <G key={i} transform={`translate(${x}, ${y})`}>
        <Path
          d={`M 0 0 Q -3 -8, 0 -15 M 0 0 Q 0 -10, 3 -18 M 0 0 Q 4 -7, 5 -12`}
          stroke={Colors.grassDark}
          strokeWidth={1.5}
          fill="none"
        />
      </G>
    );
  }

  return <G opacity="0.8">{tufts}</G>;
}

// Food bowl component
function FoodBowl({ size }) {
  return (
    <G>
      {/* Bowl */}
      <Ellipse
        cx={size / 2}
        cy={size * 0.7}
        rx={size / 2}
        ry={size * 0.25}
        fill={Colors.flower1}
      />
      <Ellipse
        cx={size / 2}
        cy={size * 0.55}
        rx={size * 0.4}
        ry={size * 0.18}
        fill="#FF8A80"
      />
      {/* Food (seeds) */}
      <G fill="#DEB887">
        <Ellipse cx={size * 0.35} cy={size * 0.5} rx={4} ry={2.5} transform={`rotate(-20, ${size * 0.35}, ${size * 0.5})`} />
        <Ellipse cx={size * 0.5} cy={size * 0.45} rx={4} ry={2.5} transform={`rotate(15, ${size * 0.5}, ${size * 0.45})`} />
        <Ellipse cx={size * 0.65} cy={size * 0.5} rx={4} ry={2.5} transform={`rotate(-10, ${size * 0.65}, ${size * 0.5})`} />
      </G>
    </G>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.skyBottom,
  },
  hamsterWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
