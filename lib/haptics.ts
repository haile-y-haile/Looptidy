import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { getPreferenceCache } from './preferences';

/**
 * Local-only UX polish. Safe no-op on unsupported platforms or when disabled in Settings.
 */
export async function hapticLight(): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!getPreferenceCache().hapticsEnabled) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // ignore
  }
}

export async function hapticSuccess(): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!getPreferenceCache().hapticsEnabled) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // ignore
  }
}
