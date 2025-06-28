
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { withAuth } from '@/components/med-mng/withAuth';
import { MedMngNavigation } from '@/components/med-mng/MedMngNavigation';
import { SongCard } from '@/components/med-mng/SongCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Music, Heart, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MedMngLibraryComponent = () => {
  const medMngApi = useMedMngApi();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: library, isLoading, error, refetch } = useQuery({
    queryKey: ['med-mng-library', currentPage],
    queryFn: () => medMngApi.getLibrary(currentPage, 12),
  });

  const { data: quota } = useQuery({
    queryKey: ['med-mng-quota'],
    queryFn: () => medMngApi.getRemainingQuota(),
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
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
            <p className="text-gray-600 mb-4">Impossible de charger votre bibliothèque</p>
            <Button onClick={() => refetch()}>Réessayer</Button>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Ma bibliothèque musicale
            </h1>
            <p className="text-gray-600">
              {filteredSongs.length} chanson{filteredSongs.length > 1 ? 's' : ''} dans votre collection
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <div className="text-sm text-gray-600">Crédits restants</div>
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
              placeholder="Rechercher une chanson..."
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
            Créer une chanson
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/med-mng/pricing')}
          >
            Voir les abonnements
          </Button>
        </div>

        {/* Library Grid */}
        {filteredSongs.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Aucun résultat' : 'Bibliothèque vide'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Aucune chanson ne correspond à votre recherche' 
                : 'Commencez par créer votre première chanson'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/med-mng/create')} className="bg-blue-600 hover:bg-blue-700">
                Créer ma première chanson
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
                Précédent
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MedMngLibrary = withAuth(MedMngLibraryComponent);
