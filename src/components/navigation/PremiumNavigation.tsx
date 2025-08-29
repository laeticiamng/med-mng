import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, Music, BookOpen, MessageSquare, BarChart3, Settings, Shield,
  Activity, HeadphonesIcon, Sparkles, User, Library, Plus, CreditCard,
  Brain, Zap, Users, Heart, Search, Bell, Menu, X, ChevronDown,
  Stethoscope, GraduationCap, Microscope, FileText, TrendingUp,
  Database, Clock, Star, Award, Play, Bookmark, Download
} from 'lucide-react';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { cn } from '@/lib/utils';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  description?: string;
  category: 'main' | 'tools' | 'learning' | 'admin' | 'user';
  isPremium?: boolean;
  comingSoon?: boolean;
}

const navigationItems: NavigationItem[] = [
  // Main Navigation
  { path: '/', label: 'Accueil', icon: Home, category: 'main', description: 'Retour à l\'accueil' },
  { path: '/platform', label: 'Plateforme', icon: Sparkles, category: 'main', description: 'Vue d\'ensemble de la plateforme' },
  
  // Core Learning Tools
  { path: '/edn', label: 'Items EDN', icon: BookOpen, badge: '367', category: 'learning', description: 'Tous les items EDN avec IA musicale' },
  { path: '/ecos', label: 'ECOS', icon: MessageSquare, category: 'learning', description: 'Examens cliniques objectifs structurés' },
  { path: '/generator', label: 'Générateur IA', icon: Music, badge: 'AI', category: 'tools', description: 'Génération musicale intelligente', isPremium: true },
  
  // AI & Analytics
  { path: '/chat', label: 'Assistant IA', icon: Brain, badge: 'Beta', category: 'tools', description: 'Assistant intelligent médical' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, category: 'tools', description: 'Analyses détaillées des performances' },
  { path: '/monitoring', label: 'Monitoring', icon: Activity, category: 'tools', description: 'Surveillance en temps réel' },
  
  // MED-MNG Suite
  { path: '/med-mng/dashboard', label: 'Dashboard MED-MNG', icon: TrendingUp, category: 'learning', description: 'Tableau de bord personnel', isPremium: true },
  { path: '/med-mng/library', label: 'Bibliothèque', icon: Library, category: 'learning', description: 'Vos créations musicales' },
  { path: '/med-mng/create', label: 'Créer', icon: Plus, category: 'tools', description: 'Nouvel contenu médical' },
  { path: '/med-mng/playlists', label: 'Playlists', icon: Play, category: 'learning', description: 'Vos playlists d\'apprentissage' },
  
  // Advanced Features
  { path: '/audit', label: 'Audit Complet', icon: Microscope, category: 'tools', description: 'Audit de contenu avancé' },
  { path: '/optimization', label: 'Optimisation', icon: Zap, category: 'tools', description: 'Centre d\'optimisation' },
  { path: '/community', label: 'Communauté', icon: Users, category: 'learning', description: 'Échanges entre étudiants' },
  
  // User Management
  { path: '/profile', label: 'Profil', icon: User, category: 'user', description: 'Votre profil personnel' },
  { path: '/settings', label: 'Paramètres', icon: Settings, category: 'user', description: 'Configuration du compte' },
  { path: '/notifications', label: 'Notifications', icon: Bell, category: 'user', description: 'Vos notifications' },
  
  // Support & Info
  { path: '/help', label: 'Centre d\'aide', icon: HeadphonesIcon, category: 'main', description: 'Support et assistance' },
  { path: '/documentation', label: 'Documentation', icon: FileText, category: 'main', description: 'Guide complet' },
  { path: '/faq', label: 'FAQ', icon: MessageSquare, category: 'main', description: 'Questions fréquentes' },
  
  // Admin (conditionally shown)
  { path: '/admin', label: 'Administration', icon: Shield, category: 'admin', description: 'Panel d\'administration' },
  { path: '/admin-panel', label: 'Admin Panel', icon: Database, category: 'admin', description: 'Panel administrateur avancé' },
];

export const PremiumNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getItemsByCategory = (category: string) => {
    return navigationItems.filter(item => {
      if (category === 'admin' && user?.email !== 'admin@medmng.com') return false;
      return item.category === category;
    });
  };

  const categories = [
    { id: 'main', label: 'Principal', icon: Home },
    { id: 'learning', label: 'Apprentissage', icon: GraduationCap },
    { id: 'tools', label: 'Outils IA', icon: Zap },
    { id: 'user', label: 'Compte', icon: User },
    ...(user?.email === 'admin@medmng.com' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed top-0 left-0 h-full w-80 glass-medical border-r border-border/50 z-50 overflow-y-auto">
        <div className="p-6">
          {/* Logo Premium */}
          <Link to="/" className="flex items-center gap-3 mb-8 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-premium rounded-2xl flex items-center justify-center shadow-glow">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="heading-premium text-xl font-bold">MED MNG</h1>
              <p className="text-premium text-xs">Plateforme Premium</p>
            </div>
          </Link>

          {/* User Profile Quick Access */}
          {user && (
            <div className="medical-card-premium p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Étudiant Premium</p>
                </div>
                <Badge className="status-success text-xs">Pro</Badge>
              </div>
            </div>
          )}

          {/* Navigation Categories */}
          <div className="space-y-2">
            {categories.map((category) => {
              const items = getItemsByCategory(category.id);
              if (items.length === 0) return null;

              return (
                <div key={category.id} className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                    {category.label}
                  </h3>
                  {items.map((item) => {
                    const active = isActive(item.path);
                    const IconComponent = item.icon;

                    return (
                      <Link key={item.path} to={item.path}>
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start h-auto p-3 transition-all duration-300",
                            active 
                              ? "medical-btn-primary shadow-glow" 
                              : "hover:bg-muted/50 premium-hover"
                          )}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className={cn(
                              "p-2 rounded-lg transition-colors",
                              active 
                                ? "bg-white/20" 
                                : "bg-muted/50 group-hover:bg-primary/10"
                            )}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{item.label}</span>
                                {item.badge && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                                {item.isPremium && (
                                  <Star className="h-3 w-3 text-accent fill-accent" />
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-3">
              Actions Rapides
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                className="medical-btn-outline h-12 flex-col gap-1"
                onClick={() => navigate('/med-mng/create')}
              >
                <Plus className="h-4 w-4" />
                <span className="text-xs">Créer</span>
              </Button>
              <Button
                size="sm"
                className="medical-btn-outline h-12 flex-col gap-1"
                onClick={() => navigate('/generator')}
              >
                <Music className="h-4 w-4" />
                <span className="text-xs">Générer</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="glass-medical border-b border-border/50 sticky top-0 z-50">
          <div className="flex items-center justify-between p-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="heading-premium font-bold">MED MNG</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => navigate('/notifications')}>
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <div className="absolute top-16 inset-x-0 bottom-0 glass-medical border-t border-border/50 overflow-y-auto">
              <div className="p-4 space-y-6">
                {categories.map((category) => {
                  const items = getItemsByCategory(category.id);
                  if (items.length === 0) return null;

                  return (
                    <div key={category.id}>
                      <h3 className="text-sm font-semibold text-foreground mb-3 px-2">
                        {category.label}
                      </h3>
                      <div className="space-y-1">
                        {items.map((item) => {
                          const active = isActive(item.path);
                          const IconComponent = item.icon;

                          return (
                            <Link 
                              key={item.path} 
                              to={item.path}
                              onClick={() => setIsOpen(false)}
                            >
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start h-auto p-3",
                                  active && "medical-btn-primary"
                                )}
                              >
                                <IconComponent className="h-4 w-4 mr-3" />
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{item.label}</span>
                                    {item.badge && (
                                      <Badge variant="outline" className="text-xs">
                                        {item.badge}
                                      </Badge>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 inset-x-0 glass-medical border-t border-border/50 z-50">
          <div className="flex items-center justify-around p-2">
            {[
              { path: '/', icon: Home, label: 'Accueil' },
              { path: '/edn', icon: BookOpen, label: 'EDN' },
              { path: '/med-mng/create', icon: Plus, label: 'Créer' },
              { path: '/med-mng/library', icon: Library, label: 'Biblio' },
              { path: '/profile', icon: User, label: 'Profil' }
            ].map((item) => {
              const active = isActive(item.path);
              const IconComponent = item.icon;

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex-col h-auto py-2 px-3 min-w-0",
                      active && "text-primary"
                    )}
                  >
                    <IconComponent className={cn(
                      "h-5 w-5 mb-1",
                      active && "scale-110"
                    )} />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};