
import React from 'react';
import { Button } from '@/components/ui/button';
import { Music, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateSongHeaderProps {
  remainingCredits?: number;
}

export const CreateSongHeader: React.FC<CreateSongHeaderProps> = ({ remainingCredits }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/med-mng/library')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la bibliothèque
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Créer une chanson
        </h1>
        <p className="text-gray-600 mb-4">
          Sélectionnez votre contenu EDN et générez votre musique personnalisée
        </p>
        <div className="inline-flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
          <Music className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium">
            Crédits restants: {remainingCredits || 0}
          </span>
        </div>
      </div>
    </>
  );
};
