/*
  Runs before `npm run dev` and `npm run build` (see package.json).
  Talks to the Google Apps Script (apps-script/site.gs) to download, from Google Drive:
    - the carousel photos   -> src/assets/gallery/drive-001-*.jpg ...
    - the news & events Docs -> src/data/news.generated.json  +  their photos in src/assets/news/
  Everything it writes is ignored by git. Photos you add by hand to src/assets/gallery/ are left alone.
  Without PHOTOS_API_URL it does nothing, so the site still builds anywhere (with the sample news).
  With --if-stale (used by `npm run dev`) it skips the download when the last one is less than 10 minutes old.
*/
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

try {
  process.loadEnvFile('.env');
} catch {
  /* no .env file: fine, CI passes real environment variables */
}

const url = process.env.PHOTOS_API_URL;
const token = process.env.PHOTOS_API_TOKEN;
const root = process.cwd();
const galleryDir = path.join(root, 'src', 'assets', 'gallery');
const newsDir = path.join(root, 'src', 'assets', 'news');
const newsJson = path.join(root, 'src', 'data', 'news.generated.json');
const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif' };

if (!url) {
  console.log('[drive] PHOTOS_API_URL not set: using the photos in src/assets/gallery/ and the sample news');
  await rm(newsJson, { force: true });
  process.exit(0);
}
if (!token) {
  console.error('[drive] PHOTOS_API_URL is set but PHOTOS_API_TOKEN is missing.');
  process.exit(1);
}
if (process.argv.includes('--if-stale')) {
  try {
    const age = Date.now() - (await stat(newsJson)).mtimeMs;
    if (age < 10 * 60 * 1000) {
      console.log(`[drive] content downloaded ${Math.round(age / 60000)} min ago, not downloading again (run \`node scripts/fetch-drive.mjs\` to refresh)`);
      process.exit(0);
    }
  } catch {
    /* never downloaded: go on */
  }
}
console.log('[drive] downloading photos and news from Google Drive (Google is slow: about 10-30 seconds)...');

/** Runs `fn` over `items`, a few at a time (Google answers each request slowly). */
async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    }),
  );
  return results;
}

async function call(params) {
  const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}${new URLSearchParams({ token, ...params })}`, { redirect: 'follow' });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('the answer is not JSON (is the web app deployed with access "Anyone"?)');
  }
  if (json.error) throw new Error(`the script answered "${json.error}"${json.error === 'forbidden' ? ' (wrong token?)' : ''}`);
  return json;
}

async function clearPrefix(dir, prefix) {
  await mkdir(dir, { recursive: true });
  for (const name of await readdir(dir)) if (name.startsWith(prefix)) await rm(path.join(dir, name));
}

// A broken link or token fails the build on purpose: the previous site stays online.
function fail(what, error) {
  console.error(`[drive] Could not read ${what}: ${error.message}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ photos */
let photoList;
try {
  photoList = await call({});
} catch (error) {
  fail('the photo list', error);
}
await clearPrefix(galleryDir, 'drive-');
const photoResults = await pool(photoList.photos, 4, async (photo, i) => {
  try {
    const file = await call({ id: photo.id });
    const ext = extensions[file.mime];
    if (!ext) throw new Error(`unsupported type ${file.mime}`);
    const name = `drive-${String(i + 1).padStart(3, '0')}-${photo.id.slice(0, 8)}.${ext}`;
    await writeFile(path.join(galleryDir, name), Buffer.from(file.data, 'base64'));
    return true;
  } catch (error) {
    console.warn(`[drive] Photo "${photo.name}" skipped: ${error.message}`); // one bad photo should not take the site down
    return false;
  }
});
const photosSaved = photoResults.filter(Boolean).length;
for (const name of photoList.skipped ?? []) {
  console.warn(`[drive] Photo folder: ignored "${name}" (only JPG, PNG, WebP and AVIF are supported; export iPhone HEIC photos as JPG)`);
}
console.log(`[drive] ${photosSaved} of ${photoList.photos.length} photos downloaded`);

/* ---------------------------------------------------------- news & events */
let list;
try {
  list = await call({ news: 'list' });
} catch (error) {
  fail('the news list (is the script updated and deployed as a new version?)', error);
}
if (!Array.isArray(list.docs)) fail('the news list', new Error('unexpected answer from the script'));

await clearPrefix(newsDir, 'doc-');
const results = await pool(list.docs, 4, async (doc) => {
  try {
    const post = await call({ news: doc.id });
    for (const warning of post.warnings ?? []) console.warn(`[drive] "${doc.name}": ${warning}`);
    let image = '';
    if (post.hasImage) {
      try {
        const file = await call({ news: doc.id, image: '1' });
        const ext = extensions[file.mime];
        if (file.none) throw new Error('no photo found');
        if (!ext) throw new Error(`unsupported photo type ${file.mime}`);
        image = `doc-${doc.id.slice(0, 10)}.${ext}`;
        await writeFile(path.join(newsDir, image), Buffer.from(file.data, 'base64'));
      } catch (error) {
        console.warn(`[drive] "${doc.name}": photo skipped: ${error.message}`);
      }
    }
    return { ...post, image };
  } catch (error) {
    console.warn(`[drive] "${doc.name}" skipped: ${error.message}`); // one broken Doc should not take the site down
    return null;
  }
});
const posts = results.filter(Boolean);
await writeFile(newsJson, JSON.stringify({ posts }, null, 1));
console.log(`[drive] ${posts.length} of ${list.docs.length} news & events Docs downloaded`);
