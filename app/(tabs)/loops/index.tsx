import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoops } from '../../../context/LoopContext';
import { useTheme } from '../../../context/ThemeContext';
import { LoopCard } from '../../../components/LoopCard';
import { EmptyState } from '../../../components/EmptyState';
import { FilterChip } from '../../../components/FilterChip';
import { ScreenScroll } from '../../../components/ScreenScroll';
import { ScreenCentered } from '../../../components/ScreenCentered';
import { SectionHeader } from '../../../components/SectionHeader';
import { hapticLight } from '../../../lib/haptics';
import {
  getEmptyStateForFilter,
  getLoopFilterLabel,
  getLoopsForFilter,
  isLoopListFilter,
  LOOP_LIST_FILTERS,
  type LoopListFilter,
} from '../../../lib/loopFilters';
import { spacing, typography } from '../../../lib/theme';

export default function LoopsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { loops, loading } = useLoops();
  const params = useLocalSearchParams<{ filter?: string | string[] }>();

  const initialFilter = useMemo(() => {
    const raw = Array.isArray(params.filter) ? params.filter[0] : params.filter;
    return isLoopListFilter(raw) ? raw : 'all';
  }, [params.filter]);

  const [filter, setFilter] = useState<LoopListFilter>(initialFilter);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const filteredLoops = useMemo(() => getLoopsForFilter(loops, filter), [loops, filter]);
  const emptyCopy = getEmptyStateForFilter(filter);

  if (loading) {
    return (
      <ScreenCentered>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenCentered>
    );
  }

  return (
    <ScreenScroll contentContainerStyle={{ paddingTop: spacing.lg + insets.top }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Loops</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {filteredLoops.length} {filter === 'closed' ? 'closed' : 'open'}
          {filter !== 'all' ? ` · ${getLoopFilterLabel(filter)}` : ''}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {LOOP_LIST_FILTERS.map((item) => (
          <FilterChip
            key={item.key}
            label={item.label}
            selected={filter === item.key}
            onPress={() => {
              void hapticLight();
              setFilter(item.key);
            }}
            tone={item.key === 'blocked' ? 'danger' : item.key === 'due' ? 'warning' : 'default'}
          />
        ))}
      </ScrollView>

      <SectionHeader
        title={getLoopFilterLabel(filter)}
        action="+ New"
        onAction={() => router.push('/loops/new')}
      />

      {filteredLoops.length > 0 ? (
        filteredLoops.map((loop) => <LoopCard key={loop.id} loop={loop} />)
      ) : (
        <EmptyState title={emptyCopy.title} message={emptyCopy.message} />
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.largeTitle,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
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
