import { memo, useCallback, useEffect, useId, useRef } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import { motion } from '../lib/motion';
import { LoopTidyLogoSvg } from './LoopTidyLogoSvg';

const TIMING = {
  loop: 900,
  dot: 220,
  check: 600,
  settle: 300,
} as const;

const DOT_AT = TIMING.loop;
const CHECK_AT = TIMING.loop + TIMING.dot;
const SETTLE_AT = CHECK_AT + TIMING.check;

export type AnimatedLogoProps = {
  size?: number;
  autoPlay?: boolean;
  enableIdle?: boolean;
  enableTapReplay?: boolean;
  showDarkGlow?: boolean;
  onCheckmarkComplete?: () => void;
  onSequenceComplete?: () => void;
};

function AnimatedLogoComponent({
  size = 200,
  autoPlay = true,
  enableIdle = true,
  enableTapReplay = true,
  showDarkGlow = true,
  onCheckmarkComplete,
  onSequenceComplete,
}: AnimatedLogoProps) {
  const { theme } = useTheme();
  const gradientId = useId().replace(/:/g, '');
  const loopProgress = useSharedValue(0);
  const checkProgress = useSharedValue(0);
  const dotOpacity = useSharedValue(0);
  const dotScale = useSharedValue(0);
  const containerScale = useSharedValue(1);
  const idleY = useSharedValue(0);
  const playingRef = useRef(false);
  const hapticFiredRef = useRef(false);

  const fireCheckHaptic = useCallback(() => {
    if (hapticFiredRef.current) return;
    hapticFiredRef.current = true;
    void hapticSuccess();
    onCheckmarkComplete?.();
  }, [onCheckmarkComplete]);

  const fireSequenceComplete = useCallback(() => {
    onSequenceComplete?.();
  }, [onSequenceComplete]);

  const startIdle = useCallback(() => {
    if (!enableIdle) return;
    idleY.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [enableIdle, idleY]);

  const finishSequence = useCallback(() => {
    playingRef.current = false;
    startIdle();
    fireSequenceComplete();
  }, [fireSequenceComplete, startIdle]);

  const playDraw = useCallback(
    (instant = false) => {
      playingRef.current = true;
      hapticFiredRef.current = false;

      cancelAnimation(loopProgress);
      cancelAnimation(checkProgress);
      cancelAnimation(dotOpacity);
      cancelAnimation(dotScale);
      cancelAnimation(containerScale);
      cancelAnimation(idleY);

      loopProgress.value = 0;
      checkProgress.value = 0;
      dotOpacity.value = 0;
      dotScale.value = 0;
      containerScale.value = 1;
      idleY.value = 0;

      if (instant) {
        loopProgress.value = 1;
        dotOpacity.value = 1;
        dotScale.value = 1;
        checkProgress.value = 1;
        finishSequence();
        return;
      }

      loopProgress.value = withTiming(1, { duration: TIMING.loop, easing: motion.easing.out });

      dotOpacity.value = withDelay(
        DOT_AT,
        withTiming(1, { duration: TIMING.dot * 0.55, easing: motion.easing.out })
      );
      dotScale.value = withDelay(
        DOT_AT,
        withSequence(
          withTiming(1.12, { duration: TIMING.dot * 0.45, easing: Easing.out(Easing.back(1.6)) }),
          withTiming(1, { duration: TIMING.dot * 0.55, easing: motion.easing.out })
        )
      );

      checkProgress.value = withDelay(
        CHECK_AT,
        withTiming(1, { duration: TIMING.check, easing: motion.easing.out }, (done) => {
          if (done) runOnJS(fireCheckHaptic)();
        })
      );

      containerScale.value = withDelay(
        SETTLE_AT,
        withSequence(
          withTiming(1.045, { duration: TIMING.settle * 0.45, easing: Easing.out(Easing.quad) }),
          withTiming(
            1,
            { duration: TIMING.settle * 0.55, easing: Easing.out(Easing.back(1.4)) },
            (done) => {
              if (done) runOnJS(finishSequence)();
            }
          )
        )
      );
    },
    [
      checkProgress,
      containerScale,
      dotOpacity,
      dotScale,
      finishSequence,
      fireCheckHaptic,
      idleY,
      loopProgress,
    ]
  );

  useEffect(() => {
    if (!autoPlay) return;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      playDraw(reduce);
    });
    return () => {
      cancelled = true;
    };
  }, [autoPlay, playDraw]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }, { translateY: idleY.value }],
  }));

  const onPress = () => {
    if (!enableTapReplay || playingRef.current) return;
    void hapticLight();
    playDraw(false);
  };

  const logo = (
    <Animated.View style={[styles.logoWrap, { width: size, height: size }, containerStyle]}>
      {showDarkGlow && theme.isDark ? (
        <View
          pointerEvents="none"
          style={[
            styles.glow,
            {
              width: size * 1.35,
              height: size * 1.35,
              borderRadius: size * 0.675,
              backgroundColor: 'rgba(99, 102, 241, 0.14)',
              shadowColor: '#6366F1',
              shadowOpacity: 0.35,
              shadowRadius: size * 0.22,
            },
          ]}
        />
      ) : null}
      <LoopTidyLogoSvg
        size={size}
        gradientId={gradientId}
        loopProgress={loopProgress}
        checkProgress={checkProgress}
        dotOpacity={dotOpacity}
        dotScale={dotScale}
      />
    </Animated.View>
  );

  if (enableTapReplay) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="LoopTidy logo"
        accessibilityHint="Double tap to replay the logo animation"
        style={[styles.hitArea, { width: size, height: size }]}
      >
        {logo}
      </Pressable>
    );
  }

  return logo;
}

const styles = StyleSheet.create({
  hitArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
  },
});

export const AnimatedLogo = memo(AnimatedLogoComponent);
