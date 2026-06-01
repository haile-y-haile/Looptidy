import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { BrandLockup } from '../components/BrandLockup';
import { ReviewStepper } from '../components/ReviewStepper';
import { StatCard } from '../components/StatCard';
import { ScreenScroll } from '../components/ScreenScroll';
import { radius, spacing, typography } from '../lib/theme';
import { isOpenLoop } from '../lib/utils';
import { hapticSuccess } from '../lib/haptics';

const CHECKLIST = [
  'Review waiting-on loops and send nudges where needed',
  'Check promises you made — are deadlines still realistic?',
  'Resolve or escalate anything blocked',
  'Close loops that no longer matter',
  'Record decisions still hanging open',
  'Choose what deserves focus next week',
];

export default function WeeklyReviewScreen() {
  const { loops } = useLoops();
  const { theme } = useTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const openLoops = loops.filter(isOpenLoop);
  const closedThisWeek = loops.filter((l) => {
    if (!l.closedAt) return false;
    const closed = new Date(l.closedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return closed >= weekAgo;
  });
  const blocked = openLoops.filter((l) => l.status === 'blocked');
  const stale = openLoops.filter((l) => {
    const updated = new Date(l.updatedAt);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return updated < twoWeeksAgo;
  });

  const handleAdvance = () => {
    if (stepIndex >= CHECKLIST.length - 1) {
      void hapticSuccess();
      setFinished(true);
      return;
    }
    setStepIndex((i) => i + 1);
  };

  return (
    <ScreenScroll>
      <View
        style={[
          styles.hero,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <BrandLockup variant="splash" logoSize={72} />
        <Text style={[styles.heroTitle, { color: theme.colors.text }]}>Weekly review</Text>
        <Text style={[styles.heroText, { color: theme.colors.textSecondary }]}>
          {finished
            ? 'Nice work. You have a clearer picture of what needs attention next.'
            : 'A short ritual to reset your open loops — work through each step at your pace.'}
        </Text>
      </View>

      {!finished ? (
        <>
          <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Snapshot</Text>
          <View style={styles.statsRow}>
            <StatCard label="Open" value={openLoops.length} />
            <StatCard label="Closed" value={closedThisWeek.length} color={theme.colors.success} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Blocked" value={blocked.length} color={theme.colors.danger} />
            <StatCard label="Stale (14d+)" value={stale.length} color={theme.colors.warning} />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Guided steps</Text>
          <ReviewStepper
            steps={CHECKLIST}
            currentIndex={stepIndex}
            onAdvance={handleAdvance}
            onStepPress={setStepIndex}
          />
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
    marginBottom: spacing.xl,
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
  sectionTitle: {
    ...typography.label,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
});
