import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import {
    BookOpen,
    Brain,
    Flame,
    Headphones,
    Heart,
    Home,
    ListMusic,
    LogOut,
    Music,
    Settings,
    Star
} from 'lucide-react';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export const MedMngNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats } = useGamification();

  useEffect(() => {
    if (user?.id) {
      loadStats(user.id);
    }
  }, [user?.id, loadStats]);

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string, label: string) => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'navigation', action: 'click', destination: label }
    });
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTE_PATHS.medMngLogin);
  };

  return (
    <nav id="main-navigation" className="bg-card shadow-sm border-b sticky top-0 z-40" role="navigation" aria-label="Navigation principale">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo avec identité musicale */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(ROUTE_PATHS.home)}>
            <div className="relative">
              <Headphones className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <Music className="h-3 w-3 text-accent-foreground absolute -bottom-1 -right-1" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">
              MED-MNG
            </span>
            <Badge variant="outline" className="hidden sm:inline-flex text-xs text-muted-foreground">
              🎵 Music Learning
            </Badge>
          </div>

          {/* Gamification stats */}
          {gamificationStats && (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="gap-1 py-1 border-warning/30 bg-warning/5">
                <Flame className="h-3 w-3 text-warning" />
                {gamificationStats.currentStreak}
              </Badge>
              <Badge variant="outline" className="gap-1 py-1 border-primary/30 bg-primary/5">
                <Star className="h-3 w-3 text-primary" />
                Nv.{gamificationStats.level}
              </Badge>
            </div>
          )}

          {/* Desktop Navigation - Orienté étudiant */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant={isActive(ROUTE_PATHS.home) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation(ROUTE_PATHS.home, 'Accueil')}
              className="flex items-center gap-2 px-3"
            >
              <Home className="h-4 w-4" />
              Accueil
            </Button>

            <Button
              variant={isActive(ROUTE_PATHS.medMngItemsLibrary) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation(ROUTE_PATHS.medMngItemsLibrary, 'Bibliothèque')}
              className="flex items-center gap-2 px-3"
            >
              <ListMusic className="h-4 w-4" />
              📚 Bibliothèque
            </Button>

            <Button
              variant={isActive(ROUTE_PATHS.ednComplete) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation(ROUTE_PATHS.ednComplete, 'Mes items')}
              className="flex items-center gap-2 px-3"
            >
              <BookOpen className="h-4 w-4" />
              📚 Mes items
            </Button>

            <Button
              variant={isActive(ROUTE_PATHS.medMngProgress) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation(ROUTE_PATHS.medMngProgress, 'Progression')}
              className="flex items-center gap-2 px-3"
            >
              <Brain className="h-4 w-4" />
              🧠 Progression
            </Button>

            <Button
              variant={isActive(ROUTE_PATHS.medMngFavorites) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation(ROUTE_PATHS.medMngFavorites, 'Favoris')}
              className="flex items-center gap-2 px-3"
            >
              <Heart className="h-4 w-4" />
              ❤️ Favoris
            </Button>

            <Button
              variant={isActive(ROUTE_PATHS.medMngProfile) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation(ROUTE_PATHS.medMngProfile, 'Paramètres')}
              className="flex items-center gap-2 px-3"
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-3"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTE_PATHS.home)}
              className="p-2"
            >
              <Home className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
