import type { OpenLoop } from '../types';
import { isOpenLoop } from './utils';

export type LoopListFilter = 'all' | 'waiting' | 'promised' | 'blocked' | 'due' | 'closed';

export const LOOP_LIST_FILTERS: { key: LoopListFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'promised', label: 'Promised' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'due', label: 'Due' },
  { key: 'closed', label: 'Closed' },
];

export function isLoopListFilter(value: string | undefined): value is LoopListFilter {
  return LOOP_LIST_FILTERS.some((f) => f.key === value);
}

export function getLoopsForFilter(loops: OpenLoop[], filter: LoopListFilter): OpenLoop[] {
  switch (filter) {
    case 'waiting':
      return loops.filter((l) => isOpenLoop(l) && l.type === 'waiting_on_others');
    case 'promised':
      return loops.filter((l) => isOpenLoop(l) && l.type === 'promised_by_me');
    case 'blocked':
      return loops.filter(
        (l) => isOpenLoop(l) && (l.type === 'blocked' || l.status === 'blocked')
      );
    case 'due':
      return loops.filter(
        (l) => isOpenLoop(l) && (l.type === 'due' || Boolean(l.dueDate))
      );
    case 'closed':
      return loops.filter((l) => l.status === 'closed' || l.status === 'archived');
    case 'all':
    default:
      return loops.filter(isOpenLoop);
  }
}

export function getLoopFilterLabel(filter: LoopListFilter): string {
  return LOOP_LIST_FILTERS.find((f) => f.key === filter)?.label ?? 'All';
}

export function getEmptyStateForFilter(filter: LoopListFilter): { title: string; message: string } {
  switch (filter) {
    case 'waiting':
      return {
        title: 'Nothing waiting',
        message: 'Loops where you are waiting on someone else will appear here.',
      };
    case 'promised':
      return {
        title: 'No open promises',
        message: 'Commitments you have made will show up here until they are done.',
      };
    case 'blocked':
      return {
        title: 'Nothing blocked',
        message: 'Blocked loops and dependencies will appear here.',
      };
    case 'due':
      return {
        title: 'Nothing due',
        message: 'Loops with due dates or due type will appear here.',
      };
    case 'closed':
      return {
        title: 'No closed loops',
        message: 'Loops you close will be listed here for reference.',
      };
    case 'all':
    default:
      return {
        title: 'No open loops',
        message: 'Create a new loop to start tracking follow-ups and promises.',
      };
  }
}
