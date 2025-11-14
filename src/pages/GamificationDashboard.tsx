import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { useGamification } from '@/hooks/useGamification'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function GamificationDashboard() {
  const { user } = useAuth()
  const {
    useFetchUserLevel,
    useFetchBadges,
    useFetchChallenges,
    useFetchAchievementStats,
  } = useGamification()

  // Fetch gamification data
  const { data: level, isLoading: levelLoading } = useFetchUserLevel(user?.id)
  const { data: badges = [], isLoading: badgesLoading } = useFetchBadges(user?.id)
  const { data: challenges = [] } = useFetchChallenges(user?.id, 'daily')
  const { data: stats } = useFetchAchievementStats(user?.id)

  const isLoading = levelLoading || badgesLoading

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
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
        <meta name="description" content="Suivez votre progression, badges et défis" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Tableau de Bord Gamification</h1>
            <p className="text-lg text-gray-600">
              Suivez votre progression, gagnez des badges et relevez des défis
            </p>
          </div>

          {/* Level and XP Card */}
          {level && (
            <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Niveau {level.level}</h2>
                    <p className="text-blue-100 mb-4">{level.rank}</p>
                  </div>
                  <Trophy className="w-16 h-16 opacity-80" />
                </div>

                {/* XP Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>
                      {level.currentXp} / {level.nextLevelXp} XP
                    </span>
                  </div>
                  <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                    <div
                      className="bg-white h-3 rounded-full transition-all"
                      style={{
                        width: `${(level.currentXp / level.nextLevelXp) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-blue-100 mt-2">
                    XP total: {level.totalXp}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Daily Challenges */}
            <div className="lg:col-span-2 space-y-8">
              {/* Challenges Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Défis Quotidiens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : challenges.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">Aucun défi disponible</p>
                  ) : (
                    challenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{challenge.title}</h3>
                            <p className="text-sm text-gray-600">{challenge.description}</p>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800">
                            {challenge.points} XP
                          </Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>
                              Progression: {challenge.progress}/{challenge.target}
                            </span>
                            <span>
                              {Math.round((challenge.progress / challenge.target) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${(challenge.progress / challenge.target) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Stats Card */}
              {stats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Vos Statistiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalPosts}</div>
                        <div className="text-xs text-gray-600">Posts créés</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.totalViews}</div>
                        <div className="text-xs text-gray-600">Vues</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{stats.totalLikes}</div>
                        <div className="text-xs text-gray-600">Likes</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.totalComments}
                        </div>
                        <div className="text-xs text-gray-600">Commentaires</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Streak Card */}
              {stats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Flame className="w-5 h-5 text-red-600" />
                      Série
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-4xl font-bold text-red-600 mb-2">{stats.streakDays}</div>
                    <div className="text-sm text-gray-600 mb-4">jours consécutifs</div>
                    <div className="text-xs text-gray-500">
                      Record: {stats.longestStreak} jours
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Badges Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Badges ({badges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader className="w-5 h-5 animate-spin" />
                    </div>
                  ) : badges.length === 0 ? (
                    <p className="text-sm text-gray-600 text-center">Aucun badge gagné encore</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {badges.slice(0, 6).map((badge) => (
                        <div
                          key={badge.id}
                          className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title={badge.description}
                        >
                          <span className="text-2xl mb-1">{badge.icon}</span>
                          <span className="text-xs text-gray-600 text-center line-clamp-2">
                            {badge.name}
                          </span>
                        </div>
                      ))}
                      {badges.length > 6 && (
                        <Link to={ROUTE_PATHS.badges}>
                          <Button variant="outline" size="sm" className="h-auto flex flex-col gap-1">
                            <span className="text-lg">+{badges.length - 6}</span>
                            <span className="text-xs">Voir tous</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Conseils
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 space-y-2">
                  <p>✨ Créez du contenu pour gagner de l'XP</p>
                  <p>🎯 Complétez les défis quotidiens</p>
                  <p>🏆 Gagnez des badges exclusifs</p>
                  <p>📈 Grimpez dans le classement</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link to={ROUTE_PATHS.badges}>
              <Button variant="outline" className="w-full justify-center gap-2">
                <Star className="w-4 h-4" />
                Voir tous les badges
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-center gap-2" disabled>
              <Target className="w-4 h-4" />
              Défis hebdomadaires (Bientôt)
            </Button>
            <Link to={ROUTE_PATHS.leaderboard}>
              <Button variant="outline" className="w-full justify-center gap-2">
                <Trophy className="w-4 h-4" />
                Classement
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
