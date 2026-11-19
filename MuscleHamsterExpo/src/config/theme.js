// Design tokens (start of the Phase 3 design system).
// Contrast-checked against WCAG AA (4.5:1 for normal text).
export const Colors = {
  background: '#FFF8F0',     // cream
  surface: '#FFFFFF',
  text: '#4A3728',           // dark brown, 10.5:1 on cream
  textSecondary: '#6B5D52',  // 6.0:1 on cream
  brand: '#FF9500',          // brand orange: icons, accents, big shapes (NOT behind white text)
  buttonOrange: '#B85A00',   // orange for buttons with white text: 4.7:1
  brown: '#8B5A2B',          // secondary buttons, 5.8:1 with white
  success: '#2E7D32',        // readable green for text
};

export const Type = {
  small: 14,   // minimum for any text people need to read
  body: 16,
  title: 18,
  heading: 22,
};

export default { Colors, Type };
