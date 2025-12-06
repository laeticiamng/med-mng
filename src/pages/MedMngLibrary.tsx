
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { withAuth } from '@/components/med-mng/withAuth';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { SongCard } from '@/components/med-mng/SongCard';
import { Button } from '@/components/ui/button';
import { Music, Plus, AlertCircle, Heart, ListMusic } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';
import { useTranslation } from '@/hooks/useTranslation';
import { SkeletonLibraryGrid } from '@/components/common/SkeletonLibraryGrid';
import { AdvancedSearch } from '@/components/med-mng/AdvancedSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MedMngLibraryComponent = () => {
  const medMngApi = useMedMngApi();
  const navigate = useNavigate();
  const [filteredSongs, setFilteredSongs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSlowLoading, setShowSlowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

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
      // Filtrer selon l'onglet actif
      let filtered = library;
      if (activeTab === 'favorites') {
        filtered = library.filter(song => song.is_liked);
      }
      setFilteredSongs(filtered);
    }
  }, [library, activeTab]);

  if (isLoading) {
    return (
      <MedMngLayout className="bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
              Ma bibliothèque musicale
            </h1>
            <p className="text-muted-foreground">Chargement de vos chansons...</p>
          </div>
          
          <SkeletonLibraryGrid count={12} />
          
          {showSlowLoading && (
            <div className="text-center mt-8 p-4 bg-primary/10 rounded-lg">
              <p className="text-primary font-medium">
                Chargement plus long que d'habitude ?
              </p>
              <p className="text-primary/80 text-sm mt-1">
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
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <TranslatedText text="Erreur" as="h1" className="text-2xl font-bold text-foreground mb-4" />
            <TranslatedText text={errorMessage} as="p" className="text-muted-foreground mb-6" />
            <div className="space-y-3">
              <Button onClick={() => refetch()} className="w-full min-h-[48px]">
                {retryText}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/med-mng/create')}
                className="w-full min-h-[48px]"
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
    <MedMngLayout className="bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <TranslatedText 
              text="Ma bibliothèque musicale"
              as="h1"
              className="text-2xl sm:text-4xl font-bold text-foreground mb-2"
              showLoader
            />
            <TranslatedText 
              text={`${filteredSongs.length} chanson${filteredSongs.length > 1 ? 's' : ''} dans votre collection`}
              as="p"
              className="text-muted-foreground"
            />
          </div>
          <div className="text-right">
            <div className="bg-card rounded-lg px-3 py-2 shadow-sm">
              <TranslatedText text="Crédits restants" className="text-xs sm:text-sm text-muted-foreground" />
              <div className="text-lg sm:text-2xl font-bold text-primary">
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <Button 
            onClick={() => navigate('/med-mng/create')}
            className="flex items-center gap-2 min-h-[48px] w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <TranslatedText text="Créer une chanson" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/med-mng/playlists')}
            className="flex items-center gap-2 min-h-[48px] w-full sm:w-auto"
          >
            <ListMusic className="h-4 w-4" />
            <TranslatedText text="Mes Playlists" />
          </Button>
        </div>

        {/* Tabs pour filtrer */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Toutes</span>
              <span className="sm:hidden">Tout</span>
              <span className="text-xs ml-1">({library?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favoris</span>
              <span className="sm:hidden">♥</span>
              <span className="text-xs ml-1">({library?.filter(s => s.is_liked).length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center gap-2">
              <ListMusic className="h-4 w-4" />
              <span className="hidden sm:inline">Playlists</span>
              <span className="sm:hidden">Lists</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {renderSongGrid()}
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            {renderSongGrid()}
          </TabsContent>

          <TabsContent value="playlists" className="mt-0">
            {renderPlaylistsSection()}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {library && library.length === 12 && activeTab !== 'playlists' && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-3 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="min-h-[44px] px-4 sm:px-6 flex-1 sm:flex-none"
              >
                <TranslatedText text="Précédent" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => p + 1)}
                className="min-h-[44px] px-4 sm:px-6 flex-1 sm:flex-none"
              >
                <TranslatedText text="Suivant" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </MedMngLayout>
  );

  function renderSongGrid() {
    return filteredSongs.length === 0 ? (
      <div className="text-center py-16">
        <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <TranslatedText 
          text={activeTab === 'favorites' ? 'Aucun favori' : (library && library.length > 0 ? 'Aucun résultat' : 'Bibliothèque vide')}
          as="h3"
          className="text-xl font-semibold text-foreground mb-2"
        />
        <TranslatedText 
          text={activeTab === 'favorites' 
            ? 'Ajoutez des chansons à vos favoris en cliquant sur ❤️' 
            : (library && library.length > 0
              ? 'Aucune chanson ne correspond à votre recherche' 
              : 'Commencez par créer votre première chanson')}
          as="p"
          className="text-muted-foreground mb-6"
        />
        {(!library || library.length === 0) && activeTab === 'all' && (
          <Button onClick={() => navigate('/med-mng/create')} className="min-h-[48px] px-6">
            <TranslatedText text="Créer ma première chanson" />
          </Button>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 animate-fade-in">
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
    );
  }

  function renderPlaylistsSection() {
    return (
      <div className="text-center py-16">
        <ListMusic className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <TranslatedText 
          text="Gérez vos playlists"
          as="h3"
          className="text-xl font-semibold text-foreground mb-2"
        />
        <TranslatedText 
          text="Créez et organisez vos playlists de chansons"
          as="p"
          className="text-muted-foreground mb-6"
        />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate('/med-mng/playlists')} 
            className="min-h-[48px] px-6"
          >
            <ListMusic className="h-4 w-4 mr-2" />
            <TranslatedText text="Voir mes playlists" />
          </Button>
        </div>
      </div>
    );
  }
};

export const MedMngLibrary = withAuth(MedMngLibraryComponent);
