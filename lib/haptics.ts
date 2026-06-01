import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Local-only UX polish. Safe no-op on unsupported platforms.
 */
export async function hapticLight(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // ignore
  }
}

export async function hapticSuccess(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // ignore
  }
}

