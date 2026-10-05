/**
 * 🎙️ Whisper Transcribe - Edge Function pour transcription audio
 * 
 * Utilisations:
 * - Transcrire les notes vocales des étudiants
 * - Convertir des enregistrements de cours en texte
 * - Reconnaissance vocale pour recherche
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { exigerConnexion } from '../_shared/mm-garde.ts';
import { reserverUtilisationJournaliere, tailleBase64Decodee } from '../_shared/mm-limite-usage.ts';

/**
 * Limites (vague 3, D45, 04.10.2026). Fonction ouverte à tout compte connecté (Med MNG et
 * EmotionsCare partagent le projet) et chaque appel est facturé par OpenAI : sans limite, un seul
 * compte gratuit pouvait la solliciter sans fin, avec des fichiers de taille quelconque, et faire
 * télécharger au serveur n'importe quelle adresse (audioUrl).
 */
/**
 * Audio décodé accepté (OpenAI accepte 25 Mo ; ~6 min d'enregistrement compressé).
 * 6 Mo, et non 10 : la plateforme Supabase coupe elle-même les corps d'environ 14 Mo (502 au bout
 * de ~30 s, mesuré le 05.10.2026), si bien que le refus explicite (413) de cette fonction
 * n'était jamais atteint. Avec 6 Mo, le corps maximal (~8 Mo) reste sous ce plafond.
 */
const TAILLE_MAX_AUDIO_OCTETS = 6 * 1024 * 1024;
/** Corps de requête maximal : audio en base64 (4/3) + marge pour les autres champs. */
const TAILLE_MAX_CORPS_OCTETS = Math.ceil((TAILLE_MAX_AUDIO_OCTETS * 4) / 3) + 64 * 1024;
/** Transcriptions par compte et par jour (UTC). La clé de service n'est pas limitée. */
const TRANSCRIPTIONS_MAX_PAR_JOUR = 20;

/** Lit le corps sans le garder (voir le refus 413 ci-dessous). */
async function ignorerCorps(req: Request): Promise<void> {
  try {
    const lecteur = req.body?.getReader();
    if (!lecteur) return;
    while (!(await lecteur.read()).done) {
      // contenu ignoré
    }
  } catch {
    // connexion interrompue par le client : rien à faire
  }
}

const refus = (status: number, code: string, error: string) =>
  new Response(JSON.stringify({ success: false, code, error }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

/** audioUrl : uniquement un fichier du stockage Supabase de ce projet (pas de téléchargement arbitraire). */
function audioUrlAutorisee(audioUrl: string): boolean {
  const base = Deno.env.get('SUPABASE_URL') ?? '';
  try {
    const url = new URL(audioUrl);
    const projet = new URL(base);
    return url.protocol === 'https:' && url.host === projet.host && url.pathname.startsWith('/storage/v1/object/');
  } catch {
    return false;
  }
}

interface TranscribeRequest {
  audioBase64?: string;
  audioUrl?: string;
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

interface TranscribeResponse {
  success: boolean;
  text?: string;
  duration?: number;
  language?: string;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  // Réservé aux utilisateurs connectés (ou à la clé de service) : déployée avec verify_jwt = false, cette fonction
  // dépensait des crédits d'API payants pour tout appelant, même anonyme
  // (revue critique du 04.10.2026, _shared/mm-garde.ts).
  const acces = await exigerConnexion(req, corsHeaders);
  if (acces instanceof Response) return acces;

  // Taille annoncée du corps : refus avant tout traitement. Le corps est tout de même lu (et
  // ignoré) : la plateforme ne transmet pas une réponse envoyée avant la fin de l'envoi d'un gros
  // corps (le client attendait sans fin ; mesuré le 05.10.2026).
  const longueur = Number(req.headers.get('content-length') ?? '0');
  if (longueur > TAILLE_MAX_CORPS_OCTETS) {
    await ignorerCorps(req);
    return refus(413, 'AUDIO_TROP_VOLUMINEUX', 'Enregistrement trop volumineux (6 Mo au maximum).');
  }

  let corps: TranscribeRequest;
  try {
    const texte = await req.text();
    if (texte.length > TAILLE_MAX_CORPS_OCTETS) {
      return refus(413, 'AUDIO_TROP_VOLUMINEUX', 'Enregistrement trop volumineux (6 Mo au maximum).');
    }
    corps = JSON.parse(texte);
  } catch {
    return refus(400, 'REQUETE_INVALIDE', 'Requête invalide.');
  }

  try {
    const { 
      audioBase64, 
      audioUrl, 
      language = 'fr', 
      prompt,
      response_format = 'verbose_json',
      temperature = 0
    }: TranscribeRequest = corps ?? {};

    if (!audioBase64 && !audioUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Either audioBase64 or audioUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (audioBase64 && typeof audioBase64 !== 'string') {
      return refus(400, 'REQUETE_INVALIDE', 'Requête invalide.');
    }
    if (audioBase64 && tailleBase64Decodee(audioBase64) > TAILLE_MAX_AUDIO_OCTETS) {
      return refus(413, 'AUDIO_TROP_VOLUMINEUX', 'Enregistrement trop volumineux (6 Mo au maximum).');
    }
    if (!audioBase64 && (typeof audioUrl !== 'string' || !audioUrlAutorisee(audioUrl))) {
      return refus(400, 'URL_NON_AUTORISEE', 'Seuls les fichiers audio du stockage de la plateforme sont acceptés.');
    }

    // Limite journalière par compte, réservée AVANT l'appel payant (un appel en échec compte aussi).
    if (!acces.service && acces.userId) {
      const reservation = await reserverUtilisationJournaliere(
        createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''),
        'whisper-transcribe',
        acces.userId,
        TRANSCRIPTIONS_MAX_PAR_JOUR,
      );
      if (!reservation) {
        return refus(503, 'VERIFICATION_IMPOSSIBLE', 'Service momentanément indisponible. Réessayez dans quelques minutes.');
      }
      if (!reservation.autorise) {
        return refus(429, 'LIMITE_ATTEINTE', `Limite de ${TRANSCRIPTIONS_MAX_PAR_JOUR} transcriptions par jour atteinte. Réessayez demain.`);
      }
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎙️ Whisper transcription starting...');

    // Get audio data
    let audioData: Uint8Array;
    let filename = 'audio.webm';

    if (audioBase64) {
      // Decode base64 (préfixe « data:…;base64, » accepté)
      const brut = audioBase64.startsWith('data:') ? audioBase64.slice(audioBase64.indexOf(',') + 1) : audioBase64;
      audioData = Uint8Array.from(atob(brut), c => c.charCodeAt(0));
    } else if (audioUrl) {
      // Fichier du stockage du projet uniquement (vérifié plus haut), sans suivre de redirection.
      const audioResponse = await fetch(audioUrl, { redirect: 'error', signal: AbortSignal.timeout(20_000) });
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio from URL: ${audioResponse.status}`);
      }
      if (Number(audioResponse.headers.get('content-length') ?? '0') > TAILLE_MAX_AUDIO_OCTETS) {
        return refus(413, 'AUDIO_TROP_VOLUMINEUX', 'Enregistrement trop volumineux (6 Mo au maximum).');
      }
      audioData = new Uint8Array(await audioResponse.arrayBuffer());
      if (audioData.byteLength > TAILLE_MAX_AUDIO_OCTETS) {
        return refus(413, 'AUDIO_TROP_VOLUMINEUX', 'Enregistrement trop volumineux (6 Mo au maximum).');
      }
      // Extract filename from URL
      const urlParts = audioUrl.split('/');
      filename = urlParts[urlParts.length - 1] || filename;
    } else {
      throw new Error('No audio data provided');
    }

    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([audioData as BlobPart], { type: 'audio/webm' });
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', response_format);
    formData.append('temperature', temperature.toString());
    
    if (prompt) {
      formData.append('prompt', prompt);
    }

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error:', response.status, errorText);
      // Détail du prestataire dans les journaux seulement.
      throw new Error(`Whisper API error: ${response.status}`);
    }

    const data = await response.json();

    const result: TranscribeResponse = {
      success: true,
      text: data.text,
      duration: data.duration,
      language: data.language || language,
      segments: data.segments?.map((seg: any) => ({
        id: seg.id,
        start: seg.start,
        end: seg.end,
        text: seg.text,
      })),
    };

    console.log('✅ Whisper transcription completed:', {
      textLength: result.text?.length || 0,
      duration: result.duration,
      segmentsCount: result.segments?.length || 0,
    });

    // Log usage for analytics (non-blocking)
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('ai_usage_logs').insert({
        provider: 'openai',
        model: 'whisper-1',
        audio_duration_seconds: data.duration || 0,
        text_length: result.text?.length || 0,
      });
    } catch (logError) {
      console.log('⚠️ Non-blocking logging error:', logError);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error with Whisper:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to transcribe audio';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
