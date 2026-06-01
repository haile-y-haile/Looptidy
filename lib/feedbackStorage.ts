import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FeedbackItem } from '../types';

const KEY = '@looptidy/feedback';

export async function getFeedbackItems(): Promise<FeedbackItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as FeedbackItem[]) : [];
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
