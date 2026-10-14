/**
 * MED MNG — comparaison A/B/C des prompts de style (PRÉPARÉE, NON EXÉCUTÉE).
 *
 * Construit EXACTEMENT les six charges utiles `POST /api/v1/generate` du protocole
 * docs/MUSIQUE-COMPARAISON-ABC.md : deux styles (Pop, Afrobeat/Afrofusion) × trois prompts.
 *
 *  - A : prompt ACTUEL du catalogue (ce que la production enverrait aujourd'hui) ;
 *  - B : « prompt personnel riche » (direction de référence de la propriétaire, mot pour mot) ;
 *  - C : prompt STRUCTURÉ du catalogue v2 (genre, influences, instruments, groove, voix, tempo).
 *
 * Les six requêtes passent par `construireRequeteSuno` (module de production) : paroles, titre,
 * durée, modèle, poids, voix et suffixes (« clear … vocals », « french lyrics ») sont donc
 * IDENTIQUES ; seuls `style` (A/B/C) et `negativeTags` (v1 pour A, v2 pour B et C) changent.
 *
 * Module pur : aucune clé, aucun réseau, aucun appel à Suno. Le lancement réel (payant) n'a lieu
 * que sur autorisation explicite et hors de ce dépôt (voir le protocole).
 */
import {
  MODELE_SUNO_DEFAUT,
  construireNegativeTags,
  construireRequeteSuno,
  construireStyle,
  type ChargeUtileSuno,
  type GenreVocal,
  type ModeleSuno,
  type StyleMusical,
} from '../../supabase/functions/_shared/mm-suno-requete.ts';
import { STYLES_MUSICAUX_V2 } from '../../supabase/functions/_shared/mm-styles-v2.ts';

export type VarianteABC = 'A' | 'B' | 'C';

/** Paroles de test : neutres, sans contenu médical, identiques pour les six requêtes. */
export const PAROLES_COMPARAISON: readonly string[] = [
  '[Couplet 1]',
  'Chaque matin je reprends mes fiches',
  'Un peu de calme, un café, un cap',
  'Je relis doucement ce que j’ai appris',
  'Et ma mémoire fait son chemin',
  '[Refrain]',
  'Un peu chaque jour, jamais d’un coup',
  'Les petits pas nous mènent loin',
  'Un peu chaque jour, je tiens le cap',
  'Et demain je saurai déjà',
  '[Couplet 2]',
  'Quand le doute vient frapper à ma porte',
  'Je respire, je reprends le fil',
  'Chaque phrase que je dis à voix haute',
  'Se pose comme une pierre au fond de moi',
  '[Refrain]',
  'Un peu chaque jour, jamais d’un coup',
  'Les petits pas nous mènent loin',
  'Un peu chaque jour, je tiens le cap',
  'Et demain je saurai déjà',
  '[Pont]',
  'Répéter, c’est aimer ce qu’on apprend',
  'Répéter, c’est se donner le temps',
  '[Refrain]',
  'Un peu chaque jour, jamais d’un coup',
  'Les petits pas nous mènent loin',
  'Un peu chaque jour, je tiens le cap',
  'Et demain je saurai déjà',
];

/** Styles comparés (slug du catalogue actuel) et genre vocal FIXE (arbitraire, constant par style). */
export const STYLES_COMPARES: ReadonlyArray<{ slug: string; titre: string; genreVocal: GenreVocal }> = [
  { slug: 'pop', titre: 'Pop', genreVocal: 'f' },
  { slug: 'afrobeat', titre: 'Afrofusion', genreVocal: 'm' },
];

/** Même modèle pour les six requêtes : celui du code (V6). À confronter à SUNO_MODEL de production. */
export const MODELE_COMPARAISON: ModeleSuno = MODELE_SUNO_DEFAUT;

/** Adresse de rappel FICTIVE : à remplacer au lancement (rappel signé ou interrogation record-info). */
export const URL_RAPPEL_FICTIVE = 'https://remplacer-au-lancement.invalid/mm-suno-callback';

export interface RequeteComparaison {
  id: string;
  style: string;
  variante: VarianteABC;
  description: string;
  chargeUtile: ChargeUtileSuno;
  longueurs: { style: number; negativeTags: number; lyrics: number };
}

const DESCRIPTIONS: Record<VarianteABC, string> = {
  A: 'Prompt actuel du catalogue (production aujourd’hui), négatifs actuels',
  B: 'Prompt personnel riche (direction de référence), négatifs v2',
  C: 'Prompt structuré du catalogue v2, négatifs v2',
};

const comme = (style: StyleMusical, prompt: string, negativeTags: string): StyleMusical => ({ ...style, prompt, negativeTags });

export function construireRequetesABC(): RequeteComparaison[] {
  const requetes: RequeteComparaison[] = [];
  for (const cible of STYLES_COMPARES) {
    const v2 = STYLES_MUSICAUX_V2.find((s) => s.slug === cible.slug);
    if (!v2) throw new Error(`Style v2 introuvable : ${cible.slug}`);
    const base = construireRequeteSuno({
      paroles: [...PAROLES_COMPARAISON],
      style: cible.slug,
      rang: 'A',
      titre: `Test de styles — ${cible.titre}`,
      genreVocal: cible.genreVocal,
      modele: MODELE_COMPARAISON,
      callBackUrl: URL_RAPPEL_FICTIVE,
    });
    const options = { genreVocal: cible.genreVocal, langue: 'fr' };
    for (const variante of ['A', 'B', 'C'] as const) {
      let chargeUtile: ChargeUtileSuno = base.chargeUtile;
      if (variante !== 'A') {
        const prompt = variante === 'B' ? v2.promptReference : v2.prompt;
        const style = comme(v2, prompt, v2.negativeTags);
        chargeUtile = {
          ...base.chargeUtile,
          style: construireStyle(style, options),
          negativeTags: construireNegativeTags(style),
        };
      }
      requetes.push({
        id: `${cible.slug}-${variante}`,
        style: cible.slug,
        variante,
        description: DESCRIPTIONS[variante],
        chargeUtile,
        longueurs: {
          style: chargeUtile.style.length,
          negativeTags: chargeUtile.negativeTags.length,
          lyrics: chargeUtile.lyrics.length,
        },
      });
    }
  }
  return requetes;
}

/** Contenu du fichier docs/musique-comparaison-abc/requetes-abc.json (aucune clé, aucun secret). */
export function documentRequetesABC() {
  return {
    avertissement:
      'PRÉPARÉ, NON EXÉCUTÉ. Aucune génération n’a été lancée. Ne lancer qu’après autorisation explicite : chaque requête consomme des crédits sunoapi.org. callBackUrl est fictive. Aucune clé dans ce fichier.',
    modele: MODELE_COMPARAISON,
    nombreDeRequetes: 6,
    requetes: construireRequetesABC(),
  };
}
