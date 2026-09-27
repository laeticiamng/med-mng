import type { OicCompetence } from '@/hooks/useOicCompetences';

/**
 * Quiz construit à partir des compétences OIC officielles d'un item.
 *
 * Une seule forme de question, qui a toujours UNE bonne réponse et une seule :
 * « Quel énoncé correspond à la compétence « <intitulé> » ? ». La bonne réponse
 * est la description officielle de cette compétence ; les trois autres options
 * sont les descriptions d'AUTRES compétences (du même item, puis, s'il en a
 * moins de quatre, d'un item voisin). L'explication reprend la compétence et
 * sa description complète.
 *
 * Remplace dix gabarits dont la plupart n'avaient pas de réponse unique
 * (« Identifiez la compétence UNESS officielle » avec quatre compétences
 * officielles en options, « laquelle n'est PAS correcte » dont la réponse
 * attendue était justement correcte, « Quel est l'ordre de priorité… »), et
 * des distracteurs inventés (« Approche diagnostique obsolète selon HAS 2024 »).
 */

export interface QuestionOic {
  id: string;
  question: string;
  /** Exactement 4 options, toutes différentes. */
  options: string[];
  correctIndex: number;
  explanation: string;
  competence: OicCompetence;
}

export const NOMBRE_OPTIONS_QUIZ = 4;
const LONGUEUR_MAX_OPTION = 260;

const normaliser = (texte: string) => texte.replace(/\s+/g, ' ').trim();

/** Coupe au mot, avec « … », pour que toutes les options aient la même allure. */
export const couperOption = (texte: string, max = LONGUEUR_MAX_OPTION): string => {
  const propre = normaliser(texte);
  if (propre.length <= max) return propre;
  const coupe = propre.slice(0, max);
  const dernierEspace = coupe.lastIndexOf(' ');
  return `${(dernierEspace > max * 0.6 ? coupe.slice(0, dernierEspace) : coupe).replace(/[\s,;:.–-]+$/, '')}…`;
};

const descriptionUtilisable = (c: OicCompetence): string | null => {
  const d = normaliser(c.description || '');
  if (d.length < 20) return null;
  if (d.toLowerCase() === normaliser(c.intitule || '').toLowerCase()) return null;
  return d;
};

/**
 * @param cibles     compétences interrogées (rang choisi de l'item)
 * @param reserve    autres compétences servant de distracteurs (autre rang de
 *                   l'item, item voisin) ; les cibles servent aussi de distracteurs
 * @param max        nombre maximal de questions
 */
export function genererQuestionsOic(
  cibles: OicCompetence[],
  reserve: OicCompetence[] = [],
  max = 10
): QuestionOic[] {
  const tri = (a: OicCompetence, b: OicCompetence) => (a.objectif_id || '').localeCompare(b.objectif_id || '');
  const interrogeables = cibles.filter((c) => c.intitule && descriptionUtilisable(c)).sort(tri);

  // Réserve de distracteurs : une option par texte distinct.
  const vus = new Set<string>();
  const distracteursPossibles: { id: string; texte: string }[] = [];
  for (const c of [...interrogeables, ...[...reserve].sort(tri)]) {
    const d = descriptionUtilisable(c);
    if (!d) continue;
    const option = couperOption(d);
    const cle = option.toLowerCase();
    if (vus.has(cle)) continue;
    vus.add(cle);
    distracteursPossibles.push({ id: c.objectif_id, texte: option });
  }

  const questions: QuestionOic[] = [];
  interrogeables.slice(0, max).forEach((comp, index) => {
    const description = descriptionUtilisable(comp)!;
    const bonne = couperOption(description);
    const autres = distracteursPossibles.filter(
      (d) => d.id !== comp.objectif_id && d.texte.toLowerCase() !== bonne.toLowerCase()
    );
    if (autres.length < NOMBRE_OPTIONS_QUIZ - 1) return;

    // Choix déterministe mais varié d'une question à l'autre.
    const depart = (index * (NOMBRE_OPTIONS_QUIZ - 1)) % autres.length;
    const choisis: string[] = [];
    for (let k = 0; choisis.length < NOMBRE_OPTIONS_QUIZ - 1 && k < autres.length; k++) {
      choisis.push(autres[(depart + k) % autres.length].texte);
    }

    const positionBonne = index % NOMBRE_OPTIONS_QUIZ;
    const options = [...choisis];
    options.splice(positionBonne, 0, bonne);

    questions.push({
      id: `q-${index}-${comp.objectif_id}`,
      question: `Quel énoncé correspond à la compétence « ${normaliser(comp.intitule)} » ?`,
      options,
      correctIndex: positionBonne,
      explanation: `${comp.objectif_id} — ${normaliser(comp.intitule)}.\n\n${(comp.description || '').trim()}`,
      competence: comp,
    });
  });

  return questions;
}
