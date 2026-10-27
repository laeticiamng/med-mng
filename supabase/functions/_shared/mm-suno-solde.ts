/**
 * Suivi du solde de crédits sunoapi.org et alerte de solde bas (module pur, sans réseau par défaut).
 *
 * POURQUOI : le 22 et le 23.10.2026, 25 générations ont été refusées par le fournisseur (HTTP 402 ou 429,
 * affichées « Le service de génération est saturé ») parce que le solde était tombé à 5,6 crédits. Rien
 * n'avertissait personne. Une génération coûte 12 crédits (mesuré le 26.10.2026 : 1005,6 → 993,6, soit 72
 * crédits pour six générations, deux pistes chacune).
 *
 * Point d'entrée : verifierSolde(), orchestré par la fonction Edge mm-suno-solde (tâche pg_cron horaire).
 * Toutes les dépendances (réseau, base, e-mail, horloge) sont injectées : les tests n'appellent ni Suno ni Resend.
 *
 * Aucune adresse e-mail et aucune clé ne sont journalisées ni renvoyées.
 */

/** Point d'entrée du solde (GET, jeton porteur). `/get-credits` répond 404 : ne pas l'utiliser. */
export const URL_CREDITS_SUNO = 'https://api.sunoapi.org/api/v1/generate/credit';

/** Crédits consommés par une requête de génération (deux pistes), mesurés le 26.10.2026. */
export const COUT_GENERATION_CREDITS = 12;

/** Alerte « bas » sous ce solde : une dizaine de générations. */
export const SEUIL_BAS_DEFAUT = 120;
/** Alerte « critique » sous ce solde : trois générations. */
export const SEUIL_CRITIQUE_DEFAUT = 36;

/** Délai avant de renvoyer le même niveau d'alerte tant que le solde ne remonte pas. */
export const RAPPEL_BAS_HEURES = 24;
export const RAPPEL_CRITIQUE_HEURES = 6;

export type EtatSolde = 'ok' | 'bas' | 'critique';

export interface Seuils {
  bas: number;
  critique: number;
}

type LireEnv = (nom: string) => string | undefined;

function nombrePositif(brut: string | undefined): number | null {
  if (brut == null || brut.trim() === '') return null;
  const n = Number(brut.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Seuils effectifs : SUNO_SEUIL_BAS et SUNO_SEUIL_CRITIQUE (secrets de fonction, facultatifs). Une valeur
 * absente, non numérique ou incohérente (critique >= bas) ramène aux valeurs par défaut.
 */
export function lireSeuils(lireEnv: LireEnv): Seuils {
  const bas = nombrePositif(lireEnv('SUNO_SEUIL_BAS'));
  const critique = nombrePositif(lireEnv('SUNO_SEUIL_CRITIQUE'));
  if (bas != null && critique != null && critique < bas) return { bas, critique };
  return { bas: SEUIL_BAS_DEFAUT, critique: SEUIL_CRITIQUE_DEFAUT };
}

export function evaluerSolde(credits: number, seuils: Seuils): { etat: EtatSolde; generationsRestantes: number } {
  const generationsRestantes = Math.max(0, Math.floor(credits / COUT_GENERATION_CREDITS));
  if (credits < seuils.critique) return { etat: 'critique', generationsRestantes };
  if (credits < seuils.bas) return { etat: 'bas', generationsRestantes };
  return { etat: 'ok', generationsRestantes };
}

/** Réponse du fournisseur : `{ code: 200, msg, data: <nombre> }`. null si le solde n'est pas lisible. */
export function extraireCredits(corps: unknown): number | null {
  if (!corps || typeof corps !== 'object') return null;
  const c = corps as { code?: unknown; data?: unknown };
  if (c.code !== 200) return null;
  const valeur = typeof c.data === 'string' ? Number(c.data) : c.data;
  return typeof valeur === 'number' && Number.isFinite(valeur) && valeur >= 0 ? valeur : null;
}

export interface DerniereAlerte {
  etat: EtatSolde;
  /** Date d'envoi de la dernière alerte réellement partie. */
  at: Date;
}

/**
 * Faut-il envoyer une alerte maintenant ? Jamais si le solde est correct. Sinon : première alerte, passage de
 * « bas » à « critique », ou rappel après RAPPEL_*_HEURES sans remontée du solde. Une alerte dont l'envoi a
 * échoué n'est pas comptée : elle sera retentée à la vérification suivante.
 */
export function fautAlerter(etat: EtatSolde, derniere: DerniereAlerte | null, maintenant: Date): boolean {
  if (etat === 'ok') return false;
  if (!derniere) return true;
  if (etat === 'critique' && derniere.etat !== 'critique') return true;
  const heures = (maintenant.getTime() - derniere.at.getTime()) / 3_600_000;
  return heures >= (etat === 'critique' ? RAPPEL_CRITIQUE_HEURES : RAPPEL_BAS_HEURES);
}

/**
 * Une alerte n'appartient qu'à son épisode : si le solde est redevenu correct (relevé « ok ») après la dernière
 * alerte, le compte a été rechargé et une nouvelle baisse est un nouvel épisode, alerté sans attendre le rappel.
 */
export function alerteDeLEpisode(derniere: DerniereAlerte | null, dernierRetourOk: Date | null): DerniereAlerte | null {
  if (!derniere) return null;
  return dernierRetourOk && dernierRetourOk.getTime() > derniere.at.getTime() ? null : derniere;
}

export function formaterCredits(credits: number): string {
  return credits.toFixed(1).replace('.', ',');
}

export interface EmailAlerte {
  sujet: string;
  html: string;
}

export function construireEmailAlerte(p: { credits: number; etat: EtatSolde; generationsRestantes: number; seuils: Seuils }): EmailAlerte {
  const critique = p.etat === 'critique';
  const solde = formaterCredits(p.credits);
  const sujet = critique
    ? `Med MNG : crédits Suno presque épuisés (${solde}, ${p.generationsRestantes} génération${p.generationsRestantes > 1 ? 's' : ''})`
    : `Med MNG : crédits Suno bas (${solde}, environ ${p.generationsRestantes} générations)`;
  const html = [
    `<p>Le solde de crédits sunoapi.org est de <strong>${solde}</strong>, soit environ <strong>${p.generationsRestantes}</strong> génération${p.generationsRestantes > 1 ? 's' : ''} de chanson (${COUT_GENERATION_CREDITS} crédits chacune).</p>`,
    critique
      ? `<p><strong>Sous ${formaterCredits(p.seuils.critique)} crédits :</strong> les prochaines générations vont être refusées par le fournisseur.</p>`
      : `<p>Seuil d'alerte : ${formaterCredits(p.seuils.bas)} crédits.</p>`,
    `<p>Ce que voient les utilisateurs quand le solde est épuisé : « Le service de génération est saturé pour le moment. Réessayez dans quelques minutes. » Rien n'indique que c'est un problème de crédits.</p>`,
    `<p>À faire : recharger le compte sur sunoapi.org. L'alerte se répète toutes les ${critique ? RAPPEL_CRITIQUE_HEURES : RAPPEL_BAS_HEURES} heures tant que le solde ne remonte pas.</p>`,
  ].join('\n');
  return { sujet, html };
}

export type ResultatLecture = { ok: true; credits: number } | { ok: false; raison: string };

/** Lit le solde chez le fournisseur. Ne lève jamais ; la clé n'apparaît ni dans le résultat ni dans les erreurs. */
export async function lireSoldeSuno(
  cle: string,
  options: { fetchImpl?: typeof fetch; delaiMs?: number } = {},
): Promise<ResultatLecture> {
  const appel = options.fetchImpl ?? fetch;
  const controleur = new AbortController();
  const minuteur = setTimeout(() => controleur.abort(), options.delaiMs ?? 8000);
  try {
    const reponse = await appel(URL_CREDITS_SUNO, {
      headers: { Authorization: `Bearer ${cle}` },
      signal: controleur.signal,
    });
    const corps = await reponse.json().catch(() => null);
    if (!reponse.ok) return { ok: false, raison: `http_${reponse.status}` };
    const credits = extraireCredits(corps);
    return credits == null ? { ok: false, raison: 'reponse_illisible' } : { ok: true, credits };
  } catch (e) {
    return { ok: false, raison: e instanceof Error && e.name === 'AbortError' ? 'delai_depasse' : 'reseau' };
  } finally {
    clearTimeout(minuteur);
  }
}

export type EtatAlerte = 'non_requise' | 'envoyee' | 'destinataire_absent' | 'echec_envoi';

export interface DependancesSolde {
  maintenant: () => Date;
  lireCredits: () => Promise<ResultatLecture>;
  derniereAlerte: () => Promise<DerniereAlerte | null>;
  /** Date du dernier relevé à l'état « ok » (solde redevenu correct), ou null s'il n'y en a aucun. */
  dernierRetourOk: () => Promise<Date | null>;
  /** Adresse du destinataire de l'alerte, ou null si aucune n'est configurée. */
  destinataire: () => Promise<string | null>;
  /** Envoie l'e-mail ; `cleIdempotence` évite un doublon si la tâche est rejouée. */
  envoyer: (email: { to: string; sujet: string; html: string }, cleIdempotence: string) => Promise<{ ok: boolean; erreur?: string }>;
  enregistrer: (releve: { credits: number; etat: EtatSolde; alerteEnvoyee: boolean; detail: Record<string, unknown> }) => Promise<void>;
}

export type SortieSolde =
  | { statut: 200; credits: number; etat: EtatSolde; generationsRestantes: number; alerte: EtatAlerte; erreurEnvoi?: string }
  | { statut: 502; erreur: string };

export async function verifierSolde(deps: DependancesSolde, seuils: Seuils): Promise<SortieSolde> {
  const lecture = await deps.lireCredits();
  if (lecture.ok === false) return { statut: 502, erreur: lecture.raison };

  const maintenant = deps.maintenant();
  const { etat, generationsRestantes } = evaluerSolde(lecture.credits, seuils);

  let alerte: EtatAlerte = 'non_requise';
  let erreurEnvoi: string | undefined;
  const derniere = etat === 'ok' ? null : await deps.derniereAlerte();
  const retourOk = derniere ? await deps.dernierRetourOk() : null;
  if (fautAlerter(etat, alerteDeLEpisode(derniere, retourOk), maintenant)) {
    const to = await deps.destinataire();
    if (!to) {
      alerte = 'destinataire_absent';
    } else {
      const email = construireEmailAlerte({ credits: lecture.credits, etat, generationsRestantes, seuils });
      const heure = maintenant.toISOString().slice(0, 13);
      const resultat = await deps.envoyer({ to, ...email }, `mm-suno-solde-${etat}-${heure}`);
      alerte = resultat.ok ? 'envoyee' : 'echec_envoi';
      if (!resultat.ok) erreurEnvoi = resultat.erreur ?? 'inconnue';
    }
  }

  await deps.enregistrer({
    credits: lecture.credits,
    etat,
    alerteEnvoyee: alerte === 'envoyee',
    detail: { alerte, generationsRestantes, seuils, ...(erreurEnvoi ? { erreurEnvoi } : {}) },
  });

  return { statut: 200, credits: lecture.credits, etat, generationsRestantes, alerte, ...(erreurEnvoi ? { erreurEnvoi } : {}) };
}
