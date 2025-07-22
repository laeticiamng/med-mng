
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';

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
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-amber-200 shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <Link to="/edn" className="flex items-center gap-1 sm:gap-2 text-amber-700 hover:text-amber-900 transition-colors">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Retour</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAudio}
              className="border-amber-300 text-amber-700 hover:bg-amber-50 px-2 py-1"
            >
              {isAudioPlaying ? <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" /> : <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />}
              <span className="ml-1 sm:ml-2 hidden sm:inline">{isAudioPlaying ? 'Couper' : 'Musique'}</span>
            </Button>
            
            <div className="text-xs sm:text-sm text-amber-700 font-medium">
              {currentSection + 1}/{sectionsLength}
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between text-xs text-amber-600 mb-1">
            <span className="truncate pr-2 text-xs sm:text-sm">{currentSectionName}</span>
            <span className="flex-shrink-0 text-xs sm:text-sm">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1 sm:h-1.5 bg-amber-100" />
        </div>
      </div>
    </div>
  );
};
