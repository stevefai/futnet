import type { ImageMetadata } from 'astro';

// Photos of the news & events, downloaded from the Google Docs into src/assets/news/ before every build.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/news/*.{jpg,jpeg,png,webp,avif,gif}', { eager: true });

export function newsImage(file: string): ImageMetadata | undefined {
  return file ? files[`../assets/news/${file}`]?.default : undefined;
}
