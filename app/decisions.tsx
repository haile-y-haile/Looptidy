import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLoops } from '../context/LoopContext';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { colors, radius, spacing, typography } from '../lib/theme';
import { formatDate } from '../lib/utils';

export default function DecisionsScreen() {
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {pendingDecisions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Decisions</Text>
          {pendingDecisions.map((loop) => (
            <View key={loop.id} style={styles.card}>
              <Badge label="Pending" variant="warning" />
              <Text style={styles.loopTitle}>{loop.title}</Text>
              {loop.description ? (
                <Text style={styles.description}>{loop.description}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Decision History</Text>
        {allDecisions.length > 0 ? (
          allDecisions.map((decision) => (
            <View key={decision.id} style={styles.card}>
              <Text style={styles.loopTitle}>{decision.loopTitle}</Text>
              <Text style={styles.question}>{decision.question}</Text>
              <Text style={styles.outcome}>{decision.outcome}</Text>
              <View style={styles.footer}>
                <Text style={styles.date}>{formatDate(decision.decidedAt)}</Text>
                {decision.decidedBy ? (
                  <Text style={styles.decidedBy}>by {decision.decidedBy}</Text>
                ) : null}
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            title="No decisions yet"
            message="Decisions you record will appear here for future reference."
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  loopTitle: {
    ...typography.callout,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  question: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  outcome: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
  },
  decidedBy: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
