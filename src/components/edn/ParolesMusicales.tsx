import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Award, Sparkles, Flame, Star, ThumbsUp, ThumbsDown, Download, Volume2, VolumeX, Pause } from 'lucide-react';
import { useParolesMusicales } from '@/hooks/useParolesMusicales';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { useAudioWithCache } from '@/hooks/useAudioWithCache';
import { ParolesMusicalesDebugInfo } from './music/ParolesMusicalesDebugInfo';
import { ENABLE_DEBUG } from '@/config/env';
import { ParolesMusicalesControls } from './music/ParolesMusicalesControls';
import { ParolesMusicalesErrorSection } from './music/ParolesMusicalesErrorSection';
import { ParolesMusicalesMainContent } from './music/ParolesMusicalesMainContent';
import { MusicGenerationWaveform } from './music/MusicGenerationWaveform';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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

export const ParolesMusicales: React.FC<ParolesMusicalesProps> = ({
  paroles = [],
  paroles_rang_a,
  paroles_rang_b,
  paroles_rang_ab,
  itemCode,
  tableauRangA,
  tableauRangB
}) => {
  const [musicCount, setMusicCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [userFeedback, setUserFeedback] = useState<'like' | 'dislike' | null>(null);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { addPoints, unlockBadge, stats: gamificationStats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();
  const { trackMusicGeneration } = useAnalyticsTracking();
  const { cacheAudio, isAudioCached, isCaching } = useAudioWithCache({ type: 'music' });
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
    changeVolume,
    stop
  } = useParolesMusicales(paroles, { 
    paroles_rang_a, 
    paroles_rang_b, 
    paroles_rang_ab, 
    item_code: itemCode 
  });

  // Wrap generate handlers to add gamification
  const handleGenerate = async (...args: Parameters<typeof originalHandleGenerate>) => {
    await originalHandleGenerate(...args);
    
    // Award points for music generation
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await addPoints(user.id, 'itemReviewed');
      await logActivity({ 
        activity_type: 'study', 
        count: 1, 
        metadata: { itemCode, type: 'music_generation' } 
      });
      
      const newCount = musicCount + 1;
      setMusicCount(newCount);
      
      // Show reward animation
      setShowReward(true);
      setTimeout(() => setShowReward(false), 2000);
      
      // Unlock music badges
      if (newCount === 1) {
        await unlockBadge(user.id, 'music_first');
      }
      if (newCount >= 10) {
        await unlockBadge(user.id, 'music_10');
      }
      // Track analytics
      trackMusicGeneration(itemCode, 'A', selectedStyle, 'complete');
    }
  };

  const handleGenerateMix = async (...args: Parameters<typeof originalHandleGenerateMix>) => {
    await originalHandleGenerateMix(...args);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await addPoints(user.id, 'itemReviewed');
      await logActivity({ 
        activity_type: 'study', 
        count: 1, 
        metadata: { itemCode, type: 'music_mix_generation' } 
      });
      trackMusicGeneration(itemCode, 'A', selectedStyle, 'complete');
    }
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

    try {
      await supabase.from('music_feedback').upsert({
        user_id: user.id,
        item_code: itemCode,
        style: selectedStyle,
        rating,
        audio_url: typeof generatedAudio === 'string' ? generatedAudio : null,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,item_code' });

      toast({
        title: feedback === 'like' ? '👍 Merci !' : '📝 Feedback enregistré',
        description: 'Votre avis nous aide à améliorer la génération musicale'
      });
    } catch {
      // Silent error handling
    }
  }, [itemCode, selectedStyle, generatedAudio, toast]);

  // Handle download/cache for offline
  const handleCacheAudio = useCallback(async () => {
    const audioUrl = typeof generatedAudio === 'string' 
      ? generatedAudio 
      : generatedAudio?.rangA || generatedAudio?.rangB || '';
    if (!audioUrl) return;
    const success = await cacheAudio(
      `music-${itemCode}`,
      audioUrl,
      `Musique ${itemCode}`,
      duration
    );
    if (success) {
      toast({ title: '📥 Audio mis en cache', description: 'Disponible hors-ligne' });
    }
  }, [generatedAudio, itemCode, duration, cacheAudio, toast]);


  return (
    <div className="space-y-6">
      {/* Gamification Banner */}
      {gamificationStats && (
        <Card className="bg-gradient-to-r from-warning/5 via-background to-primary/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-warning" />
                  <span className="font-medium">Génération musicale</span>
                </div>
                <Badge variant="secondary">{musicCount} générées</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <Flame className="h-3 w-3 text-warning" />
                  {gamificationStats?.currentStreak ?? 0} jours
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3 text-primary" />
                  Nv.{gamificationStats?.level ?? 1}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reward Animation */}
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

      {showReward && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-bounce bg-success text-success-foreground px-6 py-3 rounded-full text-lg font-bold shadow-xl">
            🎵 +10 points !
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-6 w-6 text-warning" />
                Génération Musicale Suno AI - {itemCode}
              </CardTitle>
              <CardDescription>
                Génération de musique avec paroles chantées en {currentLanguage} via Suno AI
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

            <ParolesMusicalesControls
              selectedStyle={selectedStyle}
              musicDuration={musicDuration}
              onStyleChange={setSelectedStyle}
              onDurationChange={setMusicDuration}
            />

            <ParolesMusicalesErrorSection lastError={lastError} />

            <ParolesMusicalesMainContent
              paroles={
                // Utiliser les paroles dans leur format array original
                paroles_rang_a && paroles_rang_b 
                  ? [paroles_rang_a, paroles_rang_b] 
                  : paroles_rang_a 
                    ? [paroles_rang_a]
                    : paroles_rang_b
                      ? [paroles_rang_b]
                      : []
              }
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
            {generatedAudio && (
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
