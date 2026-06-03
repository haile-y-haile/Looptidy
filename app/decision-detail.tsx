import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { DatePickerField } from '../components/DatePickerField';
import { ScreenScroll } from '../components/ScreenScroll';
import { EmptyState } from '../components/EmptyState';
import { ChipSelector } from '../components/ChipSelector';
import { normalizeDecision } from '../lib/decisions';
import type { DecisionStatus } from '../types';
import { decisionStatusLabel } from '../lib/decisionCenter';
import { radius, spacing, typography } from '../lib/theme';
import { getRiskColor, riskLevelLabels } from '../lib/utils';
import type { RiskLevel } from '../types';

const STATUSES: DecisionStatus[] = [
  'decision_needed',
  'options_reviewed',
  'recommended',
  'decided',
  'revisiting',
  'archived',
];

const RISK_LEVELS: RiskLevel[] = ['none', 'low', 'medium', 'high'];

export default function DecisionDetailScreen() {
  const params = useLocalSearchParams<{ loopId?: string; decisionId?: string }>();
  const loopId = params.loopId;
  const decisionId = params.decisionId;
  const router = useRouter();
  const { theme } = useTheme();
  const { loops, updateDecision, addDecision } = useLoops();

  const loop = loopId ? loops.find((l) => l.id === loopId) : undefined;
  const existing = useMemo(() => {
    if (!loop || !decisionId) return undefined;
    const raw = loop.decisions.find((d) => d.id === decisionId);
    return raw ? normalizeDecision(raw, loop.id) : undefined;
  }, [loop, decisionId]);

  const isNew = !decisionId;

  const [title, setTitle] = useState(existing?.title ?? loop?.title ?? '');
  const [summary, setSummary] = useState(existing?.summary ?? '');
  const [status, setStatus] = useState<DecisionStatus>(existing?.status ?? 'decision_needed');
  const [finalDecision, setFinalDecision] = useState(existing?.finalDecision ?? '');
  const [rationale, setRationale] = useState(existing?.rationale ?? '');
  const [impact, setImpact] = useState(existing?.impact ?? '');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(existing?.riskLevel ?? 'medium');
  const [revisitAt, setRevisitAt] = useState(existing?.revisitAt ?? '');
  const [owner, setOwner] = useState(existing?.owner ?? '');
  const [tradeoffs, setTradeoffs] = useState(existing?.tradeoffs ?? '');
  const [recommendedOption, setRecommendedOption] = useState(existing?.recommendedOption ?? '');
  const [nextAction, setNextAction] = useState(existing?.nextAction ?? '');
  const [decisionDeadline, setDecisionDeadline] = useState(existing?.decisionDeadline ?? '');
  const [busy, setBusy] = useState(false);

  if (!loop) {
    return (
      <ScreenScroll>
        <EmptyState title="Loop not found" message="Return to the decision center." />
      </ScreenScroll>
    );
  }

  const save = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Give this decision a clear title.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        summary: summary.trim() || undefined,
        status,
        finalDecision: finalDecision.trim() || undefined,
        rationale: rationale.trim() || undefined,
        impact: impact.trim() || undefined,
        riskLevel,
        revisitAt: revisitAt.trim() || undefined,
        owner: owner.trim() || undefined,
        tradeoffs: tradeoffs.trim() || undefined,
        recommendedOption: recommendedOption.trim() || undefined,
        nextAction: nextAction.trim() || undefined,
        decisionDeadline: decisionDeadline.trim() || undefined,
        decidedAt: status === 'decided' ? new Date().toISOString() : existing?.decidedAt,
      };
      if (isNew) {
        await addDecision(loop.id, payload);
      } else if (decisionId) {
        await updateDecision(loop.id, decisionId, payload);
      }
      router.back();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: isNew ? 'Add decision' : 'Decision' }} />
      <ScreenScroll>
        <Text style={[styles.loopRef, { color: theme.colors.textMuted }]}>{loop.title}</Text>

        <Pressable
          onPress={() => router.push(`/decision-speed?loopId=${loop.id}${decisionId ? `&decisionId=${decisionId}` : ''}`)}
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

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs deciding?"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Summary</Text>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={summary}
          onChangeText={setSummary}
          placeholder="Context, tradeoffs, stakeholders…"
          placeholderTextColor={theme.colors.textMuted}
          multiline
        />

        <ChipSelector
          label="Status"
          options={STATUSES}
          value={status}
          onChange={setStatus}
          formatLabel={(s) => decisionStatusLabel(s)}
        />

        <ChipSelector
          label="Risk"
          options={RISK_LEVELS}
          value={riskLevel}
          onChange={setRiskLevel}
          formatLabel={(r) => riskLevelLabels[r]}
          toneForValue={(r) => getRiskColor(r)}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Owner</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={owner}
          onChangeText={setOwner}
          placeholder="Who owns this decision?"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tradeoffs</Text>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={tradeoffs}
          onChangeText={setTradeoffs}
          placeholder="Key tradeoffs between options"
          placeholderTextColor={theme.colors.textMuted}
          multiline
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Recommended option</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={recommendedOption}
          onChangeText={setRecommendedOption}
          placeholder="Your recommended path"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Final decision</Text>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={finalDecision}
          onChangeText={setFinalDecision}
          placeholder="What you chose"
          placeholderTextColor={theme.colors.textMuted}
          multiline
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Rationale</Text>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={rationale}
          onChangeText={setRationale}
          placeholder="Why this path — tradeoffs included"
          placeholderTextColor={theme.colors.textMuted}
          multiline
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Impact</Text>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={impact}
          onChangeText={setImpact}
          placeholder="What changes after this decision?"
          placeholderTextColor={theme.colors.textMuted}
          multiline
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Next action</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={nextAction}
          onChangeText={setNextAction}
          placeholder="What happens after the decision?"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Decision deadline</Text>
        <DatePickerField
          value={decisionDeadline}
          onChange={setDecisionDeadline}
          mode="date"
          placeholder="Select decision deadline"
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Revisit date</Text>
        <DatePickerField
          value={revisitAt}
          onChange={setRevisitAt}
          mode="date"
          placeholder="Select revisit date"
        />

        <Pressable onPress={() => router.push(`/loops/${loop.id}`)}>
          <Text style={[styles.link, { color: theme.colors.primary }]}>Open related loop →</Text>
        </Pressable>

        <PrimaryButton
          label={isNew ? 'Add decision' : 'Save decision'}
          onPress={() => void save()}
          disabled={!title.trim() || busy}
          loading={busy}
          style={{ marginTop: spacing.xl }}
        />
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  loopRef: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
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
  label: {
    ...typography.callout,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    ...typography.body,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  link: {
    ...typography.callout,
    fontWeight: '800',
    marginTop: spacing.lg,
  },
});
