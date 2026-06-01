import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { DECISION_SPEED_STEPS, buildDecisionSummaryText, draftToDecision, type DecisionSpeedDraft } from '../lib/decisionSpeed';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import { radius, spacing, typography } from '../lib/theme';
import type { DecisionStatus, RiskLevel } from '../types';

export default function DecisionSpeedScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ loopId?: string; decisionId?: string }>();
  const { loops, addLoop, addDecision, updateDecision } = useLoops();

  const loop = params.loopId ? loops.find((l) => l.id === params.loopId) : undefined;
  const existing = loop && params.decisionId
    ? loop.decisions.find((d) => d.id === params.decisionId)
    : undefined;

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DecisionSpeedDraft>({
    title: existing?.title ?? loop?.title ?? '',
    summary: existing?.summary ?? loop?.description ?? '',
    owner: existing?.owner ?? '',
    optionsText: existing?.options?.map((o) => o.label).join('\n') ?? '',
    tradeoffs: existing?.tradeoffs ?? '',
    recommendedOption: existing?.recommendedOption ?? '',
    finalDecision: existing?.finalDecision ?? '',
    rationale: existing?.rationale ?? '',
    riskLevel: existing?.riskLevel ?? 'medium',
    impact: existing?.impact ?? '',
    decisionDeadline: existing?.decisionDeadline ?? '',
    revisitAt: existing?.revisitAt ?? '',
    loopId: loop?.id ?? '',
    nextAction: existing?.nextAction ?? '',
    status: existing?.status ?? 'decision_needed',
  });
  const [busy, setBusy] = useState(false);

  const stepMeta = DECISION_SPEED_STEPS[step];
  const progress = ((step + 1) / DECISION_SPEED_STEPS.length) * 100;

  const patch = (partial: Partial<DecisionSpeedDraft>) => setDraft((d) => ({ ...d, ...partial }));

  const finish = async (status: DecisionStatus) => {
    if (!draft.title.trim()) {
      Alert.alert('Title required', 'Describe the decision before saving.');
      return;
    }
    setBusy(true);
    try {
      let loopId = draft.loopId;
      if (!loopId) {
        const created = await addLoop({
          title: draft.title.trim(),
          description: draft.summary.trim(),
          type: 'decision_needed',
          status: 'open',
          priority: 'medium',
          riskLevel: draft.riskLevel,
          category: 'work',
          owner: { id: 'me', name: 'You' },
          decisions: [],
          attachments: [],
        });
        loopId = created.id;
      }
      const decision = draftToDecision({ ...draft, loopId, status }, existing?.id);
      if (existing?.id) {
        await updateDecision(loopId, existing.id, decision);
      } else {
        await addDecision(loopId, decision);
      }
      if (draft.nextAction.trim()) {
        await addLoop({
          title: draft.nextAction.trim(),
          description: `Follow-up from decision: ${draft.title}`,
          type: 'follow_up',
          status: 'open',
          priority: 'medium',
          riskLevel: 'low',
          category: 'work',
          owner: { id: 'me', name: 'You' },
          decisions: [],
          attachments: [],
        });
      }
      void hapticSuccess();
      Alert.alert('Decision saved', 'Recorded locally on this device.', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const copySummary = async () => {
    const text = buildDecisionSummaryText(draftToDecision(draft, existing?.id));
    await Clipboard.setStringAsync(text);
    void hapticSuccess();
    Alert.alert('Copied', 'Decision summary copied.');
  };

  const stepBody = useMemo(() => {
    switch (step) {
      case 0:
        return (
          <>
            <Field label="Decision title" value={draft.title} onChange={(t) => patch({ title: t })} theme={theme} />
            <Field label="Summary" value={draft.summary} onChange={(s) => patch({ summary: s })} theme={theme} multiline />
          </>
        );
      case 1:
        return (
          <Field
            label="Options (one per line)"
            value={draft.optionsText}
            onChange={(t) => patch({ optionsText: t })}
            theme={theme}
            multiline
          />
        );
      case 2:
        return (
          <Field label="Tradeoffs" value={draft.tradeoffs} onChange={(t) => patch({ tradeoffs: t })} theme={theme} multiline />
        );
      case 3:
        return (
          <Field label="Decision owner" value={draft.owner} onChange={(o) => patch({ owner: o })} theme={theme} />
        );
      case 4:
        return (
          <>
            <Field
              label="Recommended option"
              value={draft.recommendedOption}
              onChange={(t) => patch({ recommendedOption: t, status: 'recommended' })}
              theme={theme}
            />
            <Field label="Impact" value={draft.impact} onChange={(t) => patch({ impact: t })} theme={theme} multiline />
          </>
        );
      default:
        return (
          <>
            <Field
              label="Final decision"
              value={draft.finalDecision}
              onChange={(t) => patch({ finalDecision: t })}
              theme={theme}
              multiline
            />
            <Field label="Rationale" value={draft.rationale} onChange={(t) => patch({ rationale: t })} theme={theme} multiline />
            <Field label="Next action" value={draft.nextAction} onChange={(t) => patch({ nextAction: t })} theme={theme} />
            <Field label="Revisit date" value={draft.revisitAt} onChange={(t) => patch({ revisitAt: t })} theme={theme} />
          </>
        );
    }
  }, [draft, step, theme]);

  return (
    <>
      <Stack.Screen options={{ title: 'Decision Speed' }} />
      <ScreenScroll>
        <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
          Move from ambiguity to a clear decision, owner, and next action — stored locally only.
        </Text>
        <GlassCard intensity={32}>
          <View style={[styles.track, { backgroundColor: theme.colors.surface2 }]}>
            <View style={[styles.fill, { width: `${progress}%`, backgroundColor: theme.colors.primary }]} />
          </View>
          <Text style={[styles.stepLabel, { color: theme.colors.textMuted }]}>
            Step {step + 1} of {DECISION_SPEED_STEPS.length}
          </Text>
          <Text style={[styles.stepTitle, { color: theme.colors.text }]}>{stepMeta.title}</Text>
          {stepBody}
        </GlassCard>

        <View style={styles.nav}>
          {step > 0 ? (
            <Pressable onPress={() => setStep((s) => s - 1)} style={styles.navBtn}>
              <Text style={{ color: theme.colors.primary }}>Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
          {step < DECISION_SPEED_STEPS.length - 1 ? (
            <Pressable
              onPress={() => {
                void hapticLight();
                setStep((s) => s + 1);
              }}
              style={[styles.navBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.navBtnText}>Next</Text>
            </Pressable>
          ) : (
            <PrimaryButton label="Mark decided" onPress={() => void finish('decided')} disabled={busy} loading={busy} />
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quick}>
          <QuickChip label="Copy summary" onPress={() => void copySummary()} theme={theme} />
          <QuickChip label="Save draft" onPress={() => void finish('options_reviewed')} theme={theme} />
          {loop ? (
            <QuickChip label="Open loop" onPress={() => router.push(`/loops/${loop.id}`)} theme={theme} />
          ) : null}
        </ScrollView>
      </ScreenScroll>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  theme,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  theme: ReturnType<typeof useTheme>['theme'];
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text },
        ]}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={theme.colors.textMuted}
        multiline={multiline}
      />
    </View>
  );
}

function QuickChip({
  label,
  onPress,
  theme,
}: {
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <Text style={[styles.chipText, { color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sub: { ...typography.body, marginBottom: spacing.lg },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: spacing.sm },
  fill: { height: '100%' },
  stepLabel: { ...typography.label, marginBottom: spacing.xs },
  stepTitle: { ...typography.headline, marginBottom: spacing.lg },
  fieldLabel: { ...typography.caption, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  navBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  navBtnText: { color: '#FFF', fontWeight: '800' },
  quick: { marginBottom: spacing.xxxl },
  chip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  chipText: { ...typography.caption, fontWeight: '800' },
});
