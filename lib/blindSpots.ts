import type { OpenLoop } from '../types';
import { formatRelativeDate, isDueSoon, isOpenLoop, isOverdue } from './utils';

export type BlindSpotRiskLabel =
  | 'Low friction'
  | 'Needs attention'
  | 'Getting stale'
  | 'At risk'
  | 'Likely to slip';

export type BlindSpotReasonType =
  | 'overdue_promise'
  | 'waiting_stale'
  | 'high_risk_no_next_action'
  | 'blocked_unclear_owner'
  | 'decision_aging'
  | 'due_soon_untouched'
  | 'deferred'
  | 'person_cluster'
  | 'vague_title'
  | 'high_priority_no_due_date'
  | 'old_open_loop';

export type BlindSpotAction =
  | 'Nudge'
  | 'Add due date'
  | 'Add owner'
  | 'Mark waiting'
  | 'Escalate'
  | 'Close'
  | 'Defer with reason'
  | 'Convert to decision'
  | 'Add next action';

export interface BlindSpotReason {
  type: BlindSpotReasonType;
  label: string;
  score: number;
}

export interface BlindSpot {
  loop: OpenLoop;
  score: number;
  riskLabel: BlindSpotRiskLabel;
  reasons: BlindSpotReason[];
  suggestedNextAction: BlindSpotAction;
}

const DAY_MS = 86_400_000;
const VAGUE_TITLE_RE = /\b(follow up|check on this|circle back|touch base|ask about|pending|todo|misc|stuff)\b/i;

function daysSince(dateString?: string): number {
  if (!dateString) return 0;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY_MS));
}

function daysUntil(dateString?: string): number | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / DAY_MS);
}

function latestActivityAt(loop: OpenLoop): string {
  const timelineLatest = loop.timeline.reduce<string | undefined>((latest, event) => {
    if (!latest) return event.timestamp;
    return new Date(event.timestamp).getTime() > new Date(latest).getTime()
      ? event.timestamp
      : latest;
  }, undefined);
  return loop.lastFollowUpAt ?? timelineLatest ?? loop.updatedAt ?? loop.createdAt;
}

function hasOwnerSignal(loop: OpenLoop): boolean {
  return Boolean(
    loop.waitingOn?.name ||
      loop.promisedTo?.name ||
      loop.accountableOwner?.name ||
      loop.nextActionOwner?.name
  );
}

function hasNextActionSignal(loop: OpenLoop): boolean {
  return Boolean(
    loop.nextActionOwner?.name ||
      loop.nextCheckInAt ||
      loop.accountabilityNotes?.trim() ||
      loop.decisions.some((decision) => decision.nextAction?.trim())
  );
}

function personKeys(loop: OpenLoop): string[] {
  return [
    loop.waitingOn?.name,
    loop.promisedTo?.name,
    loop.accountableOwner?.name,
    loop.nextActionOwner?.name,
  ]
    .filter((name): name is string => Boolean(name?.trim()))
    .map((name) => name.trim().toLowerCase());
}

function buildPersonCounts(loops: OpenLoop[]): Record<string, number> {
  return loops.filter(isOpenLoop).reduce<Record<string, number>>((acc, loop) => {
    new Set(personKeys(loop)).forEach((key) => {
      acc[key] = (acc[key] ?? 0) + 1;
    });
    return acc;
  }, {});
}

function addReason(reasons: BlindSpotReason[], reason: BlindSpotReason) {
  if (!reasons.some((r) => r.type === reason.type)) reasons.push(reason);
}

export function getBlindSpotRiskLabel(score: number): BlindSpotRiskLabel {
  if (score >= 160) return 'Likely to slip';
  if (score >= 115) return 'At risk';
  if (score >= 75) return 'Getting stale';
  if (score >= 40) return 'Needs attention';
  return 'Low friction';
}

export function getBlindSpotReasons(loop: OpenLoop, allLoops: OpenLoop[]): BlindSpotReason[] {
  const reasons: BlindSpotReason[] = [];
  if (!isOpenLoop(loop)) return reasons;

  const ageDays = daysSince(loop.createdAt);
  const quietDays = daysSince(latestActivityAt(loop));
  const followUpDays = loop.lastFollowUpAt ? daysSince(loop.lastFollowUpAt) : ageDays;
  const dueInDays = daysUntil(loop.dueDate);
  const personCounts = buildPersonCounts(allLoops);
  const maxPersonCount = Math.max(0, ...personKeys(loop).map((key) => personCounts[key] ?? 0));

  if (loop.type === 'promised_by_me' && loop.dueDate && isOverdue(loop.dueDate)) {
    const overdueDays = Math.max(1, Math.abs(dueInDays ?? 1));
    addReason(reasons, {
      type: 'overdue_promise',
      label: `Promised item is overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}.`,
      score: 75,
    });
  }

  if (loop.type === 'waiting_on_others' && followUpDays >= 5) {
    const person = loop.waitingOn?.name ? ` on ${loop.waitingOn.name}` : '';
    addReason(reasons, {
      type: 'waiting_stale',
      label: `No follow-up${person} in ${followUpDays} days.`,
      score: Math.min(70, 30 + followUpDays * 4),
    });
  }

  if ((loop.riskLevel === 'high' || loop.riskLevel === 'medium') && !hasNextActionSignal(loop)) {
    addReason(reasons, {
      type: 'high_risk_no_next_action',
      label: `${loop.riskLevel === 'high' ? 'High' : 'Medium'} risk, but no next action is set.`,
      score: loop.riskLevel === 'high' ? 65 : 40,
    });
  }

  if ((loop.type === 'blocked' || loop.status === 'blocked') && !hasOwnerSignal(loop)) {
    addReason(reasons, {
      type: 'blocked_unclear_owner',
      label: 'Blocked, but the owner or unblocker is unclear.',
      score: 65,
    });
  }

  if (loop.type === 'decision_needed' && ageDays >= 7) {
    addReason(reasons, {
      type: 'decision_aging',
      label: `Decision has been open for ${ageDays} days.`,
      score: Math.min(75, 30 + ageDays * 3),
    });
  }

  if (loop.dueDate && isDueSoon(loop.dueDate, 2) && quietDays >= 3) {
    addReason(reasons, {
      type: 'due_soon_untouched',
      label: `Due ${formatRelativeDate(loop.dueDate)}, but no update in ${quietDays} days.`,
      score: 55,
    });
  }

  if (loop.snoozedUntil && new Date(loop.snoozedUntil).getTime() > Date.now()) {
    addReason(reasons, {
      type: 'deferred',
      label: `Deferred until ${formatRelativeDate(loop.snoozedUntil)}.`,
      score: 25,
    });
  }

  if (maxPersonCount >= 3) {
    addReason(reasons, {
      type: 'person_cluster',
      label: `Same person is tied to ${maxPersonCount} unresolved loops.`,
      score: 35 + maxPersonCount * 5,
    });
  }

  if (VAGUE_TITLE_RE.test(loop.title)) {
    addReason(reasons, {
      type: 'vague_title',
      label: 'Title is vague enough to hide the real next step.',
      score: 25,
    });
  }

  if ((loop.priority === 'high' || loop.priority === 'urgent') && !loop.dueDate) {
    addReason(reasons, {
      type: 'high_priority_no_due_date',
      label: `${loop.priority === 'urgent' ? 'Urgent' : 'High priority'}, but no due date.`,
      score: loop.priority === 'urgent' ? 55 : 40,
    });
  }

  if (ageDays >= 21) {
    addReason(reasons, {
      type: 'old_open_loop',
      label: `Open longer than usual (${ageDays} days).`,
      score: Math.min(60, 20 + Math.floor(ageDays / 2)),
    });
  }

  return reasons.sort((a, b) => b.score - a.score);
}

export function getSuggestedBlindSpotAction(reasons: BlindSpotReason[], loop: OpenLoop): BlindSpotAction {
  const primary = reasons[0]?.type;
  switch (primary) {
    case 'overdue_promise':
    case 'waiting_stale':
    case 'person_cluster':
      return 'Nudge';
    case 'blocked_unclear_owner':
      return 'Add owner';
    case 'decision_aging':
      return 'Convert to decision';
    case 'due_soon_untouched':
    case 'vague_title':
      return 'Add next action';
    case 'deferred':
      return 'Defer with reason';
    case 'high_priority_no_due_date':
      return 'Add due date';
    case 'high_risk_no_next_action':
    case 'old_open_loop':
      return loop.status === 'blocked' ? 'Escalate' : 'Add next action';
    default:
      return loop.type === 'waiting_on_others' ? 'Nudge' : 'Add next action';
  }
}

export function getBlindSpotActions(loop: OpenLoop): BlindSpotAction[] {
  const actions: BlindSpotAction[] = ['Nudge', 'Add next action', 'Close'];
  if (!loop.dueDate) actions.splice(1, 0, 'Add due date');
  if (!loop.waitingOn && loop.type !== 'waiting_on_others') actions.push('Mark waiting');
  if (!loop.nextActionOwner && !loop.accountableOwner) actions.push('Add owner');
  if (loop.type !== 'decision_needed') actions.push('Convert to decision');
  actions.push('Escalate', 'Defer with reason');
  return Array.from(new Set(actions));
}

export function scoreBlindSpot(loop: OpenLoop, allLoops: OpenLoop[]): number {
  if (!isOpenLoop(loop)) return 0;
  const reasonScore = getBlindSpotReasons(loop, allLoops).reduce((sum, reason) => sum + reason.score, 0);
  const priorityScore = loop.priority === 'urgent' ? 35 : loop.priority === 'high' ? 20 : 0;
  const riskScore = loop.riskLevel === 'high' ? 30 : loop.riskLevel === 'medium' ? 14 : 0;
  return reasonScore + priorityScore + riskScore;
}

export function getBlindSpots(loops: OpenLoop[], limit?: number): BlindSpot[] {
  const open = loops.filter(isOpenLoop);
  const spots = open
    .map((loop) => {
      const reasons = getBlindSpotReasons(loop, open);
      const score = scoreBlindSpot(loop, open);
      return {
        loop,
        score,
        riskLabel: getBlindSpotRiskLabel(score),
        reasons,
        suggestedNextAction: getSuggestedBlindSpotAction(reasons, loop),
      };
    })
    .filter((spot) => spot.score >= 25 || spot.reasons.length > 0)
    .sort((a, b) => b.score - a.score);

  return typeof limit === 'number' ? spots.slice(0, limit) : spots;
}

export function getBlindSpotSummary(loops: OpenLoop[]) {
  const spots = getBlindSpots(loops);
  return {
    total: spots.length,
    likelyToSlip: spots.filter((s) => s.riskLabel === 'Likely to slip').length,
    atRisk: spots.filter((s) => s.riskLabel === 'At risk').length,
    stale: spots.filter((s) => s.riskLabel === 'Getting stale').length,
    needsAttention: spots.filter((s) => s.riskLabel === 'Needs attention').length,
  };
}
