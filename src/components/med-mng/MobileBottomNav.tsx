import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Library, Plus, CreditCard, User, Flame, Heart } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { cn } from '@/lib/utils';
import { ROUTE_PATHS } from '@/config/routes';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BottomNavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  onClick: () => void;
  isActive: boolean;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ 
  icon, 
  label, 
  path, 
  onClick, 
  isActive 
}) => {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      aria-label={`Navigation vers ${label}`}
      className={cn(
        "flex flex-col items-center justify-center p-2 transition-all duration-200 min-h-[64px] flex-1",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        "active:scale-95",
        isActive 
          ? "text-primary bg-primary/5" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <div className={cn(
        "transition-all duration-200 mb-1",
        isActive && "transform scale-110"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-xs font-medium transition-all duration-200",
        isActive && "font-semibold"
      )}>
        <TranslatedText text={label} />
      </span>
      {isActive && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
      )}
    </button>
  );
};

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = useGamification();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Accueil",
      path: ROUTE_PATHS.home,
      onClick: () => navigate(ROUTE_PATHS.home)
    },
    {
      icon: <Library className="h-5 w-5" />,
      label: "Bibliothèque", 
      path: ROUTE_PATHS.medMngLibrary,
      onClick: () => navigate(ROUTE_PATHS.medMngLibrary)
    },
    {
      icon: <Heart className="h-5 w-5" />,
      label: "Favoris",
      path: ROUTE_PATHS.medMngFavorites,
      onClick: () => navigate(ROUTE_PATHS.medMngFavorites)
    },
    {
      icon: <Plus className="h-5 w-5" />,
      label: "Créer",
      path: ROUTE_PATHS.medMngCreate, 
      onClick: () => navigate(ROUTE_PATHS.medMngCreate)
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Abonnements",
      path: ROUTE_PATHS.medMngPricing,
      onClick: () => navigate(ROUTE_PATHS.medMngPricing)
    },
    {
      icon: <User className="h-5 w-5" />,
      label: "Profil",
      path: ROUTE_PATHS.medMngProfile, 
      onClick: () => navigate(ROUTE_PATHS.medMngProfile)
    }
  ];

  return (
    <nav 
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-card border-t border-border shadow-lg"
      role="tablist"
      aria-label="Navigation principale mobile"
    >
      {/* Mini gamification stats bar */}
      {user && stats && (
        <div className="flex items-center justify-center gap-4 py-1 bg-muted/50 border-b border-border text-xs">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-warning" />
                <span className="font-medium">{stats.currentStreak}</span>
              </TooltipTrigger>
              <TooltipContent>Streak actuelle</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-muted-foreground">•</span>
          <span className="font-medium">Niv. {stats.level}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-primary font-medium">{stats.totalPoints} XP</span>
        </div>
      )}
      
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => (
          <BottomNavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            onClick={item.onClick}
            isActive={isActive(item.path)}
          />
        ))}
      </div>
      
      {/* Safe area padding for iPhone with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)] bg-card" />
    </nav>
  );
};
