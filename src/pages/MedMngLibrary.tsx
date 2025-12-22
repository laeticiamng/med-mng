import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { withAuth } from '@/components/med-mng/withAuth';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { SongCard } from '@/components/med-mng/SongCard';
import { Button } from '@/components/ui/button';
import { Music, Plus, AlertCircle, ListMusic } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';
import { useTranslation } from '@/hooks/useTranslation';
import { SkeletonLibraryGrid } from '@/components/common/SkeletonLibraryGrid';
import { AdvancedSearch } from '@/components/med-mng/AdvancedSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTE_PATHS } from '@/config/routes';
import { useAuth } from '@/components/med-mng/AuthProvider';

const MedMngLibraryComponent = () => {
  const medMngApi = useMedMngApi();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filteredSongs, setFilteredSongs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSlowLoading, setShowSlowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const { text: searchPlaceholder } = useTranslation('Rechercher une chanson...');
  const { text: errorMessage } = useTranslation('Impossible de charger votre bibliothèque');
  const { text: retryText } = useTranslation('Réessayer');

  const handleSongPlay = async (song: any) => {
    navigate(`/med-mng/player/${song.id}`);
  };

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
                onClick={() => navigate(ROUTE_PATHS.medMngCreate)}
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
    <MedMngLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header - Clean and Simple */}
        <div className="mb-6">
          <TranslatedText 
            text="Ma bibliothèque"
            as="h1"
            className="text-xl sm:text-2xl font-semibold text-foreground mb-1"
          />
          <TranslatedText 
            text={`${filteredSongs.length} chanson${filteredSongs.length > 1 ? 's' : ''}`}
            as="p"
            className="text-sm text-muted-foreground"
          />
        </div>

        {/* Search */}
        <div className="mb-6">
          <AdvancedSearch
            songs={library || []}
            onFilteredSongs={setFilteredSongs}
            placeholder={searchPlaceholder}
          />
        </div>

        {/* Quick Actions - Sober */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button 
            onClick={() => navigate(ROUTE_PATHS.medMngCreate)}
            size="sm"
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Créer
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTE_PATHS.medMngPlaylists)}
            className="shrink-0"
          >
            <ListMusic className="h-4 w-4 mr-1.5" />
            Playlists
          </Button>
        </div>

        {/* Tabs - Simplified */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="all" className="text-sm">
              Tout ({library?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-sm">
              Favoris ({library?.filter(s => s.is_liked).length || 0})
            </TabsTrigger>
            <TabsTrigger value="playlists" className="text-sm">
              Playlists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {renderSongGrid()}
          </TabsContent>

          <TabsContent value="favorites" className="mt-4">
            {renderSongGrid()}
          </TabsContent>

          <TabsContent value="playlists" className="mt-4">
            {renderPlaylistsSection()}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {library && library.length === 12 && activeTab !== 'playlists' && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </MedMngLayout>
  );

  function renderSongGrid() {
    return filteredSongs.length === 0 ? (
      <div className="text-center py-12">
        <Music className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-base font-medium text-foreground mb-1">
          {activeTab === 'favorites' ? 'Aucun favori' : (library && library.length > 0 ? 'Aucun résultat' : 'Bibliothèque vide')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {activeTab === 'favorites' 
            ? 'Aimez des chansons pour les retrouver ici' 
            : (library && library.length > 0
              ? 'Essayez d\'autres termes de recherche' 
              : 'Créez votre première chanson pour commencer')}
        </p>
        {(!library || library.length === 0) && activeTab === 'all' && (
          <Button onClick={() => navigate(ROUTE_PATHS.medMngCreate)} size="sm">
            Créer ma première chanson
          </Button>
        )}
      </div>
    ) : (
      <div className="space-y-2">
        {filteredSongs.map((song) => (
          <SongCard 
            key={song.id} 
            song={song}
            onPlay={() => handleSongPlay(song)}
            onRemove={() => refetch()}
            onToggleLike={() => refetch()}
          />
        ))}
      </div>
    );
  }

  function renderPlaylistsSection() {
    return (
      <div className="text-center py-12">
        <ListMusic className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-base font-medium text-foreground mb-1">
          Gérez vos playlists
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Organisez vos chansons par thème ou spécialité
        </p>
        <Button 
          onClick={() => navigate(ROUTE_PATHS.medMngPlaylists)} 
          size="sm"
        >
          Voir mes playlists
        </Button>
      </div>
    );
  }
};

export const MedMngLibrary = withAuth(MedMngLibraryComponent);
