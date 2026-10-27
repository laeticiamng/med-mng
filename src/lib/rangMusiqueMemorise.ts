import type { RangChanson } from '@/hooks/useChansonItem';

/**
 * Rang choisi sur la sous-page « Musique » d'un item (`/edn-complete/:slug/musique`),
 * mémorisé PAR ITEM dans ce navigateur, avec la même durée que les préférences de
 * Create (7 jours) qui y conservent déjà le style : le rang survit à un aller-retour
 * entre sous-pages, au retour arrière et au rechargement.
 *
 * Clé distincte de `generator_preferences` : l'item et le rang de Create ne sont
 * jamais modifiés. Le rang mémorisé n'est qu'une préférence d'affichage ; un rang
 * que l'item ne possède pas est écarté par la sous-page (repli sur le premier rang
 * disponible).
 */
export const CLE_RANG_MUSIQUE = 'mm_musique_rang_par_item';
const DUREE_MEMOIRE_MS = 7 * 24 * 60 * 60 * 1000;

type Memoire = Record<string, { rang: RangChanson; le: string }>;

const estRang = (valeur: unknown): valeur is RangChanson =>
  valeur === 'A' || valeur === 'B' || valeur === 'AB';

const estRecente = (le: unknown, maintenant: number) => {
  const age = maintenant - new Date(String(le)).getTime();
  return age >= 0 && age < DUREE_MEMOIRE_MS;
};

const lireMemoire = (): Memoire => {
  try {
    const brut = localStorage.getItem(CLE_RANG_MUSIQUE);
    const valeur: unknown = brut ? JSON.parse(brut) : null;
    return valeur && typeof valeur === 'object' && !Array.isArray(valeur)
      ? (valeur as Memoire)
      : {};
  } catch {
    return {};
  }
};

/** Rang mémorisé pour cet item, ou `null` (aucun choix, choix illisible ou de plus de 7 jours). */
export const lireRangMemorise = (itemCode: string): RangChanson | null => {
  const entree = lireMemoire()[itemCode];
  return entree && estRang(entree.rang) && estRecente(entree.le, Date.now())
    ? entree.rang
    : null;
};

/** Mémorise le rang choisi pour cet item (les choix de plus de 7 jours sont retirés). */
export const memoriserRang = (itemCode: string, rang: RangChanson): void => {
  try {
    const maintenant = Date.now();
    const memoire: Memoire = Object.fromEntries(
      Object.entries(lireMemoire()).filter(
        ([, entree]) =>
          entree && estRang(entree.rang) && estRecente(entree.le, maintenant)
      )
    );
    memoire[itemCode] = { rang, le: new Date(maintenant).toISOString() };
    localStorage.setItem(CLE_RANG_MUSIQUE, JSON.stringify(memoire));
  } catch {
    // Stockage indisponible (navigation privée, quota) : le choix vaut pour la page ouverte.
  }
};
