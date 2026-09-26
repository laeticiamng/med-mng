/**
 * 🎵 Hook principal de génération audio Med MNG (mm-generate-music + suivi).
 *
 * Chemin complet : mm-generate-music (taskId) → mm-suno-callback met à jour
 * generated_music_tracks (ligne principale task_id) → ce hook lit la table
 * (RLS : ses propres lignes) et, en secours, mm-music-status (rattrapage si un
 * callback s'est perdu) → URL audio → lecteur ; la bibliothèque
 * (med_mng_songs / med_mng_user_songs) est alimentée par le callback.
 */

import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { audioApi } from '@/lib/unifiedApiClient';
import { useCallback, useRef, useState } from 'react';
import { callSunoApi } from '../musicGenerationApi';
import {
    createRequestBody,
    formaterDuree,
    getSuccessMessage,
    validateGenerationInput,
    type ParametresAvances,
} from '../musicGenerationUtils';
import { useMusicGenerationState } from '../useMusicGenerationState';
import { useMusicTranslation } from './useMusicTranslation';
import { useMusicValidation } from './useMusicValidation';

const MAX_POLL_ATTEMPTS = 150;
const FAST_POLL_INTERVAL = 2000; // 0-30 s
const POLL_INTERVAL = 4000;      // 30 s – 2 min
const SLOW_POLL_INTERVAL = 6000; // 2 min et plus
const ABSOLUTE_TIMEOUT = 10 * 60 * 1000; // 10 minutes (mm-music-status abandonne à 15 min)
/** Avant ce délai, seule la table est lue (le callback Suno arrive en général en 1–3 min). */
const DELAI_AVANT_STATUT_SERVEUR = 45_000;

const MESSAGE_INDISPONIBLE = 'Service momentanément indisponible, réessayez plus tard.';
const MESSAGE_SUIVI_INTERROMPU = 'Suivi interrompu : si la chanson aboutit, elle apparaîtra dans votre bibliothèque.';

/**
 * Message affiché à l'utilisateur : on garde les messages métier en français
 * renvoyés par mm-generate-music / mm-music-status (abonnement requis, quota
 * atteint, refus du service…) et on remplace tout message technique
 * (codes HTTP, « non-2xx », trackId, fetch…) par un message d'indisponibilité.
 */
export const messageErreurGeneration = (error: unknown): string => {
  const brut = error instanceof Error ? error.message : '';
  if (!brut) return "Impossible de générer la musique. Veuillez réessayer.";
  const technique = /\b(402|429|4\d\d|5\d\d)\b|non-2xx|edge function|fetch|trackid|suno|payment|credit|rate limit|url audio|undefined|null/i;
  return technique.test(brut) ? MESSAGE_INDISPONIBLE : brut;
};

export interface OptionsGeneration {
  itemCode?: string;
  /** Titre officiel de l'item → titre court de la chanson (côté serveur). */
  itemTitle?: string;
  /** Durée souhaitée (secondes, 10–360) ; absente → calculée d'après les paroles. */
  dureeDemandee?: number;
  advancedParams?: Partial<ParametresAvances>;
}

export interface EtapeGeneration {
  etape: 'envoi' | 'en_cours' | 'prete' | 'echec';
  taskId?: string;
  titre?: string;
  dureeDemandee?: number;
  parolesTronquees?: boolean;
  lignesRetirees?: number;
}

export interface ResultatGeneration {
  audioUrl: string;
  taskId: string;
  titre?: string;
  dureeDemandee?: number;
  parolesTronquees?: boolean;
  lignesRetirees?: number;
}

export const useSunoMusicGeneration = () => {
  const { toast } = useToast();
  const [pollingProgress, setPollingProgress] = useState<number>(0);
  const [etape, setEtape] = useState<EtapeGeneration | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<boolean>(false);
  /** Rejet de l'attente en cours (cancelGeneration), pour que generateMusicInLanguage se termine. */
  const rejetEnCoursRef = useRef<((raison: Error) => void) | null>(null);

  const {
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    setLastError,
    setGeneratingState,
    setAudioUrl,
    isAlreadyGenerating,
    markAsGenerating,
    unmarkAsGenerating
  } = useMusicGenerationState();

  const { currentLanguage, translateLyricsIfNeeded } = useMusicTranslation();
  const { validateAndNormalizeAudioUrl } = useMusicValidation();

  /** Attend l'audio : table (RLS) puis mm-music-status ; résout avec l'URL audio ou rejette (échec / délai). */
  const pollForAudioUrl = useCallback(async (
    taskId: string,
    rang: 'A' | 'B' | 'AB'
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      let networkRetries = 0;
      abortRef.current = false;
      rejetEnCoursRef.current = reject;
      const pollingStartTime = Date.now();

      const arreter = () => {
        clearTimeout(absoluteTimeout);
        if (pollingRef.current) clearTimeout(pollingRef.current);
        rejetEnCoursRef.current = null;
      };

      const absoluteTimeout = setTimeout(() => {
        abortRef.current = true;
        if (pollingRef.current) clearTimeout(pollingRef.current);
        reject(new Error('La génération prend trop de temps (10 min). Elle apparaîtra dans votre bibliothèque si elle aboutit ; sinon elle ne vous est pas décomptée.'));
      }, ABSOLUTE_TIMEOUT);

      const terminerAvecAudio = (url: string) => {
        setPollingProgress(100);
        arreter();
        setAudioUrl(rang, url);
        resolve(url);
      };

      const checkStatus = async () => {
        if (abortRef.current) {
          clearTimeout(absoluteTimeout);
          reject(new Error(MESSAGE_SUIVI_INTERROMPU));
          return;
        }
        attempts++;

        // Progression estimée d'après le temps réel écoulé (Suno : 1 à 3 minutes en général).
        const realElapsedMs = Date.now() - pollingStartTime;
        let estimatedProgress: number;
        if (realElapsedMs < 30000) {
          estimatedProgress = (realElapsedMs / 30000) * 30;
        } else if (realElapsedMs < 60000) {
          estimatedProgress = 30 + ((realElapsedMs - 30000) / 30000) * 20;
        } else if (realElapsedMs < 120000) {
          estimatedProgress = 50 + ((realElapsedMs - 60000) / 60000) * 30;
        } else {
          estimatedProgress = 80 + Math.min(((realElapsedMs - 120000) / 180000) * 15, 15);
        }
        setPollingProgress(Math.min(Math.round(estimatedProgress), 95));

        try {
          // 1. Notre table (mise à jour par mm-suno-callback), lecture directe sous RLS.
          const { data: dbTrack } = await supabase
            .from('generated_music_tracks')
            .select('audio_url, generation_status, metadata, updated_at')
            .eq('task_id', taskId)
            .eq('suno_track_id', taskId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (dbTrack?.audio_url && dbTrack.generation_status === 'completed') {
            terminerAvecAudio(dbTrack.audio_url);
            return;
          }
          if (dbTrack?.generation_status === 'failed') {
            arreter();
            const meta = (dbTrack.metadata ?? {}) as { error?: string };
            reject(new Error(meta.error || 'La génération a échoué. Elle ne vous est pas décomptée : réessayez.'));
            return;
          }

          // 2. Après 45 s : mm-music-status (rattrapage auprès de Suno si le callback s'est perdu).
          if (realElapsedMs >= DELAI_AVANT_STATUT_SERVEUR) {
            const statusResponse = await audioApi.getStatus(taskId);
            if (!statusResponse.success) {
              networkRetries++;
            } else {
              networkRetries = 0;
              const data = statusResponse.data;
              if (data?.status === 'completed' && data.audioUrl) {
                terminerAvecAudio(data.audioUrl);
                return;
              }
              if (data?.status === 'failed') {
                arreter();
                reject(new Error(data.error || 'La génération a échoué. Elle ne vous est pas décomptée : réessayez.'));
                return;
              }
            }
          }

          if (attempts >= MAX_POLL_ATTEMPTS) {
            arreter();
            reject(new Error('La génération prend trop de temps. Elle apparaîtra dans votre bibliothèque si elle aboutit ; sinon elle ne vous est pas décomptée.'));
            return;
          }

          if (!abortRef.current) {
            const interval = realElapsedMs < 30000
              ? FAST_POLL_INTERVAL
              : (realElapsedMs > 120000 || networkRetries > 1) ? SLOW_POLL_INTERVAL : POLL_INTERVAL;
            pollingRef.current = setTimeout(checkStatus, interval) as unknown as NodeJS.Timeout;
          }
        } catch (err) {
          networkRetries++;
          if (attempts >= MAX_POLL_ATTEMPTS || abortRef.current) {
            arreter();
            reject(abortRef.current ? new Error(MESSAGE_SUIVI_INTERROMPU) : err);
            return;
          }
          if (!abortRef.current) {
            const interval = networkRetries > 1 ? SLOW_POLL_INTERVAL : POLL_INTERVAL;
            pollingRef.current = setTimeout(checkStatus, interval) as unknown as NodeJS.Timeout;
          }
        }
      };

      pollingRef.current = setTimeout(checkStatus, 2000) as unknown as NodeJS.Timeout;
    });
  }, [setAudioUrl]);

  /**
   * Lance la génération d'un rang et attend l'audio.
   * `paroles` : lignes du rang choisi (paroles_rang_a / _b / _ab de la RPC
   * mm_contenu_immersif_item) ; le serveur coupe à 5 000 caractères si besoin.
   * Résout avec l'URL audio, le taskId et le titre construit par le serveur.
   */
  const generateMusicInLanguage = async (
    rang: 'A' | 'B' | 'AB',
    paroles: string[],
    selectedStyle: string,
    options: OptionsGeneration = {}
  ): Promise<ResultatGeneration> => {

    if (isAlreadyGenerating(rang)) {
      throw new Error('Une génération est déjà en cours pour ce rang.');
    }

    try {
      const preparees = validateGenerationInput(paroles, selectedStyle, rang);

      markAsGenerating(rang);
      setGeneratingState(rang, true);
      setLastError('');
      setPollingProgress(0);
      setEtape({ etape: 'envoi' });

      if (preparees.tronque) {
        toast({
          title: 'Paroles raccourcies',
          description: `Les paroles dépassent la limite du service (5 000 caractères) : les ${preparees.lignesRetirees} dernières lignes ne seront pas chantées.`,
        });
      }

      const translatedLyrics = await translateLyricsIfNeeded(preparees.texte);
      const requestBody = createRequestBody(
        translatedLyrics,
        selectedStyle,
        rang,
        currentLanguage,
        options.itemCode || 'EDN',
        options.itemTitle,
        options.advancedParams
      );
      if (typeof options.dureeDemandee === 'number') {
        (requestBody as typeof requestBody & { duration?: number }).duration = options.dureeDemandee;
      }

      // Étape 1 : mm-generate-music (contrôles serveur, envoi à Suno) → taskId.
      const response = await callSunoApi(requestBody);
      setEtape({
        etape: 'en_cours',
        taskId: response.trackId,
        titre: response.titre,
        dureeDemandee: response.dureeDemandee,
        parolesTronquees: response.parolesTronquees,
        lignesRetirees: response.lignesRetirees,
      });

      const dureeTexte = formaterDuree(response.dureeDemandee ?? preparees.dureeEstimee);
      toast({
        title: 'Génération lancée',
        description: `${rang === 'AB' ? 'Rang A+B' : `Rang ${rang}`} · environ ${dureeTexte} · patientez 1 à 3 minutes.`,
      });

      // Étape 2 : attendre l'audio (table + mm-music-status).
      const audioUrl = await pollForAudioUrl(response.trackId, rang);

      // Étape 3 : valider l'URL.
      const validatedUrl = validateAndNormalizeAudioUrl(audioUrl);
      if (!validatedUrl) {
        throw new Error('Le service a renvoyé un fichier audio inutilisable. Réessayez.');
      }

      setEtape((e) => ({ ...(e ?? { etape: 'prete' }), etape: 'prete' }));
      const successMessage = getSuccessMessage(rang, dureeTexte, currentLanguage);
      toast({ title: successMessage.title, description: successMessage.description });

      return {
        audioUrl: validatedUrl,
        taskId: response.trackId,
        titre: response.titre,
        dureeDemandee: response.dureeDemandee,
        parolesTronquees: response.parolesTronquees,
        lignesRetirees: response.lignesRetirees,
      };

    } catch (error) {
      const errorMessage = messageErreurGeneration(error);
      setLastError(errorMessage);
      setEtape({ etape: 'echec' });
      const interrompu = errorMessage === MESSAGE_SUIVI_INTERROMPU;
      toast({
        title: interrompu ? 'Suivi interrompu' : 'Génération impossible',
        description: errorMessage,
        variant: interrompu ? 'default' : 'destructive'
      });
      throw new Error(errorMessage);
    } finally {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
      unmarkAsGenerating(rang);
      setGeneratingState(rang, false);
      setPollingProgress(0);
    }
  };

  /** Arrête le suivi (la génération côté Suno continue et sera dans la bibliothèque si elle aboutit). */
  const cancelGeneration = useCallback((rang?: 'A' | 'B' | 'AB') => {
    abortRef.current = true;
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    if (rejetEnCoursRef.current) {
      const rejeter = rejetEnCoursRef.current;
      rejetEnCoursRef.current = null;
      rejeter(new Error(MESSAGE_SUIVI_INTERROMPU));
    }
    setPollingProgress(0);
    if (rang) {
      unmarkAsGenerating(rang);
      setGeneratingState(rang, false);
    } else {
      (['A', 'B', 'AB'] as const).forEach((r) => {
        unmarkAsGenerating(r);
        setGeneratingState(r, false);
      });
    }
    setEtape(null);
    setLastError(MESSAGE_SUIVI_INTERROMPU);
  }, [unmarkAsGenerating, setGeneratingState, setLastError]);

  return {
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    etape,
    generateMusicInLanguage,
    currentLanguage,
    pollingProgress,
    cancelGeneration
  };
};
