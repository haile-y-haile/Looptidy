import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoops } from '../../context/LoopContext';
import { Badge } from '../../components/Badge';
import { colors, radius, spacing, typography } from '../../lib/theme';
import {
  formatDate,
  getLoopTypeColor,
  getPriorityColor,
  getRiskColor,
  loopTypeLabels,
  loopStatusLabels,
  priorityLabels,
  riskLevelLabels,
  categoryLabels,
} from '../../lib/utils';

export default function LoopDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>();
  const loopId = Array.isArray(idParam) ? idParam[0] : idParam;
  const router = useRouter();
  const { loops, loading, closeLoop, addDecision, addTimelineEvent } = useLoops();
  const [note, setNote] = useState('');
  const [decisionOutcome, setDecisionOutcome] = useState('');
  const [showDecisionInput, setShowDecisionInput] = useState(false);

  const loop = loopId ? loops.find((l) => l.id === loopId) : undefined;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!loop) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Loop not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const typeColor = getLoopTypeColor(loop.type);
  const isClosed = loop.status === 'closed' || loop.status === 'archived';

  const handleClose = () => {
    Alert.alert('Close loop', 'Mark this loop as closed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        onPress: async () => {
          await closeLoop(loop.id);
          router.back();
        },
      },
    ]);
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    await addTimelineEvent(loop.id, {
      type: 'note',
      title: 'Note added',
      description: note.trim(),
    });
    setNote('');
  };

  const handleAddDecision = async () => {
    if (!decisionOutcome.trim()) return;
    await addDecision(loop.id, {
      question: loop.title,
      outcome: decisionOutcome.trim(),
      decidedAt: new Date().toISOString(),
    });
    setDecisionOutcome('');
    setShowDecisionInput(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.badges}>
        <Badge
          label={loopTypeLabels[loop.type]}
          color={typeColor}
          backgroundColor={`${typeColor}15`}
        />
        <Badge label={loopStatusLabels[loop.status]} variant="default" />
        <Badge
          label={priorityLabels[loop.priority]}
          color={getPriorityColor(loop.priority)}
          backgroundColor={`${getPriorityColor(loop.priority)}15`}
        />
        {loop.riskLevel !== 'none' && (
          <Badge
            label={`${riskLevelLabels[loop.riskLevel]} risk`}
            color={getRiskColor(loop.riskLevel)}
            backgroundColor={`${getRiskColor(loop.riskLevel)}15`}
          />
        )}
      </View>

      <Text style={styles.title}>{loop.title}</Text>
      {loop.description ? <Text style={styles.description}>{loop.description}</Text> : null}

      <View style={styles.metaCard}>
        <MetaRow label="Category" value={categoryLabels[loop.category]} />
        {loop.waitingOn ? (
          <MetaRow label="Waiting on" value={loop.waitingOn.name} />
        ) : null}
        {loop.promisedTo ? (
          <MetaRow label="Promised to" value={loop.promisedTo.name} />
        ) : null}
        {loop.dueDate ? <MetaRow label="Due" value={formatDate(loop.dueDate)} /> : null}
        <MetaRow label="Created" value={formatDate(loop.createdAt)} />
        <MetaRow label="Updated" value={formatDate(loop.updatedAt)} />
      </View>

      {loop.decisions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Decisions</Text>
          {loop.decisions.map((d) => (
            <View key={d.id} style={styles.decisionCard}>
              <Text style={styles.decisionQuestion}>{d.question}</Text>
              <Text style={styles.decisionOutcome}>{d.outcome}</Text>
              <Text style={styles.decisionDate}>{formatDate(d.decidedAt)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        {[...loop.timeline].reverse().map((event) => (
          <View key={event.id} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>{event.title}</Text>
              {event.description ? (
                <Text style={styles.timelineDesc}>{event.description}</Text>
              ) : null}
              <Text style={styles.timelineDate}>{formatDate(event.timestamp)}</Text>
            </View>
          </View>
        ))}
      </View>

      {!isClosed && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Note</Text>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder="Write a note..."
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
              onPress={handleAddNote}
            >
              <Text style={styles.actionButtonText}>Save Note</Text>
            </Pressable>
          </View>

          {loop.type === 'decision_needed' && !showDecisionInput && (
            <Pressable
              style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
              onPress={() => setShowDecisionInput(true)}
            >
              <Text style={styles.outlineButtonText}>Record Decision</Text>
            </Pressable>
          )}

          {showDecisionInput && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Decision Outcome</Text>
              <TextInput
                style={styles.input}
                value={decisionOutcome}
                onChangeText={setDecisionOutcome}
                placeholder="What was decided?"
                placeholderTextColor={colors.textMuted}
                multiline
              />
              <Pressable
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                onPress={handleAddDecision}
              >
                <Text style={styles.actionButtonText}>Save Decision</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>Close Loop</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
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
  notFound: {
    ...typography.headline,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  link: {
    ...typography.callout,
    color: colors.primary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  metaLabel: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  metaValue: {
    ...typography.callout,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.md,
  },
  decisionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  decisionQuestion: {
    ...typography.callout,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  decisionOutcome: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  decisionDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing.md,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    ...typography.callout,
    color: colors.text,
    fontWeight: '500',
  },
  timelineDesc: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  timelineDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.callout,
    color: colors.surface,
    fontWeight: '600',
  },
  outlineButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  outlineButtonText: {
    ...typography.callout,
    color: colors.primary,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  closeButtonText: {
    ...typography.callout,
    color: colors.danger,
    fontWeight: '600',
  },
  pressed: { opacity: 0.8 },
});
