import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { withAuth } from '@/components/med-mng/withAuth';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { SongCard } from '@/components/med-mng/SongCard';
import { Button } from '@/components/ui/button';
import { Music, Plus, AlertCircle, Heart, ListMusic, Flame, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';
import { useTranslation } from '@/hooks/useTranslation';
import { SkeletonLibraryGrid } from '@/components/common/SkeletonLibraryGrid';
import { AdvancedSearch } from '@/components/med-mng/AdvancedSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTE_PATHS } from '@/config/routes';
import { Badge } from '@/components/ui/badge';
import { useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAuth } from '@/components/med-mng/AuthProvider';

const MedMngLibraryComponent = () => {
  const medMngApi = useMedMngApi();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filteredSongs, setFilteredSongs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSlowLoading, setShowSlowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { stats: gamificationStats, loadStats, addPoints } = useGamification();
  const { logActivity } = useActivityTracking();

  const { text: searchPlaceholder } = useTranslation('Rechercher une chanson...');
  const { text: errorMessage } = useTranslation('Impossible de charger votre bibliothèque');
  const { text: retryText } = useTranslation('Réessayer');

  // Load gamification stats
  React.useEffect(() => {
    if (user?.id) {
      loadStats(user.id);
    }
  }, [user?.id, loadStats]);

  const level = gamificationStats ? Math.floor((gamificationStats.currentXP || 0) / XP_PER_LEVEL) + 1 : 1;

  const handleSongPlay = async (song: any) => {
    // Log activity for playing music
    await logActivity({
      activity_type: 'study',
      metadata: { action: 'music_play', song_id: song.id, song_title: song.title }
    });
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
    <MedMngLayout className="bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="min-w-0">
            <TranslatedText 
              text="Ma bibliothèque"
              as="h1"
              className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2 truncate"
              showLoader
            />
            <TranslatedText 
              text={`${filteredSongs.length} chanson${filteredSongs.length > 1 ? 's' : ''}`}
              as="p"
              className="text-sm sm:text-base text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Stats gamification - mobile compact */}
            {gamificationStats && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Badge variant="outline" className="gap-1 py-1 sm:py-1.5 text-xs sm:text-sm">
                  <Flame className="h-3 w-3 text-warning" />
                  {gamificationStats.currentStreak || 0}
                  <span className="hidden sm:inline">j</span>
                </Badge>
                <Badge variant="outline" className="gap-1 py-1 sm:py-1.5 text-xs sm:text-sm">
                  <Trophy className="h-3 w-3 text-primary" />
                  <span className="hidden sm:inline">Niv.</span>{level}
                </Badge>
              </div>
            )}
            {/* Crédits */}
            <div className="text-right shrink-0">
              <div className="bg-card rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm">
                <TranslatedText text="Crédits" className="text-xs text-muted-foreground hidden sm:block" />
                <div className="text-base sm:text-lg md:text-2xl font-bold text-primary">
                  {quota?.remaining_credits || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Search */}
        <div className="mb-4 sm:mb-8">
          <AdvancedSearch
            songs={library || []}
            onFilteredSongs={setFilteredSongs}
            placeholder={searchPlaceholder}
          />
        </div>

        {/* Actions - responsive buttons */}
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button 
            onClick={() => navigate(ROUTE_PATHS.medMngCreate)}
            className="flex items-center gap-1.5 sm:gap-2 min-h-[44px] flex-1 sm:flex-none text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline"><TranslatedText text="Créer une chanson" /></span>
            <span className="sm:hidden">Créer</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(ROUTE_PATHS.medMngPlaylists)}
            className="flex items-center gap-1.5 sm:gap-2 min-h-[44px] flex-1 sm:flex-none text-xs sm:text-sm"
          >
            <ListMusic className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline"><TranslatedText text="Playlists" /></span>
            <span className="sm:hidden">Lists</span>
          </Button>
        </div>

        {/* Tabs responsive */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-6">
          <TabsList className="grid w-full grid-cols-3 mb-3 sm:mb-4 h-auto">
            <TabsTrigger value="all" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
              <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Toutes</span>
              <span className="sm:hidden">Tout</span>
              <span className="text-xs ml-0.5 sm:ml-1">({library?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Favoris</span>
              <span className="sm:hidden">♥</span>
              <span className="text-xs ml-0.5 sm:ml-1">({library?.filter(s => s.is_liked).length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
              <ListMusic className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
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

        {/* Pagination responsive */}
        {library && library.length === 12 && activeTab !== 'playlists' && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="min-h-[44px] px-3 sm:px-6 flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <span className="hidden sm:inline"><TranslatedText text="Précédent" /></span>
                <span className="sm:hidden">←</span>
              </Button>
              <div className="flex items-center justify-center px-3 text-sm text-muted-foreground">
                {currentPage}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => p + 1)}
                className="min-h-[44px] px-3 sm:px-6 flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <span className="hidden sm:inline"><TranslatedText text="Suivant" /></span>
                <span className="sm:hidden">→</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </MedMngLayout>
  );

  function renderSongGrid() {
    return filteredSongs.length === 0 ? (
      <div className="text-center py-8 sm:py-16">
        <Music className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
        <TranslatedText 
          text={activeTab === 'favorites' ? 'Aucun favori' : (library && library.length > 0 ? 'Aucun résultat' : 'Bibliothèque vide')}
          as="h3"
          className="text-base sm:text-xl font-semibold text-foreground mb-2"
        />
        <TranslatedText 
          text={activeTab === 'favorites' 
            ? 'Ajoutez des chansons à vos favoris' 
            : (library && library.length > 0
              ? 'Aucune chanson correspondante' 
              : 'Créez votre première chanson')}
          as="p"
          className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-sm mx-auto"
        />
        {(!library || library.length === 0) && activeTab === 'all' && (
          <Button onClick={() => navigate(ROUTE_PATHS.medMngCreate)} className="min-h-[44px] px-4 sm:px-6 text-sm">
            <TranslatedText text="Créer" />
          </Button>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 animate-fade-in">
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
      <div className="text-center py-8 sm:py-16">
        <ListMusic className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
        <TranslatedText 
          text="Mes playlists"
          as="h3"
          className="text-base sm:text-xl font-semibold text-foreground mb-2"
        />
        <TranslatedText 
          text="Organisez vos chansons"
          as="p"
          className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6"
        />
        <Button 
          onClick={() => navigate(ROUTE_PATHS.medMngPlaylists)} 
          className="min-h-[44px] px-4 sm:px-6 text-sm"
        >
          <ListMusic className="h-4 w-4 mr-2" />
          <TranslatedText text="Voir" />
        </Button>
      </div>
    );
  }
};

export const MedMngLibrary = withAuth(MedMngLibraryComponent);
