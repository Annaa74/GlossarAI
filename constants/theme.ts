import { MD3LightTheme, MD3DarkTheme, useTheme } from 'react-native-paper';

export const NEO = {
  yellow: '#FFE066',
  pink: '#FF6B9D',
  lime: '#A6F068',
  blue: '#5B9EFF',
  orange: '#FF9F45',
  purple: '#B07CFF',
  red: '#FF5C5C',
  cyan: '#5BE0E0',
  cream: '#FFF8E7',
  ink: '#000000',
  inkSoft: '#1A1A1A',
  inkMuted: '#4A4A4A',
  white: '#FFFFFF',
  paper: '#FAF6EC',
};

export const BRUTAL = {
  border: 2,
  borderThick: 3,
  radius: 4,
  shadowOffset: 4,
  shadowOffsetSm: 3,
  shadowOffsetLg: 6,
};

export const BRUTAL_SHADOW = '4px 4px 0 #000000';
export const BRUTAL_SHADOW_SM = '3px 3px 0 #000000';
export const BRUTAL_SHADOW_LG = '6px 6px 0 #000000';
export const BRUTAL_SHADOW_PRESSED = '1px 1px 0 #000000';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: NEO.ink,
    primaryContainer: NEO.yellow,
    secondary: NEO.pink,
    secondaryContainer: NEO.pink,
    tertiary: NEO.lime,
    tertiaryContainer: NEO.lime,
    surface: NEO.white,
    surfaceVariant: NEO.paper,
    background: NEO.cream,
    error: NEO.red,
    errorContainer: NEO.red,
    onPrimary: NEO.white,
    onSecondary: NEO.ink,
    onTertiary: NEO.ink,
    onSurface: NEO.ink,
    onSurfaceVariant: NEO.inkMuted,
    onBackground: NEO.ink,
    outline: NEO.ink,
    outlineVariant: NEO.ink,
    success: NEO.lime,
    warning: NEO.orange,
  },
  roundness: BRUTAL.radius,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: NEO.yellow,
    primaryContainer: NEO.yellow,
    secondary: NEO.pink,
    secondaryContainer: NEO.pink,
    tertiary: NEO.lime,
    tertiaryContainer: NEO.lime,
    surface: NEO.inkSoft,
    surfaceVariant: '#2A2A2A',
    background: NEO.ink,
    error: NEO.red,
    errorContainer: NEO.red,
    onPrimary: NEO.ink,
    onSecondary: NEO.ink,
    onTertiary: NEO.ink,
    onSurface: NEO.white,
    onSurfaceVariant: '#CCCCCC',
    onBackground: NEO.white,
    outline: NEO.white,
    outlineVariant: NEO.white,
    success: NEO.lime,
    warning: NEO.orange,
  },
  roundness: BRUTAL.radius,
};

export const CARD_COLORS = {
  known: NEO.lime,
  learning: NEO.orange,
  new: NEO.blue,
  favorite: NEO.pink,
};

export const useThemedColors = () => {
  const t = useTheme();
  return {
    bg: t.colors.background,
    surface: t.colors.surface,
    surfaceVariant: t.colors.surfaceVariant,
    text: t.colors.onBackground,
    textMuted: t.colors.onSurfaceVariant,
    border: t.colors.outline,
    primary: t.colors.primary,
    accent: NEO.yellow,
  };
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
