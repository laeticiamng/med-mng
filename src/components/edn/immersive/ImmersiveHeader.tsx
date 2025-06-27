
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
    <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-amber-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/edn" className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Retour aux items EDN</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAudio}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              {isAudioPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <span className="ml-2">{isAudioPlaying ? 'Couper' : 'Musique'}</span>
            </Button>
            
            <div className="text-sm text-amber-700">
              {currentSection + 1} / {sectionsLength}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-xs text-amber-600 mb-2">
            <span>{currentSectionName}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-amber-100" />
        </div>
      </div>
    </div>
  );
};
