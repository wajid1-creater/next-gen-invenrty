/**
 * Lightweight relative-time formatter.
 *
 * Picked over date-fns/dayjs to avoid pulling i18n locales into the bundle for
 * a function this small. Outputs the same strings the rest of the UI uses.
 */

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' });

/** "5 minutes ago" / "in 2 days" / "just now". Accepts ISO string, Date, or epoch ms. */
export function formatRelativeTime(input: string | number | Date | null | undefined): string {
  if (input == null) return '';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';

  let duration = (date.getTime() - Date.now()) / 1000;
  if (Math.abs(duration) < 5) return 'just now';

  for (const div of DIVISIONS) {
    if (Math.abs(duration) < div.amount) {
      return rtf.format(Math.round(duration), div.unit);
    }
    duration /= div.amount;
  }
  return '';
}

/** "Apr 25" / "Apr 25, 2026" if year differs from current. */
export function formatShortDate(input: string | number | Date | null | undefined): string {
  if (input == null) return '';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}),
  };
  return new Intl.DateTimeFormat('en-US', opts).format(date);
}

/** "Apr 25, 2026 · 14:23" — for tooltips on top of relative times. */
export function formatFullDateTime(input: string | number | Date | null | undefined): string {
  if (input == null) return '';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
