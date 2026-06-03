import type { OpenLoop, WeeklyReview } from '../types';
import { isOpenLoop, isOverdue } from './utils';
import { generateId } from './utils';

export type ReviewSectionKey =
  | 'overdue'
  | 'waiting'
  | 'promised'
  | 'blocked'
  | 'decisions'
  | 'high_risk'
  | 'closed_week';

export type GuidedReviewStepId =
  | 'overdue'
  | 'waiting'
  | 'promised'
  | 'blocked'
  | 'decisions'
  | 'close';

export interface ReviewSection {
  key: ReviewSectionKey;
  title: string;
  description: string;
}

export interface GuidedReviewStep {
  id: GuidedReviewStepId;
  title: string;
  subtitle: string;
}

export const REVIEW_SECTIONS: ReviewSection[] = [
  {
    key: 'overdue',
    title: 'Overdue Loops',
    description: 'Past due — decide to nudge, snooze, or close.',
  },
  {
    key: 'waiting',
    title: 'Waiting on Others',
    description: 'The ball is in someone else’s court.',
  },
  {
    key: 'promised',
    title: 'Promised by Me',
    description: 'Commitments you made that are still open.',
  },
  {
    key: 'blocked',
    title: 'Blocked Items',
    description: 'Work that cannot move until something clears.',
  },
  {
    key: 'decisions',
    title: 'Decisions Needed',
    description: 'Unresolved choices that need an outcome.',
  },
  {
    key: 'high_risk',
    title: 'High Risk Loops',
    description: 'Loops flagged high risk — worth extra attention.',
  },
  {
    key: 'closed_week',
    title: 'Closed This Week',
    description: 'Loops you closed in the last 7 days.',
  },
];

export const GUIDED_REVIEW_STEPS: GuidedReviewStep[] = [
  { id: 'overdue', title: 'What is overdue?', subtitle: 'Triage past-due follow-ups.' },
  { id: 'waiting', title: 'Who am I waiting on?', subtitle: 'Send nudges or reset expectations.' },
  { id: 'promised', title: 'What did I promise?', subtitle: 'Honor commitments or renegotiate.' },
  { id: 'blocked', title: 'What is blocked?', subtitle: 'Unblock or escalate dependencies.' },
  { id: 'decisions', title: 'What needs a decision?', subtitle: 'Capture rationale and outcomes.' },
  { id: 'close', title: 'What can I close?', subtitle: 'Clear loops that no longer matter.' },
];

function startOfWeek(d = new Date()): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function closedThisWeek(loops: OpenLoop[]): OpenLoop[] {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return loops.filter((l) => {
    if (!l.closedAt) return false;
    return new Date(l.closedAt) >= weekAgo;
  });
}

export function getLoopsForReviewSection(loops: OpenLoop[], key: ReviewSectionKey): OpenLoop[] {
  const open = loops.filter(isOpenLoop);
  switch (key) {
    case 'overdue':
      return open.filter((l) => l.dueDate && isOverdue(l.dueDate));
    case 'waiting':
      return open.filter((l) => l.type === 'waiting_on_others');
    case 'promised':
      return open.filter((l) => l.type === 'promised_by_me');
    case 'blocked':
      return open.filter((l) => l.type === 'blocked' || l.status === 'blocked');
    case 'decisions':
      return open.filter(
        (l) => l.type === 'decision_needed' && l.status !== 'decided'
      );
    case 'high_risk':
      return open.filter((l) => l.riskLevel === 'high');
    case 'closed_week':
      return closedThisWeek(loops);
    default:
      return [];
  }
}

export function getLoopsForGuidedStep(loops: OpenLoop[], stepId: GuidedReviewStepId): OpenLoop[] {
  const open = loops.filter(isOpenLoop);
  switch (stepId) {
    case 'overdue':
      return getLoopsForReviewSection(loops, 'overdue');
    case 'waiting':
      return getLoopsForReviewSection(loops, 'waiting');
    case 'promised':
      return getLoopsForReviewSection(loops, 'promised');
    case 'blocked':
      return getLoopsForReviewSection(loops, 'blocked');
    case 'decisions':
      return getLoopsForReviewSection(loops, 'decisions');
    case 'close':
      return open.filter(
        (l) =>
          l.priority === 'low' &&
          l.riskLevel !== 'high' &&
          !(l.dueDate && isOverdue(l.dueDate))
      );
    default:
      return [];
  }
}

export function createWeeklyReviewRecord(partial: {
  startedAt: string;
  reviewedLoopIds: string[];
  closedLoopIds: string[];
  notes: string;
}): WeeklyReview {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    startedAt: partial.startedAt,
    completedAt: now,
    reviewedLoopIds: partial.reviewedLoopIds,
    closedLoopIds: partial.closedLoopIds,
    notes: partial.notes,
    createdAt: now,
  };
}

export function getReviewSummary(loops: OpenLoop[]) {
  const open = loops.filter(isOpenLoop);
  return {
    openCount: open.length,
    overdue: getLoopsForReviewSection(loops, 'overdue').length,
    waiting: getLoopsForReviewSection(loops, 'waiting').length,
    promised: getLoopsForReviewSection(loops, 'promised').length,
    blocked: getLoopsForReviewSection(loops, 'blocked').length,
    decisions: getLoopsForReviewSection(loops, 'decisions').length,
    highRisk: getLoopsForReviewSection(loops, 'high_risk').length,
    closedWeek: closedThisWeek(loops).length,
    weekStart: startOfWeek().toISOString(),
  };
}
