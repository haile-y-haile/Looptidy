import type { FeedbackItem, LoopTidyBackup, OpenLoop, ScopeChange, WeeklyReview } from '../types';
import { BACKUP_FORMAT_VERSION } from '../types';
import { normalizeDecision } from './decisions';

export type ImportValidationResult =
  | { ok: true; backup: LoopTidyBackup }
  | { ok: false; error: string };

function isOpenLoopArray(value: unknown): value is OpenLoop[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as OpenLoop).id === 'string' &&
        typeof (item as OpenLoop).title === 'string'
    )
  );
}

function isWeeklyReviewArray(value: unknown): value is WeeklyReview[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as WeeklyReview).id === 'string'
    )
  );
}

function isScopeArray(value: unknown): value is ScopeChange[] {
  return Array.isArray(value);
}

function isFeedbackArray(value: unknown): value is FeedbackItem[] {
  return Array.isArray(value);
}

export function validateBackupJson(raw: string): ImportValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'File is not valid JSON.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Backup must be a JSON object.' };
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.version !== BACKUP_FORMAT_VERSION && obj.version !== 1 && obj.version !== 2) {
    return {
      ok: false,
      error: `Unsupported backup version. Expected ${BACKUP_FORMAT_VERSION}.`,
    };
  }

  if (!isOpenLoopArray(obj.loops)) {
    return { ok: false, error: 'Backup is missing a valid "loops" array.' };
  }

  const weeklyReviews = isWeeklyReviewArray(obj.weeklyReviews) ? obj.weeklyReviews : [];
  const scopeChanges = isScopeArray(obj.scopeChanges) ? (obj.scopeChanges as ScopeChange[]) : [];
  const feedbackItems = isFeedbackArray(obj.feedbackItems) ? (obj.feedbackItems as FeedbackItem[]) : [];

  const loops = obj.loops.map((loop) => ({
    ...loop,
    decisions: (loop.decisions ?? []).map((d) =>
      normalizeDecision({ ...d, id: d.id }, loop.id)
    ),
  }));

  return {
    ok: true,
    backup: {
      version: BACKUP_FORMAT_VERSION,
      exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
      loops,
      weeklyReviews,
      scopeChanges,
      feedbackItems,
    },
  };
}
