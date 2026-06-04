import { useEffect, useMemo, useState } from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { QuickCaptureSheet } from '../../../components/QuickCaptureSheet';
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
import { radius, spacing, typography } from '../../../lib/theme';
import { isDueSoon, isOpenLoop, isOverdue } from '../../../lib/utils';
import { Ionicons } from '@expo/vector-icons';

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

  const header = (
    <View style={{ paddingTop: spacing.lg + insets.top, paddingHorizontal: spacing.lg }}>
      <View style={styles.headerRow}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Loops</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {openLoops.length} open
            {dueCount > 0 ? ` · ${dueCount} due soon` : ''}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            void hapticLight();
            setQuickCaptureOpen(true);
          }}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: theme.colors.primary },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={styles.addLabel}>+</Text>
        </Pressable>
      </View>

      <View style={styles.toolsRow}>
        <Pressable
          onPress={() => {
            void hapticLight();
            router.push('/loops/command-center');
          }}
          style={({ pressed }) => [
            styles.toolBtn,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Ionicons name="apps-outline" size={16} color={theme.colors.text} />
          <Text style={[styles.toolBtnText, { color: theme.colors.text }]}>Command Center</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void hapticLight();
            router.push('/insights');
          }}
          style={({ pressed }) => [
            styles.toolBtn,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Ionicons name="bar-chart-outline" size={16} color={theme.colors.text} />
          <Text style={[styles.toolBtnText, { color: theme.colors.text }]}>Insights</Text>
        </Pressable>
      </View>

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
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {loading ? (
        <ScreenScroll contentContainerStyle={{ paddingTop: spacing.lg + insets.top }}>
          {header}
          <ListSkeleton rows={5} />
        </ScreenScroll>
      ) : (
        <Animated.FlatList
          data={filteredLoops}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingBottom: spacing.xxxl + insets.bottom }}
          renderItem={({ item, index }) => (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <LoopCard loop={item} index={index} />
            </View>
          )}
          itemLayoutAnimation={LinearTransition.springify()}
          ListEmptyComponent={
            <View style={{ paddingHorizontal: spacing.lg }}>
              <EmptyState
                title={query.trim() ? 'No matches' : emptyCopy.title}
                message={query.trim() ? 'Try a different search or clear the filter.' : emptyCopy.message}
                illustration
              />
            </View>
          }
        />
      )}
      <QuickCaptureSheet visible={quickCaptureOpen} onClose={() => setQuickCaptureOpen(false)} />
    </View>
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
  toolsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  toolBtnText: {
    ...typography.caption,
    fontWeight: '700',
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
});
