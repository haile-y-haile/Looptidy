import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeeklyReview } from '../types';

const STORAGE_KEY = '@looptidy/weekly-reviews';

function isWeeklyReviewArray(value: unknown): value is WeeklyReview[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as WeeklyReview).id === 'string' &&
        typeof (item as WeeklyReview).startedAt === 'string'
    )
  );
}

function normalizeReview(raw: WeeklyReview): WeeklyReview {
  return {
    ...raw,
    reviewedLoopIds: Array.isArray(raw.reviewedLoopIds) ? raw.reviewedLoopIds : [],
    closedLoopIds: Array.isArray(raw.closedLoopIds) ? raw.closedLoopIds : [],
    notes: raw.notes ?? '',
    createdAt: raw.createdAt ?? raw.startedAt,
  };
}

export async function getWeeklyReviews(): Promise<WeeklyReview[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!isWeeklyReviewArray(parsed)) return [];
    return parsed.map(normalizeReview).sort(
      (a, b) =>
        new Date(b.completedAt ?? b.createdAt).getTime() -
        new Date(a.completedAt ?? a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Failed to load weekly reviews:', error);
    return [];
  }
}

export async function saveWeeklyReview(review: WeeklyReview): Promise<void> {
  const existing = await getWeeklyReviews();
  const next = [review, ...existing.filter((r) => r.id !== review.id)];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function replaceWeeklyReviews(reviews: WeeklyReview[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reviews.map(normalizeReview)));
}

export async function clearWeeklyReviews(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
