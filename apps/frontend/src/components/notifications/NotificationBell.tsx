/**
 * Notification Bell Component
 * Displays unread notification count with dropdown panel
 */

import React from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useUnreadCount } from '@/hooks/useNotificationsService'
import NotificationPanel from './NotificationPanel'
import { useAuth } from '@/hooks/useAuth'

export const NotificationBell: React.FC = () => {
  const { user } = useAuth()
  const { data: unreadCount = 0, isLoading } = useUnreadCount(user?.id || '')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="notification-bell-button"
          disabled={isLoading || !user}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              data-testid="notification-badge"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 shadow-lg" align="end">
        {user ? (
          <NotificationPanel userId={user.id} />
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Please log in to view notifications
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
