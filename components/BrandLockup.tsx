import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { TAGLINE } from '../lib/fonts';
import { motion } from '../lib/motion';
import { spacing, typography } from '../lib/theme';
import { LogoMark } from './LogoMark';

type BrandLockupProps = {
  variant?: 'splash' | 'full';
  logoSize?: number;
  animate?: boolean;
};

export function BrandLockup({ variant = 'splash', logoSize = 96, animate = false }: BrandLockupProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.root}>
      <LogoMark size={logoSize} animate={animate} />
      {variant === 'full' ? (
        <Animated.Text
          entering={animate ? FadeInDown.delay(180).duration(motion.normal) : undefined}
          style={[styles.wordmark, { color: theme.colors.text }]}
        >
          LoopTidy
        </Animated.Text>
      ) : null}
      <Animated.Text
        entering={animate ? FadeInDown.delay(variant === 'full' ? 260 : 200).duration(motion.normal) : undefined}
        style={[styles.tagline, { color: theme.colors.textSecondary }]}
      >
        {TAGLINE}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.md,
  },
  wordmark: {
    ...typography.largeTitle,
    marginTop: spacing.xs,
  },
  tagline: {
    ...typography.tagline,
    textAlign: 'center',
    maxWidth: 280,
  },
});
