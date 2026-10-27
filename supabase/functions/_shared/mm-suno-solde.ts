/**
 * Suivi du solde de crédits sunoapi.org et alertes (module pur, sans réseau par défaut).
 *
 * POURQUOI : le 22 et le 23.10.2026, 25 générations ont été refusées par le fournisseur (HTTP 402 ou 429,
 * affichées « Le service de génération est saturé ») parce que le solde était tombé à 5,6 crédits. Rien
 * n'avertissait personne. Une génération coûte 12 crédits (mesuré le 26.10.2026 : 1005,6 → 993,6, soit 72
 * crédits pour six générations, deux pistes chacune).
 *
 * Trois familles d'alertes, chacune avec son épisode :
 *  - « solde »        : solde sous le seuil bas ou critique ; réarmée par un relevé « ok » (compte rechargé) ;
 *  - « surveillance » : solde illisible (clé absente, fournisseur injoignable, réponse illisible) pendant
 *                       ECHECS_AVANT_ALERTE vérifications de suite ; réarmée par tout relevé lisible ;
 *  - « interruption » : aucune vérification depuis INTERRUPTION_HEURES (tâche arrêtée, fonction en panne) ;
 *                       signalée par la première vérification qui reprend, une fois par interruption.
 * Une alerte dont l'envoi échoue n'est pas comptée (sauf l'interruption, close par le relevé qui la constate) :
 * elle est retentée à la vérification suivante.
 *
 * Point d'entrée : verifierSolde(), orchestré par la fonction Edge mm-suno-solde (tâche pg_cron horaire).
 * Toutes les dépendances (réseau, base, e-mail, horloge) sont injectées : les tests n'appellent ni Suno ni Resend.
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

/** Vérifications illisibles de suite avant l'alerte « surveillance » (≈ 3 h avec la tâche horaire). */
export const ECHECS_AVANT_ALERTE = 3;
export const RAPPEL_SURVEILLANCE_HEURES = 24;
/** Écart entre deux vérifications au-delà duquel la surveillance est considérée comme interrompue. */
export const INTERRUPTION_HEURES = 3;

export type EtatSolde = 'ok' | 'bas' | 'critique';
export type EtatReleve = EtatSolde | 'indisponible';
export type FamilleAlerte = 'solde' | 'surveillance';

export interface Seuils {
  bas: number;
  critique: number;
}

type LireEnv = (nom: string) => string | undefined;

function nombrePositif(brut: unknown): number | null {
  if (brut == null) return null;
  const texte = String(brut).trim();
  if (texte === '') return null;
  const n = Number(texte.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}

const seuilsCoherents = (bas: number | null, critique: number | null): Seuils | null =>
  bas != null && critique != null && critique < bas ? { bas, critique } : null;

/**
 * Seuils effectifs, par ordre de priorité :
 *  1. la ligne de configuration en base (table mm_suno_solde_config, modifiable sans redéploiement) ;
 *  2. les secrets de fonction SUNO_SEUIL_BAS et SUNO_SEUIL_CRITIQUE ;
 *  3. les valeurs par défaut.
 * Une paire absente, non numérique ou incohérente (critique >= bas) passe à la source suivante.
 */
export function choisirSeuils(config: { seuil_bas?: unknown; seuil_critique?: unknown } | null, lireEnv: LireEnv): Seuils {
  return (
    seuilsCoherents(nombrePositif(config?.seuil_bas), nombrePositif(config?.seuil_critique)) ??
    seuilsCoherents(nombrePositif(lireEnv('SUNO_SEUIL_BAS')), nombrePositif(lireEnv('SUNO_SEUIL_CRITIQUE'))) ?? {
      bas: SEUIL_BAS_DEFAUT,
      critique: SEUIL_CRITIQUE_DEFAUT,
    }
  );
}

/** Seuils sans configuration en base (secrets de fonction, sinon valeurs par défaut). */
export function lireSeuils(lireEnv: LireEnv): Seuils {
  return choisirSeuils(null, lireEnv);
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
  etat: EtatReleve;
  /** Date d'envoi de la dernière alerte réellement partie. */
  at: Date;
}

const heuresDepuis = (maintenant: Date, depuis: Date) => (maintenant.getTime() - depuis.getTime()) / 3_600_000;

/**
 * Alerte « solde » : jamais si le solde est correct. Sinon : première alerte de l'épisode, passage de « bas » à
 * « critique », ou rappel après RAPPEL_*_HEURES sans remontée du solde.
 */
export function fautAlerter(etat: EtatSolde, derniere: DerniereAlerte | null, maintenant: Date): boolean {
  if (etat === 'ok') return false;
  if (!derniere) return true;
  if (etat === 'critique' && derniere.etat !== 'critique') return true;
  return heuresDepuis(maintenant, derniere.at) >= (etat === 'critique' ? RAPPEL_CRITIQUE_HEURES : RAPPEL_BAS_HEURES);
}

/** Alerte « surveillance » : ECHECS_AVANT_ALERTE lectures illisibles de suite, puis un rappel par jour. */
export function fautAlerterSurveillance(echecsConsecutifs: number, derniere: DerniereAlerte | null, maintenant: Date): boolean {
  if (echecsConsecutifs < ECHECS_AVANT_ALERTE) return false;
  if (!derniere) return true;
  return heuresDepuis(maintenant, derniere.at) >= RAPPEL_SURVEILLANCE_HEURES;
}

/**
 * Une alerte n'appartient qu'à son épisode : si un relevé de « retour » (solde redevenu correct pour la famille
 * « solde », solde redevenu lisible pour la famille « surveillance ») est postérieur à la dernière alerte, l'épisode
 * est clos et une nouvelle dégradation est alertée sans attendre le rappel.
 */
export function alerteDeLEpisode(derniere: DerniereAlerte | null, dernierRetour: Date | null): DerniereAlerte | null {
  if (!derniere) return null;
  return dernierRetour && dernierRetour.getTime() > derniere.at.getTime() ? null : derniere;
}

/** Vrai si la vérification précédente est trop ancienne : la surveillance a été interrompue entre-temps. */
export function surveillanceInterrompue(precedent: Date | null, maintenant: Date): boolean {
  return precedent != null && heuresDepuis(maintenant, precedent) >= INTERRUPTION_HEURES;
}

export function formaterCredits(credits: number): string {
  return credits.toFixed(1).replace('.', ',');
}

const formaterDate = (d: Date) =>
  `${d.toISOString().slice(0, 10)} à ${d.toISOString().slice(11, 16)} UTC`;

export interface EmailAlerte {
  sujet: string;
  html: string;
}

const PIED = `<p>Message automatique de la surveillance du solde Suno (fonction mm-suno-solde, toutes les heures).</p>`;

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
    PIED,
  ].join('\n');
  return { sujet, html };
}

const RAISONS: Record<string, string> = {
  cle_absente: 'la clé sunoapi.org (secret SUNO_API_KEY) est absente ou invalide',
  delai_depasse: 'sunoapi.org ne répond pas dans le délai',
  reseau: 'sunoapi.org est injoignable',
  reponse_illisible: 'la réponse de sunoapi.org est illisible',
  http_401: 'sunoapi.org refuse la clé (HTTP 401)',
  http_403: 'sunoapi.org refuse la clé (HTTP 403)',
};

export const decrireRaison = (raison: string): string =>
  RAISONS[raison] ?? (raison.startsWith('http_') ? `sunoapi.org répond HTTP ${raison.slice(5)}` : 'cause inconnue');

export function construireEmailSurveillance(p: { raison: string; echecs: number }): EmailAlerte {
  return {
    sujet: `Med MNG : surveillance des crédits Suno indisponible (${p.echecs} vérifications en échec)`,
    html: [
      `<p>Le solde de crédits sunoapi.org n'a pas pu être lu lors des <strong>${p.echecs}</strong> dernières vérifications : ${decrireRaison(p.raison)}.</p>`,
      `<p>Tant que cela dure, une baisse du solde ne peut pas être signalée. Si la cause est la clé ou le fournisseur, la génération de chansons est probablement en panne elle aussi.</p>`,
      `<p>À faire : vérifier le compte sunoapi.org et le secret SUNO_API_KEY des fonctions Supabase. Rappel toutes les ${RAPPEL_SURVEILLANCE_HEURES} heures tant que le solde reste illisible.</p>`,
      PIED,
    ].join('\n'),
  };
}

export function construireEmailInterruption(p: { depuis: Date; reprise: Date }): EmailAlerte {
  const heures = Math.round(heuresDepuis(p.reprise, p.depuis));
  return {
    sujet: `Med MNG : la surveillance des crédits Suno a été interrompue pendant environ ${heures} h`,
    html: [
      `<p>Aucune vérification du solde Suno n'a eu lieu entre le ${formaterDate(p.depuis)} et le ${formaterDate(p.reprise)}. Elle vient de reprendre.</p>`,
      `<p>Pendant ce temps, une baisse du solde n'aurait pas été signalée. Causes possibles : tâche planifiée « mm-suno-solde-horaire » désactivée, fonction mm-suno-solde en erreur, jeton des tâches planifiées modifié.</p>`,
      PIED,
    ].join('\n'),
  };
}

export type ResultatLecture = { ok: true; credits: number } | { ok: false; raison: string };

/** Lit le solde chez le fournisseur. Ne lève jamais ; la clé n'apparaît ni dans le résultat ni dans les erreurs. */
export async function lireSoldeSuno(
  cle: string,
  options: { fetchImpl?: typeof fetch; delaiMs?: number } = {},
): Promise<ResultatLecture> {
  if (!cle || cle.length < 10) return { ok: false, raison: 'cle_absente' };
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
  /** Date de la vérification précédente (dernier relevé enregistré), ou null s'il n'y en a aucune. */
  dernierReleve: () => Promise<Date | null>;
  /** Nombre de relevés « indisponible » consécutifs juste avant celui-ci. */
  echecsPrecedents: () => Promise<number>;
  /** Dernière alerte réellement envoyée de la famille. */
  derniereAlerte: (famille: FamilleAlerte) => Promise<DerniereAlerte | null>;
  /** Dernier relevé qui clôt un épisode : « ok » pour « solde », lisible pour « surveillance ». */
  dernierRetour: (famille: FamilleAlerte) => Promise<Date | null>;
  /** Adresse du destinataire de l'alerte, ou null si aucune n'est configurée. */
  destinataire: () => Promise<string | null>;
  /** Envoie l'e-mail ; `cleIdempotence` évite un doublon si la tâche est rejouée. */
  envoyer: (email: { to: string; sujet: string; html: string }, cleIdempotence: string) => Promise<{ ok: boolean; erreur?: string }>;
  enregistrer: (releve: { credits: number | null; etat: EtatReleve; alerteEnvoyee: boolean; detail: Record<string, unknown> }) => Promise<void>;
}

export type SortieSolde =
  | {
      statut: 200;
      credits: number;
      etat: EtatSolde;
      generationsRestantes: number;
      alerte: EtatAlerte;
      interruption?: EtatAlerte;
      erreurEnvoi?: string;
    }
  | { statut: 502; etat: 'indisponible'; erreur: string; echecs: number; alerte: EtatAlerte; interruption?: EtatAlerte; erreurEnvoi?: string };

export async function verifierSolde(deps: DependancesSolde, seuils: Seuils): Promise<SortieSolde> {
  const maintenant = deps.maintenant();
  const heure = maintenant.toISOString().slice(0, 13);
  let erreurEnvoi: string | undefined;

  const envoyer = async (email: EmailAlerte, cle: string): Promise<EtatAlerte> => {
    const to = await deps.destinataire();
    if (!to) return 'destinataire_absent';
    const resultat = await deps.envoyer({ to, ...email }, cle);
    if (resultat.ok) return 'envoyee';
    erreurEnvoi = resultat.erreur ?? 'inconnue';
    return 'echec_envoi';
  };

  // 1. Interruption de la surveillance, constatée par la vérification qui reprend.
  const precedent = await deps.dernierReleve();
  const interruption = surveillanceInterrompue(precedent, maintenant)
    ? await envoyer(
        construireEmailInterruption({ depuis: precedent as Date, reprise: maintenant }),
        `mm-suno-solde-interruption-${(precedent as Date).toISOString().slice(0, 16)}`,
      )
    : undefined;
  const avecInterruption = interruption ? { interruption } : {};

  const lecture = await deps.lireCredits();

  // 2. Solde illisible : relevé « indisponible », alerte « surveillance » après plusieurs échecs de suite.
  if (lecture.ok === false) {
    const echecs = 1 + (await deps.echecsPrecedents());
    let alerte: EtatAlerte = 'non_requise';
    if (echecs >= ECHECS_AVANT_ALERTE) {
      const derniere = alerteDeLEpisode(await deps.derniereAlerte('surveillance'), await deps.dernierRetour('surveillance'));
      if (fautAlerterSurveillance(echecs, derniere, maintenant)) {
        alerte = await envoyer(construireEmailSurveillance({ raison: lecture.raison, echecs }), `mm-suno-solde-surveillance-${heure}`);
      }
    }
    await deps.enregistrer({
      credits: null,
      etat: 'indisponible',
      alerteEnvoyee: alerte === 'envoyee',
      detail: { raison: lecture.raison, echecs, alerte, ...avecInterruption, ...(erreurEnvoi ? { erreurEnvoi } : {}) },
    });
    return { statut: 502, etat: 'indisponible', erreur: lecture.raison, echecs, alerte, ...avecInterruption, ...(erreurEnvoi ? { erreurEnvoi } : {}) };
  }

  // 3. Solde lisible : alerte « solde » selon les seuils.
  const { etat, generationsRestantes } = evaluerSolde(lecture.credits, seuils);
  let alerte: EtatAlerte = 'non_requise';
  if (etat !== 'ok') {
    const derniere = alerteDeLEpisode(await deps.derniereAlerte('solde'), await deps.dernierRetour('solde'));
    if (fautAlerter(etat, derniere, maintenant)) {
      alerte = await envoyer(
        construireEmailAlerte({ credits: lecture.credits, etat, generationsRestantes, seuils }),
        `mm-suno-solde-${etat}-${heure}`,
      );
    }
  }

  await deps.enregistrer({
    credits: lecture.credits,
    etat,
    alerteEnvoyee: alerte === 'envoyee',
    detail: { alerte, generationsRestantes, seuils, ...avecInterruption, ...(erreurEnvoi ? { erreurEnvoi } : {}) },
  });

  return {
    statut: 200,
    credits: lecture.credits,
    etat,
    generationsRestantes,
    alerte,
    ...avecInterruption,
    ...(erreurEnvoi ? { erreurEnvoi } : {}),
  };
}
