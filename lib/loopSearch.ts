import MiniSearch from 'minisearch';
import type { OpenLoop } from '../types';
import { categoryLabels } from './utils';

const miniSearch = new MiniSearch({
  fields: ['title', 'description', 'people', 'category', 'notes', 'decisions', 'timeline'], // fields to index for full-text search
  storeFields: ['id'], // fields to return with search results
  searchOptions: {
    fuzzy: 0.2, // Allow typos
    prefix: true, // Match partial words
  }
});

function buildSearchDocument(loop: OpenLoop) {
  const decisionText = loop.decisions
    .map(
      (d) =>
        `${d.title} ${d.summary ?? ''} ${d.finalDecision ?? ''} ${d.rationale ?? ''} ${d.question ?? ''} ${d.outcome ?? ''}`
    )
    .join(' ');
  const timelineText = loop.timeline
    .map((e) => `${e.title} ${e.description ?? ''}`)
    .join(' ');

  return {
    id: loop.id,
    title: loop.title,
    description: loop.description ?? '',
    people: [
      loop.waitingOn?.name,
      loop.waitingOn?.email,
      loop.promisedTo?.name,
      loop.promisedTo?.email,
      loop.owner?.name,
      loop.accountableOwner?.name,
      loop.nextActionOwner?.name,
    ].filter(Boolean).join(' '),
    category: categoryLabels[loop.category],
    notes: [loop.reminderLabel ?? '', loop.accountabilityNotes ?? ''].join(' '),
    decisions: decisionText,
    timeline: timelineText,
  };
}

export function filterLoopsByQuery<T extends OpenLoop>(loops: T[], query: string): T[] {
  const q = query.trim();
  if (!q) return loops;

  // Rebuild index whenever we search to ensure it's up to date.
  // In a massive app we'd do this incrementally, but for ~1000 loops this is ~20ms.
  miniSearch.removeAll();
  miniSearch.addAll(loops.map(buildSearchDocument));

  const results = miniSearch.search(q);
  const matchedIds = new Set(results.map(r => r.id));

  // Return the loops in their original sorted order, filtered by match
  return loops.filter((loop) => matchedIds.has(loop.id));
}
