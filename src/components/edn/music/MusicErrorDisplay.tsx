
import { AlertCircle } from 'lucide-react';

interface MusicErrorDisplayProps {
  error: string;
}

export const MusicErrorDisplay = ({ error }: MusicErrorDisplayProps) => {
  return (
    <div className="max-w-2xl mx-auto mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">Erreur de génération musicale</span>
      </div>
      <p className="text-destructive/80 mt-2 text-sm">{error}</p>
      <p className="text-destructive/70 mt-2 text-xs">
        Veuillez vérifier la configuration de l'API Suno dans les paramètres Supabase.
      </p>
    </div>
  );
};
