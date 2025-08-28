import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Home, 
  Brain, 
  Music, 
  Settings, 
  User, 
  BarChart3, 
  Users, 
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  Stethoscope,
  Heart,
  Activity,
  Star,
  Play,
  PlusCircle,
  Library,
  Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  to: string;
  icon: React.ComponentType<any>;
  description?: string;
  badge?: string;
  children?: NavigationItem[];
}

const navigationConfig: NavigationItem[] = [
  {
    label: 'Accueil',
    to: '/',
    icon: Home,
    description: 'Dashboard principal'
  },
  {
    label: 'EDN Immersif',
    to: '/edn',
    icon: GraduationCap,
    description: 'Items de connaissances',
    children: [
      { label: 'Bibliothèque complète', to: '/edn', icon: Library },
      { label: 'Recherche avancée', to: '/edn?search=true', icon: Search },
      { label: 'Favoris', to: '/edn?tab=favorites', icon: Heart },
      { label: 'Progression', to: '/edn?tab=progress', icon: Activity }
    ]
  },
  {
    label: 'MED-MNG Studio',
    to: '/med-mng',
    icon: Music,
    description: 'Création musicale médicale',
    children: [
      { label: 'Dashboard', to: '/med-mng/dashboard', icon: Home },
      { label: 'Créer', to: '/med-mng/create', icon: PlusCircle },
      { label: 'Bibliothèque', to: '/med-mng/library', icon: Library },
      { label: 'Playlists', to: '/med-mng/playlists', icon: Headphones },
      { label: 'Communauté', to: '/med-mng/community', icon: Users },
      { label: 'Analytics', to: '/med-mng/analytics', icon: BarChart3 }
    ]
  },
  {
    label: 'ECOS',
    to: '/ecos',
    icon: Stethoscope,
    description: 'Situations cliniques',
    children: [
      { label: 'Situations UNESS', to: '/ecos', icon: BookOpen },
      { label: 'Entraînement', to: '/ecos?mode=training', icon: Play },
      { label: 'Évaluation', to: '/ecos?mode=exam', icon: Star }
    ]
  },
  {
    label: 'Chat Médical',
    to: '/chat',
    icon: Brain,
    description: 'Assistant IA médical'
  },
  {
    label: 'Analytics',
    to: '/analytics',
    icon: BarChart3,
    description: 'Tableaux de bord'
  }
];

export const MainNavigation = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const location = useLocation();

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const NavigationItem = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isDropdownOpen = openDropdowns.includes(item.label);
    const active = isActive(item.to);

    return (
      <div className="relative">
        <div className="flex items-center">
          <NavLink
            to={item.to}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group flex-1",
              level === 0 ? "text-base font-medium" : "text-sm",
              active 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
              level > 0 && "ml-6"
            )}
            onClick={() => setIsMobileOpen(false)}
          >
            <item.icon className={cn(
              "flex-shrink-0",
              level === 0 ? "h-5 w-5" : "h-4 w-4",
              active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
            )} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.description && level === 0 && (
                <div className="text-xs opacity-70 mt-1">{item.description}</div>
              )}
            </div>
          </NavLink>
          
          {hasChildren && (
            <button
              onClick={() => toggleDropdown(item.label)}
              className="p-2 rounded-lg hover:bg-accent mr-2"
            >
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                isDropdownOpen ? "rotate-180" : "rotate-0"
              )} />
            </button>
          )}
        </div>

        {hasChildren && isDropdownOpen && (
          <div className="mt-2 space-y-1">
            {item.children?.map((child) => (
              <NavigationItem key={child.to} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background border rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Navigation Sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full w-80 bg-background/95 backdrop-blur-sm border-r border-border z-40 transform transition-transform duration-300 lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MED-Platform</h1>
                <p className="text-sm text-muted-foreground">Plateforme d'apprentissage</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationConfig.map((item) => (
              <NavigationItem key={item.to} item={item} />
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="space-y-2">
              <NavLink
                to="/med-mng/profile"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm hover:bg-accent transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>Profil</span>
              </NavLink>
              <NavLink
                to="/med-mng/settings"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm hover:bg-accent transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                <Settings className="h-4 w-4" />
                <span>Paramètres</span>
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};