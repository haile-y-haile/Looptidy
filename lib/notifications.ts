import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const LOOP_CATEGORY = 'LOOP_REMINDER';

export async function setupNotifications() {
  if (Platform.OS === 'web') return false;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  await Notifications.setNotificationCategoryAsync(LOOP_CATEGORY, [
    {
      identifier: 'SNOOZE_1_DAY',
      buttonTitle: 'Snooze 1 Day',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'CLOSE_LOOP',
      buttonTitle: 'Close Loop',
      options: { opensAppToForeground: false, isDestructive: true },
    },
  ]);

  return true;
}

export async function scheduleLoopReminder(loopId: string, title: string, body: string, date: Date | number) {
  if (Platform.OS === 'web') return null;

  const trigger = date instanceof Date ? date : new Date(date);
  if (trigger.getTime() <= Date.now()) return null;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { loopId },
      categoryIdentifier: LOOP_CATEGORY,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });

  return notificationId;
}

export async function cancelLoopReminder(notificationId: string) {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
