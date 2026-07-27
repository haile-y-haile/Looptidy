import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
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
 * Cinematic brand flash — Sample A atmosphere + Option 1 filled logo.
 */
export function BrandFlash({ ready, onDone }: BrandFlashProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const glow = useRef(new Animated.Value(0.4)).current;
  const wordmarkY = useRef(new Animated.Value(10)).current;
  const finished = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 560,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: 1,
        duration: 780,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(wordmarkY, {
        toValue: 0,
        duration: 560,
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
        colors={['#0A4F4A', '#0D9488', '#0F766E', '#083F3C']}
        locations={[0, 0.32, 0.68, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(94,234,212,0.28)', 'rgba(13,148,136,0.12)', 'rgba(6,40,38,0.55)']}
        locations={[0, 0.42, 1]}
        start={{ x: 0.5, y: 0.15 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(4, 24, 23, 0.45)']}
        locations={[0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.glowWrap,
          {
            opacity: glow,
            transform: [{ scale }],
          },
        ]}
      >
        <Svg width={280} height={280} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="splashGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#99F6E4" stopOpacity="0.45" />
              <Stop offset="45%" stopColor="#2DD4BF" stopOpacity="0.18" />
              <Stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={140} cy={140} r={140} fill="url(#splashGlow)" />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.center, { transform: [{ scale }] }]}>
        <View style={styles.logoFrame}>
          <LogoMark size={120} />
        </View>
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
    backgroundColor: '#0A4F4A',
  },
  glowWrap: {
    position: 'absolute',
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  logoFrame: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  wordmark: {
    fontFamily: fonts.bold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.7,
    color: '#F0FDFA',
    textAlign: 'center',
    textShadowColor: 'rgba(4, 47, 46, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
