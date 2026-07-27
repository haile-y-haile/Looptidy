import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

type LoopIllustrationProps = {
  size?: number;
};

/** Polished open-loop mark: soft ring + primary arc + tidy check. */
export function LoopIllustration({ size = 120 }: LoopIllustrationProps) {
  const { theme } = useTheme();
  const primary = theme.colors.primary;
  const muted = theme.isDark ? theme.colors.border : theme.colors.borderLight;
  const vb = 108;
  const c = 54;
  const r = 34;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}>
      {/* Soft full ring */}
      <Circle
        cx={c}
        cy={c}
        r={r}
        stroke={muted}
        strokeWidth={3}
        fill="none"
      />
      {/* Primary open-loop arc (~270°) ending near the check */}
      <Path
        d={`M ${c} ${c - r}
            A ${r} ${r} 0 1 1 ${c - r * 0.72} ${c + r * 0.7}`}
        stroke={primary}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Checkmark sitting in the open gap */}
      <Path
        d={`M ${c - 12} ${c + 4}
            L ${c - 3} ${c + 14}
            L ${c + 16} ${c - 10}`}
        stroke={primary}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
