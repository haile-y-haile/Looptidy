import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../context/FeedbackContext';
import { useLoops } from '../../../context/LoopContext';
import { useScopeChanges } from '../../../context/ScopeContext';
import { GlassCard } from '../../../components/GlassCard';
import { useTheme } from '../../../context/ThemeContext';
import { EmptyState } from '../../../components/EmptyState';
import { FilterChip } from '../../../components/FilterChip';
import { ListSkeleton } from '../../../components/ListSkeleton';
import { LoopCard } from '../../../components/LoopCard';
import { SearchField } from '../../../components/SearchField';
import { ScreenScroll } from '../../../components/ScreenScroll';
import { SortSheet } from '../../../components/SortSheet';
import { hapticLight } from '../../../lib/haptics';
import {
  COMMAND_CENTER_FILTERS,
  COMMAND_CENTER_SORTS,
  getCommandCenterEmptyState,
  isCommandCenterFilter,
  isCommandCenterSort,
  queryCommandCenter,
  type CommandCenterSort,
} from '../../../lib/commandCenter';
import type { CommandCenterFilter } from '../../../lib/loopFilters';
import {
  FEEDBACK_SOURCE_LABELS,
  filterFeedbackByQuery,
} from '../../../lib/feedback';
import { filterScopeChangesByQuery, SCOPE_STATUS_LABELS } from '../../../lib/scopeGuard';
import { radius, spacing, typography } from '../../../lib/theme';

type ReminderFilterKey = 'due_today' | 'upcoming' | 'snoozed' | 'overdue' | null;

const REMINDER_FILTERS: { key: ReminderFilterKey; label: string }[] = [
  { key: null, label: 'All reminders' },
  { key: 'due_today', label: 'Due today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'snoozed', label: 'Snoozed' },
  { key: 'overdue', label: 'Overdue' },
];

export default function CommandCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { loops, loading } = useLoops();
  const { scopeChanges } = useScopeChanges();
  const { feedbackItems } = useFeedback();
  const params = useLocalSearchParams<{ filter?: string; sort?: string }>();

  const initialFilter = useMemo(() => {
    const raw = Array.isArray(params.filter) ? params.filter[0] : params.filter;
    return isCommandCenterFilter(raw) ? raw : 'all';
  }, [params.filter]);

  const initialSort = useMemo(() => {
    const raw = Array.isArray(params.sort) ? params.sort[0] : params.sort;
    return isCommandCenterSort(raw) ? raw : 'urgent';
  }, [params.sort]);

  const [filter, setFilter] = useState<CommandCenterFilter>(initialFilter);
  const [sort, setSort] = useState<CommandCenterSort>(initialSort);
  const [query, setQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [reminderFilter, setReminderFilter] = useState<ReminderFilterKey>(null);

  const results = useMemo(
    () =>
      queryCommandCenter(loops, {
        filter,
        sort,
        query,
        reminderFilter,
      }),
    [loops, filter, sort, query, reminderFilter]
  );

  const scopeResults = useMemo(() => {
    if (filter === 'scope_change') return filterScopeChangesByQuery(scopeChanges, query);
    if (filter === 'all' && query.trim()) return filterScopeChangesByQuery(scopeChanges, query);
    return [];
  }, [filter, scopeChanges, query]);

  const feedbackResults = useMemo(() => {
    if (filter === 'feedback') return filterFeedbackByQuery(feedbackItems, query);
    if (filter === 'all' && query.trim()) return filterFeedbackByQuery(feedbackItems, query);
    return [];
  }, [filter, feedbackItems, query]);

  const showLoopList = filter !== 'scope_change' && filter !== 'feedback';
  const totalResults = (showLoopList ? results.length : 0) + scopeResults.length + feedbackResults.length;

  const hasActiveFilters =
    filter !== 'all' || query.trim().length > 0 || reminderFilter !== null;

  const clearAll = () => {
    void hapticLight();
    setFilter('all');
    setQuery('');
    setReminderFilter(null);
    setSort('urgent');
  };

  const empty = getCommandCenterEmptyState(filter, query.trim().length > 0);
  const sortLabel = COMMAND_CENTER_SORTS.find((s) => s.key === sort)?.label ?? 'Sort';

  const [smartFolders] = useState([
    { id: '1', name: 'Critical My Bugs', filter: 'high_risk' as CommandCenterFilter, sort: 'urgent' as CommandCenterSort },
    { id: '2', name: 'Client Feedback', filter: 'feedback' as CommandCenterFilter, sort: 'recent' as CommandCenterSort },
  ]);

  return (
    <>
      <ScreenScroll contentContainerStyle={{ paddingTop: spacing.md + insets.top }}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Command Center</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Search loops, decisions, accountability notes, scope changes, and feedback.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted, marginTop: spacing.md }]}>Smart Folders</Text>
        <View style={styles.toolsGrid}>
          {smartFolders.map(folder => (
            <Pressable key={folder.id} onPress={() => { setFilter(folder.filter); setSort(folder.sort); }} style={({ pressed }) => [styles.toolBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, pressed && { opacity: 0.9 }]}>
              <Text style={[styles.toolBtnText, { color: theme.colors.text }]}>{folder.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted, marginTop: spacing.md }]}>Tools</Text>
        <View style={styles.toolsGrid}>
          <Pressable onPress={() => router.push('/decision-speed')} style={({ pressed }) => [styles.toolBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, pressed && { opacity: 0.9 }]}>
            <Text style={[styles.toolBtnText, { color: theme.colors.text }]}>Decision Speed</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/ownership')} style={({ pressed }) => [styles.toolBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, pressed && { opacity: 0.9 }]}>
            <Text style={[styles.toolBtnText, { color: theme.colors.text }]}>Ownership</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/scope-guard')} style={({ pressed }) => [styles.toolBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, pressed && { opacity: 0.9 }]}>
            <Text style={[styles.toolBtnText, { color: theme.colors.text }]}>Scope Guard</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/feedback')} style={({ pressed }) => [styles.toolBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, pressed && { opacity: 0.9 }]}>
            <Text style={[styles.toolBtnText, { color: theme.colors.text }]}>Feedback</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/people')} style={({ pressed }) => [styles.toolBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, pressed && { opacity: 0.9 }]}>
            <Text style={[styles.toolBtnText, { color: theme.colors.text }]}>People</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/weekly-review')} style={({ pressed }) => [styles.toolBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, pressed && { opacity: 0.9 }]}>
            <Text style={[styles.toolBtnText, { color: theme.colors.text }]}>Weekly Review</Text>
          </Pressable>
        </View>

        <SearchField value={query} onChangeText={setQuery} placeholder="Search everything…" />

        <View style={styles.toolbar}>
          <Pressable
            onPress={() => {
              void hapticLight();
              setSortOpen(true);
            }}
            style={({ pressed }) => [
              styles.sortBtn,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={[styles.sortBtnText, { color: theme.colors.text }]}>{sortLabel}</Text>
          </Pressable>
          {hasActiveFilters ? (
            <Pressable onPress={clearAll} hitSlop={8}>
              <Text style={[styles.clearText, { color: theme.colors.primary }]}>Clear filters</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={[styles.count, { color: theme.colors.textMuted }]}>
          {totalResults} result{totalResults === 1 ? '' : 's'}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
        >
          {COMMAND_CENTER_FILTERS.map((item) => (
            <FilterChip
              key={item.key}
              label={item.label}
              selected={filter === item.key}
              onPress={() => {
                void hapticLight();
                setFilter(item.key);
              }}
              tone={
                item.key === 'blocked' || item.key === 'overdue'
                  ? 'danger'
                  : item.key === 'due'
                    ? 'warning'
                    : 'default'
              }
            />
          ))}
        </ScrollView>

        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>Reminders</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
        >
          {REMINDER_FILTERS.map((item) => (
            <FilterChip
              key={item.label}
              label={item.label}
              selected={reminderFilter === item.key}
              onPress={() => {
                void hapticLight();
                setReminderFilter(item.key);
              }}
            />
          ))}
        </ScrollView>

        {loading ? (
          <ListSkeleton rows={5} />
        ) : totalResults > 0 ? (
          <>
            {showLoopList && results.length > 0 ? (
              <>
                {filter === 'all' && (scopeResults.length > 0 || feedbackResults.length > 0) ? (
                  <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>Loops</Text>
                ) : null}
                {results.map((loop, index) => (
                  <LoopCard key={loop.id} loop={loop} index={index} />
                ))}
              </>
            ) : null}
            {scopeResults.length > 0 ? (
              <>
                <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>Scope changes</Text>
                {scopeResults.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push('/scope-guard')}
                    style={({ pressed }) => pressed && { opacity: 0.9 }}
                  >
                    <GlassCard style={styles.auxCard} intensity={24}>
                      <Text style={[styles.auxTitle, { color: theme.colors.text }]}>{item.title}</Text>
                      <Text style={[styles.auxMeta, { color: theme.colors.textMuted }]}>
                        {SCOPE_STATUS_LABELS[item.status]} · {item.impact} impact
                      </Text>
                    </GlassCard>
                  </Pressable>
                ))}
              </>
            ) : null}
            {feedbackResults.length > 0 ? (
              <>
                <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>Feedback</Text>
                {feedbackResults.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push('/feedback')}
                    style={({ pressed }) => pressed && { opacity: 0.9 }}
                  >
                    <GlassCard style={styles.auxCard} intensity={24}>
                      <Text style={[styles.auxTitle, { color: theme.colors.text }]}>{item.title}</Text>
                      <Text style={[styles.auxMeta, { color: theme.colors.textMuted }]}>
                        {FEEDBACK_SOURCE_LABELS[item.source]} · {item.urgency} urgency
                      </Text>
                    </GlassCard>
                  </Pressable>
                ))}
              </>
            ) : null}
          </>
        ) : (
          <EmptyState title={empty.title} message={empty.message} illustration />
        )}

        <Pressable
          onPress={() => router.push('/loops/new')}
          style={({ pressed }) => [
            styles.newBtn,
            { backgroundColor: theme.colors.primary },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={styles.newBtnText}>+ New loop</Text>
        </Pressable>
      </ScreenScroll>

      <SortSheet
        visible={sortOpen}
        value={sort}
        onSelect={setSort}
        onClose={() => setSortOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.largeTitle,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.sm,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  toolBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  toolBtnText: {
    ...typography.callout,
    fontWeight: '700',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sortBtn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sortBtnText: {
    ...typography.caption,
    fontWeight: '800',
  },
  clearText: {
    ...typography.caption,
    fontWeight: '800',
  },
  count: {
    ...typography.label,
    marginBottom: spacing.md,
  },
  chipScroll: {
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.md,
  },
  chipRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  newBtn: {
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxxl,
  },
  newBtnText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  auxCard: {
    marginBottom: spacing.md,
  },
  auxTitle: {
    ...typography.callout,
    fontWeight: '800',
  },
  auxMeta: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
