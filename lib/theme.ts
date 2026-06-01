export type ThemeColors = {
  background: string;
  surface: string;
  surface2: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primary2: string;
  primaryLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  purple: string;
  purpleLight: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surface2: '#F9FAFB',
  border: '#E5E7EB',
  borderLight: '#EEF2F6',
  text: '#0B1220',
  textSecondary: '#5B6473',
  textMuted: '#8B95A7',
  primary: '#2563EB',
  primary2: '#4F46E5',
  primaryLight: '#EEF4FF',
  success: '#12B76A',
  successLight: '#ECFDF3',
  warning: '#F79009',
  warningLight: '#FFFAEB',
  danger: '#F04438',
  dangerLight: '#FEF3F2',
  purple: '#7A5AF8',
  purpleLight: '#F4F3FF',
  overlay: 'rgba(15, 23, 42, 0.06)',
};

export const darkColors: ThemeColors = {
  ...lightColors,
  background: '#0B1220',
  surface: '#121A2A',
  surface2: '#0F172A',
  border: '#243044',
  borderLight: '#1B2637',
  text: '#EAF0FF',
  textSecondary: '#B8C2D6',
  textMuted: '#7E8AA3',
  primaryLight: 'rgba(37, 99, 235, 0.16)',
  successLight: 'rgba(18, 183, 106, 0.16)',
  warningLight: 'rgba(247, 144, 9, 0.18)',
  dangerLight: 'rgba(240, 68, 56, 0.18)',
  purpleLight: 'rgba(122, 90, 248, 0.18)',
  overlay: 'rgba(255, 255, 255, 0.06)',
};

// Back-compat alias (existing imports). Prefer `useTheme().theme.colors`.
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export const typography = {
  largeTitle: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.7 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.4 },
  headline: { fontSize: 17, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  callout: { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.6, textTransform: 'uppercase' as const },
} as const;

export const shadows = {
  card: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  soft: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
