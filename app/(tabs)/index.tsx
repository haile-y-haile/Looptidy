import { View, Text, StyleSheet, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { QuickCaptureSheet } from '../../components/QuickCaptureSheet';
import { Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoops } from '../../context/LoopContext';
import { useTheme } from '../../context/ThemeContext';
import { StatCard } from '../../components/StatCard';
import { LoopCard } from '../../components/LoopCard';
import { EmptyState } from '../../components/EmptyState';
import { ScreenScroll } from '../../components/ScreenScroll';
import { ScreenCentered } from '../../components/ScreenCentered';
import { SegmentedControl } from '../../components/SegmentedControl';
import { FilterChip } from '../../components/FilterChip';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { ActionTile } from '../../components/ActionTile';
import { GlassCard } from '../../components/GlassCard';
import { getOnboardingComplete } from '../../lib/preferences';
import { hapticLight, hapticSuccess } from '../../lib/haptics';
import { radius, spacing, typography } from '../../lib/theme';
import type { LoopType, OpenLoop, Priority, RiskLevel } from '../../types';
import { formatRelativeDate, isDueSoon, isOpenLoop, isOverdue, loopTypeLabels } from '../../lib/utils';
import { showComingSoon } from '../../lib/comingSoon';
import { quickActionIcons } from '../../lib/icons';
import { useScopeChanges } from '../../context/ScopeContext';
import { useFeedback } from '../../context/FeedbackContext';
import { PMSignalsCard } from '../../components/PMSignalsCard';
import { computePMSignals } from '../../lib/pmSignals';

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { loops, loading, refreshLoops } = useLoops();
  const { scopeChanges } = useScopeChanges();
  const { feedbackItems } = useFeedback();
  const pmSignals = useMemo(
    () => computePMSignals(loops, scopeChanges, feedbackItems),
    [loops, scopeChanges, feedbackItems]
  );
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);

  const [tab, setTab] = useState<'overview' | 'due' | 'waiting' | 'promised'>('overview');
  const [chips, setChips] = useState<{
    highPriority: boolean;
    highRisk: boolean;
    overdue: boolean;
    blocked: boolean;
    decisions: boolean;
  }>({ highPriority: false, highRisk: false, overdue: false, blocked: false, decisions: false });

  const [collapsed, setCollapsed] = useState({
    upNext: false,
    dueSoon: false,
    highRisk: false,
    waiting: true,
    promised: true,
  });

  const headerEnter = useRef(new Animated.Value(0)).current;

  const openLoops = loops.filter(isOpenLoop);
  const waitingCount = openLoops.filter((l) => l.type === 'waiting_on_others').length;
  const promisedCount = openLoops.filter((l) => l.type === 'promised_by_me').length;
  const decisionCount = openLoops.filter(
    (l) => l.type === 'decision_needed' && l.status !== 'decided'
  ).length;
  const dueSoon = openLoops.filter((l) => l.dueDate && isDueSoon(l.dueDate));
  const highRisk = openLoops.filter((l) => l.riskLevel === 'high' || l.riskLevel === 'medium');

  const overdue = openLoops.filter((l) => l.dueDate && isOverdue(l.dueDate));

  const focusLoop = useMemo(() => {
    const score = (l: OpenLoop) => {
      let s = 0;
      if (l.dueDate && isOverdue(l.dueDate)) s += 120;
      if (l.dueDate && isDueSoon(l.dueDate)) s += 80;
      if (l.priority === 'urgent') s += 70;
      if (l.priority === 'high') s += 40;
      if (l.riskLevel === 'high') s += 60;
      if (l.riskLevel === 'medium') s += 25;
      if (l.status === 'blocked') s += 35;
      if (l.type === 'waiting_on_others') s += 20;
      return s;
    };
    return [...openLoops].sort((a, b) => score(b) - score(a))[0];
  }, [openLoops]);

  const upNext = useMemo(() => {
    const score = (l: OpenLoop) => {
      let s = 0;
      if (l.dueDate && isOverdue(l.dueDate)) s += 120;
      if (l.dueDate && isDueSoon(l.dueDate)) s += 80;
      if (l.priority === 'urgent') s += 70;
      if (l.priority === 'high') s += 40;
      if (l.riskLevel === 'high') s += 60;
      if (l.riskLevel === 'medium') s += 25;
      if (l.status === 'blocked') s += 35;
      return s;
    };
    return [...openLoops].sort((a, b) => score(b) - score(a)).slice(0, 5);
  }, [openLoops]);

  const filteredByTab = useMemo(() => {
    switch (tab) {
      case 'due':
        return openLoops.filter((l) => !!l.dueDate);
      case 'waiting':
        return openLoops.filter((l) => l.type === 'waiting_on_others');
      case 'promised':
        return openLoops.filter((l) => l.type === 'promised_by_me');
      case 'overview':
      default:
        return openLoops;
    }
  }, [openLoops, tab]);

  const filtered = useMemo(() => {
    return filteredByTab.filter((l) => {
      if (chips.highPriority && !(l.priority === 'high' || l.priority === 'urgent')) return false;
      if (chips.highRisk && !(l.riskLevel === 'high' || l.riskLevel === 'medium')) return false;
      if (chips.overdue && !(l.dueDate && isOverdue(l.dueDate))) return false;
      if (chips.blocked && !(l.status === 'blocked' || l.type === 'blocked')) return false;
      if (chips.decisions && !(l.type === 'decision_needed')) return false;
      return true;
    });
  }, [chips, filteredByTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await hapticLight();
    try {
      await refreshLoops();
      setLastUpdatedAt(new Date());
      await hapticSuccess();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const done = await getOnboardingComplete();
      if (cancelled) return;
      if (!done) router.replace('/onboarding');
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    Animated.timing(headerEnter, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerEnter]);

  if (loading) {
    return (
      <ScreenCentered>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenCentered>
    );
  }

  return (
    <ScreenScroll
      contentContainerStyle={{ paddingTop: spacing.lg + insets.top }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={theme.colors.primary}
        />
      }
    >
      <Animated.View
        style={{
          opacity: headerEnter,
          transform: [
            { translateY: headerEnter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
          ],
        }}
      >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.colors.text }]}>LoopTidy</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Close the loops that matter to you
        </Text>
        <View style={styles.metaLine}>
          <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
            {lastUpdatedAt ? `Updated ${formatRelativeDate(lastUpdatedAt.toISOString())}` : `Open: ${openLoops.length} • Overdue: ${overdue.length}`}
          </Text>
        </View>
      </View>
      </Animated.View>

      {/* Quick actions grid */}
      <View style={styles.actionGrid}>
        <ActionTile
          title="Waiting on someone"
          subtitle="Track a dependency"
          icon={quickActionIcons.waiting}
          accent="purple"
          onPress={() => {
            void hapticLight();
            router.push({ pathname: '/loops/new', params: { type: 'waiting_on_others' } });
          }}
        />
        <ActionTile
          title="A promise you made"
          subtitle="Hold yourself to it"
          icon={quickActionIcons.promise}
          accent="primary"
          onPress={() => {
            void hapticLight();
            router.push({ pathname: '/loops/new', params: { type: 'promised_by_me' } });
          }}
        />
      </View>
      <View style={styles.actionGrid}>
        <ActionTile
          title="Decision to make"
          subtitle="Capture the outcome"
          icon={quickActionIcons.decision}
          accent="warning"
          onPress={() => {
            void hapticLight();
            router.push('/decision-speed');
          }}
        />
        <ActionTile
          title="Weekly review"
          subtitle="Plan your week"
          icon={quickActionIcons.review}
          accent="success"
          onPress={() => {
            void hapticLight();
            router.push('/weekly-review');
          }}
        />
      </View>

      <GlassCard style={styles.statsPanel} intensity={32} contentPadding={spacing.lg}>
        <View style={styles.statsRowEmbedded}>
          <StatCard
            label="Open Loops"
            value={openLoops.length}
            embedded
            onPress={() => router.push('/loops')}
          />
          <StatCard
            label="Waiting"
            value={waitingCount}
            color={theme.colors.purple}
            embedded
            onPress={() => router.push({ pathname: '/loops', params: { filter: 'waiting' } })}
          />
        </View>
        <View style={[styles.statsRowEmbedded, styles.statsRowEmbeddedGap]}>
          <StatCard
            label="Promised"
            value={promisedCount}
            color={theme.colors.primary}
            embedded
            onPress={() => router.push({ pathname: '/loops', params: { filter: 'promised' } })}
          />
          <StatCard
            label="Decisions"
            value={decisionCount}
            color={theme.colors.warning}
            embedded
            onPress={() => router.push('/decisions')}
          />
        </View>
      </GlassCard>

      <PMSignalsCard signals={pmSignals} />

      <GlassCard style={styles.pmTools} intensity={28} contentPadding={spacing.md}>
        <Text style={[styles.pmToolsTitle, { color: theme.colors.text }]}>PM tools</Text>
        <View style={styles.pmToolsRow}>
          <Pressable onPress={() => router.push('/decision-speed')} style={styles.pmTool}>
            <Text style={[styles.pmToolText, { color: theme.colors.primary }]}>Decision Speed</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/ownership')} style={styles.pmTool}>
            <Text style={[styles.pmToolText, { color: theme.colors.primary }]}>Ownership</Text>
          </Pressable>
        </View>
        <View style={styles.pmToolsRow}>
          <Pressable onPress={() => router.push('/scope-guard')} style={styles.pmTool}>
            <Text style={[styles.pmToolText, { color: theme.colors.primary }]}>Scope Guard</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/feedback')} style={styles.pmTool}>
            <Text style={[styles.pmToolText, { color: theme.colors.primary }]}>Feedback</Text>
          </Pressable>
        </View>
      </GlassCard>

      <GlassCard style={styles.focusCard} intensity={45} contentPadding={spacing.xxl}>
        <Text style={[styles.focusLabel, { color: theme.colors.textMuted }]}>Today's focus</Text>
        {focusLoop ? (
          <>
            <Text style={[styles.focusTitle, { color: theme.colors.text }]} numberOfLines={2}>
              {focusLoop.title}
            </Text>
            <Text style={[styles.focusSub, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {focusLoop.dueDate
                ? `Due ${formatRelativeDate(focusLoop.dueDate)}`
                : loopTypeLabels[focusLoop.type]}
              {focusLoop.waitingOn ? ` · Waiting on ${focusLoop.waitingOn.name}` : ''}
            </Text>
            <View style={styles.focusActions}>
              <Pressable
                onPress={() => {
                  void hapticLight();
                  router.push(`/loops/${focusLoop.id}`);
                }}
                style={({ pressed }) => [
                  styles.focusButtonPrimary,
                  { backgroundColor: theme.colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.focusButtonPrimaryText}>Open</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  void hapticLight();
                  showComingSoon('Follow-up nudges');
                }}
                style={({ pressed }) => [
                  styles.focusButtonSecondary,
                  { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.focusButtonSecondaryText, { color: theme.colors.text }]}>
                  Nudge
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <EmptyState compact title="All clear" message="No urgent loops need attention right now." />
        )}
      </GlassCard>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
            pressed && styles.pressed,
          ]}
          onPress={() => {
            void hapticLight();
            setQuickCaptureOpen(true);
          }}
        >
          <Text style={styles.primaryButtonText}>Quick capture</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            pressed && styles.pressed,
          ]}
          onPress={() => router.push('/loops/new')}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
            New loop
          </Text>
        </Pressable>
      </View>

      <View style={styles.linkRow}>
        <Pressable
          onPress={() => router.push('/insights')}
          style={({ pressed }) => [
            styles.insightsLink,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.insightsLinkText, { color: theme.colors.primary }]}>Insights</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/people')}
          style={({ pressed }) => [
            styles.insightsLink,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.insightsLinkText, { color: theme.colors.primary }]}>People</Text>
        </Pressable>
      </View>

      <SegmentedControl
        value={tab}
        onChange={(next) => {
          void hapticLight();
          setTab(next);
        }}
        glass
        segments={[
          { key: 'overview', label: 'Overview' },
          { key: 'due', label: 'Due' },
          { key: 'waiting', label: 'Waiting' },
          { key: 'promised', label: 'Promised' },
        ]}
      />

      <View style={styles.chipsRow}>
        <FilterChip
          label="High priority"
          selected={chips.highPriority}
          onPress={() => setChips((c) => ({ ...c, highPriority: !c.highPriority }))}
        />
        <FilterChip
          label="High risk"
          tone="warning"
          selected={chips.highRisk}
          onPress={() => setChips((c) => ({ ...c, highRisk: !c.highRisk }))}
        />
        <FilterChip
          label="Overdue"
          tone="danger"
          selected={chips.overdue}
          onPress={() => setChips((c) => ({ ...c, overdue: !c.overdue }))}
        />
        <FilterChip
          label="Blocked"
          tone="danger"
          selected={chips.blocked}
          onPress={() => setChips((c) => ({ ...c, blocked: !c.blocked }))}
        />
        <FilterChip
          label="Decisions"
          tone="success"
          selected={chips.decisions}
          onPress={() => setChips((c) => ({ ...c, decisions: !c.decisions }))}
        />
      </View>

      <CollapsibleSection
        title="Up Next"
        count={upNext.length}
        collapsed={collapsed.upNext}
        onToggle={() => setCollapsed((s) => ({ ...s, upNext: !s.upNext }))}
      >
        {upNext.length > 0 ? (
          upNext.map((l) => <LoopCard key={l.id} loop={l} />)
        ) : (
          <EmptyState compact title="Nothing up next" message="You're in good shape." />
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Due Soon"
        count={dueSoon.length}
        collapsed={collapsed.dueSoon}
        onToggle={() => setCollapsed((s) => ({ ...s, dueSoon: !s.dueSoon }))}
      >
        {dueSoon.length > 0 ? (
          dueSoon.map((loop) => <LoopCard key={loop.id} loop={loop} />)
        ) : (
          <EmptyState compact title="Nothing due soon" message="You're clear for the next week." />
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="High Risk"
        count={highRisk.length}
        collapsed={collapsed.highRisk}
        onToggle={() => setCollapsed((s) => ({ ...s, highRisk: !s.highRisk }))}
      >
        {highRisk.length > 0 ? (
          highRisk.map((loop) => <LoopCard key={loop.id} loop={loop} />)
        ) : (
          <EmptyState
            compact
            title="No high-risk loops"
            message="All open loops are at manageable risk levels."
          />
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Results"
        count={filtered.length}
        collapsed={false}
        onToggle={() => {}}
      >
        {filtered.length > 0 ? (
          filtered.slice(0, 8).map((loop) => <LoopCard key={loop.id} loop={loop} />)
        ) : (
          <EmptyState compact title="No matches" message="Try clearing a filter chip." />
        )}
      </CollapsibleSection>

      <QuickCaptureSheet visible={quickCaptureOpen} onClose={() => setQuickCaptureOpen(false)} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.largeTitle,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  statsPanel: {
    marginBottom: spacing.md,
  },
  statsRowEmbedded: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statsRowEmbeddedGap: {
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...typography.callout,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  metaLine: {
    marginTop: spacing.sm,
  },
  metaText: {
    ...typography.caption,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  focusCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  focusLabel: {
    ...typography.label,
  },
  focusTitle: {
    ...typography.title,
    marginTop: spacing.sm,
  },
  focusSub: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  focusActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  focusButtonPrimary: {
    flex: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  focusButtonPrimaryText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  focusButtonSecondary: {
    flex: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  focusButtonSecondaryText: {
    ...typography.callout,
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  linkRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  insightsLink: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  insightsLinkText: {
    ...typography.callout,
    fontWeight: '800',
  },
  pmTools: {
    marginBottom: spacing.lg,
  },
  pmToolsTitle: {
    ...typography.callout,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  pmToolsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pmTool: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  pmToolText: {
    ...typography.caption,
    fontWeight: '800',
  },
});
