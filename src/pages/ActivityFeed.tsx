import { useState, useMemo } from 'react'
import { Heart, MessageCircle, UserPlus, Share2, FolderPlus, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  useFetchActivityFeed,
  useMarkActivityAsRead,
  useMarkAllActivitiesAsRead,
  useDeleteActivity,
  useDeleteAllActivities,
  useUnreadActivityCount,
} from '@/hooks/useActivityFeed'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ActivityFeed() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('all')
  const [limit, setLimit] = useState(50)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Veuillez vous connecter pour voir votre flux d'activité.
            </p>
            <Link to={ROUTE_PATHS.medMngLogin}>
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Queries
  const { data: activities = [], isLoading } = useFetchActivityFeed(user.id, limit)
  const { data: unreadCount = 0 } = useUnreadActivityCount(user.id)

  // Mutations
  const markAsReadMutation = useMarkActivityAsRead(user.id)
  const markAllAsReadMutation = useMarkAllActivitiesAsRead(user.id)
  const deleteActivityMutation = useDeleteActivity(user.id)
  const deleteAllMutation = useDeleteAllActivities(user.id)

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (activeTab === 'all') return activities
    return activities.filter((a) => a.activity_type === activeTab)
  }, [activities, activeTab])

  const activityCounts = {
    post_created: activities.filter((a) => a.activity_type === 'post_created').length,
    comment_created: activities.filter((a) => a.activity_type === 'comment_created').length,
    post_liked: activities.filter((a) => a.activity_type === 'post_liked').length,
    comment_liked: activities.filter((a) => a.activity_type === 'comment_liked').length,
    user_followed: activities.filter((a) => a.activity_type === 'user_followed').length,
    post_shared: activities.filter((a) => a.activity_type === 'post_shared').length,
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post_created':
        return '📝'
      case 'comment_created':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'post_liked':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'comment_liked':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'user_followed':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'post_shared':
        return <Share2 className="h-4 w-4 text-purple-500" />
      case 'collection_created':
        return <FolderPlus className="h-4 w-4 text-orange-500" />
      default:
        return '📌'
    }
  }

  const getActivityTitle = (activity: any) => {
    switch (activity.activity_type) {
      case 'post_created':
        return 'Vous avez créé un post'
      case 'comment_created':
        return 'Vous avez commenté'
      case 'post_liked':
        return 'Quelqu\'un a aimé votre post'
      case 'comment_liked':
        return 'Quelqu\'un a aimé votre commentaire'
      case 'user_followed':
        return 'Quelqu\'un vous suit'
      case 'post_shared':
        return 'Quelqu\'un a partagé votre post'
      case 'collection_created':
        return 'Vous avez créé une collection'
      case 'item_added_to_collection':
        return 'Un élément a été ajouté à votre collection'
      default:
        return 'Nouvelle activité'
    }
  }

  const handleMarkAsRead = (activityId: string) => {
    markAsReadMutation.mutate(activityId)
  }

  const handleDelete = (activityId: string) => {
    deleteActivityMutation.mutate(activityId)
  }

  const handleDeleteAll = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tout votre historique d\'activité ?')) {
      deleteAllMutation.mutate()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Flux d'activité</h1>
            <p className="text-muted-foreground mt-2">
              Suivez votre activité et celle de votre communauté
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-base px-3 py-1">
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex gap-2 mb-6">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="mark-all-read-button"
            >
              Marquer tout comme lu
            </Button>
          )}
          {activities.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
              disabled={deleteAllMutation.isPending}
              data-testid="delete-all-button"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Tout supprimer
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">
              Tous ({activities.length})
            </TabsTrigger>
            <TabsTrigger value="post_created">
              Posts ({activityCounts.post_created})
            </TabsTrigger>
            <TabsTrigger value="comment_created">
              Commentaires ({activityCounts.comment_created})
            </TabsTrigger>
            <TabsTrigger value="post_liked">
              Likes posts ({activityCounts.post_liked})
            </TabsTrigger>
            <TabsTrigger value="comment_liked">
              Likes coms ({activityCounts.comment_liked})
            </TabsTrigger>
            <TabsTrigger value="user_followed">
              Follows ({activityCounts.user_followed})
            </TabsTrigger>
            <TabsTrigger value="post_shared">
              Partages ({activityCounts.post_shared})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded" />
                ))}
              </div>
            ) : filteredActivities.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    {activeTab === 'all'
                      ? 'Aucune activité pour le moment'
                      : `Aucune activité de ce type`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((activity) => (
                  <Card
                    key={activity.id}
                    className={`transition-all ${
                      !activity.is_read
                        ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800'
                        : ''
                    }`}
                    onClick={() => handleMarkAsRead(activity.id)}
                    data-testid={`activity-item-${activity.id}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4 justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="mt-1 flex-shrink-0">
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-base">
                                {getActivityTitle(activity)}
                              </p>
                              {!activity.is_read && (
                                <Badge variant="default" className="text-xs">
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                            {activity.metadata?.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {activity.metadata.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-3">
                              {formatDistanceToNow(new Date(activity.created_at), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              data-testid={`activity-menu-${activity.id}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!activity.is_read && (
                              <DropdownMenuItem onClick={() => handleMarkAsRead(activity.id)}>
                                Marquer comme lu
                              </DropdownMenuItem>
                            )}
                            {activity.target_id && (
                              <DropdownMenuItem
                                onClick={() => {
                                  // Navigate to the target item
                                  if (activity.target_type === 'post') {
                                    navigate(`/posts/${activity.target_id}`)
                                  }
                                }}
                              >
                                Voir le détail
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(activity.id)}
                            >
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Load more button */}
                {filteredActivities.length >= limit && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setLimit(limit + 50)}
                      data-testid="load-more-button"
                    >
                      Charger plus d'activités
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
