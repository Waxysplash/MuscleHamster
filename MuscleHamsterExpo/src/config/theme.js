// Muscle Hamster design system: "Storybook" (Phase 3 redesign, Nov 2026)
// Chunky warm-brown outlines, sticker-style offset shadows, Quicksand headings,
// Nunito text, sentence case, warm colours only (brand guide: muscle-hamster-visual-brain.md).
// Every text/background pair below is contrast-checked against WCAG AA (4.5:1).

export const Colors = {
  // Surfaces
  background: '#FFF4E6',     // warm paper
  backgroundAlt: '#FFF8F0',  // cream (brand)
  surface: '#FFFFFF',
  peach: '#FFE3B8',          // highlight blocks (ink text 9.1:1)
  sand: '#F3E6D6',           // quiet blocks
  mint: '#DDF2D8',           // done / success blocks
  sky: '#D9EEF2',            // steps blocks (ink text 9.4:1)

  // Ink
  ink: '#4A3728',            // outlines, sticker shadows, main text
  text: '#4A3728',
  textSecondary: '#6B5D52',  // 5.8:1 on paper
  textOnDark: '#FFF8F0',

  // Brand
  brand: '#FF9500',          // button fills with INK text (5.1:1), big shapes
  brandSoft: '#FFB347',      // softer button fill with ink text (6.3:1)
  buttonOrange: '#B85A00',   // orange behind WHITE text only (4.7:1)
  brown: '#8B5A2B',          // labels and emphasis (5.4:1 on paper)
  textOrange: '#A65000',     // orange TEXT on light backgrounds (5.1:1 on paper)
  success: '#2E7D32',
  successFill: '#7BC67E',    // with ink text (5.5:1)
  teal: '#1A7F91',
  border: '#E5DDD5',         // quiet dividers only; outlines use `ink`
};

export const Fonts = {
  heading: 'Quicksand_700Bold',
  headingSemi: 'Quicksand_600SemiBold',
  body: 'Nunito_400Regular',
  bodySemi: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyHeavy: 'Nunito_800ExtraBold',
};

export const Type = {
  small: 14,   // minimum for anything people need to read
  body: 16,
  large: 18,
  title: 22,
  hero: 28,
};

export const Outline = {
  width: 2.5,
  color: Colors.ink,
  shadow: 4,   // sticker shadow offset (px)
};

export const Radius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
};

export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

// Text style presets: <Text style={[T.body, ...]}>
export const T = {
  hero: { fontFamily: Fonts.heading, fontSize: Type.hero, color: Colors.ink },
  title: { fontFamily: Fonts.heading, fontSize: Type.title, color: Colors.ink },
  heading: { fontFamily: Fonts.heading, fontSize: Type.large, color: Colors.ink },
  body: { fontFamily: Fonts.body, fontSize: Type.body, color: Colors.text, lineHeight: 23 },
  bodyBold: { fontFamily: Fonts.bodyBold, fontSize: Type.body, color: Colors.text },
  small: { fontFamily: Fonts.body, fontSize: Type.small, color: Colors.textSecondary, lineHeight: 20 },
  label: { fontFamily: Fonts.bodyBold, fontSize: Type.small, color: Colors.brown },
};

export default { Colors, Fonts, Type, Outline, Radius, Space, T };
