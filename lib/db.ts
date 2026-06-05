import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OpenLoop } from '../types';
import { getAsyncStorageMigrated, setAsyncStorageMigrated } from './preferences';

const ASYNC_STORAGE_KEY = '@looptidy/loops';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('looptidy.db');
  await db.execAsync(`
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
  return db;
}

export async function migrateFromAsyncStorageIfNeeded() {
  if (await getAsyncStorageMigrated()) {
    return;
  }

  const database = await getDb();
  const existingCount = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM documents WHERE type = 'loop'`
  );
  if (existingCount && existingCount.count > 0) {
    await setAsyncStorageMigrated(true);
    return;
  }

  const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        await database.withTransactionAsync(async () => {
          for (const loop of parsed as OpenLoop[]) {
            await database.runAsync(
              `INSERT OR REPLACE INTO documents (id, type, data, updated_at) VALUES (?, ?, ?, ?)`,
              [loop.id, 'loop', JSON.stringify(loop), Date.now()]
            );
          }
        });
      }
    } catch (e) {
      console.error('Migration failed', e);
    }
  }

  await setAsyncStorageMigrated(true);
}
