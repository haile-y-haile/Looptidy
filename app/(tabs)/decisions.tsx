import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoops } from '../../context/LoopContext';
import { useTheme } from '../../context/ThemeContext';
import { DecisionRecordCard } from '../../components/DecisionRecordCard';
import { EmptyState } from '../../components/EmptyState';
import { GlassCard } from '../../components/GlassCard';
import { LoopCard } from '../../components/LoopCard';
import { ScreenScroll } from '../../components/ScreenScroll';
import { ScreenCentered } from '../../components/ScreenCentered';
import { StatCard } from '../../components/StatCard';
import { hapticLight } from '../../lib/haptics';
import { flattenDecisions } from '../../lib/decisions';
import {
  getDecisionCenterStats,
  getDecisionsNeeded,
  getHighRiskDecisions,
  getRecentlyDecided,
  getRevisitSoon,
} from '../../lib/decisionCenter';
import { radius, spacing, typography } from '../../lib/theme';

export default function DecisionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { loops, loading } = useLoops();

  const allDecisions = useMemo(() => flattenDecisions(loops), [loops]);
  const stats = useMemo(() => getDecisionCenterStats(loops), [loops]);
  const neededLoops = useMemo(() => getDecisionsNeeded(loops), [loops]);
  const recent = useMemo(() => getRecentlyDecided(allDecisions), [allDecisions]);
  const revisit = useMemo(() => getRevisitSoon(allDecisions), [allDecisions]);
  const highRisk = useMemo(() => getHighRiskDecisions(allDecisions), [allDecisions]);

  if (loading) {
    return (
      <ScreenCentered>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenCentered>
    );
  }

  return (
    <ScreenScroll contentContainerStyle={{ paddingTop: spacing.lg + insets.top }}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Decision Center</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Track choices, rationale, impact, and revisits — tied to your open loops.
      </Text>

      <View style={styles.topActions}>
        <Pressable
          onPress={() => {
            void hapticLight();
            router.push('/decision-speed');
          }}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: theme.colors.primary, flex: 1 },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={styles.addBtnText}>Start decision (Decision Speed)</Text>
        </Pressable>
      </View>

      <GlassCard style={styles.statsCard} intensity={28} contentPadding={spacing.lg}>
        <View style={styles.statsRow}>
          <StatCard
            label="Total decisions"
            value={stats.needed + stats.optionsReviewed + stats.decided + stats.revisiting}
            embedded
          />
          <StatCard
            label="Needed now"
            value={stats.needed}
            color={theme.colors.warning}
            embedded
          />
        </View>
        <View style={[styles.statsRow, { marginTop: spacing.sm }]}>
          <StatCard
            label="Pending revisit"
            value={stats.revisitSoon}
            color={theme.colors.purple}
            embedded
          />
          <StatCard
            label="High risk"
            value={stats.highRisk}
            color={theme.colors.danger}
            embedded
          />
        </View>
      </GlassCard>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Needed now</Text>
      {neededLoops.length > 0 ? (
        neededLoops.map((loop) => <LoopCard key={loop.id} loop={loop} />)
      ) : (
        <EmptyState
          compact
          title="No decisions pending"
          message="You're all caught up."
        />
      )}

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Revisit soon</Text>
      {revisit.length > 0 ? (
        revisit.map((dec) => <DecisionRecordCard key={dec.id} decision={dec} />)
      ) : (
        <EmptyState compact title="Clear calendar" message="No decisions scheduled for revisit." />
      )}

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>High risk choices</Text>
      {highRisk.length > 0 ? (
        highRisk.map((dec) => <DecisionRecordCard key={dec.id} decision={dec} />)
      ) : (
        <EmptyState compact title="Low risk" message="No recent high-risk decisions." />
      )}

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recently decided</Text>
      {recent.length > 0 ? (
        recent.map((dec) => <DecisionRecordCard key={dec.id} decision={dec} />)
      ) : (
        <EmptyState compact title="Quiet week" message="No decisions made recently." />
      )}

      <View style={{ height: spacing.xxl }} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.largeTitle,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  topActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  addBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsCard: {
    marginBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
});
