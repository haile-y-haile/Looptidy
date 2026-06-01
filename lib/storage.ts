import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OpenLoop } from '../types';
import { mockLoops } from './mockData';

const STORAGE_KEY = '@looptidy/loops';

function cloneLoops(loops: OpenLoop[]): OpenLoop[] {
  return JSON.parse(JSON.stringify(loops)) as OpenLoop[];
}

function normalizeLoop(raw: OpenLoop): OpenLoop {
  return {
    ...raw,
    description: raw.description ?? '',
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    decisions: Array.isArray(raw.decisions) ? raw.decisions : [],
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
  };
}

function isOpenLoopArray(value: unknown): value is OpenLoop[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as OpenLoop).id === 'string' &&
        typeof (item as OpenLoop).title === 'string' &&
        typeof (item as OpenLoop).type === 'string' &&
        typeof (item as OpenLoop).status === 'string'
    )
  );
}

async function seedMockLoops(): Promise<OpenLoop[]> {
  const seeded = cloneLoops(mockLoops);
  await saveLoops(seeded);
  return seeded;
}

export async function getLoops(): Promise<OpenLoop[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return seedMockLoops();
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isOpenLoopArray(parsed)) {
      return seedMockLoops();
    }

    return parsed.map(normalizeLoop);
  } catch (error) {
    console.error('Failed to load loops from AsyncStorage:', error);
    return cloneLoops(mockLoops).map(normalizeLoop);
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
  return seedMockLoops();
}
