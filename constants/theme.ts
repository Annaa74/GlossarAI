import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1',
    primaryContainer: '#E0E7FF',
    secondary: '#8B5CF6',
    secondaryContainer: '#EDE9FE',
    tertiary: '#EC4899',
    tertiaryContainer: '#FCE7F3',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    background: '#F9FAFB',
    error: '#EF4444',
    errorContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: '#111827',
    onSurfaceVariant: '#6B7280',
    onBackground: '#111827',
    outline: '#D1D5DB',
    outlineVariant: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818CF8',
    primaryContainer: '#3730A3',
    secondary: '#A78BFA',
    secondaryContainer: '#5B21B6',
    tertiary: '#F472B6',
    tertiaryContainer: '#9D174D',
    surface: '#1F2937',
    surfaceVariant: '#374151',
    background: '#111827',
    error: '#F87171',
    errorContainer: '#7F1D1D',
    onPrimary: '#1E1B4B',
    onSecondary: '#2E1065',
    onTertiary: '#500724',
    onSurface: '#F9FAFB',
    onSurfaceVariant: '#9CA3AF',
    onBackground: '#F9FAFB',
    outline: '#4B5563',
    outlineVariant: '#374151',
    success: '#34D399',
    warning: '#FBBF24',
  },
  roundness: 12,
};

export const CARD_COLORS = {
  known: '#10B981',
  learning: '#F59E0B',
  new: '#6366F1',
  favorite: '#EC4899',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
