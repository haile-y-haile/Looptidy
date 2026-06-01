import type { OpenLoop } from '../types';
import { categoryLabels } from './utils';

export function filterLoopsByQuery<T extends OpenLoop>(loops: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return loops;
  return loops.filter((loop) => buildSearchHaystack(loop).includes(q));
}

export function buildSearchHaystack(loop: OpenLoop): string {
  const decisionText = loop.decisions
    .map(
      (d) =>
        `${d.title} ${d.summary ?? ''} ${d.finalDecision ?? ''} ${d.rationale ?? ''} ${d.question ?? ''} ${d.outcome ?? ''}`
    )
    .join(' ');
  const timelineText = loop.timeline
    .map((e) => `${e.title} ${e.description ?? ''}`)
    .join(' ');
  return [
    loop.title,
    loop.description ?? '',
    loop.waitingOn?.name ?? '',
    loop.waitingOn?.email ?? '',
    loop.promisedTo?.name ?? '',
    loop.promisedTo?.email ?? '',
    loop.owner?.name ?? '',
    categoryLabels[loop.category],
    loop.reminderLabel ?? '',
    loop.accountabilityNotes ?? '',
    loop.accountableOwner?.name ?? '',
    loop.nextActionOwner?.name ?? '',
    decisionText,
    timelineText,
  ]
    .join(' ')
    .toLowerCase();
}
