import type { OpenLoop } from '../types';
import { filterLoopsByQuery } from './loopSearch';
import {
  getLoopsForCommandFilter,
  type CommandCenterFilter,
} from './loopFilters';
import { isOpenLoop, isOverdue } from './utils';
import {
  getEffectiveReminderTime,
  isReminderDueToday,
  isReminderOverdue,
  isReminderSnoozed,
} from './reminders';

export type CommandCenterSort =
  | 'urgent'
  | 'due_date'
  | 'recent'
  | 'oldest'
  | 'risk';

export const COMMAND_CENTER_FILTERS: { key: CommandCenterFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'promised', label: 'Promised' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'decisions', label: 'Decisions' },
  { key: 'due', label: 'Due' },
  { key: 'high_risk', label: 'High Risk' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'closed', label: 'Closed' },
  { key: 'ownership_unclear', label: 'Owner unclear' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'decision_needed', label: 'Decision needed' },
  { key: 'scope_change', label: 'Scope change' },
  { key: 'feedback', label: 'Feedback' },
];

export const COMMAND_CENTER_SORTS: { key: CommandCenterSort; label: string }[] = [
  { key: 'urgent', label: 'Most urgent' },
  { key: 'due_date', label: 'Due date' },
  { key: 'recent', label: 'Recently updated' },
  { key: 'oldest', label: 'Oldest open' },
  { key: 'risk', label: 'Highest risk' },
];

export function isCommandCenterFilter(value: string | undefined): value is CommandCenterFilter {
  return COMMAND_CENTER_FILTERS.some((f) => f.key === value);
}

export function isCommandCenterSort(value: string | undefined): value is CommandCenterSort {
  return COMMAND_CENTER_SORTS.some((s) => s.key === value);
}

function urgencyScore(loop: OpenLoop): number {
  let s = 0;
  if (loop.dueDate && isOverdue(loop.dueDate)) s += 120;
  if (loop.dueDate) {
    const due = new Date(loop.dueDate).getTime();
    const days = (due - Date.now()) / (1000 * 60 * 60 * 24);
    if (days >= 0 && days <= 3) s += 80;
  }
  if (isReminderOverdue(loop)) s += 90;
  if (loop.priority === 'urgent') s += 70;
  if (loop.priority === 'high') s += 40;
  if (loop.riskLevel === 'high') s += 60;
  if (loop.riskLevel === 'medium') s += 25;
  if (loop.status === 'blocked') s += 35;
  if (isReminderSnoozed(loop)) s -= 30;
  return s;
}

function riskScore(loop: OpenLoop): number {
  const map = { none: 0, low: 1, medium: 2, high: 3 } as const;
  return map[loop.riskLevel];
}

function dueTimestamp(loop: OpenLoop): number {
  const due = loop.dueDate ? new Date(loop.dueDate).getTime() : NaN;
  const reminder = getEffectiveReminderTime(loop);
  const rem = reminder ? new Date(reminder).getTime() : NaN;
  if (!Number.isNaN(due) && !Number.isNaN(rem)) return Math.min(due, rem);
  if (!Number.isNaN(due)) return due;
  if (!Number.isNaN(rem)) return rem;
  return Number.POSITIVE_INFINITY;
}

export function sortLoops(loops: OpenLoop[], sort: CommandCenterSort): OpenLoop[] {
  const copy = [...loops];
  switch (sort) {
    case 'due_date':
      return copy.sort((a, b) => dueTimestamp(a) - dueTimestamp(b));
    case 'recent':
      return copy.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    case 'oldest':
      return copy
        .filter(isOpenLoop)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .concat(copy.filter((l) => !isOpenLoop(l)));
    case 'risk':
      return copy.sort((a, b) => riskScore(b) - riskScore(a));
    case 'urgent':
    default:
      return copy.sort((a, b) => urgencyScore(b) - urgencyScore(a));
  }
}

export function queryCommandCenter(
  loops: OpenLoop[],
  options: {
    filter: CommandCenterFilter;
    sort: CommandCenterSort;
    query: string;
    reminderFilter?: 'due_today' | 'upcoming' | 'snoozed' | 'overdue' | null;
  }
): OpenLoop[] {
  let result = getLoopsForCommandFilter(loops, options.filter);
  result = filterLoopsByQuery(result, options.query);

  if (options.reminderFilter) {
    result = result.filter((loop) => {
      switch (options.reminderFilter) {
        case 'due_today':
          return isReminderDueToday(loop);
        case 'snoozed':
          return isReminderSnoozed(loop);
        case 'overdue':
          return isReminderOverdue(loop);
        case 'upcoming': {
          const at = getEffectiveReminderTime(loop);
          if (!loop.reminderEnabled || !at || isReminderSnoozed(loop)) return false;
          const t = new Date(at).getTime();
          return !Number.isNaN(t) && t > Date.now();
        }
        default:
          return true;
      }
    });
  }

  return sortLoops(result, options.sort);
}

export function getCommandCenterEmptyState(
  filter: CommandCenterFilter,
  hasQuery: boolean
): { title: string; message: string } {
  if (hasQuery) {
    return {
      title: 'No matches',
      message: 'Try different keywords or clear filters to see more open loops.',
    };
  }
  const map: Partial<Record<CommandCenterFilter, { title: string; message: string }>> = {
    waiting: {
      title: 'Nothing waiting',
      message: 'Open loops where you are waiting on someone else will appear here.',
    },
    promised: {
      title: 'No open promises',
      message: 'Commitments you have made will show here until you close them.',
    },
    blocked: {
      title: 'Nothing blocked',
      message: 'Blocked loops and dependencies will appear here.',
    },
    decisions: {
      title: 'No decisions pending',
      message: 'Unresolved decision loops will appear here.',
    },
    due: {
      title: 'Nothing due',
      message: 'Loops with due dates or due-type loops will appear here.',
    },
    high_risk: {
      title: 'No high-risk loops',
      message: 'Loops marked high risk will appear here.',
    },
    overdue: {
      title: 'Nothing overdue',
      message: 'Overdue due dates and reminders will appear here.',
    },
    closed: {
      title: 'No closed loops',
      message: 'Loops you close are kept here for reference.',
    },
    ownership_unclear: {
      title: 'Ownership is clear',
      message: 'Loops with unclear accountability will appear here.',
    },
    escalated: {
      title: 'Nothing escalated',
      message: 'Escalated accountability issues will show here.',
    },
    decision_needed: {
      title: 'No decisions needed',
      message: 'Open decision loops and pending decision records appear here.',
    },
    scope_change: {
      title: 'No scope changes',
      message: 'Capture scope changes in Scope Guard to review them here.',
    },
    feedback: {
      title: 'No feedback',
      message: 'Captured feedback items will appear here when you filter or search.',
    },
  };
  return (
    map[filter] ?? {
      title: 'No open loops',
      message: 'Capture a new loop to start tracking follow-ups and commitments.',
    }
  );
}
