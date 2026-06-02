import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { OpenLoop } from '../types';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { Badge } from './Badge';
import { FollowUpAssistantPanel } from './FollowUpAssistantPanel';
import { getBlindSpotActions, type BlindSpot, type BlindSpotAction } from '../lib/blindSpots';
import { personFromName } from '../lib/accountability';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import { formatRelativeDate } from '../lib/utils';
import { radius, spacing, typography } from '../lib/theme';

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

function nextFriday(): string {
  const d = new Date();
  const day = d.getDay();
  const distance = (5 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + distance);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

function riskTone(theme: ReturnType<typeof useTheme>['theme'], risk: BlindSpot['riskLabel']) {
  switch (risk) {
    case 'Likely to slip':
      return { color: theme.colors.danger, background: theme.colors.dangerLight };
    case 'At risk':
      return { color: theme.colors.warning, background: theme.colors.warningLight };
    case 'Getting stale':
      return { color: theme.colors.purple, background: theme.colors.purpleLight };
    case 'Needs attention':
      return { color: theme.colors.primary, background: theme.colors.primaryLight };
    case 'Low friction':
    default:
      return { color: theme.colors.success, background: theme.colors.successLight };
  }
}

export function BlindSpotCard({ spot, compact = false }: { spot: BlindSpot; compact?: boolean }) {
  const { theme } = useTheme();
  const router = useRouter();
  const { updateLoop, closeLoop, addTimelineEvent } = useLoops();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const loop = spot.loop;
  const tone = riskTone(theme, spot.riskLabel);
  const actions = getBlindSpotActions(loop);

  const updateDueDate = () => {
    Alert.alert('Add due date', 'Choose a local due date for this loop.', [
      { text: 'Tomorrow', onPress: () => void applyUpdates({ dueDate: addDays(1) }, 'Due date added') },
      { text: 'Friday', onPress: () => void applyUpdates({ dueDate: nextFriday() }, 'Due date added') },
      { text: 'Next week', onPress: () => void applyUpdates({ dueDate: addDays(7) }, 'Due date added') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const applyUpdates = async (updates: Partial<OpenLoop>, note?: string) => {
    void hapticLight();
    await updateLoop(loop.id, updates);
    if (note) {
      await addTimelineEvent(loop.id, { type: 'updated', title: note });
    }
    void hapticSuccess();
  };

  const deferLoop = async () => {
    const snoozedUntil = addDays(7);
    await applyUpdates({ snoozedUntil }, `Deferred until ${formatRelativeDate(snoozedUntil)}`);
  };

  const convertToDecision = async () => {
    await applyUpdates(
      { type: 'decision_needed', status: 'open', riskLevel: loop.riskLevel === 'none' ? 'medium' : loop.riskLevel },
      'Converted to decision loop'
    );
  };

  const markWaiting = async () => {
    await applyUpdates({ type: 'waiting_on_others', status: 'waiting', waitingOn: loop.waitingOn ?? personFromName('Unassigned') }, 'Marked waiting');
  };

  const confirmClose = () => {
    Alert.alert('Close this loop?', 'This removes it from Blind Spots and keeps it in history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await closeLoop(loop.id);
            void hapticSuccess();
          })();
        },
      },
    ]);
  };

  const runAction = (action: BlindSpotAction) => {
    switch (action) {
      case 'Nudge':
        void hapticLight();
        setAssistantOpen((open) => !open);
        return;
      case 'Add due date':
        updateDueDate();
        return;
      case 'Add owner':
      case 'Add next action':
        void hapticLight();
        router.push(`/loops/${loop.id}`);
        return;
      case 'Mark waiting':
        void markWaiting();
        return;
      case 'Escalate':
        void applyUpdates(
          { accountabilityStatus: 'escalated', escalationLevel: 'escalation_needed', riskLevel: loop.riskLevel === 'high' ? 'high' : 'medium' },
          'Escalation marked'
        );
        return;
      case 'Close':
        confirmClose();
        return;
      case 'Defer with reason':
        void deferLoop();
        return;
      case 'Convert to decision':
        void convertToDecision();
        return;
      default:
        return;
    }
  };

  return (
    <View
      style={[
        styles.card,
        compact && styles.compactCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>{loop.title}</Text>
          <Text style={[styles.reason, { color: theme.colors.textSecondary }]} numberOfLines={compact ? 2 : 3}>
            {spot.reasons[0]?.label ?? 'This loop has enough signals to deserve a check.'}
          </Text>
        </View>
        <Badge label={spot.riskLabel} color={tone.color} backgroundColor={tone.background} />
      </View>

      {!compact ? (
        <View style={[styles.whyBox, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}> 
          <Text style={[styles.whyTitle, { color: theme.colors.text }]}>Why this is here</Text>
          {spot.reasons.slice(0, 3).map((reason) => (
            <Text key={reason.type} style={[styles.whyLine, { color: theme.colors.textSecondary }]}>- {reason.label}</Text>
          ))}
        </View>
      ) : null}

      <Text style={[styles.nextAction, { color: theme.colors.text }]}>Suggested next action: {spot.suggestedNextAction}</Text>

      <View style={styles.actions}>
        {[spot.suggestedNextAction, ...actions]
          .filter((action, index, arr) => arr.indexOf(action) === index)
          .slice(0, compact ? 3 : 7)
          .map((action) => (
            <Pressable
              key={action}
              onPress={() => runAction(action)}
              style={({ pressed }) => [
                styles.action,
                {
                  backgroundColor: action === spot.suggestedNextAction ? theme.colors.primaryLight : theme.colors.surface2,
                  borderColor: action === spot.suggestedNextAction ? theme.colors.primary : theme.colors.border,
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={[styles.actionText, { color: action === spot.suggestedNextAction ? theme.colors.primary : theme.colors.text }]}>{action}</Text>
            </Pressable>
          ))}
      </View>

      {assistantOpen ? <FollowUpAssistantPanel loop={loop} compact /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  compactCard: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.headline,
  },
  reason: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  whyBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  whyTitle: {
    ...typography.callout,
    marginBottom: spacing.xs,
  },
  whyLine: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  nextAction: {
    ...typography.callout,
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  action: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionText: {
    ...typography.caption,
    fontWeight: '900',
  },
});
