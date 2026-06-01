import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { ScreenScroll } from '../components/ScreenScroll';
import { ScreenCentered } from '../components/ScreenCentered';
import { radius, spacing, typography } from '../lib/theme';
import { formatDate } from '../lib/utils';

export default function DecisionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { loops, loading } = useLoops();

  const allDecisions = loops
    .flatMap((loop) =>
      loop.decisions.map((decision) => ({
        ...decision,
        loopTitle: loop.title,
        loopId: loop.id,
      }))
    )
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());

  const pendingDecisions = loops.filter(
    (l) => l.type === 'decision_needed' && l.status !== 'decided' && l.status !== 'closed'
  );

  if (loading) {
    return (
      <ScreenCentered>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenCentered>
    );
  }

  return (
    <ScreenScroll>
      {pendingDecisions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pending Decisions</Text>
          {pendingDecisions.map((loop) => (
            <Pressable
              key={loop.id}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push(`/loops/${loop.id}`)}
            >
              <Badge label="Pending" variant="warning" />
              <Text style={[styles.loopTitle, { color: theme.colors.textMuted }]}>{loop.title}</Text>
              {loop.description ? (
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                  {loop.description}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Decision History</Text>
        {allDecisions.length > 0 ? (
          allDecisions.map((decision) => (
            <Pressable
              key={decision.id}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push(`/loops/${decision.loopId}`)}
            >
              <Text style={[styles.loopTitle, { color: theme.colors.textMuted }]}>
                {decision.loopTitle}
              </Text>
              <Text style={[styles.question, { color: theme.colors.textSecondary }]}>
                {decision.question}
              </Text>
              <Text style={[styles.outcome, { color: theme.colors.text }]}>{decision.outcome}</Text>
              <View style={styles.footer}>
                <Text style={[styles.date, { color: theme.colors.textMuted }]}>
                  {formatDate(decision.decidedAt)}
                </Text>
                {decision.decidedBy ? (
                  <Text style={[styles.decidedBy, { color: theme.colors.textMuted }]}>
                    by {decision.decidedBy}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))
        ) : (
          <EmptyState
            title="No decisions yet"
            message="Decisions you record will appear here for future reference."
          />
        )}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  loopTitle: {
    ...typography.callout,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  question: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  outcome: {
    ...typography.headline,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    ...typography.caption,
  },
  decidedBy: {
    ...typography.caption,
  },
});
