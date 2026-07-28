import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FeedbackItem } from '../types';

const KEY = '@looptidy/feedback';

export async function getFeedbackItems(): Promise<FeedbackItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // Guarantee the array fields the rest of the app iterates over.
    return parsed
      .filter(
        (item): item is FeedbackItem =>
          typeof item === 'object' && item !== null && typeof item.id === 'string'
      )
      .map((item) => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
        linkedLoopIds: Array.isArray(item.linkedLoopIds) ? item.linkedLoopIds : [],
      }));
  } catch {
    return [];
  }
}

export async function saveFeedbackItems(items: FeedbackItem[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function clearFeedbackItems(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
