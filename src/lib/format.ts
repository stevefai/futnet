import type { Lang } from './types';

/** Formats a YYYY-MM-DD string. Uses UTC so server and browser always agree. */
export function formatDate(iso: string, lang: Lang, options: Intl.DateTimeFormatOptions): string {
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return '';
  const [y, m, d] = parts;
  return new Intl.DateTimeFormat(lang, { ...options, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** URL of a file in /public, respecting the site's base path. */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
