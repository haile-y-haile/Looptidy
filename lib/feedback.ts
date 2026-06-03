import type { FeedbackItem, FeedbackStatus, OpenLoop } from '../types';
import { createDecisionInput } from './decisions';
import { generateId } from './utils';

export function getUntriagedFeedback(items: FeedbackItem[]): FeedbackItem[] {
  return items.filter((f) => f.status === 'captured');
}

export function getHighUrgencyFeedback(items: FeedbackItem[]): FeedbackItem[] {
  return items.filter(
    (f) =>
      (f.urgency === 'high' || f.urgency === 'urgent') &&
      f.status !== 'archived' &&
      !f.resolvedAt
  );
}

export interface FeedbackSummary {
  total: number;
  untriaged: number;
  highUrgency: number;
  linkedLoops: number;
  converted: number;
}

export function getFeedbackSummary(items: FeedbackItem[]): FeedbackSummary {
  return {
    total: items.length,
    untriaged: getUntriagedFeedback(items).length,
    highUrgency: getHighUrgencyFeedback(items).length,
    linkedLoops: items.filter((f) => f.linkedLoopIds.length > 0).length,
    converted: items.filter(
      (f) => f.status === 'converted_to_loop' || f.status === 'converted_to_decision'
    ).length,
  };
}

export function getFeedbackThemes(items: FeedbackItem[]): { theme: string; count: number }[] {
  const map = new Map<string, number>();
  for (const f of items) {
    const theme = f.theme?.trim() || 'Unthemed';
    map.set(theme, (map.get(theme) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count);
}

export function buildFeedbackSummaryText(item: FeedbackItem): string {
  const source = item.sourcePerson
    ? `${item.sourcePerson} (${item.source})`
    : item.source;
  return [
    `Feedback: ${item.summary || item.title}.`,
    `Source: ${source}.`,
    item.theme ? `Theme: ${item.theme}.` : '',
    item.suggestedAction ? `Suggested action: ${item.suggestedAction}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function convertFeedbackToLoop(
  item: FeedbackItem
): Omit<OpenLoop, 'id' | 'createdAt' | 'updatedAt' | 'timeline'> {
  return {
    title: item.title,
    description: item.summary,
    type: 'follow_up',
    status: 'open',
    priority: item.urgency === 'urgent' ? 'urgent' : item.urgency === 'high' ? 'high' : 'medium',
    riskLevel: 'medium',
    category: 'work',
    owner: { id: 'me', name: 'You' },
    decisions: [],
    attachments: [],
  };
}

function buildFeedbackSearchHaystack(item: FeedbackItem): string {
  return [
    item.title,
    item.summary ?? '',
    item.source,
    item.sourcePerson ?? '',
    item.category ?? '',
    item.theme ?? '',
    item.tags.join(' '),
    item.suggestedAction ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

export function filterFeedbackByQuery(items: FeedbackItem[], query: string): FeedbackItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => buildFeedbackSearchHaystack(item).includes(q));
}

export const FEEDBACK_SOURCE_LABELS: Record<FeedbackItem['source'], string> = {
  customer: 'Customer',
  stakeholder: 'Stakeholder',
  teammate: 'Teammate',
  manager: 'Manager',
  vendor: 'Vendor',
  user_research: 'User research',
  meeting: 'Meeting',
  support: 'Support',
  personal_observation: 'Personal observation',
  other: 'Other',
};
