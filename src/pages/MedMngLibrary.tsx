
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { withAuth } from '@/components/med-mng/withAuth';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { SongCard } from '@/components/med-mng/SongCard';
import { Button } from '@/components/ui/button';
import { Music, Plus, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';
import { useTranslation } from '@/hooks/useTranslation';
import { SkeletonLibraryGrid } from '@/components/common/SkeletonLibraryGrid';
import { AdvancedSearch } from '@/components/med-mng/AdvancedSearch';
import { useResponsiveGrid, useResponsiveSpacing, useBreakpoints } from '@/hooks/useBreakpoints';

const MedMngLibraryComponent = () => {
  const medMngApi = useMedMngApi();
  const navigate = useNavigate();
  const [filteredSongs, setFilteredSongs] = useState<any[]>([]);
  const { isMobile } = useBreakpoints();
  const gridConfig = useResponsiveGrid();
  const spacing = useResponsiveSpacing();
  const [currentPage, setCurrentPage] = useState(1);
  const [showSlowLoading, setShowSlowLoading] = useState(false);

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

  // Afficher message de lenteur après 4s
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowSlowLoading(true), 4000);
      return () => clearTimeout(timer);
    } else {
      setShowSlowLoading(false);
    }
  }, [isLoading]);

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

  // Effet pour initialiser les chansons filtrées
  React.useEffect(() => {
    if (library) {
      setFilteredSongs(library);
    }
  }, [library]);

  if (isLoading) {
    return (
      <MedMngLayout className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className={`container mx-auto ${spacing.container}`}>
          <div className="mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2" id="main-content">
              Ma bibliothèque musicale
            </h1>
            <p className="text-gray-600">Chargement de vos chansons...</p>
          </div>
          
          <SkeletonLibraryGrid count={12} />
          
          {showSlowLoading && (
            <div className="text-center mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700 font-medium">
                Chargement plus long que d'habitude ?
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Nous récupérons vos données...
              </p>
            </div>
          )}
        </div>
      </MedMngLayout>
    );
  }

  if (error) {
    return (
      <MedMngLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <TranslatedText text="Erreur" as="h1" className="text-2xl font-bold text-gray-900 mb-4" />
            <TranslatedText text={errorMessage} as="p" className="text-gray-600 mb-6" />
            <div className="space-y-3">
            <Button 
              onClick={() => refetch()} 
              className="w-full min-h-[48px]"
              aria-label="Recharger la bibliothèque musicale"
            >
              {retryText}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/med-mng/create')}
              className="w-full min-h-[48px]"
              aria-label="Créer votre première chanson éducative"
            >
              <Plus className="h-4 w-4 mr-2" />
              <TranslatedText text="Créer votre première chanson" />
            </Button>
            </div>
          </div>
        </div>
      </MedMngLayout>
    );
  }

  return (
    <MedMngLayout className="bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className={`container mx-auto ${spacing.container}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2" id="main-content">
              <TranslatedText 
                text="Ma bibliothèque musicale"
                showLoader
              />
            </h1>
            <TranslatedText 
              text={`${filteredSongs.length} chanson${filteredSongs.length > 1 ? 's' : ''} dans votre collection`}
              as="p"
              className="text-gray-600"
            />
          </div>
          <div className="text-right">
            <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
              <TranslatedText text="Crédits restants" className="text-xs sm:text-sm text-gray-600" />
              <div className="text-lg sm:text-2xl font-bold text-blue-600">
                {quota?.remaining_credits || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Search */}
        <div className="mb-8">
          <AdvancedSearch
            songs={library || []}
            onFilteredSongs={setFilteredSongs}
            placeholder={searchPlaceholder}
          />
        </div>

        {/* Actions - Layout mobile optimisé */}
        <div className={`flex ${gridConfig.navigation} ${gridConfig.gap} mb-6 md:mb-8`}>
          <Button 
            onClick={() => navigate('/med-mng/create')}
            className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 min-h-[48px] ${isMobile ? 'w-full' : 'w-auto'}`}
            aria-label="Créer une nouvelle chanson éducative"
          >
            <Plus className="h-4 w-4" />
            <TranslatedText text="Créer une chanson" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/med-mng/pricing')}
            className={`min-h-[48px] ${isMobile ? 'w-full' : 'w-auto hidden sm:flex'}`}
            aria-label="Voir les offres d'abonnement premium"
          >
            <TranslatedText text="Voir les abonnements" />
          </Button>
        </div>

        {/* Library Grid */}
        {filteredSongs.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <TranslatedText 
              text={library && library.length > 0 ? 'Aucun résultat' : 'Bibliothèque vide'}
              as="h3"
              className="text-xl font-semibold text-gray-900 mb-2"
            />
            <TranslatedText 
              text={library && library.length > 0
                ? 'Aucune chanson ne correspond à votre recherche' 
                : 'Commencez par créer votre première chanson'}
              as="p"
              className="text-gray-600 mb-6"
            />
            {(!library || library.length === 0) && (
              <Button 
                onClick={() => navigate('/med-mng/create')} 
                className={`bg-blue-600 hover:bg-blue-700 min-h-[48px] px-6 ${isMobile ? 'w-full' : ''}`}
                aria-label="Créer votre première chanson éducative pour démarrer votre bibliothèque"
              >
                <TranslatedText text="Créer ma première chanson" />
              </Button>
            )}
          </div>
        ) : (
          <div className={`grid ${gridConfig.cards} ${gridConfig.gap} animate-fade-in`}>
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

        {/* Pagination - Mobile optimisée */}
        {library && library.length === 12 && (
          <div className="flex justify-center mt-6 md:mt-8">
            <div className={`flex ${isMobile ? 'flex-col w-full' : 'gap-2'} ${gridConfig.gap}`}>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`min-h-[44px] px-4 sm:px-6 ${isMobile ? 'w-full mb-2' : 'flex-1 sm:flex-none'}`}
                aria-label={`Aller à la page précédente (page ${currentPage - 1})`}
              >
                <TranslatedText text="Précédent" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => p + 1)}
                className={`min-h-[44px] px-4 sm:px-6 ${isMobile ? 'w-full' : 'flex-1 sm:flex-none'}`}
                aria-label={`Aller à la page suivante (page ${currentPage + 1})`}
              >
                <TranslatedText text="Suivant" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </MedMngLayout>
  );
};

export const MedMngLibrary = withAuth(MedMngLibraryComponent);
