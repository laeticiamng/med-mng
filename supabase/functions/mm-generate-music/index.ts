/**
 * 🎵 mm-generate-music — génération audio MED MNG via l'API Suno
 *
 * Documentation : https://docs.sunoapi.org/suno-api/generate-music (25/09/2026)
 *
 *  - Modèle imposé côté serveur : `SUNO_MODEL` (V6, V6_WILD, V6_MINI ou
 *    V4_5ALL), V6 par défaut — le client ne choisit pas.
 *  - Mode custom : paroles dans `lyrics` (≤ 5 000 caractères, coupées à la fin
 *    d'une ligne), `prompt` jamais envoyé ; `style` = tags anglais propres ;
 *    `title` = intitulé court de l'item + rang (≤ 80) ; `negativeTags` cohérents
 *    avec le style ; `vocalGender` si fourni ; styleWeight 0,7 /
 *    weirdnessConstraint 0,3 / variety 1 par défaut ; `duration` explicite
 *    calculée à partir des paroles (sinon Suno rend 20 secondes).
 *  - Droit : abonnement MED MNG Premium actif (administrateurs exemptés) et
 *    quota mensuel (30) sur generated_music_tracks, générations échouées non
 *    comptées.
 *  - Refus Suno (400/402/429/5xx…) → JSON { success:false, error, code } avec un
 *    message utilisateur en français, jamais le message brut du fournisseur.
 *
 * La construction de la requête est dans _shared/mm-suno-requete.ts (module pur
 * testé par vitest : src/tests/mmSunoRequete.test.ts).
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  insertMusicTrack,
  insertGenerationMetric,
  getAuthenticatedUser,
  type MusicTrackInsertData,
} from '../_shared/music-database.ts';
import {
  choisirModeleSuno,
  construireRequeteSuno,
  interpreterReponseGenerate,
  MESSAGE_INDISPONIBLE,
  type ModeleSuno,
} from '../_shared/mm-suno-requete.ts';
import { signerUrlRappel } from '../_shared/mm-suno-rappel.ts';

const URL_SUNO_GENERATE = 'https://api.sunoapi.org/api/v1/generate';

/** Corps accepté depuis le front (src/hooks/musicGenerationUtils.ts → createRequestBody). */
interface RequeteGeneration {
  lyrics?: string | string[];
  style?: string;
  rang?: string;
  itemCode?: string;
  /** Titre officiel de l'item (edn_items_complete.title) → titre court de la chanson. */
  itemTitle?: string;
  title?: string;
  language?: string;
  /** m / f (ou male / female) ; absent → Suno décide. */
  vocalGender?: string;
  negativeTags?: string;
  styleWeight?: number;
  weirdnessConstraint?: number;
  variety?: number;
  /** Durée souhaitée en secondes (10–360) ; absente → calculée d'après les paroles. */
  duration?: number;
  // Champs historiques ignorés : model, customMode, instrumental, fastMode, optimized, composition, personaId, audioWeight.
  [cle: string]: unknown;
}

interface ReponseGeneration {
  success: boolean;
  trackId?: string;
  metadata?: {
    title: string;
    style: string;
    styleLibelle: string;
    stylePrompt: string;
    rang: string;
    duration: number;
    model: ModeleSuno;
    vocalGender?: string;
    negativeTags: string;
    parolesTronquees: boolean;
    lignesRetirees: number;
    generatedAt: string;
    status: 'generating';
    estimated_duration: string;
  };
  error?: string;
  code?: string;
}

/** Générations audio par mois incluses dans MED MNG Premium (= src/config/offre.ts). */
const QUOTA_MENSUEL_PREMIUM = 30;
/** Tentatives du mois, réussies ou échouées (2 × le quota : marge pour les échecs du fournisseur). */
const TENTATIVES_MENSUELLES_MAX = QUOTA_MENSUEL_PREMIUM * 2;
/** Générations non terminées en même temps, sur la fenêtre où le rappel est attendu (15 min). */
const GENERATIONS_SIMULTANEES_MAX = 2;
const FENETRE_EN_COURS_MS = 15 * 60 * 1000;

interface RefusGeneration { status: number; code: string; message: string }

const reponseJson = (corps: unknown, status = 200) =>
  new Response(JSON.stringify(corps), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const PREFIXE_RESERVATION = 'reservation-';

type Reservation = { ok: true; id: string } | { ok: false; status: number; code: string; message: string };

/**
 * Garde-fous de coût (audit rentabilité 09.10.2026, revue Codex #231) : une génération
 * échouée n'est pas décomptée du quota, mais le fournisseur peut la facturer. Avant tout
 * appel au fournisseur, on INSCRIT d'abord une réservation au registre, PUIS on compte
 * (réservation comprise) : deux requêtes parallèles ne peuvent pas passer toutes les deux
 * au-delà de la limite (chacune voit au moins les réservations inscrites avant sa lecture).
 * Plafonds : tentatives du mois (réussies + échouées) et générations simultanées.
 * Toute erreur de lecture ou d'écriture refuse la génération (on ne laisse pas passer).
 */
async function reserverCreneau(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string,
): Promise<Reservation> {
  const indisponible: Reservation = { ok: false, status: 503, code: 'VERIFICATION_IMPOSSIBLE', message: MESSAGE_INDISPONIBLE };
  const id = `${PREFIXE_RESERVATION}${crypto.randomUUID()}`;
  const { error: errInsertion } = await supabase
    .from('mm_generations_audio')
    .insert({ task_id: id, user_id: userId, statut: 'en_cours' });
  if (errInsertion) {
    console.error('❌ Réservation de génération impossible:', errInsertion.message);
    return indisponible;
  }

  const maintenant = new Date();
  const debutMois = new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), 1)).toISOString();
  const depuis = new Date(Date.now() - FENETRE_EN_COURS_MS).toISOString();
  const [tentatives, enCours] = await Promise.all([
    supabase.from('mm_generations_audio').select('task_id', { count: 'exact', head: true })
      .eq('user_id', userId).gte('created_at', debutMois),
    supabase.from('mm_generations_audio').select('task_id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('statut', 'en_cours').gte('created_at', depuis),
  ]);

  let refus: Reservation | null = null;
  if (tentatives.error || enCours.error || tentatives.count == null || enCours.count == null) {
    console.error('❌ Lecture des garde-fous impossible:', tentatives.error?.message ?? enCours.error?.message);
    refus = indisponible;
  } else if (tentatives.count > TENTATIVES_MENSUELLES_MAX) {
    refus = {
      ok: false,
      status: 429,
      code: 'TENTATIVES_ATTEINTES',
      message: `Trop de tentatives de génération ce mois-ci (${TENTATIVES_MENSUELLES_MAX}). Écrivez-nous si un problème technique vous a bloqué.`,
    };
  } else if (enCours.count > GENERATIONS_SIMULTANEES_MAX) {
    refus = {
      ok: false,
      status: 429,
      code: 'GENERATION_EN_COURS',
      message: 'Une chanson est déjà en cours de création. Attendez qu’elle soit prête (1 à 3 minutes) avant d’en lancer une autre.',
    };
  }
  if (refus) {
    await libererCreneau(supabase, id);
    return refus;
  }
  return { ok: true, id };
}

/** Retire la réservation (la génération acceptée a sa propre ligne, au vrai task_id). */
async function libererCreneau(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('mm_generations_audio').delete().eq('task_id', id);
  if (error) console.warn('⚠️ Réservation non retirée (ignorée après 15 min) :', error.message);
}

/**
 * Vérifie qu'un utilisateur peut lancer une génération :
 *  - connecté ;
 *  - abonnement MED MNG Premium actif (user_subscriptions, status active/trialing,
 *    période non échue) — les administrateurs (user_roles) sont exemptés ;
 *  - moins de QUOTA_MENSUEL_PREMIUM générations ce mois-ci.
 *
 * Le décompte lit generated_music_tracks, la table réellement écrite par
 * cette fonction (insertMusicTrack) puis mise à jour par mm-suno-callback /
 * mm-music-status : une ligne « principale » par génération (suno_track_id =
 * task_id) ; les lignes par piste (suno_track_id ≠ task_id) ne sont pas
 * comptées. Les générations échouées ('failed') ne sont pas décomptées.
 * (med_mng_songs n'est alimentée qu'à la fin : inutilisable pour un quota,
 * une génération en cours n'y figurant pas.)
 *
 * CONSTAT (audit 04.10.2026) : les politiques RLS de generated_music_tracks
 * (table partagée avec EmotionsCare) laissent chaque utilisateur modifier ou
 * supprimer ses propres lignes : en passant ses générations à 'failed' par
 * l'API REST, un abonné remettait son compteur à zéro (générations Suno
 * illimitées, facturées). Le décompte retenu est donc le plus élevé de ce
 * décompte historique et du registre `mm_generations_audio`, que seul le
 * serveur écrit (migration 20261005145628). Tant que la migration n'est pas
 * appliquée, le registre est ignoré et le comportement est inchangé.
 */
async function verifierDroitGeneration(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string | null,
): Promise<RefusGeneration | null> {
  if (!userId) {
    return { status: 401, code: 'AUTH_REQUISE', message: 'Veuillez vous connecter pour générer une chanson.' };
  }

  const { data: role } = await supabase
    .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
  if (role) return null;

  const { data: abonnements, error: errAbo } = await supabase
    .from('user_subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing']);
  if (errAbo) {
    console.error('❌ Lecture abonnement impossible:', errAbo.message);
    return { status: 503, code: 'VERIFICATION_IMPOSSIBLE', message: MESSAGE_INDISPONIBLE };
  }
  const actif = (abonnements ?? []).some(
    (a: { current_period_end: string | null }) =>
      !a.current_period_end || new Date(a.current_period_end).getTime() > Date.now(),
  );
  if (!actif) {
    return {
      status: 402,
      code: 'PREMIUM_REQUIS',
      message: 'La génération audio est incluse dans MED MNG Premium (69 €/an ou 9,90 €/mois).',
    };
  }

  const maintenant = new Date();
  const debutMois = new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), 1)).toISOString();
  const { data: pistes, error: errPistes } = await supabase
    .from('generated_music_tracks')
    .select('task_id, suno_track_id, generation_status')
    .eq('user_id', userId)
    .gte('created_at', debutMois)
    .limit(1000);
  if (errPistes) {
    console.error('❌ Lecture du quota impossible:', errPistes.message);
    return { status: 503, code: 'VERIFICATION_IMPOSSIBLE', message: MESSAGE_INDISPONIBLE };
  }
  const utilisees = new Set(
    (pistes ?? [])
      .filter((p: { task_id: string | null; suno_track_id: string | null; generation_status: string | null }) =>
        p.task_id && p.suno_track_id === p.task_id && p.generation_status !== 'failed')
      .map((p: { task_id: string }) => p.task_id),
  ).size;

  // Registre serveur (non modifiable par l'utilisateur) ; absent → ignoré.
  let selonRegistre = 0;
  const { count: nbRegistre, error: errRegistre } = await supabase
    .from('mm_generations_audio')
    .select('task_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', debutMois)
    .neq('statut', 'echouee')
    .not('task_id', 'like', `${PREFIXE_RESERVATION}%`);
  if (errRegistre) {
    console.warn('ℹ️ Registre des générations indisponible (migration non appliquée ?) :', errRegistre.message);
  } else {
    selonRegistre = nbRegistre ?? 0;
  }
  const utiliseesRetenues = Math.max(utilisees, selonRegistre);
  if (selonRegistre > utilisees) {
    console.warn(`⚠️ Quota : ${utilisees} génération(s) visibles dans generated_music_tracks contre ${selonRegistre} au registre pour ${userId}`);
  }

  if (utiliseesRetenues >= QUOTA_MENSUEL_PREMIUM) {
    return {
      status: 429,
      code: 'QUOTA_ATTEINT',
      message: `Vous avez utilisé vos ${QUOTA_MENSUEL_PREMIUM} générations audio de ce mois. Le compteur repart le 1er du mois prochain.`,
    };
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const debut = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await getAuthenticatedUser(supabase, req.headers.get('authorization'));

    // Contrôle serveur : abonnement MED MNG Premium actif + quota mensuel.
    // (Le front ne fait pas foi : ce contrôle est le seul qui compte.)
    // Il précède la lecture du corps : un appel anonyme reçoit 401 quel que soit le corps.
    const refus = await verifierDroitGeneration(supabase, userId);
    if (refus) {
      return reponseJson({ success: false, error: refus.message, code: refus.code }, refus.status);
    }

    let body: RequeteGeneration;
    try {
      body = await req.json();
    } catch {
      return reponseJson({ success: false, error: 'Requête invalide.', code: 'REQUETE_INVALIDE' }, 400);
    }

    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    if (!SUNO_API_KEY || SUNO_API_KEY.length < 10) {
      console.error('🔑 SUNO_API_KEY manquante ou invalide (secrets Supabase).');
      return reponseJson({ success: false, error: MESSAGE_INDISPONIBLE, code: 'CONFIGURATION' }, 503);
    }

    // Modèle imposé côté serveur (env SUNO_MODEL, V6 par défaut) : la valeur du client est ignorée.
    const modele = choisirModeleSuno(Deno.env.get('SUNO_MODEL'));
    if (typeof body.model === 'string' && body.model !== modele) {
      console.log(`ℹ️ Modèle demandé par le client (${body.model}) ignoré, modèle imposé : ${modele}`);
    }

    const paroles = Array.isArray(body.lyrics) ? body.lyrics.join('\n') : (body.lyrics ?? '');
    if (typeof paroles !== 'string' || paroles.trim() === '') {
      return reponseJson({ success: false, error: 'Aucune parole à chanter : choisissez un item et un rang.', code: 'PAROLES_VIDES' }, 400);
    }

    const requete = construireRequeteSuno({
      paroles,
      style: body.style,
      rang: body.rang,
      codeItem: body.itemCode,
      titreItem: body.itemTitle,
      titre: body.title,
      langue: body.language,
      genreVocal: body.vocalGender,
      negativeTags: body.negativeTags,
      styleWeight: body.styleWeight,
      weirdnessConstraint: body.weirdnessConstraint,
      variety: body.variety,
      dureeDemandee: typeof body.duration === 'number' ? body.duration : null,
      modele,
      // URL de rappel signée et liée à l'utilisateur (vague sécurité F66-MM) : sunoapi.org ne
      // signe pas ses rappels, mm-suno-callback refuse ceux dont l'URL n'est pas signée.
      callBackUrl: await signerUrlRappel(
        Deno.env.get('SUPABASE_URL') ?? '',
        userId ?? null,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      ),
    });
    const { chargeUtile, style, rang } = requete;

    if (requete.styleRemplace) {
      console.log(`ℹ️ Style « ${body.style} » inconnu ou ancien → ${style.slug}`);
    }
    if (requete.paroles.tronque) {
      console.log(`⚠️ Paroles coupées à ${chargeUtile.lyrics.length} caractères (${requete.paroles.lignesRetirees} lignes retirées)`);
    }

    console.log('🚀 Requête Suno:', {
      model: chargeUtile.model,
      itemCode: body.itemCode,
      rang,
      style: style.slug,
      styleFinal: chargeUtile.style,
      negativeTags: chargeUtile.negativeTags,
      title: chargeUtile.title,
      lyricsLength: chargeUtile.lyrics.length,
      duration: chargeUtile.duration,
      vocalGender: chargeUtile.vocalGender,
      styleWeight: chargeUtile.styleWeight,
      weirdnessConstraint: chargeUtile.weirdnessConstraint,
      variety: chargeUtile.variety,
      userId,
    });

    // Réservation au registre AVANT l'appel au fournisseur (garde-fous de coût, atomiques).
    let reservation: string | null = null;
    if (userId) {
      const r = await reserverCreneau(supabase, userId);
      if (!r.ok) return reponseJson({ success: false, error: r.message, code: r.code }, r.status);
      reservation = r.id;
    }
    let taskId: string;
    let tempsReponse = 0;
    try {
      const reponseSuno = await fetch(URL_SUNO_GENERATE, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUNO_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(chargeUtile),
      });
      let corpsSuno: unknown = null;
      try {
        corpsSuno = await reponseSuno.json();
      } catch {
        corpsSuno = null;
      }

      const erreur = interpreterReponseGenerate(reponseSuno.status, corpsSuno);
      if (erreur) {
        console.error('❌ Refus Suno:', { http: reponseSuno.status, corps: corpsSuno, code: erreur.code });
        // music_generation_metrics : content_type ∈ {edn, ecos, oic}, status ∈ {initiated, generating, completed, failed, timeout}.
        await insertGenerationMetric(supabase, {
          track_id: `refus_${erreur.code.toLowerCase()}_${Date.now()}`,
          user_id: userId || undefined,
          content_type: 'edn',
          item_code: body.itemCode || 'EDN',
          rang,
          style: style.slug,
          status: 'failed',
          api_response_time_ms: Date.now() - debut,
        });
        return reponseJson({ success: false, error: erreur.message, code: erreur.code }, erreur.statut);
      }

      taskId = (corpsSuno as { data: { taskId: string } }).data.taskId;
      tempsReponse = Date.now() - debut;
      console.log(`🆔 Génération acceptée par Suno (modèle ${chargeUtile.model}) — taskId ${taskId} en ${tempsReponse} ms`);

      // Ligne principale (suno_track_id = task_id) : c'est elle qui compte dans le quota
      // et que mm-suno-callback / mm-music-status font passer à completed / failed.
      const donneesPiste = {
        task_id: taskId,
        title: chargeUtile.title,
        suno_track_id: taskId,
        ...(userId ? { user_id: userId } : {}),
        metadata: {
          style: style.slug,
          styleLibelle: style.libelle,
          stylePrompt: chargeUtile.style,
          negativeTags: chargeUtile.negativeTags,
          rang,
          duration: chargeUtile.duration,
          language: body.language || 'fr',
          itemCode: body.itemCode || 'EDN',
          itemTitle: body.itemTitle || null,
          model: chargeUtile.model,
          prompt: chargeUtile.lyrics,
          provider: 'suno',
          generatedAt: new Date().toISOString(),
          vocalGender: chargeUtile.vocalGender ?? null,
          styleWeight: chargeUtile.styleWeight,
          weirdnessConstraint: chargeUtile.weirdnessConstraint,
          variety: chargeUtile.variety,
          parolesTronquees: requete.paroles.tronque,
          lignesRetirees: requete.paroles.lignesRetirees,
        },
        generation_status: 'generating',
      } as unknown as MusicTrackInsertData;

      const insertion = await insertMusicTrack(supabase, donneesPiste);
      if (!insertion.success) {
        console.error('⚠️ Ligne principale non enregistrée : le suivi côté client ne verra pas cette génération.', insertion.error);
      }

      // Registre du quota (écrit par le serveur seul) ; une erreur ne bloque pas la génération.
      if (userId) {
        const { error: errRegistre } = await supabase
          .from('mm_generations_audio')
          .insert({ task_id: taskId, user_id: userId, statut: 'en_cours' });
        if (errRegistre && errRegistre.code !== '23505') {
          console.warn('⚠️ Génération non inscrite au registre du quota :', errRegistre.message);
        }
      }
    } finally {
      if (reservation) await libererCreneau(supabase, reservation);
    }

    await insertGenerationMetric(supabase, {
      track_id: taskId,
      user_id: userId || undefined,
      content_type: 'edn',
      item_code: body.itemCode || 'EDN',
      rang,
      style: style.slug,
      status: 'initiated',
      api_response_time_ms: tempsReponse,
    });

    const reponse: ReponseGeneration = {
      success: true,
      trackId: taskId,
      metadata: {
        title: chargeUtile.title,
        style: style.slug,
        styleLibelle: style.libelle,
        stylePrompt: chargeUtile.style,
        rang,
        duration: chargeUtile.duration,
        model: chargeUtile.model,
        vocalGender: chargeUtile.vocalGender,
        negativeTags: chargeUtile.negativeTags,
        parolesTronquees: requete.paroles.tronque,
        lignesRetirees: requete.paroles.lignesRetirees,
        generatedAt: new Date().toISOString(),
        status: 'generating',
        estimated_duration: '2-3 minutes',
      },
    };
    return reponseJson(reponse);

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (err.message === 'PAROLES_VIDES') {
      return reponseJson({ success: false, error: 'Aucune parole à chanter : choisissez un item et un rang.', code: 'PAROLES_VIDES' }, 400);
    }
    console.error('❌ ERREUR mm-generate-music:', { message: err.message, stack: err.stack });
    // Jamais de message technique brut côté utilisateur.
    return reponseJson({ success: false, error: MESSAGE_INDISPONIBLE, code: 'ERREUR_INTERNE' }, 500);
  }
});
