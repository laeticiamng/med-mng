import React from 'react';
import { AlertTriangle, Music } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface LyricsStatusDisplayProps {
  selectedItem: string;
  lyricsLoading: boolean;
  lyricsError: string | null;
  ednLyrics: any;
}

export const LyricsStatusDisplay: React.FC<LyricsStatusDisplayProps> = ({
  selectedItem,
  lyricsLoading,
  lyricsError,
  ednLyrics
}) => {
  if (!selectedItem) return null;

  return (
    <div className="space-y-4">
      <label className="text-lg font-semibold text-gray-900">
        <TranslatedText text="Paroles de l'item" />
      </label>
      
      {lyricsLoading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>Chargement des paroles...</span>
          </div>
        </div>
      )}
      
      {lyricsError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span>Erreur: {lyricsError}</span>
          </div>
        </div>
      )}
      
      {ednLyrics && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <Music className="h-5 w-5" />
            <span className="font-semibold">Paroles trouvées pour {ednLyrics.title}</span>
          </div>
          <p className="text-green-700">
            {ednLyrics.paroles_musicales?.length || 0} versions de paroles disponibles 
            (Rang A et B)
          </p>
          {ednLyrics.paroles_musicales && ednLyrics.paroles_musicales.length > 0 && (
            <div className="mt-2 text-sm text-green-600">
              Aperçu: {ednLyrics.paroles_musicales[0]?.substring(0, 100)}...
            </div>
          )}
        </div>
      )}
    </div>
  );
};