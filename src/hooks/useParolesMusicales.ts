import { useAuth } from '@/components/med-mng/AuthProvider';
import { parolesSontRedigees } from '@/components/edn/music/utils/parolesFormatter';
import { FORMULES_PREMIUM, NOM_OFFRE_PREMIUM, QUOTA_GENERATIONS_AUDIO_PREMIUM, GENERATION_AUDIO_DISPONIBLE, MESSAGE_GENERATION_SUSPENDUE } from '@/config/offre';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { generateComprehensiveLyrics, generateMixedLyrics } from '@/utils/generateComprehensiveLyrics';
import { useState } from 'react';
import { useSunoCallbackListener } from './useSunoCallbackListener';
import { useSunoPolling } from './useSunoPolling';

export const useParolesMusicales = (
  _paroles: string[] = [], 
  itemData?: { 
    paroles_rang_a?: string[], 
    paroles_rang_b?: string[], 
    paroles_rang_ab?: string[],
    item_code?: string 
  }
) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('lofi');
  /** Durée demandée (secondes) ; le serveur la borne à 90–300 s. */
  const [musicDuration, setMusicDuration] = useState<number>(240);
  const { toast } = useToast();
  const { user } = useAuth();
  const { musicQuota, isSubscriptionActive, rafraichirQuota, loading: chargementAbonnement } = useSubscription();
  /** Paroles reconstruites pendant la session (affichées à la place des anciennes). */
  const [parolesRegenerees, setParolesRegenerees] = useState<Partial<Record<'A' | 'B' | 'AB', string[]>>>({});

  const {
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    generateMusicInLanguage,
    currentLanguage
  } = useMusicGenerationWithTranslation();

  const { completedAudio: pollingAudio, pollingTracks } = useSunoPolling();
  const { completedAudio: callbackAudio } = useSunoCallbackListener();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    stop,
    seek,
    changeVolume
  } = useGlobalAudio();

  // Fusionner l'audio des différentes sources
  const mergedGeneratedAudio = {
    ...generatedAudio,
    rangA: pollingAudio.A || callbackAudio.A || generatedAudio.rangA,
    rangB: pollingAudio.B || callbackAudio.B || generatedAudio.rangB,
    rangAB: pollingAudio.AB || callbackAudio.AB || generatedAudio.rangAB,
  };

  
  /**
   * Paroles à chanter pour un rang. Même règle que le générateur (/generator) :
   * on chante les paroles affichées si elles sont réellement rédigées ; sinon
   * (mots-clés sans ponctuation, colonne vide) on les reconstruit depuis les
   * compétences OIC officielles (generer-paroles-item). Avant, la fiche
   * redemandait TOUJOURS des paroles à l'IA : la chanson ne correspondait pas
   * aux paroles affichées, et chaque clic consommait un appel IA.
   */
  const parolesPourGeneration = async (rang: 'A' | 'B' | 'AB', itemCode: string): Promise<string[]> => {
    const stockees = rang === 'A'
      ? (itemData?.paroles_rang_a?.length ? itemData.paroles_rang_a : _paroles)
      : rang === 'B'
        ? itemData?.paroles_rang_b
        : itemData?.paroles_rang_ab;
    const lignes = (stockees ?? []).filter((l) => typeof l === 'string' && l.trim().length > 0);
    if (lignes.length > 0 && parolesSontRedigees(lignes)) return lignes;

    const regenerees = rang === 'AB'
      ? await generateMixedLyrics(itemCode)
      : await generateComprehensiveLyrics(itemCode, rang);
    setParolesRegenerees((prev) => ({ ...prev, [rang]: regenerees }));
    return regenerees;
  };

  /**
   * Lance la génération d'un rang. Renvoie `true` seulement si une chanson a
   * bien été produite : l'appelant ne doit récompenser (points, badges) que
   * dans ce cas. Avant, les erreurs étaient avalées ici et la fiche affichait
   * « +10 points » et débloquait des badges même quand la génération avait
   * été refusée (pas d'abonnement, quota atteint) ou avait échoué.
   */
  const lancerGeneration = async (rang: 'A' | 'B' | 'AB'): Promise<boolean> => {
    const libelleRang = rang === 'AB' ? 'Rang A+B' : `Rang ${rang}`;
    const itemCode = itemData?.item_code;
    if (!itemCode) {
      toast({
        title: 'Génération impossible',
        description: "L'item n'est pas identifié. Rechargez la page.",
        variant: 'destructive'
      });
      return false;
    }

    // Mêmes contrôles que le générateur, avant tout appel coûteux (le serveur
    // reste seul à faire foi).
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: GENERATION_AUDIO_DISPONIBLE
          ? `Connectez-vous pour générer une chanson (génération audio incluse dans ${NOM_OFFRE_PREMIUM}).`
          : MESSAGE_GENERATION_SUSPENDUE,
        variant: 'destructive'
      });
      return false;
    }
    if (!chargementAbonnement && !isSubscriptionActive()) {
      toast({
        title: `Inclus dans ${NOM_OFFRE_PREMIUM}`,
        description: `La génération audio est incluse dans ${NOM_OFFRE_PREMIUM} (${FORMULES_PREMIUM.annuel.prixAffiche} ou ${FORMULES_PREMIUM.mensuel.prixAffiche}).`,
      });
      return false;
    }
    if (musicQuota && isSubscriptionActive() && !musicQuota.can_generate) {
      toast({
        title: 'Quota du mois atteint',
        description: `Vous avez utilisé vos ${QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio de ce mois. Le compteur repart le 1er du mois prochain.`,
        variant: 'destructive'
      });
      return false;
    }

    let paroles: string[];
    try {
      paroles = await parolesPourGeneration(rang, itemCode);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      toast({
        title: 'Paroles indisponibles',
        description: `${libelleRang} : ${message || 'réessayez plus tard.'}`,
        variant: 'destructive'
      });
      return false;
    }
    if (paroles.length === 0) {
      toast({
        title: 'Paroles indisponibles',
        description: `Aucune parole disponible pour le ${libelleRang.toLowerCase()} de cet item.`,
        variant: 'destructive'
      });
      return false;
    }

    try {
      // generateMusicInLanguage affiche lui-même « Génération lancée », la
      // réussite et, en cas d'échec, un message français (jamais technique) :
      // on n'ajoute pas de second toast.
      await generateMusicInLanguage(rang, paroles, selectedStyle, {
        itemCode,
        dureeDemandee: musicDuration,
      });
      return true;
    } catch {
      return false;
    } finally {
      rafraichirQuota();
    }
  };

  const handleGenerate = (rang: 'A' | 'B') => lancerGeneration(rang);

  const handleGenerateMix = () => lancerGeneration('AB');

  const isValidAudioUrl = (audioUrl: string): boolean => {
    if (!audioUrl) return false;
    return audioUrl.startsWith('/') || audioUrl.startsWith('http://') || audioUrl.startsWith('https://');
  };

  const handlePlayAudio = (audioUrl: string, title: string) => {
    // Bloquer les URLs de simulation non fonctionnelles
    if (audioUrl.includes('soundjay.com') || audioUrl.includes('fail-buzzer')) {
      toast({
        title: "Mode simulation",
        description: "Aucun audio généré disponible. Veuillez d'abord générer de la musique.",
        variant: "default"
      });
      return;
    }

    if (!audioUrl || !isValidAudioUrl(audioUrl)) {
      return;
    }

    if (currentTrack?.url === audioUrl && isPlaying) {
      pause();
    } else {
      try {
        play({
          url: audioUrl,
          title: title,
          rang: audioUrl.includes('rangA') ? 'A' : audioUrl.includes('rangB') ? 'B' : 'AB'
        });
      } catch {
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire l'audio. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    }
  };

  return {
    selectedStyle,
    setSelectedStyle,
    musicDuration,
    setMusicDuration,
    isGenerating,
    generatedAudio: mergedGeneratedAudio,
    pollingTracks,
    generationProgress,
    lastError,
    currentLanguage,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    handleGenerate,
    handleGenerateMix,
    handlePlayAudio,
    parolesRegenerees,
    musicQuota,
    // Suspension ciblée (09.10.2026) : pas de bouton de génération, encart d'annonce à la place.
    aAccesGeneration: GENERATION_AUDIO_DISPONIBLE && isSubscriptionActive(),
    chargementAcces: chargementAbonnement,
    connecte: Boolean(user),
    seek,
    stop,
    changeVolume
  };
};
