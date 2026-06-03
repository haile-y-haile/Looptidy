import type { OpenLoop, ScopeChange, ScopeChangeStatus } from '../types';
import { generateId } from './utils';

export function getOpenScopeChanges(items: ScopeChange[]): ScopeChange[] {
  return items.filter((s) => s.status !== 'resolved' && s.status !== 'rejected');
}

export function getHighImpactScopeChanges(items: ScopeChange[]): ScopeChange[] {
  return items.filter(
    (s) =>
      (s.impact === 'high' || s.impact === 'medium') &&
      s.status !== 'resolved' &&
      s.status !== 'rejected'
  );
}

export function getScopeChangesByStatus(
  items: ScopeChange[],
  status: ScopeChangeStatus
): ScopeChange[] {
  return items.filter((s) => s.status === status);
}

export interface ScopeChangeSummary {
  total: number;
  open: number;
  underReview: number;
  highImpact: number;
  captured: number;
}

export function getScopeChangeSummary(items: ScopeChange[]): ScopeChangeSummary {
  return {
    total: items.length,
    open: getOpenScopeChanges(items).length,
    underReview: getScopeChangesByStatus(items, 'under_review').length,
    highImpact: getHighImpactScopeChanges(items).length,
    captured: getScopeChangesByStatus(items, 'captured').length,
  };
}

export function buildScopeSummaryText(item: ScopeChange): string {
  return [
    `Scope change: ${item.title}.`,
    item.requestedBy ? `Requested by: ${item.requestedBy}.` : '',
    `Impact: ${item.impact}.`,
    item.deadlineImpact ? `Timeline impact: ${item.deadlineImpact}.` : '',
    item.decision ? `Recommendation: ${item.decision}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function convertScopeChangeToLoop(
  item: ScopeChange
): Omit<OpenLoop, 'id' | 'createdAt' | 'updatedAt' | 'timeline'> {
  return {
    title: item.title,
    description: [item.description, item.reason, item.decision].filter(Boolean).join('\n\n'),
    type: 'blocked',
    status: 'open',
    priority: item.priority,
    riskLevel: item.riskLevel,
    category: 'work',
    owner: { id: 'me', name: 'You' },
    waitingOn: item.requestedBy
      ? { id: generateId(), name: item.requestedBy }
      : undefined,
    decisions: [],
    attachments: [],
  };
}

export const SCOPE_CHANGE_TYPE_LABELS: Record<ScopeChange['changeType'], string> = {
  new_request: 'New request',
  requirement_change: 'Requirement change',
  timeline_change: 'Timeline change',
  priority_change: 'Priority change',
  resource_change: 'Resource change',
  decision_change: 'Decision change',
  blocker_added: 'Blocker added',
  other: 'Other',
};

function buildScopeSearchHaystack(item: ScopeChange): string {
  return [
    item.title,
    item.description ?? '',
    item.requestedBy ?? '',
    item.owner ?? '',
    item.source ?? '',
    item.reason ?? '',
    item.decision ?? '',
    item.deadlineImpact ?? '',
    item.costImpact ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

export function filterScopeChangesByQuery(items: ScopeChange[], query: string): ScopeChange[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => buildScopeSearchHaystack(item).includes(q));
}

export const SCOPE_STATUS_LABELS: Record<ScopeChangeStatus, string> = {
  captured: 'Captured',
  under_review: 'Under review',
  accepted: 'Accepted',
  parked: 'Parked',
  rejected: 'Rejected',
  converted_to_loop: 'Converted to loop',
  resolved: 'Resolved',
};
