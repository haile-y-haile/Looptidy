import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { FollowUpHistoryEntry, FollowUpMessageType, FollowUpTone, OpenLoop } from '../types';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import {
  FOLLOW_UP_MESSAGE_TYPES,
  FOLLOW_UP_TONES,
  generateFollowUpMessage,
  getFollowUpCadenceOptions,
} from '../lib/followUpAssistant';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import { generateId } from '../lib/utils';
import { radius, spacing, typography } from '../lib/theme';

export function FollowUpAssistantPanel({
  loop,
  compact = false,
}: {
  loop: OpenLoop;
  compact?: boolean;
}) {
  const { theme } = useTheme();
  const { updateLoop, addTimelineEvent } = useLoops();
  const [messageType, setMessageType] = useState<FollowUpMessageType>('gentle_nudge');
  const [tone, setTone] = useState<FollowUpTone>('professional');
  const [customCheckIn, setCustomCheckIn] = useState('');

  const message = useMemo(
    () => generateFollowUpMessage(loop, tone, messageType),
    [loop, messageType, tone]
  );

  const persistHistory = async (
    action: FollowUpHistoryEntry['action'],
    nextFollowUpDate?: string,
    markSent = false
  ) => {
    const now = new Date().toISOString();
    const entry: FollowUpHistoryEntry = {
      id: generateId(),
      message,
      messageType,
      tone,
      action,
      createdAt: now,
      nextFollowUpDate,
    };
    await updateLoop(loop.id, {
      followUpHistory: [entry, ...(loop.followUpHistory ?? [])],
      nextCheckInAt: nextFollowUpDate,
      lastFollowUpAt: markSent ? now : loop.lastFollowUpAt,
      accountabilityStatus: markSent ? 'clear' : loop.accountabilityStatus,
    });
    if (action === 'saved' || action === 'sent') {
      await addTimelineEvent(loop.id, {
        type: 'follow_up',
        title: action === 'sent' ? 'Follow-up marked sent' : 'Follow-up draft saved',
        description: message,
      });
    }
    void hapticSuccess();
  };

  const askNextCheckIn = (action: FollowUpHistoryEntry['action'], markSent = false) => {
    const options = getFollowUpCadenceOptions();
    Alert.alert('When should LoopTidy check this again?', 'Pick the next local check-in.', [
      ...options.map((option) => ({
        text: option.label,
        onPress: () => {
          if (option.key === 'custom' && !customCheckIn.trim()) {
            Alert.alert('Custom date', 'Enter a custom date in the field, then choose Custom date again.');
            return;
          }
          void persistHistory(
            action,
            option.key === 'custom' ? customCheckIn.trim() : option.date,
            markSent
          );
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const copyMessage = async () => {
    void hapticLight();
    await Clipboard.setStringAsync(message);
    askNextCheckIn('copied');
  };

  const shareMessage = async () => {
    void hapticLight();
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing unavailable', 'The share sheet is not available on this device.');
      return;
    }
    const path = `${FileSystem.cacheDirectory}looptidy-follow-up-${loop.id}.txt`;
    await FileSystem.writeAsStringAsync(path, message);
    await Sharing.shareAsync(path, { mimeType: 'text/plain', UTI: 'public.plain-text' });
    askNextCheckIn('shared');
  };

  return (
    <View
      style={[
        styles.wrap,
        compact && styles.compactWrap,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Follow-Up Assistant</Text>
      <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>Generate a ready-to-send message from this loop.</Text>

      <Text style={[styles.label, { color: theme.colors.textMuted }]}>Message type</Text>
      <View style={styles.chips}>
        {FOLLOW_UP_MESSAGE_TYPES.map((option) => (
          <Chip
            key={option.key}
            label={option.label}
            selected={messageType === option.key}
            onPress={() => setMessageType(option.key)}
          />
        ))}
      </View>

      <Text style={[styles.label, { color: theme.colors.textMuted }]}>Tone</Text>
      <View style={styles.chips}>
        {FOLLOW_UP_TONES.map((option) => (
          <Chip
            key={option.key}
            label={option.label}
            selected={tone === option.key}
            onPress={() => setTone(option.key)}
          />
        ))}
      </View>

      <View style={[styles.messageBox, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}>
        <Text style={[styles.message, { color: theme.colors.text }]}>{message}</Text>
      </View>

      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border, color: theme.colors.text }]}
        value={customCheckIn}
        onChangeText={setCustomCheckIn}
        placeholder="Custom check-in date (optional)"
        placeholderTextColor={theme.colors.textMuted}
      />

      <View style={styles.actions}>
        <Action label="Copy" onPress={copyMessage} filled />
        <Action label="Share" onPress={shareMessage} />
        <Action label="Save note" onPress={() => askNextCheckIn('saved')} />
        <Action label="Mark sent" onPress={() => askNextCheckIn('sent', true)} />
      </View>
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => {
        void hapticLight();
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surface2,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.chipText, { color: selected ? theme.colors.primary : theme.colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

function Action({ label, onPress, filled = false }: { label: string; onPress: () => void; filled?: boolean }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: filled ? theme.colors.primary : theme.colors.surface2, borderColor: filled ? theme.colors.primary : theme.colors.border },
        pressed && { opacity: 0.88 },
      ]}
    >
      <Text style={[styles.actionText, { color: filled ? '#FFFFFF' : theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  compactWrap: {
    marginTop: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
  },
  title: {
    ...typography.headline,
  },
  sub: {
    ...typography.body,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '800',
  },
  messageBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  message: {
    ...typography.body,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.md,
    ...typography.body,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  action: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  actionText: {
    ...typography.caption,
    fontWeight: '900',
  },
});
