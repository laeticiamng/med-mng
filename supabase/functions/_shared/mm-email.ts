/**
 * Envoi d'e-mails par Resend, commun aux fonctions d'envoi de Med MNG.
 *
 * CONSTAT (audit du 07.10.2026) : les fonctions envoyaient depuis l'adresse de
 * test de Resend (`onboarding@resend.dev`), que Resend refuse (403) pour tout
 * destinataire autre que le titulaire du compte Resend, et plusieurs
 * journalisaient « envoyé » sans lire la réponse. Désormais :
 *
 * - l'expéditeur vient de la variable d'environnement `RESEND_FROM`, soit une
 *   adresse seule (`contact@domaine-verifie.tld`, le nom affiché est ajouté),
 *   soit la forme complète (`Med MNG <contact@domaine-verifie.tld>`). Le domaine
 *   doit être vérifié dans Resend (Domains). À défaut, repli documenté sur
 *   `onboarding@resend.dev` (adresse de test : n'arrive qu'au titulaire du
 *   compte Resend), signalé dans les journaux ;
 * - la réponse HTTP de Resend est toujours lue : un refus renvoie
 *   `{ ok: false }` avec le statut et le nom d'erreur Resend, sans le message
 *   (il peut contenir une adresse) ; aucune adresse n'est journalisée.
 */

export const EXPEDITEUR_PAR_DEFAUT = 'onboarding@resend.dev';

export type ResultatEnvoi =
  | { ok: true; id: string | null }
  | { ok: false; status: number; erreur: string };

type LireEnv = (nom: string) => string | undefined;

const lireEnvDeno: LireEnv = (nom) => {
  try {
    // deno-lint-ignore no-explicit-any
    return (globalThis as any).Deno?.env?.get(nom);
  } catch {
    return undefined;
  }
};

/** Expéditeur à utiliser, avec le nom affiché `nom` si RESEND_FROM n'en porte pas. */
export function expediteur(nom: string, lireEnv: LireEnv = lireEnvDeno): string {
  const brut = (lireEnv('RESEND_FROM') ?? '').trim();
  if (!brut) {
    console.warn(
      `[mm-email] RESEND_FROM absent : repli sur ${EXPEDITEUR_PAR_DEFAUT} (adresse de test Resend, refusée pour les autres destinataires).`,
    );
    return `${nom} <${EXPEDITEUR_PAR_DEFAUT}>`;
  }
  return brut.includes('<') ? brut : `${nom} <${brut}>`;
}

export interface EmailAEnvoyer {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

/**
 * Envoie un e-mail par l'API Resend et rend compte du résultat réel.
 * Sans clé (`RESEND_API_KEY`), rien n'est envoyé : `{ ok: false, status: 0 }`.
 */
export async function envoyerEmail(
  email: EmailAEnvoyer,
  options: { cle?: string | null; fetchImpl?: typeof fetch; idempotence?: string | null } = {},
): Promise<ResultatEnvoi> {
  const cle = options.cle === undefined ? lireEnvDeno('RESEND_API_KEY') : options.cle;
  if (!cle) return { ok: false, status: 0, erreur: 'resend_api_key_absente' };
  const appel = options.fetchImpl ?? fetch;
  let reponse: Response;
  try {
    reponse = await appel('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cle}`,
        'Content-Type': 'application/json',
        // Clé d'idempotence Resend (24 h) : deux appels identiques = un seul e-mail envoyé.
        ...(options.idempotence ? { 'Idempotency-Key': options.idempotence.slice(0, 256) } : {}),
      },
      body: JSON.stringify(email),
    });
  } catch (e) {
    return { ok: false, status: 0, erreur: e instanceof Error ? e.name : 'reseau' };
  }
  const corps = (await reponse.json().catch(() => null)) as { id?: unknown; name?: unknown } | null;
  if (!reponse.ok) {
    const nom = typeof corps?.name === 'string' ? corps.name : `http_${reponse.status}`;
    return { ok: false, status: reponse.status, erreur: nom };
  }
  return { ok: true, id: typeof corps?.id === 'string' ? corps.id : null };
}

/**
 * Domaines réservés (RFC 2606, RFC 6761) : aucune boîte n'y existe. Resend refuse ces
 * destinataires (422 validation_error) — cause des 502 de send-welcome-email observés le
 * 09.10.2026 avec des comptes de test en « @example.com ».
 */
const DOMAINES_RESERVES = /(^|\.)(example\.(com|net|org)|example|test|invalid|localhost)$/i;

/** Vrai si l'adresse ne peut recevoir aucun e-mail (domaine réservé ou absent). */
export function adresseNonLivrable(email: string | null | undefined): boolean {
  const domaine = String(email ?? '').split('@').pop()?.trim().toLowerCase() ?? '';
  return !domaine || !String(email ?? '').includes('@') || DOMAINES_RESERVES.test(domaine);
}

/**
 * Refus définitif de Resend (400/422 : requête ou destinataire invalide) : réessayer ne
 * changera rien et ce n'est pas une panne du service. Les autres échecs (403 domaine
 * expéditeur non vérifié, 429, 5xx, réseau) restent des pannes à signaler.
 */
export function refusDefinitif(resultat: Extract<ResultatEnvoi, { ok: false }>): boolean {
  return resultat.status === 400 || resultat.status === 422;
}

/** Ligne de journal sans donnée personnelle pour un envoi refusé. */
export function journaliserEchec(fonction: string, resultat: Extract<ResultatEnvoi, { ok: false }>): void {
  console.error(`[${fonction}] e-mail NON envoyé (Resend ${resultat.status || 'injoignable'} : ${resultat.erreur})`);
}
