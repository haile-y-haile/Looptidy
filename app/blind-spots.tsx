import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { BlindSpotCard } from '../components/BlindSpotCard';
import { EmptyState } from '../components/EmptyState';
import { FilterChip } from '../components/FilterChip';
import { GlassCard } from '../components/GlassCard';
import { ScreenScroll } from '../components/ScreenScroll';
import { StatCard } from '../components/StatCard';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { getBlindSpotSummary, getBlindSpots, type BlindSpotRiskLabel } from '../lib/blindSpots';
import { hapticLight } from '../lib/haptics';
import { spacing, typography } from '../lib/theme';

type BlindSpotFilter = 'all' | BlindSpotRiskLabel;

const FILTERS: { key: BlindSpotFilter; label: string; tone?: 'danger' | 'warning' | 'success' }[] = [
  { key: 'all', label: 'All' },
  { key: 'Likely to slip', label: 'Likely to slip', tone: 'danger' },
  { key: 'At risk', label: 'At risk', tone: 'warning' },
  { key: 'Getting stale', label: 'Getting stale' },
  { key: 'Needs attention', label: 'Needs attention' },
  { key: 'Low friction', label: 'Low friction', tone: 'success' },
];

export default function BlindSpotsScreen() {
  const { loops } = useLoops();
  const { theme } = useTheme();
  const [filter, setFilter] = useState<BlindSpotFilter>('all');
  const spots = useMemo(() => getBlindSpots(loops), [loops]);
  const summary = useMemo(() => getBlindSpotSummary(loops), [loops]);
  const filtered = useMemo(
    () => (filter === 'all' ? spots : spots.filter((spot) => spot.riskLabel === filter)),
    [filter, spots]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Blind Spots' }} />
      <ScreenScroll>
        <Text style={[styles.title, { color: theme.colors.text }]}>Blind Spots</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Catch loops most likely to slip before they become painful.</Text>

        <GlassCard style={styles.card} intensity={34}>
          <View style={styles.statsRow}>
            <StatCard label="Total" value={summary.total} embedded />
            <StatCard label="Likely to slip" value={summary.likelyToSlip} color={theme.colors.danger} embedded />
          </View>
          <View style={[styles.statsRow, styles.statsGap]}>
            <StatCard label="At risk" value={summary.atRisk} color={theme.colors.warning} embedded />
            <StatCard label="Getting stale" value={summary.stale} color={theme.colors.purple} embedded />
          </View>
          <Text style={[styles.summaryCopy, { color: theme.colors.textMuted }]}>Scores use age, due date, priority, risk, ownership clarity, last activity, waiting time, decision delay, and deferred state.</Text>
        </GlassCard>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScroll}>
          {FILTERS.map((item) => (
            <FilterChip
              key={item.key}
              label={item.label}
              selected={filter === item.key}
              tone={item.tone ?? 'default'}
              onPress={() => {
                void hapticLight();
                setFilter(item.key);
              }}
            />
          ))}
        </ScrollView>

        {filtered.length > 0 ? (
          filtered.map((spot) => <BlindSpotCard key={spot.loop.id} spot={spot} />)
        ) : (
          <EmptyState title="No blind spots" message="Nothing is quietly heating up in this filter right now." illustration />
        )}
      </ScreenScroll>
    </>
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
  card: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statsGap: {
    marginTop: spacing.md,
  },
  summaryCopy: {
    ...typography.caption,
    marginTop: spacing.md,
    lineHeight: 18,
  },
  filterScroll: {
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.lg,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
  },
});
