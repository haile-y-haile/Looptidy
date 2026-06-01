import { View, Text, StyleSheet } from 'react-native';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { StatCard } from '../components/StatCard';
import { ScreenScroll } from '../components/ScreenScroll';
import { radius, spacing, typography } from '../lib/theme';
import { isOpenLoop } from '../lib/utils';

export default function WeeklyReviewScreen() {
  const { loops } = useLoops();
  const { theme } = useTheme();

  const openLoops = loops.filter(isOpenLoop);
  const closedThisWeek = loops.filter((l) => {
    if (!l.closedAt) return false;
    const closed = new Date(l.closedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return closed >= weekAgo;
  });
  const blocked = openLoops.filter((l) => l.status === 'blocked');
  const stale = openLoops.filter((l) => {
    const updated = new Date(l.updatedAt);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return updated < twoWeeksAgo;
  });

  return (
    <ScreenScroll>
      <View
        style={[
          styles.placeholder,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Text style={styles.placeholderIcon}>📋</Text>
        <Text style={[styles.placeholderTitle, { color: theme.colors.text }]}>Weekly Review</Text>
        <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
          A dedicated space to review open loops, close stale items, and plan the week ahead.
          Full guided review coming soon.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>This Week at a Glance</Text>
      <View style={styles.statsRow}>
        <StatCard label="Open" value={openLoops.length} />
        <StatCard label="Closed" value={closedThisWeek.length} color={theme.colors.success} />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="Blocked" value={blocked.length} color={theme.colors.danger} />
        <StatCard label="Stale (14d+)" value={stale.length} color={theme.colors.warning} />
      </View>

      <View style={styles.checklist}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Review Checklist</Text>
        {[
          'Review all waiting-on-others loops — send nudges where needed',
          'Check promised-by-me items — are deadlines realistic?',
          'Resolve or escalate blocked items',
          'Close loops that are no longer relevant',
          'Record any pending decisions',
          'Set priorities for the coming week',
        ].map((item, index) => (
          <View
            key={index}
            style={[
              styles.checkItem,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <View style={[styles.checkbox, { borderColor: theme.colors.border }]} />
            <Text style={[styles.checkText, { color: theme.colors.text }]}>{item}</Text>
          </View>
        ))}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  placeholderIcon: {
    fontSize: 36,
    marginBottom: spacing.md,
  },
  placeholderTitle: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    ...typography.body,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  checklist: {
    marginTop: spacing.lg,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkText: {
    ...typography.body,
    flex: 1,
  },
});
