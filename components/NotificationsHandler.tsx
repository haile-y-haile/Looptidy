import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { configureNotifications, scheduleLoopReminder } from '../lib/reminders';
import { useLoops } from '../context/LoopContext';
import { useRouter } from 'expo-router';

export function NotificationsHandler() {
  const { loops, updateLoop, closeLoop } = useLoops();
  const router = useRouter();

  useEffect(() => {
    void configureNotifications();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const loopId = response.notification.request.content.data.loopId as string | undefined;
      if (!loopId) return;

      const action = response.actionIdentifier;

      if (action === 'SNOOZE_1_DAY') {
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(9, 0, 0, 0);
        const loop = loops.find((l) => l.id === loopId);
        if (!loop) return;
        const snoozedUntil = nextDay.toISOString();
        const merged = { ...loop, snoozedUntil, reminderEnabled: true };
        void (async () => {
          const notificationId = await scheduleLoopReminder(merged);
          await updateLoop(loopId, {
            snoozedUntil,
            reminderEnabled: true,
            localNotificationId: notificationId ?? undefined,
          });
        })();
      } else if (action === 'CLOSE_LOOP') {
        void closeLoop(loopId);
      } else if (action === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        router.push(`/loops/${loopId}`);
      }
    });

    return () => {
      sub.remove();
    };
  }, [updateLoop, closeLoop, router, loops]);

  return null;
}
