import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Stack, useRouter } from 'expo-router';
import { useFeedback } from '../context/FeedbackContext';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/EmptyState';
import { FilterChip } from '../components/FilterChip';
import { GlassCard } from '../components/GlassCard';
import { ScreenScroll } from '../components/ScreenScroll';
import {
  FEEDBACK_SOURCE_LABELS,
  buildFeedbackSummaryText,
  convertFeedbackToLoop,
  getFeedbackSummary,
  getFeedbackThemes,
  getHighUrgencyFeedback,
  getUntriagedFeedback,
} from '../lib/feedback';
import type { FeedbackItem, FeedbackSource, FeedbackSentiment, FeedbackUrgency } from '../types';
import { hapticSuccess } from '../lib/haptics';
import { radius, spacing, typography } from '../lib/theme';

export default function FeedbackScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { feedbackItems, addFeedback, updateFeedback } = useFeedback();
  const { addLoop, addDecision } = useLoops();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [sourcePerson, setSourcePerson] = useState('');
  const [source, setSource] = useState<FeedbackSource>('stakeholder');
  const [themeText, setThemeText] = useState('');
  const [urgency, setUrgency] = useState<FeedbackUrgency>('medium');
  const [sentiment, setSentiment] = useState<FeedbackSentiment>('neutral');

  const fbSummary = useMemo(() => getFeedbackSummary(feedbackItems), [feedbackItems]);
  const themes = useMemo(() => getFeedbackThemes(feedbackItems).slice(0, 5), [feedbackItems]);
  const untriaged = useMemo(() => getUntriagedFeedback(feedbackItems), [feedbackItems]);
  const urgent = useMemo(() => getHighUrgencyFeedback(feedbackItems), [feedbackItems]);

  const capture = async () => {
    if (!title.trim()) {
      Alert.alert('Title required');
      return;
    }
    await addFeedback({
      title: title.trim(),
      summary: summary.trim() || title.trim(),
      source,
      sourcePerson: sourcePerson.trim() || undefined,
      sentiment,
      urgency,
      status: 'captured',
      theme: themeText.trim() || undefined,
    });
    setTitle('');
    setSummary('');
    setSourcePerson('');
    setThemeText('');
    setShowForm(false);
    void hapticSuccess();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Feedback' }} />
      <ScreenScroll>
        <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
          Capture feedback and turn it into loops or decisions.
        </Text>
        <GlassCard intensity={28}>
          <Text style={[styles.statLine, { color: theme.colors.text }]}>
            {fbSummary.untriaged} needs triage · {fbSummary.highUrgency} urgent · {fbSummary.converted} converted
          </Text>
        </GlassCard>

        {themes.length > 0 ? (
          <View style={styles.themes}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>Themes</Text>
            {themes.map((t) => (
              <Text key={t.theme} style={[styles.themeRow, { color: theme.colors.textSecondary }]}>
                {t.theme} ({t.count})
              </Text>
            ))}
          </View>
        ) : null}

        <Pressable
          onPress={() => setShowForm((v) => !v)}
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Capture feedback'}</Text>
        </Pressable>

        {showForm ? (
          <GlassCard intensity={24} style={styles.form}>
            <Field label="Title" value={title} onChange={setTitle} theme={theme} />
            <Field label="Summary" value={summary} onChange={setSummary} theme={theme} multiline />
            <Field label="Source person" value={sourcePerson} onChange={setSourcePerson} theme={theme} />
            <Field label="Theme" value={themeText} onChange={setThemeText} theme={theme} />
            <ScrollView horizontal style={styles.chipScroll}>
              {(Object.keys(FEEDBACK_SOURCE_LABELS) as FeedbackSource[]).slice(0, 5).map((s) => (
                <FilterChip key={s} label={FEEDBACK_SOURCE_LABELS[s]} selected={source === s} onPress={() => setSource(s)} />
              ))}
            </ScrollView>
            <Pressable onPress={() => void capture()} style={[styles.save, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </GlassCard>
        ) : null}

        <Section title="Needs triage" items={untriaged} onConvertLoop={async (item) => {
          const loop = await addLoop(convertFeedbackToLoop(item));
          await updateFeedback(item.id, { status: 'converted_to_loop', linkedLoopIds: [...item.linkedLoopIds, loop.id] });
        }} onConvertDecision={async (item) => {
          const loop = await addLoop({ title: item.title, description: item.summary, type: 'decision_needed', status: 'open', priority: 'medium', riskLevel: 'medium', category: 'work', owner: { id: 'me', name: 'You' }, decisions: [], attachments: [] });
          await addDecision(loop.id, { title: item.title, summary: item.summary, status: 'decision_needed' });
          await updateFeedback(item.id, { status: 'converted_to_decision', linkedLoopIds: [loop.id] });
          router.push(`/decision-speed?loopId=${loop.id}`);
        }} onTriage={(id) => void updateFeedback(id, { status: 'triaged' })} onArchive={(id) => void updateFeedback(id, { status: 'archived' })} onCopy={async (item) => { await Clipboard.setStringAsync(buildFeedbackSummaryText(item)); Alert.alert('Copied'); }} />

        <Section title="High urgency" items={urgent} onConvertLoop={async (item) => {
          const loop = await addLoop(convertFeedbackToLoop(item));
          await updateFeedback(item.id, { status: 'converted_to_loop', linkedLoopIds: [...item.linkedLoopIds, loop.id] });
        }} onConvertDecision={async (item) => {
          const loop = await addLoop({ title: item.title, description: item.summary, type: 'decision_needed', status: 'open', priority: 'high', riskLevel: 'medium', category: 'work', owner: { id: 'me', name: 'You' }, decisions: [], attachments: [] });
          await addDecision(loop.id, { title: item.title, summary: item.summary, status: 'decision_needed' });
          router.push(`/decision-speed?loopId=${loop.id}`);
        }} onTriage={(id) => void updateFeedback(id, { status: 'triaged' })} onArchive={(id) => void updateFeedback(id, { status: 'archived' })} onCopy={async (item) => { await Clipboard.setStringAsync(buildFeedbackSummaryText(item)); Alert.alert('Copied'); }} />
      </ScreenScroll>
    </>
  );
}

function Section({
  title,
  items,
  onConvertLoop,
  onConvertDecision,
  onTriage,
  onArchive,
  onCopy,
}: {
  title: string;
  items: FeedbackItem[];
  onConvertLoop: (item: FeedbackItem) => void;
  onConvertDecision: (item: FeedbackItem) => void;
  onTriage: (id: string) => void;
  onArchive: (id: string) => void;
  onCopy: (item: FeedbackItem) => void;
}) {
  const { theme } = useTheme();
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {items.map((item) => (
        <View key={item.id} style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.cardMeta, { color: theme.colors.textMuted }]}>
            {FEEDBACK_SOURCE_LABELS[item.source]} · {item.urgency} · {item.sentiment}
          </Text>
          <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]} numberOfLines={3}>{item.summary}</Text>
          <View style={styles.actions}>
            {['To loop', 'To decision', 'Triage', 'Archive', 'Copy'].map((label, i) => {
              const handlers = [() => onConvertLoop(item), () => onConvertDecision(item), () => onTriage(item.id), () => onArchive(item.id), () => onCopy(item)];
              return (
                <Pressable key={label} onPress={handlers[i]} style={[styles.chip, { borderColor: theme.colors.border }]}>
                  <Text style={{ color: theme.colors.text, ...typography.caption }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

function Field({ label, value, onChange, theme, multiline }: { label: string; value: string; onChange: (v: string) => void; theme: ReturnType<typeof useTheme>['theme']; multiline?: boolean }) {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <TextInput style={[styles.input, multiline && { minHeight: 72 }, { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.background }]} value={value} onChangeText={onChange} multiline={multiline} placeholderTextColor={theme.colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  sub: { ...typography.body, marginBottom: spacing.md },
  statLine: { ...typography.callout, fontWeight: '700' },
  themes: { marginVertical: spacing.md },
  themeRow: { ...typography.caption, marginBottom: 2 },
  label: { ...typography.caption },
  addBtn: { borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  addBtnText: { color: '#FFF', fontWeight: '800' },
  form: { marginBottom: spacing.lg },
  input: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, ...typography.body },
  chipScroll: { marginBottom: spacing.md },
  save: { borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  saveText: { color: '#FFF', fontWeight: '800' },
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.headline, marginBottom: spacing.md },
  card: { borderWidth: 1, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  cardTitle: { ...typography.callout, fontWeight: '800' },
  cardMeta: { ...typography.caption, marginTop: 4 },
  cardDesc: { ...typography.body, marginTop: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  chip: { borderWidth: 1, borderRadius: radius.full, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
});
