import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../context/ThemeContext';

export type AppIconName = keyof typeof Ionicons.glyphMap;

type IconTone = 'default' | 'primary' | 'purple' | 'warning' | 'success' | 'danger' | 'muted';

function toneColor(theme: Theme, tone: IconTone): string {
  switch (tone) {
    case 'primary':
      return theme.colors.primary;
    case 'purple':
      return theme.colors.purple;
    case 'warning':
      return theme.colors.warning;
    case 'success':
      return theme.colors.success;
    case 'danger':
      return theme.colors.danger;
    case 'muted':
      return theme.colors.textMuted;
    default:
      return theme.colors.textSecondary;
  }
}

function toneBackground(theme: Theme, tone: IconTone): string {
  switch (tone) {
    case 'primary':
      return theme.colors.primaryLight;
    case 'purple':
      return theme.colors.purpleLight;
    case 'warning':
      return theme.colors.warningLight;
    case 'success':
      return theme.colors.successLight;
    case 'danger':
      return theme.colors.dangerLight;
    case 'muted':
      return theme.colors.surface2;
    default:
      return theme.colors.surface2;
  }
}

export function AppIcon({
  name,
  size = 22,
  color,
  variant = 'plain',
  tone = 'default',
}: {
  name: AppIconName;
  size?: number;
  color?: string;
  variant?: 'plain' | 'circle';
  tone?: IconTone;
}) {
  const { theme } = useTheme();
  const resolvedColor = color ?? toneColor(theme, tone);

  if (variant === 'circle') {
    const dimension = Math.round(size * 2.05);
    return (
      <View
        style={[
          styles.circle,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: toneBackground(theme, tone),
          },
        ]}
      >
        <Ionicons name={name} size={size} color={resolvedColor} />
      </View>
    );
  }

  return <Ionicons name={name} size={size} color={resolvedColor} />;
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
