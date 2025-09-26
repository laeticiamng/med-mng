import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, Search, Star, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavigationHistory {
  path: string;
  title: string;
  timestamp: number;
  visitCount: number;
}

interface QuickAction {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  priority: number;
}

interface SmartNavigationContextType {
  history: NavigationHistory[];
  favorites: string[];
  quickActions: QuickAction[];
  addToFavorites: (path: string) => void;
  removeFromFavorites: (path: string) => void;
  getPageTitle: (path: string) => string;
  getRecommendations: () => NavigationHistory[];
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
}

const SmartNavigationContext = createContext<SmartNavigationContextType | undefined>(undefined);

export const useSmartNavigation = () => {
  const context = useContext(SmartNavigationContext);
  if (!context) {
    throw new Error('useSmartNavigation must be used within SmartNavigationProvider');
  }
  return context;
};

// Page titles mapping
const PAGE_TITLES: Record<string, string> = {
  '/': 'Accueil',
  '/dashboard': 'Tableau de bord',
  '/edn-production': 'EDN Explorer',
  '/ecos': 'ECOS Simulations',
  '/med-mng/dashboard': 'MED-MNG Dashboard',
  '/med-mng/library': 'Bibliothèque',
  '/med-mng/create': 'Studio de création',
  '/chat': 'Chat IA',
  '/analytics': 'Analytics',
  '/community': 'Communauté',
  '/profile': 'Profil',
  '/settings': 'Paramètres'
};

export const SmartNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<NavigationHistory[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Default quick actions
  const quickActions: QuickAction[] = [
    { id: 'home', label: 'Accueil', path: '/', icon: <Home className="h-4 w-4" />, priority: 10 },
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <TrendingUp className="h-4 w-4" />, priority: 9 },
    { id: 'edn', label: 'EDN', path: '/edn-production', icon: <Search className="h-4 w-4" />, priority: 8 },
    { id: 'chat', label: 'Chat IA', path: '/chat', icon: <Search className="h-4 w-4" />, priority: 7 },
  ];

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('smart-navigation-history');
    const savedFavorites = localStorage.getItem('smart-navigation-favorites');
    
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('smart-navigation-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('smart-navigation-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Track navigation
  useEffect(() => {
    const currentPath = location.pathname;
    const title = getPageTitle(currentPath);
    
    // Update navigation stack
    setNavigationStack(prev => {
      const newStack = prev.slice(0, currentIndex + 1);
      if (newStack[newStack.length - 1] !== currentPath) {
        newStack.push(currentPath);
        setCurrentIndex(newStack.length - 1);
        return newStack;
      }
      return prev;
    });

    // Update history
    setHistory(prev => {
      const existing = prev.find(item => item.path === currentPath);
      if (existing) {
        return prev.map(item => 
          item.path === currentPath 
            ? { ...item, timestamp: Date.now(), visitCount: item.visitCount + 1 }
            : item
        );
      } else {
        const newItem: NavigationHistory = {
          path: currentPath,
          title,
          timestamp: Date.now(),
          visitCount: 1
        };
        return [newItem, ...prev.slice(0, 49)]; // Keep max 50 items
      }
    });
  }, [location.pathname]);

  const getPageTitle = useCallback((path: string): string => {
    return PAGE_TITLES[path] || path.split('/').pop()?.replace('-', ' ') || 'Page';
  }, []);

  const addToFavorites = useCallback((path: string) => {
    setFavorites(prev => prev.includes(path) ? prev : [...prev, path]);
  }, []);

  const removeFromFavorites = useCallback((path: string) => {
    setFavorites(prev => prev.filter(fav => fav !== path));
  }, []);

  const getRecommendations = useCallback((): NavigationHistory[] => {
    return history
      .filter(item => item.path !== location.pathname)
      .sort((a, b) => {
        // Weight by recency and frequency
        const aScore = (a.visitCount * 0.7) + ((Date.now() - a.timestamp) / (1000 * 60 * 60 * 24) * -0.3);
        const bScore = (b.visitCount * 0.7) + ((Date.now() - b.timestamp) / (1000 * 60 * 60 * 24) * -0.3);
        return bScore - aScore;
      })
      .slice(0, 5);
  }, [history, location.pathname]);

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < navigationStack.length - 1;

  const goBack = useCallback(() => {
    if (canGoBack) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      navigate(navigationStack[newIndex]);
    }
  }, [canGoBack, currentIndex, navigationStack, navigate]);

  const goForward = useCallback(() => {
    if (canGoForward) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      navigate(navigationStack[newIndex]);
    }
  }, [canGoForward, currentIndex, navigationStack, navigate]);

  return (
    <SmartNavigationContext.Provider value={{
      history,
      favorites,
      quickActions,
      addToFavorites,
      removeFromFavorites,
      getPageTitle,
      getRecommendations,
      canGoBack,
      canGoForward,
      goBack,
      goForward
    }}>
      {children}
    </SmartNavigationContext.Provider>
  );
};

// Smart Navigation Toolbar Component
export const SmartNavigationToolbar: React.FC<{ className?: string }> = ({ className }) => {
  const { canGoBack, canGoForward, goBack, goForward, favorites, getPageTitle } = useSmartNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const currentIsFavorite = favorites.includes(location.pathname);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 bg-card border border-border rounded-lg shadow-sm",
      className
    )}>
      {/* Back/Forward buttons */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={goBack}
          disabled={!canGoBack}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={goForward}
          disabled={!canGoForward}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <Input
          type="search"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8"
        />
      </form>

      {/* Current page indicator */}
      <Badge variant="outline" className="text-xs">
        {getPageTitle(location.pathname)}
      </Badge>
    </div>
  );
};

// Quick Navigation Menu
export const QuickNavigationMenu: React.FC<{ className?: string }> = ({ className }) => {
  const { quickActions, favorites, getRecommendations, getPageTitle } = useSmartNavigation();
  const navigate = useNavigate();
  const recommendations = getRecommendations();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Star className="h-4 w-4" />
          Actions rapides
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(action => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => navigate(action.path)}
              className="justify-start gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Favoris
          </h3>
          <div className="space-y-1">
            {favorites.slice(0, 5).map(path => (
              <Button
                key={path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(path)}
                className="w-full justify-start text-xs"
              >
                {getPageTitle(path)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Recent/Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Récent
          </h3>
          <div className="space-y-1">
            {recommendations.map(item => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className="w-full justify-start text-xs"
              >
                <span className="truncate">{item.title}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.visitCount}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};