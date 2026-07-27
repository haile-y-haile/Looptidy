import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import type { OpenLoop } from '../types';
import { getRiskColor, isOverdue } from '../lib/utils';
import { radius, spacing, typography } from '../lib/theme';
import { hapticLight } from '../lib/haptics';

function stableJitter(id: string, axis: 0 | 1): number {
  let hash = axis + 1;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  }
  return ((hash % 100) / 1000) - 0.05;
}

export function ImpactMatrix({ loops }: { loops: OpenLoop[] }) {
  const { theme } = useTheme();
  const router = useRouter();

  const points = loops.map((loop) => {
    let x = 0.2;
    if (loop.dueDate && isOverdue(loop.dueDate)) x = 1;
    else if (loop.priority === 'urgent') x = 0.9;
    else if (loop.priority === 'high') x = 0.8;
    else if (loop.priority === 'medium') x = 0.5;

    let y = 0.1;
    if (loop.riskLevel === 'high') y = 0.9;
    else if (loop.riskLevel === 'medium') y = 0.5;
    else if (loop.riskLevel === 'low') y = 0.25;

    x = Math.max(0.05, Math.min(0.95, x + stableJitter(loop.id, 0)));
    y = Math.max(0.05, Math.min(0.95, y + stableJitter(loop.id, 1)));

    return { loop, x, y };
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Impact matrix</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Risk vs urgency — tap a point to open that loop
      </Text>

      <View style={[styles.grid, { borderColor: theme.colors.border }]}>
        <View style={[styles.hLine, { backgroundColor: theme.colors.borderLight }]} />
        <View style={[styles.vLine, { backgroundColor: theme.colors.borderLight }]} />

        <Text style={[styles.label, styles.topLabel, { color: theme.colors.textMuted }]}>High risk</Text>
        <Text style={[styles.label, styles.bottomLabel, { color: theme.colors.textMuted }]}>Low risk</Text>
        <Text style={[styles.label, styles.leftLabel, { color: theme.colors.textMuted }]}>Low urgency</Text>
        <Text style={[styles.label, styles.rightLabel, { color: theme.colors.textMuted }]}>High urgency</Text>

        {points.map((p) => (
          <Pressable
            key={p.loop.id}
            accessibilityLabel={p.loop.title}
            onPress={() => {
              void hapticLight();
              router.push(`/loops/${p.loop.id}`);
            }}
            style={[
              styles.point,
              {
                left: `${p.x * 100}%`,
                bottom: `${p.y * 100}%`,
                backgroundColor: getRiskColor(p.loop.riskLevel),
              },
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
    width: 14,
    height: 14,
    borderRadius: 7,
    transform: [{ translateX: -7 }, { translateY: 7 }],
  },
});
