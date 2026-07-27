import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogoMark } from './LogoMark';
import { fonts } from '../lib/fonts';
import { spacing } from '../lib/theme';

type BrandFlashProps = {
  /** When true, begin the hold → fade-out sequence. */
  ready: boolean;
  onDone: () => void;
};

const HOLD_MS = 550;
const FADE_MS = 450;

/**
 * Cinematic brand flash (Sample A): deep teal atmosphere, logo + wordmark,
 * then fades out to reveal the app (~1s once ready).
 */
export function BrandFlash({ ready, onDone }: BrandFlashProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  const glow = useRef(new Animated.Value(0.35)).current;
  const wordmarkY = useRef(new Animated.Value(8)).current;
  const finished = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: 0.7,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(wordmarkY, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [glow, scale, wordmarkY]);

  useEffect(() => {
    if (!ready || finished.current) return;

    const hold = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished: ok }) => {
        if (ok && !finished.current) {
          finished.current = true;
          onDone();
        }
      });
    }, HOLD_MS);

    return () => clearTimeout(hold);
  }, [ready, opacity, onDone]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.root, { opacity }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient
        colors={['#0B3D3A', '#0F766E', '#115E59', '#0A2F2C']}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(45,212,191,0.22)', 'rgba(13,148,136,0.08)', 'transparent']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0.28 }}
        end={{ x: 0.5, y: 0.85 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glow,
            transform: [{ scale }],
          },
        ]}
      />

      <Animated.View style={[styles.center, { transform: [{ scale }] }]}>
        <LogoMark size={112} />
        <Animated.View style={{ transform: [{ translateY: wordmarkY }] }}>
          <Text style={styles.wordmark}>LoopTidy</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(45, 212, 191, 0.28)',
  },
  center: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  wordmark: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.6,
    color: '#F8FFFE',
    textAlign: 'center',
  },
});
