import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { AnimatedLogo } from './AnimatedLogo';
import { LoopTidyLogoSvg } from './LoopTidyLogoSvg';
import { motion } from '../lib/motion';

const LANDING_LOGO_SIZE = 220;
const SPLASH_FADE_MS = motion.brandSplashFade;
const SPLASH_PLAY_MS = motion.brandSplashTotal - SPLASH_FADE_MS;

type BrandSplashProps = {
  visible: boolean;
  onFinish: () => void;
};

export function BrandSplash({ visible, onFinish }: BrandSplashProps) {
  const { theme } = useTheme();
  const overlayOpacity = useSharedValue(1);
  const finishedRef = useRef(false);
  const playStartedAt = useRef<number | null>(null);
  const sequenceDoneRef = useRef(false);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  };

  const fadeOut = () => {
    overlayOpacity.value = withTiming(
      0,
      { duration: SPLASH_FADE_MS, easing: motion.easing.out },
      (done) => {
        if (done) runOnJS(finish)();
      }
    );
  };

  const endSplashAfterMinimumPlay = () => {
    const started = playStartedAt.current ?? Date.now();
    const elapsed = Date.now() - started;
    const wait = Math.max(0, SPLASH_PLAY_MS - elapsed);
    setTimeout(() => fadeOut(), wait);
  };

  const onSequenceComplete = () => {
    sequenceDoneRef.current = true;
    endSplashAfterMinimumPlay();
  };

  useEffect(() => {
    if (!visible) return;
    finishedRef.current = false;
    sequenceDoneRef.current = false;
    playStartedAt.current = Date.now();
    overlayOpacity.value = 1;
    setReduceMotion(null);

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, [visible, overlayOpacity]);

  useEffect(() => {
    if (!visible || reduceMotion === null) return;
    if (reduceMotion) {
      const timer = setTimeout(() => endSplashAfterMinimumPlay(), SPLASH_PLAY_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, reduceMotion]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible || reduceMotion === null) return null;

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        StyleSheet.absoluteFill,
        styles.overlay,
        { backgroundColor: theme.colors.background },
        overlayStyle,
      ]}
    >
      <View style={styles.center}>
        {reduceMotion ? (
          <LoopTidyLogoSvg size={LANDING_LOGO_SIZE} staticFrame gradientId="looptidy-splash-static" />
        ) : (
          <AnimatedLogo
            size={LANDING_LOGO_SIZE}
            autoPlay
            enableIdle={false}
            enableTapReplay={false}
            onSequenceComplete={onSequenceComplete}
          />
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
});
