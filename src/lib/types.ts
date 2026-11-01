export type Lang = 'it' | 'en';

export interface Localized {
  it: string;
  en: string;
}

/** One formatted piece of text inside a paragraph. */
export interface Run {
  t: string;
  b?: boolean;
  i?: boolean;
  /** link address, empty for plain text */
  u?: string;
}

export type Block =
  | { type: 'p'; runs: Run[] }
  | { type: 'h'; level: 2 | 3; runs: Run[] }
  | { type: 'li'; ordered: boolean; runs: Run[] };

export interface Post {
  id: string;
  /** an event has an event date, news does not */
  type: 'event' | 'news';
  /** address of the post page, per language (the last part of the URL) */
  slug: Localized;
  /** YYYY-MM-DD, the day the Google Doc was created */
  posted: string;
  title: Localized;
  /** short plain-text preview for the cards */
  excerpt: Localized;
  /** the full formatted text */
  body: Record<Lang, Block[]>;
  /** YYYY-MM-DD, events only */
  eventDate: string;
  eventTime: string;
  place: string;
  link: string;
  /** file name inside src/assets/news/, empty if the post has no photo */
  image: string;
}

/** A player as written in src/data/players.ts */
export interface PlayerInput {
  number: string;
  name: string;
  role: Localized;
  captain?: boolean;
  /** file name inside src/assets/players/ */
  photo?: string;
}

export interface SiteData {
  posts: Post[];
}
