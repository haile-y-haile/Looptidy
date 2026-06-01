import type { Decision, DecisionStatus, OpenLoop, RiskLevel } from '../types';

const VALID_STATUSES: DecisionStatus[] = [
  'decision_needed',
  'options_reviewed',
  'decided',
  'revisiting',
  'archived',
];

export function normalizeDecision(raw: Partial<Decision> & { id: string }, loopId: string): Decision {
  const now = new Date().toISOString();
  const title =
    raw.title?.trim() ||
    raw.question?.trim() ||
    'Decision';
  const finalDecision = raw.finalDecision ?? raw.outcome;
  const status: DecisionStatus =
    raw.status && VALID_STATUSES.includes(raw.status)
      ? raw.status
      : finalDecision
        ? 'decided'
        : 'decision_needed';

  return {
    id: raw.id,
    loopId: raw.loopId || loopId,
    title,
    summary: raw.summary ?? raw.question,
    status,
    owner: raw.owner ?? raw.decidedBy,
    options: Array.isArray(raw.options) ? raw.options : [],
    finalDecision,
    rationale: raw.rationale ?? (status === 'decided' ? raw.outcome : undefined),
    impact: raw.impact,
    riskLevel: raw.riskLevel ?? 'medium',
    decidedAt: raw.decidedAt ?? (status === 'decided' ? now : undefined),
    revisitAt: raw.revisitAt,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  };
}

export function createDecisionInput(
  loop: OpenLoop,
  partial: Partial<Decision> = {}
): Omit<Decision, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    loopId: loop.id,
    title: partial.title ?? loop.title,
    summary: partial.summary ?? loop.description,
    status: partial.status ?? 'decision_needed',
    owner: partial.owner,
    options: partial.options ?? [],
    finalDecision: partial.finalDecision,
    rationale: partial.rationale,
    impact: partial.impact,
    riskLevel: partial.riskLevel ?? loop.riskLevel,
    decidedAt: partial.decidedAt,
    revisitAt: partial.revisitAt,
  };
}

export type DecisionWithLoop = Decision & {
  loopTitle: string;
  loopRisk: RiskLevel;
};

export function flattenDecisions(loops: OpenLoop[]): DecisionWithLoop[] {
  return loops.flatMap((loop) =>
    loop.decisions.map((d) => ({
      ...normalizeDecision(d, loop.id),
      loopTitle: loop.title,
      loopRisk: loop.riskLevel,
    }))
  );
}
