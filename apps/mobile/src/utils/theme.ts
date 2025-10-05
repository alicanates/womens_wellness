/**
 * Feminine Theme with Vibrant Pink Tones - Improved Readability
 */

// Light theme colors
const lightColors = {
  // Primary vibrant pink palette
  primary: '#FF69B4',           // Hot pink (more vibrant)
  primaryLight: '#FFB6D9',      // Light pink
  primaryDark: '#E91E63',       // Deep pink

  // Secondary colors
  secondary: '#D946EF',         // Vibrant purple-pink
  accent: '#FF1493',            // Deep pink accent

  // Background colors
  background: '#FAFAFA',        // Light gray background (better contrast)
  backgroundCard: '#FFFFFF',    // Pure white for cards
  backgroundSecondary: '#FFF0F5', // Lavender blush

  // Text colors
  text: '#1A1A1A',              // Almost black (much better readability)
  textSecondary: '#525252',     // Dark gray (improved from medium gray)
  textLight: '#9CA3AF',         // Medium-light gray
  textOnPrimary: '#FFFFFF',     // White for text on colored backgrounds

  // Status colors (more vibrant)
  success: '#10B981',           // Vibrant green
  warning: '#F59E0B',           // Vibrant orange
  error: '#EF4444',             // Vibrant red
  info: '#3B82F6',              // Vibrant blue

  // Utility colors
  border: '#FFD4E7',            // Slightly darker pink border
  shadow: '#FF69B4',            // Hot pink shadow
  overlay: 'rgba(255, 105, 180, 0.1)', // Semi-transparent hot pink
};

// Dark theme colors
const darkColors = {
  // Primary vibrant pink palette
  primary: '#FF69B4',           // Hot pink (more vibrant)
  primaryLight: '#FFB6D9',      // Light pink
  primaryDark: '#E91E63',       // Deep pink

  // Secondary colors
  secondary: '#D946EF',         // Vibrant purple-pink
  accent: '#FF1493',            // Deep pink accent

  // Background colors
  background: '#0D0D0D',        // Very dark background (softer than pure black)
  backgroundCard: '#1A1A1A',    // Dark cards (more contrast from background)
  backgroundSecondary: '#2D2D2D', // Slightly lighter dark

  // Text colors
  text: '#FFFFFF',              // White text
  textSecondary: '#A0A0A0',     // Light gray (better contrast)
  textLight: '#707070',         // Medium gray
  textOnPrimary: '#FFFFFF',     // White for text on colored backgrounds

  // Status colors (more vibrant)
  success: '#10B981',           // Vibrant green
  warning: '#F59E0B',           // Vibrant orange
  error: '#EF4444',             // Vibrant red
  info: '#3B82F6',              // Vibrant blue

  // Utility colors
  border: '#2A2A2A',            // Softer dark border (less harsh)
  shadow: '#000000',            // Black shadow
  overlay: 'rgba(255, 105, 180, 0.2)', // Semi-transparent hot pink (slightly more visible)
};

export const getTheme = (isDarkMode: boolean) => ({
  colors: isDarkMode ? darkColors : lightColors,

  // Card styling
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: isDarkMode ? '#000000' : '#FFB6D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.5 : 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  // Button styling
  button: {
    borderRadius: 16,
    padding: 14,
    shadowColor: isDarkMode ? '#000000' : '#FF8FC7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.4 : 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // Typography
  typography: {
    title: {
      fontSize: 32,
      fontWeight: '700' as const,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '500' as const,
      letterSpacing: 0.2,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
});

// For backward compatibility, export a default light theme
export const theme = getTheme(false);

export type Theme = ReturnType<typeof getTheme>;
