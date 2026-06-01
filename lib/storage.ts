import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OpenLoop } from '../types';
import { mockLoops } from './mockData';

const STORAGE_KEY = '@looptidy/loops';

function cloneLoops(loops: OpenLoop[]): OpenLoop[] {
  return JSON.parse(JSON.stringify(loops)) as OpenLoop[];
}

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

export async function getLoops(): Promise<OpenLoop[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = cloneLoops(mockLoops);
      await saveLoops(seeded);
      return seeded;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isOpenLoopArray(parsed)) {
      const seeded = cloneLoops(mockLoops);
      await saveLoops(seeded);
      return seeded;
    }

    return parsed;
  } catch {
    return cloneLoops(mockLoops);
  }
}

export async function saveLoops(loops: OpenLoop[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loops));
  } catch (error) {
    console.error('Failed to save loops to AsyncStorage:', error);
    throw error;
  }
}

export async function resetLoops(): Promise<OpenLoop[]> {
  const seeded = cloneLoops(mockLoops);
  await saveLoops(seeded);
  return seeded;
}
