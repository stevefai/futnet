/*
  Runs at BUILD time only (never in the visitor's browser).
  Downloads the published Google Sheet tab (posts), cleans it up and hands
  plain data to the page. If no URL is configured, it uses the sample CSV
  in src/data so the site can be developed without the real sheet.
*/
import Papa from 'papaparse';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Post, SiteData } from './types';

type Row = Record<string, string>;

async function readCsv(url: string | undefined, sampleFile: string): Promise<Row[]> {
  let text: string;
  if (url) {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      throw new Error(`Could not download the Google Sheet (HTTP ${res.status}). Link: ${url}`);
    }
    text = await res.text();
    if (/^\s*<(!doctype|html)/i.test(text)) {
      throw new Error(
        `The Google Sheet link returned a web page instead of CSV. In Google Sheets use File > Share > Publish to web, pick the tab, choose "Comma-separated values (.csv)". Link: ${url}`,
      );
    }
  } else {
    text = await readFile(path.join(process.cwd(), 'src', 'data', sampleFile), 'utf8');
  }

  const parsed = Papa.parse<Row>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  return parsed.data.map((row) => {
    const clean: Row = {};
    for (const [key, value] of Object.entries(row)) {
      if (key) clean[key] = typeof value === 'string' ? value.trim() : '';
    }
    return clean;
  });
}

/** Accepts 2026-10-31 or 31/10/2026 (also 31.10.2026). Returns YYYY-MM-DD or "". */
function normalizeDate(input: string | undefined): string {
  if (!input) return '';
  let y: number, m: number, d: number;
  let match = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else {
    match = input.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})/);
    if (!match) return '';
    [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  if (m < 1 || m > 12 || d < 1 || d > 31) return '';
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function isYes(value: string | undefined, whenEmpty: boolean): boolean {
  const v = (value ?? '').trim().toLowerCase();
  if (v === '') return whenEmpty;
  return ['yes', 'y', 'si', 'sì', 's', 'true', '1', 'x'].includes(v);
}

function safeLink(url: string | undefined): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '';
  } catch {
    return '';
  }
}

/** Turns a Google Drive "share" link into an image address the page can display. */
function imageUrl(url: string | undefined): string {
  const safe = safeLink(url);
  if (!safe) return '';
  const drive =
    safe.match(/drive\.google\.com\/file\/d\/([^/?#]+)/) ||
    safe.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([^&#]+)/);
  return drive ? `https://drive.google.com/thumbnail?id=${drive[1]}&sz=w1000` : safe;
}

function toPosts(rows: Row[]): Post[] {
  const posts = rows
    .map((r, index) => ({ r, index }))
    .filter(({ r }) => isYes(r.published, true))
    .map(({ r, index }): Post & { index: number } => ({
      index,
      id: `post-${index}`,
      type: ['event', 'events', 'evento', 'eventi'].includes((r.type ?? '').toLowerCase()) ? 'event' : 'news',
      posted: normalizeDate(r.posted),
      title: { it: r.title_it || r.title_en || '', en: r.title_en || r.title_it || '' },
      text: { it: r.text_it || r.text_en || '', en: r.text_en || r.text_it || '' },
      eventDate: normalizeDate(r.event_date),
      eventTime: r.event_time ?? '',
      place: r.place ?? '',
      link: safeLink(r.link),
      poster: imageUrl(r.poster_url),
    }))
    .filter((p) => p.title.it || p.title.en);

  // Newest first; rows with the same date: the lower row in the sheet is shown first.
  posts.sort((a, b) => b.posted.localeCompare(a.posted) || b.index - a.index);
  return posts.map(({ index: _index, ...post }) => post);
}

let cached: Promise<SiteData> | null = null;

/** Both language pages share one download per build. */
export function loadSiteData(): Promise<SiteData> {
  if (!cached) {
    const postsUrl = process.env.POSTS_CSV_URL || import.meta.env.POSTS_CSV_URL;
    cached = readCsv(postsUrl, 'posts.sample.csv').then((rows) => ({ posts: toPosts(rows) }));
  }
  return cached;
}
