import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  useFetchLeaderboardByScore,
  useFetchWeeklyLeaderboard,
  useFetchMonthlyLeaderboard,
  useFetchUserRank,
} from '@/hooks/useBadges'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Medal, Trophy, Flame } from 'lucide-react'

export default function Leaderboard() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month'>('all')

  const { data: overallLeaderboard = [], isLoading: overallLoading } = useFetchLeaderboardByScore(100)
  const { data: weeklyLeaderboard = [], isLoading: weeklyLoading } = useFetchWeeklyLeaderboard(100)
  const { data: monthlyLeaderboard = [], isLoading: monthlyLoading } = useFetchMonthlyLeaderboard(100)
  const { data: userRank } = useFetchUserRank(user?.id || '')

  const currentLeaderboard =
    timeRange === 'week' ? weeklyLeaderboard : timeRange === 'month' ? monthlyLeaderboard : overallLeaderboard

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '>G'
    if (rank === 2) return '>H'
    if (rank === 3) return '>I'
    return rank.toString()
  }

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank <= 3) return <Medal className="h-5 w-5 text-orange-500" />
    return null
  }

  const getScoreForRank = (entry: any) => {
    if (timeRange === 'week') return entry.week_points
    if (timeRange === 'month') return entry.month_points
    return entry.score
  }

  const isCurrentUser = (userId: string) => user?.id === userId

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Classement Communautaire</h1>
          <p className="text-muted-foreground mt-2">
            Compétez avec les autres membres de la communauté
          </p>
        </div>

        {/* User Rank Card */}
        {userRank && (
          <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Votre Classement</p>
                  <div className="flex items-center gap-3">
                    {getMedalIcon(userRank.rank || 999) && (
                      getMedalIcon(userRank.rank || 999)
                    )}
                    <span className="text-3xl font-bold">#{userRank.rank || 'N/A'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    {timeRange === 'week' ? 'Points cette semaine' : timeRange === 'month' ? 'Points ce mois' : 'Points totaux'}
                  </p>
                  <p className="text-3xl font-bold">
                    {timeRange === 'week'
                      ? userRank.week_points || 0
                      : timeRange === 'month'
                        ? userRank.month_points || 0
                        : userRank.score || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Niveau d'Aura</p>
                  <p className="text-3xl font-bold text-purple-600">{userRank.aura_level || 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as 'all' | 'week' | 'month')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tous les temps</TabsTrigger>
            <TabsTrigger value="week">Cette semaine</TabsTrigger>
            <TabsTrigger value="month">Ce mois</TabsTrigger>
          </TabsList>

          <TabsContent value={timeRange} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top 50 Joueurs</CardTitle>
                <CardDescription>
                  {timeRange === 'week'
                    ? 'Classement hebdomadaire'
                    : timeRange === 'month'
                      ? 'Classement mensuel'
                      : 'Classement global'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentLeaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    {overallLoading || weeklyLoading || monthlyLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Aucune donnée de classement disponible</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentLeaderboard.map((entry, index) => {
                      const position = index + 1
                      const score = getScoreForRank(entry)
                      const isMe = isCurrentUser(entry.user_id)

                      return (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            isMe
                              ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700'
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center justify-center w-10">
                              <span className="text-xl font-bold">
                                {getRankMedal(position)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">
                                {isMe ? 'Vous' : `Utilisateur ${entry.user_id.slice(0, 8)}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Niveau Aura: {entry.aura_level} " {entry.badges_count} badges
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 mr-4">
                            <div className="text-right">
                              <Badge variant="secondary" className="mb-2">
                                {score.toLocaleString()} pts
                              </Badge>
                            </div>
                          </div>

                          {position <= 3 && getMedalIcon(position) && (
                            <div className="flex-shrink-0">
                              {getMedalIcon(position)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Leaderboard Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Comment ça fonctionne?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Gagner des points</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>" Créer un post: 10 points</li>
                  <li>" Écrire un commentaire: 5 points</li>
                  <li>" Obtenir un badge: 50 points</li>
                  <li>" Compléter un objectif: 100 points</li>
                  <li>" Maintenir une série: 25 points par jour</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Augmenter votre niveau</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>" Accumulez 1000 XP par niveau</li>
                  <li>" Gagnez de l'XP avec chaque action</li>
                  <li>" Votre aura change à chaque niveau</li>
                  <li>" Plus de couleurs disponibles</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
