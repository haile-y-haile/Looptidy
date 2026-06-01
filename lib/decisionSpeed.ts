import type { Decision, DecisionOption, OpenLoop } from '../types';
import { normalizeDecision } from './decisions';

export function buildDecisionSummaryText(d: Decision): string {
  const parts = [
    d.finalDecision ? `Decision: ${d.finalDecision}.` : null,
    d.rationale ? `Rationale: ${d.rationale}.` : null,
    d.owner ? `Owner: ${d.owner}.` : null,
    d.nextAction ? `Next action: ${d.nextAction}.` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : `Decision in progress: ${d.title}.`;
}

export interface DecisionSpeedDraft {
  title: string;
  summary: string;
  owner: string;
  optionsText: string;
  tradeoffs: string;
  recommendedOption: string;
  finalDecision: string;
  rationale: string;
  riskLevel: Decision['riskLevel'];
  impact: string;
  decisionDeadline: string;
  revisitAt: string;
  loopId: string;
  nextAction: string;
  status: Decision['status'];
}

export function draftToDecision(
  draft: DecisionSpeedDraft,
  existingId?: string
): Decision {
  const options: DecisionOption[] = draft.optionsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((label, i) => ({ id: `opt-${i}`, label }));

  const now = new Date().toISOString();
  return normalizeDecision(
    {
      id: existingId ?? `dec-${Date.now()}`,
      loopId: draft.loopId,
      title: draft.title.trim() || 'Decision',
      summary: draft.summary.trim() || undefined,
      status: draft.status,
      owner: draft.owner.trim() || undefined,
      options,
      tradeoffs: draft.tradeoffs.trim() || undefined,
      recommendedOption: draft.recommendedOption.trim() || undefined,
      finalDecision: draft.finalDecision.trim() || undefined,
      rationale: draft.rationale.trim() || undefined,
      impact: draft.impact.trim() || undefined,
      riskLevel: draft.riskLevel,
      decisionDeadline: draft.decisionDeadline.trim() || undefined,
      revisitAt: draft.revisitAt.trim() || undefined,
      nextAction: draft.nextAction.trim() || undefined,
      decidedAt: draft.status === 'decided' ? now : undefined,
      createdAt: now,
      updatedAt: now,
    },
    draft.loopId
  );
}

export function decisionNeedsOwner(loops: OpenLoop[]): number {
  return loops.reduce((count, loop) => {
    const open = loop.decisions.filter(
      (d) =>
        (d.status === 'decision_needed' || d.status === 'options_reviewed') && !d.owner?.trim()
    );
    return count + open.length;
  }, 0);
}

export const DECISION_SPEED_STEPS = [
  { key: 'what', title: 'What decision is needed?', field: 'title' as const },
  { key: 'options', title: 'What are the options?', field: 'options' as const },
  { key: 'tradeoffs', title: 'What are the tradeoffs?', field: 'tradeoffs' as const },
  { key: 'owner', title: 'Who owns the decision?', field: 'owner' as const },
  { key: 'recommend', title: 'What is the recommended path?', field: 'recommend' as const },
  { key: 'finalize', title: 'Final decision and next action', field: 'finalize' as const },
];
