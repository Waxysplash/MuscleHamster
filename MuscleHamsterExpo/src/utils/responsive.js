/**
 * Responsive Design Utilities
 *
 * Provides tablet detection, responsive dimensions, and layout helpers
 * to ensure the app looks great on both iPhone and iPad.
 */
import { useState, useEffect } from 'react';
import { Dimensions, Platform, PixelRatio } from 'react-native';

// ============================================================================
// CONSTANTS
// ============================================================================

// Screen breakpoints (width in points)
export const BREAKPOINTS = {
  SMALL_PHONE: 320,   // iPhone SE (1st gen)
  PHONE: 375,         // iPhone 12/13/14
  LARGE_PHONE: 428,   // iPhone 14 Plus/Pro Max
  SMALL_TABLET: 744,  // iPad Mini
  TABLET: 820,        // iPad 10th gen
  LARGE_TABLET: 1024, // iPad Pro 11"
  XLARGE_TABLET: 1366, // iPad Pro 12.9"
};

// Maximum content width for readability (prevents content from stretching too wide on tablets)
export const MAX_CONTENT_WIDTH = 600;
export const MAX_CARD_WIDTH = 400;

// ============================================================================
// DEVICE DETECTION
// ============================================================================

/**
 * Check if the device is a tablet based on screen dimensions
 * iPad aspect ratio is ~1.33, phones are ~2.0+
 */
export const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = Math.max(width, height) / Math.min(width, height);
  // iPad aspect ratios range from ~1.33 (4:3) to ~1.43
  // Phone aspect ratios are typically 2.0+ (iPhone X and later are ~2.16)
  return aspectRatio < 1.6 && Math.min(width, height) >= 600;
};

/**
 * Check if the device is in landscape orientation
 */
export const isLandscape = () => {
  const { width, height } = Dimensions.get('window');
  return width > height;
};

/**
 * Get the current screen size category
 */
export const getScreenCategory = () => {
  const { width } = Dimensions.get('window');
  if (width >= BREAKPOINTS.LARGE_TABLET) return 'xlarge_tablet';
  if (width >= BREAKPOINTS.TABLET) return 'large_tablet';
  if (width >= BREAKPOINTS.SMALL_TABLET) return 'tablet';
  if (width >= BREAKPOINTS.LARGE_PHONE) return 'large_phone';
  if (width >= BREAKPOINTS.PHONE) return 'phone';
  return 'small_phone';
};

// ============================================================================
// RESPONSIVE HOOK
// ============================================================================

/**
 * Hook that provides responsive dimensions and updates on screen changes
 *
 * Usage:
 *   const { width, height, isTablet, isLandscape, scale, spacing } = useResponsive();
 */
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const tablet = isTablet();
  const landscape = width > height;
  const screenCategory = getScreenCategory();

  // Calculate scale factors
  const baseWidth = 375; // iPhone 12/13/14 width
  const scale = Math.min(width / baseWidth, 1.5); // Cap at 1.5x for tablets

  // Calculate responsive spacing
  const spacing = {
    // Horizontal padding - increases for tablets
    horizontal: tablet ? Math.max(32, (width - MAX_CONTENT_WIDTH) / 2) : 16,
    // Vertical padding
    vertical: tablet ? 24 : 16,
    // Gap between items
    gap: tablet ? 20 : 12,
  };

  // Calculate number of grid columns based on width
  const getGridColumns = (minItemWidth = 150) => {
    const availableWidth = Math.min(width, MAX_CONTENT_WIDTH + 64) - (spacing.horizontal * 2);
    return Math.max(2, Math.floor(availableWidth / minItemWidth));
  };

  // Get responsive font size
  const fontSize = (baseSize) => {
    if (tablet) {
      // Tablets get slightly larger fonts, but not proportionally
      return Math.round(baseSize * Math.min(scale, 1.15));
    }
    return baseSize;
  };

  // Get responsive size (for icons, images, etc.)
  const size = (baseSize, options = {}) => {
    const { maxScale = 1.5, minSize = baseSize, maxSize = baseSize * 2 } = options;
    let scaled = baseSize * Math.min(scale, maxScale);
    return Math.max(minSize, Math.min(maxSize, Math.round(scaled)));
  };

  return {
    width,
    height,
    isTablet: tablet,
    isLandscape: landscape,
    screenCategory,
    scale,
    spacing,
    getGridColumns,
    fontSize,
    size,
    // Max width for content containers
    contentMaxWidth: MAX_CONTENT_WIDTH,
    cardMaxWidth: MAX_CARD_WIDTH,
  };
};

// ============================================================================
// RESPONSIVE STYLE HELPERS
// ============================================================================

/**
 * Creates a container style that centers content with max-width on tablets
 */
export const createResponsiveContainer = (options = {}) => {
  const { width } = Dimensions.get('window');
  const tablet = isTablet();
  const { maxWidth = MAX_CONTENT_WIDTH, paddingHorizontal } = options;

  return {
    width: '100%',
    maxWidth: tablet ? maxWidth : '100%',
    alignSelf: 'center',
    paddingHorizontal: paddingHorizontal ?? (tablet ? 24 : 16),
  };
};

/**
 * Get responsive padding based on screen size
 */
export const getResponsivePadding = () => {
  const tablet = isTablet();
  return {
    paddingHorizontal: tablet ? 24 : 16,
    paddingVertical: tablet ? 20 : 16,
  };
};

/**
 * Get responsive card dimensions
 */
export const getResponsiveCardSize = (numColumns = 2) => {
  const { width } = Dimensions.get('window');
  const tablet = isTablet();
  const padding = tablet ? 24 : 16;
  const gap = tablet ? 16 : 12;
  const maxContainerWidth = Math.min(width, MAX_CONTENT_WIDTH + (padding * 2));
  const availableWidth = maxContainerWidth - (padding * 2) - (gap * (numColumns - 1));
  const cardWidth = Math.floor(availableWidth / numColumns);

  return {
    width: cardWidth,
    maxWidth: MAX_CARD_WIDTH,
  };
};

/**
 * Scale a value based on screen width
 * Useful for sizing elements that should scale with screen size
 */
export const scaleSize = (baseSize, options = {}) => {
  const { width } = Dimensions.get('window');
  const { maxScale = 1.5, baseWidth = 375 } = options;
  const scale = Math.min(width / baseWidth, maxScale);
  return Math.round(baseSize * scale);
};

/**
 * Get font scale (respects user's accessibility settings)
 */
export const getFontScale = () => {
  return PixelRatio.getFontScale();
};

// ============================================================================
// RESPONSIVE COMPONENTS HELPERS
// ============================================================================

/**
 * Calculate hamster/enclosure size based on screen
 */
export const getHamsterSize = () => {
  const { width, height } = Dimensions.get('window');
  const tablet = isTablet();

  if (tablet) {
    // On tablet, use a reasonable size that doesn't dominate the screen
    return Math.min(280, Math.min(width, height) * 0.3);
  }

  // On phone, use a percentage of width but cap it
  return Math.min(200, width * 0.5);
};

/**
 * Calculate enclosure height based on screen
 */
export const getEnclosureHeight = () => {
  const { height, width } = Dimensions.get('window');
  const tablet = isTablet();

  if (tablet) {
    // On tablet, don't use too much vertical space
    return Math.min(400, height * 0.35);
  }

  // On phone, use ~42% of screen height
  return height * 0.42;
};

/**
 * Get workout timer size
 */
export const getTimerSize = () => {
  const tablet = isTablet();
  return tablet ? 240 : 180;
};

/**
 * Get action button size
 */
export const getActionButtonSize = () => {
  const tablet = isTablet();
  return {
    primary: tablet ? 100 : 80,
    secondary: tablet ? 60 : 50,
  };
};

export default {
  BREAKPOINTS,
  MAX_CONTENT_WIDTH,
  MAX_CARD_WIDTH,
  isTablet,
  isLandscape,
  getScreenCategory,
  useResponsive,
  createResponsiveContainer,
  getResponsivePadding,
  getResponsiveCardSize,
  scaleSize,
  getFontScale,
  getHamsterSize,
  getEnclosureHeight,
  getTimerSize,
  getActionButtonSize,
};
