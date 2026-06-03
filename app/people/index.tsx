import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useLoops } from '../../context/LoopContext';
import { useTheme } from '../../context/ThemeContext';
import { EmptyState } from '../../components/EmptyState';
import { PersonSummaryCard } from '../../components/PersonSummaryCard';
import { ScreenScroll } from '../../components/ScreenScroll';
import { SearchField } from '../../components/SearchField';
import { useState } from 'react';
import { buildPeopleSummaries } from '../../lib/people';
import { radius, spacing, typography } from '../../lib/theme';

export default function PeopleIndexScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { loops } = useLoops();
  const [query, setQuery] = useState('');

  const people = useMemo(() => buildPeopleSummaries(loops), [loops]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.role?.toLowerCase().includes(q) ?? false) ||
        (p.email?.toLowerCase().includes(q) ?? false)
    );
  }, [people, query]);

  return (
    <ScreenScroll>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Open loops grouped by people in your local data — no contacts permission required.
      </Text>
      
      {people.length > 0 && (
        <View style={styles.bottleneckWrap}>
          <Text style={[styles.bottleneckTitle, { color: theme.colors.text }]}>Top Bottlenecks</Text>
          <View style={[styles.bottleneckBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {people.slice(0, 3).map((p, i) => (
              <View key={p.key} style={styles.bottleneckRow}>
                <View style={styles.bottleneckLeft}>
                  <Text style={[styles.bottleneckRank, { color: theme.colors.textMuted }]}>#{i + 1}</Text>
                  <Text style={[styles.bottleneckName, { color: theme.colors.text }]} numberOfLines={1}>{p.name}</Text>
                </View>
                <View style={styles.bottleneckRight}>
                  <View style={[styles.barBg, { backgroundColor: theme.colors.borderLight }]}>
                    <View style={[styles.barFill, { backgroundColor: theme.colors.warning, width: `${Math.min(100, (p.totalOpen / (people[0]?.totalOpen || 1)) * 100)}%` }]} />
                  </View>
                  <Text style={[styles.bottleneckScore, { color: theme.colors.textSecondary }]}>{p.totalOpen}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <SearchField value={query} onChangeText={setQuery} placeholder="Search people…" />
      {filtered.length > 0 ? (
        filtered.map((person) => (
          <PersonSummaryCard
            key={person.key}
            person={person}
            onPress={() => router.push(`/people/${person.key}`)}
          />
        ))
      ) : (
        <EmptyState
          title="No people yet"
          message="Add names to waiting-on or promised-to fields when you capture loops."
        />
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  bottleneckWrap: {
    marginBottom: spacing.xl,
  },
  bottleneckTitle: {
    ...typography.headline,
    marginBottom: spacing.sm,
  },
  bottleneckBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  bottleneckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  bottleneckLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  bottleneckRank: {
    ...typography.caption,
    fontWeight: 'bold',
    width: 20,
  },
  bottleneckName: {
    ...typography.callout,
    fontWeight: '600',
    flex: 1,
  },
  bottleneckRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  barBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  bottleneckScore: {
    ...typography.caption,
    width: 20,
    textAlign: 'right',
  },
});
