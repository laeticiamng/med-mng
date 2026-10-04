import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

/**
 * Contrôles d'accès des fonctions Edge qui dépensent des crédits payants
 * (Suno, ElevenLabs, OpenAI, Perplexity, Firecrawl, passerelle IA).
 *
 * CONSTAT (revue critique du 04.10.2026, vérifié en production) : ces fonctions
 * sont déployées avec verify_jwt = false et n'identifiaient pas l'appelant.
 * Sans aucun en-tête, `ai-audio` répondait à `get_credits` (HTTP 200) et
 * `mm-chat-with-ai`, `mm-openai-chat`, `mm-perplexity-search`,
 * `mm-firecrawl-scrape` et `medical-chat-ai` passaient directement à la
 * validation de la requête : n'importe qui pouvait générer des chansons Suno
 * (la fonctionnalité Premium) ou utiliser les clés d'API sans compte.
 *
 * Remarque : verify_jwt = true ne suffirait pas, la clé publique (anon) étant
 * elle-même un JWT valide. Le contrôle se fait donc ici, dans le code.
 *
 * Chaque fonction renvoie l'appelant identifié, ou une réponse 401/402/403 à
 * retourner telle quelle. La clé de service (appels serveur à serveur) est
 * toujours acceptée.
 */

type Cors = Record<string, string>;

export interface Appelant {
  /** Identifiant de l'utilisateur ; null pour un appel avec la clé de service. */
  userId: string | null;
  /** Appel serveur à serveur (clé de service). */
  service: boolean;
}

const repondre = (cors: Cors, status: number, code: string, error: string) =>
  new Response(JSON.stringify({ success: false, code, error }), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

const clientService = () =>
  createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

/** Jeton de l'en-tête Authorization (sans « Bearer »), chaîne vide sinon. */
export const jetonAppelant = (req: Request): string =>
  (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();

/**
 * Identifie l'appelant : clé de service ou session utilisateur valide.
 * null si aucun jeton, clé publique (anon) seule ou session invalide.
 */
export async function identifierAppelant(req: Request): Promise<Appelant | null> {
  const jeton = jetonAppelant(req);
  if (!jeton) return null;
  const cleService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (cleService && jeton === cleService) return { userId: null, service: true };
  try {
    const { data, error } = await clientService().auth.getUser(jeton);
    if (error || !data?.user?.id) return null;
    return { userId: data.user.id, service: false };
  } catch {
    return null;
  }
}

/** Utilisateur connecté (ou clé de service) ; 401 sinon. */
export async function exigerConnexion(req: Request, cors: Cors): Promise<Appelant | Response> {
  const appelant = await identifierAppelant(req);
  if (!appelant) return repondre(cors, 401, 'AUTH_REQUISE', 'Veuillez vous connecter.');
  return appelant;
}

/** Administrateur (rôle admin) ou clé de service ; 401/403 sinon. */
export async function exigerAdministrateur(req: Request, cors: Cors): Promise<Appelant | Response> {
  const appelant = await identifierAppelant(req);
  if (!appelant) return repondre(cors, 401, 'AUTH_REQUISE', 'Authentification requise.');
  if (appelant.service) return appelant;
  const { data: role } = await clientService()
    .from('user_roles').select('role').eq('user_id', appelant.userId).eq('role', 'admin').maybeSingle();
  if (!role) return repondre(cors, 403, 'ADMIN_REQUIS', 'Réservé aux administrateurs.');
  return appelant;
}

/**
 * Abonné MED MNG Premium (ou administrateur, ou clé de service) — même règle
 * que mm-generate-music et le verrou du contenu immersif (RPC
 * mm_a_acces_premium) ; 401/402 sinon, 503 si la vérification est impossible.
 */
export async function exigerPremium(req: Request, cors: Cors): Promise<Appelant | Response> {
  const appelant = await identifierAppelant(req);
  if (!appelant) return repondre(cors, 401, 'AUTH_REQUISE', 'Veuillez vous connecter.');
  if (appelant.service) return appelant;
  const { data, error } = await clientService().rpc('mm_a_acces_premium', { p_user_id: appelant.userId });
  if (error) {
    console.error('❌ Vérification Premium impossible :', error.message);
    return repondre(cors, 503, 'VERIFICATION_IMPOSSIBLE', 'Service momentanément indisponible. Réessayez dans quelques minutes.');
  }
  if (data !== true) {
    return repondre(cors, 402, 'PREMIUM_REQUIS', 'Fonctionnalité incluse dans MED MNG Premium (69 €/an ou 9,90 €/mois).');
  }
  return appelant;
}

/** Fonctionnalité retirée (410) : remplace un point d'entrée coûteux sans contrôle. */
export const fonctionRetiree = (cors: Cors, message: string) => repondre(cors, 410, 'RETIREE', message);
