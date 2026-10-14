/**
 * Limites d'usage des fonctions Edge payantes ouvertes aux comptes connectés.
 *
 * Compteur par utilisateur et par jour (UTC) dans la table dédiée
 * `mm_usage_compteurs` (RLS sans politique : lisible et modifiable par le seul
 * service → un utilisateur ne peut pas remettre son compteur à zéro). La table
 * partagée `rate_limit_counters` et sa fonction SQL `increment_rate_limit_counter`
 * ne sont pas utilisées ici : sans unicité, elles ne permettent pas une
 * réservation atomique (voir reserverUtilisationJournaliere).
 *
 * Aucune dépendance Deno : testable avec vitest (src/tests/mmLimiteUsage.test.ts) ; la réservation
 * elle-même est vérifiée sur un vrai Postgres (scripts/test-mm-usage-compteurs.sh).
 */

// deno-lint-ignore no-explicit-any
type ClientSupabase = any;

/** Fenêtre du jour UTC contenant `maintenant` (bornes ISO). */
export function fenetreJourUtc(maintenant: Date): { debut: string; fin: string } {
  const debut = new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate()));
  const fin = new Date(debut.getTime() + 24 * 60 * 60 * 1000);
  return { debut: debut.toISOString(), fin: fin.toISOString() };
}

/** Taille (octets) des données décodées d'une chaîne base64, avec ou sans préfixe « data:…;base64, ». */
export function tailleBase64Decodee(base64: string): number {
  const brut = base64.includes(',') && base64.startsWith('data:') ? base64.slice(base64.indexOf(',') + 1) : base64;
  const nettoye = brut.replace(/\s/g, '');
  const remplissage = nettoye.endsWith('==') ? 2 : nettoye.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((nettoye.length * 3) / 4) - remplissage);
}

export interface ResultatReservation {
  autorise: boolean;
  /** Nombre d'utilisations du jour, celle-ci comprise si autorisée. */
  utilise: number;
}

/**
 * Réserve une utilisation pour (action, utilisateur) dans la fenêtre du jour.
 * Renvoie { autorise: false } si la limite est atteinte, null si le compteur est
 * illisible (l'appelant refuse alors l'appel : pas de dépense non comptée).
 *
 * La réservation est ATOMIQUE, faite en base par la fonction SQL mm_reserver_usage_journalier
 * (table mm_usage_compteurs, clé primaire (identifiant, fenêtre), INSERT ... ON CONFLICT DO UPDATE
 * ... WHERE nombre < max) : exactement `maximum` réservations réussissent, même en appels
 * simultanés. L'ancienne version lisait puis écrivait dans rate_limit_counters sans unicité :
 * 6 appels simultanés pour une limite de 2 en passaient 5 (mesuré en production le 14.10.2026).
 * Migration : supabase/migrations/20261014170000_mm_compteur_usage_journalier.sql.
 */
export async function reserverUtilisationJournaliere(
  supabase: ClientSupabase,
  action: string,
  userId: string,
  maximum: number,
): Promise<ResultatReservation | null> {
  try {
    // Le jour UTC est déterminé par l'horloge de la base, pas par l'appelant.
    const { data, error } = await supabase.rpc('mm_reserver_usage_journalier', {
      p_identifiant: `${action}:${userId}`,
      p_max: maximum,
    });
    if (error) return null;
    const lignes = Array.isArray(data) ? data : data ? [data] : [];
    if (lignes.length !== 1) return null;
    const { autorise, utilise } = lignes[0];
    if (typeof autorise !== 'boolean' || typeof utilise !== 'number' || !Number.isFinite(utilise)) return null;
    return { autorise, utilise };
  } catch {
    return null;
  }
}

const EN_TETES_JSON = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

/**
 * Réponse 429 quand la limite journalière est atteinte (vague « limites d'usage », 05.10.2026) :
 * code QUOTA_JOURNALIER et message en français lisible tel quel par la personne.
 * `libelle` complète « la limite quotidienne de N … » (pluriel). `Retry-After` = secondes
 * jusqu'à minuit UTC (début de la fenêtre suivante).
 */
export function reponseQuotaJournalier(
  cors: Record<string, string>,
  libelle: string,
  maximum: number,
  maintenant: Date = new Date(),
): Response {
  const { fin } = fenetreJourUtc(maintenant);
  const attente = Math.max(1, Math.ceil((Date.parse(fin) - maintenant.getTime()) / 1000));
  const message = `Vous avez atteint la limite quotidienne de ${maximum} ${libelle} ; elle repart demain.`;
  return new Response(
    JSON.stringify({
      success: false,
      code: 'QUOTA_JOURNALIER',
      error: message,
      message,
      limite: maximum,
      reinitialisation: fin,
    }),
    { status: 429, headers: { ...cors, ...EN_TETES_JSON, 'Retry-After': String(attente) } },
  );
}

/** Réponse 503 quand le compteur est illisible : on ne dépense pas sans compter (fail-closed). */
export function reponseVerificationImpossible(cors: Record<string, string>): Response {
  return new Response(
    JSON.stringify({
      success: false,
      code: 'VERIFICATION_IMPOSSIBLE',
      error: 'Service momentanément indisponible. Réessayez dans quelques minutes.',
      message: 'Service momentanément indisponible. Réessayez dans quelques minutes.',
    }),
    { status: 503, headers: { ...cors, ...EN_TETES_JSON } },
  );
}
