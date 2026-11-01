/*
  Runs at BUILD time only (never in the visitor's browser).
  Reads the news & events that scripts/fetch-drive.mjs downloaded from the Google Docs
  (src/data/news.generated.json) and turns them into the posts the pages use.
  Without Drive access (no PHOTOS_API_URL) it uses src/data/news.sample.json so the site can be developed anywhere.
*/
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Block, Lang, Localized, Post, Run, SiteData } from './types';

interface RawSection {
  title?: string;
  blocks?: Block[];
}
interface RawPost {
  id: string;
  name?: string;
  created?: number;
  fields?: Record<string, string>;
  it?: RawSection;
  en?: RawSection;
  image?: string;
}

async function readPosts(): Promise<RawPost[]> {
  const dir = path.join(process.cwd(), 'src', 'data');
  for (const file of ['news.generated.json', 'news.sample.json']) {
    try {
      return (JSON.parse(await readFile(path.join(dir, file), 'utf8')) as { posts: RawPost[] }).posts;
    } catch {
      /* try the next file */
    }
  }
  throw new Error('No news data found (src/data/news.sample.json is missing).');
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

function safeLink(url: string | undefined): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '';
  } catch {
    return '';
  }
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
}

const plain = (runs: Run[]) => runs.map((r) => r.t).join('').replace(/[\r\n\u000b]+/g, ' ').trim();

/** The first paragraphs as plain text, cut at a word boundary. */
function excerptOf(blocks: Block[], max = 200): string {
  let text = '';
  for (const block of blocks) {
    if (block.type !== 'p') continue; // only normal paragraphs
    text += (text ? ' ' : '') + plain(block.runs);
    if (text.length >= max) break;
  }
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

export function toPosts(raw: RawPost[]): Post[] {
  const used = { it: new Set<string>(), en: new Set<string>() };
  const uniqueSlug = (lang: Lang, base: string): string => {
    let slug = base || 'post';
    for (let n = 2; used[lang].has(slug); n++) slug = `${base || 'post'}-${n}`;
    used[lang].add(slug);
    return slug;
  };

  const sorted = [...raw].sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
  const posts: Post[] = [];
  for (const r of sorted) {
    const f = r.fields ?? {};
    const itTitle = r.it?.title ?? '';
    const enTitle = r.en?.title ?? '';
    if (!itTitle && !enTitle) continue; // nothing to show

    const itBlocks = r.it?.blocks ?? [];
    const enBlocks = r.en?.blocks ?? [];
    const title: Localized = { it: itTitle || enTitle, en: enTitle || itTitle };
    // a language without any text shows the other language
    const body: Record<Lang, Block[]> = { it: itBlocks.length ? itBlocks : enBlocks, en: enBlocks.length ? enBlocks : itBlocks };

    const eventDate = normalizeDate(f.event_date);
    if (f.event_date && !eventDate) console.warn(`[news] "${r.name}": event date "${f.event_date}" not understood (use 14.02.2026), shown as news`);

    posts.push({
      id: r.id,
      type: eventDate ? 'event' : 'news',
      slug: { it: uniqueSlug('it', slugify(title.it)), en: uniqueSlug('en', slugify(title.en)) },
      posted: r.created ? new Date(r.created).toISOString().slice(0, 10) : '',
      title,
      excerpt: { it: excerptOf(body.it), en: excerptOf(body.en) },
      body,
      eventDate,
      eventTime: f.event_time ?? '',
      place: f.place ?? '',
      link: safeLink(f.link),
      image: r.image ?? '',
    });
  }
  return posts;
}

let cached: Promise<SiteData> | null = null;

/** All pages share one read per build. */
export function loadSiteData(): Promise<SiteData> {
  if (!cached) cached = readPosts().then((raw) => ({ posts: toPosts(raw) }));
  return cached;
}
