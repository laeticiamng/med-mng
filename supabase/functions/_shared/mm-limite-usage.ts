/**
 * Limites d'usage des fonctions Edge payantes ouvertes aux comptes connectés.
 *
 * Compteur par utilisateur et par jour (UTC) dans la table existante
 * `rate_limit_counters` (RLS : écriture réservée au service et aux
 * administrateurs, lecture de ses propres lignes seulement → un utilisateur
 * ne peut pas remettre son compteur à zéro). La fonction SQL
 * `increment_rate_limit_counter` n'est pas utilisée : son calcul de fenêtre
 * ouvre une nouvelle fenêtre chaque minute dès que la durée dépasse 60 s.
 *
 * Aucune dépendance Deno : testable avec vitest (src/tests/mmLimiteUsage.test.ts).
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
 * Incrément optimiste (mise à jour conditionnée à la valeur lue), 3 essais.
 */
export async function reserverUtilisationJournaliere(
  supabase: ClientSupabase,
  action: string,
  userId: string,
  maximum: number,
  maintenant: Date = new Date(),
): Promise<ResultatReservation | null> {
  const identifiant = `${action}:${userId}`;
  const { debut, fin } = fenetreJourUtc(maintenant);
  for (let essai = 0; essai < 3; essai++) {
    const { data, error } = await supabase
      .from('rate_limit_counters')
      .select('id, request_count')
      .eq('identifier', identifiant)
      .eq('window_start', debut)
      .order('created_at', { ascending: true })
      .limit(1);
    if (error) return null;
    const ligne = Array.isArray(data) ? data[0] : null;

    if (!ligne) {
      const { error: errInsertion } = await supabase.from('rate_limit_counters').insert({
        identifier: identifiant,
        window_start: debut,
        window_end: fin,
        request_count: 1,
        max_requests: maximum,
      });
      if (errInsertion) return null;
      return { autorise: true, utilise: 1 };
    }

    const actuel = Number(ligne.request_count) || 0;
    if (actuel >= maximum) return { autorise: false, utilise: actuel };

    const { data: maj, error: errMaj } = await supabase
      .from('rate_limit_counters')
      .update({ request_count: actuel + 1, updated_at: maintenant.toISOString() })
      .eq('id', ligne.id)
      .eq('request_count', actuel)
      .select('request_count');
    if (errMaj) return null;
    if (Array.isArray(maj) && maj.length > 0) return { autorise: true, utilise: actuel + 1 };
    // Mise à jour concurrente : on relit.
  }
  return null;
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
