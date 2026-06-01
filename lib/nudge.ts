import type { OpenLoop } from '../types';
import { buildNudgeMessage, getPersonByKey, type PersonSummary } from './people';

export function buildLoopNudgeMessage(loop: OpenLoop): string {
  const person = loop.waitingOn?.name ?? loop.promisedTo?.name;
  const first = person?.split(' ')[0] ?? 'there';
  const lines = [
    `Hi ${first},`,
    '',
    `Following up on: ${loop.title}`,
  ];
  if (loop.description?.trim()) {
    lines.push('');
    lines.push(loop.description.trim());
  }
  if (loop.dueDate) {
    lines.push('');
    lines.push(`Target timing: ${loop.dueDate}`);
  }
  lines.push('');
  lines.push('Thanks,');
  lines.push('— Sent via LoopTidy');
  return lines.join('\n');
}

export function buildPersonNudge(person: PersonSummary, loops: OpenLoop[]): string {
  return buildNudgeMessage(person, loops);
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
