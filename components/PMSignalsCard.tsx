import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from './GlassCard';
import { useTheme } from '../context/ThemeContext';
import type { PMSignals } from '../lib/pmSignals';
import { spacing, typography } from '../lib/theme';
import { hapticLight } from '../lib/haptics';

export function PMSignalsCard({ signals }: { signals: PMSignals }) {
  const { theme } = useTheme();
  const router = useRouter();

  const rows = [
    {
      label: 'Decisions needing owner',
      value: signals.decisionsNeedingOwner,
      route: '/decision-speed' as const,
    },
    {
      label: 'Unclear ownership',
      value: signals.unclearOwnership,
      route: '/ownership' as const,
    },
    {
      label: 'High-impact scope',
      value: signals.highImpactScope,
      route: '/scope-guard' as const,
    },
    {
      label: 'Untriaged feedback',
      value: signals.untriagedFeedback,
      route: '/feedback' as const,
    },
    {
      label: 'Escalated loops',
      value: signals.escalatedLoops,
      route: '/ownership' as const,
    },
  ].filter((r) => r.value > 0);

  if (rows.length === 0) return null;

  return (
    <GlassCard style={styles.card} intensity={36}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Signals</Text>
      <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
        What needs attention across decisions, ownership, scope, and feedback.
      </Text>
      {rows.map((row) => (
        <Pressable
          key={row.label}
          onPress={() => {
            void hapticLight();
            router.push(row.route);
          }}
          style={({ pressed }) => [
            styles.row,
            { borderColor: theme.colors.borderLight },
            pressed && { opacity: 0.88 },
          ]}
        >
          <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{row.label}</Text>
          <View style={[styles.badge, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{row.value}</Text>
          </View>
        </Pressable>
      ))}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headline,
    marginBottom: spacing.xs,
  },
  sub: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  rowLabel: {
    ...typography.callout,
    flex: 1,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '800',
  },
});
