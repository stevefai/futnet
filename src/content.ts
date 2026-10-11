/*
  TEXTS THAT RARELY CHANGE (team description, history, contacts, labels).
  Anything in [square brackets] is a placeholder to replace.
  News and events come from the Google Sheet; players are in src/data/players.ts.
*/
import type { Lang } from './lib/types';

export const team = {
  name: 'N.A.C. Curtatone',
  since: 1990,
  // Leave a value empty ('') to hide that link on the contact page and in the footer.
  contact: {
    email: '',
    facebook: 'https://www.facebook.com/people/NAC-Curtatone-Futnet/100085691074140/',
    instagram: '',
  },
  timeline: [
    { year: '1990', it: '[Fondazione della squadra]', en: '[Founding of the team]' },
    { year: '[ANNO]', it: '[Primo torneo o titolo]', en: '[First tournament or title]' },
    { year: '[ANNO]', it: '[Piazzamento o traguardo]', en: '[National ranking or milestone]' },
    { year: '[ANNO]', it: '[Ultimo risultato importante]', en: '[Recent highlight]' },
  ],
};

/** Contact page address in each language, relative to the site base. */
export const contactPaths = { it: 'contatti/', en: 'en/contact/' };

const text = {
  it: {
    tagline: '[Una o due frasi sulla squadra: dove giochiamo, cosa ci rappresenta.]',
    story: [
      '[Paragrafo su come è nata la squadra e da chi.]',
      '[Paragrafo su risultati, tornei e cosa significa il futnet per il gruppo.]',
    ],
    footerLine: '[Breve frase: sponsor, lega o federazione.]',
  },
  en: {
    tagline: '[One or two sentences about the team: where you play, what you stand for.]',
    story: [
      '[Paragraph about how the team started and by whom.]',
      '[Paragraph about achievements, tournaments, and what futnet means to the group.]',
    ],
    footerLine: '[Short line: sponsors, league or federation.]',
  },
};

const ui = {
  it: {
    navFeed: 'Novità ed eventi',
    navStory: 'La nostra storia',
    navPlayers: 'Giocatori',
    navGallery: 'Foto',
    navContact: 'Contatti',
    menu: 'Apri il menu',
    language: 'Lingua',
    crestAlt: 'Stemma N.A.C. Curtatone',
    eyebrow: 'Futnet · Dal 1990',
    ctaFeed: 'Ultime novità ed eventi',
    ctaPlayers: 'Conosci i giocatori',
    feedTitle: 'Novità ed eventi',
    feedOlder: 'Mostra post precedenti',
    feedEmpty: 'Ancora nessun post.',
    tagEvent: 'Evento',
    tagNews: 'Novità',
    posted: 'Pubblicato il',
    viewFacebook: 'Vedi su Facebook',
    moreInfo: 'Maggiori informazioni',
    readMore: 'Leggi di più',
    storyTitle: 'Storia della squadra',
    galleryTitle: 'Foto',
    galleryOpen: 'Apri a schermo intero',
    galleryClose: 'Chiudi',
    galleryPrev: 'Foto precedente',
    galleryNext: 'Foto successiva',
    playersTitle: 'Giocatori',
    playersEmpty: 'Ancora nessun giocatore.',
    captain: 'Capitano',
    contact: 'Contatti',
    contactIntro: 'Scrivici o seguici sui social: ti rispondiamo volentieri.',
    contactEmpty: 'I nostri contatti arriveranno presto.',
    contactBack: 'Torna alla home',
    contactOpenPage: 'Apri la nostra pagina',
  },
  en: {
    navFeed: 'News & events',
    navStory: 'Our story',
    navPlayers: 'Players',
    navGallery: 'Photos',
    navContact: 'Contact',
    menu: 'Open menu',
    language: 'Language',
    crestAlt: 'N.A.C. Curtatone crest',
    eyebrow: 'Futnet · Since 1990',
    ctaFeed: 'Latest news & events',
    ctaPlayers: 'Meet the players',
    feedTitle: 'News & events',
    feedOlder: 'Show older posts',
    feedEmpty: 'No posts yet.',
    tagEvent: 'Event',
    tagNews: 'News',
    posted: 'Posted',
    viewFacebook: 'View on Facebook',
    moreInfo: 'More information',
    readMore: 'Read more',
    storyTitle: 'History of the team',
    galleryTitle: 'Photos',
    galleryOpen: 'Open full screen',
    galleryClose: 'Close',
    galleryPrev: 'Previous photo',
    galleryNext: 'Next photo',
    playersTitle: 'Players',
    playersEmpty: 'No players yet.',
    captain: 'Captain',
    contact: 'Contact',
    contactIntro: 'Write to us or follow us on social media – we are happy to hear from you.',
    contactEmpty: 'Our contact details are coming soon.',
    contactBack: 'Back to home',
    contactOpenPage: 'Open our page',
  },
};

export function getText(lang: Lang) {
  return text[lang];
}

export function getUi(lang: Lang) {
  return ui[lang];
}
