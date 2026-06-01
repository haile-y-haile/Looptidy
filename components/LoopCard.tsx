import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import type { OpenLoop } from '../types';
import { Badge } from './Badge';
import { colors, radius, shadows, spacing, typography } from '../lib/theme';
import {
  formatRelativeDate,
  getLoopTypeColor,
  getPriorityColor,
  getRiskColor,
  isOverdue,
  loopTypeLabels,
  priorityLabels,
  riskLevelLabels,
} from '../lib/utils';

interface LoopCardProps {
  loop: OpenLoop;
}

export function LoopCard({ loop }: LoopCardProps) {
  const router = useRouter();
  const typeColor = getLoopTypeColor(loop.type);
  const overdue = loop.dueDate ? isOverdue(loop.dueDate) : false;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/loops/${loop.id}`)}
    >
      <View style={styles.header}>
        <Badge
          label={loopTypeLabels[loop.type]}
          color={typeColor}
          backgroundColor={`${typeColor}15`}
        />
        {loop.priority !== 'low' && (
          <Badge
            label={priorityLabels[loop.priority]}
            color={getPriorityColor(loop.priority)}
            backgroundColor={`${getPriorityColor(loop.priority)}15`}
          />
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {loop.title}
      </Text>

      {loop.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {loop.description}
        </Text>
      ) : null}

      <View style={styles.footer}>
        {loop.waitingOn ? (
          <Text style={styles.meta}>Waiting on {loop.waitingOn.name}</Text>
        ) : null}
        {loop.promisedTo ? (
          <Text style={styles.meta}>Promised to {loop.promisedTo.name}</Text>
        ) : null}
        {loop.dueDate ? (
          <Text style={[styles.meta, overdue && styles.overdue]}>
            Due {formatRelativeDate(loop.dueDate)}
          </Text>
        ) : null}
        {loop.riskLevel !== 'none' && loop.riskLevel !== 'low' ? (
          <Badge
            label={`${riskLevelLabels[loop.riskLevel]} risk`}
            color={getRiskColor(loop.riskLevel)}
            backgroundColor={`${getRiskColor(loop.riskLevel)}15`}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  title: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  overdue: {
    color: colors.danger,
    fontWeight: '600',
  },
});
