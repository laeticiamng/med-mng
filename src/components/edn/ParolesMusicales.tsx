
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Award, Sparkles, Flame, Star } from 'lucide-react';
import { useParolesMusicales } from '@/hooks/useParolesMusicales';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { ParolesMusicalesDebugInfo } from './music/ParolesMusicalesDebugInfo';
import { ENABLE_DEBUG } from '@/config/env';
import { ParolesMusicalesControls } from './music/ParolesMusicalesControls';
import { ParolesMusicalesErrorSection } from './music/ParolesMusicalesErrorSection';
import { ParolesMusicalesMainContent } from './music/ParolesMusicalesMainContent';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface ParolesMusicalesProps {
  paroles?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
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
  const { addPoints, unlockBadge, stats: gamificationStats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();

  // Load existing music generation count
  useEffect(() => {
    const loadMusicCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
      }
    };
    loadMusicCount();
  }, [loadStats]);

  if (ENABLE_DEBUG) {
    console.log('🎵 ParolesMusicales - Rendu avec props:', { 
      paroles: paroles?.length,
      paroles_rang_a: paroles_rang_a?.length,
      paroles_rang_b: paroles_rang_b?.length,
      paroles_rang_ab: paroles_rang_ab?.length,
      itemCode, 
      hasTableauA: !!tableauRangA, 
      hasTableauB: !!tableauRangB 
    });
  }

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
    }
  };

  if (ENABLE_DEBUG) {
    console.log('🎵 ÉTAT ACTUEL generatedAudio:', generatedAudio);
    console.log('🎵 ÉTAT ACTUEL generationProgress:', generationProgress);
  }

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
                  {gamificationStats.currentStreak} jours
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3 text-primary" />
                  Nv.{gamificationStats.level}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reward Animation */}
      {showReward && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-bounce bg-success text-success-foreground px-6 py-3 rounded-full text-lg font-bold shadow-xl">
            🎵 +10 points !
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-6 w-6 text-warning" />
            Génération Musicale Suno AI - {itemCode}
          </CardTitle>
          <CardDescription>
            Génération de musique avec paroles chantées en {currentLanguage} via Suno AI
          </CardDescription>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
