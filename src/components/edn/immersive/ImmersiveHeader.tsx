import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Volume2, VolumeX, Flame, Star } from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface ImmersiveHeaderProps {
  isAudioPlaying: boolean;
  currentSection: number;
  sectionsLength: number;
  progress: number;
  currentSectionName: string;
  onToggleAudio: () => void;
}

export const ImmersiveHeader = ({
  isAudioPlaying,
  currentSection,
  sectionsLength,
  progress,
  currentSectionName,
  onToggleAudio
}: ImmersiveHeaderProps) => {
  const { _stats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'immersive_header', section: currentSection }
    });
  }, [currentSection]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-warning/20 shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <Link to={ROUTE_PATHS.ednLegacy} className="flex items-center gap-1 sm:gap-2 text-warning hover:text-warning/80 transition-colors">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Retour</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {_stats && (
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-muted/30 rounded-full text-xs">
                <Flame className="h-3 w-3 text-warning" />
                <span className="font-bold text-warning">{_stats.currentStreak}</span>
                <Star className="h-3 w-3 text-primary ml-1" />
                <span className="font-bold text-primary">Nv.{_stats.level}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAudio}
              className="border-warning/30 text-warning hover:bg-warning/10 px-2 py-1"
            >
              {isAudioPlaying ? <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" /> : <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />}
              <span className="ml-1 sm:ml-2 hidden sm:inline">{isAudioPlaying ? 'Couper' : 'Musique'}</span>
            </Button>
            
            <div className="text-xs sm:text-sm text-warning font-medium">
              {currentSection + 1}/{sectionsLength}
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between text-xs text-warning/80 mb-1">
            <span className="truncate pr-2 text-xs sm:text-sm">{currentSectionName}</span>
            <span className="flex-shrink-0 text-xs sm:text-sm">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1 sm:h-1.5 bg-warning/10" />
        </div>
      </div>
    </div>
  );
};
