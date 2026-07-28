import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScopeChange } from '../types';

const KEY = '@looptidy/scope-changes';

export async function getScopeChanges(): Promise<ScopeChange[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // Drop malformed entries so screens can rely on the shape.
    return parsed.filter(
      (item): item is ScopeChange =>
        typeof item === 'object' && item !== null && typeof (item as ScopeChange).id === 'string'
    );
  } catch {
    return [];
  }
}

export async function saveScopeChanges(items: ScopeChange[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function clearScopeChanges(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
