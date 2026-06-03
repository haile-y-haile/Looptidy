import type { OpenLoop, Person } from '../types';
import { isOpenLoop } from './utils';

export interface PersonSummary {
  key: string;
  name: string;
  email?: string;
  role?: string;
  waitingCount: number;
  promisedCount: number;
  blockedCount: number;
  decisionCount: number;
  highRiskCount: number;
  lastFollowUpAt?: string;
  totalOpen: number;
}

function personKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

function mergePerson(existing: PersonSummary | undefined, person: Person): PersonSummary {
  return {
    key: personKey(person.name),
    name: person.name,
    email: person.email ?? existing?.email,
    role: person.role ?? existing?.role,
    waitingCount: existing?.waitingCount ?? 0,
    promisedCount: existing?.promisedCount ?? 0,
    blockedCount: existing?.blockedCount ?? 0,
    decisionCount: existing?.decisionCount ?? 0,
    highRiskCount: existing?.highRiskCount ?? 0,
    lastFollowUpAt: existing?.lastFollowUpAt,
    totalOpen: existing?.totalOpen ?? 0,
  };
}

function mentionInTimeline(loop: OpenLoop, name: string): boolean {
  const lower = name.toLowerCase();
  return loop.timeline.some((e) =>
    `${e.title} ${e.description ?? ''}`.toLowerCase().includes(lower)
  );
}

export function buildPeopleSummaries(loops: OpenLoop[]): PersonSummary[] {
  const map = new Map<string, PersonSummary>();

  const touch = (person: Person | undefined, loop: OpenLoop, kind: 'waiting' | 'promised' | 'blocked' | 'decision') => {
    if (!person?.name?.trim()) return;
    const key = personKey(person.name);
    const base = mergePerson(map.get(key), person);
    if (isOpenLoop(loop)) {
      base.totalOpen += 1;
      if (loop.riskLevel === 'high') base.highRiskCount += 1;
      if (kind === 'waiting') base.waitingCount += 1;
      if (kind === 'promised') base.promisedCount += 1;
      if (kind === 'blocked') base.blockedCount += 1;
      if (kind === 'decision') base.decisionCount += 1;
    }
    const updated = new Date(loop.updatedAt).getTime();
    const last = base.lastFollowUpAt ? new Date(base.lastFollowUpAt).getTime() : 0;
    if (updated > last) base.lastFollowUpAt = loop.updatedAt;
    map.set(key, base);
  };

  for (const loop of loops) {
    touch(loop.waitingOn, loop, 'waiting');
    touch(loop.promisedTo, loop, 'promised');
    if (loop.type === 'blocked' || loop.status === 'blocked') {
      touch(loop.waitingOn ?? loop.promisedTo, loop, 'blocked');
    }
    if (loop.type === 'decision_needed') {
      touch(loop.waitingOn ?? loop.promisedTo, loop, 'decision');
    }
    for (const d of loop.decisions) {
      if (d.owner) {
        touch({ id: `owner-${d.owner}`, name: d.owner }, loop, 'decision');
      }
    }
    for (const p of [loop.waitingOn, loop.promisedTo]) {
      if (p && mentionInTimeline(loop, p.name)) {
        touch(p, loop, 'waiting');
      }
    }
  }

  return [...map.values()].sort((a, b) => b.totalOpen - a.totalOpen || a.name.localeCompare(b.name));
}

export function getLoopsForPerson(loops: OpenLoop[], key: string): {
  waiting: OpenLoop[];
  promised: OpenLoop[];
  decisions: OpenLoop[];
  blocked: OpenLoop[];
  closed: OpenLoop[];
} {
  const match = (person?: Person) => person && personKey(person.name) === key;

  return {
    waiting: loops.filter((l) => isOpenLoop(l) && match(l.waitingOn)),
    promised: loops.filter((l) => isOpenLoop(l) && match(l.promisedTo)),
    decisions: loops.filter(
      (l) =>
        isOpenLoop(l) &&
        (l.type === 'decision_needed' ||
          l.decisions.some((d) => d.owner && personKey(d.owner) === key))
    ),
    blocked: loops.filter(
      (l) => isOpenLoop(l) && (l.status === 'blocked' || l.type === 'blocked') && match(l.waitingOn)
    ),
    closed: loops.filter(
      (l) =>
        !isOpenLoop(l) &&
        (match(l.waitingOn) || match(l.promisedTo))
    ),
  };
}

export function getPersonByKey(summaries: PersonSummary[], key: string): PersonSummary | undefined {
  return summaries.find((p) => p.key === key);
}

export function buildNudgeMessage(person: PersonSummary, loops: OpenLoop[]): string {
  const sections = getLoopsForPerson(loops, person.key);
  const waitingTitles = sections.waiting.slice(0, 3).map((l) => l.title);
  const promisedTitles = sections.promised.slice(0, 2).map((l) => l.title);

  const lines: string[] = [`Hi ${person.name.split(' ')[0]},`];
  if (waitingTitles.length > 0) {
    lines.push('');
    lines.push('I wanted to follow up on:');
    waitingTitles.forEach((t) => lines.push(`• ${t}`));
  }
  if (promisedTitles.length > 0) {
    lines.push('');
    lines.push('On my side, I owe you:');
    promisedTitles.forEach((t) => lines.push(`• ${t}`));
  }
  if (waitingTitles.length === 0 && promisedTitles.length === 0) {
    lines.push('');
    lines.push('Checking in on a few open items — let me know if you have a moment to sync.');
  }
  lines.push('');
  lines.push('Thanks,');
  lines.push('— Sent via LoopTidy');
  return lines.join('\n');
}
