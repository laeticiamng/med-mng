
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { withAuth } from '@/components/med-mng/withAuth';
import { MedMngNavigation } from '@/components/med-mng/MedMngNavigation';
import { SongCard } from '@/components/med-mng/SongCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Music, Heart, Plus, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';
import { useTranslation } from '@/hooks/useTranslation';

const MedMngLibraryComponent = () => {
  const medMngApi = useMedMngApi();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { text: searchPlaceholder } = useTranslation('Rechercher une chanson...');
  const { text: errorMessage } = useTranslation('Impossible de charger votre bibliothèque');
  const { text: retryText } = useTranslation('Réessayer');

  const { data: library, isLoading, error, refetch } = useQuery({
    queryKey: ['med-mng-library', currentPage],
    queryFn: async () => {
      try {
        console.log('📚 Chargement de la bibliothèque...');
        const result = await medMngApi.getLibrary(currentPage, 12);
        console.log('✅ Bibliothèque chargée:', result);
        return result;
      } catch (err) {
        console.error('❌ Erreur chargement bibliothèque:', err);
        // Retourner un tableau vide plutôt que de lancer l'erreur
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const { data: quota } = useQuery({
    queryKey: ['med-mng-quota'],
    queryFn: async () => {
      try {
        return await medMngApi.getRemainingQuota();
      } catch (err) {
        console.error('❌ Erreur chargement quota:', err);
        return { remaining_credits: 0 };
      }
    },
  });

  const filteredSongs = library?.filter(song => 
    song.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <MedMngNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de votre bibliothèque...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <MedMngNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <TranslatedText text="Erreur" as="h1" className="text-2xl font-bold text-gray-900 mb-4" />
            <TranslatedText text={errorMessage} as="p" className="text-gray-600 mb-6" />
            <div className="space-y-3">
              <Button onClick={() => refetch()} className="w-full">
                {retryText}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/med-mng/create')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                <TranslatedText text="Créer votre première chanson" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <MedMngNavigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <TranslatedText 
              text="Ma bibliothèque musicale"
              as="h1"
              className="text-4xl font-bold text-gray-900 mb-2"
              showLoader
            />
            <TranslatedText 
              text={`${filteredSongs.length} chanson${filteredSongs.length > 1 ? 's' : ''} dans votre collection`}
              as="p"
              className="text-gray-600"
            />
          </div>
          <div className="text-right">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <TranslatedText text="Crédits restants" className="text-sm text-gray-600" />
              <div className="text-2xl font-bold text-blue-600">
                {quota?.remaining_credits || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Button 
            onClick={() => navigate('/med-mng/create')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <TranslatedText text="Créer une chanson" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/med-mng/pricing')}
          >
            <TranslatedText text="Voir les abonnements" />
          </Button>
        </div>

        {/* Library Grid */}
        {filteredSongs.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <TranslatedText 
              text={searchTerm ? 'Aucun résultat' : 'Bibliothèque vide'}
              as="h3"
              className="text-xl font-semibold text-gray-900 mb-2"
            />
            <TranslatedText 
              text={searchTerm 
                ? 'Aucune chanson ne correspond à votre recherche' 
                : 'Commencez par créer votre première chanson'}
              as="p"
              className="text-gray-600 mb-6"
            />
            {!searchTerm && (
              <Button onClick={() => navigate('/med-mng/create')} className="bg-blue-600 hover:bg-blue-700">
                <TranslatedText text="Créer ma première chanson" />
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSongs.map((song) => (
              <SongCard 
                key={song.id} 
                song={song}
                onPlay={() => navigate(`/med-mng/player/${song.id}`)}
                onRemove={() => refetch()}
                onToggleLike={() => refetch()}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {library && library.length === 12 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <TranslatedText text="Précédent" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <TranslatedText text="Suivant" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MedMngLibrary = withAuth(MedMngLibraryComponent);
