import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  BookOpen, 
  Music, 
  Users, 
  Settings, 
  BarChart3,
  Stethoscope,
  FileText,
  Shield,
  Home,
  Star,
  Clock,
  Heart,
  TrendingUp,
  Zap,
  Target,
  Award,
  Brain,
  Headphones,
  MessageSquare,
  Filter,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
  category: string;
  description: string;
  isNew?: boolean;
  isPopular?: boolean;
  requiresAuth?: boolean;
  badge?: string;
}

interface NavigationCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const categories: NavigationCategory[] = [
  { id: 'dashboard', name: 'Dashboard', icon: <Home className="h-4 w-4" />, color: 'bg-blue-500' },
  { id: 'learning', name: 'Apprentissage', icon: <BookOpen className="h-4 w-4" />, color: 'bg-green-500' },
  { id: 'music', name: 'Musical', icon: <Music className="h-4 w-4" />, color: 'bg-purple-500' },
  { id: 'analysis', name: 'Analyse', icon: <BarChart3 className="h-4 w-4" />, color: 'bg-orange-500' },
  { id: 'medical', name: 'Médical', icon: <Stethoscope className="h-4 w-4" />, color: 'bg-red-500' },
  { id: 'community', name: 'Communauté', icon: <Users className="h-4 w-4" />, color: 'bg-indigo-500' },
  { id: 'admin', name: 'Administration', icon: <Shield className="h-4 w-4" />, color: 'bg-gray-500' },
];

const navigationItems: NavigationItem[] = [
  // Dashboard & Vue d'ensemble
  { id: 'home', title: 'Accueil', path: '/', icon: <Home className="h-4 w-4" />, category: 'dashboard', description: 'Page d\'accueil principale' },
  { id: 'dashboard', title: 'Dashboard Complet', path: '/dashboard', icon: <BarChart3 className="h-4 w-4" />, category: 'dashboard', description: 'Vue d\'ensemble complète', isPopular: true },
  { id: 'platform', title: 'Vue Plateforme', path: '/platform', icon: <Target className="h-4 w-4" />, category: 'dashboard', description: 'Navigation master complète', isNew: true },
  { id: 'features', title: 'Toutes les Fonctionnalités', path: '/features', icon: <Zap className="h-4 w-4" />, category: 'dashboard', description: 'Découvrir toutes les fonctionnalités' },
  { id: 'optimization', title: 'Centre d\'Optimisation', path: '/optimization', icon: <TrendingUp className="h-4 w-4" />, category: 'dashboard', description: 'Optimisation et performances' },
  
  // Apprentissage EDN
  { id: 'edn', title: 'Items EDN Immersifs', path: '/edn', icon: <BookOpen className="h-4 w-4" />, category: 'learning', description: 'Contenus pédagogiques EDN immersifs', isPopular: true },
  { id: 'ecos', title: 'Situations ECOS', path: '/ecos', icon: <Target className="h-4 w-4" />, category: 'learning', description: 'Examens cliniques objectifs structurés' },
  
  // MED-MNG Musical (Authentifié)
  { id: 'med-dashboard', title: 'Dashboard Musical', path: '/med-mng/dashboard', icon: <Headphones className="h-4 w-4" />, category: 'music', description: 'Tableau de bord musical', requiresAuth: true },
  { id: 'create', title: 'Studio Création', path: '/med-mng/create', icon: <Music className="h-4 w-4" />, category: 'music', description: 'Générer des musiques pédagogiques', requiresAuth: true, isNew: true },
  { id: 'library', title: 'Bibliothèque Musicale', path: '/med-mng/library', icon: <BookOpen className="h-4 w-4" />, category: 'music', description: 'Vos musiques et collections', requiresAuth: true },
  { id: 'playlists', title: 'Playlists Collaboratives', path: '/med-mng/playlists', icon: <Heart className="h-4 w-4" />, category: 'music', description: 'Organiser vos apprentissages', requiresAuth: true },
  { id: 'med-settings', title: 'Paramètres MED-MNG', path: '/med-mng/settings', icon: <Settings className="h-4 w-4" />, category: 'music', description: 'Configuration musicale', requiresAuth: true },
  
  // Analytics & Monitoring  
  { id: 'analytics', title: 'Analytics Avancées', path: '/analytics', icon: <TrendingUp className="h-4 w-4" />, category: 'analysis', description: 'Analyses et statistiques détaillées' },
  { id: 'med-analytics', title: 'Analytics Musicales', path: '/med-mng/analytics', icon: <BarChart3 className="h-4 w-4" />, category: 'analysis', description: 'Statistiques d\'apprentissage musical', requiresAuth: true },
  { id: 'monitoring', title: 'Monitoring Temps Réel', path: '/monitoring', icon: <Shield className="h-4 w-4" />, category: 'analysis', description: 'Surveillance du système en temps réel' },
  { id: 'system-health', title: 'Santé Système', path: '/system-health', icon: <Heart className="h-4 w-4" />, category: 'analysis', description: 'État de santé et diagnostic système' },
  
  // Outils Générateurs & IA
  { id: 'generator', title: 'Générateur IA', path: '/generator', icon: <Zap className="h-4 w-4" />, category: 'medical', description: 'Générateur de contenu IA avancé' },
  { id: 'chat', title: 'Assistant IA Médical', path: '/chat', icon: <MessageSquare className="h-4 w-4" />, category: 'medical', description: 'Chat IA spécialisé médecine', isNew: true },
  
  // Communauté & Social
  { id: 'community', title: 'Communauté Étudiante', path: '/med-mng/community', icon: <Users className="h-4 w-4" />, category: 'community', description: 'Réseau social d\'étudiants', requiresAuth: true },
  { id: 'profile', title: 'Profil Personnel', path: '/med-mng/profile', icon: <Users className="h-4 w-4" />, category: 'community', description: 'Gérer votre profil et achievements', requiresAuth: true },
  
  // Administration Complète
  { id: 'admin', title: 'Administration Générale', path: '/admin', icon: <Shield className="h-4 w-4" />, category: 'admin', description: 'Panel d\'administration principal' },
  { id: 'admin-panel', title: 'Panel Admin Avancé', path: '/admin-panel', icon: <Settings className="h-4 w-4" />, category: 'admin', description: 'Interface d\'administration complète' },
  { id: 'audit', title: 'Audit Qualité Complet', path: '/audit', icon: <FileText className="h-4 w-4" />, category: 'admin', description: 'Audit et contrôle qualité' },
  { id: 'audit-completeness', title: 'Audit Complétude', path: '/audit-completeness', icon: <Award className="h-4 w-4" />, category: 'admin', description: 'Vérification complétude données' },
  { id: 'content-quality', title: 'Qualité Contenu', path: '/content-quality', icon: <Award className="h-4 w-4" />, category: 'admin', description: 'Dashboard qualité contenu' },
  
  // Import, Export & Data Management
  { id: 'admin-import', title: 'Import Données', path: '/admin/import', icon: <FileText className="h-4 w-4" />, category: 'admin', description: 'Import de données massif' },
  { id: 'admin-audit', title: 'Audit Admin', path: '/admin/audit', icon: <FileText className="h-4 w-4" />, category: 'admin', description: 'Audit administratif' },
  { id: 'admin-extract-edn', title: 'Extract EDN', path: '/admin/extract-edn', icon: <FileText className="h-4 w-4" />, category: 'admin', description: 'Extraction données EDN' },
  { id: 'admin-extract-ecos', title: 'Extract ECOS', path: '/admin/extract-ecos', icon: <FileText className="h-4 w-4" />, category: 'admin', description: 'Extraction données ECOS' },
  { id: 'admin-extract-objectifs', title: 'Extract Objectifs', path: '/admin/extract-objectifs', icon: <FileText className="h-4 w-4" />, category: 'admin', description: 'Extraction objectifs pédagogiques' },
  { id: 'admin-oic-quality', title: 'Qualité OIC', path: '/admin/oic-quality', icon: <FileText className="h-4 w-4" />, category: 'admin', description: 'Management qualité OIC' },
  { id: 'admin-complete', title: 'Process Complet', path: '/admin/complete', icon: <FileText className="h-4 w-4" />, category: 'admin', description: 'Processus administratif complet' },
  { id: 'export', title: 'Export Données', path: '/export', icon: <FileText className="h-4 w-4" />, category: 'admin', description: 'Export et sauvegarde' },
  
  // Authentification & Abonnements
  { id: 'login', title: 'Connexion', path: '/med-mng/login', icon: <Users className="h-4 w-4" />, category: 'community', description: 'Se connecter à votre compte' },
  { id: 'signup', title: 'Inscription', path: '/med-mng/signup', icon: <Users className="h-4 w-4" />, category: 'community', description: 'Créer un nouveau compte' },
  { id: 'pricing', title: 'Plans & Tarifs', path: '/med-mng/pricing', icon: <Star className="h-4 w-4" />, category: 'community', description: 'Plans d\'abonnement et tarification' },
  { id: 'subscribe', title: 'S\'abonner', path: '/med-mng/subscribe', icon: <Star className="h-4 w-4" />, category: 'community', description: 'Processus d\'abonnement', requiresAuth: true },
  { id: 'success', title: 'Confirmation', path: '/med-mng/success', icon: <Award className="h-4 w-4" />, category: 'community', description: 'Confirmation abonnement', requiresAuth: true },
  
  // Support & Documentation
  { id: 'support', title: 'Support & Aide', path: '/support', icon: <MessageSquare className="h-4 w-4" />, category: 'community', description: 'Centre d\'aide et documentation' },
  { id: 'mentions-legales', title: 'Mentions Légales', path: '/mentions-legales', icon: <FileText className="h-4 w-4" />, category: 'community', description: 'Informations légales' },
  { id: 'politique-confidentialite', title: 'Confidentialité', path: '/politique-confidentialite', icon: <FileText className="h-4 w-4" />, category: 'community', description: 'Politique de confidentialité' },
  { id: 'conditions', title: 'Conditions d\'Usage', path: '/conditions', icon: <FileText className="h-4 w-4" />, category: 'community', description: 'Conditions générales d\'utilisation' },
  
  // Routes Spécialisées (Development)
  { id: 'mng-method', title: 'Méthode MNG', path: '/mng-method', icon: <Brain className="h-4 w-4" />, category: 'medical', description: 'Méthodologie MNG' }
];

export const MasterNavigationSystem: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Charger les favoris et historique depuis localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('nav-favorites');
    const storedRecent = localStorage.getItem('nav-recent');
    
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    if (storedRecent) setRecentlyUsed(JSON.parse(storedRecent));
  }, []);

  // Filtrer les éléments
  const filteredItems = navigationItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (itemId: string) => {
    const newFavorites = favorites.includes(itemId) 
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    
    setFavorites(newFavorites);
    localStorage.setItem('nav-favorites', JSON.stringify(newFavorites));
  };

  const addToRecent = (itemId: string) => {
    const newRecent = [itemId, ...recentlyUsed.filter(id => id !== itemId)].slice(0, 5);
    setRecentlyUsed(newRecent);
    localStorage.setItem('nav-recent', JSON.stringify(newRecent));
  };

  const handleNavigation = (item: NavigationItem) => {
    addToRecent(item.id);
    navigate(item.path);
    setIsOpen(false);
  };

  const favoriteItems = navigationItems.filter(item => favorites.includes(item.id));
  const recentItems = navigationItems.filter(item => recentlyUsed.includes(item.id));
  const popularItems = navigationItems.filter(item => item.isPopular);
  const newItems = navigationItems.filter(item => item.isNew);

  return (
    <div className="relative">
      {/* Bouton d'ouverture */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm shadow-lg border-purple-200 hover:bg-purple-50"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="ml-2 hidden sm:inline">Navigation</span>
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel de navigation */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Navigation Complète</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher une page ou fonctionnalité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
                />
              </div>
            </div>

            {/* Contenu */}
            <ScrollArea className="flex-1 p-6">
              {/* Filtres par catégorie */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Tout
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      {category.icon}
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sections rapides */}
              {searchTerm === '' && (
                <div className="space-y-6 mb-6">
                  {/* Favoris */}
                  {favoriteItems.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Favoris
                      </h3>
                      <div className="grid gap-2">
                        {favoriteItems.slice(0, 3).map(item => (
                          <NavigationCard
                            key={item.id}
                            item={item}
                            isFavorite={true}
                            onToggleFavorite={toggleFavorite}
                            onNavigate={handleNavigation}
                            currentPath={location.pathname}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Récemment utilisé */}
                  {recentItems.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Récemment utilisé
                      </h3>
                      <div className="grid gap-2">
                        {recentItems.slice(0, 3).map(item => (
                          <NavigationCard
                            key={item.id}
                            item={item}
                            isFavorite={favorites.includes(item.id)}
                            onToggleFavorite={toggleFavorite}
                            onNavigate={handleNavigation}
                            currentPath={location.pathname}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Populaire */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Populaire
                    </h3>
                    <div className="grid gap-2">
                      {popularItems.slice(0, 3).map(item => (
                        <NavigationCard
                          key={item.id}
                          item={item}
                          isFavorite={favorites.includes(item.id)}
                          onToggleFavorite={toggleFavorite}
                          onNavigate={handleNavigation}
                          currentPath={location.pathname}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Nouveau */}
                  {newItems.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Nouveau
                      </h3>
                      <div className="grid gap-2">
                        {newItems.map(item => (
                          <NavigationCard
                            key={item.id}
                            item={item}
                            isFavorite={favorites.includes(item.id)}
                            onToggleFavorite={toggleFavorite}
                            onNavigate={handleNavigation}
                            currentPath={location.pathname}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />
                </div>
              )}

              {/* Tous les éléments filtrés */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {searchTerm ? `Résultats (${filteredItems.length})` : 'Toutes les pages'}
                </h3>
                <div className="grid gap-2">
                  {filteredItems.map(item => (
                    <NavigationCard
                      key={item.id}
                      item={item}
                      isFavorite={favorites.includes(item.id)}
                      onToggleFavorite={toggleFavorite}
                      onNavigate={handleNavigation}
                      currentPath={location.pathname}
                    />
                  ))}
                </div>
              </div>

              {filteredItems.length === 0 && searchTerm && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucun résultat pour "{searchTerm}"</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};

interface NavigationCardProps {
  item: NavigationItem;
  isFavorite: boolean;
  onToggleFavorite: (itemId: string) => void;
  onNavigate: (item: NavigationItem) => void;
  currentPath: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({
  item,
  isFavorite,
  onToggleFavorite,
  onNavigate,
  currentPath
}) => {
  const isActive = currentPath === item.path;
  const category = categories.find(c => c.id === item.category);

  return (
    <div className={`group p-3 rounded-lg border transition-all cursor-pointer ${
      isActive 
        ? 'bg-purple-50 border-purple-200 shadow-sm' 
        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0" onClick={() => onNavigate(item)}>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-1.5 rounded-md ${category?.color} text-white`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {category?.name}
                </Badge>
                {item.isNew && <Badge className="text-xs bg-green-100 text-green-700">Nouveau</Badge>}
                {item.isPopular && <Badge className="text-xs bg-orange-100 text-orange-700">Populaire</Badge>}
                {item.requiresAuth && <Badge variant="outline" className="text-xs">Connexion requise</Badge>}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{item.description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </Button>
      </div>
    </div>
  );
};