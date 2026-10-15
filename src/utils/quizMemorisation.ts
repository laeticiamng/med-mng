import type { QuestionAffichee, QuestionMemo } from '@/data/quizMemorisation/types';
import { statutAffichable } from '@/data/quizMemorisation/verification';

/**
 * Logique pure du quiz de mémorisation (sans React, sans réseau) :
 * sélection des questions affichables, construction d’une série courte,
 * mémoire des notions à revoir.
 */

export const TAILLE_SERIE = 5;

export type RangMemo = 'A' | 'B';

/** Questions qu’on a le droit d’afficher : statut suffisant selon l’environnement. */
export function questionsAffichables(questions: readonly QuestionMemo[], pilote: boolean): QuestionMemo[] {
  return questions.filter((q) => statutAffichable(q.verification.statut, pilote));
}

export function compterParRang(questions: readonly QuestionAffichee[]): Record<RangMemo, number> {
  return {
    A: questions.filter((q) => q.rang === 'A').length,
    B: questions.filter((q) => q.rang === 'B').length,
  };
}

/** Notions à revoir : identifiant de question → nombre d’échecs depuis la dernière réussite. */
export type NotionsARevoir = Record<string, { erreurs: number; dernier: string }>;

export interface ResultatQuestion {
  id: string;
  ok: boolean;
}

/**
 * Série courte pour un rang : les notions à revoir d’abord (les plus ratées en
 * premier), puis les autres en tournant d’un cran à chaque série (`decalage`)
 * pour ne pas reposer toujours les mêmes. Déterministe.
 */
export function construireSerie({
  questions,
  rang,
  aRevoir = {},
  decalage = 0,
  taille = TAILLE_SERIE,
}: {
  questions: readonly QuestionAffichee[];
  rang: RangMemo;
  aRevoir?: NotionsARevoir;
  decalage?: number;
  taille?: number;
}): QuestionAffichee[] {
  const duRang = questions.filter((q) => q.rang === rang);
  const revoir = duRang
    .filter((q) => (aRevoir[q.id]?.erreurs ?? 0) > 0)
    .sort((a, b) => aRevoir[b.id].erreurs - aRevoir[a.id].erreurs || a.id.localeCompare(b.id));
  const autres = duRang.filter((q) => !revoir.includes(q));
  const n = autres.length;
  const tournees = n === 0 ? [] : autres.map((_, i) => autres[(i + (((decalage % n) + n) % n)) % n]);
  return [...revoir, ...tournees].slice(0, Math.max(1, taille));
}

export const scoreSerie = (resultats: readonly ResultatQuestion[]) => {
  const retenues = resultats.filter((r) => r.ok).length;
  const total = resultats.length;
  return { retenues, total, pourcentage: total === 0 ? 0 : Math.round((retenues / total) * 100) };
};

/**
 * Une réussite fait sortir la notion de la liste « à revoir » ; un échec
 * l’y ajoute (ou y ajoute une erreur). Ne modifie pas l’objet reçu.
 */
export function mettreAJourNotions(
  actuelles: NotionsARevoir,
  resultats: readonly ResultatQuestion[],
  maintenant: Date = new Date(),
): NotionsARevoir {
  const suivantes: NotionsARevoir = { ...actuelles };
  for (const { id, ok } of resultats) {
    if (ok) delete suivantes[id];
    else suivantes[id] = { erreurs: (actuelles[id]?.erreurs ?? 0) + 1, dernier: maintenant.toISOString() };
  }
  return suivantes;
}

/** Notions à revoir qui appartiennent bien à la liste de questions donnée. */
export function notionsConcernees(aRevoir: NotionsARevoir, questions: readonly QuestionAffichee[]): string[] {
  return questions.filter((q) => (aRevoir[q.id]?.erreurs ?? 0) > 0).map((q) => q.id);
}

/* ------------------------------------------------------------------------ */
/* Stockage local (par appareil et par compte) — tolérant aux erreurs        */
/* ------------------------------------------------------------------------ */

export interface StockageSimple {
  getItem(cle: string): string | null;
  setItem(cle: string, valeur: string): void;
}

const PREFIXE_CLE = 'medmng:memo:a-revoir:v1';
export const cleStockageNotions = (utilisateurId: string | null) =>
  `${PREFIXE_CLE}:${utilisateurId ?? 'visiteur'}`;
export const cleStockageSeries = (utilisateurId: string | null, itemCode: string, rang: RangMemo) =>
  `medmng:memo:series:v1:${utilisateurId ?? 'visiteur'}:${itemCode}:${rang}`;

const estNotions = (valeur: unknown): valeur is NotionsARevoir =>
  typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur) &&
  Object.values(valeur).every(
    (v) => typeof v === 'object' && v !== null && Number.isFinite((v as { erreurs?: unknown }).erreurs),
  );

export function lireNotions(stockage: StockageSimple | null, utilisateurId: string | null): NotionsARevoir {
  if (!stockage) return {};
  try {
    const brut = stockage.getItem(cleStockageNotions(utilisateurId));
    const valeur: unknown = brut ? JSON.parse(brut) : {};
    return estNotions(valeur) ? valeur : {};
  } catch {
    return {};
  }
}

export function ecrireNotions(
  stockage: StockageSimple | null,
  utilisateurId: string | null,
  notions: NotionsARevoir,
): void {
  if (!stockage) return;
  try {
    stockage.setItem(cleStockageNotions(utilisateurId), JSON.stringify(notions));
  } catch {
    /* stockage plein ou bloqué (navigation privée) : la série reste utilisable */
  }
}

/** Nombre de séries déjà terminées pour cet item et ce rang (sert de `decalage`). */
export function lireNombreSeries(
  stockage: StockageSimple | null,
  utilisateurId: string | null,
  itemCode: string,
  rang: RangMemo,
): number {
  if (!stockage) return 0;
  try {
    const n = Number(stockage.getItem(cleStockageSeries(utilisateurId, itemCode, rang)));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export function incrementerNombreSeries(
  stockage: StockageSimple | null,
  utilisateurId: string | null,
  itemCode: string,
  rang: RangMemo,
): void {
  if (!stockage) return;
  try {
    stockage.setItem(
      cleStockageSeries(utilisateurId, itemCode, rang),
      String(lireNombreSeries(stockage, utilisateurId, itemCode, rang) + 1),
    );
  } catch {
    /* ignoré */
  }
}

export const stockageNavigateur = (): StockageSimple | null => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
};
