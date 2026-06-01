import { Easing } from 'react-native-reanimated';

export const motion = {
  fast: 150,
  normal: 280,
  slow: 520,
  brand: 900,
  stagger: 40,
  easing: {
    out: Easing.bezier(0.22, 1, 0.36, 1),
    inOut: Easing.bezier(0.45, 0, 0.55, 1),
  },
} as const;
