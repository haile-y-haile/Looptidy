import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { EmptyState } from '../components/EmptyState';
import { FilterChip } from '../components/FilterChip';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import {
  MEETING_TEMPLATES,
  convertSuggestedItemToLoop,
  parseMeetingNotes,
  type MeetingTemplate,
  type SuggestedMeetingItem,
} from '../lib/meetingParser';
import { categoryLabels, formatDate, loopTypeLabels } from '../lib/utils';
import { radius, spacing, typography } from '../lib/theme';

type ActionPlanTab = 'owe' | 'others' | 'decisions' | 'blocked' | 'first';

const PLAN_TABS: { key: ActionPlanTab; label: string }[] = [
  { key: 'owe', label: 'What I owe' },
  { key: 'others', label: 'What others owe' },
  { key: 'decisions', label: 'Decisions' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'first', label: 'Do first' },
];

const SAMPLE_NOTES = 'Talked to Sam. Need budget by Friday. Legal still blocking launch. Decide pricing next week. I told Ana I would send the updated deck.';

export default function MeetingDumpScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { addLoop } = useLoops();
  const [template, setTemplate] = useState<MeetingTemplate>('general_notes');
  const [rawNotes, setRawNotes] = useState('');
  const [items, setItems] = useState<SuggestedMeetingItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [planTab, setPlanTab] = useState<ActionPlanTab>('first');
  const parseResult = useMemo(() => parseMeetingNotes(rawNotes), [rawNotes]);
  const acceptedCount = items.filter((item) => item.accepted).length;

  const parse = () => {
    if (!rawNotes.trim()) {
      Alert.alert('Add meeting notes', 'Paste messy notes first, then LoopTidy will extract suggested loops locally.');
      return;
    }
    void hapticLight();
    setItems(parseResult.suggestedItems);
    if (parseResult.suggestedItems.length === 0) {
      Alert.alert('No loops found', 'Try adding phrases like waiting on, blocked by, I owe, or need to decide.');
    }
  };

  const updateItem = (id: string, updates: Partial<SuggestedMeetingItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const mergeWithPrevious = (item: SuggestedMeetingItem) => {
    const target = items.find((candidate) => candidate.id !== item.id && candidate.accepted);
    if (!target) {
      Alert.alert('Nothing to merge', 'Accept another suggestion first, then merge this into it.');
      return;
    }
    setItems((prev) =>
      prev.map((candidate) => {
        if (candidate.id === target.id) {
          return {
            ...candidate,
            title: `${candidate.title} + ${item.title}`,
            description: `${candidate.description}\nMerged: ${item.description}`,
          };
        }
        if (candidate.id === item.id) return { ...candidate, accepted: false, mergedIntoId: target.id };
        return candidate;
      })
    );
    void hapticSuccess();
  };

  const convertOne = async (item: SuggestedMeetingItem) => {
    const created = await addLoop(convertSuggestedItemToLoop(item));
    updateItem(item.id, { accepted: false, mergedIntoId: created.id });
    void hapticSuccess();
  };

  const convertAccepted = async () => {
    const accepted = items.filter((item) => item.accepted);
    if (accepted.length === 0) {
      Alert.alert('No accepted items', 'Accept at least one suggested item to convert.');
      return;
    }
    for (const item of accepted) {
      await addLoop(convertSuggestedItemToLoop(item));
    }
    void hapticSuccess();
    Alert.alert('Action plan saved', `${accepted.length} loop${accepted.length === 1 ? '' : 's'} created on this device.`, [
      { text: 'View loops', onPress: () => router.push('/loops') },
      { text: 'Stay here' },
    ]);
    setItems((prev) => prev.map((item) => (item.accepted ? { ...item, accepted: false } : item)));
  };

  const planItems = (() => {
    const parsed = parseMeetingNotes(rawNotes);
    switch (planTab) {
      case 'owe':
        return parsed.actionPlan.whatIOwe;
      case 'others':
        return parsed.actionPlan.whatOthersOwe;
      case 'decisions':
        return parsed.actionPlan.decisions;
      case 'blocked':
        return parsed.actionPlan.blocked;
      case 'first':
      default:
        return parsed.actionPlan.whatToDoFirst;
    }
  })();

  return (
    <>
      <Stack.Screen options={{ title: 'Meeting Dump' }} />
      <ScreenScroll>
        <Text style={[styles.title, { color: theme.colors.text }]}>Meeting Dump</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Paste messy notes. LoopTidy extracts a local action plan without AI APIs or cloud processing.</Text>

        <GlassCard style={styles.card} intensity={34}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Template</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateRow}>
            {MEETING_TEMPLATES.map((item) => (
              <FilterChip
                key={item.key}
                label={item.label}
                selected={template === item.key}
                onPress={() => {
                  void hapticLight();
                  setTemplate(item.key);
                }}
              />
            ))}
          </ScrollView>

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Raw notes</Text>
          <TextInput
            style={[styles.notesInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
            value={rawNotes}
            onChangeText={setRawNotes}
            placeholder={SAMPLE_NOTES}
            placeholderTextColor={theme.colors.textMuted}
            multiline
          />
          <View style={styles.buttonRow}>
            <PrimaryButton label="Extract action plan" onPress={parse} style={styles.flexButton} />
            <PrimaryButton label="Use sample" tone="secondary" onPress={() => setRawNotes(SAMPLE_NOTES)} style={styles.flexButton} />
          </View>
        </GlassCard>

        {items.length > 0 ? (
          <GlassCard style={styles.card} intensity={28}>
            <Text style={[styles.summary, { color: theme.colors.text }]}>{parseResult.summary}</Text>
            <Text style={[styles.muted, { color: theme.colors.textMuted }]}>People: {parseResult.people.join(', ') || 'None detected'} · Due dates: {parseResult.dueDates.length}</Text>
            <View style={styles.buttonRow}>
              <PrimaryButton label={`Convert accepted (${acceptedCount})`} onPress={convertAccepted} style={styles.flexButton} />
              <PrimaryButton label="Accept all" tone="secondary" onPress={() => setItems((prev) => prev.map((item) => ({ ...item, accepted: true })))} style={styles.flexButton} />
            </View>
          </GlassCard>
        ) : null}

        {items.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Suggested loop cards</Text>
            {items.map((item) => (
              <SuggestedCard
                key={item.id}
                item={item}
                editing={editingId === item.id}
                onEdit={() => setEditingId(editingId === item.id ? null : item.id)}
                onChange={(updates) => updateItem(item.id, updates)}
                onAccept={() => updateItem(item.id, { accepted: !item.accepted })}
                onMerge={() => mergeWithPrevious(item)}
                onDelete={() => setItems((prev) => prev.filter((candidate) => candidate.id !== item.id))}
                onConvert={() => void convertOne(item)}
              />
            ))}
          </View>
        ) : (
          <EmptyState compact title="No action plan yet" message="Paste meeting notes and extract suggested loops." />
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Action Plan Mode</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateRow}>
            {PLAN_TABS.map((item) => (
              <FilterChip key={item.key} label={item.label} selected={planTab === item.key} onPress={() => setPlanTab(item.key)} />
            ))}
          </ScrollView>
          {planItems.length > 0 ? (
            planItems.map((item) => <PlanRow key={item.id} item={item} />)
          ) : (
            <EmptyState compact title="Nothing here" message="This bucket will fill after parsing matching notes." />
          )}
        </View>
      </ScreenScroll>
    </>
  );
}

function SuggestedCard({
  item,
  editing,
  onEdit,
  onChange,
  onAccept,
  onMerge,
  onDelete,
  onConvert,
}: {
  item: SuggestedMeetingItem;
  editing: boolean;
  onEdit: () => void;
  onChange: (updates: Partial<SuggestedMeetingItem>) => void;
  onAccept: () => void;
  onMerge: () => void;
  onDelete: () => void;
  onConvert: () => void;
}) {
  const { theme } = useTheme();
  const loop = convertSuggestedItemToLoop(item);
  return (
    <View style={[styles.suggestion, { backgroundColor: theme.colors.surface, borderColor: item.accepted ? theme.colors.primary : theme.colors.border }]}> 
      {editing ? (
        <>
          <TextInput style={[styles.editInput, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border, color: theme.colors.text }]} value={item.title} onChangeText={(title) => onChange({ title })} />
          <TextInput style={[styles.editInput, styles.editArea, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border, color: theme.colors.text }]} value={item.description} onChangeText={(description) => onChange({ description })} multiline />
        </>
      ) : (
        <>
          <Text style={[styles.suggestionTitle, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.suggestionMeta, { color: theme.colors.textSecondary }]}>{loopTypeLabels[loop.type]} · {categoryLabels[item.category]}{item.person ? ` · ${item.person}` : ''}{item.dueDate ? ` · Due ${formatDate(item.dueDate)}` : ''}</Text>
          <Text style={[styles.suggestionDesc, { color: theme.colors.textMuted }]}>{item.description}</Text>
        </>
      )}
      <View style={styles.actions}>
        <MiniAction label={item.accepted ? 'Accepted' : 'Accept'} active={item.accepted} onPress={onAccept} />
        <MiniAction label={editing ? 'Done' : 'Edit'} onPress={onEdit} />
        <MiniAction label="Merge" onPress={onMerge} />
        <MiniAction label="Delete" danger onPress={onDelete} />
        <MiniAction label="Convert" active onPress={onConvert} />
      </View>
    </View>
  );
}

function PlanRow({ item }: { item: SuggestedMeetingItem }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.planRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
      <Text style={[styles.planTitle, { color: theme.colors.text }]}>{item.title}</Text>
      <Text style={[styles.suggestionMeta, { color: theme.colors.textMuted }]}>{item.type.replace('_', ' ')}{item.person ? ` · ${item.person}` : ''}</Text>
    </View>
  );
}

function MiniAction({ label, onPress, active = false, danger = false }: { label: string; onPress: () => void; active?: boolean; danger?: boolean }) {
  const { theme } = useTheme();
  const color = danger ? theme.colors.danger : active ? theme.colors.primary : theme.colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.miniAction, { backgroundColor: active ? theme.colors.primaryLight : theme.colors.surface2, borderColor: danger ? theme.colors.danger : theme.colors.border }, pressed && { opacity: 0.85 }]}
    >
      <Text style={[styles.miniActionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.largeTitle,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  templateRow: {
    gap: spacing.sm,
    flexDirection: 'row',
    paddingBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: 160,
    padding: spacing.md,
    textAlignVertical: 'top',
    ...typography.body,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  flexButton: {
    flex: 1,
  },
  summary: {
    ...typography.callout,
    marginBottom: spacing.sm,
  },
  muted: {
    ...typography.caption,
  },
  suggestion: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  suggestionTitle: {
    ...typography.headline,
  },
  suggestionMeta: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  suggestionDesc: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  miniAction: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  miniActionText: {
    ...typography.caption,
    fontWeight: '900',
  },
  editInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...typography.body,
  },
  editArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  planRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  planTitle: {
    ...typography.callout,
  },
});
