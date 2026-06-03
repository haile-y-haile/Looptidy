/** Parse stored date/time strings for pickers. */
export function parseStoredDate(value: string | undefined): Date {
  if (value?.trim()) {
    const parsed = new Date(value.trim());
    if (!Number.isNaN(parsed.getTime())) return parsed;
    const isoDate = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDate) {
      const d = new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
      if (!Number.isNaN(d.getTime())) return d;
    }
  }
  return new Date();
}

/** Store date-only values as YYYY-MM-DD. */
export function formatStoredDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Store date+time values as ISO strings. */
export function formatStoredDateTime(date: Date): string {
  return date.toISOString();
}

export function formatPickerLabel(value: string | undefined, mode: 'date' | 'datetime'): string {
  if (!value?.trim()) return '';
  const date = parseStoredDate(value);
  if (mode === 'date') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
