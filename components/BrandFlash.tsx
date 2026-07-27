import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet } from 'react-native';

type BrandFlashProps = {
  /** When true, begin the hold → fade-out sequence. */
  ready: boolean;
  onDone: () => void;
  /** Fired once BrandFlash has laid out — use to dismiss the native splash. */
  onReady?: () => void;
};

const HOLD_MS = 650;
const FADE_MS = 480;
const SAMPLE_A = require('../assets/splash-sample-a.png');

/**
 * Sample A brand flash — full-bleed cinematic artwork (logo + wordmark in-image).
 * Native splash uses the same asset so launch feels like a single continuous screen.
 */
export function BrandFlash({ ready, onDone, onReady }: BrandFlashProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1.02)).current;
  const finished = useRef(false);
  const notifiedReady = useRef(false);

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [scale]);

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
      onLayout={() => {
        if (notifiedReady.current) return;
        notifiedReady.current = true;
        onReady?.();
      }}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale }] }]}>
        <Image source={SAMPLE_A} style={styles.image} resizeMode="cover" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: '#021420',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
