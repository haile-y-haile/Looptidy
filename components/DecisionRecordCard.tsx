import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { DecisionWithLoop } from '../lib/decisions';
import { decisionStatusLabel } from '../lib/decisionCenter';
import { useTheme } from '../context/ThemeContext';
import { Badge } from './Badge';
import { radius, spacing, typography } from '../lib/theme';
import { formatDate, getRiskColor } from '../lib/utils';

export function DecisionRecordCard({
  decision,
  expandedDefault = false,
}: {
  decision: DecisionWithLoop;
  expandedDefault?: boolean;
}) {
  const { theme } = useTheme();
  const router = useRouter();
  const [expanded, setExpanded] = useState(expandedDefault);

  return (
    <Pressable
      onPress={() => setExpanded((e) => !e)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={styles.header}>
        <Badge
          label={decisionStatusLabel(decision.status)}
          color={getRiskColor(decision.riskLevel)}
          backgroundColor={`${getRiskColor(decision.riskLevel)}15`}
        />
        {decision.riskLevel === 'high' ? (
          <Badge label="High risk" color={theme.colors.danger} backgroundColor={theme.colors.dangerLight} />
        ) : null}
      </View>
      <Text style={[styles.loopTitle, { color: theme.colors.textMuted }]} numberOfLines={1}>
        {decision.loopTitle}
      </Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>{decision.title}</Text>
      {decision.summary && !expanded ? (
        <Text style={[styles.summary, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {decision.summary}
        </Text>
      ) : null}

      {expanded ? (
        <View style={styles.body}>
          {decision.finalDecision ? (
            <Text style={[styles.bodyLabel, { color: theme.colors.textMuted }]}>Decision</Text>
          ) : null}
          {decision.finalDecision ? (
            <Text style={[styles.bodyText, { color: theme.colors.text }]}>{decision.finalDecision}</Text>
          ) : null}
          {decision.rationale ? (
            <>
              <Text style={[styles.bodyLabel, { color: theme.colors.textMuted }]}>Rationale</Text>
              <Text style={[styles.bodyText, { color: theme.colors.textSecondary }]}>
                {decision.rationale}
              </Text>
            </>
          ) : null}
          {decision.impact ? (
            <>
              <Text style={[styles.bodyLabel, { color: theme.colors.textMuted }]}>Impact</Text>
              <Text style={[styles.bodyText, { color: theme.colors.textSecondary }]}>
                {decision.impact}
              </Text>
            </>
          ) : null}
          {decision.revisitAt ? (
            <Text style={[styles.meta, { color: theme.colors.warning }]}>
              Revisit {formatDate(decision.revisitAt)}
            </Text>
          ) : null}
          {decision.decidedAt ? (
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
              Decided {formatDate(decision.decidedAt)}
            </Text>
          ) : null}
        </View>
      ) : null}

      <Pressable
        onPress={() => router.push(`/decision-detail?loopId=${decision.loopId}&decisionId=${decision.id}`)}
        hitSlop={8}
      >
        <Text style={[styles.link, { color: theme.colors.primary }]}>Open decision →</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  loopTitle: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.headline,
    marginBottom: spacing.xs,
  },
  summary: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  body: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  bodyLabel: {
    ...typography.label,
    marginTop: spacing.sm,
  },
  bodyText: {
    ...typography.body,
  },
  meta: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  link: {
    ...typography.caption,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
});
