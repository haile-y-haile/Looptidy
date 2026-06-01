import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../lib/theme';

export function ProgressBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const { theme } = useTheme();
  const fill = max > 0 ? Math.min(1, value / max) : 0;
  const barColor = color ?? theme.colors.primary;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {value}/{max}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.colors.surface2 }]}>
        <View style={[styles.fill, { width: `${fill * 100}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
  },
  value: {
    ...typography.caption,
    fontWeight: '800',
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
