
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ParolesMusicalesDebugInfoProps {
  itemCode: string;
  paroles: string[];
  currentLanguage: string;
  selectedStyle: string;
  musicDuration: number;
  isGenerating: { rangA: boolean; rangB: boolean };
  generatedAudio: { rangA?: string; rangB?: string };
  lastError: string;
}

export const ParolesMusicalesDebugInfo: React.FC<ParolesMusicalesDebugInfoProps> = ({
  itemCode,
  paroles,
  currentLanguage,
  selectedStyle,
  musicDuration,
  isGenerating,
  generatedAudio,
  lastError
}) => {
  const [showDebug, setShowDebug] = useState(false);
  const isMobile = useIsMobile();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Ne pas afficher le debug sur mobile par défaut
  if (isMobile && !showDebug) {
    return (
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowDebug(true)}
          className="text-gray-600"
        >
          <Bug className="h-4 w-4 mr-2" />
          Infos techniques
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-green-800 flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Informations Suno AI
        </h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowDebug(!showDebug)}
          className="text-gray-600"
        >
          {showDebug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {showDebug && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className={`text-sm text-green-700 space-y-1 ${isMobile ? 'text-xs' : ''}`}>
            <p>📱 Item Code: {itemCode}</p>
            <p>🎵 Paroles disponibles: {paroles?.length || 0}</p>
            <p>🌍 Langue: {currentLanguage}</p>
            <p>🎼 Style: {selectedStyle}</p>
            <p>⏱️ Durée: {formatDuration(musicDuration)}</p>
            <p>🔄 Rang A: {isGenerating.rangA ? 'En cours...' : 'Prêt'}</p>
            <p>🔄 Rang B: {isGenerating.rangB ? 'En cours...' : 'Prêt'}</p>
            <p>🎧 Audio A: {generatedAudio.rangA ? 'Disponible' : 'À générer'}</p>
            <p>🎧 Audio B: {generatedAudio.rangB ? 'Disponible' : 'À générer'}</p>
            {lastError && <p>❌ Erreur: {lastError}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
