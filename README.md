# Futnet Italia – Calcio Tenis website

Astro + Tailwind CSS + DaisyUI (no React, almost no JavaScript in the browser). News and events are written as **Google Docs** and the
carousel photos are put in a **Google Drive folder**; the site reads them when it is built and rebuilds itself automatically every
30 minutes (or instantly with one click).

```
Google Drive (Docs + photos)  ->  Apps Script  ->  (GitHub Action every 30 min)  ->  Astro build  ->  GitHub Pages
```

## 1. Run it on your computer

```bash
npm install
npm run dev        # http://localhost:4321  (Italian)   /en/  (English)
```

Without Google Drive connected it shows the sample news in `src/data/news.sample.json` and no carousel photos.
To use the real content, copy `.env.example` to `.env` and fill in `PHOTOS_API_URL` and `PHOTOS_API_TOKEN` (see below).

## 2. Content from Google Drive

Everything comes through one small Google Apps Script (`apps-script/site.gs`) that runs in your Google account, reads two
**private** Drive folders and answers only requests that carry a secret token.

| what | where | how it appears |
|---|---|---|
| News & events | Drive folder of Google Docs, one Doc per post | a preview card + its own page (`/novita/...`, `/en/news/...`) |
| Carousel photos | Drive folder of JPG/PNG/WebP/AVIF files | the "Photos" section |

### Writing a news item or event

Open the Doc called **MODEL** in the news folder, make a copy (it stays in the same folder), rename it and fill it in.
The full rules are in `apps-script/NEWS-TEMPLATE.md`; in short:

- The newest Doc (by creation date) is shown first.
- A post with an **event date** in the small table is an event; without one it is news (delete the table).
- Text in an "Italiano" and an "English" section (Heading 1), title as Heading 2. A missing language shows the other one.
- One photo anywhere in the Doc. Bold, italic, links and lists are kept.
- To hide a post, move its Doc out of the folder (e.g. into a subfolder).

### One-time setup

1. Make a long random token. In a terminal: `openssl rand -hex 24` (copy the result).
2. Go to <https://script.google.com> > **New project**. Delete the sample code and paste the whole of `apps-script/site.gs`.
   Replace `PASTE_A_LONG_RANDOM_TEXT_HERE` with the token. Check `PHOTOS_FOLDER_ID` and `NEWS_FOLDER_ID` are the ids of your
   two folders (the last part of each folder address).
3. **Deploy > New deployment** > type **Web app** > Execute as **Me** > Who has access **Anyone** > Deploy.
   Approve the permission request (Google warns the app is unverified: *Advanced > Go to ... (unsafe)* - it is your own script).
   Copy the **Web app URL** (ends in `/exec`).
4. Still in the editor: choose the function **authorize** in the dropdown above the code and press **Run**. Google asks for
   permission to read your Drive files and Google Docs: allow it (Advanced > Go to ... (unsafe) > Allow). Without this the
   news cannot be read. Then **Deploy > Manage deployments > Edit > New version > Deploy** again.
5. Check it: open `<web app URL>?token=<token>&news=list` in a browser; you should see your Docs listed.
6. Put it online (next section) and add the two values to GitHub.

For local testing put the same two values in `.env` (`PHOTOS_API_URL`, `PHOTOS_API_TOKEN`).

### Good to know

- Photos are ordered newest upload first. Removing a photo from the folder removes it from the site.
- iPhone HEIC photos are ignored (the build prints a warning); export them as JPG first.
- Changed the script code? Use **Deploy > Manage deployments > Edit > New version**; the URL stays the same.
- If the URL or token is wrong the build **fails on purpose** and the previous site stays online. A single broken Doc or
  photo is skipped with a warning in the build log (Actions > the run > "Run npm run build").
- Photos you put by hand in `src/assets/gallery/` also appear; only files starting with `drive-` are replaced at every build.

## 3. Put it online (GitHub Pages)

1. Create a GitHub repository and push this folder (branch `main`).
2. Repository **Settings > Pages > Build and deployment > Source: GitHub Actions**.
3. Repository **Settings > Secrets and variables > Actions**:
   - **Variables** tab: `PHOTOS_API_URL` – the Apps Script web app URL
   - **Secrets** tab: `PHOTOS_API_TOKEN` – the token
   - **Variables** tab: `BASE_PATH` – `/<repository-name>/` while using the github.io address (remove it when the domain is connected)
   - **Variables** tab: `SITE_URL` – the full address, e.g. `https://<user>.github.io/<repository-name>` (later `https://futnetitalia.it`)
4. The **Actions** tab runs "Build and deploy" on every push, every 30 minutes, and on the **Run workflow** button.

> GitHub switches off scheduled runs in public repositories after ~60 days without any repository activity.
> If new posts stop appearing, open Actions and re-enable the workflow (or push any small change).

## 4. Custom domain (later)

Buy the domain, then Settings > Pages > Custom domain, and add the DNS records GitHub shows.
Remove the `BASE_PATH` variable and set `SITE_URL` to the new address.
(`.it` domains require an Italian/EU/EEA registrant.)

## Languages

- `/` is Italian, `/en/` is English.
- On the first visit to `/`, a tiny script checks the browser languages: English -> `/en/`, otherwise Italian.
- The IT/EN switch remembers the visitor's choice.

## What to edit where

| to change | edit |
|---|---|
| tagline, history, timeline, footer line, contact links, button labels | `src/content.ts` |
| site name, logo file, the team shown in "Teams" (name and crest) | `site` and `club` in `src/content.ts`; image files in `public/` |
| colours (blue, red, gold from the logo) | `src/styles/global.css` (the `futnet` theme at the top) |
| fonts | `src/styles/global.css` (`@theme`) and the `@fontsource` imports in `src/layouts/Layout.astro` |
| layout of a section | `src/components/*.astro` (Tailwind and DaisyUI classes) |
| the few lines of browser JavaScript (phone menu, language links, "Show older posts") | bottom of `src/layouts/Layout.astro` |
| news / events | Google Docs in the Drive news folder |
| players and their photos | `src/data/players.ts`; photos go in `src/assets/players/` |
| the photo carousel | the Google Drive photo folder |

## Optional: publish instantly after editing

To avoid the 30 minute wait, run the workflow by hand (Actions > Build and deploy > Run workflow), or add a function to the Apps Script
that calls `POST https://api.github.com/repos/<user>/<repo>/actions/workflows/deploy.yml/dispatches` with
`{"ref":"main"}` and a fine-grained GitHub token (Actions: write). This is only worth it if a 30 minute delay is too slow.
