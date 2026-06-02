import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useLoops } from '../../../context/LoopContext';
import { useTheme } from '../../../context/ThemeContext';
import { Badge } from '../../../components/Badge';
import { DetailActionBar } from '../../../components/DetailActionBar';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ReminderPanel } from '../../../components/ReminderPanel';
import { AccountabilityPanel } from '../../../components/AccountabilityPanel';
import { FollowUpAssistantPanel } from '../../../components/FollowUpAssistantPanel';
import { ScreenScroll } from '../../../components/ScreenScroll';
import { ScreenCentered } from '../../../components/ScreenCentered';
import { hapticLight, hapticSuccess } from '../../../lib/haptics';
import { showComingSoon } from '../../../lib/comingSoon';
import { radius, spacing, typography } from '../../../lib/theme';
import { AppIcon } from '../../../components/AppIcon';
import { attachmentIcons, emptyStateIcons } from '../../../lib/icons';
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
} from '../../../lib/utils';

export default function LoopDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>();
  const loopId = Array.isArray(idParam) ? idParam[0] : idParam;
  const router = useRouter();
  const { theme } = useTheme();
  const { loops, loading, closeLoop, addDecision, addTimelineEvent } = useLoops();
  const [note, setNote] = useState('');
  const [decisionOutcome, setDecisionOutcome] = useState('');
  const [showDecisionInput, setShowDecisionInput] = useState(false);

  const loop = loopId ? loops.find((l) => l.id === loopId) : undefined;
  const noteReady = note.trim().length > 0;
  const decisionReady = decisionOutcome.trim().length > 0;

  if (loading) {
    return (
      <ScreenCentered>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenCentered>
    );
  }

  if (!loop) {
    return (
      <ScreenCentered>
        <EmptyState
          icon={emptyStateIcons.notFound}
          title="Loop not found"
          message="It may have been removed or the link is outdated."
        />
        <Pressable onPress={() => router.back()} style={{ marginTop: spacing.lg }}>
          <Text style={[styles.link, { color: theme.colors.primary }]}>Go back</Text>
        </Pressable>
      </ScreenCentered>
    );
  }

  const typeColor = getLoopTypeColor(loop.type);
  const isClosed = loop.status === 'closed' || loop.status === 'archived';

  const handleClose = () => {
    Alert.alert('Close this loop?', 'You can still find it in your history later.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close loop',
        style: 'destructive',
        onPress: async () => {
          await closeLoop(loop.id);
          void hapticSuccess();
          router.back();
        },
      },
    ]);
  };

  const handleAddNote = async () => {
    if (!noteReady) return;
    await addTimelineEvent(loop.id, {
      type: 'note',
      title: 'Note added',
      description: note.trim(),
    });
    setNote('');
  };

  const handleAddDecision = async () => {
    if (!decisionReady) return;
    await addDecision(loop.id, {
      title: loop.title,
      status: 'decided',
      finalDecision: decisionOutcome.trim(),
      rationale: decisionOutcome.trim(),
      decidedAt: new Date().toISOString(),
    });
    setDecisionOutcome('');
    setShowDecisionInput(false);
  };

  const personLine = loop.waitingOn
    ? `Waiting on ${loop.waitingOn.name}`
    : loop.promisedTo
      ? `Promised to ${loop.promisedTo.name}`
      : null;

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <View style={styles.screen}>
      <ScreenScroll contentContainerStyle={!isClosed ? styles.scrollWithBar : undefined}>
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

        <Text style={[styles.title, { color: theme.colors.text }]}>{loop.title}</Text>
        {personLine ? (
          <Text style={[styles.personLine, { color: theme.colors.textSecondary }]}>{personLine}</Text>
        ) : null}
        {loop.description ? (
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {loop.description}
          </Text>
        ) : null}

        <View
          style={[
            styles.metaCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <MetaRow label="Category" value={categoryLabels[loop.category]} />
          {loop.waitingOn ? <MetaRow label="Waiting on" value={loop.waitingOn.name} /> : null}
          {loop.promisedTo ? <MetaRow label="Promised to" value={loop.promisedTo.name} /> : null}
          {loop.dueDate ? <MetaRow label="Due" value={formatDate(loop.dueDate)} /> : null}
          <MetaRow label="Created" value={formatDate(loop.createdAt)} />
          <MetaRow label="Updated" value={formatDate(loop.updatedAt)} isLast />
        </View>

        {!isClosed ? (
          <>
            {loop.type === 'decision_needed' ? (
              <Pressable
                onPress={() => router.push(`/decision-speed?loopId=${loop.id}`)}
                style={({ pressed }) => [
                  styles.speedLink,
                  { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={[styles.speedLinkText, { color: theme.colors.primary }]}>
                  Open Decision Speed →
                </Text>
              </Pressable>
            ) : null}
            <FollowUpAssistantPanel loop={loop} />
            <AccountabilityPanel loop={loop} />
            <ReminderPanel loop={loop} />
          </>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sharing</Text>
          <Pressable
            style={({ pressed }) => [
              styles.shareCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              void hapticLight();
              showComingSoon('Loop sharing');
            }}
          >
            <Text style={[styles.shareTitle, { color: theme.colors.text }]}>Share this loop</Text>
            <Text style={[styles.shareSub, { color: theme.colors.textSecondary }]}>
              Share with other LoopTidy users once accounts launch.
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Attachments</Text>
          {loop.attachments.length > 0 ? (
            loop.attachments.map((a) => (
              <Pressable
                key={a.id}
                style={({ pressed }) => [
                  styles.attachmentRow,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  pressed && styles.pressed,
                ]}
                onPress={() => {
                  void hapticLight();
                  if (a.type === 'link' && a.url) {
                    void Linking.openURL(a.url);
                    return;
                  }
                  showComingSoon('File attachments');
                }}
              >
                <AppIcon name={attachmentIcons[a.type]} size={18} tone="muted" />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.attachmentTitle, { color: theme.colors.text }]}
                    numberOfLines={1}
                  >
                    {a.title}
                  </Text>
                  {a.url ? (
                    <Text
                      style={[styles.attachmentMeta, { color: theme.colors.textMuted }]}
                      numberOfLines={1}
                    >
                      {a.url}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))
          ) : (
            <Text style={[styles.muted, { color: theme.colors.textMuted }]}>
              No attachments yet. Add a link when creating or editing a loop.
            </Text>
          )}
        </View>

        {loop.decisions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Decisions</Text>
            {loop.decisions.map((d) => (
              <View
                key={d.id}
                style={[
                  styles.decisionCard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.decisionQuestion, { color: theme.colors.textSecondary }]}>
                  {d.title ?? d.question}
                </Text>
                {(d.finalDecision ?? d.outcome) ? (
                  <Text style={[styles.decisionOutcome, { color: theme.colors.text }]}>
                    {d.finalDecision ?? d.outcome}
                  </Text>
                ) : null}
                {d.rationale && d.rationale !== (d.finalDecision ?? d.outcome) ? (
                  <Text style={[styles.decisionDate, { color: theme.colors.textSecondary }]}>
                    Rationale: {d.rationale}
                  </Text>
                ) : null}
                {d.decidedAt ? (
                  <Text style={[styles.decisionDate, { color: theme.colors.textMuted }]}>
                    {formatDate(d.decidedAt)}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Timeline</Text>
          {[...loop.timeline].reverse().map((event) => (
            <View key={event.id} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: theme.colors.primary }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: theme.colors.text }]}>
                  {event.title}
                </Text>
                {event.description ? (
                  <Text style={[styles.timelineDesc, { color: theme.colors.textSecondary }]}>
                    {event.description}
                  </Text>
                ) : null}
                <Text style={[styles.timelineDate, { color: theme.colors.textMuted }]}>
                  {formatDate(event.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {!isClosed && (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Add note</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={note}
                onChangeText={setNote}
                placeholder="Capture an update or reminder..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
              />
            </View>

            {loop.type === 'decision_needed' && !showDecisionInput && (
              <Pressable
                style={({ pressed }) => [
                  styles.outlineButton,
                  { borderColor: theme.colors.primary },
                  pressed && styles.pressed,
                ]}
                onPress={() => setShowDecisionInput(true)}
              >
                <Text style={[styles.outlineButtonText, { color: theme.colors.primary }]}>
                  Record decision
                </Text>
              </Pressable>
            )}

            {showDecisionInput && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Decision outcome
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  value={decisionOutcome}
                  onChangeText={setDecisionOutcome}
                  placeholder="What did you decide?"
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                />
                <PrimaryButton
                  label="Save decision"
                  onPress={handleAddDecision}
                  disabled={!decisionReady}
                />
              </View>
            )}
          </>
        )}
      </ScreenScroll>
      {!isClosed ? (
        <DetailActionBar
          onAddNote={handleAddNote}
          onClose={handleClose}
          noteDisabled={!noteReady}
        />
      ) : null}
      </View>
    </>
  );
}

function MetaRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.metaRow,
        { borderBottomColor: theme.colors.borderLight },
        isLast && styles.metaRowLast,
      ]}
    >
      <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollWithBar: {
    paddingBottom: 120,
  },
  link: {
    ...typography.callout,
  },
  personLine: {
    ...typography.callout,
    marginBottom: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  metaCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  metaRowLast: {
    borderBottomWidth: 0,
  },
  metaLabel: {
    ...typography.callout,
  },
  metaValue: {
    ...typography.callout,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  muted: {
    ...typography.body,
  },
  shareCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  shareTitle: {
    ...typography.callout,
  },
  shareSub: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  attachmentRow: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  attachmentTitle: {
    ...typography.callout,
  },
  attachmentMeta: {
    ...typography.caption,
    marginTop: 2,
  },
  decisionCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  decisionQuestion: {
    ...typography.callout,
    marginBottom: spacing.xs,
  },
  decisionOutcome: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  decisionDate: {
    ...typography.caption,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: spacing.md,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    ...typography.callout,
  },
  timelineDesc: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  timelineDate: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    ...typography.body,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  outlineButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  outlineButtonText: {
    ...typography.callout,
  },
  pressed: { opacity: 0.8 },
  speedLink: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  speedLinkText: {
    ...typography.callout,
    fontWeight: '800',
  },
});
