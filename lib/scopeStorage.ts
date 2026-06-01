import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScopeChange } from '../types';

const KEY = '@looptidy/scope-changes';

export async function getScopeChanges(): Promise<ScopeChange[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ScopeChange[]) : [];
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
