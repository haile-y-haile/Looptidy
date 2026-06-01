import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { motion } from '../lib/motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const LOOP_LENGTH = 188;

type LogoMarkProps = {
  size?: number;
  animate?: boolean;
};

export function LogoMark({ size = 88, animate = false }: LogoMarkProps) {
  const { theme } = useTheme();
  const stroke = theme.colors.primary;
  const draw = useSharedValue(animate ? 0 : 1);
  const scale = useSharedValue(animate ? 0.9 : 1);
  const checkOpacity = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) return;
    scale.value = withTiming(1, { duration: motion.brand, easing: motion.easing.out });
    draw.value = withDelay(
      100,
      withTiming(1, { duration: motion.brand - 180, easing: Easing.out(Easing.cubic) })
    );
    checkOpacity.value = withDelay(
      motion.brand - 280,
      withTiming(1, { duration: 220, easing: motion.easing.out })
    );
  }, [animate, checkOpacity, draw, scale]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: LOOP_LENGTH * (1 - draw.value),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));

  const center = size / 2;
  const r = size * 0.38;
  const strokeWidth = Math.max(3, size * 0.05);
  const iconSize = size * 0.52;

  return (
    <Animated.View style={[styles.wrap, { width: size, height: size }, wrapStyle]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={theme.colors.border}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.4}
        />
        <AnimatedPath
          d={`M ${center} ${center - r} A ${r} ${r} 0 1 1 ${center - r * 0.12} ${center + r * 0.9}`}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={LOOP_LENGTH}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={[styles.iconCenter, { width: iconSize, height: iconSize }]}>
        <Image
          source={require('../assets/icon.png')}
          style={{ width: iconSize, height: iconSize }}
          resizeMode="contain"
        />
      </View>
      <Animated.View style={[styles.checkWrap, checkStyle]}>
        <Svg width={size * 0.22} height={size * 0.22} viewBox="0 0 24 24">
          <Path
            d="M5 13l4 4L19 7"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkWrap: {
    position: 'absolute',
    right: '8%',
    bottom: '10%',
  },
});
