import type { Category, FeedbackItem, LoopType, OpenLoop, ScopeChange } from '../types';
import { getAccountabilitySummary } from './accountability';
import { getDecisionsMadeThisWeek } from './pmSignals';
import { flattenDecisions } from './decisions';
import { getScopeChangeSummary } from './scopeGuard';
import { getFeedbackSummary } from './feedback';
import { isOpenLoop } from './utils';
import { categoryLabels, loopTypeLabels } from './utils';

export interface LoopInsights {
  totalOpen: number;
  closedThisWeek: number;
  openedThisWeek: number;
  overdueCount: number;
  highRiskCount: number;
  waitingCount: number;
  promisedCount: number;
  blockedCount: number;
  decisionsNeededCount: number;
  averageAgeDays: number;
  oldestOpenDays: number;
  oldestOpenTitle?: string;
  closureRatePercent: number | null;
  byType: { type: LoopType; count: number; label: string }[];
  topCategories: { category: Category; count: number; label: string }[];
  agingBuckets: { label: string; count: number }[];
  closedThisWeekGoal: number;
  decisionsPending: number;
  decisionsMadeThisWeek: number;
  unclearOwnership: number;
  escalatedLoops: number;
  scopeChangesCaptured: number;
  highImpactScope: number;
  feedbackCaptured: number;
  feedbackConverted: number;
}

function startOfWeek(d = new Date()): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysBetween(from: string, to = new Date()): number {
  const start = new Date(from).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((to.getTime() - start) / (1000 * 60 * 60 * 24)));
}

function isOverdueLoop(loop: OpenLoop): boolean {
  if (!loop.dueDate) return false;
  const due = new Date(loop.dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < now;
}

export function computeInsights(
  loops: OpenLoop[],
  scopeChanges: ScopeChange[] = [],
  feedbackItems: FeedbackItem[] = []
): LoopInsights {
  const weekStart = startOfWeek();
  const open = loops.filter(isOpenLoop);
  const closedThisWeek = loops.filter(
    (l) =>
      l.closedAt &&
      new Date(l.closedAt) >= weekStart &&
      (l.status === 'closed' || l.status === 'archived')
  ).length;
  const openedThisWeek = loops.filter(
    (l) => new Date(l.createdAt) >= weekStart && isOpenLoop(l)
  ).length;

  const ages = open.map((l) => daysBetween(l.createdAt));
  const averageAgeDays =
    ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

  const oldest = [...open].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )[0];
  const oldestOpenDays = oldest ? daysBetween(oldest.createdAt) : 0;

  const typeKeys: LoopType[] = [
    'waiting_on_others',
    'promised_by_me',
    'decision_needed',
    'blocked',
    'follow_up',
    'due',
  ];
  const byType = typeKeys
    .map((type) => ({
      type,
      count: open.filter((l) => l.type === type).length,
      label: loopTypeLabels[type],
    }))
    .filter((row) => row.count > 0);

  const categoryKeys: Category[] = ['work', 'personal', 'finance', 'health', 'home', 'other'];
  const topCategories = categoryKeys
    .map((category) => ({
      category,
      count: open.filter((l) => l.category === category).length,
      label: categoryLabels[category],
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const agingBuckets = [
    { label: '0–7 days', count: open.filter((l) => daysBetween(l.createdAt) <= 7).length },
    {
      label: '8–30 days',
      count: open.filter((l) => {
        const d = daysBetween(l.createdAt);
        return d > 7 && d <= 30;
      }).length,
    },
    { label: '30+ days', count: open.filter((l) => daysBetween(l.createdAt) > 30).length },
  ];

  const closedAll = loops.filter((l) => l.status === 'closed' || l.status === 'archived').length;
  const closureRatePercent =
    loops.length > 0 ? Math.round((closedAll / loops.length) * 100) : null;

  const acc = getAccountabilitySummary(loops);
  const scopeSum = getScopeChangeSummary(scopeChanges);
  const fbSum = getFeedbackSummary(feedbackItems);
  const decisions = flattenDecisions(loops);

  return {
    totalOpen: open.length,
    closedThisWeek,
    openedThisWeek,
    overdueCount: open.filter(isOverdueLoop).length,
    highRiskCount: open.filter((l) => l.riskLevel === 'high').length,
    waitingCount: open.filter((l) => l.type === 'waiting_on_others').length,
    promisedCount: open.filter((l) => l.type === 'promised_by_me').length,
    blockedCount: open.filter(
      (l) => l.type === 'blocked' || l.status === 'blocked'
    ).length,
    decisionsNeededCount: open.filter(
      (l) => l.type === 'decision_needed' && l.status !== 'decided'
    ).length,
    averageAgeDays,
    oldestOpenDays,
    oldestOpenTitle: oldest?.title,
    closureRatePercent,
    byType,
    topCategories,
    agingBuckets,
    closedThisWeekGoal: Math.max(closedThisWeek, 3),
    decisionsPending: decisions.filter((d) => d.status === 'decision_needed').length,
    decisionsMadeThisWeek: getDecisionsMadeThisWeek(loops),
    unclearOwnership: acc.unclear,
    escalatedLoops: acc.escalated,
    scopeChangesCaptured: scopeSum.total,
    highImpactScope: scopeSum.highImpact,
    feedbackCaptured: fbSum.total,
    feedbackConverted: fbSum.converted,
  };
}

export function buildInsightMessages(insights: LoopInsights): string[] {
  const lines: string[] = [];
  if (insights.waitingCount > 0) {
    lines.push(
      `You have ${insights.waitingCount} loop${insights.waitingCount === 1 ? '' : 's'} waiting on someone else.`
    );
  }
  if (insights.highRiskCount > 0) {
    lines.push(
      `${insights.highRiskCount} high-risk loop${insights.highRiskCount === 1 ? '' : 's'} may need attention.`
    );
  }
  if (insights.oldestOpenDays > 0 && insights.oldestOpenTitle) {
    lines.push(
      `Your oldest open loop has been open for ${insights.oldestOpenDays} day${insights.oldestOpenDays === 1 ? '' : 's'}.`
    );
  }
  if (insights.closedThisWeek > 0) {
    lines.push(
      `You closed ${insights.closedThisWeek} loop${insights.closedThisWeek === 1 ? '' : 's'} this week.`
    );
  }
  if (insights.overdueCount > 0) {
    lines.push(
      `${insights.overdueCount} loop${insights.overdueCount === 1 ? ' is' : 's are'} past due.`
    );
  }
  if (insights.decisionsNeededCount > 0) {
    lines.push(
      `${insights.decisionsNeededCount} decision${insights.decisionsNeededCount === 1 ? '' : 's'} still need resolution.`
    );
  }
  if (lines.length === 0) {
    lines.push('Your open-loop picture looks calm — capture anything new before it slips.');
  }
  return lines.slice(0, 4);
}
