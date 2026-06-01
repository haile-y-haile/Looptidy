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

type BrandSplashProps = {
  visible: boolean;
  onFinish: () => void;
};

export function BrandSplash({ visible, onFinish }: BrandSplashProps) {
  const { theme } = useTheme();
  const overlayOpacity = useSharedValue(1);
  const finishedRef = useRef(false);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  };

  const fadeOut = (fade: number) => {
    overlayOpacity.value = withTiming(
      0,
      { duration: fade, easing: motion.easing.out },
      (done) => {
        if (done) runOnJS(finish)();
      }
    );
  };

  useEffect(() => {
    if (!visible) return;
    finishedRef.current = false;
    overlayOpacity.value = 1;
    setReduceMotion(null);

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, [visible, overlayOpacity]);

  useEffect(() => {
    if (!visible || reduceMotion === null) return;

    if (reduceMotion) {
      const timer = setTimeout(() => fadeOut(150), 900);
      return () => clearTimeout(timer);
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
                  if (!isCancelled) fadeOut(280);
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
