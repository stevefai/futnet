/*
  Runs before `npm run dev` and `npm run build` (see package.json).
  Downloads the photos of the Google Drive folder (through the Apps Script in
  apps-script/gallery.gs) into src/assets/gallery/ as drive-001-*.jpg, drive-002-*.jpg ...
  Those files are not committed (.gitignore). Photos you add to that folder by hand are left alone.
  Without PHOTOS_API_URL it does nothing, so the site still builds on any computer.
*/
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

try {
  process.loadEnvFile('.env');
} catch {
  /* no .env file: fine, CI passes real environment variables */
}

const url = process.env.PHOTOS_API_URL;
const token = process.env.PHOTOS_API_TOKEN;
const dir = path.join(process.cwd(), 'src', 'assets', 'gallery');
const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };

if (!url) {
  console.log('[gallery] PHOTOS_API_URL not set: using only the photos already in src/assets/gallery/');
  process.exit(0);
}
if (!token) {
  console.error('[gallery] PHOTOS_API_URL is set but PHOTOS_API_TOKEN is missing.');
  process.exit(1);
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

// A broken link or token fails the build on purpose: the previous site stays online.
let list;
try {
  list = await call({});
} catch (error) {
  console.error(`[gallery] Could not read the photo list: ${error.message}`);
  process.exit(1);
}

await mkdir(dir, { recursive: true });
for (const name of await readdir(dir)) {
  if (name.startsWith('drive-')) await rm(path.join(dir, name));
}

let saved = 0;
for (const [i, photo] of list.photos.entries()) {
  try {
    const file = await call({ id: photo.id });
    const ext = extensions[file.mime];
    if (!ext) throw new Error(`unsupported type ${file.mime}`);
    const name = `drive-${String(i + 1).padStart(3, '0')}-${photo.id.slice(0, 8)}.${ext}`;
    await writeFile(path.join(dir, name), Buffer.from(file.data, 'base64'));
    saved++;
  } catch (error) {
    // One bad photo should not take the whole site down.
    console.warn(`[gallery] Skipped "${photo.name}": ${error.message}`);
  }
}
for (const name of list.skipped ?? []) {
  console.warn(`[gallery] Ignored "${name}" (only JPG, PNG, WebP and AVIF photos are supported; export iPhone HEIC photos as JPG)`);
}
console.log(`[gallery] ${saved} of ${list.photos.length} photos downloaded from Google Drive`);
