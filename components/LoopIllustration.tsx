import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

type LoopIllustrationProps = {
  size?: number;
};

export function LoopIllustration({ size = 120 }: LoopIllustrationProps) {
  const { theme } = useTheme();
  const stroke = theme.colors.primary;
  const muted = theme.colors.border;
  const c = size / 2;
  const r = size * 0.32;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={c} cy={c} r={r} stroke={muted} strokeWidth={2} fill="none" />
      <Path
        d={`M ${c} ${c - r} A ${r} ${r} 0 1 1 ${c - r * 0.1} ${c + r * 0.88}`}
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={`M ${c - r * 0.2} ${c + r * 0.75} L ${c} ${c + r * 0.95} L ${c + r * 0.35} ${c + r * 0.45}`}
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
