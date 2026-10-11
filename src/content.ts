/*
  TEXTS THAT RARELY CHANGE (site description, history, contacts, labels).
  Anything in [square brackets] is a placeholder to replace.
  News and events come from the Google Sheet; the team's players are in src/data/players.ts.
*/
import type { Lang } from './lib/types';

export const site = {
  name: 'Futnet Italia',
  subtitle: 'Calcio Tenis',
  logo: 'futnet-italia.png', // file in /public
  // Leave a value empty ('') to hide that link on the contact page and in the footer.
  contact: {
    email: '',
    facebook: 'https://www.facebook.com/people/NAC-Curtatone-Futnet/100085691074140/',
    instagram: 'https://www.instagram.com/futnet_italia/',
  },
  timeline: [
    { year: '[ANNO]', it: '[Nascita di Futnet Italia]', en: '[Founding of Futnet Italia]' },
    { year: '[ANNO]', it: '[Primo torneo]', en: '[First tournament]' },
    { year: '[ANNO]', it: '[Traguardo importante]', en: '[Milestone]' },
    { year: '[ANNO]', it: '[Ultimo risultato importante]', en: '[Recent highlight]' },
  ],
};

/** The team shown in the "Teams" section (its players are in src/data/players.ts). */
export const club = {
  name: 'N.A.C. Curtatone',
  crest: 'crest.png', // file in /public
};

/** Contact page address in each language, relative to the site base. */
export const contactPaths = { it: 'contatti/', en: 'en/contact/' };

const text = {
  it: {
    tagline: '[Una o due frasi su Futnet Italia: cos\'è il Calcio Tenis e a chi è rivolto.]',
    story: [
      '[Paragrafo su cos\'è il Futnet / Calcio Tenis e come è nato in Italia.]',
      '[Paragrafo su CSEN, i tornei e le squadre che partecipano.]',
    ],
    footerLine: 'Centro Sportivo Educativo Nazionale',
  },
  en: {
    tagline: '[One or two sentences about Futnet Italia: what Calcio Tenis is and who it is for.]',
    story: [
      '[Paragraph about what Futnet / Calcio Tenis is and how it started in Italy.]',
      '[Paragraph about CSEN, the tournaments and the teams taking part.]',
    ],
    footerLine: 'Centro Sportivo Educativo Nazionale',
  },
};

const ui = {
  it: {
    navFeed: 'Novità ed eventi',
    navStory: 'Chi siamo',
    navPlayers: 'Squadre',
    navGallery: 'Foto',
    navContact: 'Contatti',
    menu: 'Apri il menu',
    language: 'Lingua',
    logoAlt: 'Logo Futnet Italia – Calcio Tenis',
    crestAlt: 'Stemma N.A.C. Curtatone',
    eyebrow: 'Calcio Tenis · CSEN',
    ctaFeed: 'Ultime novità ed eventi',
    ctaPlayers: 'Conosci le squadre',
    feedTitle: 'Novità ed eventi',
    feedOlder: 'Mostra post precedenti',
    feedEmpty: 'Ancora nessun post.',
    tagEvent: 'Evento',
    tagNews: 'Novità',
    posted: 'Pubblicato il',
    viewFacebook: 'Vedi su Facebook',
    moreInfo: 'Maggiori informazioni',
    readMore: 'Leggi di più',
    storyTitle: 'Chi siamo',
    galleryTitle: 'Foto',
    galleryOpen: 'Apri a schermo intero',
    galleryClose: 'Chiudi',
    galleryPrev: 'Foto precedente',
    galleryNext: 'Foto successiva',
    playersTitle: 'Squadre',
    playersEmpty: 'Ancora nessun giocatore.',
    captain: 'Capitano',
    contact: 'Contatti',
    contactIntro: 'Scrivici o seguici sui social: ti rispondiamo volentieri.',
    contactEmpty: 'I nostri contatti arriveranno presto.',
    contactBack: 'Torna alla home',
    contactOpenPage: 'Apri la nostra pagina',
    playersLabel: 'Giocatori',
  },
  en: {
    navFeed: 'News & events',
    navStory: 'About us',
    navPlayers: 'Teams',
    navGallery: 'Photos',
    navContact: 'Contact',
    menu: 'Open menu',
    language: 'Language',
    logoAlt: 'Futnet Italia – Calcio Tenis logo',
    crestAlt: 'N.A.C. Curtatone crest',
    eyebrow: 'Calcio Tenis · CSEN',
    ctaFeed: 'Latest news & events',
    ctaPlayers: 'Meet the teams',
    feedTitle: 'News & events',
    feedOlder: 'Show older posts',
    feedEmpty: 'No posts yet.',
    tagEvent: 'Event',
    tagNews: 'News',
    posted: 'Posted',
    viewFacebook: 'View on Facebook',
    moreInfo: 'More information',
    readMore: 'Read more',
    storyTitle: 'About us',
    galleryTitle: 'Photos',
    galleryOpen: 'Open full screen',
    galleryClose: 'Close',
    galleryPrev: 'Previous photo',
    galleryNext: 'Next photo',
    playersTitle: 'Teams',
    playersEmpty: 'No players yet.',
    captain: 'Captain',
    contact: 'Contact',
    contactIntro: 'Write to us or follow us on social media – we are happy to hear from you.',
    contactEmpty: 'Our contact details are coming soon.',
    contactBack: 'Back to home',
    contactOpenPage: 'Open our page',
    playersLabel: 'Players',
  },
};

export function getText(lang: Lang) {
  return text[lang];
}

export function getUi(lang: Lang) {
  return ui[lang];
}
