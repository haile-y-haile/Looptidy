import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useLoops } from '../../context/LoopContext';
import { useTheme } from '../../context/ThemeContext';
import { EmptyState } from '../../components/EmptyState';
import { PersonSummaryCard } from '../../components/PersonSummaryCard';
import { ScreenScroll } from '../../components/ScreenScroll';
import { SearchField } from '../../components/SearchField';
import { useState } from 'react';
import { buildPeopleSummaries } from '../../lib/people';
import { spacing, typography } from '../../lib/theme';

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
});
