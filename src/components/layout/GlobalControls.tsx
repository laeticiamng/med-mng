import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, HelpCircle, User } from 'lucide-react';
import { useAuth } from '@/components/med-mng/AuthProvider';

interface GlobalControlsProps {
  onOpenNotifications?: () => void;
  onOpenHelp?: () => void;
  notificationCount?: number;
}

/**
 * Contrôles Globaux Flottants - Accès rapide aux fonctionnalités
 */
export const GlobalControls: React.FC<GlobalControlsProps> = ({ 
  onOpenNotifications, 
  onOpenHelp, 
  notificationCount = 0 
}) => {
  const { user } = useAuth();

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      {/* Notifications */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenNotifications}
          className="bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border-border/50"
        >
          <Bell className="w-4 h-4" />
        </Button>
        {notificationCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {notificationCount > 9 ? '9+' : notificationCount}
          </Badge>
        )}
      </div>

      {/* Aide */}
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenHelp}
        className="bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border-border/50"
      >
        <HelpCircle className="w-4 h-4" />
      </Button>

      {/* Profil Utilisateur (si connecté) */}
      {user && (
        <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border/50">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium truncate max-w-20">
            {user.email?.split('@')[0] || 'User'}
          </span>
        </div>
      )}
    </div>
  );
};

export default GlobalControls;