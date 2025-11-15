import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { ArrowLeft, UserPlus, UserMinus, Globe, MapPin, Briefcase, Award, Eye, Heart, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useFetchProfileWithStats,
  useFetchAchievements,
  useFetchFollowers,
  useFollowUser,
  useUnfollowUser,
  useIsFollowing,
} from '@/hooks/useUserProfile'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function UserPublicProfile() {
  const { userId } = useParams<{ userId: string }>()
  const { user: currentUser } = useAuth()

  const { data: profile, isLoading: profileLoading } = useFetchProfileWithStats(userId || '')
  const { data: achievements = [], isLoading: achievementsLoading } = useFetchAchievements(userId || '')
  const { data: followers = [], isLoading: followersLoading } = useFetchFollowers(userId || '')
  const { data: isFollowing = false } = useIsFollowing(userId || '')
  const followMutation = useFollowUser()
  const unfollowMutation = useUnfollowUser()

  const isOwnProfile = currentUser?.id === userId

  const handleFollow = () => {
    if (!userId) return
    followMutation.mutate(userId, {
      onSuccess: () => {
        toast.success('Vous suivez maintenant cet utilisateur')
      },
      onError: () => {
        toast.error('Erreur lors du suivi')
      },
    })
  }

  const handleUnfollow = () => {
    if (!userId) return
    unfollowMutation.mutate(userId, {
      onSuccess: () => {
        toast.success('Vous avez arrêté de suivre cet utilisateur')
      },
      onError: () => {
        toast.error('Erreur lors de l\'arrêt du suivi')
      },
    })
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Utilisateur non trouvé
            </p>
            <Link to={ROUTE_PATHS.users}>
              <Button className="w-full">Retour</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Profil introuvable</p>
            <Link to={ROUTE_PATHS.users}>
              <Button variant="outline" className="mt-4">
                Retour à l'annuaire
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTE_PATHS.users}>
            <Button variant="ghost" size="sm" className="mb-4" data-testid="back-button">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'annuaire
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-24 h-24 flex-shrink-0">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {(profile.display_name || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold">
                    {profile.display_name || 'Utilisateur'}
                  </h1>
                  {profile.verified && (
                    <Badge variant="secondary" className="bg-blue-100">✓ Vérifié</Badge>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}

                {/* Meta Information */}
                <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.occupation && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {profile.occupation}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Link to={ROUTE_PATHS.profileEdit}>
                      <Button data-testid="edit-profile-button">Éditer le profil</Button>
                    </Link>
                  ) : (
                    <>
                      {isFollowing ? (
                        <Button
                          variant="outline"
                          onClick={handleUnfollow}
                          disabled={unfollowMutation.isPending}
                          data-testid="unfollow-button"
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Ne plus suivre
                        </Button>
                      ) : (
                        <Button
                          onClick={handleFollow}
                          disabled={followMutation.isPending}
                          data-testid="follow-button"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Suivre
                        </Button>
                      )}
                      <Button variant="outline">
                        Envoyer un message
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.posts_count || 0}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{profile.followers_count || 0}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{profile.following_count || 0}</div>
                <div className="text-sm text-muted-foreground">Suivant</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round((profile.engagement_score || 0) * 100)}%</div>
                <div className="text-sm text-muted-foreground">Engagement</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="achievements">Réalisations</TabsTrigger>
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Réalisations Débloquées</CardTitle>
                <CardDescription>
                  {achievements.length} badge{achievements.length !== 1 ? 's' : ''} débloqué{achievements.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {achievementsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-24 w-full rounded" />
                    ))}
                  </div>
                ) : achievements.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex flex-col items-center text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        data-testid={`achievement-${achievement.id}`}
                      >
                        <Award className="h-12 w-12 text-yellow-500 mb-2" />
                        <div className="font-semibold text-sm mb-1 line-clamp-2">
                          {achievement.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(achievement.earned_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Award className="h-12 w-12 text-muted-foreground opacity-40 mb-4" />
                    <p className="text-muted-foreground">Aucun badge débloqué pour le moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers">
            <Card>
              <CardHeader>
                <CardTitle>Followers</CardTitle>
                <CardDescription>
                  {followers.length} personne{followers.length !== 1 ? 's' : ''} suit cet utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent>
                {followersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded" />
                    ))}
                  </div>
                ) : followers.length > 0 ? (
                  <div className="space-y-3">
                    {followers.map((follower) => (
                      <div
                        key={follower.id}
                        className="p-3 border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Follower {follower.follower_id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              Suit depuis {formatDistanceToNow(new Date(follower.created_at), { locale: fr })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Pas encore de followers</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
                <CardDescription>Performance et engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold">{profile.total_views || 0}</div>
                    <div className="text-sm text-muted-foreground">Vues totales</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="text-2xl font-bold">{profile.likes_received || 0}</div>
                    <div className="text-sm text-muted-foreground">J'aimes reçus</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold">{achievements.length}</div>
                    <div className="text-sm text-muted-foreground">Réalisations</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{Math.round((profile.engagement_score || 0) * 100)}%</div>
                    <div className="text-sm text-muted-foreground">Score d'engagement</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
