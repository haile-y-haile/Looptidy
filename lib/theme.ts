export const colors = {
  background: '#F2F4F7',
  surface: '#FFFFFF',
  border: '#E4E7EC',
  borderLight: '#F0F2F5',
  text: '#101828',
  textSecondary: '#667085',
  textMuted: '#98A2B3',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  success: '#12B76A',
  successLight: '#ECFDF3',
  warning: '#F79009',
  warningLight: '#FFFAEB',
  danger: '#F04438',
  dangerLight: '#FEF3F2',
  purple: '#7A5AF8',
  purpleLight: '#F4F3FF',
} as const;

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
  largeTitle: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.3 },
  headline: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  callout: { fontSize: 14, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5, textTransform: 'uppercase' as const },
} as const;

export const shadows = {
  card: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
} as const;
