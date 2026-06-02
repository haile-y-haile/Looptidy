import { memo } from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import {
  LOGO_CHECK_LENGTH,
  LOGO_CHECK_PATH,
  LOGO_DOT,
  LOGO_GRADIENT,
  LOGO_LOOP_LENGTH,
  LOGO_LOOP_PATH,
  LOGO_STROKE_WIDTH,
  LOGO_VIEWBOX,
} from '../lib/loopTidyLogoPaths';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type LoopTidyLogoSvgProps = {
  size?: number;
  gradientId?: string;
  loopProgress?: SharedValue<number>;
  checkProgress?: SharedValue<number>;
  dotOpacity?: SharedValue<number>;
  dotScale?: SharedValue<number>;
  staticFrame?: boolean;
};

function LoopTidyLogoSvgComponent({
  size = 200,
  gradientId = 'looptidy-logo-gradient',
  loopProgress,
  checkProgress,
  dotOpacity,
  dotScale,
  staticFrame = false,
}: LoopTidyLogoSvgProps) {
  const loopAnimatedProps = useAnimatedProps(() => {
    if (!loopProgress) return { strokeDashoffset: 0 };
    return { strokeDashoffset: LOGO_LOOP_LENGTH * (1 - loopProgress.value) };
  });

  const checkAnimatedProps = useAnimatedProps(() => {
    if (!checkProgress) return { strokeDashoffset: 0 };
    return { strokeDashoffset: LOGO_CHECK_LENGTH * (1 - checkProgress.value) };
  });

  const dotAnimatedProps = useAnimatedProps(() => {
    if (!dotOpacity || !dotScale) {
      return { opacity: 1, r: LOGO_DOT.r };
    }
    return {
      opacity: dotOpacity.value,
      r: LOGO_DOT.r * dotScale.value,
    };
  });

  const animated = !staticFrame && loopProgress && checkProgress && dotOpacity && dotScale;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${LOGO_VIEWBOX} ${LOGO_VIEWBOX}`}>
      <Defs>
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={LOGO_GRADIENT.start} />
          <Stop offset="48%" stopColor={LOGO_GRADIENT.mid} />
          <Stop offset="100%" stopColor={LOGO_GRADIENT.end} />
        </LinearGradient>
      </Defs>

      {animated ? (
        <AnimatedPath
          d={LOGO_LOOP_PATH}
          stroke={`url(#${gradientId})`}
          strokeWidth={LOGO_STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={LOGO_LOOP_LENGTH}
          animatedProps={loopAnimatedProps}
        />
      ) : (
        <Path
          d={LOGO_LOOP_PATH}
          stroke={`url(#${gradientId})`}
          strokeWidth={LOGO_STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={LOGO_LOOP_LENGTH}
          strokeDashoffset={0}
        />
      )}

      {animated ? (
        <AnimatedCircle
          cx={LOGO_DOT.cx}
          cy={LOGO_DOT.cy}
          fill={`url(#${gradientId})`}
          animatedProps={dotAnimatedProps}
        />
      ) : (
        <Circle cx={LOGO_DOT.cx} cy={LOGO_DOT.cy} r={LOGO_DOT.r} fill={`url(#${gradientId})`} />
      )}

      {animated ? (
        <AnimatedPath
          d={LOGO_CHECK_PATH}
          stroke={`url(#${gradientId})`}
          strokeWidth={LOGO_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={LOGO_CHECK_LENGTH}
          animatedProps={checkAnimatedProps}
        />
      ) : (
        <Path
          d={LOGO_CHECK_PATH}
          stroke={`url(#${gradientId})`}
          strokeWidth={LOGO_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={LOGO_CHECK_LENGTH}
          strokeDashoffset={0}
        />
      )}
    </Svg>
  );
}

export const LoopTidyLogoSvg = memo(LoopTidyLogoSvgComponent);
