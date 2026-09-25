import { contientResidusDeBalisage, parolesSontRedigees } from '@/components/edn/music/utils/parolesFormatter';

/**
 * Filtres et tri de la bibliothèque /edn-complete, en fonctions pures.
 *
 * CONSTAT (25/09/2026) : le filtre « Discipline » proposait une liste codée en
 * dur de 18 spécialités (« Gastro-entérologie », « Pneumologie »…) et cherchait
 * le libellé en sous-chaîne dans le titre, la spécialité ou les mots-clés. Or
 * la colonne `specialite` d'`edn_items_complete` ne contient que 9 valeurs
 * (« Médecine générale » 194, « Médecine d'urgence » 37, « Cancérologie » 31,
 * « Gynécologie-Obstétrique » 24, « Psychiatrie » 21, « Neurologie » 20,
 * « Cardiologie » 19, « Pédiatrie » 11, « Fondamentaux médicaux » 10) :
 * 12 des 18 entrées (dont Gastro-entérologie) ne correspondaient à rien et
 * renvoyaient « 0 item ». La liste est désormais construite à partir des
 * valeurs réellement présentes, avec leur effectif.
 */

export interface ItemBibliotheque {
  item_code: string;
  title: string;
  specialite?: string | null;
  /**
   * Paroles de l'item, si elles ont été chargées. La liste /edn-complete ne
   * lit plus cette colonne (contenu Premium, réservé à la RPC
   * mm_contenu_immersif_item) : elle est alors `undefined`, ce qui signifie
   * « inconnu » — ni « avec » ni « sans » paroles.
   */
  paroles_musicales?: string[] | null;
  competences_count_rang_a?: number | null;
  competences_count_rang_b?: number | null;
}

/** Minuscules, sans accents ni espaces superflus. */
export const normaliserTexte = (texte: string): string =>
  texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

/** « IC-230 » → 230 (0 si aucun numéro). */
export const numeroItem = (code: string): number => {
  const m = code.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
};

// ---- Discipline -----------------------------------------------------------

export interface OptionDiscipline {
  /** Valeur normalisée (casse et accents ignorés), utilisée comme clé. */
  cle: string;
  /** Libellé tel qu'il figure dans les données. */
  libelle: string;
  nombre: number;
}

/** Disciplines présentes dans les items chargés, de la plus fournie à la moins fournie. */
export const listerDisciplines = (items: readonly ItemBibliotheque[]): OptionDiscipline[] => {
  const parCle = new Map<string, OptionDiscipline>();
  for (const item of items) {
    const brut = item.specialite?.trim();
    if (!brut) continue;
    const cle = normaliserTexte(brut);
    const existant = parCle.get(cle);
    if (existant) existant.nombre += 1;
    else parCle.set(cle, { cle, libelle: brut, nombre: 1 });
  }
  return [...parCle.values()].sort(
    (a, b) => b.nombre - a.nombre || a.libelle.localeCompare(b.libelle, 'fr')
  );
};

export const appartientADiscipline = (item: ItemBibliotheque, cle: string): boolean =>
  cle === 'all' || (!!item.specialite && normaliserTexte(item.specialite) === cle);

// ---- Contenu --------------------------------------------------------------

export type FiltreContenu = 'all' | 'avecParoles' | 'sansParoles' | 'competences10' | 'competencesMoins5';

export const totalCompetences = (item: ItemBibliotheque): number =>
  (item.competences_count_rang_a || 0) + (item.competences_count_rang_b || 0);

/**
 * Paroles réellement rédigées (et non une suite de mots-clés ou des résidus
 * HTML) : même règle que l'écran Musique de l'item.
 * `undefined` quand les paroles n'ont pas été chargées (information inconnue).
 */
export const parolesRedigees = (item: ItemBibliotheque): boolean | undefined => {
  const p = item.paroles_musicales;
  if (p === undefined) return undefined;
  return Array.isArray(p) && p.length > 0 && parolesSontRedigees(p) && !contientResidusDeBalisage(p);
};

export const aParolesRedigees = (item: ItemBibliotheque): boolean => parolesRedigees(item) === true;

export const LIBELLES_CONTENU: Record<Exclude<FiltreContenu, 'all'>, string> = {
  avecParoles: 'Avec paroles de chanson',
  sansParoles: 'Sans paroles rédigées',
  competences10: '10 compétences ou plus',
  competencesMoins5: 'Moins de 5 compétences',
};

export const correspondContenu = (item: ItemBibliotheque, filtre: FiltreContenu): boolean => {
  switch (filtre) {
    // Un item dont les paroles sont inconnues n'est ni « avec » ni « sans » :
    // les deux options disparaissent d'elles-mêmes (effectif nul).
    case 'avecParoles': return parolesRedigees(item) === true;
    case 'sansParoles': return parolesRedigees(item) === false;
    case 'competences10': return totalCompetences(item) >= 10;
    case 'competencesMoins5': return totalCompetences(item) < 5;
    default: return true;
  }
};

/** Options de contenu avec leur effectif ; celles qui ne concernent aucun item sont omises. */
export const listerOptionsContenu = (items: readonly ItemBibliotheque[]) =>
  (Object.keys(LIBELLES_CONTENU) as Array<Exclude<FiltreContenu, 'all'>>)
    .map((valeur) => ({
      valeur,
      libelle: LIBELLES_CONTENU[valeur],
      nombre: items.filter((i) => correspondContenu(i, valeur)).length,
    }))
    .filter((o) => o.nombre > 0);

// ---- Recherche ------------------------------------------------------------

interface CompetenceOic { objectif_id?: string; intitule?: string }

export interface ItemRecherchable extends ItemBibliotheque {
  subtitle?: string | null;
  mots_cles?: string[] | null;
  competences_oic_rang_a?: unknown;
  competences_oic_rang_b?: unknown;
}

const competencesCorrespondent = (liste: unknown, q: string) =>
  Array.isArray(liste) &&
  (liste as CompetenceOic[]).some(
    (c) =>
      (c?.objectif_id && normaliserTexte(c.objectif_id).includes(q)) ||
      (c?.intitule && normaliserTexte(c.intitule).includes(q))
  );

/** Recherche sur le numéro, le code, le titre, la discipline et les mots-clés. */
export const correspondRecherche = (item: ItemRecherchable, recherche: string): boolean => {
  const q = normaliserTexte(recherche);
  if (!q) return true;
  return (
    String(numeroItem(item.item_code)) === q ||
    normaliserTexte(item.item_code).includes(q) ||
    normaliserTexte(item.title).includes(q) ||
    (!!item.subtitle && normaliserTexte(item.subtitle).includes(q)) ||
    (!!item.specialite && normaliserTexte(item.specialite).includes(q)) ||
    (!!item.mots_cles && item.mots_cles.some((m) => normaliserTexte(m).includes(q))) ||
    competencesCorrespondent(item.competences_oic_rang_a, q) ||
    competencesCorrespondent(item.competences_oic_rang_b, q)
  );
};

// ---- Tri ------------------------------------------------------------------

export type Tri = 'numero' | 'titre' | 'competences' | 'rangA' | 'derniere_revision';

export const LIBELLES_TRI: Record<Tri, string> = {
  numero: "Numéro d'item",
  titre: 'Titre (A → Z)',
  competences: 'Nombre de compétences',
  rangA: 'Compétences de rang A',
  derniere_revision: 'Dernière révision',
};

/**
 * Comparateur ; les égalités sont départagées par le numéro d'item.
 * `derniereActivite` n'est utilisé que pour le tri « Dernière révision ».
 */
export const comparateur = (
  tri: Tri,
  derniereActivite: (code: string) => number = () => 0
) => (a: ItemBibliotheque, b: ItemBibliotheque): number => {
  const parNumero = numeroItem(a.item_code) - numeroItem(b.item_code);
  switch (tri) {
    case 'titre':
      return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }) || parNumero;
    case 'competences':
      return totalCompetences(b) - totalCompetences(a) || parNumero;
    case 'rangA':
      return (b.competences_count_rang_a || 0) - (a.competences_count_rang_a || 0) || parNumero;
    case 'derniere_revision':
      return derniereActivite(b.item_code) - derniereActivite(a.item_code) || parNumero;
    default:
      return parNumero;
  }
};
