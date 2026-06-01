import type { OpenLoop } from '../types';

export function filterLoopsByQuery<T extends OpenLoop>(loops: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return loops;
  return loops.filter((loop) => {
    const haystack = [
      loop.title,
      loop.description ?? '',
      loop.waitingOn?.name ?? '',
      loop.promisedTo?.name ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}
