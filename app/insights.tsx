import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../context/FeedbackContext';
import { useLoops } from '../context/LoopContext';
import { useScopeChanges } from '../context/ScopeContext';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenScroll } from '../components/ScreenScroll';
import { StatCard } from '../components/StatCard';
import { buildInsightMessages, computeInsights } from '../lib/insights';
import { getBlindSpotSummary } from '../lib/blindSpots';
import { hapticLight } from '../lib/haptics';
import { spacing, typography } from '../lib/theme';

export default function InsightsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { loops } = useLoops();
  const { scopeChanges } = useScopeChanges();
  const { feedbackItems } = useFeedback();

  const insights = useMemo(
    () => computeInsights(loops, scopeChanges, feedbackItems),
    [loops, scopeChanges, feedbackItems]
  );
  const messages = useMemo(() => buildInsightMessages(insights), [insights]);
  const blindSpotSummary = useMemo(() => getBlindSpotSummary(loops), [loops]);

  const maxType = Math.max(1, ...insights.byType.map((t) => t.count));

  return (
    <>
      <Stack.Screen options={{ title: 'Insights' }} />
      <ScreenScroll contentContainerStyle={{ paddingTop: spacing.md + insets.top }}>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Local follow-through snapshot — no cloud analytics.
        </Text>

        <GlassCard style={styles.card} intensity={36}>
          {messages.map((line) => (
            <Text
              key={line}
              style={[styles.insightLine, { color: theme.colors.text }]}
            >
              {line}
            </Text>
          ))}
        </GlassCard>

        <View style={styles.statsRow}>
          <StatCard label="Open loops" value={insights.totalOpen} embedded />
          <StatCard
            label="Closed this week"
            value={insights.closedThisWeek}
            color={theme.colors.success}
            embedded
          />
        </View>
        <View style={[styles.statsRow, styles.statsGap]}>
          <StatCard label="Opened this week" value={insights.openedThisWeek} embedded />
          <StatCard
            label="Overdue"
            value={insights.overdueCount}
            color={theme.colors.danger}
            embedded
          />
        </View>

        <GlassCard style={styles.card} intensity={32}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Blind Spots</Text>
          <View style={styles.statsRow}>
            <StatCard label="Total" value={blindSpotSummary.total} embedded />
            <StatCard
              label="Likely to slip"
              value={blindSpotSummary.likelyToSlip}
              color={theme.colors.danger}
              embedded
            />
          </View>
          <View style={[styles.statsRow, styles.statsGap]}>
            <StatCard label="At risk" value={blindSpotSummary.atRisk} color={theme.colors.warning} embedded />
            <StatCard label="Needs attention" value={blindSpotSummary.needsAttention} embedded />
          </View>
          <Pressable
            onPress={() => {
              void hapticLight();
              router.push('/blind-spots');
            }}
            style={({ pressed }) => [
              styles.linkButton,
              { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={[styles.linkButtonText, { color: theme.colors.primary }]}>Open Blind Spots</Text>
          </Pressable>
        </GlassCard>

        <GlassCard style={styles.card} intensity={32}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Closure progress this week
          </Text>
          <ProgressBar
            label="Loops closed"
            value={insights.closedThisWeek}
            max={insights.closedThisWeekGoal}
            color={theme.colors.success}
          />
          {insights.closureRatePercent !== null ? (
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
              {insights.closureRatePercent}% of all loops are closed (lifetime).
            </Text>
          ) : null}
        </GlassCard>

        <GlassCard style={styles.card} intensity={32}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Risk snapshot</Text>
          <View style={styles.statsRow}>
            <StatCard
              label="High risk"
              value={insights.highRiskCount}
              color={theme.colors.danger}
              embedded
            />
            <StatCard
              label="Blocked"
              value={insights.blockedCount}
              color={theme.colors.warning}
              embedded
            />
          </View>
          <View style={[styles.statsRow, styles.statsGap]}>
            <StatCard label="Waiting" value={insights.waitingCount} embedded />
            <StatCard label="Promised" value={insights.promisedCount} embedded />
          </View>
          <StatCard
            label="Decisions needed"
            value={insights.decisionsNeededCount}
            color={theme.colors.purple}
          />
        </GlassCard>

        <GlassCard style={styles.card} intensity={32}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>PM signals</Text>
          <View style={styles.statsRow}>
            <StatCard label="Decisions pending" value={insights.decisionsPending} embedded />
            <StatCard
              label="Decided this week"
              value={insights.decisionsMadeThisWeek}
              color={theme.colors.success}
              embedded
            />
          </View>
          <View style={[styles.statsRow, styles.statsGap]}>
            <StatCard label="Unclear ownership" value={insights.unclearOwnership} embedded />
            <StatCard
              label="Escalated"
              value={insights.escalatedLoops}
              color={theme.colors.danger}
              embedded
            />
          </View>
          <View style={[styles.statsRow, styles.statsGap]}>
            <StatCard label="Scope captured" value={insights.scopeChangesCaptured} embedded />
            <StatCard
              label="High-impact scope"
              value={insights.highImpactScope}
              color={theme.colors.warning}
              embedded
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Feedback captured" value={insights.feedbackCaptured} embedded />
            <StatCard
              label="Feedback converted"
              value={insights.feedbackConverted}
              color={theme.colors.primary}
              embedded
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.card} intensity={32}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Open loops by type</Text>
          {insights.byType.length === 0 ? (
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>No open loops yet.</Text>
          ) : (
            insights.byType.map((row) => (
              <ProgressBar
                key={row.type}
                label={row.label}
                value={row.count}
                max={maxType}
              />
            ))
          )}
        </GlassCard>

        <GlassCard style={styles.card} intensity={32}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Aging open loops</Text>
          {insights.agingBuckets.map((b) => (
            <ProgressBar
              key={b.label}
              label={b.label}
              value={b.count}
              max={Math.max(1, insights.totalOpen)}
            />
          ))}
          <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
            Average age: {insights.averageAgeDays} days
            {insights.oldestOpenTitle
              ? ` · Oldest: “${insights.oldestOpenTitle.slice(0, 40)}${insights.oldestOpenTitle.length > 40 ? '…' : ''}” (${insights.oldestOpenDays}d)`
              : ''}
          </Text>
        </GlassCard>

        {insights.topCategories.length > 0 ? (
          <GlassCard style={styles.card} intensity={32}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Top categories</Text>
            {insights.topCategories.map((row) => (
              <View key={row.category} style={styles.categoryRow}>
                <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>
                  {row.label}
                </Text>
                <Text style={[styles.categoryCount, { color: theme.colors.primary }]}>
                  {row.count}
                </Text>
              </View>
            ))}
          </GlassCard>
        ) : null}
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  linkButton: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  linkButtonText: {
    ...typography.callout,
    fontWeight: '800',
  },
  insightLine: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statsGap: {
    marginTop: -spacing.xs,
  },
  meta: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  categoryLabel: {
    ...typography.callout,
  },
  categoryCount: {
    ...typography.callout,
    fontWeight: '800',
  },
});
