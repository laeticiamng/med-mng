/**
 * Brouillon local d'une note personnelle (critique finale, 05.10.2026).
 *
 * CONSTAT en production : une note tapée hors connexion affichait « Sauvegardé »
 * alors que rien n'était envoyé (supabase.auth.getUser() échoue hors ligne et la
 * sauvegarde s'arrêtait sans rien dire) ; au retour du réseau, rien n'était renvoyé ;
 * après rechargement, la note était perdue.
 *
 * Chaque frappe est donc gardée sur l'appareil jusqu'à ce que le serveur confirme
 * l'enregistrement. Clé par compte ET par item : un autre compte ouvert sur le même
 * navigateur ne voit pas ce brouillon. Toutes les opérations tolèrent un stockage
 * indisponible (navigation privée, quota) : elles ne lèvent jamais d'erreur.
 */
export const PREFIXE_BROUILLON_NOTE = 'medmng_note_brouillon';

export const cleBrouillonNote = (userId: string, itemCode: string) =>
  `${PREFIXE_BROUILLON_NOTE}:${userId}:${itemCode}`;

export function lireBrouillonNote(userId: string, itemCode: string): string | null {
  try {
    return window.localStorage.getItem(cleBrouillonNote(userId, itemCode));
  } catch {
    return null;
  }
}

export function ecrireBrouillonNote(userId: string, itemCode: string, texte: string): void {
  try {
    window.localStorage.setItem(cleBrouillonNote(userId, itemCode), texte);
  } catch {
    // Stockage indisponible : la note reste à l'écran et sera envoyée normalement.
  }
}

export function effacerBrouillonNote(userId: string, itemCode: string): void {
  try {
    window.localStorage.removeItem(cleBrouillonNote(userId, itemCode));
  } catch {
    // rien à faire
  }
}

/**
 * Texte à afficher au chargement : le brouillon local s'il diffère de la note
 * enregistrée (saisie pas encore envoyée), sinon la note du serveur.
 */
export function noteAAfficher(serveur: string, brouillon: string | null): { texte: string; enAttente: boolean } {
  if (brouillon !== null && brouillon !== serveur) return { texte: brouillon, enAttente: true };
  return { texte: serveur, enAttente: false };
}
