import type { FeedbackItem, LoopTidyBackup, OpenLoop, ScopeChange, WeeklyReview } from '../types';
import { BACKUP_FORMAT_VERSION } from '../types';
import { normalizeLoop } from './storage';

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Keep only well-formed rows; a malformed entry must not crash the app after restore. */
function toScopeChanges(value: unknown): ScopeChange[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ScopeChange => isRecord(item) && typeof item.id === 'string');
}

function toFeedbackItems(value: unknown): FeedbackItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is FeedbackItem => isRecord(item) && typeof item.id === 'string')
    .map((item) => ({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags : [],
      linkedLoopIds: Array.isArray(item.linkedLoopIds) ? item.linkedLoopIds : [],
    }));
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
  const scopeChanges = toScopeChanges(obj.scopeChanges);
  const feedbackItems = toFeedbackItems(obj.feedbackItems);

  let loops: OpenLoop[];
  try {
    loops = obj.loops.map(normalizeLoop);
  } catch {
    return { ok: false, error: 'Backup contains loop data LoopTidy could not read.' };
  }

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
