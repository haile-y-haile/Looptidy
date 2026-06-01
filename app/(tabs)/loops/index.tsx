import { useEffect, useMemo, useState } from 'react';
import { QuickCaptureSheet } from '../../../components/QuickCaptureSheet';
import { GlassCard } from '../../../components/GlassCard';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoops } from '../../../context/LoopContext';
import { useTheme } from '../../../context/ThemeContext';
import { LoopCard } from '../../../components/LoopCard';
import { EmptyState } from '../../../components/EmptyState';
import { FilterChip } from '../../../components/FilterChip';
import { ListSkeleton } from '../../../components/ListSkeleton';
import { SearchField } from '../../../components/SearchField';
import { ScreenScroll } from '../../../components/ScreenScroll';
import { hapticLight } from '../../../lib/haptics';
import { filterLoopsByQuery } from '../../../lib/loopSearch';
import {
  getEmptyStateForFilter,
  getLoopFilterLabel,
  getLoopsForFilter,
  isLoopListFilter,
  LOOP_LIST_FILTERS,
  type LoopListFilter,
} from '../../../lib/loopFilters';
import { spacing, typography } from '../../../lib/theme';
import { isDueSoon, isOpenLoop, isOverdue } from '../../../lib/utils';

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
  const [query, setQuery] = useState('');
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const openLoops = useMemo(() => loops.filter(isOpenLoop), [loops]);
  const dueCount = useMemo(
    () => openLoops.filter((l) => l.dueDate && (isDueSoon(l.dueDate) || isOverdue(l.dueDate))).length,
    [openLoops]
  );

  const filteredLoops = useMemo(() => {
    const byFilter = getLoopsForFilter(loops, filter);
    return filterLoopsByQuery(byFilter, query);
  }, [loops, filter, query]);

  const emptyCopy = getEmptyStateForFilter(filter);

  return (
    <ScreenScroll contentContainerStyle={{ paddingTop: spacing.lg + insets.top }}>
      <View style={styles.headerRow}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Loops</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {openLoops.length} open
            {dueCount > 0 ? ` · ${dueCount} due soon` : ''}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/loops/new')}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: theme.colors.primary },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={styles.addLabel}>+</Text>
        </Pressable>
      </View>

      <GlassCard style={styles.hubCard} intensity={28} contentPadding={spacing.md}>
        <View style={styles.hubRow}>
          <Pressable
            onPress={() => {
              void hapticLight();
              router.push('/loops/command-center');
            }}
            style={({ pressed }) => [styles.hubBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={[styles.hubBtnTitle, { color: theme.colors.text }]}>Command Center</Text>
            <Text style={[styles.hubBtnSub, { color: theme.colors.textMuted }]}>
              Search, filter & sort
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void hapticLight();
              router.push('/insights');
            }}
            style={({ pressed }) => [styles.hubBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={[styles.hubBtnTitle, { color: theme.colors.text }]}>Insights</Text>
            <Text style={[styles.hubBtnSub, { color: theme.colors.textMuted }]}>
              Follow-through stats
            </Text>
          </Pressable>
        </View>
        <View style={styles.hubRow}>
          <Pressable
            onPress={() => {
              void hapticLight();
              router.push('/people');
            }}
            style={({ pressed }) => [styles.hubBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={[styles.hubBtnTitle, { color: theme.colors.text }]}>People</Text>
            <Text style={[styles.hubBtnSub, { color: theme.colors.textMuted }]}>
              Commitments by person
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void hapticLight();
              router.push('/weekly-review');
            }}
            style={({ pressed }) => [styles.hubBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={[styles.hubBtnTitle, { color: theme.colors.text }]}>Weekly review</Text>
            <Text style={[styles.hubBtnSub, { color: theme.colors.textMuted }]}>
              Guided triage
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => {
            void hapticLight();
            setQuickCaptureOpen(true);
          }}
          style={({ pressed }) => [
            styles.quickBtn,
            { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={[styles.quickBtnText, { color: theme.colors.primary }]}>Quick capture</Text>
        </Pressable>
      </GlassCard>

      <SearchField value={query} onChangeText={setQuery} />

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

      <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
        {getLoopFilterLabel(filter)}
        {query.trim() ? ` · “${query.trim()}”` : ''}
      </Text>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : filteredLoops.length > 0 ? (
        filteredLoops.map((loop, index) => <LoopCard key={loop.id} loop={loop} index={index} />)
      ) : (
        <EmptyState
          title={query.trim() ? 'No matches' : emptyCopy.title}
          message={
            query.trim()
              ? 'Try a different search or clear the filter.'
              : emptyCopy.message
          }
          illustration
        />
      )}

      <QuickCaptureSheet visible={quickCaptureOpen} onClose={() => setQuickCaptureOpen(false)} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flex: 1,
  },
  title: {
    ...typography.largeTitle,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  addLabel: {
    fontSize: 26,
    fontFamily: typography.title.fontFamily,
    color: '#FFFFFF',
    lineHeight: 28,
  },
  filterScroll: {
    marginHorizontal: -spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.md,
  },
  hubCard: {
    marginBottom: spacing.lg,
  },
  hubRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  hubBtn: {
    flex: 1,
  },
  hubBtnTitle: {
    ...typography.callout,
    fontWeight: '800',
  },
  hubBtnSub: {
    ...typography.caption,
    marginTop: 2,
  },
  quickBtn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  quickBtnText: {
    ...typography.caption,
    fontWeight: '800',
  },
});
