import type { OpenLoop } from '../types';
import { getPreferenceCache, type NudgeTone } from './preferences';
import { buildNudgeMessage, getPersonByKey, type PersonSummary } from './people';

function closingLines(tone: NudgeTone): string[] {
  if (tone === 'firm') {
    return ['Please reply with a status or blocker by end of day.', '', 'Thanks,', '— Sent via LoopTidy'];
  }
  return ['Thanks,', '— Sent via LoopTidy'];
}

export function buildLoopNudgeMessage(loop: OpenLoop): string {
  const tone = getPreferenceCache().nudgeTone;
  const person = loop.waitingOn?.name ?? loop.promisedTo?.name;
  const first = person?.split(' ')[0] ?? 'there';
  const intro =
    tone === 'firm'
      ? `Checking in — I need an update on:`
      : `Following up on:`;
  const lines = [`Hi ${first},`, '', `${intro} ${loop.title}`];
  if (loop.description?.trim()) {
    lines.push('');
    lines.push(loop.description.trim());
  }
  if (loop.dueDate) {
    lines.push('');
    lines.push(`Target timing: ${loop.dueDate}`);
  }
  lines.push('');
  lines.push(...closingLines(tone));
  return lines.join('\n');
}

function buildPersonNudge(person: PersonSummary, loops: OpenLoop[]): string {
  const base = buildNudgeMessage(person, loops);
  if (getPreferenceCache().nudgeTone !== 'firm') return base;
  return base.replace(
    'Thanks,\n— Sent via LoopTidy',
    'Please reply with a status or blocker by end of day.\n\nThanks,\n— Sent via LoopTidy'
  );
}

export function buildNudgeForPersonKey(
  summaries: PersonSummary[],
  loops: OpenLoop[],
  key: string
): string | null {
  const person = getPersonByKey(summaries, key);
  if (!person) return null;
  return buildPersonNudge(person, loops);
}
