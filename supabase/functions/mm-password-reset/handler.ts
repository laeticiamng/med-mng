/**
 * Réinitialisation du mot de passe Med MNG — logique de la fonction `mm-password-reset`.
 *
 * CONSTAT (recette en production du 14.10.2026) : « Mot de passe oublié » appelait
 * supabase.auth.resetPasswordForEmail avec redirectTo = medmng.com. Le projet Supabase est PARTAGÉ
 * avec EmotionsCare : son URL de site est emotionscare.com et medmng.com n'est pas dans la liste
 * des redirections autorisées (réglage auth que nous ne modifions pas). GoTrue retombait sur l'URL
 * du site : le lien reçu (gabarit anglais par défaut, expéditeur noreply@mail.app.supabase.io)
 * menait à emotionscare.com, sans formulaire. Le SMTP par défaut de Supabase est en outre très limité.
 *
 * Désormais, sans toucher à la configuration auth :
 * - `auth.admin.generateLink({ type: 'recovery' })` produit un jeton SANS envoyer d'e-mail ; seul
 *   `hashed_token` est retenu (jamais `action_link`, qui porte la redirection fautive) ;
 * - le lien est construit ici, sur une base FIXE (MEDMNG_SITE_URL, à défaut https://medmng.com),
 *   jamais d'après les en-têtes Origin ou Host de la requête (injection d'hôte) ;
 * - l'e-mail part par Resend (domaine medmng.com vérifié), en français, au nom de Med MNG ;
 * - la page /med-mng/reset-password échange le jeton avec supabase.auth.verifyOtp.
 *
 * Sécurité :
 * - anti-énumération : 200 { ok: true } que le compte existe ou non, y compris en cas d'échec de
 *   generateLink ou de Resend, et SANS écart de délai : la réponse part dès la validation et le
 *   limiteur ; generateLink et l'envoi Resend se font ensuite en tâche de fond (EdgeRuntime.waitUntil).
 *   Seuls diffèrent : 400 (adresse mal formée), 429 (limite), 503
 *   (limiteur indisponible) — aucun ne dépend de l'existence du compte ;
 * - limite durable (table rate_limit_counters, fenêtre = heure UTC pleine) : 3 demandes par heure
 *   par adresse et 10 par heure par IP, clés = SHA-256 (jamais l'adresse ni l'IP en clair) ;
 *   limiteur illisible → 503, échec fermé : aucun jeton n'est produit sans avoir compté ;
 * - aucune adresse e-mail dans les journaux.
 *
 * Aucune dépendance distante : le module est testable en local avec de faux clients
 * (handler.test.ts). Le point d'entrée (index.ts) branche les vraies dépendances.
 */
import { getCorsHeaders } from '../_shared/cors.ts';
import {
  type EmailAEnvoyer,
  adresseNonLivrable,
  envoyerEmail as envoyerEmailResend,
  expediteur,
  journaliserEchec,
  type ResultatEnvoi,
} from '../_shared/mm-email.ts';
import { fenetreHeureUtc, type ResultatReservation, reserverUtilisation } from '../_shared/mm-limite-usage.ts';

export const DEMANDES_MAX_PAR_HEURE_ET_EMAIL = 3;
export const DEMANDES_MAX_PAR_HEURE_ET_IP = 10;
export const SITE_PAR_DEFAUT = 'https://medmng.com';
const LONGUEUR_MAX_CORPS = 2_000;
const LONGUEUR_MAX_EMAIL = 254;

// deno-lint-ignore no-explicit-any
type ClientSupabase = any;

export interface Dependances {
  /** Client Supabase avec la clé de service (limiteur et génération du jeton). */
  creerClientService: () => ClientSupabase;
  envoyerEmail: (email: EmailAEnvoyer) => Promise<ResultatEnvoi>;
  lireEnv: (nom: string) => string | undefined;
  maintenant: () => Date;
  /**
   * Poursuit `tache` après l'envoi de la réponse (EdgeRuntime.waitUntil en production : l'instance
   * reste en vie jusqu'à la fin). La tâche ne rejette jamais.
   */
  enArrierePlan: (tache: Promise<void>) => void;
}

/** Adresse normalisée (minuscules, sans espaces autour), ou null si elle n'est pas plausible. */
export function normaliserEmail(valeur: unknown): string | null {
  if (typeof valeur !== 'string') return null;
  const email = valeur.trim().toLowerCase();
  if (!email || email.length > LONGUEUR_MAX_EMAIL) return null;
  const [local, domaine, ...reste] = email.split('@');
  if (reste.length > 0 || !local || !domaine || local.length > 64) return null;
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return null;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null;
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domaine)) return null;
  return email;
}

/** Hachage SHA-256 en hexadécimal : seules ces empreintes sont stockées. */
export async function empreinte(valeur: string): Promise<string> {
  const octets = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(valeur));
  return Array.from(new Uint8Array(octets), (o) => o.toString(16).padStart(2, '0')).join('');
}

/** IP de l'appelant : première valeur de x-forwarded-for (posé par la passerelle Supabase). */
export function ipAppelant(req: Request): string {
  const premiere = (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim();
  return premiere || 'inconnue';
}

/**
 * Base du site pour le lien : MEDMNG_SITE_URL si c'est une URL https valide (seule son origine est
 * retenue), sinon https://medmng.com. Jamais dérivée de la requête.
 */
export function baseSite(lireEnv: (nom: string) => string | undefined): string {
  const brut = (lireEnv('MEDMNG_SITE_URL') ?? '').trim();
  if (!brut) return SITE_PAR_DEFAUT;
  try {
    const url = new URL(brut);
    return url.protocol === 'https:' ? url.origin : SITE_PAR_DEFAUT;
  } catch {
    return SITE_PAR_DEFAUT;
  }
}

export function lienReinitialisation(base: string, jetonHache: string): string {
  return `${base}/med-mng/reset-password?token_hash=${encodeURIComponent(jetonHache)}&type=recovery`;
}

const echapper = (texte: string) =>
  texte.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export function contenuEmail(lien: string): { sujet: string; html: string } {
  const href = echapper(lien);
  return {
    sujet: 'Réinitialisation de votre mot de passe Med MNG',
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Réinitialisation de votre mot de passe Med MNG</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="font-size: 22px;">Réinitialisation de votre mot de passe</h1>
  <p>Bonjour,</p>
  <p>Vous avez demandé à choisir un nouveau mot de passe pour votre compte Med MNG.</p>
  <p style="text-align: center; margin: 28px 0;">
    <a href="${href}" style="display: inline-block; background: #3B82F6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Choisir un nouveau mot de passe</a>
  </p>
  <p>Ce lien est valable 1 heure et ne peut servir qu'une fois.</p>
  <p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe actuel reste inchangé.</p>
  <p style="font-size: 13px; color: #6b7280;">Le bouton ne fonctionne pas ? Copiez cette adresse dans votre navigateur :<br><span style="word-break: break-all;">${href}</span></p>
  <p style="font-size: 13px; color: #6b7280;">Med MNG — EmotionsCare SASU — <a href="${SITE_PAR_DEFAUT}" style="color: #3B82F6;">medmng.com</a></p>
</body>
</html>`,
  };
}

/** Message lisible tel quel : « Trop de demandes, réessayez dans 12 minutes. » */
export function messageAttente(secondes: number): string {
  const minutes = Math.max(1, Math.ceil(secondes / 60));
  return `Trop de demandes, réessayez dans ${minutes} ${minutes > 1 ? 'minutes' : 'minute'}.`;
}

export function creerHandler(deps: Dependances): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const cors = {
      ...getCorsHeaders(req),
      // Retry-After n'est lisible par le navigateur (appel entre origines) que s'il est exposé.
      'Access-Control-Expose-Headers': 'Retry-After',
    };
    const repondre = (corps: unknown, status = 200, extra: Record<string, string> = {}) =>
      new Response(JSON.stringify(corps), {
        status,
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
      });
    // Réponse unique, identique que le compte existe ou non.
    const accepte = () => repondre({ ok: true });

    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return repondre({ ok: false, code: 'METHODE_NON_AUTORISEE' }, 405, { Allow: 'POST, OPTIONS' });

    // 1. Validation de l'adresse.
    let email: string | null = null;
    try {
      const texte = await req.text();
      if (texte.length <= LONGUEUR_MAX_CORPS) email = normaliserEmail((JSON.parse(texte) as { email?: unknown })?.email);
    } catch {
      email = null;
    }
    if (!email) {
      return repondre({ ok: false, code: 'EMAIL_INVALIDE', message: "Saisissez une adresse e-mail valide." }, 400);
    }

    const maintenant = deps.maintenant();
    const fenetre = fenetreHeureUtc(maintenant);

    // 2. Limites durables, réservées AVANT toute production de jeton : IP puis adresse.
    // Limiteur illisible (ou en exception) = 503, échec fermé.
    let admin: ClientSupabase;
    let reservationIp: ResultatReservation | null = null;
    let reservationEmail: ResultatReservation | null = null;
    try {
      admin = deps.creerClientService();
      reservationIp = await reserverUtilisation(
        admin, `mm-mdp-ip:${await empreinte(ipAppelant(req))}`, DEMANDES_MAX_PAR_HEURE_ET_IP, fenetre, maintenant,
      );
      if (reservationIp?.autorise) {
        reservationEmail = await reserverUtilisation(
          admin, `mm-mdp-email:${await empreinte(email)}`, DEMANDES_MAX_PAR_HEURE_ET_EMAIL, fenetre, maintenant,
        );
      }
    } catch (e) {
      console.error('[mm-password-reset] limiteur en exception', e instanceof Error ? e.name : 'inconnue');
      reservationIp = null;
    }
    if (!reservationIp || (reservationIp.autorise && !reservationEmail)) {
      return repondre({
        ok: false,
        code: 'VERIFICATION_IMPOSSIBLE',
        message: 'Service momentanément indisponible. Réessayez dans quelques minutes.',
      }, 503);
    }
    if (!reservationIp.autorise || !reservationEmail?.autorise) {
      const attente = Math.max(1, Math.ceil((Date.parse(fenetre.fin) - maintenant.getTime()) / 1000));
      return repondre(
        { ok: false, code: 'TROP_DE_DEMANDES', message: messageAttente(attente), retry_after: attente },
        429,
        { 'Retry-After': String(attente) },
      );
    }

    // 3. Jeton et e-mail EN TÂCHE DE FOND : la réponse part tout de suite, identique pour tous. Sinon
    // son délai révélerait l'existence du compte (un compte existant attend l'appel HTTP à Resend,
    // une adresse inconnue rend la main dès l'échec de generateLink). Le travail synchrone est le
    // même sur les deux chemins : validation et limiteur.
    deps.enArrierePlan(produireEtEnvoyer(deps, admin, email));
    return accepte();
  };
}

/**
 * Jeton de récupération puis e-mail. Ne rejette jamais : tout échec est journalisé SANS adresse
 * (la réponse HTTP est déjà partie, identique que le compte existe ou non).
 */
async function produireEtEnvoyer(deps: Dependances, admin: ClientSupabase, email: string): Promise<void> {
  try {
    // Adresse sans boîte possible (domaine réservé) : rien à envoyer.
    if (adresseNonLivrable(email)) return;

    const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email });
    const jetonHache = data?.properties?.hashed_token;
    if (error || typeof jetonHache !== 'string' || !jetonHache) {
      // Compte inexistant (cas normal) ou panne. Code d'erreur seulement.
      console.log('[mm-password-reset] aucun lien produit', error?.code ?? error?.status ?? 'sans_jeton');
      return;
    }

    const { sujet, html } = contenuEmail(lienReinitialisation(baseSite(deps.lireEnv), jetonHache));
    const envoi = await deps.envoyerEmail({ from: expediteur('Med MNG'), to: [email], subject: sujet, html });
    if (!envoi.ok) journaliserEchec('mm-password-reset', envoi);
    else console.log('[mm-password-reset] e-mail envoyé', envoi.id ?? 'sans identifiant');
  } catch (e) {
    console.error('[mm-password-reset] échec inattendu', e instanceof Error ? e.name : 'inconnue');
  }
}

/** Dépendances de production, pour index.ts. */
export function dependancesReelles(creerClientService: () => ClientSupabase): Dependances {
  return {
    creerClientService,
    envoyerEmail: (email) => envoyerEmailResend(email),
    lireEnv: (nom) => {
      try {
        // deno-lint-ignore no-explicit-any
        return (globalThis as any).Deno?.env?.get(nom);
      } catch {
        return undefined;
      }
    },
    maintenant: () => new Date(),
    enArrierePlan: (tache) => {
      // deno-lint-ignore no-explicit-any
      const runtime = (globalThis as any).EdgeRuntime;
      // Repli hors runtime Supabase (Deno local, tests) : la tâche se poursuit seule, sans attente.
      if (typeof runtime?.waitUntil === 'function') runtime.waitUntil(tache);
    },
  };
}
