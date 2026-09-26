/**
 * Styles musicaux du générateur audio Med MNG — vue front du catalogue.
 *
 * Source de vérité UNIQUE : supabase/functions/_shared/mm-suno-requete.ts
 * (module pur partagé avec les Edge Functions mm-generate-music /
 * mm-suno-callback / mm-music-status). Le front n'envoie que le `slug` ; le
 * serveur construit le style Suno (tags anglais) et les exclusions.
 */

import {
  STYLES_MUSICAUX,
  STYLE_PAR_DEFAUT,
  trouverStyle,
  tronquerParoles,
  calculerDureeSecondes,
  compterLignesChantees,
  LIMITES_SUNO,
  DUREE_CHANSON,
  type StyleMusical,
} from '../../supabase/functions/_shared/mm-suno-requete.ts';

export {
  STYLES_MUSICAUX,
  STYLE_PAR_DEFAUT,
  trouverStyle,
  tronquerParoles,
  calculerDureeSecondes,
  compterLignesChantees,
  LIMITES_SUNO,
  DUREE_CHANSON,
};
export type { StyleMusical };

/** Le slug est-il un style proposé aujourd'hui (alias anciens exclus) ? */
export const estStyleActuel = (slug: string | null | undefined): boolean =>
  !!slug && STYLES_MUSICAUX.some((s) => s.slug === slug);

/** Slug à conserver depuis une préférence sauvegardée : style actuel, alias connu, sinon rien. */
export const normaliserSlugStyle = (slug: string | null | undefined): string =>
  trouverStyle(slug)?.slug ?? '';

export const libelleStyle = (slug: string | null | undefined): string =>
  trouverStyle(slug)?.libelle ?? (slug || '');

export const LIBELLES_ENERGIE: Record<StyleMusical['energie'], string> = {
  calme: 'Calme',
  moyenne: 'Entraînant',
  haute: 'Énergique',
};

/** Durée estimée (mm:ss) de la chanson pour des paroles données, telle que le serveur la demandera. */
export const dureeEstimeeAffichee = (paroles: string | string[]): string => {
  const texte = tronquerParoles(paroles).texte;
  const secondes = calculerDureeSecondes(texte);
  const minutes = Math.floor(secondes / 60);
  return `${minutes}:${String(secondes % 60).padStart(2, '0')}`;
};
