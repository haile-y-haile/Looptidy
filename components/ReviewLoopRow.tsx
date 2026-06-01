import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import type { OpenLoop, LoopType } from '../types';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import { buildLoopNudgeMessage } from '../lib/nudge';
import { computeSnoozeUntil, type SnoozePreset } from '../lib/reminders';
import { radius, spacing, typography } from '../lib/theme';
import { loopTypeLabels } from '../lib/utils';

type ReviewLoopRowProps = {
  loop: OpenLoop;
  onReviewed?: (loopId: string) => void;
  onClosed?: (loopId: string) => void;
};

export function ReviewLoopRow({ loop, onReviewed, onClosed }: ReviewLoopRowProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { closeLoop, updateLoop, addTimelineEvent, addDecision } = useLoops();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');

  const run = async (fn: () => Promise<void>) => {
    void hapticLight();
    await fn();
    onReviewed?.(loop.id);
  };

  const markType = (type: LoopType) => {
    void run(async () => {
      const status =
        type === 'blocked' ? 'blocked' : type === 'waiting_on_others' ? 'waiting' : 'open';
      await updateLoop(loop.id, { type, status });
    });
  };

  const snooze = (preset: SnoozePreset) => {
    void run(async () => {
      const until = computeSnoozeUntil(preset);
      await updateLoop(loop.id, {
        reminderEnabled: true,
        snoozedUntil: until,
      });
      await addTimelineEvent(loop.id, {
        type: 'note',
        title: 'Snoozed during review',
        description: until,
      });
    });
  };

  const actions = [
    { label: 'Open', onPress: () => router.push(`/loops/${loop.id}`) },
    {
      label: 'Close',
      onPress: () => {
        Alert.alert('Close loop?', loop.title, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Close',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                await closeLoop(loop.id);
                void hapticSuccess();
                onClosed?.(loop.id);
                onReviewed?.(loop.id);
              })();
            },
          },
        ]);
      },
    },
    { label: 'Snooze', onPress: () => snooze('tomorrow') },
    { label: 'Note', onPress: () => setNoteOpen((v) => !v) },
    {
      label: 'Decision',
      onPress: () => router.push(`/decision-detail?loopId=${loop.id}`),
    },
    { label: 'Waiting', onPress: () => markType('waiting_on_others') },
    { label: 'Blocked', onPress: () => markType('blocked') },
    { label: 'Promised', onPress: () => markType('promised_by_me') },
    {
      label: 'Copy nudge',
      onPress: () => {
        void (async () => {
          const msg = buildLoopNudgeMessage(loop);
          await Clipboard.setStringAsync(msg);
          void hapticSuccess();
          Alert.alert('Copied', 'Nudge message copied to clipboard.');
          onReviewed?.(loop.id);
        })();
      },
    },
  ];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <Text style={[styles.type, { color: theme.colors.textMuted }]}>
        {loopTypeLabels[loop.type]}
      </Text>
      <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
        {loop.title}
      </Text>
      {loop.waitingOn ? (
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          Waiting on {loop.waitingOn.name}
        </Text>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll}>
        {actions.map((a) => (
          <Pressable
            key={a.label}
            onPress={() => {
              void hapticLight();
              a.onPress();
            }}
            style={({ pressed }) => [
              styles.actionChip,
              { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.actionText, { color: theme.colors.text }]}>{a.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {noteOpen ? (
        <View style={styles.noteBox}>
          <TextInput
            style={[
              styles.noteInput,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a review note…"
            placeholderTextColor={theme.colors.textMuted}
            multiline
          />
          <Pressable
            onPress={() => {
              if (!note.trim()) return;
              void run(async () => {
                await addTimelineEvent(loop.id, {
                  type: 'note',
                  title: 'Weekly review note',
                  description: note.trim(),
                });
                setNote('');
                setNoteOpen(false);
              });
            }}
            style={({ pressed }) => [
              styles.saveNote,
              { backgroundColor: theme.colors.primary },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.saveNoteText}>Save note</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  type: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.headline,
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  actionsScroll: {
    marginTop: spacing.sm,
  },
  actionChip: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  actionText: {
    ...typography.caption,
    fontWeight: '800',
  },
  noteBox: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  noteInput: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 72,
    textAlignVertical: 'top',
    ...typography.body,
  },
  saveNote: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  saveNoteText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
