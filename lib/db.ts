import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OpenLoop } from '../types';
import { getAsyncStorageMigrated, setAsyncStorageMigrated } from './preferences';

const ASYNC_STORAGE_KEY = '@looptidy/loops';

let db: SQLite.SQLiteDatabase | null = null;
/** Retry a failed migration on the next launch, not on every read this session. */
let migrationAttempted = false;

export async function getDb() {
  if (db) return db;
  /** Only cache the handle after the schema exists, so a failed init can retry. */
  const opened = await SQLite.openDatabaseAsync('looptidy.db');
  await opened.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
    
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      action TEXT NOT NULL,
      state TEXT NOT NULL
    );
  `);
  db = opened;
  return db;
}

export async function migrateFromAsyncStorageIfNeeded() {
  if (migrationAttempted) return;
  if (await getAsyncStorageMigrated()) {
    return;
  }
  migrationAttempted = true;

  const database = await getDb();
  const existingCount = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM documents WHERE type = 'loop'`
  );
  if (existingCount && existingCount.count > 0) {
    await setAsyncStorageMigrated(true);
    return;
  }

  const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
  if (!raw) {
    await setAsyncStorageMigrated(true);
    return;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      // Legacy loops were always stored as an array; anything else is unrecoverable.
      console.warn('Legacy loop data is not an array; nothing to migrate');
      await setAsyncStorageMigrated(true);
      return;
    }
    await database.withTransactionAsync(async () => {
      for (const loop of parsed as OpenLoop[]) {
        if (!loop?.id) continue;
        await database.runAsync(
          `INSERT OR REPLACE INTO documents (id, type, data, updated_at) VALUES (?, ?, ?, ?)`,
          [loop.id, 'loop', JSON.stringify(loop), Date.now()]
        );
      }
    });
    // Only retire the legacy source once the copy actually succeeded.
    await setAsyncStorageMigrated(true);
  } catch (e) {
    // Leave the flag unset so the next launch can retry instead of losing loops.
    console.error('Migration failed; will retry on next launch', e);
  }
}
