
import { Button } from '@/components/ui/button';
import { Download, Check, Heart } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SaveMusicButtonProps {
  audioUrl: string;
  title: string;
  rang: 'A' | 'B';
  style: string;
  itemCode?: string;
  isVisible: boolean;
}

export const SaveMusicButton = ({ 
  audioUrl, 
  title, 
  rang, 
  style, 
  itemCode,
  isVisible 
}: SaveMusicButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (isSaving || isSaved) return;

    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour sauvegarder vos musiques.",
          variant: "destructive"
        });
        return;
      }

      // Créer un identifiant unique pour cette musique
      const musicId = `${itemCode}-${rang}-${Date.now()}`;
      
      // Sauvegarder dans la table de musiques personnelles
      const { error } = await supabase
        .from('user_generated_music')
        .insert({
          user_id: user.id,
          title: title,
          audio_url: audioUrl,
          music_style: style,
          rang: rang,
          item_code: itemCode,
          music_id: musicId
        });

      if (error) {
        console.error('Erreur sauvegarde:', error);
        toast({
          title: "Erreur de sauvegarde",
          description: "Impossible de sauvegarder la musique. Réessayez plus tard.",
          variant: "destructive"
        });
        return;
      }

      setIsSaved(true);
      toast({
        title: "🎵 Musique sauvegardée !",
        description: `"${title}" a été ajoutée à votre bibliothèque.`,
      });

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter aux favoris.",
        variant: "destructive"
      });
      return;
    }

    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Retiré des favoris" : "⭐ Ajouté aux favoris !",
      description: isFavorite ? "Musique retirée de vos favoris." : "Cette musique est maintenant dans vos favoris.",
    });
  };

  if (!isVisible) return null;

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleSave}
        disabled={isSaving || isSaved}
        variant={isSaved ? "default" : "outline"}
        className={`flex items-center gap-2 ${
          isSaved 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'hover:bg-gray-50'
        }`}
      >
        {isSaved ? (
          <>
            <Check className="h-4 w-4" />
            Sauvegardée
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            {isSaving ? 'Sauvegarde...' : 'Ajouter à ma bibliothèque'}
          </>
        )}
      </Button>

      {isSaved && (
        <Button
          onClick={handleToggleFavorite}
          variant="outline"
          className={`flex items-center gap-2 ${
            isFavorite 
              ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
              : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
        </Button>
      )}
    </div>
  );
};
