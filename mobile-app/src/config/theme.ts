/**
 * Kaar.Rentals design tokens — mirrors frontend/src/index.css (HSL → hex)
 */
export const colors = {
  background: '#FFFFFF',
  foreground: '#1A1A1A',
  primary: '#141414',
  primaryDark: '#0A0A0A',
  primaryForeground: '#FDF6E3',
  secondary: '#404040',
  muted: '#F5F5F5',
  mutedForeground: '#737373',
  accent: '#E8B117',
  accentLight: '#FDF6E3',
  border: '#E5E5E5',
  destructive: '#EF4444',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const layout = {
  headerHeight: 56,
  tabBarHeight: 64,
  borderRadius: 12,
} as const;
