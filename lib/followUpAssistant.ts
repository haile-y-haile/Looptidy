import type { FollowUpMessageType, FollowUpTone, OpenLoop } from '../types';
import { formatDate, formatRelativeDate, loopTypeLabels, riskLevelLabels } from './utils';

export interface FollowUpOption<T extends string> {
  key: T;
  label: string;
}

export interface FollowUpCadenceOption {
  key: 'tomorrow' | 'two_days' | 'friday' | 'next_week' | 'custom' | 'none';
  label: string;
  date?: string;
}

export const FOLLOW_UP_MESSAGE_TYPES: FollowUpOption<FollowUpMessageType>[] = [
  { key: 'gentle_nudge', label: 'Gentle nudge' },
  { key: 'direct_reminder', label: 'Direct reminder' },
  { key: 'urgent_follow_up', label: 'Urgent follow-up' },
  { key: 'escalation', label: 'Escalation' },
  { key: 'still_needed', label: 'Still needed?' },
  { key: 'closure_message', label: 'Closure message' },
  { key: 'thank_you_closeout', label: 'Thank-you closeout' },
  { key: 'deadline_reminder', label: 'Deadline reminder' },
  { key: 'what_do_you_need', label: 'What do you need from me?' },
];

export const FOLLOW_UP_TONES: FollowUpOption<FollowUpTone>[] = [
  { key: 'warm', label: 'Warm' },
  { key: 'professional', label: 'Professional' },
  { key: 'short', label: 'Short' },
  { key: 'firm', label: 'Firm' },
  { key: 'friendly', label: 'Friendly' },
  { key: 'executive', label: 'Executive' },
  { key: 'casual', label: 'Casual' },
  { key: 'polite_direct', label: 'Polite but direct' },
];

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

function nextFriday(): string {
  const d = new Date();
  const day = d.getDay();
  const distance = (5 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + distance);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

function firstName(loop: OpenLoop): string {
  const person =
    loop.waitingOn?.name ??
    loop.promisedTo?.name ??
    loop.accountableOwner?.name ??
    loop.nextActionOwner?.name;
  return person?.split(/\s+/)[0] ?? 'there';
}

function personName(loop: OpenLoop): string {
  return (
    loop.waitingOn?.name ??
    loop.promisedTo?.name ??
    loop.accountableOwner?.name ??
    loop.nextActionOwner?.name ??
    'there'
  );
}

function contextLine(loop: OpenLoop): string {
  const pieces = [`Loop: ${loop.title}`];
  if (loop.dueDate) pieces.push(`Due ${formatRelativeDate(loop.dueDate)}`);
  if (loop.riskLevel !== 'none') pieces.push(`${riskLevelLabels[loop.riskLevel]} risk`);
  if (loop.type) pieces.push(loopTypeLabels[loop.type]);
  return pieces.join(' · ');
}

function lastFollowUpLine(loop: OpenLoop): string | null {
  if (!loop.lastFollowUpAt) return null;
  return `Last follow-up: ${formatDate(loop.lastFollowUpAt)}.`;
}

function nextActionLine(loop: OpenLoop): string | null {
  const decisionAction = loop.decisions.find((d) => d.nextAction?.trim())?.nextAction;
  if (decisionAction) return `Next action: ${decisionAction.trim()}.`;
  if (loop.accountabilityNotes?.trim()) return loop.accountabilityNotes.trim();
  return null;
}

function baseAsk(loop: OpenLoop, messageType: FollowUpMessageType): string {
  const due = loop.dueDate ? ` by ${formatRelativeDate(loop.dueDate).toLowerCase()}` : '';
  switch (messageType) {
    case 'gentle_nudge':
      return `Wanted to check in on "${loop.title}" when you have a chance.`;
    case 'direct_reminder':
      return `Can you send an update on "${loop.title}"${due}?`;
    case 'urgent_follow_up':
      return `This is getting time-sensitive. Can you confirm the status of "${loop.title}" today?`;
    case 'escalation':
      return `This is now blocking progress on "${loop.title}". Can we align on the owner and next step today?`;
    case 'still_needed':
      return `Is "${loop.title}" still needed, or should I close it out?`;
    case 'closure_message':
      return `I am closing the loop on "${loop.title}" unless there is anything still pending.`;
    case 'thank_you_closeout':
      return `Thanks for helping with "${loop.title}" - that closes the loop on my end.`;
    case 'deadline_reminder':
      return `Quick reminder that "${loop.title}" is due${due || ' soon'}. Are we still on track?`;
    case 'what_do_you_need':
      return `What do you need from me to move "${loop.title}" forward?`;
    default:
      return `Checking in on "${loop.title}".`;
  }
}

function applyTone(lines: string[], tone: FollowUpTone): string[] {
  switch (tone) {
    case 'short':
      return lines.filter(Boolean).slice(0, 3);
    case 'firm':
      return lines.map((line) =>
        line.startsWith('Wanted to') ? line.replace('Wanted to', 'I need to') : line
      );
    case 'executive':
      return lines.map((line) =>
        line.startsWith('Hi ') ? line : line.replace('Can you', 'Please')
      );
    case 'casual':
      return lines.map((line) => line.replace(/^Hi /, 'Hey '));
    case 'friendly':
      return [...lines, 'Appreciate it.'];
    case 'warm':
      return [...lines, 'Thanks for helping keep this moving.'];
    case 'polite_direct':
      return lines.map((line) => line.replace('Quick reminder', 'A quick, direct reminder'));
    case 'professional':
    default:
      return lines;
  }
}

export function generateFollowUpMessage(
  loop: OpenLoop,
  tone: FollowUpTone,
  messageType: FollowUpMessageType
): string {
  const greeting = tone === 'casual' ? `Hey ${firstName(loop)},` : `Hi ${firstName(loop)},`;
  const body = baseAsk(loop, messageType);
  const details = [contextLine(loop), lastFollowUpLine(loop), nextActionLine(loop)].filter(
    (line): line is string => Boolean(line)
  );
  const lines = applyTone([greeting, '', body, '', ...details], tone);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function getFollowUpCadenceOptions(): FollowUpCadenceOption[] {
  return [
    { key: 'tomorrow', label: 'Tomorrow', date: addDays(1) },
    { key: 'two_days', label: 'In 2 days', date: addDays(2) },
    { key: 'friday', label: 'Friday', date: nextFriday() },
    { key: 'next_week', label: 'Next week', date: addDays(7) },
    { key: 'custom', label: 'Custom date placeholder' },
    { key: 'none', label: "Don't remind me" },
  ];
}

export function getEscalationMessage(loop: OpenLoop): string {
  return generateFollowUpMessage(loop, 'firm', 'escalation');
}

export function getClosureMessage(loop: OpenLoop): string {
  return generateFollowUpMessage(loop, 'warm', 'closure_message');
}

export function getRecoveryMessage(loop: OpenLoop): string {
  const recipient = personName(loop);
  const due = loop.dueDate ? ` I know this was due ${formatRelativeDate(loop.dueDate).toLowerCase()}.` : '';
  return [
    `Hi ${recipient === 'there' ? 'there' : recipient.split(/\s+/)[0]},`,
    '',
    `I wanted to reset expectations on "${loop.title}".${due}`,
    'This slipped, and I am getting it back on track now.',
    '',
    'I will send the next update shortly.',
  ].join('\n');
}
