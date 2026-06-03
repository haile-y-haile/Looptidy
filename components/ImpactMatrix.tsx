import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { OpenLoop } from '../types';
import { getRiskColor, riskLevelLabels, isOverdue } from '../lib/utils';
import { radius, spacing, typography } from '../lib/theme';

export function ImpactMatrix({ loops }: { loops: OpenLoop[] }) {
  const { theme } = useTheme();
  
  // X-axis: Urgency (0-1) - Overdue is 1, High priority is 0.8, etc.
  // Y-axis: Risk (0-1) - High is 1, Medium is 0.5, Low is 0
  
  const points = loops.map(loop => {
    let x = 0.2; // Low urgency default
    if (loop.dueDate && isOverdue(loop.dueDate)) x = 1;
    else if (loop.priority === 'high') x = 0.8;
    else if (loop.priority === 'medium') x = 0.5;

    let y = 0.1; // Low risk default
    if (loop.riskLevel === 'high') y = 0.9;
    else if (loop.riskLevel === 'medium') y = 0.5;

    // Add slight jitter to avoid exact overlap
    x += (Math.random() - 0.5) * 0.1;
    y += (Math.random() - 0.5) * 0.1;

    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    return { loop, x, y };
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Impact Matrix</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Risk vs. Urgency</Text>
      
      <View style={[styles.grid, { borderColor: theme.colors.border }]}>
        {/* Quadrant Lines */}
        <View style={[styles.hLine, { backgroundColor: theme.colors.borderLight }]} />
        <View style={[styles.vLine, { backgroundColor: theme.colors.borderLight }]} />
        
        {/* Labels */}
        <Text style={[styles.label, styles.topLabel, { color: theme.colors.textMuted }]}>High Risk</Text>
        <Text style={[styles.label, styles.bottomLabel, { color: theme.colors.textMuted }]}>Low Risk</Text>
        <Text style={[styles.label, styles.leftLabel, { color: theme.colors.textMuted }]}>Low Urgency</Text>
        <Text style={[styles.label, styles.rightLabel, { color: theme.colors.textMuted }]}>High Urgency</Text>

        {/* Data Points */}
        {points.map((p, i) => (
          <View
            key={p.loop.id || i}
            style={[
              styles.point,
              {
                left: `${p.x * 100}%`,
                bottom: `${p.y * 100}%`,
                backgroundColor: getRiskColor(p.loop.riskLevel),
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  title: {
    ...typography.headline,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  grid: {
    height: 250,
    borderWidth: 1,
    borderRadius: radius.md,
    position: 'relative',
    overflow: 'hidden',
  },
  hLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
  },
  vLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
  },
  label: {
    ...typography.caption,
    fontSize: 10,
    position: 'absolute',
    opacity: 0.5,
  },
  topLabel: { top: spacing.xs, left: '50%', transform: [{ translateX: -25 }] },
  bottomLabel: { bottom: spacing.xs, left: '50%', transform: [{ translateX: -25 }] },
  leftLabel: { left: spacing.xs, top: '50%', transform: [{ translateY: -10 }] },
  rightLabel: { right: spacing.xs, top: '50%', transform: [{ translateY: -10 }] },
  point: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    transform: [{ translateX: -4 }, { translateY: 4 }], // center the dot
  },
});
