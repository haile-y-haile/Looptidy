import type {
  LoopStatus,
  LoopType,
  OpenLoop,
  Priority,
  RiskLevel,
  Category,
} from '../types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return formatDate(dateString);
}

export function isDueSoon(dueDate: string, days = 7): boolean {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
}

export function isOverdue(dueDate: string): boolean {
  const due = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < now;
}

export function isOpenLoop(loop: OpenLoop): boolean {
  return !['closed', 'archived'].includes(loop.status);
}

export const loopTypeLabels: Record<LoopType, string> = {
  waiting_on_others: 'Waiting on Others',
  promised_by_me: 'Promised by Me',
  decision_needed: 'Decision Needed',
  blocked: 'Blocked',
  follow_up: 'Follow Up',
  due: 'Due',
};

export const loopStatusLabels: Record<LoopStatus, string> = {
  open: 'Open',
  waiting: 'Waiting',
  blocked: 'Blocked',
  decided: 'Decided',
  closed: 'Closed',
  archived: 'Archived',
};

export const priorityLabels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const riskLevelLabels: Record<RiskLevel, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const categoryLabels: Record<Category, string> = {
  work: 'Work',
  personal: 'Personal',
  finance: 'Finance',
  health: 'Health',
  home: 'Home',
  other: 'Other',
};

export function getLoopTypeColor(type: LoopType): string {
  const map: Record<LoopType, string> = {
    waiting_on_others: '#7C3AED',
    promised_by_me: '#0D9488',
    decision_needed: '#D97706',
    blocked: '#DC2626',
    follow_up: '#059669',
    due: '#6366F1',
  };
  return map[type];
}

export function getPriorityColor(priority: Priority): string {
  const map: Record<Priority, string> = {
    low: '#94A3B8',
    medium: '#6366F1',
    high: '#D97706',
    urgent: '#DC2626',
  };
  return map[priority];
}

export function getRiskColor(risk: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    none: '#667085',
    low: '#12B76A',
    medium: '#F79009',
    high: '#F04438',
  };
  return map[risk];
}
