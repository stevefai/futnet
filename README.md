# N.A.C. Curtatone – Futnet website

Astro + Tailwind CSS + DaisyUI (no React, almost no JavaScript in the browser). News and events are typed into a **Google Sheet**; the site reads the sheet
when it is built and rebuilds itself automatically every 30 minutes (or instantly with one click).

```
Google Sheet  ->  (GitHub Action every 30 min)  ->  Astro build  ->  GitHub Pages
```

## 1. Run it on your computer

```bash
npm install
npm run dev        # http://localhost:4321  (Italian)   /en/  (English)
```

With no sheet connected it shows the sample data in `src/data/*.sample.csv`.

## 2. Create the Google Sheet (one tab)

**Tab `posts`** – one row per news item or event. Newest first is automatic (sorted by `posted`).

| column | what to type | required |
|---|---|---|
| `published` | `yes` / `no` (empty = yes). Use `no` for drafts | no |
| `type` | `event` or `news` | yes |
| `posted` | date you post it, `2026-10-31` (also accepts `31/10/2026`) | yes |
| `title_it`, `title_en` | title in each language (if one is empty, the other is used) | one of them |
| `text_it`, `text_en` | short text; line breaks are kept | no |
| `event_date` | events only: `2026-10-24` | no |
| `event_time` | events only: `15:00` | no |
| `place` | events only: venue, city | no |
| `link` | Facebook event or any `https://` page | no |
| `poster_url` | image link, or a Google Drive "Anyone with the link" share link | no |

Tips: format the date columns as **Plain text** so Google does not reformat them. Start from
`src/data/posts.sample.csv` (File > Import) to get the right headers.

## 3. Publish each tab and copy its link

For the `posts` tab: *File > Share > Publish to web* -> choose that tab -> choose **Comma-separated values (.csv)** ->
Publish -> copy the link. (Anyone with the link can read published tabs, so keep private data out of the sheet.)

For local testing, copy `.env.example` to `.env` and paste the link.

## 4. Put it online (GitHub Pages)

1. Create a GitHub repository and push this folder (branch `main`).
2. Repository **Settings > Pages > Build and deployment > Source: GitHub Actions**.
3. Repository **Settings > Secrets and variables > Actions > Variables**, add:
   - `POSTS_CSV_URL` – link of the posts tab
   - `BASE_PATH` – `/<repository-name>/` while using the github.io address (remove it when the domain is connected)
   - `SITE_URL` – the full address, e.g. `https://<user>.github.io/<repository-name>` (later `https://futnetitalia.it`)
4. The **Actions** tab runs "Build and deploy" on every push, every 30 minutes, and on the **Run workflow** button.

If the sheet link breaks, the build **fails on purpose** and the previously published site stays online.

> GitHub switches off scheduled runs in public repositories after ~60 days without any repository activity.
> If new rows stop appearing, open Actions and re-enable the workflow (or push any small change).

## 5. Custom domain (later)

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
| colours (navy, red, background) | `src/styles/global.css` (the `nac` theme at the top) |
| fonts | `src/styles/global.css` (`@theme`) and the `@fontsource` imports in `src/layouts/Layout.astro` |
| layout of a section | `src/components/*.astro` (Tailwind and DaisyUI classes) |
| the few lines of browser JavaScript (phone menu, language links, "Show older posts") | bottom of `src/layouts/Layout.astro` |
| news / events | the Google Sheet |
| players and their photos | `src/data/players.ts`; photos go in `src/assets/players/` |

## Optional: publish instantly after editing the sheet

In the sheet: *Extensions > Apps Script*, add a function that calls
`POST https://api.github.com/repos/<user>/<repo>/actions/workflows/deploy.yml/dispatches` with
`{"ref":"main"}` and a fine-grained GitHub token (Actions: write), and attach it to a time-driven or on-change
trigger. This is only worth it if a 30 minute delay is too slow.
