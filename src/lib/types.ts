export type Lang = 'it' | 'en';

export interface Localized {
  it: string;
  en: string;
}

export interface Post {
  id: string;
  type: 'event' | 'news';
  /** YYYY-MM-DD, empty if the sheet row has no valid date */
  posted: string;
  title: Localized;
  text: Localized;
  /** YYYY-MM-DD, events only */
  eventDate: string;
  eventTime: string;
  place: string;
  link: string;
  poster: string;
}

export interface Player {
  id: string;
  number: string;
  name: string;
  role: Localized;
  captain: boolean;
  photo: string;
}

export interface SiteData {
  posts: Post[];
  players: Player[];
}
