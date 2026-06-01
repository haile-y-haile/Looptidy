import * as Notifications from 'expo-notifications';
import type { OpenLoop } from '../types';
import { isOpenLoop, isOverdue } from './utils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type SnoozePreset = 'later_today' | 'tomorrow' | 'next_week';

export const SNOOZE_PRESETS: { key: SnoozePreset; label: string }[] = [
  { key: 'later_today', label: 'Later today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'next_week', label: 'Next week' },
];

export function getEffectiveReminderTime(loop: OpenLoop): string | undefined {
  if (!loop.reminderEnabled) return undefined;
  if (loop.snoozedUntil) return loop.snoozedUntil;
  return loop.reminderAt;
}

export function isReminderSnoozed(loop: OpenLoop): boolean {
  if (!loop.snoozedUntil) return false;
  return new Date(loop.snoozedUntil).getTime() > Date.now();
}

export function isReminderDueToday(loop: OpenLoop): boolean {
  const at = getEffectiveReminderTime(loop);
  if (!at || isReminderSnoozed(loop)) return false;
  const d = new Date(at);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isReminderOverdue(loop: OpenLoop): boolean {
  if (!loop.reminderEnabled || isReminderSnoozed(loop)) return false;
  const at = getEffectiveReminderTime(loop);
  if (!at) return false;
  const t = new Date(at).getTime();
  if (Number.isNaN(t)) return false;
  return t < Date.now();
}

export function isLoopDueToday(loop: OpenLoop): boolean {
  if (!loop.dueDate) return false;
  const d = new Date(loop.dueDate);
  const now = new Date();
  if (Number.isNaN(d.getTime())) return false;
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isLoopOverdueForDisplay(loop: OpenLoop): boolean {
  return (loop.dueDate ? isOverdue(loop.dueDate) : false) || isReminderOverdue(loop);
}

export function computeSnoozeUntil(preset: SnoozePreset, from = new Date()): string {
  const d = new Date(from);
  switch (preset) {
    case 'later_today':
      d.setHours(d.getHours() + 4, 0, 0, 0);
      if (d.getTime() <= from.getTime()) {
        d.setDate(d.getDate() + 1);
        d.setHours(9, 0, 0, 0);
      }
      break;
    case 'tomorrow':
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      break;
    case 'next_week':
      d.setDate(d.getDate() + 7);
      d.setHours(9, 0, 0, 0);
      break;
  }
  return d.toISOString();
}

export function defaultReminderLabel(loop: OpenLoop): string {
  return loop.reminderLabel?.trim() || `Follow up: ${loop.title}`;
}

export async function getReminderPermissionStatus(): Promise<
  'granted' | 'denied' | 'undetermined'
> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function requestReminderPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedules a local notification for an open loop. Returns notification id or null.
 */
export async function scheduleLoopReminder(loop: OpenLoop): Promise<string | null> {
  if (!loop.reminderEnabled || !isOpenLoop(loop)) return null;

  const triggerAt = getEffectiveReminderTime(loop);
  if (!triggerAt) return null;

  const when = new Date(triggerAt);
  if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) return null;

  const granted = await requestReminderPermission();
  if (!granted) return null;

  if (loop.localNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(loop.localNotificationId).catch(
      () => undefined
    );
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'LoopTidy reminder',
      body: defaultReminderLabel(loop),
      data: { loopId: loop.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
    },
  });

  return id;
}

export async function cancelLoopReminder(loop: OpenLoop): Promise<void> {
  if (!loop.localNotificationId) return;
  await Notifications.cancelScheduledNotificationAsync(loop.localNotificationId).catch(
    () => undefined
  );
}

export async function resyncAllLoopReminders(loops: OpenLoop[]): Promise<OpenLoop[]> {
  const next: OpenLoop[] = [];
  for (const loop of loops) {
    if (!loop.reminderEnabled || !isOpenLoop(loop)) {
      if (loop.localNotificationId) {
        await cancelLoopReminder(loop);
        next.push({ ...loop, localNotificationId: undefined });
      } else {
        next.push(loop);
      }
      continue;
    }
    const notificationId = await scheduleLoopReminder(loop);
    next.push({ ...loop, localNotificationId: notificationId ?? undefined });
  }
  return next;
}

export function formatReminderDisplay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function parseReminderInput(text: string): string | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return undefined;
}
