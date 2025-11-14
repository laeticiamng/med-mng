import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { Search, MapPin, Briefcase, Eye, Heart, MessageCircle, Loader } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchProfiles, useFetchTrendingUsers } from '@/hooks/useUserProfile'
import { toast } from 'sonner'

export default function UsersDirectory() {
  const { user: currentUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'trending'>('trending')

  // Queries
  const { data: searchResults = [], isLoading: searchLoading } = useSearchProfiles(searchQuery, searchQuery.length > 2 ? true : false)
  const { data: trendingUsers = [], isLoading: trendingLoading } = useFetchTrendingUsers(25)

  // Determine which data to display
  const displayData = useMemo(() => {
    if (searchQuery.length > 2) {
      return searchResults
    }
    if (selectedCategory === 'trending') {
      return trendingUsers
    }
    return []
  }, [searchQuery, selectedCategory, searchResults, trendingUsers])

  const isLoading = searchQuery.length > 2 ? searchLoading : trendingLoading

  const handleSendMessage = (userId: string) => {
    toast.info('Messages non disponibles pour le moment')
  }

  const handleVisitProfile = (userId: string) => {
    // Navigation is handled by the Link component
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Annuaire des utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Découvrez les utilisateurs de la communauté et connectez-vous avec eux
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, localisation ou profession..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="users-search-input"
              />
            </div>
            {searchQuery.length > 0 && searchQuery.length <= 2 && (
              <p className="text-xs text-muted-foreground mt-2">
                Tapez au moins 3 caractères pour rechercher
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        {searchQuery.length <= 2 && (
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as 'all' | 'trending')} className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="trending">Tendances</TabsTrigger>
              <TabsTrigger value="all">Tous les utilisateurs</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Users Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded" />
            ))}
          </div>
        ) : displayData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayData.map((user) => (
              <Card
                key={user.id}
                className="flex flex-col hover:shadow-lg transition-shadow"
                data-testid={`user-card-${user.id}`}
              >
                <CardContent className="pt-6 flex-1 flex flex-col">
                  {/* Avatar and Name */}
                  <div className="flex flex-col items-center text-center mb-4">
                    <Avatar className="w-16 h-16 mb-3">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="text-lg">
                        {(user.display_name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 flex-wrap justify-center mb-1">
                      <h3 className="font-semibold text-lg">{user.display_name || 'Utilisateur'}</h3>
                      {user.verified && (
                        <Badge variant="secondary" className="bg-blue-100 text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  {/* Meta Information */}
                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    {user.location && (
                      <div className="flex items-center gap-2 justify-center">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.occupation && (
                      <div className="flex items-center gap-2 justify-center">
                        <Briefcase className="h-4 w-4 flex-shrink-0" />
                        <span>{user.occupation}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {user.posts_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {user.followers_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {Math.round((user.engagement_score || 0) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Engagement</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-4 border-t">
                    <Link
                      to={ROUTE_PATHS.userProfile.replace(':userId', user.id)}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                        data-testid={`view-profile-${user.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir le profil
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMessage(user.id)}
                      disabled={!currentUser || currentUser.id === user.id}
                      data-testid={`message-${user.id}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center max-w-md">
              <div className="mb-4 text-5xl">🔍</div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery.length > 2 ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur disponible'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery.length > 2
                  ? 'Essayez une autre recherche'
                  : 'Sélectionnez une catégorie pour commencer'}
              </p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Découvrir</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Recherchez par nom, localisation ou profession pour trouver les utilisateurs qui vous intéressent
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Connecter</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Suivez les utilisateurs pour rester à jour avec leurs activités et contenus
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
