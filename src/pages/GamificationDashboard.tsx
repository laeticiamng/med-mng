import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Zap,
  Trophy,
  Target,
  Star,
  TrendingUp,
  Award,
  Flame,
  Loader,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  useFetchUserAura,
  useFetchUserBadges,
  useFetchGamificationStats,
  useFetchUserRank,
} from '@/hooks/useBadges'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuraDisplay } from '@/components/badges/AuraDisplay'

export default function GamificationDashboard() {
  const { user } = useAuth()

  // Fetch gamification data using new badges system
  const { data: aura, isLoading: auraLoading } = useFetchUserAura(user?.id || '')
  const { data: userBadges = [], isLoading: badgesLoading } = useFetchUserBadges(user?.id || '')
  const { data: stats, isLoading: statsLoading } = useFetchGamificationStats(user?.id || '')
  const { data: userRank } = useFetchUserRank(user?.id || '')

  const isLoading = auraLoading || badgesLoading || statsLoading

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center py-8">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour accéder au tableau de bord de gamification.
            </p>
            <Link to={ROUTE_PATHS.medMngLogin}>
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Tableau de Bord Gamification | Med-Mng</title>
        <meta name="description" content="Suivez votre progression, badges, aura et classement" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Tableau de Bord Gamification</h1>
            <p className="text-muted-foreground mt-2">
              Suivez votre progression, badges, aura et classement dans la communauté
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Aura Display */}
              {auraLoading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              ) : (
                <AuraDisplay aura={aura} />
              )}

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Vos Statistiques Gamification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : stats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.total_points}</div>
                        <div className="text-xs text-muted-foreground">Points totaux</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{stats.badges_earned}</div>
                        <div className="text-xs text-muted-foreground">Badges obtenus</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{stats.streaks_count}</div>
                        <div className="text-xs text-muted-foreground">Séries actives</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.posts_count}</div>
                        <div className="text-xs text-muted-foreground">Posts créés</div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Rank Card */}
              {userRank && (
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      Votre Classement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">#{userRank.rank}</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      {userRank.score.toLocaleString()} points
                    </div>
                    <Badge className="bg-green-600 text-white">
                      Niveau {userRank.aura_level}
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {/* Badges Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {badgesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader className="h-5 w-5 animate-spin" />
                    </div>
                  ) : userBadges.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun badge gagné encore
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {userBadges.length} badge{userBadges.length > 1 ? 's' : ''} obtenu{userBadges.length > 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {userBadges.slice(0, 6).map((badge) => (
                          <div
                            key={badge.id}
                            className="flex flex-col items-center p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                            title={badge.badge_definition?.description}
                          >
                            <span className="text-2xl mb-1">
                              {badge.badge_definition?.icon_emoji || '🏆'}
                            </span>
                            <span className="text-xs text-muted-foreground text-center line-clamp-2 max-w-[50px]">
                              {badge.badge_definition?.name || 'Badge'}
                            </span>
                          </div>
                        ))}
                        {userBadges.length > 6 && (
                          <Link to={ROUTE_PATHS.badgeCollection} className="w-full">
                            <Button variant="outline" size="sm" className="w-full">
                              Voir tous ({userBadges.length})
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-amber-600" />
                    Comment progresser
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2 text-muted-foreground">
                  <p>• Logez vos activités de bien-être</p>
                  <p>• Créez des posts et commentaires</p>
                  <p>• Complétez vos objectifs</p>
                  <p>• Maintenez vos séries actives</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to={ROUTE_PATHS.badgeCollection}>
              <Button variant="outline" className="w-full justify-center gap-2">
                <Star className="h-4 w-4" />
                Ma Collection de Badges
              </Button>
            </Link>
            <Link to={ROUTE_PATHS.communityLeaderboard}>
              <Button variant="outline" className="w-full justify-center gap-2">
                <Trophy className="h-4 w-4" />
                Classement Communautaire
              </Button>
            </Link>
            <Link to={ROUTE_PATHS.wellness}>
              <Button variant="outline" className="w-full justify-center gap-2">
                <Flame className="h-4 w-4" />
                Bien-être & Séries
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
