import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL   = full address of the site, e.g. https://futnetitalia.it (used for hreflang tags)
// BASE_PATH  = only needed while the site lives under github.io/<repo>/ (e.g. /futnet-site/).
//              Leave it unset once the custom domain is connected.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  base: process.env.BASE_PATH || '/',
  vite: {
    plugins: [tailwindcss()],
  },
});
