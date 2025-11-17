/**
 * Completed Quests Page
 * Displays user's completed quests (earned badges) with statistics and rewards
 */

import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/hooks/useAuth'
import { useGetCompletedQuests, useGetGamificationStats } from '@/hooks/useQuests'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, CheckCircle, Star, Award, Calendar, Filter, ArrowLeft } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'learning':
      return <Star className="h-5 w-5" />
    case 'streak':
      return <Calendar className="h-5 w-5" />
    case 'social':
      return <Trophy className="h-5 w-5" />
    case 'achievement':
    default:
      return <Award className="h-5 w-5" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'learning':
      return 'bg-blue-500'
    case 'streak':
      return 'bg-green-500'
    case 'social':
      return 'bg-pink-500'
    case 'wellness':
      return 'bg-purple-500'
    case 'achievement':
    default:
      return 'bg-yellow-500'
  }
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'from-yellow-400 to-orange-500'
    case 'epic':
      return 'from-purple-400 to-pink-500'
    case 'rare':
      return 'from-blue-400 to-cyan-500'
    case 'uncommon':
      return 'from-green-400 to-emerald-500'
    case 'common':
    default:
      return 'from-gray-400 to-gray-500'
  }
}

export const CompletedQuests: React.FC = () => {
  const { user } = useAuth()
  const { data: completedQuests = [], isLoading: questsLoading } = useGetCompletedQuests(user?.id || '')
  const { data: stats, isLoading: statsLoading } = useGetGamificationStats(user?.id || '')

  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<string>('all')

  // Filter quests
  const filteredQuests = useMemo(() => {
    return completedQuests.filter(quest => {
      const matchesCategory = categoryFilter === 'all' || quest.badge.category === categoryFilter
      const matchesRarity = rarityFilter === 'all' || quest.badge.rarity === rarityFilter
      return matchesCategory && matchesRarity
    })
  }, [completedQuests, categoryFilter, rarityFilter])

  // Calculate total XP from completed quests
  const totalXP = useMemo(() => {
    return filteredQuests.reduce((sum, quest) => sum + quest.xp_reward, 0)
  }, [filteredQuests])

  if (!user) {
    return (
      <>
        <Helmet><title>Connexion requise | Quêtes</title></Helmet>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Connexion requise</CardTitle>
              <CardDescription>Vous devez être connecté pour voir vos quêtes complétées</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = ROUTE_PATHS.login} className="w-full">
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const isLoading = questsLoading || statsLoading

  return (
    <>
      <Helmet>
        <title>Quêtes Complétées | Med-Mng</title>
        <meta name="description" content="Toutes vos quêtes réussies et récompenses gagnées" />
      </Helmet>

      <div className="container max-w-6xl mx-auto p-6">
        {/* Back Button */}
        <Link to={ROUTE_PATHS.dashboard}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Quêtes Complétées
          </h1>
          <p className="text-muted-foreground">
            Toutes vos quêtes réussies et récompenses gagnées
          </p>
        </div>

        {/* Statistics Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
                <CardContent><Skeleton className="h-12 w-full" /></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quêtes Complétées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="text-3xl font-bold">{completedQuests.length}</div>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">XP Gagné</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 text-yellow-500" />
                  <div>
                    <div className="text-3xl font-bold">{stats?.total_points || 0}</div>
                    <p className="text-xs text-muted-foreground">Points d'expérience</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Badges Obtenus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="text-3xl font-bold">{stats?.badges_earned || 0}</div>
                    <p className="text-xs text-muted-foreground">Récompenses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        {!isLoading && completedQuests.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filtrer par:</span>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      <SelectItem value="learning">Apprentissage</SelectItem>
                      <SelectItem value="streak">Régularité</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="wellness">Bien-être</SelectItem>
                      <SelectItem value="achievement">Accomplissements</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Select value={rarityFilter} onValueChange={setRarityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rareté" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les raretés</SelectItem>
                      <SelectItem value="common">Commun</SelectItem>
                      <SelectItem value="uncommon">Peu commun</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Épique</SelectItem>
                      <SelectItem value="legendary">Légendaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(categoryFilter !== 'all' || rarityFilter !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCategoryFilter('all')
                      setRarityFilter('all')
                    }}
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>

              <div className="mt-3 text-sm text-muted-foreground">
                {filteredQuests.length} quête(s) affichée(s)
                {filteredQuests.length !== completedQuests.length && ` sur ${completedQuests.length} au total`}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Quests List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Historique des Quêtes</h2>

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader><Skeleton className="h-20 w-full" /></CardHeader>
                  <CardContent><Skeleton className="h-12 w-full" /></CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredQuests.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {completedQuests.length === 0
                    ? 'Aucune quête complétée'
                    : 'Aucune quête ne correspond aux filtres'}
                </h3>
                <p className="text-muted-foreground">
                  {completedQuests.length === 0
                    ? 'Commencez à compléter des quêtes pour voir vos succès ici'
                    : 'Essayez de modifier vos filtres'}
                </p>
              </CardContent>
            </Card>
          )}

          {!isLoading &&
            filteredQuests.map((quest) => (
              <Card key={quest.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-3 rounded-lg ${getCategoryColor(quest.badge.category)} text-white relative overflow-hidden`}
                      >
                        {/* Rarity gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(quest.badge.rarity)} opacity-30`} />
                        <span className="relative text-2xl">{quest.badge.icon_emoji}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-1 flex-wrap">
                          <CardTitle className="text-xl">{quest.badge.name}</CardTitle>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-300"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complétée
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              quest.badge.rarity === 'legendary'
                                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-300'
                                : quest.badge.rarity === 'epic'
                                ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300'
                                : 'bg-gray-50 text-gray-700 border-gray-300'
                            }
                          >
                            {quest.badge.rarity === 'legendary' && '⭐ '}
                            {quest.badge.rarity === 'epic' && '💎 '}
                            {quest.badge.rarity === 'rare' && '🔷 '}
                            {quest.badge.rarity.charAt(0).toUpperCase() + quest.badge.rarity.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription>{quest.badge.description}</CardDescription>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Complétée le{' '}
                          {new Date(quest.earned_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="font-semibold text-yellow-700">+{quest.xp_reward} XP</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-700">
                        Catégorie: <span className="font-medium capitalize">{quest.badge.category}</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </>
  )
}

export default CompletedQuests
