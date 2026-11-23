// Storybook UI parts: the shared building blocks of the redesign.
// StoryCard   - outlined card with a solid "sticker" shadow (works the same on iOS and Android)
// StoryButton - chunky pressable button; it sinks into its shadow when pressed
// StoryChip   - small outlined pill for choices (time, filters)
// StoryIcon   - custom icon art (art="..."), or an outlined circle holding a stock icon
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Outline, Radius } from '../../config/theme';
import AppIcon, { hasAppIcon } from './AppIcon';

const S = Outline.shadow;

// style -> the card itself; containerStyle -> spacing around it (margins)
export function StoryCard({ children, style, containerStyle, color = Colors.surface, radius = Radius.md, shadow = true, padded = true }) {
  return (
    <View style={[{ marginRight: shadow ? S : 0, marginBottom: shadow ? S : 0 }, containerStyle]}>
      {shadow && (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { top: S, left: S, right: -S, bottom: -S, backgroundColor: Colors.ink, borderRadius: radius }]}
        />
      )}
      <View
        style={[
          {
            backgroundColor: color,
            borderRadius: radius,
            borderWidth: Outline.width,
            borderColor: Colors.ink,
            padding: padded ? 16 : 0,
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const BUTTON_VARIANTS = {
  primary: { bg: Colors.brand, fg: Colors.ink },
  secondary: { bg: Colors.surface, fg: Colors.ink },
  success: { bg: Colors.successFill, fg: Colors.ink },
  soft: { bg: Colors.peach, fg: Colors.ink },
};

export function StoryButton({
  title,
  onPress,
  icon,
  variant = 'primary',
  size = 'lg',
  style,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}) {
  const [pressed, setPressed] = useState(false);
  const v = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  const shift = pressed ? 3 : 0;
  const small = size === 'sm';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={[{ marginRight: 3, marginBottom: 3, opacity: disabled ? 0.55 : 1 }, style]}
    >
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { top: 3, left: 3, right: -3, bottom: -3, backgroundColor: Colors.ink, borderRadius: Radius.md }]}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          minHeight: small ? 44 : 54,
          paddingHorizontal: small ? 16 : 20,
          backgroundColor: v.bg,
          borderRadius: Radius.md,
          borderWidth: Outline.width,
          borderColor: Colors.ink,
          transform: [{ translateX: shift }, { translateY: shift }],
        }}
      >
        {icon ? <Ionicons name={icon} size={small ? 18 : 20} color={v.fg} /> : null}
        <Text style={{ fontFamily: Fonts.bodyHeavy, fontSize: small ? 15 : 17, color: v.fg }}>{title}</Text>
      </View>
    </Pressable>
  );
}

export function StoryChip({ label, selected = false, onPress, accessibilityLabel }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel || label}
      style={{
        flex: 1,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Radius.pill,
        borderWidth: Outline.width,
        borderColor: Colors.ink,
        backgroundColor: selected ? Colors.brand : Colors.surface,
      }}
    >
      <Text style={{ fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink }}>{label}</Text>
    </Pressable>
  );
}

// art: a custom icon name (design/icons). Falls back to the stock icon `name` if missing.
export function StoryIcon({ name, art, size = 44, color = Colors.peach, iconColor = Colors.ink }) {
  // Custom art has its own ink outline, so it renders bare (no second circle)
  if (hasAppIcon(art)) return <AppIcon name={art} size={size} />;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        borderWidth: Outline.width,
        borderColor: Colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={Math.round(size * 0.5)} color={iconColor} />
    </View>
  );
}

export default { StoryCard, StoryButton, StoryChip, StoryIcon };
