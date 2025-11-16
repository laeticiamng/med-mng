import { useState } from 'react'
import { Activity, Target, Flame, TrendingUp, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFetchWellnessStats, useFetchWellnessStreaks, useFetchActivities, useFetchGoals } from '@/hooks/useWellness'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function WellnessDashboard() {
  const [selectedActivityType, setSelectedActivityType] = useState<string>()
  const [timeRange, setTimeRange] = useState('7d')

  const { data: stats, isLoading: statsLoading } = useFetchWellnessStats()
  const { data: streaks = [], isLoading: streaksLoading } = useFetchWellnessStreaks()
  const { data: activities = [], isLoading: activitiesLoading } = useFetchActivities(20, 0, selectedActivityType as any)
  const { data: goals = [], isLoading: goalsLoading } = useFetchGoals('active')

  const calculateProgressWidth = (progress: number, target?: number) => {
    if (!target) return 0
    return Math.min((progress / target) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mon bien-être</h1>
          <p className="text-muted-foreground mt-2">
            Suivez vos activités de bien-être et vos progrès
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </>
          ) : stats ? (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Score de bien-être</p>
                      <p className="text-3xl font-bold">{Math.round(stats.wellness_score)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Activités totales</p>
                      <p className="text-3xl font-bold">{stats.activities_completed_total}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Rituels complétés</p>
                      <p className="text-3xl font-bold">{stats.rituals_completed_total}</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Méditation (min)</p>
                      <p className="text-3xl font-bold">{stats.meditation_minutes_total}</p>
                    </div>
                    <Flame className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Streaks Section */}
        {!streaksLoading && streaks.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Vos séries</CardTitle>
              <CardDescription>Continuez votre progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {streaks.slice(0, 6).map((streak) => (
                  <Card key={streak.id} className="border-2 border-orange-200 dark:border-orange-800">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{streak.current_streak}</p>
                        <p className="text-sm font-medium">{streak.activity_type}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Meilleure série: {streak.best_streak} jours
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total: {streak.days_completed} jours
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals Section */}
        {!goalsLoading && goals.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Objectifs actifs</CardTitle>
                  <CardDescription>{goals.length} objectif{goals.length > 1 ? 's' : ''}</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel objectif
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{goal.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-muted rounded-full h-2 max-w-md">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${calculateProgressWidth(goal.current_progress, goal.target_value)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {goal.current_progress}{goal.target_unit ? `/${goal.target_value} ${goal.target_unit}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activités récentes</CardTitle>
                <CardDescription>Vos 20 dernières activités</CardDescription>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                  <SelectItem value="90d">90 jours</SelectItem>
                  <SelectItem value="1y">1 an</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded" />
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{activity.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {activity.activity_type}
                            </Badge>
                            {activity.mood_after && (
                              <span className="text-xs text-muted-foreground">
                                Humeur: {activity.mood_after}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.duration_minutes && (
                        <p className="font-medium">{activity.duration_minutes} min</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground opacity-40 mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune activité pour le moment</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Commencer une activité
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
