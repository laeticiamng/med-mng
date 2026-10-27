/**
 * mm-suno-solde — surveillance du solde de crédits sunoapi.org et alerte par e-mail.
 *
 * Appelée toutes les heures par la tâche pg_cron « mm-suno-solde-horaire » (migration
 * 20261027120000_mm_suno_solde.sql). Lit le solde, l'enregistre dans mm_suno_solde_releves (historique de
 * consommation) et envoie un e-mail au destinataire configuré quand il passe sous le seuil (voir
 * _shared/mm-suno-solde.ts : seuils, rappels, cas d'échec).
 *
 * ACCÈS : serveur uniquement, comme les autres fonctions qui touchent un fournisseur payant.
 *  - clé service_role en jeton porteur ; ou
 *  - en-tête `x-tache-planifiee` : jeton des tâches planifiées gardé dans Vault et vérifié par la RPC
 *    `f66_verifier_jeton_tache` (créée par la vague F66, réservée à service_role). Le jeton ne quitte
 *    jamais la base. Si la RPC est absente ou en erreur, l'appel est refusé.
 *
 * La réponse ne contient ni adresse, ni clé : état, solde et issue de l'alerte seulement.
 *
 * Déployée avec verify_jwt = false (voir supabase/config.toml) : la clé publique est un JWT valide, le
 * contrôle se fait ici.
 */
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { envoyerEmail, expediteur } from '../_shared/mm-email.ts';
import { jetonAppelant } from '../_shared/mm-garde.ts';
import { lireSeuils, lireSoldeSuno, verifierSolde, type DerniereAlerte, type EtatSolde } from '../_shared/mm-suno-solde.ts';

const EN_TETES = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const FORMAT_JETON_TACHE = /^[0-9a-f]{64}$/;

const reponse = (statut: number, corps: Record<string, unknown>) =>
  new Response(JSON.stringify(corps), { status: statut, headers: EN_TETES });

/** Comparaison à temps constant sur des condensés SHA-256 de même longueur. */
async function egauxTempsConstant(a: string, b: string): Promise<boolean> {
  if (!a || !b) return false;
  const encodeur = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', encodeur.encode(a)),
    crypto.subtle.digest('SHA-256', encodeur.encode(b)),
  ]);
  const va = new Uint8Array(ha);
  const vb = new Uint8Array(hb);
  let ecart = 0;
  for (let i = 0; i < va.length; i += 1) ecart |= va[i] ^ vb[i];
  return ecart === 0;
}

// deno-lint-ignore no-explicit-any
async function appelAutorise(req: Request, admin: any, cleService: string): Promise<boolean> {
  if (await egauxTempsConstant(jetonAppelant(req), cleService)) return true;
  const jeton = (req.headers.get('x-tache-planifiee') ?? '').trim();
  if (!FORMAT_JETON_TACHE.test(jeton)) return false;
  try {
    const { data, error } = await admin.rpc('f66_verifier_jeton_tache', { p_jeton: jeton });
    return !error && data === true;
  } catch {
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method !== 'POST') return reponse(405, { error: 'methode_non_autorisee' });

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const cleService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const cleSuno = Deno.env.get('SUNO_API_KEY') ?? '';
  if (!url || !cleService) return reponse(503, { error: 'configuration_incomplete' });
  const admin = createClient(url, cleService, { auth: { persistSession: false } });

  if (!(await appelAutorise(req, admin, cleService))) return reponse(401, { error: 'reserve_au_serveur' });
  if (cleSuno.length < 10) return reponse(503, { error: 'cle_suno_absente' });

  const seuils = lireSeuils((nom) => Deno.env.get(nom));

  const sortie = await verifierSolde(
    {
      maintenant: () => new Date(),
      lireCredits: () => lireSoldeSuno(cleSuno),
      derniereAlerte: async (): Promise<DerniereAlerte | null> => {
        const { data } = await admin
          .from('mm_suno_solde_releves')
          .select('etat, releve_at')
          .eq('alerte_envoyee', true)
          .order('releve_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        return data ? { etat: data.etat as EtatSolde, at: new Date(data.releve_at) } : null;
      },
      destinataire: async () => {
        const { data, error } = await admin.rpc('mm_suno_alerte_destinataire');
        return !error && typeof data === 'string' && data.includes('@') ? data : null;
      },
      envoyer: async (email, cleIdempotence) => {
        const resultat = await envoyerEmail(
          { from: expediteur('Med MNG'), to: [email.to], subject: email.sujet, html: email.html },
          { idempotence: cleIdempotence },
        );
        return resultat.ok ? { ok: true } : { ok: false, erreur: `${resultat.erreur}${resultat.status ? ` (${resultat.status})` : ''}` };
      },
      enregistrer: async (releve) => {
        const { error } = await admin.from('mm_suno_solde_releves').insert({
          credits: releve.credits,
          etat: releve.etat,
          alerte_envoyee: releve.alerteEnvoyee,
          detail: releve.detail,
        });
        if (error) console.error('❌ Relevé du solde Suno non enregistré :', error.message);
      },
    },
    seuils,
  );

  if (sortie.statut === 502) {
    console.error('❌ Solde Suno illisible :', sortie.erreur);
    return reponse(502, { error: 'solde_illisible', raison: sortie.erreur });
  }
  if (sortie.etat !== 'ok') {
    console.warn(`⚠️ Solde Suno ${sortie.etat} : ${sortie.credits} crédits (~${sortie.generationsRestantes} générations), alerte : ${sortie.alerte}`);
  }
  return reponse(200, {
    credits: sortie.credits,
    etat: sortie.etat,
    generationsRestantes: sortie.generationsRestantes,
    alerte: sortie.alerte,
    ...(sortie.erreurEnvoi ? { erreurEnvoi: sortie.erreurEnvoi } : {}),
  });
});
