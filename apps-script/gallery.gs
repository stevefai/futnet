/*
  Google Apps Script: lets the website build read the photos in ONE Drive folder.
  The folder stays private; only requests that carry the secret TOKEN get an answer.
  Setup steps are in README.md ("Photos from Google Drive").
*/
const FOLDER_ID = '1p0mIWguKfcwXPTEBB3yieoX16OJY0T4z';
const TOKEN = 'PASTE_A_LONG_RANDOM_TEXT_HERE'; // same value as the GitHub secret PHOTOS_API_TOKEN
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!TOKEN || TOKEN.indexOf('PASTE_') === 0 || p.token !== TOKEN) return reply_({ error: 'forbidden' });

  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFiles();

  // ?token=...&id=FILE_ID -> one photo as base64
  if (p.id) {
    while (files.hasNext()) {
      const f = files.next();
      if (f.getId() === p.id && IMAGE_TYPES.indexOf(f.getMimeType()) !== -1) {
        const blob = f.getBlob();
        return reply_({ id: f.getId(), mime: blob.getContentType(), data: Utilities.base64Encode(blob.getBytes()) });
      }
    }
    return reply_({ error: 'not found' });
  }

  // ?token=... -> list of photos, newest first
  const photos = [];
  const skipped = [];
  while (files.hasNext()) {
    const f = files.next();
    if (IMAGE_TYPES.indexOf(f.getMimeType()) === -1) {
      skipped.push(f.getName());
      continue;
    }
    photos.push({ id: f.getId(), name: f.getName(), mime: f.getMimeType(), created: f.getDateCreated().getTime() });
  }
  photos.sort(function (a, b) {
    return b.created - a.created;
  });
  return reply_({ photos: photos, skipped: skipped });
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
