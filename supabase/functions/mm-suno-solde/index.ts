/**
 * mm-suno-solde — surveillance du solde de crédits sunoapi.org et alerte par e-mail.
 *
 * Appelée toutes les heures par la tâche pg_cron « mm-suno-solde-horaire » (migration
 * 20261027120000_mm_suno_solde.sql). Lit le solde, l'enregistre dans mm_suno_solde_releves (historique de
 * consommation) et envoie un e-mail au destinataire configuré : solde sous le seuil, solde illisible plusieurs
 * fois de suite, surveillance interrompue (voir _shared/mm-suno-solde.ts : seuils, rappels, épisodes).
 *
 * Seuils : table mm_suno_solde_config (ligne id = 1, modifiable sans redéploiement), sinon secrets
 * SUNO_SEUIL_BAS / SUNO_SEUIL_CRITIQUE, sinon 120 / 36 crédits.
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
import {
  choisirSeuils,
  lireSoldeSuno,
  verifierSolde,
  type DerniereAlerte,
  type EtatReleve,
  type FamilleAlerte,
} from '../_shared/mm-suno-solde.ts';

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

const RELEVES = 'mm_suno_solde_releves';
const ETATS_SOLDE = ['bas', 'critique'];
const ETATS_LISIBLES = ['ok', 'bas', 'critique'];

serve(async (req: Request) => {
  if (req.method !== 'POST') return reponse(405, { error: 'methode_non_autorisee' });

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const cleService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !cleService) return reponse(503, { error: 'configuration_incomplete' });
  const admin = createClient(url, cleService, { auth: { persistSession: false } });

  if (!(await appelAutorise(req, admin, cleService))) return reponse(401, { error: 'reserve_au_serveur' });

  // Clé absente : ce n'est pas un refus, c'est une panne de surveillance, enregistrée et alertée comme les autres.
  const cleSuno = Deno.env.get('SUNO_API_KEY') ?? '';

  const { data: config, error: erreurConfig } = await admin
    .from('mm_suno_solde_config')
    .select('seuil_bas, seuil_critique')
    .eq('id', 1)
    .maybeSingle();
  if (erreurConfig) console.error('⚠️ Configuration des seuils illisible, seuils par défaut :', erreurConfig.message);
  const seuils = choisirSeuils(config ?? null, (nom) => Deno.env.get(nom));

  let releveEnregistre = true;
  const sortie = await verifierSolde(
    {
      maintenant: () => new Date(),
      lireCredits: () => lireSoldeSuno(cleSuno),
      dernierReleve: async () => {
        const { data } = await admin.from(RELEVES).select('releve_at').order('releve_at', { ascending: false }).limit(1).maybeSingle();
        return data ? new Date(data.releve_at) : null;
      },
      echecsPrecedents: async () => {
        const { data } = await admin.from(RELEVES).select('etat').order('releve_at', { ascending: false }).limit(24);
        let n = 0;
        for (const r of data ?? []) {
          if (r.etat !== 'indisponible') break;
          n += 1;
        }
        return n;
      },
      derniereAlerte: async (famille: FamilleAlerte): Promise<DerniereAlerte | null> => {
        const { data } = await admin
          .from(RELEVES)
          .select('etat, releve_at')
          .eq('alerte_envoyee', true)
          .in('etat', famille === 'solde' ? ETATS_SOLDE : ['indisponible'])
          .order('releve_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        return data ? { etat: data.etat as EtatReleve, at: new Date(data.releve_at) } : null;
      },
      dernierRetour: async (famille: FamilleAlerte): Promise<Date | null> => {
        const { data } = await admin
          .from(RELEVES)
          .select('releve_at')
          .in('etat', famille === 'solde' ? ['ok'] : ETATS_LISIBLES)
          .order('releve_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        return data ? new Date(data.releve_at) : null;
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
        const { error } = await admin.from(RELEVES).insert({
          credits: releve.credits,
          etat: releve.etat,
          alerte_envoyee: releve.alerteEnvoyee,
          detail: releve.detail,
        });
        if (error) {
          releveEnregistre = false;
          console.error('❌ Relevé du solde Suno non enregistré :', error.message);
        }
      },
    },
    seuils,
  );

  const commun = {
    alerte: sortie.alerte,
    ...(sortie.interruption ? { interruption: sortie.interruption } : {}),
    ...(sortie.erreurEnvoi ? { erreurEnvoi: sortie.erreurEnvoi } : {}),
    ...(releveEnregistre ? {} : { releveEnregistre: false }),
  };
  if (sortie.erreurEnvoi) console.error('❌ Alerte de solde Suno non envoyée :', sortie.erreurEnvoi);

  if (sortie.statut === 502) {
    console.error(`❌ Solde Suno illisible (${sortie.echecs} de suite) :`, sortie.erreur);
    return reponse(502, { etat: 'indisponible', error: 'solde_illisible', raison: sortie.erreur, echecs: sortie.echecs, ...commun });
  }
  if (sortie.etat !== 'ok') {
    console.warn(`⚠️ Solde Suno ${sortie.etat} : ${sortie.credits} crédits (~${sortie.generationsRestantes} générations), alerte : ${sortie.alerte}`);
  }
  return reponse(releveEnregistre ? 200 : 500, {
    credits: sortie.credits,
    etat: sortie.etat,
    generationsRestantes: sortie.generationsRestantes,
    seuils,
    ...commun,
  });
});
