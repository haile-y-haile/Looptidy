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

async function seedMockLoops(): Promise<OpenLoop[]> {
  const seeded = cloneLoops(mockLoops);
  await saveLoops(seeded);
  return seeded;
}

export async function getLoops(): Promise<OpenLoop[]> {
  try {
    await migrateFromAsyncStorageIfNeeded();
    const database = await getDb();
    const rows = await database.getAllAsync<{ data: string }>(`SELECT data FROM documents WHERE type = 'loop'`);
    if (!rows || rows.length === 0) {
      return seedMockLoops();
    }

    const loops = rows.map((r) => JSON.parse(r.data) as OpenLoop).map(normalizeLoop);
    // Sort logic to maintain basic order, or rely on UI sorting
    return loops;
  } catch (error) {
    console.error('Failed to load loops from SQLite:', error);
    return cloneLoops(mockLoops).map(normalizeLoop);
  }
}

export async function saveLoops(loops: OpenLoop[]): Promise<void> {
  try {
    const database = await getDb();
    await database.withTransactionAsync(async () => {
      // Clear existing loops to handle deletions seamlessly
      await database.runAsync(`DELETE FROM documents WHERE type = 'loop'`);
      for (const loop of loops) {
        await database.runAsync(
          `INSERT INTO documents (id, type, data, updated_at) VALUES (?, ?, ?, ?)`,
          [loop.id, 'loop', JSON.stringify(loop), Date.now()]
        );
      }
      
      // Save state to history for undo (keep last 20)
      await database.runAsync(
        `INSERT INTO history (timestamp, action, state) VALUES (?, ?, ?)`,
        [Date.now(), 'save', JSON.stringify(loops)]
      );
      
      const count = await database.getFirstAsync<{count: number}>(`SELECT COUNT(*) as count FROM history`);
      if (count && count.count > 20) {
        await database.runAsync(`DELETE FROM history WHERE id NOT IN (SELECT id FROM history ORDER BY timestamp DESC LIMIT 20)`);
      }
    });
  } catch (error) {
    console.error('Failed to save loops to SQLite:', error);
    throw error;
  }
}

export async function undoLastAction(): Promise<OpenLoop[] | null> {
  const database = await getDb();
  const rows = await database.getAllAsync<{ id: number, state: string }>(`SELECT id, state FROM history ORDER BY timestamp DESC LIMIT 2`);
  if (rows && rows.length === 2) {
    const previousState = rows[1].state;
    const loops = JSON.parse(previousState) as OpenLoop[];
    
    // Restore state
    await database.withTransactionAsync(async () => {
      await database.runAsync(`DELETE FROM documents WHERE type = 'loop'`);
      for (const loop of loops) {
        await database.runAsync(
          `INSERT INTO documents (id, type, data, updated_at) VALUES (?, ?, ?, ?)`,
          [loop.id, 'loop', JSON.stringify(loop), Date.now()]
        );
      }
      // Remove the latest history entry to actually "undo"
      await database.runAsync(`DELETE FROM history WHERE id = ?`, [rows[0].id]);
    });
    
    return loops.map(normalizeLoop);
  }
  return null;
}

export async function resetLoops(): Promise<OpenLoop[]> {
  return seedMockLoops();
}

export async function clearAllLoops(): Promise<void> {
  const database = await getDb();
  await database.runAsync(`DELETE FROM documents WHERE type = 'loop'`);
}
