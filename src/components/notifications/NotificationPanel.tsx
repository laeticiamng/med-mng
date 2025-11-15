import React, { useState } from 'react'
import { Bell, Trash2, Heart, MessageCircle, UserPlus, AtSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useFetchNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from '@/hooks/useNotificationsService'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'

interface NotificationPanelProps {
  userId: string
  onClose?: () => void
}

export default function NotificationPanel({ userId, onClose }: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('all')

  // Queries
  const { data: notifications = [], isLoading } = useFetchNotifications(userId)

  // Mutations
  const markAsReadMutation = useMarkAsRead(userId)
  const markAllAsReadMutation = useMarkAllAsRead(userId)
  const deleteNotificationMutation = useDeleteNotification(userId)
  const deleteAllMutation = useDeleteAllNotifications(userId)

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'mention':
        return <AtSign className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId)
  }

  const handleDelete = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleDeleteAll = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      deleteAllMutation.mutate()
    }
  }

  const filteredNotifications =
    activeTab === 'all'
      ? notifications
      : notifications.filter((n) => n.type === activeTab)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="flex flex-col h-full max-h-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-base">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">{unreadCount} non lus</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="text-xs"
            data-testid="mark-all-read-button"
          >
            Tout marquer lu
          </Button>
        )}
      </div>

      {/* Tabs */}
      {notifications.length > 0 && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="border-b px-4 pt-2"
        >
          <TabsList className="grid w-full grid-cols-5 h-8">
            <TabsTrigger value="all" className="text-xs">
              Tous
            </TabsTrigger>
            <TabsTrigger value="like" className="text-xs">
              J'aime
            </TabsTrigger>
            <TabsTrigger value="comment" className="text-xs">
              Commentaire
            </TabsTrigger>
            <TabsTrigger value="follow" className="text-xs">
              Follow
            </TabsTrigger>
            <TabsTrigger value="mention" className="text-xs">
              @mention
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm text-muted-foreground">
                {activeTab === 'all'
                  ? 'Aucune notification'
                  : 'Aucune notification de ce type'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg mb-2 transition-colors cursor-pointer hover:bg-muted/50 ${
                  !notification.is_read ? 'bg-muted/30' : 'bg-transparent'
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
                data-testid={`notification-item-${notification.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm line-clamp-1">
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                        )}
                      </div>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notification.id)
                        }}
                        disabled={deleteNotificationMutation.isPending}
                        data-testid={`delete-notification-${notification.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between p-3 border-t bg-muted/30 text-xs">
          <span className="text-muted-foreground">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAll}
            disabled={deleteAllMutation.isPending}
            className="text-xs text-destructive hover:text-destructive"
            data-testid="delete-all-button"
          >
            Tout supprimer
          </Button>
        </div>
      )}
    </div>
  )
}
