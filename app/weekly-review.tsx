import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLoops } from '../context/LoopContext';
import { StatCard } from '../components/StatCard';
import { colors, radius, spacing, typography } from '../lib/theme';
import { isOpenLoop } from '../lib/utils';

export default function WeeklyReviewScreen() {
  const { loops } = useLoops();

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderIcon}>📋</Text>
        <Text style={styles.placeholderTitle}>Weekly Review</Text>
        <Text style={styles.placeholderText}>
          A dedicated space to review open loops, close stale items, and plan the week ahead.
          Full guided review coming soon.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>This Week at a Glance</Text>
      <View style={styles.statsRow}>
        <StatCard label="Open" value={openLoops.length} />
        <StatCard label="Closed" value={closedThisWeek.length} color={colors.success} />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="Blocked" value={blocked.length} color={colors.danger} />
        <StatCard label="Stale (14d+)" value={stale.length} color={colors.warning} />
      </View>

      <View style={styles.checklist}>
        <Text style={styles.sectionTitle}>Review Checklist</Text>
        {[
          'Review all waiting-on-others loops — send nudges where needed',
          'Check promised-by-me items — are deadlines realistic?',
          'Resolve or escalate blocked items',
          'Close loops that are no longer relevant',
          'Record any pending decisions',
          'Set priorities for the coming week',
        ].map((item, index) => (
          <View key={index} style={styles.checkItem}>
            <View style={styles.checkbox} />
            <Text style={styles.checkText}>{item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  placeholder: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
});
