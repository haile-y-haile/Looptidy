import { fonts } from './fonts';

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
  background: '#F6F8FB',
  surface: '#FFFFFF',
  surface2: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#EEF2F6',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#0D9488',
  primary2: '#6366F1',
  primaryLight: '#CCFBF1',
  success: '#059669',
  successLight: '#D1FAE5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  purple: '#7C3AED',
  purpleLight: '#EDE9FE',
  overlay: 'rgba(15, 23, 42, 0.05)',
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
  primaryLight: 'rgba(13, 148, 136, 0.18)',
  successLight: 'rgba(18, 183, 106, 0.16)',
  warningLight: 'rgba(247, 144, 9, 0.18)',
  dangerLight: 'rgba(240, 68, 56, 0.18)',
  purpleLight: 'rgba(122, 90, 248, 0.18)',
  overlay: 'rgba(255, 255, 255, 0.06)',
};

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
  largeTitle: {
    fontSize: 30,
    fontFamily: fonts.bold,
    letterSpacing: -0.7,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.bold,
    letterSpacing: -0.4,
  },
  headline: {
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  body: {
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 22,
  },
  callout: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
  caption: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
  tagline: {
    fontSize: 13,
    fontFamily: fonts.medium,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
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
