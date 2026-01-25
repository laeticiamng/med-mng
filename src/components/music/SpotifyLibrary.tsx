import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ROUTE_PATHS } from '@/config/routes'
import { cn } from "@/lib/utils"
import { musicService } from "@/services/musicService"
import {
    Calendar,
    Filter,
    Grid,
    Heart,
    List,
    MoreHorizontal,
    Music,
    Play,
    Plus,
    Search
} from "lucide-react"
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from "sonner"
import { AudioPlayer } from "./AudioPlayer"

interface Song {
  id: string
  title: string
  suno_audio_id: string
  audio_url?: string
  meta?: any
  created_at: string
}

interface LibrarySong extends Song {
  added_at: string
}

export function SpotifyLibrary() {
  const [library, setLibrary] = useState<LibrarySong[]>([])
  const [filteredLibrary, setFilteredLibrary] = useState<LibrarySong[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedSong, setSelectedSong] = useState<(Song & { audio_url: string }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'favorites'>('all')

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    filterLibrary()
  }, [library, searchQuery, filterBy, favorites])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      
      const [libraryData, favoritesData, playlistsData] = await Promise.all([
        musicService.getUserLibrary(),
        musicService.getFavorites(),
        musicService.getUserPlaylists()
      ])

      setLibrary(libraryData.map(item => ({
        ...item.emotionscare_songs,
        added_at: item.created_at
      })))
      setFavorites(favoritesData)
      setPlaylists(playlistsData)

      toast.success('Bibliothèque chargée', {
        description: `${libraryData.length} chansons dans votre bibliothèque`
      })
    } catch (error) {
      console.error('❌ Error fetching user data:', error)
      toast.error('Erreur de chargement', {
        description: 'Impossible de charger votre bibliothèque'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterLibrary = () => {
    let filtered = [...library]

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.meta?.item_code?.toLowerCase().includes(query)
      )
    }

    // Filtre par catégorie
    switch (filterBy) {
      case 'recent':
        filtered = filtered.filter(song => {
          const addedDate = new Date(song.added_at)
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return addedDate > weekAgo
        })
        break
      case 'favorites':
        const favoriteIds = favorites.map(f => f.song_id)
        filtered = filtered.filter(song => favoriteIds.includes(song.id))
        break
    }

    // Trier par date d'ajout (plus récent en premier)
    filtered.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())

    setFilteredLibrary(filtered)
  }

  const handlePlaySong = (song: Song) => {
    // Créer un objet compatible avec AudioPlayer
    const playerSong = {
      ...song,
      audio_url: song.audio_url || `https://cdn.suno.ai/audio/${song.suno_audio_id}.mp3`
    }
    setSelectedSong(playerSong)
    toast.info('Lecture en cours', {
      description: song.title
    })
  }

  const handleToggleFavorite = async (songId: string) => {
    try {
      const isFavorited = await musicService.toggleFavorite(songId)
      
      if (isFavorited) {
        setFavorites(prev => [...prev, { song_id: songId, created_at: new Date().toISOString() }])
        toast.success('Ajouté aux favoris')
      } else {
        setFavorites(prev => prev.filter(f => f.song_id !== songId))
        toast.success('Retiré des favoris')
      }
    } catch (error) {
      toast.error('Erreur', { description: 'Impossible de modifier les favoris' })
    }
  }

  const isSongFavorited = (songId: string) => {
    return favorites.some(f => f.song_id === songId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getItemCodeBadgeColor = (itemCode?: string): "default" | "destructive" | "outline" | "secondary" => {
    if (!itemCode) return 'default'
    const num = parseInt(itemCode.replace('IC-', ''))
    if (num <= 50) return 'secondary'
    if (num <= 200) return 'outline'
    return 'default'
  }

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement de votre bibliothèque...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Music className="h-8 w-8 text-primary" />
            Ma Bibliothèque Musicale
          </h1>
          <p className="text-muted-foreground mt-1">
            {library.length} chanson{library.length > 1 ? 's' : ''} • {favorites.length} favori{favorites.length > 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une chanson ou un item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {(['all', 'recent', 'favorites'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={filterBy === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy(filter)}
                >
                  {filter === 'all' && 'Toutes'}
                  {filter === 'recent' && 'Récentes'}
                  {filter === 'favorites' && 'Favoris'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des chansons */}
      {filteredLibrary.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'Aucun résultat' : 'Bibliothèque vide'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Essayez avec d\'autres mots-clés'
                : 'Commencez par générer des chansons pour vos items EDN'
              }
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link to={ROUTE_PATHS.ednLegacy}>
                  <Plus className="h-4 w-4 mr-2" />
                  Générer ma première chanson
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "gap-4",
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-2"
        )}>
          {filteredLibrary.map((song) => (
            <Card 
              key={song.id} 
              className={cn(
                "transition-all duration-200 hover:shadow-md cursor-pointer",
                viewMode === 'list' && "hover:bg-muted/50"
              )}
              onClick={() => handlePlaySong(song)}
            >
              <CardContent className={cn(
                "p-4",
                viewMode === 'list' && "py-3"
              )}>
                <div className={cn(
                  "flex gap-3",
                  viewMode === 'grid' ? "flex-col" : "items-center"
                )}>
                  {/* Info chanson */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold truncate">{song.title}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFavorite(song.id)
                        }}
                        className={cn(
                          "h-8 w-8 p-0",
                          isSongFavorited(song.id) && "text-destructive"
                        )}
                      >
                        <Heart className={cn(
                          "h-4 w-4",
                          isSongFavorited(song.id) && "fill-current"
                        )} />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {song.meta?.item_code && (
                        <Badge variant={getItemCodeBadgeColor(song.meta.item_code)}>
                          {song.meta.item_code}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(song.added_at)}
                      </div>
                    </div>

                    {song.meta?.rang_type && (
                      <p className="text-sm text-muted-foreground">
                        Rang {song.meta.rang_type.toUpperCase()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={cn(
                    "flex gap-1",
                    viewMode === 'grid' ? "justify-end" : "flex-shrink-0"
                  )}>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlaySong(song)
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Actions pour "{song.title}"</DialogTitle>
                          <DialogDescription>
                            Que souhaitez-vous faire avec cette chanson ?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => handleToggleFavorite(song.id)}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            {isSongFavorited(song.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter à une playlist
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Player flottant */}
      {selectedSong && (
        <div className="fixed bottom-4 right-4 w-96 z-50">
          <AudioPlayer
            song={selectedSong}
            onEnded={() => setSelectedSong(null)}
            showControls={true}
          />
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">{library.length}</div>
            <div className="text-sm text-muted-foreground">Total chansons</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-destructive">{favorites.length}</div>
            <div className="text-sm text-muted-foreground">Favoris</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-success">{playlists.length}</div>
            <div className="text-sm text-muted-foreground">Playlists</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {library.filter(s => {
                const addedDate = new Date(s.added_at)
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                return addedDate > weekAgo
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Cette semaine</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}