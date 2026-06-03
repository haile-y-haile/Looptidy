import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { EmptyState } from '../components/EmptyState';
import { GlassCard } from '../components/GlassCard';
import { LoopCard } from '../components/LoopCard';
import { ScreenScroll } from '../components/ScreenScroll';
import { StatCard } from '../components/StatCard';
import {
  getAccountabilitySummary,
  getEscalatedLoops,
  getLoopsNeedingFollowUp,
  getLoopsWithUnclearOwnership,
  getLoopsWithoutNextActionOwner,
  getPromisedByMe,
  getWaitingOnOthers,
} from '../lib/accountability';
import { spacing, typography } from '../lib/theme';

export default function OwnershipScreen() {
  const { loops } = useLoops();
  const { theme } = useTheme();
  const summary = useMemo(() => getAccountabilitySummary(loops), [loops]);

  const rawSections = useMemo(
    () => [
      { id: 'unclear', title: 'Unclear ownership', data: getLoopsWithUnclearOwnership(loops) },
      { id: 'waiting', title: 'Waiting on someone', data: getWaitingOnOthers(loops) },
      { id: 'promised', title: 'Promises I made', data: getPromisedByMe(loops) },
      { id: 'needs_follow_up', title: 'Needs follow-up', data: getLoopsNeedingFollowUp(loops) },
      { id: 'escalated', title: 'Escalated', data: getEscalatedLoops(loops) },
      { id: 'no_action_owner', title: 'No next action owner', data: getLoopsWithoutNextActionOwner(loops) },
    ],
    [loops]
  );

  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Ownership' }} />
      <ScreenScroll>
        <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
          See who owns the next move, who you are waiting on, and what needs a nudge.
        </Text>
        <GlassCard intensity={32} style={styles.stats}>
          <View style={styles.statsRow}>
            <StatCard label="Unclear" value={summary.unclear} embedded color={theme.colors.warning} />
            <StatCard label="Escalated" value={summary.escalated} embedded color={theme.colors.danger} />
          </View>
          <View style={[styles.statsRow, { marginTop: spacing.sm }]}>
            <StatCard label="Waiting" value={summary.waiting} embedded />
            <StatCard label="Promised" value={summary.promised} embedded />
          </View>
        </GlassCard>
        {rawSections.map((sec) => {
          const isCollapsed = collapsedMap[sec.id] ?? sec.data.length === 0;
          return (
            <CollapsibleSection
              key={sec.id}
              title={sec.title}
              count={sec.data.length}
              collapsed={isCollapsed}
              onToggle={() => toggleSection(sec.id)}
            >
              {sec.data.length > 0 ? (
                sec.data.map((loop, i) => <LoopCard key={loop.id} loop={loop} index={i} />)
              ) : (
                <EmptyState compact title="Clear" message="Nothing in this bucket." />
              )}
            </CollapsibleSection>
          );
        })}
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  sub: { ...typography.body, marginBottom: spacing.lg },
  stats: { marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.md },
});
