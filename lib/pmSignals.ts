import type { FeedbackItem, OpenLoop, ScopeChange } from '../types';
import { getAccountabilitySummary, getEscalatedLoops, getLoopsWithUnclearOwnership } from './accountability';
import { decisionNeedsOwner } from './decisionSpeed';
import { getHighImpactScopeChanges, getOpenScopeChanges } from './scopeGuard';
import { getUntriagedFeedback } from './feedback';
import { flattenDecisions } from './decisions';
import { startOfWeekDate } from './preferences';
import { isOpenLoop } from './utils';

export interface PMSignals {
  decisionsNeedingOwner: number;
  unclearOwnership: number;
  highImpactScope: number;
  untriagedFeedback: number;
  escalatedLoops: number;
  decisionsPending: number;
}

export function computePMSignals(
  loops: OpenLoop[],
  scopeChanges: ScopeChange[],
  feedbackItems: FeedbackItem[]
): PMSignals {
  const acc = getAccountabilitySummary(loops);
  const decisions = flattenDecisions(loops);
  return {
    decisionsNeedingOwner: decisionNeedsOwner(loops),
    unclearOwnership: acc.unclear,
    highImpactScope: getHighImpactScopeChanges(scopeChanges).length,
    untriagedFeedback: getUntriagedFeedback(feedbackItems).length,
    escalatedLoops: getEscalatedLoops(loops).length,
    decisionsPending: decisions.filter((d) => d.status === 'decision_needed').length,
  };
}

export function getDecisionsMadeThisWeek(loops: OpenLoop[]): number {
  const weekStart = startOfWeekDate();
  return flattenDecisions(loops).filter((d) => {
    if (!d.decidedAt || d.status !== 'decided') return false;
    const decided = new Date(d.decidedAt);
    return !Number.isNaN(decided.getTime()) && decided >= weekStart;
  }).length;
}
