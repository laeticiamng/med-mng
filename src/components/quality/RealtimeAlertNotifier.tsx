import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

export const RealtimeAlertNotifier: React.FC = () => {
  const { alerts, unreadCount, markAsRead } = useRealtimeAlerts();
  const navigate = useNavigate();

  const recentAlerts = alerts.slice(0, 5);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAlertClick = (alertId: string) => {
    markAsRead(alertId);
    navigate('/quality-admin');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Quality Alerts</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>
          
          {recentAlerts.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No alerts
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {recentAlerts.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => handleAlertClick(alert.id)}
                    className={`w-full text-left p-3 rounded-lg hover:bg-accent transition-colors ${
                      !alert.is_read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{alert.project_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-1 truncate">{alert.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/quality-admin')}
          >
            View All Alerts
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
