import type { LoopTidyBackup, OpenLoop, WeeklyReview } from '../types';
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

export function buildFullBackup(loops: OpenLoop[], weeklyReviews: WeeklyReview[]): LoopTidyBackup {
  return {
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    loops,
    weeklyReviews,
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
    d.riskLevel,
    d.decidedAt ?? '',
    d.revisitAt ?? '',
  ]);
  return rowsToCsv(headers, rows.map((r) => r.map(String)));
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
