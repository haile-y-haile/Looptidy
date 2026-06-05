import type { OpenLoop } from '../types';
import { normalizeDecision } from './decisions';
import { mockLoops } from './mockData';
import { getDb, migrateFromAsyncStorageIfNeeded } from './db';

function cloneLoops(loops: OpenLoop[]): OpenLoop[] {
  return JSON.parse(JSON.stringify(loops)) as OpenLoop[];
}

function normalizeLoop(raw: OpenLoop): OpenLoop {
  const legacyReminder = raw.reminder;
  const reminderAt =
    raw.reminderAt ??
    (legacyReminder && !legacyReminder.completed ? legacyReminder.date : undefined);
  const reminderEnabled =
    raw.reminderEnabled ?? Boolean(reminderAt && !legacyReminder?.completed);

  return {
    ...raw,
    description: raw.description ?? '',
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    decisions: Array.isArray(raw.decisions)
      ? raw.decisions.map((d) => normalizeDecision({ ...d, id: d.id }, raw.id))
      : [],
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
    reminderAt,
    reminderLabel: raw.reminderLabel,
    snoozedUntil: raw.snoozedUntil,
    reminderEnabled,
    localNotificationId: raw.localNotificationId,
    accountableOwner: raw.accountableOwner,
    nextActionOwner: raw.nextActionOwner,
    nextCheckInAt: raw.nextCheckInAt,
    lastFollowUpAt: raw.lastFollowUpAt,
    accountabilityStatus: raw.accountabilityStatus,
    escalationLevel: raw.escalationLevel ?? 'none',
    accountabilityNotes: raw.accountabilityNotes ?? '',
  };
}

/** Explicit demo seed — only via Backup & Restore user action. */
export async function seedDemoLoops(): Promise<OpenLoop[]> {
  const seeded = cloneLoops(mockLoops).map(normalizeLoop);
  await saveLoops(seeded);
  return seeded;
}

export async function getLoops(): Promise<OpenLoop[]> {
  await migrateFromAsyncStorageIfNeeded();
  const database = await getDb();
  const rows = await database.getAllAsync<{ data: string }>(
    `SELECT data FROM documents WHERE type = 'loop'`
  );
  if (!rows || rows.length === 0) {
    return [];
  }
  return rows.map((r) => JSON.parse(r.data) as OpenLoop).map(normalizeLoop);
}

export async function saveLoops(loops: OpenLoop[]): Promise<void> {
  const database = await getDb();
  await database.withTransactionAsync(async () => {
    await database.runAsync(`DELETE FROM documents WHERE type = 'loop'`);
    for (const loop of loops) {
      await database.runAsync(
        `INSERT INTO documents (id, type, data, updated_at) VALUES (?, ?, ?, ?)`,
        [loop.id, 'loop', JSON.stringify(loop), Date.now()]
      );
    }

    await database.runAsync(
      `INSERT INTO history (timestamp, action, state) VALUES (?, ?, ?)`,
      [Date.now(), 'save', JSON.stringify(loops)]
    );

    const count = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM history`
    );
    if (count && count.count > 20) {
      await database.runAsync(
        `DELETE FROM history WHERE id NOT IN (SELECT id FROM history ORDER BY timestamp DESC LIMIT 20)`
      );
    }
  });
}

export async function undoLastAction(): Promise<OpenLoop[] | null> {
  const database = await getDb();
  const rows = await database.getAllAsync<{ id: number; state: string }>(
    `SELECT id, state FROM history ORDER BY timestamp DESC LIMIT 2`
  );
  if (rows && rows.length === 2) {
    const previousState = rows[1].state;
    const loops = JSON.parse(previousState) as OpenLoop[];

    await database.withTransactionAsync(async () => {
      await database.runAsync(`DELETE FROM documents WHERE type = 'loop'`);
      for (const loop of loops) {
        await database.runAsync(
          `INSERT INTO documents (id, type, data, updated_at) VALUES (?, ?, ?, ?)`,
          [loop.id, 'loop', JSON.stringify(loop), Date.now()]
        );
      }
      await database.runAsync(`DELETE FROM history WHERE id = ?`, [rows[0].id]);
    });

    return loops.map(normalizeLoop);
  }
  return null;
}

export async function resetLoops(): Promise<OpenLoop[]> {
  return seedDemoLoops();
}

export async function clearAllLoops(): Promise<void> {
  const database = await getDb();
  await database.runAsync(`DELETE FROM documents WHERE type = 'loop'`);
}
