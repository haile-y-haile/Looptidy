import AsyncStorage from '@react-native-async-storage/async-storage';

/** Bump when onboarding should show again for existing installs (e.g. new brand flow). */
const ONBOARDING_VERSION = 2;

const KEYS = {
  onboardingComplete: '@looptidy/onboardingComplete',
  onboardingVersion: '@looptidy/onboardingVersion',
  appearance: '@looptidy/appearance', // 'system' | 'light' | 'dark'
  weeklyReviewBannerDismissed: '@looptidy/weeklyReviewBannerDismissed',
} as const;

export type AppearanceMode = 'system' | 'light' | 'dark';

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

export async function getAppearanceMode(): Promise<AppearanceMode> {
  const raw = await AsyncStorage.getItem(KEYS.appearance);
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'system';
}

export async function setAppearanceMode(mode: AppearanceMode): Promise<void> {
  await AsyncStorage.setItem(KEYS.appearance, mode);
}

export async function getWeeklyReviewBannerDismissed(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.weeklyReviewBannerDismissed);
  const now = new Date();
  const currentWeek = `${now.getFullYear()}-W${Math.ceil((now.getDate() - now.getDay() + 1) / 7)}`;
  return raw === currentWeek;
}

export async function setWeeklyReviewBannerDismissed(): Promise<void> {
  const now = new Date();
  const currentWeek = `${now.getFullYear()}-W${Math.ceil((now.getDate() - now.getDay() + 1) / 7)}`;
  await AsyncStorage.setItem(KEYS.weeklyReviewBannerDismissed, currentWeek);
}
