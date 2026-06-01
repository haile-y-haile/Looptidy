import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Image, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { TAGLINE } from '../lib/fonts';
import { motion } from '../lib/motion';
import { spacing, typography } from '../lib/theme';
import { BrandLockup } from './BrandLockup';

const LOTTIE = require('../assets/lottie/brand-splash.json');
const BRAND_SPLASH_DURATION_MS = 2800;
const MOTION_FADE_MS = 280;
const REDUCE_MOTION_FADE_MS = 150;

type BrandSplashProps = {
  visible: boolean;
  onFinish: () => void;
};

export function BrandSplash({ visible, onFinish }: BrandSplashProps) {
  const { theme } = useTheme();
  const overlayOpacity = useSharedValue(1);
  const finishedRef = useRef(false);
  const visibleSinceRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  const clearFadeTimer = () => {
    if (!fadeTimerRef.current) return;
    clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = null;
  };

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearFadeTimer();
    onFinish();
  };

  const fadeOut = (fade: number) => {
    clearFadeTimer();
    overlayOpacity.value = withTiming(
      0,
      { duration: fade, easing: motion.easing.out },
      (done) => {
        if (done) runOnJS(finish)();
      }
    );
  };

  const fadeOutAfterMinimumDuration = (fade: number) => {
    clearFadeTimer();
    const visibleSince = visibleSinceRef.current ?? Date.now();
    const elapsed = Date.now() - visibleSince;
    const delay = Math.max(0, BRAND_SPLASH_DURATION_MS - fade - elapsed);
    fadeTimerRef.current = setTimeout(() => fadeOut(fade), delay);
  };

  useEffect(() => {
    if (!visible) {
      clearFadeTimer();
      return undefined;
    }
    finishedRef.current = false;
    visibleSinceRef.current = Date.now();
    overlayOpacity.value = 1;
    setReduceMotion(null);

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });

    return clearFadeTimer;
  }, [visible, overlayOpacity]);

  useEffect(() => {
    if (!visible || reduceMotion === null) return;

    if (reduceMotion) {
      fadeOutAfterMinimumDuration(REDUCE_MOTION_FADE_MS);
      return clearFadeTimer;
    }
    // Lottie path: fade triggered by onAnimationFinish
    return undefined;
  }, [visible, reduceMotion]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible || reduceMotion === null) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFill,
        styles.overlay,
        { backgroundColor: theme.colors.background },
        overlayStyle,
      ]}
    >
      <View style={styles.center}>
        {reduceMotion ? (
          <BrandLockup variant="splash" logoSize={104} animate />
        ) : (
          <View style={styles.lottieBlock}>
            <View style={styles.lottieRow}>
              <LottieView
                source={LOTTIE}
                autoPlay
                loop={false}
                style={styles.lottie}
                onAnimationFinish={(isCancelled) => {
                  if (!isCancelled) fadeOutAfterMinimumDuration(MOTION_FADE_MS);
                }}
              />
              <Image source={require('../assets/icon.png')} style={styles.iconOverlay} />
            </View>
            <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>{TAGLINE}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 100,
    elevation: 100,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  lottieBlock: {
    alignItems: 'center',
    gap: spacing.md,
  },
  lottieRow: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 160,
    height: 160,
  },
  iconOverlay: {
    position: 'absolute',
    width: 64,
    height: 64,
  },
  tagline: {
    ...typography.tagline,
    textAlign: 'center',
    maxWidth: 280,
  },
});
