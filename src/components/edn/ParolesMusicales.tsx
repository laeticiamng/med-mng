import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ENABLE_DEBUG } from '@/config/env';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { useAudioWithCache } from '@/hooks/useAudioWithCache';
import { useGamification } from '@/hooks/useGamification';
import { useParolesMusicales } from '@/hooks/useParolesMusicales';
import { QUOTA_GENERATIONS_AUDIO_PREMIUM } from '@/config/offre';
import { EncartGenerationAudio } from '@/components/offre/EncartGenerationAudio';
import { supabase } from '@/integrations/supabase/client';
import { Download, Flame, Music, Pause, Star, ThumbsDown, ThumbsUp, Volume2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MusicGenerationWaveform } from './music/MusicGenerationWaveform';
import { ParolesMusicalesControls } from './music/ParolesMusicalesControls';
import { ParolesMusicalesDebugInfo } from './music/ParolesMusicalesDebugInfo';
import { ParolesMusicalesErrorSection } from './music/ParolesMusicalesErrorSection';
import { ParolesMusicalesMainContent } from './music/ParolesMusicalesMainContent';
interface TableauRangData {
  title?: string;
  sections?: Array<{ title?: string; content?: string }>;
}

interface ParolesMusicalesProps {
  paroles?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  itemCode: string;
  tableauRangA?: TableauRangData;
  tableauRangB?: TableauRangData;
}

/** Points attribués pour une chanson générée (affichés dans l'animation). */
const POINTS_PAR_GENERATION = 15;

export const ParolesMusicales: React.FC<ParolesMusicalesProps> = ({
  paroles = [],
  paroles_rang_a,
  paroles_rang_b,
  paroles_rang_ab,
  itemCode
}) => {
  const [musicCount, setMusicCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [userFeedback, setUserFeedback] = useState<'like' | 'dislike' | null>(null);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { addPoints, unlockBadge, stats: gamificationStats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();
  const { trackMusicGeneration } = useAnalyticsTracking();
  const { cacheAudio, isCaching } = useAudioWithCache({ type: 'music' });
  const { toast } = useToast();

  const toggleTTS = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (isTTSPlaying) {
      window.speechSynthesis.cancel();
      setIsTTSPlaying(false);
    } else {
      const allParoles = [...(paroles_rang_a || []), ...(paroles_rang_b || []), ...paroles].join('\n');
      if (!allParoles.trim()) return;
      const utterance = new SpeechSynthesisUtterance(allParoles);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.onend = () => setIsTTSPlaying(false);
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsTTSPlaying(true);
    }
  }, [isTTSPlaying, paroles, paroles_rang_a, paroles_rang_b]);
  
  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Load existing music generation count and feedback
  useEffect(() => {
    const loadMusicData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
        // Load previous feedback for this item
        const { data } = await supabase
          .from('music_feedback')
          .select('rating')
          .eq('user_id', user.id)
          .eq('item_code', itemCode)
          .maybeSingle();
        if (data) {
          setUserFeedback(data.rating > 3 ? 'like' : data.rating < 3 ? 'dislike' : null);
        }
      }
    };
    loadMusicData();
  }, [itemCode, loadStats]);
  // Debug logging disabled for production

  const {
    selectedStyle,
    setSelectedStyle,
    musicDuration,
    setMusicDuration,
    isGenerating,
    generatedAudio,
    pollingTracks,
    generationProgress,
    lastError,
    currentLanguage,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    handleGenerate: originalHandleGenerate,
    handleGenerateMix: originalHandleGenerateMix,
    handlePlayAudio,
    seek,
    stop,
    changeVolume,
    parolesRegenerees,
    musicQuota,
    aAccesGeneration,
    chargementAcces,
    connecte,
  } = useParolesMusicales(paroles, {
    paroles_rang_a, 
    paroles_rang_b, 
    paroles_rang_ab, 
    item_code: itemCode 
  });

  // Récompenses (points, badges) uniquement pour une chanson réellement
  // produite : `handleGenerate` renvoie false en cas de refus ou d'échec.
  const recompenserGeneration = async (rang: 'A' | 'B' | 'AB') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await addPoints(user.id, POINTS_PAR_GENERATION, rang === 'AB' ? 'music_mix' : 'music_generation');
    await logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { itemCode, type: rang === 'AB' ? 'music_mix_generation' : 'music_generation' }
    });

    const newCount = musicCount + 1;
    setMusicCount(newCount);

    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);

    if (newCount === 1) {
      await unlockBadge(user.id, 'music_first');
    }
    if (newCount >= 10) {
      await unlockBadge(user.id, 'music_10');
    }
    trackMusicGeneration(itemCode, rang, selectedStyle, 'complete');
  };

  const handleGenerate = async (rang: 'A' | 'B') => {
    if (await originalHandleGenerate(rang)) await recompenserGeneration(rang);
  };

  const handleGenerateMix = async () => {
    if (await originalHandleGenerateMix()) await recompenserGeneration('AB');
  };

  // Handle user feedback on generated music
  const handleFeedback = useCallback(async (feedback: 'like' | 'dislike') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return;
    }

    const rating = feedback === 'like' ? 5 : 2;
    setUserFeedback(feedback);

    const { error } = await supabase.from('music_feedback').upsert({
      user_id: user.id,
      item_code: itemCode,
      style: selectedStyle,
      rating,
      audio_url: typeof generatedAudio === 'string' ? generatedAudio : null,
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id,item_code' });

    if (error) {
      setUserFeedback(null);
      toast({
        title: "Avis non enregistré",
        description: 'Réessayez dans un instant.',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: feedback === 'like' ? '👍 Merci !' : '📝 Feedback enregistré',
      description: 'Votre avis nous aide à améliorer la génération musicale'
    });
  }, [itemCode, selectedStyle, generatedAudio, toast]);

  // Paroles affichées : celles reconstruites pendant la session si la
  // génération a dû les refaire, sinon celles de l'item.
  const parolesA = parolesRegenerees.A ?? (paroles_rang_a?.length ? paroles_rang_a : paroles);
  const parolesB = parolesRegenerees.B ?? paroles_rang_b ?? [];

  // URL de l'audio généré, s'il existe. `generatedAudio` est toujours un objet
  // (fusion des sources) : tester sa seule présence affichait le bloc « avis »
  // et « Hors-ligne » même sans aucune musique, et « Hors-ligne » ne faisait
  // alors rien (bouton mort constaté sur la fiche de l'item 1).
  const audioUrlGeneree = typeof generatedAudio === 'string'
    ? generatedAudio
    : generatedAudio?.rangA || generatedAudio?.rangB || generatedAudio?.rangAB || '';

  // Handle download/cache for offline
  const handleCacheAudio = useCallback(async () => {
    if (!audioUrlGeneree) {
      toast({ title: 'Aucune musique à enregistrer', description: 'Générez d\'abord la chanson de cet item.', variant: 'destructive' });
      return;
    }
    const success = await cacheAudio(
      `music-${itemCode}`,
      audioUrlGeneree,
      `Musique ${itemCode}`,
      duration
    );
    if (success) {
      toast({ title: '📥 Audio mis en cache', description: 'Disponible hors-ligne' });
    }
  }, [audioUrlGeneree, itemCode, duration, cacheAudio, toast]);


  return (
    <div className="space-y-6">
      {/* Série, niveau et badges : affichés seulement dans « Mon suivi » (progression), pas sur les pages de révision. */}
      {/* Waveform visualization during generation */}
      {(isGenerating.rangA || isGenerating.rangB || isGenerating.rangAB) && (
        <MusicGenerationWaveform 
          isGenerating={Boolean(isGenerating.rangA || isGenerating.rangB || isGenerating.rangAB)} 
          progress={
            (generationProgress.rangA as { progress?: number } | undefined)?.progress || 
            (generationProgress.rangB as { progress?: number } | undefined)?.progress || 
            50
          } 
          className="h-24"
        />
      )}


      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-6 w-6 text-warning" />
                Chanson de l'item {itemCode}
              </CardTitle>
              <CardDescription>
                Chanson générée par IA à partir des compétences de l'item
                {aAccesGeneration && musicQuota && (
                  <span className="block mt-1">
                    Générations audio ce mois-ci : {musicQuota.current_usage} / {musicQuota.quota_limit || QUOTA_GENERATIONS_AUDIO_PREMIUM}
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              variant={isTTSPlaying ? "default" : "outline"}
              size="sm"
              onClick={toggleTTS}
              className="gap-1"
            >
              {isTTSPlaying ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {isTTSPlaying ? 'Stop' : 'Lire'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {ENABLE_DEBUG && (
              <ParolesMusicalesDebugInfo
                itemCode={itemCode}
                paroles={paroles}
                currentLanguage={currentLanguage}
                selectedStyle={selectedStyle}
                musicDuration={musicDuration}
                isGenerating={isGenerating}
                generatedAudio={generatedAudio}
                lastError={lastError}
              />
            )}

            {/* Sans Premium : encart permanent à la place des boutons, paroles lisibles. */}
            {!chargementAcces && !aAccesGeneration && <EncartGenerationAudio connecte={connecte} />}

            {aAccesGeneration && (
              <ParolesMusicalesControls
                selectedStyle={selectedStyle}
                musicDuration={musicDuration}
                onStyleChange={setSelectedStyle}
                onDurationChange={setMusicDuration}
              />
            )}

            <ParolesMusicalesErrorSection lastError={lastError} />

            <ParolesMusicalesMainContent
              paroles={
                // Position fixe : index 0 = rang A, index 1 = rang B. Avant, un
                // item sans paroles de rang A voyait ses paroles de rang B
                // affichées et générées comme « Rang A ».
                parolesA.length > 0 || parolesB.length > 0
                  ? [parolesA, parolesB]
                  : []
              }
              generationVerrouillee={chargementAcces || !aAccesGeneration}
              parolesAB={parolesRegenerees.AB ?? (paroles_rang_ab?.length ? paroles_rang_ab : undefined)}
              itemCode={itemCode}
              musicDuration={musicDuration}
              selectedStyle={selectedStyle}
              isGenerating={isGenerating}
              generatedAudio={generatedAudio}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              generationProgress={generationProgress}
              onGenerate={handleGenerate}
              onGenerateMix={handleGenerateMix}
              onPlayAudio={handlePlayAudio}
              onSeek={seek}
              onVolumeChange={changeVolume}
              onStop={stop}
              pollingTracks={pollingTracks}
            />

            {/* Feedback and cache section after generation */}
            {audioUrlGeneree && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Cette musique vous plaît ?</span>
                  <Button
                    variant={userFeedback === 'like' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFeedback('like')}
                    className="gap-1"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={userFeedback === 'dislike' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFeedback('dislike')}
                    className="gap-1"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCacheAudio}
                  disabled={isCaching(`music-${itemCode}`)}
                  className="gap-1"
                >
                  <Download className="h-4 w-4" />
                  {isCaching(`music-${itemCode}`) ? 'Téléchargement...' : 'Hors-ligne'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
