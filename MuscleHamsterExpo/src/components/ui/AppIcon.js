// AppIcon - the custom Muscle Hamster icon set (design/icons, Nov 2026)
// <AppIcon name="tab_today" size={28} />  Renders nothing if the name is unknown.
import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import ICONS from '../../assets/icons/iconSet';

export const hasAppIcon = (name) => !!(name && ICONS[name]);

export default function AppIcon({ name, size = 28, style, opacity = 1 }) {
  const xml = ICONS[name];
  if (!xml) return null;
  return (
    <View style={[{ width: size, height: size, opacity }, style]} accessible={false} importantForAccessibility="no">
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
}
