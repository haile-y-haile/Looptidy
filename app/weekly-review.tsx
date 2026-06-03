import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { BrandLockup } from '../components/BrandLockup';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { EmptyState } from '../components/EmptyState';
import { GlassCard } from '../components/GlassCard';
import { ReviewLoopRow } from '../components/ReviewLoopRow';
import { ReviewStepper } from '../components/ReviewStepper';
import { ScreenScroll } from '../components/ScreenScroll';
import { SegmentedControl } from '../components/SegmentedControl';
import { StatCard } from '../components/StatCard';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import {
  createWeeklyReviewRecord,
  getLoopsForGuidedStep,
  getLoopsForReviewSection,
  getReviewSummary,
  GUIDED_REVIEW_STEPS,
  REVIEW_SECTIONS,
  type GuidedReviewStepId,
  type ReviewSectionKey,
} from '../lib/weeklyReview';
import { getWeeklyReviews, saveWeeklyReview } from '../lib/weeklyReviewStorage';
import { radius, spacing, typography } from '../lib/theme';
import { formatDate } from '../lib/utils';

type ReviewMode = 'summary' | 'guided' | 'history';

export default function WeeklyReviewScreen() {
  const { loops } = useLoops();
  const { theme } = useTheme();
  const [mode, setMode] = useState<ReviewMode>('summary');
  const [guidedIndex, setGuidedIndex] = useState(0);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [startedAt] = useState(() => new Date().toISOString());
  const [history, setHistory] = useState<Awaited<ReturnType<typeof getWeeklyReviews>>>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const summary = useMemo(() => getReviewSummary(loops), [loops]);
  const guidedStep = GUIDED_REVIEW_STEPS[guidedIndex];
  const guidedLoops = useMemo(
    () => (guidedStep ? getLoopsForGuidedStep(loops, guidedStep.id) : []),
    [loops, guidedStep]
  );

  const loadHistory = useCallback(async () => {
    const data = await getWeeklyReviews();
    setHistory(data);
    setHistoryLoaded(true);
  }, []);

  const markReviewed = (id: string) => {
    setReviewedIds((prev) => new Set(prev).add(id));
  };

  const markClosed = (id: string) => {
    setClosedIds((prev) => new Set(prev).add(id));
    setReviewedIds((prev) => new Set(prev).add(id));
  };

  const completeReview = async () => {
    const record = createWeeklyReviewRecord({
      startedAt,
      reviewedLoopIds: [...reviewedIds],
      closedLoopIds: [...closedIds],
      notes: notes.trim(),
    });
    await saveWeeklyReview(record);
    void hapticSuccess();
    Alert.alert(
      'Weekly review complete',
      `Reviewed ${record.reviewedLoopIds.length} loops · closed ${record.closedLoopIds.length}.`,
      [{ text: 'Done' }]
    );
    await loadHistory();
    setMode('history');
  };

  const onModeChange = (next: ReviewMode) => {
    void hapticLight();
    setMode(next);
    if (next === 'history' && !historyLoaded) void loadHistory();
  };

  return (
    <ScreenScroll>
      <View
        style={[
          styles.hero,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <BrandLockup variant="splash" logoSize={64} />
        <Text style={[styles.heroTitle, { color: theme.colors.text }]}>Weekly review</Text>
        <Text style={[styles.heroText, { color: theme.colors.textSecondary }]}>
          A guided ritual to triage overdue items, nudge dependencies, and close what no longer
          matters — all on your device.
        </Text>
      </View>

      <SegmentedControl
        value={mode}
        onChange={onModeChange}
        glass
        segments={[
          { key: 'summary', label: 'Summary' },
          { key: 'guided', label: 'Guided' },
          { key: 'history', label: 'History' },
        ]}
      />

      {mode === 'summary' ? (
        <>
          <GlassCard style={styles.summaryCard} intensity={32}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Review summary</Text>
            <View style={styles.statsRow}>
              <StatCard label="Open" value={summary.openCount} embedded />
              <StatCard label="Overdue" value={summary.overdue} color={theme.colors.danger} embedded />
            </View>
            <View style={[styles.statsRow, styles.statsGap]}>
              <StatCard label="Waiting" value={summary.waiting} embedded />
              <StatCard label="Promised" value={summary.promised} embedded />
            </View>
            <View style={[styles.statsRow, styles.statsGap]}>
              <StatCard label="Blocked" value={summary.blocked} color={theme.colors.warning} embedded />
              <StatCard label="Decisions" value={summary.decisions} embedded />
            </View>
            <View style={[styles.statsRow, styles.statsGap]}>
              <StatCard label="High risk" value={summary.highRisk} color={theme.colors.danger} embedded />
              <StatCard
                label="Closed (7d)"
                value={summary.closedWeek}
                color={theme.colors.success}
                embedded
              />
            </View>
          </GlassCard>

          {REVIEW_SECTIONS.map((section) => {
            const sectionLoops = getLoopsForReviewSection(loops, section.key);
            const isCollapsed = collapsedMap[section.key] ?? sectionLoops.length === 0;
            return (
              <CollapsibleSection
                key={section.key}
                title={section.title}
                count={sectionLoops.length}
                collapsed={isCollapsed}
                onToggle={() => {
                  setCollapsedMap((prev) => ({ ...prev, [section.key]: !isCollapsed }));
                }}
              >
                <Text style={[styles.sectionDesc, { color: theme.colors.textMuted }]}>
                  {section.description}
                </Text>
                {sectionLoops.length > 0 ? (
                  sectionLoops.map((loop) => (
                    <ReviewLoopRow
                      key={loop.id}
                      loop={loop}
                      onReviewed={markReviewed}
                      onClosed={markClosed}
                    />
                  ))
                ) : (
                  <EmptyState compact title="Clear" message="Nothing in this bucket right now." />
                )}
              </CollapsibleSection>
            );
          })}
        </>
      ) : null}

      {mode === 'guided' ? (
        <>
          <ReviewStepper
            steps={GUIDED_REVIEW_STEPS.map((s) => s.title)}
            currentIndex={guidedIndex}
            onAdvance={() => {
              if (guidedIndex >= GUIDED_REVIEW_STEPS.length - 1) return;
              setGuidedIndex((i) => i + 1);
            }}
            onStepPress={setGuidedIndex}
          />
          {guidedStep ? (
            <Text style={[styles.guidedSub, { color: theme.colors.textSecondary }]}>
              {guidedStep.subtitle}
            </Text>
          ) : null}
          {guidedLoops.length > 0 ? (
            guidedLoops.map((loop) => (
              <ReviewLoopRow
                key={loop.id}
                loop={loop}
                onReviewed={markReviewed}
                onClosed={markClosed}
              />
            ))
          ) : (
            <EmptyState
              compact
              title="Nothing here"
              message="Move to the next step or celebrate a clear list."
            />
          )}

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Review notes</Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="What will you focus on next week?"
            placeholderTextColor={theme.colors.textMuted}
            multiline
          />

          <Pressable
            onPress={() => void completeReview()}
            style={({ pressed }) => [
              styles.completeBtn,
              { backgroundColor: theme.colors.primary },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.completeBtnText}>Complete weekly review</Text>
          </Pressable>
        </>
      ) : null}

      {mode === 'history' ? (
        <>
          {!historyLoaded ? (
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>Loading history…</Text>
          ) : history.length > 0 ? (
            history.map((review) => (
              <View
                key={review.id}
                style={[
                  styles.historyCard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.historyTitle, { color: theme.colors.text }]}>
                  {review.completedAt
                    ? formatDate(review.completedAt)
                    : formatDate(review.createdAt)}
                </Text>
                <Text style={[styles.historyMeta, { color: theme.colors.textSecondary }]}>
                  {review.reviewedLoopIds.length} reviewed · {review.closedLoopIds.length} closed
                </Text>
                {review.notes ? (
                  <Text style={[styles.historyNotes, { color: theme.colors.textMuted }]}>
                    {review.notes}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <EmptyState
              title="No completed reviews yet"
              message="Finish a guided review to build your history on this device."
            />
          )}
        </>
      ) : null}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  heroTitle: {
    ...typography.title,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  heroText: {
    ...typography.body,
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statsGap: {
    marginTop: spacing.sm,
  },
  sectionDesc: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  guidedSub: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.callout,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  notesInput: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    ...typography.body,
    marginBottom: spacing.lg,
  },
  completeBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  completeBtnText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  historyCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  historyTitle: {
    ...typography.headline,
  },
  historyMeta: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  historyNotes: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  meta: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
});
