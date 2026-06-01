import type { FeedbackItem, LoopTidyBackup, OpenLoop, ScopeChange, WeeklyReview } from '../types';
import { BACKUP_FORMAT_VERSION } from '../types';
import { flattenDecisions } from './decisions';
import { isOpenLoop } from './utils';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function rowsToCsv(headers: string[], rows: string[][]): string {
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(row.map((c) => csvEscape(c ?? '')).join(','));
  }
  return lines.join('\n');
}

export function buildFullBackup(
  loops: OpenLoop[],
  weeklyReviews: WeeklyReview[],
  scopeChanges: ScopeChange[] = [],
  feedbackItems: FeedbackItem[] = []
): LoopTidyBackup {
  return {
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    loops,
    weeklyReviews,
    scopeChanges,
    feedbackItems,
  };
}

export function backupToJson(backup: LoopTidyBackup): string {
  return JSON.stringify(backup, null, 2);
}

export function openLoopsToCsv(loops: OpenLoop[]): string {
  const headers = [
    'id',
    'title',
    'type',
    'status',
    'priority',
    'riskLevel',
    'category',
    'dueDate',
    'waitingOn',
    'promisedTo',
    'accountableOwner',
    'nextActionOwner',
    'accountabilityStatus',
    'escalationLevel',
    'createdAt',
    'updatedAt',
  ];
  const rows = loops.filter(isOpenLoop).map((l) => [
    l.id,
    l.title,
    l.type,
    l.status,
    l.priority,
    l.riskLevel,
    l.category,
    l.dueDate ?? '',
    l.waitingOn?.name ?? '',
    l.promisedTo?.name ?? '',
    l.accountableOwner?.name ?? '',
    l.nextActionOwner?.name ?? '',
    l.accountabilityStatus ?? '',
    l.escalationLevel ?? '',
    l.createdAt,
    l.updatedAt,
  ]);
  return rowsToCsv(headers, rows.map((r) => r.map(String)));
}

export function decisionsToCsv(loops: OpenLoop[]): string {
  const headers = [
    'decisionId',
    'loopId',
    'loopTitle',
    'title',
    'status',
    'finalDecision',
    'rationale',
    'impact',
    'nextAction',
    'riskLevel',
    'decidedAt',
    'revisitAt',
  ];
  const rows = flattenDecisions(loops).map((d) => [
    d.id,
    d.loopId,
    d.loopTitle,
    d.title,
    d.status,
    d.finalDecision ?? '',
    d.rationale ?? '',
    d.impact ?? '',
    d.nextAction ?? '',
    d.riskLevel,
    d.decidedAt ?? '',
    d.revisitAt ?? '',
  ]);
  return rowsToCsv(headers, rows.map((r) => r.map(String)));
}

export function scopeChangesToCsv(items: ScopeChange[]): string {
  const headers = ['id', 'title', 'status', 'changeType', 'impact', 'requestedBy', 'decision', 'loopId'];
  const rows = items.map((s) => [
    s.id,
    s.title,
    s.status,
    s.changeType,
    s.impact,
    s.requestedBy ?? '',
    s.decision ?? '',
    s.loopId ?? '',
  ]);
  return rowsToCsv(headers, rows.map((r) => r.map(String)));
}

export function scopeChangesToJson(items: ScopeChange[]): string {
  return JSON.stringify(items, null, 2);
}

export function feedbackToCsv(items: FeedbackItem[]): string {
  const headers = ['id', 'title', 'source', 'urgency', 'status', 'theme', 'summary'];
  const rows = items.map((f) => [
    f.id,
    f.title,
    f.source,
    f.urgency,
    f.status,
    f.theme ?? '',
    f.summary,
  ]);
  return rowsToCsv(headers, rows.map((r) => r.map(String)));
}

export function feedbackToJson(items: FeedbackItem[]): string {
  return JSON.stringify(items, null, 2);
}

export function weeklyReviewsToCsv(reviews: WeeklyReview[]): string {
  const headers = [
    'id',
    'startedAt',
    'completedAt',
    'reviewedCount',
    'closedCount',
    'notes',
    'createdAt',
  ];
  const rows = reviews.map((r) => [
    r.id,
    r.startedAt,
    r.completedAt ?? '',
    String(r.reviewedLoopIds.length),
    String(r.closedLoopIds.length),
    r.notes,
    r.createdAt,
  ]);
  return rowsToCsv(headers, rows.map((r) => r.map(String)));
}

export function weeklyReviewsToJson(reviews: WeeklyReview[]): string {
  return JSON.stringify(reviews, null, 2);
}
