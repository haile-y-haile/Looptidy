import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  onboardingComplete: '@looptidy/onboardingComplete',
  appearance: '@looptidy/appearance', // 'system' | 'light' | 'dark'
} as const;

export type AppearanceMode = 'system' | 'light' | 'dark';

export async function getOnboardingComplete(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.onboardingComplete);
  return raw === 'true';
}

export async function setOnboardingComplete(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboardingComplete, value ? 'true' : 'false');
}

export async function getAppearanceMode(): Promise<AppearanceMode> {
  const raw = await AsyncStorage.getItem(KEYS.appearance);
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'system';
}

export async function setAppearanceMode(mode: AppearanceMode): Promise<void> {
  await AsyncStorage.setItem(KEYS.appearance, mode);
}

