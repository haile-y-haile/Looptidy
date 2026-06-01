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
          <Text style={styles.addBtnText}>Decision Speed</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void hapticLight();
            router.push('/decision-detail?loopId=' + (neededLoops[0]?.id ?? loops[0]?.id ?? ''));
          }}
          style={({ pressed }) => [
            styles.addBtnOutline,
            { borderColor: theme.colors.border, flex: 1 },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={[styles.addBtnOutlineText, { color: theme.colors.text }]}>Add decision</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => {
          void hapticLight();
          router.push('/feedback');
        }}
        style={({ pressed }) => [
          styles.feedbackLink,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          pressed && { opacity: 0.9 },
        ]}
      >
        <Text style={[styles.feedbackLinkText, { color: theme.colors.text }]}>
          Feedback pipeline →
        </Text>
        <Text style={[styles.feedbackLinkSub, { color: theme.colors.textMuted }]}>
          Turn feedback into loops or decisions
        </Text>
      </Pressable>

      <GlassCard style={styles.statsCard} intensity={32}>
        <View style={styles.statsRow}>
          <StatCard label="Needed" value={stats.needed} color={theme.colors.warning} embedded />
          <StatCard label="Decided" value={stats.decided} color={theme.colors.success} embedded />
        </View>
        <View style={[styles.statsRow, styles.statsGap]}>
          <StatCard label="Revisiting" value={stats.revisiting} embedded />
          <StatCard label="Revisit soon" value={stats.revisitSoon} color={theme.colors.primary} embedded />
        </View>
        <StatCard label="High risk" value={stats.highRisk} color={theme.colors.danger} />
      </GlassCard>

      <Section title="Decisions needed" count={neededLoops.length}>
        {neededLoops.length > 0 ? (
          neededLoops.map((loop, i) => <LoopCard key={loop.id} loop={loop} index={i} />)
        ) : (
          <EmptyState compact title="All clear" message="No open decision loops right now." />
        )}
      </Section>

      <Section title="Revisit soon" count={revisit.length}>
        {revisit.length > 0 ? (
          revisit.map((d) => <DecisionRecordCard key={d.id} decision={d} />)
        ) : (
          <EmptyState compact title="Nothing to revisit" message="Set revisit dates on decisions." />
        )}
      </Section>

      <Section title="High-risk decisions" count={highRisk.length}>
        {highRisk.length > 0 ? (
          highRisk.map((d) => <DecisionRecordCard key={d.id} decision={d} expandedDefault />)
        ) : (
          <EmptyState compact title="No high-risk items" message="Decisions at high risk appear here." />
        )}
      </Section>

      <Section title="Recently decided" count={recent.length}>
        {recent.length > 0 ? (
          recent.map((d) => <DecisionRecordCard key={d.id} decision={d} />)
        ) : (
          <EmptyState compact title="No decisions yet" message="Record outcomes as you decide." />
        )}
      </Section>

      <Section title="All decisions" count={allDecisions.length}>
        {allDecisions.length > 0 ? (
          allDecisions.map((d) => <DecisionRecordCard key={d.id} decision={d} />)
        ) : (
          <EmptyState
            title="No decisions yet"
            message="Capture rationale and impact when you resolve open choices."
          />
        )}
      </Section>
    </ScreenScroll>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title} {count > 0 ? `(${count})` : ''}
      </Text>
      {children}
    </View>
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
  feedbackLink: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  feedbackLinkText: {
    ...typography.callout,
    fontWeight: '800',
  },
  feedbackLinkSub: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  topActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  addBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addBtnOutline: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addBtnOutlineText: {
    ...typography.callout,
    fontWeight: '800',
  },
  addBtnText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  statsCard: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statsGap: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
});
