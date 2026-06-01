import type { DecisionStatus, OpenLoop } from '../types';
import { flattenDecisions, type DecisionWithLoop } from './decisions';
import { isOpenLoop } from './utils';

export interface DecisionCenterStats {
  needed: number;
  optionsReviewed: number;
  decided: number;
  revisiting: number;
  highRisk: number;
  revisitSoon: number;
}

export function getDecisionCenterStats(loops: OpenLoop[]): DecisionCenterStats {
  const all = flattenDecisions(loops);
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  return {
    needed: all.filter((d) => d.status === 'decision_needed').length,
    optionsReviewed: all.filter((d) => d.status === 'options_reviewed').length,
    decided: all.filter((d) => d.status === 'decided').length,
    revisiting: all.filter((d) => d.status === 'revisiting').length,
    highRisk: all.filter((d) => d.riskLevel === 'high' && d.status !== 'archived').length,
    revisitSoon: all.filter((d) => {
      if (!d.revisitAt || d.status === 'archived') return false;
      const t = new Date(d.revisitAt).getTime();
      return !Number.isNaN(t) && t >= now && t - now <= weekMs;
    }).length,
  };
}

export function getDecisionsNeeded(loops: OpenLoop[]): OpenLoop[] {
  return loops.filter(
    (l) =>
      isOpenLoop(l) &&
      (l.type === 'decision_needed' ||
        l.decisions.some((d) => d.status === 'decision_needed' || d.status === 'options_reviewed'))
  );
}

export function getRecentlyDecided(all: DecisionWithLoop[], limit = 8): DecisionWithLoop[] {
  return all
    .filter((d) => d.status === 'decided' && d.decidedAt)
    .sort((a, b) => new Date(b.decidedAt!).getTime() - new Date(a.decidedAt!).getTime())
    .slice(0, limit);
}

export function getRevisitSoon(all: DecisionWithLoop[]): DecisionWithLoop[] {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return all
    .filter((d) => {
      if (!d.revisitAt || d.status === 'archived') return false;
      const t = new Date(d.revisitAt).getTime();
      return !Number.isNaN(t) && t >= now && t - now <= weekMs;
    })
    .sort((a, b) => new Date(a.revisitAt!).getTime() - new Date(b.revisitAt!).getTime());
}

export function getHighRiskDecisions(all: DecisionWithLoop[]): DecisionWithLoop[] {
  return all.filter((d) => d.riskLevel === 'high' && d.status !== 'archived');
}

export function decisionStatusLabel(status: DecisionStatus): string {
  const map: Record<DecisionStatus, string> = {
    decision_needed: 'Decision needed',
    options_reviewed: 'Options reviewed',
    recommended: 'Recommended',
    decided: 'Decided',
    revisiting: 'Revisiting',
    archived: 'Archived',
  };
  return map[status];
}
