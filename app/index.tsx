import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLoops } from '../context/LoopContext';
import { StatCard } from '../components/StatCard';
import { SectionHeader } from '../components/SectionHeader';
import { LoopCard } from '../components/LoopCard';
import { EmptyState } from '../components/EmptyState';
import { colors, radius, spacing, typography } from '../lib/theme';
import { isDueSoon, isOpenLoop } from '../lib/utils';

export default function TodayScreen() {
  const router = useRouter();
  const { loops, loading } = useLoops();

  const openLoops = loops.filter(isOpenLoop);
  const waitingCount = openLoops.filter((l) => l.type === 'waiting_on_others').length;
  const promisedCount = openLoops.filter((l) => l.type === 'promised_by_me').length;
  const decisionCount = openLoops.filter(
    (l) => l.type === 'decision_needed' && l.status !== 'decided'
  ).length;
  const dueSoon = openLoops.filter((l) => l.dueDate && isDueSoon(l.dueDate));
  const highRisk = openLoops.filter((l) => l.riskLevel === 'high' || l.riskLevel === 'medium');

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>LoopTidy</Text>
        <Text style={styles.subtitle}>Follow Up Tracker</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          label="Open Loops"
          value={openLoops.length}
          onPress={() => router.push('/loops')}
        />
        <StatCard
          label="Waiting"
          value={waitingCount}
          color={colors.purple}
          onPress={() => router.push('/waiting')}
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard
          label="Promised"
          value={promisedCount}
          color={colors.primary}
          onPress={() => router.push('/promised')}
        />
        <StatCard
          label="Decisions"
          value={decisionCount}
          color={colors.warning}
          onPress={() => router.push('/decisions')}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          onPress={() => router.push('/loops/new')}
        >
          <Text style={styles.primaryButtonText}>+ New Loop</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={() => router.push('/weekly-review')}
        >
          <Text style={styles.secondaryButtonText}>Weekly Review</Text>
        </Pressable>
      </View>

      <SectionHeader title="Due Soon" />
      {dueSoon.length > 0 ? (
        dueSoon.map((loop) => <LoopCard key={loop.id} loop={loop} />)
      ) : (
        <EmptyState
          title="Nothing due soon"
          message="You're clear for the next week."
        />
      )}

      <SectionHeader title="High Risk" />
      {highRisk.length > 0 ? (
        highRisk.map((loop) => <LoopCard key={loop.id} loop={loop} />)
      ) : (
        <EmptyState
          title="No high-risk loops"
          message="All open loops are at manageable risk levels."
        />
      )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.largeTitle,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.callout,
    color: colors.surface,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...typography.callout,
    color: colors.text,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});
