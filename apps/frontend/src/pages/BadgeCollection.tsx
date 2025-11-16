import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useFetchUserBadges, useFetchAllBadges, useFetchUserAura, useSetAuraColor, useFetchGamificationStats } from '@/hooks/useBadges'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BadgeCard } from '@/components/badges/BadgeCard'
import { AuraDisplay } from '@/components/badges/AuraDisplay'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function BadgeCollection() {
  const { user } = useAuth()
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const { data: userBadges = [], isLoading: badgesLoading } = useFetchUserBadges(user?.id || '')
  const { data: allBadges = [], isLoading: allBadgesLoading } = useFetchAllBadges()
  const { data: aura, isLoading: auraLoading } = useFetchUserAura(user?.id || '')
  const { data: stats, isLoading: statsLoading } = useFetchGamificationStats(user?.id || '')
  const setAuraColor = useSetAuraColor()

  const earnedBadgeIds = new Set(userBadges.map((b) => b.badge_id))

  const categories = ['all', 'achievement', 'streak', 'social', 'wellness', 'learning']
  const categoryLabels = {
    all: 'Tous les badges',
    achievement: 'Réalisations',
    streak: 'Séries',
    social: 'Social',
    wellness: 'Bien-être',
    learning: 'Apprentissage',
  }

  const filteredBadges =
    categoryFilter === 'all'
      ? allBadges
      : allBadges.filter((b) => b.category === categoryFilter)

  const earnedInCategory = filteredBadges.filter((b) => earnedBadgeIds.has(b.id)).length
  const totalInCategory = filteredBadges.length

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Veuillez vous connecter pour voir votre collection de badges</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Collection de Badges</h1>
          <p className="text-muted-foreground mt-2">
            Collectez des badges en accomplissant des actions dans la communauté
          </p>
        </div>

        {/* Aura and Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
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
              <AuraDisplay
                aura={aura}
                onColorChange={(color) => {
                  if (user?.id) {
                    setAuraColor.mutate({ userId: user.id, color })
                  }
                }}
              />
            )}
          </div>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Vos Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statsLoading ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : stats ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Badges obtenus</span>
                    <span className="text-2xl font-bold text-yellow-600">
                      {stats.badges_earned}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Points totaux</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.total_points.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Séries actives</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {stats.streaks_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Posts créés</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {stats.posts_count}
                    </span>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Badges Collection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Badges ({earnedInCategory} / {totalInCategory})</CardTitle>
                <CardDescription>
                  Progression: {Math.round((earnedInCategory / totalInCategory) * 100)}%
                </CardDescription>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat as keyof typeof categoryLabels]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {allBadgesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : filteredBadges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBadges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    earned={earnedBadgeIds.has(badge.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun badge dans cette catégorie</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badge Progress Details */}
        {earnedInCategory > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Badges Obtenus</CardTitle>
              <CardDescription>Vos badges gagnés dans cette catégorie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBadges
                  .filter((b) => earnedBadgeIds.has(b.id))
                  .map((badge) => {
                    const earnedBadge = userBadges.find((ub) => ub.badge_id === badge.id)
                    return (
                      <div key={badge.id} className="flex items-start gap-3 p-4 border rounded-lg">
                        <div className="text-3xl">{badge.icon_emoji}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{badge.name}</h4>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                          {earnedBadge && (
                            <p className="text-xs text-green-600 mt-1">
                              Obtenu le{' '}
                              {new Date(earnedBadge.earned_at).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-green-600 text-white">Obtenu</Badge>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
