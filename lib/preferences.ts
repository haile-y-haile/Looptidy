import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Category, LoopType, Priority } from '../types';

/** Bump when onboarding should show again for existing installs (e.g. new brand flow). */
const ONBOARDING_VERSION = 2;

const KEYS = {
  onboardingComplete: '@looptidy/onboardingComplete',
  onboardingVersion: '@looptidy/onboardingVersion',
  appearance: '@looptidy/appearance',
  weeklyReviewBannerDismissed: '@looptidy/weeklyReviewBannerDismissed',
  biometricLockEnabled: '@looptidy/biometricLockEnabled',
  asyncStorageMigrated: '@looptidy/asyncStorageMigrated',
  hapticsEnabled: '@looptidy/hapticsEnabled',
  reduceMotion: '@looptidy/reduceMotion',
  timeFormat: '@looptidy/timeFormat',
  defaultSnooze: '@looptidy/defaultSnooze',
  nudgeTone: '@looptidy/nudgeTone',
  staleDays: '@looptidy/staleDays',
  weekStartsOn: '@looptidy/weekStartsOn',
  defaultReminderHour: '@looptidy/defaultReminderHour',
  showPmSignals: '@looptidy/showPmSignals',
  showWeeklyBanner: '@looptidy/showWeeklyBanner',
  defaultLoopType: '@looptidy/defaultLoopType',
  defaultPriority: '@looptidy/defaultPriority',
  defaultCategory: '@looptidy/defaultCategory',
  lastBackupAt: '@looptidy/lastBackupAt',
} as const;

export type AppearanceMode = 'system' | 'light' | 'dark';
export type TimeFormat = '12h' | '24h';
export type NudgeTone = 'soft' | 'firm';
export type WeekStartsOn = 0 | 1; // 0 = Sunday, 1 = Monday
export type StaleDaysOption = 7 | 14 | 21;
export type DefaultSnoozePreset = 'later_today' | 'tomorrow' | 'next_week';

export type PreferenceSnapshot = {
  hapticsEnabled: boolean;
  reduceMotion: boolean;
  timeFormat: TimeFormat;
  defaultSnooze: DefaultSnoozePreset;
  nudgeTone: NudgeTone;
  staleDays: StaleDaysOption;
  weekStartsOn: WeekStartsOn;
  defaultReminderHour: number;
  showPmSignals: boolean;
  showWeeklyBanner: boolean;
  defaultLoopType: LoopType;
  defaultPriority: Priority;
  defaultCategory: Category;
  lastBackupAt: string | null;
};

const DEFAULTS: PreferenceSnapshot = {
  hapticsEnabled: true,
  reduceMotion: false,
  timeFormat: '12h',
  defaultSnooze: 'tomorrow',
  nudgeTone: 'soft',
  staleDays: 7,
  weekStartsOn: 1,
  defaultReminderHour: 9,
  showPmSignals: true,
  showWeeklyBanner: true,
  defaultLoopType: 'follow_up',
  defaultPriority: 'medium',
  defaultCategory: 'work',
  lastBackupAt: null,
};

let cache: PreferenceSnapshot = { ...DEFAULTS };
let hydrated = false;

export function getPreferenceCache(): PreferenceSnapshot {
  return cache;
}

export function isPreferenceCacheHydrated(): boolean {
  return hydrated;
}

function parseBool(raw: string | null, fallback: boolean): boolean {
  if (raw === null) return fallback;
  return raw === 'true';
}

function parseLoopType(raw: string | null): LoopType {
  const allowed: LoopType[] = [
    'waiting_on_others',
    'promised_by_me',
    'decision_needed',
    'blocked',
    'follow_up',
    'due',
  ];
  if (raw && (allowed as string[]).includes(raw)) return raw as LoopType;
  return DEFAULTS.defaultLoopType;
}

function parsePriority(raw: string | null): Priority {
  const allowed: Priority[] = ['low', 'medium', 'high', 'urgent'];
  if (raw && (allowed as string[]).includes(raw)) return raw as Priority;
  return DEFAULTS.defaultPriority;
}

function parseCategory(raw: string | null): Category {
  const allowed: Category[] = ['work', 'personal', 'finance', 'health', 'home', 'other'];
  if (raw && (allowed as string[]).includes(raw)) return raw as Category;
  return DEFAULTS.defaultCategory;
}

function parseSnooze(raw: string | null): DefaultSnoozePreset {
  if (raw === 'later_today' || raw === 'tomorrow' || raw === 'next_week') return raw;
  return DEFAULTS.defaultSnooze;
}

function parseStaleDays(raw: string | null): StaleDaysOption {
  const n = raw ? Number.parseInt(raw, 10) : DEFAULTS.staleDays;
  if (n === 7 || n === 14 || n === 21) return n;
  return DEFAULTS.staleDays;
}

function parseWeekStartsOn(raw: string | null): WeekStartsOn {
  if (raw === '0') return 0;
  if (raw === '1') return 1;
  return DEFAULTS.weekStartsOn;
}

function parseReminderHour(raw: string | null): number {
  const n = raw ? Number.parseInt(raw, 10) : DEFAULTS.defaultReminderHour;
  if (Number.isFinite(n) && n >= 0 && n <= 23) return n;
  return DEFAULTS.defaultReminderHour;
}

/** Load all settings into the in-memory cache (call once at app start). */
export async function hydratePreferenceCache(): Promise<PreferenceSnapshot> {
  const pairs = await AsyncStorage.multiGet(Object.values(KEYS));
  const map = new Map(pairs);

  cache = {
    hapticsEnabled: parseBool(map.get(KEYS.hapticsEnabled) ?? null, DEFAULTS.hapticsEnabled),
    reduceMotion: parseBool(map.get(KEYS.reduceMotion) ?? null, DEFAULTS.reduceMotion),
    timeFormat: map.get(KEYS.timeFormat) === '24h' ? '24h' : '12h',
    defaultSnooze: parseSnooze(map.get(KEYS.defaultSnooze) ?? null),
    nudgeTone: map.get(KEYS.nudgeTone) === 'firm' ? 'firm' : 'soft',
    staleDays: parseStaleDays(map.get(KEYS.staleDays) ?? null),
    weekStartsOn: parseWeekStartsOn(map.get(KEYS.weekStartsOn) ?? null),
    defaultReminderHour: parseReminderHour(map.get(KEYS.defaultReminderHour) ?? null),
    showPmSignals: parseBool(map.get(KEYS.showPmSignals) ?? null, DEFAULTS.showPmSignals),
    showWeeklyBanner: parseBool(map.get(KEYS.showWeeklyBanner) ?? null, DEFAULTS.showWeeklyBanner),
    defaultLoopType: parseLoopType(map.get(KEYS.defaultLoopType) ?? null),
    defaultPriority: parsePriority(map.get(KEYS.defaultPriority) ?? null),
    defaultCategory: parseCategory(map.get(KEYS.defaultCategory) ?? null),
    lastBackupAt: map.get(KEYS.lastBackupAt) ?? null,
  };
  hydrated = true;
  return cache;
}

export async function getOnboardingComplete(): Promise<boolean> {
  const [raw, versionRaw] = await Promise.all([
    AsyncStorage.getItem(KEYS.onboardingComplete),
    AsyncStorage.getItem(KEYS.onboardingVersion),
  ]);
  const version = versionRaw ? Number.parseInt(versionRaw, 10) : 0;
  if (version < ONBOARDING_VERSION) return false;
  return raw === 'true';
}

export async function setOnboardingComplete(value: boolean): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.onboardingComplete, value ? 'true' : 'false'],
    [KEYS.onboardingVersion, String(ONBOARDING_VERSION)],
  ]);
}

/** Force the versioned onboarding flow to show again on next launch. */
export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.onboardingComplete, 'false'],
    [KEYS.onboardingVersion, '0'],
  ]);
}

export async function getAppearanceMode(): Promise<AppearanceMode> {
  const raw = await AsyncStorage.getItem(KEYS.appearance);
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'system';
}

export async function setAppearanceMode(mode: AppearanceMode): Promise<void> {
  await AsyncStorage.setItem(KEYS.appearance, mode);
}

export function currentWeekKey(weekStartsOn: WeekStartsOn = cache.weekStartsOn): string {
  const now = new Date();
  const start = startOfWeekDate(now, weekStartsOn);
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, '0');
  const d = String(start.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfWeekDate(d = new Date(), weekStartsOn: WeekStartsOn = cache.weekStartsOn): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  date.setDate(date.getDate() - diff);
  return date;
}

export async function getWeeklyReviewBannerDismissed(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.weeklyReviewBannerDismissed);
  return raw === currentWeekKey();
}

export async function setWeeklyReviewBannerDismissed(): Promise<void> {
  await AsyncStorage.setItem(KEYS.weeklyReviewBannerDismissed, currentWeekKey());
}

/** Clear dismiss so the banner can show again this week (if day/prefs allow). */
export async function clearWeeklyReviewBannerDismissed(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.weeklyReviewBannerDismissed);
}

export async function getBiometricLockEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.biometricLockEnabled);
  return raw === 'true';
}

export async function setBiometricLockEnabled(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.biometricLockEnabled, value ? 'true' : 'false');
}

export async function getAsyncStorageMigrated(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.asyncStorageMigrated);
  return raw === 'true';
}

export async function setAsyncStorageMigrated(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.asyncStorageMigrated, value ? 'true' : 'false');
}

async function setCachedFlag(
  key: string,
  field: keyof PreferenceSnapshot,
  value: boolean
): Promise<void> {
  (cache as PreferenceSnapshot)[field] = value as never;
  await AsyncStorage.setItem(key, value ? 'true' : 'false');
}

export async function setHapticsEnabled(value: boolean): Promise<void> {
  await setCachedFlag(KEYS.hapticsEnabled, 'hapticsEnabled', value);
}

export async function setReduceMotion(value: boolean): Promise<void> {
  await setCachedFlag(KEYS.reduceMotion, 'reduceMotion', value);
}

export async function setShowPmSignals(value: boolean): Promise<void> {
  await setCachedFlag(KEYS.showPmSignals, 'showPmSignals', value);
}

export async function setShowWeeklyBanner(value: boolean): Promise<void> {
  await setCachedFlag(KEYS.showWeeklyBanner, 'showWeeklyBanner', value);
}

export async function setTimeFormat(value: TimeFormat): Promise<void> {
  cache.timeFormat = value;
  await AsyncStorage.setItem(KEYS.timeFormat, value);
}

export async function setDefaultSnooze(value: DefaultSnoozePreset): Promise<void> {
  cache.defaultSnooze = value;
  await AsyncStorage.setItem(KEYS.defaultSnooze, value);
}

export async function setNudgeTone(value: NudgeTone): Promise<void> {
  cache.nudgeTone = value;
  await AsyncStorage.setItem(KEYS.nudgeTone, value);
}

export async function setStaleDays(value: StaleDaysOption): Promise<void> {
  cache.staleDays = value;
  await AsyncStorage.setItem(KEYS.staleDays, String(value));
}

export async function setWeekStartsOn(value: WeekStartsOn): Promise<void> {
  cache.weekStartsOn = value;
  await AsyncStorage.setItem(KEYS.weekStartsOn, String(value));
}

export async function setDefaultReminderHour(value: number): Promise<void> {
  const hour = Math.min(23, Math.max(0, Math.floor(value)));
  cache.defaultReminderHour = hour;
  await AsyncStorage.setItem(KEYS.defaultReminderHour, String(hour));
}

export async function setDefaultLoopType(value: LoopType): Promise<void> {
  cache.defaultLoopType = value;
  await AsyncStorage.setItem(KEYS.defaultLoopType, value);
}

export async function setDefaultPriority(value: Priority): Promise<void> {
  cache.defaultPriority = value;
  await AsyncStorage.setItem(KEYS.defaultPriority, value);
}

export async function setDefaultCategory(value: Category): Promise<void> {
  cache.defaultCategory = value;
  await AsyncStorage.setItem(KEYS.defaultCategory, value);
}

export async function setLastBackupAt(iso: string): Promise<void> {
  cache.lastBackupAt = iso;
  await AsyncStorage.setItem(KEYS.lastBackupAt, iso);
}

export async function getLastBackupAt(): Promise<string | null> {
  if (hydrated) return cache.lastBackupAt;
  return (await AsyncStorage.getItem(KEYS.lastBackupAt)) ?? null;
}
