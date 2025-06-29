
import React from 'react';

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
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="font-semibold text-green-800 mb-2">✅ Debug Info Suno</h3>
      <div className="text-sm text-green-700 space-y-1">
        <p>Item Code: {itemCode}</p>
        <p>Paroles disponibles: {paroles?.length || 0}</p>
        <p>Langue actuelle: {currentLanguage}</p>
        <p>Style sélectionné: {selectedStyle}</p>
        <p>Durée: {formatDuration(musicDuration)}</p>
        <p>Génération Rang A: {isGenerating.rangA ? '🔄 En cours...' : '⏸️ Arrêtée'}</p>
        <p>Génération Rang B: {isGenerating.rangB ? '🔄 En cours...' : '⏸️ Arrêtée'}</p>
        <p>Audio Rang A: {generatedAudio.rangA ? '✅ URL Disponible' : '❌ Non généré'}</p>
        <p>Audio Rang B: {generatedAudio.rangB ? '✅ URL Disponible' : '❌ Non généré'}</p>
        {generatedAudio.rangA && (
          <p className="break-all">URL A: {generatedAudio.rangA.substring(0, 80)}...</p>
        )}
        {generatedAudio.rangB && (
          <p className="break-all">URL B: {generatedAudio.rangB.substring(0, 80)}...</p>
        )}
        <p>Erreur: {lastError || 'Aucune'}</p>
      </div>
    </div>
  );
};
