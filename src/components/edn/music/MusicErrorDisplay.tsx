
import { AlertCircle } from 'lucide-react';

interface MusicErrorDisplayProps {
  error: string;
}

export const MusicErrorDisplay = ({ error }: MusicErrorDisplayProps) => {
  return (
    <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 text-red-800">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">Erreur de génération musicale</span>
      </div>
      <p className="text-red-700 mt-2 text-sm">{error}</p>
      <p className="text-red-600 mt-2 text-xs">
        Veuillez vérifier la configuration de l'API Suno dans les paramètres Supabase.
      </p>
    </div>
  );
};
