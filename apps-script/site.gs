/*
  Google Apps Script: lets the website build read your Google Drive content.
  The folders stay private; only requests that carry the secret TOKEN get an answer.
    - photos for the carousel  (folder PHOTOS_FOLDER_ID)
    - news & events written as Google Docs  (folder NEWS_FOLDER_ID, see apps-script/NEWS-TEMPLATE.md)
      Newest Doc first (creation date). A post with an event date is an event, otherwise it is news.
  Setup steps are in README.md.
*/
const PHOTOS_FOLDER_ID = '1p0mIWguKfcwXPTEBB3yieoX16OJY0T4z';
const NEWS_FOLDER_ID = '1X3bqs_fhzWilUhXDH2pf7nj-cgb89KJB';
const TOKEN = 'PASTE_A_LONG_RANDOM_TEXT_HERE'; // same value as the GitHub secret PHOTOS_API_TOKEN
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!TOKEN || TOKEN.indexOf('PASTE_') === 0 || p.token !== TOKEN) return reply_({ error: 'forbidden' });
  if (p.news === 'list') return newsList_();
  if (p.news) return newsPost_(p.news, p.image === '1');
  return photos_(p);
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------------------------------------------ photos */

function photos_(p) {
  const folder = DriveApp.getFolderById(PHOTOS_FOLDER_ID);
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

/* ------------------------------------------------------------ news & events */

// ?token=...&news=list -> the Google Docs in the news folder
function newsList_() {
  const files = DriveApp.getFolderById(NEWS_FOLDER_ID).getFilesByType(MimeType.GOOGLE_DOCS);
  const docs = [];
  while (files.hasNext()) {
    const f = files.next();
    if (/^(template|model)/i.test(f.getName())) continue; // the template is not a post
    docs.push({ id: f.getId(), name: f.getName(), created: f.getDateCreated().getTime() });
  }
  // newest first: the order of the posts on the site is the creation date of the Doc
  docs.sort(function (a, b) {
    return b.created - a.created;
  });
  return reply_({ docs: docs });
}

// ?token=...&news=DOC_ID           -> the post as structured data
// ?token=...&news=DOC_ID&image=1   -> its photo as base64
function newsPost_(id, wantImage) {
  const files = DriveApp.getFolderById(NEWS_FOLDER_ID).getFilesByType(MimeType.GOOGLE_DOCS);
  let found = null;
  while (files.hasNext()) {
    const f = files.next();
    if (f.getId() === id) {
      found = f;
      break;
    }
  }
  if (!found) return reply_({ error: 'not found' });

  const body = DocumentApp.openById(id).getBody();
  if (wantImage) return reply_(firstImage_(body));
  return reply_(parsePost_(found, body));
}

function firstImage_(body) {
  const images = body.getImages();
  if (images.length === 0) return { none: true };
  const blob = images[0].getBlob();
  const bytes = blob.getBytes();
  if (bytes.length > MAX_IMAGE_BYTES) return { error: 'photo is larger than 8 MB' };
  return { mime: blob.getContentType(), data: Utilities.base64Encode(bytes) };
}

function parsePost_(file, body) {
  const E = DocumentApp.ElementType;
  const H = DocumentApp.ParagraphHeading;
  const post = {
    id: file.getId(),
    name: file.getName(),
    created: file.getDateCreated().getTime(),
    modified: file.getLastUpdated().getTime(),
    fields: {},
    it: { title: '', blocks: [] },
    en: { title: '', blocks: [] },
    hasImage: body.getImages().length > 0,
    warnings: [],
  };

  let lang = null;
  let tableSeen = false; // only the first table is read
  for (let i = 0; i < body.getNumChildren(); i++) {
    const el = body.getChild(i);
    const type = el.getType();

    if (type === E.TABLE && !tableSeen) {
      tableSeen = true;
      readFields_(el.asTable(), post.fields, post.warnings);
      continue;
    }

    if (type === E.PARAGRAPH) {
      const par = el.asParagraph();
      const text = par.getText().trim();
      const heading = par.getHeading();
      if (heading === H.HEADING1) {
        lang = langOf_(text);
        if (!lang) post.warnings.push('Heading 1 "' + text + '" is not "Italiano" or "English"');
        continue;
      }
      if (!lang || !text) continue; // text before the first language heading, or empty/photo-only line
      const section = post[lang];
      if (heading === H.HEADING2 && !section.title) {
        section.title = text;
      } else if (heading === H.HEADING2 || heading === H.HEADING3 || heading === H.HEADING4 || heading === H.HEADING5 || heading === H.HEADING6) {
        section.blocks.push({ type: 'h', level: heading === H.HEADING2 ? 2 : 3, runs: runs_(par.editAsText()) });
      } else {
        section.blocks.push({ type: 'p', runs: runs_(par.editAsText()) });
      }
      continue;
    }

    if (type === E.LIST_ITEM && lang) {
      const li = el.asListItem();
      if (!li.getText().trim()) continue;
      const glyph = String(li.getGlyphType());
      post[lang].blocks.push({ type: 'li', ordered: /NUMBER|LATIN|ROMAN/.test(glyph), runs: runs_(li.editAsText()) });
    }
  }

  // the table is optional: a news item without an event date needs no table at all
  if (!post.it.title && !post.en.title) post.warnings.push('No title found (use Heading 2 under "Italiano" / "English")');
  return post;
}

function langOf_(text) {
  if (/^(italiano|italian|it)$/i.test(text)) return 'it';
  if (/^(english|inglese|en)$/i.test(text)) return 'en';
  return null;
}

// The labels in the left column (Romanian, Italian or English) -> field names
const FIELD_LABELS = {
  event_date: ['data evenimentului', 'data eveniment', 'data', 'data evento', 'data dell evento', 'event date'],
  event_time: ['ora', 'ora evenimentului', 'ora eveniment', 'ora evento', 'event time'],
  place: ['locul', 'loc', 'locatia', 'luogo', 'place'],
  link: ['link', 'legatura'],
};

function fieldOf_(label) {
  // lower case, no accents, no punctuation: "Locația:" -> "locatia"
  const clean = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  for (const field in FIELD_LABELS) {
    if (FIELD_LABELS[field].indexOf(clean) !== -1) return field;
  }
  return null;
}

function readFields_(table, fields, warnings) {
  for (let r = 0; r < table.getNumRows(); r++) {
    const row = table.getRow(r);
    if (row.getNumCells() < 2) continue;
    const label = row.getCell(0).getText().trim();
    if (!label) continue;
    const key = fieldOf_(label);
    if (!key) {
      warnings.push('Unknown label in the table: "' + label + '"');
      continue;
    }
    const cell = row.getCell(1);
    let value = cell.getText().trim();
    if (key === 'link') {
      // a link written as clickable text: take the address behind it
      const t = cell.editAsText();
      for (let k = 0; k < t.getText().length; k++) {
        const url = t.getLinkUrl(k);
        if (url) {
          value = url;
          break;
        }
      }
    }
    fields[key] = value;
  }
}

// Splits a paragraph into runs of the same formatting: [{t, b, i, u}] (u = link address)
function runs_(text) {
  const s = text.getText();
  if (!s) return [];
  const starts = text.getTextAttributeIndices();
  const runs = [];
  for (let k = 0; k < starts.length; k++) {
    const start = starts[k];
    const end = k + 1 < starts.length ? starts[k + 1] : s.length;
    const t = s.substring(start, end);
    if (!t) continue;
    runs.push({ t: t, b: text.isBold(start) === true, i: text.isItalic(start) === true, u: text.getLinkUrl(start) || '' });
  }
  return runs;
}
