import { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ui/theme-provider';
import { VisitStatsChart } from '@/components/sitemap/VisitStatsChart';
import { AIRecommendations } from '@/components/sitemap/AIRecommendations';
import { TagManager, TagData } from '@/components/sitemap/TagManager';
import { AnalyticsDashboard } from '@/components/sitemap/AnalyticsDashboard';
import { ExportImportManager } from '@/components/sitemap/ExportImportManager';
import { CloudSyncManager } from '@/components/sitemap/CloudSyncManager';
import { MetricsAlerts } from '@/components/sitemap/MetricsAlerts';
import { TimeComparison } from '@/components/sitemap/TimeComparison';
import { PageNotesManager } from '@/components/sitemap/PageNotesManager';
import { useCloudSync } from '@/hooks/useCloudSync';
import { usePageNotes } from '@/hooks/usePageNotes';
import {
  Home,
  LayoutDashboard,
  BookOpen,
  Stethoscope,
  ShieldCheck,
  Music,
  Library,
  ShoppingCart,
  Settings,
  MessageCircle,
  Shield,
  History,
  Search,
  LucideIcon,
  ArrowUp,
  ArrowUpDown,
  SortAsc,
  Hash,
  Download,
  FileText,
  Grid3x3,
  List,
  X,
  Moon,
  Sun,
  Star,
  Tag,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SitemapRoute {
  label: string;
  path: string;
  description: string;
  examplePath?: string;
}

interface SitemapSection {
  title: string;
  description: string;
  icon: LucideIcon;
  routes: SitemapRoute[];
}

const sitemapSections: SitemapSection[] = [
  {
    title: 'Navigation & Accueil',
    description: 'Portails d\'entrée de la plateforme et plan du site.',
    icon: Home,
    routes: [
      {
        label: 'Accueil principal',
        path: ROUTE_PATHS.home,
        description: 'Point d\'entrée par défaut vers l\'expérience Med-MNG.',
      },
      {
        label: 'Accueil optimisé',
        path: ROUTE_PATHS.optimizedIndex,
        description: 'Version allégée et rapide de la page d\'accueil pour les tests de performance.',
      },
      {
        label: 'Accueil marketing',
        path: ROUTE_PATHS.homepage,
        description: 'Landing page moderne présentant la proposition de valeur Med-MNG.',
      },
      {
        label: 'Plan du site',
        path: ROUTE_PATHS.sitemap,
        description: 'Vue d\'ensemble des 75 routes avec catégorisation et liens directs.',
      },
    ],
  },
  {
    title: 'Dashboards & Pilotage',
    description: 'Tableaux de bord stratégiques pour suivre la performance et la conformité.',
    icon: LayoutDashboard,
    routes: [
      {
        label: 'Dashboard modulable',
        path: ROUTE_PATHS.modularDashboard,
        description: 'Tableau de bord personnalisable pour composer ses propres widgets.',
      },
      {
        label: 'Dashboard global',
        path: ROUTE_PATHS.dashboard,
        description: 'Vue d\'ensemble consolidée des indicateurs clés de la plateforme.',
      },
      {
        label: 'Dashboard apprentissage',
        path: ROUTE_PATHS.learningDashboard,
        description: 'Pilotage des parcours de formation et de la progression pédagogique.',
      },
      {
        label: 'Statut plateforme',
        path: ROUTE_PATHS.platformStatus,
        description: 'Suivi de l\'état opérationnel des services critiques et SLA.',
      },
      {
        label: 'Monitoring temps réel',
        path: ROUTE_PATHS.monitoring,
        description: 'Surveillance live des métriques techniques et des alertes.',
      },
      {
        label: 'Gestion du système',
        path: ROUTE_PATHS.systemManagement,
        description: 'Administration technique des services et automatisations clés.',
      },
      {
        label: 'Paramètres plateforme',
        path: ROUTE_PATHS.platformSettings,
        description: 'Configuration globale des modules, intégrations et accès.',
      },
      {
        label: 'Migration Dashboard',
        path: ROUTE_PATHS.migrationDashboard,
        description: 'Suivi des migrations de données et couverture fonctionnelle.',
      },
      {
        label: 'Accessibilité',
        path: ROUTE_PATHS.accessibilityDashboard,
        description: 'Contrôle de conformité accessibilité et recommandations WCAG.',
      },
      {
        label: 'Efficacité opérationnelle',
        path: ROUTE_PATHS.effectivenessDashboard,
        description: 'Analyse de l\'impact des actions et productivité des équipes.',
      },
      {
        label: 'Audit unifié',
        path: ROUTE_PATHS.audit,
        description: 'Vue centralisée des audits EDN/ECOS avec scoring global.',
      },
      {
        label: 'Complétude de l\'audit',
        path: ROUTE_PATHS.auditCompleteness,
        description: 'Suivi des champs manquants et du niveau de complétude des audits.',
      },
      {
        label: 'Dashboard audit EDN',
        path: ROUTE_PATHS.ednAudit,
        description: 'Analyse détaillée des audits EDN et priorisation des corrections.',
      },
    ],
  },
  {
    title: 'Espace EDN',
    description: 'Outils dédiés à la diffusion et à la musique thérapeutique EDN.',
    icon: BookOpen,
    routes: [
      {
        label: 'EDN complet',
        path: ROUTE_PATHS.ednComplete,
        description: 'Expérience EDN unifiée combinant préparation, diffusion et suivi.',
      },
      {
        label: 'Détail EDN',
        path: ROUTE_PATHS.ednCompleteDetail,
        examplePath: ROUTE_PATHS.ednCompleteDetail.replace(':slug', 'module-introduction'),
        description: 'Accès direct à un module EDN spécifique (exemple : module-introduction).',
      },
      {
        label: 'Immersion EDN',
        path: ROUTE_PATHS.ednImmersive,
        examplePath: ROUTE_PATHS.ednImmersive.replace(':slug', 'module-introduction'),
        description: 'Lecture immersive d\'un module EDN en plein écran.',
      },
      {
        label: 'Bibliothèque musicale EDN',
        path: ROUTE_PATHS.ednMusicLibrary,
        description: 'Catalogue sonore spécialisé pour les protocoles EDN.',
      },
      {
        label: 'Ancienne page EDN',
        path: ROUTE_PATHS.ednLegacy,
        description: 'Ancienne route redirigée vers l\'interface EDN unifiée.',
      },
      {
        label: 'Ancien module EDN',
        path: ROUTE_PATHS.ednLegacyWithSlug,
        examplePath: ROUTE_PATHS.ednLegacyWithSlug.replace(':slug', 'module'),
        description: 'Ancienne route paramétrée redirigée vers la nouvelle expérience.',
      },
      {
        label: 'Items EDN legacy',
        path: ROUTE_PATHS.ednItemsLegacy,
        description: 'Ancien inventaire EDN maintenu pour compatibilité.',
      },
    ],
  },
  {
    title: 'Espace ECOS',
    description: 'Simulations cliniques et scénarios interactifs ECOS.',
    icon: Stethoscope,
    routes: [
      {
        label: 'Portail ECOS',
        path: ROUTE_PATHS.ecosIndex,
        description: 'Accueil des scénarios ECOS et sélection des sessions.',
      },
      {
        label: 'Scénario ECOS',
        path: ROUTE_PATHS.ecosScenario,
        examplePath: ROUTE_PATHS.ecosScenario.replace(':scenarioId', 'scenario-1'),
        description: 'Accès direct à un scénario ECOS donné (exemple : scenario-1).',
      },
    ],
  },
  {
    title: 'Administration & OIC',
    description: 'Outils réservés aux administrateurs et à la gouvernance des données.',
    icon: ShieldCheck,
    routes: [
      {
        label: 'Imports administrateur',
        path: ROUTE_PATHS.adminImport,
        description: 'Interface d\'ingestion de données massives pour les contenus.',
      },
      {
        label: 'Audit administrateur',
        path: ROUTE_PATHS.adminAudit,
        description: 'Vue consolidée des audits et alertes réservées aux administrateurs.',
      },
      {
        label: 'Extraction EDN',
        path: ROUTE_PATHS.adminExtractEdn,
        description: 'Outil d\'export des données EDN pour analyses externes.',
      },
      {
        label: 'Extraction ECOS',
        path: ROUTE_PATHS.adminExtractEcos,
        description: 'Génération d\'exports dédiés aux scénarios ECOS.',
      },
      {
        label: 'Extraction objectifs',
        path: ROUTE_PATHS.adminExtractObjectifs,
        description: 'Extraction des objectifs pédagogiques et cliniques.',
      },
      {
        label: 'Qualité des données OIC',
        path: ROUTE_PATHS.adminOicQuality,
        description: 'Suivi des contrôles qualité sur les données OIC.',
      },
      {
        label: 'Processus complet',
        path: ROUTE_PATHS.adminComplete,
        description: 'Orchestration complète des workflows d\'extraction et de contrôle.',
      },
      {
        label: 'Panel administrateur',
        path: ROUTE_PATHS.adminPanel,
        description: 'Accès centralisé aux outils d\'administration avancés.',
      },
    ],
  },
  {
    title: 'Espace Med-MNG',
    description: 'Parcours d\'inscription, de gestion de playlists et d\'analyses musicales.',
    icon: Music,
    routes: [
      {
        label: 'Connexion Med-MNG',
        path: ROUTE_PATHS.medMngLogin,
        description: 'Authentification sécurisée pour les professionnels.',
      },
      {
        label: 'Inscription Med-MNG',
        path: ROUTE_PATHS.medMngSignup,
        description: 'Création de compte et onboarding des nouveaux utilisateurs.',
      },
      {
        label: 'Tarifs Med-MNG',
        path: ROUTE_PATHS.medMngPricing,
        description: 'Présentation des plans d\'abonnement et comparatif des offres.',
      },
      {
        label: 'Souscription plan',
        path: ROUTE_PATHS.medMngSubscribe,
        examplePath: ROUTE_PATHS.medMngSubscribe.replace(':planId', 'premium'),
        description: 'Choix d\'un plan d\'abonnement spécifique (exemple : premium).',
      },
      {
        label: 'Confirmation souscription',
        path: ROUTE_PATHS.medMngSuccess,
        description: 'Récapitulatif après activation de l\'abonnement.',
      },
      {
        label: 'Création de contenus',
        path: ROUTE_PATHS.medMngCreate,
        description: 'Atelier de création pour concevoir des protocoles personnalisés.',
      },
      {
        label: 'Bibliothèque Med-MNG',
        path: ROUTE_PATHS.medMngLibrary,
        description: 'Accès sécurisé à la médiathèque Med-MNG.',
      },
      {
        label: 'Profil Med-MNG',
        path: ROUTE_PATHS.medMngProfile,
        description: 'Gestion du profil professionnel et des préférences.',
      },
      {
        label: 'Lecteur Med-MNG',
        path: ROUTE_PATHS.medMngPlayer,
        examplePath: ROUTE_PATHS.medMngPlayer.replace(':songId', 'relaxation-1'),
        description: 'Lecture d\'un titre thérapeutique ciblé (exemple : relaxation-1).',
      },
      {
        label: 'Gestion des playlists',
        path: ROUTE_PATHS.medMngPlaylists,
        description: 'Organisation, tri et partage des playlists thérapeutiques.',
      },
      {
        label: 'Détail playlist',
        path: ROUTE_PATHS.medMngPlaylistDetail,
        examplePath: ROUTE_PATHS.medMngPlaylistDetail.replace(':playlistId', 'playlist-123'),
        description: 'Vue détaillée d\'une playlist sélectionnée (exemple : playlist-123).',
      },
      {
        label: 'Analytics musicaux',
        path: ROUTE_PATHS.medMngAnalytics,
        description: 'Mesure de l\'impact des playlists et statistiques d\'écoute.',
      },
    ],
  },
  {
    title: 'Contenus & Ressources',
    description: 'Modules de formation, bibliothèques et ressources pédagogiques.',
    icon: Library,
    routes: [
      {
        label: 'Générateur de contenus',
        path: ROUTE_PATHS.generator,
        description: 'Assistant de création de contenus guidée par l\'IA.',
      },
      {
        label: 'Bibliothèque générale',
        path: ROUTE_PATHS.library,
        description: 'Catalogue transversal des ressources éducatives.',
      },
      {
        label: 'Méthode Med-MNG',
        path: ROUTE_PATHS.mngMethod,
        description: 'Présentation détaillée de la méthodologie Med-MNG.',
      },
      {
        label: 'Communauté',
        path: ROUTE_PATHS.community,
        description: 'Espace collaboratif entre pairs pour partager expériences et cas.',
      },
      {
        label: 'Réalisations',
        path: ROUTE_PATHS.achievements,
        description: 'Badges, certifications et paliers atteints par les utilisateurs.',
      },
      {
        label: 'Favoris',
        path: ROUTE_PATHS.favorites,
        description: 'Raccourci vers les ressources marquées pour un accès rapide.',
      },
      {
        label: 'Planificateur d\'études',
        path: ROUTE_PATHS.studyPlanner,
        description: 'Planification des révisions et suivi des sessions de travail.',
      },
      {
        label: 'Statistiques avancées',
        path: ROUTE_PATHS.statistics,
        description: 'Analyses pédagogiques et rapports détaillés.',
      },
    ],
  },
  {
    title: 'Commerce & Monétisation',
    description: 'Pages orientées vente de contenus et produits additionnels.',
    icon: ShoppingCart,
    routes: [
      {
        label: 'Boutique',
        path: ROUTE_PATHS.store,
        description: 'Catalogue des offres, packs et contenus premium.',
      },
      {
        label: 'Détail produit',
        path: ROUTE_PATHS.productDetail,
        examplePath: ROUTE_PATHS.productDetail.replace(':handle', 'son-relaxant'),
        description: 'Fiche détaillée d\'un produit (exemple : son-relaxant).',
      },
    ],
  },
  {
    title: 'Paramètres & Expérience',
    description: 'Configuration personnelle et outils pour améliorer l\'expérience.',
    icon: Settings,
    routes: [
      {
        label: 'Paramètres utilisateur',
        path: ROUTE_PATHS.settings,
        description: 'Gestion des préférences personnelles et de la sécurité.',
      },
      {
        label: 'Design System',
        path: ROUTE_PATHS.designSystem,
        description: 'Documentation interne du design system et composants UI.',
      },
      {
        label: 'Installation PWA',
        path: ROUTE_PATHS.installPwa,
        description: 'Guide pour installer l\'application en mode PWA.',
      },
      {
        label: 'Analytics PWA',
        path: ROUTE_PATHS.pwaAnalytics,
        description: 'Suivi des métriques propres à l\'expérience progressive.',
      },
    ],
  },
  {
    title: 'Communication & Assistance',
    description: 'Interactions en direct et support utilisateur.',
    icon: MessageCircle,
    routes: [
      {
        label: 'Med Chat',
        path: ROUTE_PATHS.chat,
        description: 'Assistant conversationnel pour guider les utilisateurs.',
      },
    ],
  },
  {
    title: 'Conformité & Sécurité',
    description: 'Pages légales, RGPD et documentation de sécurité.',
    icon: Shield,
    routes: [
      {
        label: 'Mentions légales',
        path: ROUTE_PATHS.mentionsLegales,
        description: 'Informations juridiques obligatoires et responsabilité.',
      },
      {
        label: 'Politique de confidentialité',
        path: ROUTE_PATHS.politiqueConfidentialite,
        description: 'Transparence sur le traitement des données personnelles.',
      },
      {
        label: 'Conditions générales d\'utilisation',
        path: ROUTE_PATHS.cgu,
        description: 'Cadre contractuel d\'utilisation de la plateforme.',
      },
      {
        label: 'Déclaration d\'accessibilité',
        path: ROUTE_PATHS.declarationAccessibilite,
        description: 'Engagements et conformité en matière d\'accessibilité.',
      },
      {
        label: 'Mes données RGPD',
        path: ROUTE_PATHS.mesDonneesRgpd,
        description: 'Espace pour consulter et exporter ses données personnelles.',
      },
      {
        label: 'Documentation RLS',
        path: ROUTE_PATHS.rlsDocumentation,
        description: 'Référentiel documentaire pour le dispositif RLS.',
      },
      {
        label: 'Surveillance sécurité',
        path: ROUTE_PATHS.securityMonitoring,
        description: 'Vue consolidée des alertes de sécurité et incidents.',
      },
    ],
  },
  {
    title: 'Audit & Redirections historiques',
    description: 'Routes d\'audit héritées conservées pour compatibilité.',
    icon: History,
    routes: [
      {
        label: 'Audit général (legacy)',
        path: ROUTE_PATHS.auditGeneral,
        description: 'Ancien point d\'entrée global redirigé vers l\'audit unifié.',
      },
      {
        label: 'Audit EDN (legacy)',
        path: ROUTE_PATHS.auditEdn,
        description: 'Ancienne vue EDN réorientée vers la nouvelle interface.',
      },
      {
        label: 'Audit unifié (legacy)',
        path: ROUTE_PATHS.auditUnified,
        description: 'Ancien alias préservé pour rétro-compatibilité.',
      },
      {
        label: 'Audit IC1 (legacy)',
        path: ROUTE_PATHS.auditIc1,
        description: 'Route historique pour le volet indicateur IC1.',
      },
      {
        label: 'Audit IC2 (legacy)',
        path: ROUTE_PATHS.auditIc2,
        description: 'Route historique pour le volet indicateur IC2.',
      },
      {
        label: 'Audit IC4 (legacy)',
        path: ROUTE_PATHS.auditIc4,
        description: 'Route historique pour le volet indicateur IC4.',
      },
      {
        label: 'Audit complet (legacy)',
        path: ROUTE_PATHS.auditCompleteLegacy,
        description: 'Ancienne page complète conservée pour redirection.',
      },
    ],
  },
];

type SortOption = 'default' | 'alphabetical' | 'routeCount';
type ViewMode = 'grid' | 'list';

export default function Sitemap() {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [visitStats, setVisitStats] = useState<Record<string, { 
    count: number; 
    timestamps: number[]; 
    sessions: { path: string; startTime: number; endTime?: number; duration?: number }[] 
  }>>({});
  const [navigationPaths, setNavigationPaths] = useState<{ from: string; to: string; count: number }[]>([]);
  const [currentSession, setCurrentSession] = useState<{ path: string; startTime: number } | null>(null);
  const [lastVisitedPath, setLastVisitedPath] = useState<string | null>(null);
  const [showFavoritesSection, setShowFavoritesSection] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [animateFavorite, setAnimateFavorite] = useState(false);
  const [tags, setTags] = useState<TagData[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [alertThresholds, setAlertThresholds] = useState({ bounceRate: 70, avgTimeSeconds: 300 });
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { autoSyncEnabled, syncToCloud } = useCloudSync();
  const { getNoteCountForPage } = usePageNotes();

  // Charger les favoris, tags et statistiques depuis localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('sitemap-favorites');
    if (savedFavorites) {
      try {
        const favs = new Set<string>(JSON.parse(savedFavorites));
        setFavorites(favs);
        setFavoriteCount(favs.size);
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }

    const savedTags = localStorage.getItem('sitemap-tags');
    if (savedTags) {
      try {
        setTags(JSON.parse(savedTags));
      } catch (e) {
        console.error('Error loading tags:', e);
      }
    }

    const savedStats = localStorage.getItem('sitemap-visit-stats');
    if (savedStats) {
      try {
        setVisitStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Error loading visit stats:', e);
      }
    }

    const savedPaths = localStorage.getItem('sitemap-navigation-paths');
    if (savedPaths) {
      try {
        setNavigationPaths(JSON.parse(savedPaths));
      } catch (e) {
        console.error('Error loading navigation paths:', e);
      }
    }

    const savedThresholds = localStorage.getItem('sitemap-alert-thresholds');
    if (savedThresholds) {
      try {
        setAlertThresholds(JSON.parse(savedThresholds));
      } catch (e) {
        console.error('Error loading alert thresholds:', e);
      }
    }
  }, []);

  // Tracker la session de page en cours
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSession) {
        const endTime = Date.now();
        const duration = endTime - currentSession.startTime;
        
        const newStats = { ...visitStats };
        if (newStats[currentSession.path]) {
          newStats[currentSession.path].sessions.push({
            path: currentSession.path,
            startTime: currentSession.startTime,
            endTime,
            duration,
          });
          localStorage.setItem('sitemap-visit-stats', JSON.stringify(newStats));
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentSession, visitStats]);

  // Sauvegarder les statistiques de visite avec timestamps et sessions
  const trackVisit = (path: string) => {
    const now = Date.now();
    
    // Terminer la session précédente
    if (currentSession && currentSession.path !== path) {
      const duration = now - currentSession.startTime;
      const newStats = { ...visitStats };
      
      if (newStats[currentSession.path]) {
        newStats[currentSession.path].sessions.push({
          path: currentSession.path,
          startTime: currentSession.startTime,
          endTime: now,
          duration,
        });
      }
      
      setVisitStats(newStats);
      localStorage.setItem('sitemap-visit-stats', JSON.stringify(newStats));
    }

    // Enregistrer le chemin de navigation
    if (lastVisitedPath && lastVisitedPath !== path) {
      const newPaths = [...navigationPaths];
      const existingPath = newPaths.find(p => p.from === lastVisitedPath && p.to === path);
      
      if (existingPath) {
        existingPath.count += 1;
      } else {
        newPaths.push({ from: lastVisitedPath, to: path, count: 1 });
      }
      
      setNavigationPaths(newPaths);
      localStorage.setItem('sitemap-navigation-paths', JSON.stringify(newPaths));
    }

    setLastVisitedPath(path);
    
    // Démarrer une nouvelle session
    setCurrentSession({ path, startTime: now });
    
    const newStats = { ...visitStats };
    
    if (!newStats[path]) {
      newStats[path] = { count: 0, timestamps: [], sessions: [] };
    }
    
    newStats[path].count += 1;
    newStats[path].timestamps.push(now);
    
    // Garder seulement les 100 derniers timestamps par route
    if (newStats[path].timestamps.length > 100) {
      newStats[path].timestamps = newStats[path].timestamps.slice(-100);
    }
    
    // Garder seulement les 50 dernières sessions par route
    if (newStats[path].sessions.length > 50) {
      newStats[path].sessions = newStats[path].sessions.slice(-50);
    }
    
    setVisitStats(newStats);
    localStorage.setItem('sitemap-visit-stats', JSON.stringify(newStats));
  };

  // Sauvegarder les favoris dans localStorage
  const saveFavorites = (newFavorites: Set<string>) => {
    setFavorites(newFavorites);
    localStorage.setItem('sitemap-favorites', JSON.stringify(Array.from(newFavorites)));
    
    // Animation du compteur
    setFavoriteCount(newFavorites.size);
    setAnimateFavorite(true);
    setTimeout(() => setAnimateFavorite(false), 300);
  };

  const toggleFavorite = (path: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(path)) {
      newFavorites.delete(path);
    } else {
      newFavorites.add(path);
    }
    saveFavorites(newFavorites);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Obtenir les routes favorites
  const handleTagsChange = (newTags: TagData[]) => {
    setTags(newTags);
    localStorage.setItem('sitemap-tags', JSON.stringify(newTags));
  };

  const handleRouteTagged = (routePath: string, tagId: string) => {
    const newTags = tags.map(tag => {
      if (tag.id === tagId && !tag.routes.includes(routePath)) {
        return { ...tag, routes: [...tag.routes, routePath] };
      }
      return tag;
    });
    handleTagsChange(newTags);
  };

  const handleRouteUntagged = (routePath: string, tagId: string) => {
    const newTags = tags.map(tag => {
      if (tag.id === tagId) {
        return { ...tag, routes: tag.routes.filter(r => r !== routePath) };
      }
      return tag;
    });
    handleTagsChange(newTags);
  };

  const getRouteTags = (routePath: string) => {
    return tags.filter(tag => tag.routes.includes(routePath));
  };

  const toggleRouteTag = (routePath: string, tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return;

    if (tag.routes.includes(routePath)) {
      handleRouteUntagged(routePath, tagId);
    } else {
      handleRouteTagged(routePath, tagId);
    }
  };

  // Fonction pour gérer l'import de données
  const handleImport = (data: { 
    favorites: Set<string>; 
    tags: TagData[]; 
    visitStats?: Record<string, { count: number; timestamps: number[]; sessions: any[] }>;
    navigationPaths?: { from: string; to: string; count: number }[];
    alertThresholds?: { bounceRate: number; avgTimeSeconds: number };
  }) => {
    saveFavorites(data.favorites);
    handleTagsChange(data.tags);
    
    if (data.visitStats) {
      // Fusionner les statistiques
      const mergedStats = { ...visitStats };
      Object.entries(data.visitStats).forEach(([path, stats]) => {
        if (mergedStats[path]) {
          mergedStats[path].count += stats.count;
          mergedStats[path].timestamps = [...mergedStats[path].timestamps, ...stats.timestamps].sort();
          mergedStats[path].sessions = [...mergedStats[path].sessions, ...stats.sessions];
        } else {
          mergedStats[path] = stats;
        }
      });
      setVisitStats(mergedStats);
      localStorage.setItem('sitemap-visit-stats', JSON.stringify(mergedStats));
    }

    if (data.navigationPaths) {
      setNavigationPaths(data.navigationPaths);
      localStorage.setItem('sitemap-navigation-paths', JSON.stringify(data.navigationPaths));
    }

    if (data.alertThresholds) {
      setAlertThresholds(data.alertThresholds);
      localStorage.setItem('sitemap-alert-thresholds', JSON.stringify(data.alertThresholds));
    }
  };

  // Auto-sync quand les données changent
  useEffect(() => {
    if (!autoSyncEnabled) return;

    const timer = setTimeout(() => {
      syncToCloud({
        favorites,
        tags,
        visitStats,
        navigationPaths,
        alertThresholds,
      });
    }, 5000); // Débounce de 5 secondes

    return () => clearTimeout(timer);
  }, [favorites, tags, visitStats, navigationPaths, alertThresholds, autoSyncEnabled, syncToCloud]);

  // Créer un mapping des routes pour le dashboard analytique
  const routeLabels = useMemo(() => {
    const labels: Record<string, { label: string; category: string }> = {};
    sitemapSections.forEach(section => {
      section.routes.forEach(route => {
        labels[route.path] = {
          label: route.label,
          category: section.title,
        };
      });
    });
    return labels;
  }, []);

  const getFavoriteRoutes = (tagFilter?: string | null) => {
    const favoriteRoutes: Array<SitemapRoute & { category: string; icon: LucideIcon }> = [];
    sitemapSections.forEach(section => {
      section.routes.forEach(route => {
        if (favorites.has(route.path)) {
          favoriteRoutes.push({
            ...route,
            category: section.title,
            icon: section.icon,
          });
        }
      });
    });
    
    if (!tagFilter) return favoriteRoutes;

    return favoriteRoutes.filter(route => {
      const routeTags = getRouteTags(route.path);
      return routeTags.some(tag => tag.id === tagFilter);
    });
  };

  // Obtenir les routes les plus visitées
  const getMostVisitedRoutes = (limit = 5) => {
    return Object.entries(visitStats)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, limit)
      .map(([path, data]) => {
        let routeInfo: (SitemapRoute & { category: string }) | null = null;
        sitemapSections.forEach(section => {
          const route = section.routes.find(r => r.path === path);
          if (route) {
            routeInfo = { ...route, category: section.title };
          }
        });
        return { path, count: data.count, routeInfo };
      })
      .filter(item => item.routeInfo !== null);
  };

  // Liste de toutes les catégories
  const allCategories = sitemapSections.map(section => section.title);

  const toggleCategory = (category: string) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Plan du Site - Med-MNG', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
    
    const tableData = filteredSections.flatMap(section =>
      section.routes.map(route => [
        section.title,
        route.label,
        route.path,
        route.description
      ])
    );

    autoTable(doc, {
      head: [['Catégorie', 'Page', 'Chemin', 'Description']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 40 },
        2: { cellWidth: 45 },
        3: { cellWidth: 70 }
      }
    });

    doc.save(`sitemap-med-mng-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ['Catégorie', 'Page', 'Chemin', 'Description'];
    const rows = filteredSections.flatMap(section =>
      section.routes.map(route => [
        section.title,
        route.label,
        route.path,
        route.description
      ])
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sitemap-med-mng-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setVisibleCards((prev) => new Set(prev).add(index));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [sortBy, searchQuery, selectedCategories, viewMode]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  let filteredSections = sitemapSections
    .filter(section => 
      selectedCategories.size === 0 || selectedCategories.has(section.title)
    )
    .map(section => ({
    ...section,
    routes: section.routes.filter(route => {
      const query = searchQuery.toLowerCase();
      return (
        route.label.toLowerCase().includes(query) ||
        route.description.toLowerCase().includes(query) ||
        route.path.toLowerCase().includes(query)
      );
    }),
  })).filter(section => section.routes.length > 0);

  // Appliquer le tri
  if (sortBy === 'alphabetical') {
    filteredSections = [...filteredSections].sort((a, b) => 
      a.title.localeCompare(b.title)
    );
  } else if (sortBy === 'routeCount') {
    filteredSections = [...filteredSections].sort((a, b) => 
      b.routes.length - a.routes.length
    );
  }

  const totalRoutes = sitemapSections.reduce((count, section) => count + section.routes.length, 0);
  const filteredRoutesCount = filteredSections.reduce((count, section) => count + section.routes.length, 0);

  return (
    <div className="min-h-screen bg-muted/10 py-16">
      <Helmet>
        <title>Plan du site | Med-MNG</title>
        <meta
          name="description"
          content="Parcourez l'ensemble des routes Med-MNG classées par catégories fonctionnelles."
        />
      </Helmet>

      <div className="container mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <header className="space-y-4 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Plan du site</h1>
          <p className="text-muted-foreground md:text-lg">
            Retrouvez l'ensemble des {totalRoutes} routes actives classées par domaines fonctionnels. Chaque lien
            pointe vers la page correspondante ou vers un exemple lorsqu'un paramètre est requis.
          </p>
        </header>

        {/* Gestion des tags */}
        {(tags.length > 0 || getFavoriteRoutes().length > 0) && (
          <TagManager
            tags={tags}
            onTagsChange={handleTagsChange}
            onRouteTagged={handleRouteTagged}
            onRouteUntagged={handleRouteUntagged}
          />
        )}

        {/* Export/Import Manager */}
        <ExportImportManager
          favorites={favorites}
          tags={tags}
          visitStats={visitStats}
          onImport={handleImport}
        />

        {/* Cloud Sync Manager */}
        <CloudSyncManager
          favorites={favorites}
          tags={tags}
          visitStats={visitStats}
          navigationPaths={navigationPaths}
          alertThresholds={alertThresholds}
          onDataLoaded={handleImport}
        />

        {/* Metrics Alerts */}
        {Object.keys(visitStats).length > 0 && (
          <MetricsAlerts
            visitStats={visitStats}
            routeLabels={routeLabels}
            alertThresholds={alertThresholds}
            onThresholdsChange={(newThresholds) => {
              setAlertThresholds(newThresholds);
              localStorage.setItem('sitemap-alert-thresholds', JSON.stringify(newThresholds));
            }}
          />
        )}

        {/* Dashboard Analytique */}
        {Object.keys(visitStats).length > 0 && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Analytics</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analyse détaillée de votre navigation
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="gap-2"
                >
                  {showAnalytics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showAnalytics ? 'Masquer' : 'Afficher'}
                </Button>
              </div>
            </CardHeader>
            {showAnalytics && (
              <CardContent>
                <AnalyticsDashboard
                  analyticsData={{
                    visitStats,
                    navigationPaths,
                  }}
                  routeLabels={routeLabels}
                />
              </CardContent>
            )}
          </Card>
        )}

        {/* Time Comparison */}
        {Object.keys(visitStats).length > 0 && (
          <TimeComparison
            visitStats={visitStats}
            routeLabels={routeLabels}
          />
        )}

        {/* Page Notes Manager */}
        <PageNotesManager />

        {/* Section Favoris */}
        {showFavoritesSection && getFavoriteRoutes().length > 0 && (
          <Card className="border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-400/20">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Mes Favoris</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getFavoriteRoutes(selectedTagFilter).length} {getFavoriteRoutes(selectedTagFilter).length === 1 ? 'page favorite' : 'pages favorites'}
                      {selectedTagFilter && ` (filtrés par tag)`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {tags.length > 0 && (
                    <Select value={selectedTagFilter || 'all'} onValueChange={(value) => setSelectedTagFilter(value === 'all' ? null : value)}>
                      <SelectTrigger className="w-[180px] h-8">
                        <SelectValue placeholder="Filtrer par tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les favoris</SelectItem>
                        {tags.map(tag => (
                          <SelectItem key={tag.id} value={tag.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                              {tag.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFavoritesSection(false)}
                    aria-label="Fermer la section favoris"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {getFavoriteRoutes(selectedTagFilter).map((route) => {
                  const Icon = route.icon;
                  const routeTags = getRouteTags(route.path);
                  const noteCount = getNoteCountForPage(route.path);
                  return (
                    <div key={route.path} className="relative group">
                      <Link
                        to={route.examplePath || route.path}
                        onClick={() => trackVisit(route.path)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-all hover:scale-105"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                              {route.label}
                            </p>
                            {noteCount > 0 && (
                              <Badge variant="secondary" className="h-5 text-xs">
                                {noteCount} 📝
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {route.category}
                          </p>
                          {routeTags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {routeTags.map(tag => (
                                <span
                                  key={tag.id}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                                  style={{
                                    backgroundColor: tag.color,
                                    color: '#fff',
                                  }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />
                      </Link>
                      {tags.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                              onClick={(e) => e.preventDefault()}
                            >
                              <Tag className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {tags.map(tag => {
                              const isTagged = tag.routes.includes(route.path);
                              return (
                                <DropdownMenuItem
                                  key={tag.id}
                                  onClick={() => toggleRouteTag(route.path, tag.id)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                                    <span className="flex-1">{tag.name}</span>
                                    {isTagged && <X className="h-3 w-3" />}
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Graphique d'évolution des visites */}
        {Object.keys(visitStats).length > 0 && (
          <VisitStatsChart visitStats={visitStats} />
        )}

        {/* Recommandations IA */}
        {Object.keys(visitStats).length > 0 && (
          <AIRecommendations visitStats={visitStats} currentPath={window.location.pathname} />
        )}

        {/* Statistiques d'utilisation */}
        {getMostVisitedRoutes().length > 0 && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <History className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Routes les plus visitées</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vos pages les plus consultées
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getMostVisitedRoutes(5).map(({ path, count, routeInfo }, index) => {
                  if (!routeInfo) return null;
                  return (
                    <Link
                      key={path}
                      to={routeInfo.examplePath || path}
                      onClick={() => trackVisit(path)}
                      className="group flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-all"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {routeInfo.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {routeInfo.category}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {count} {count === 1 ? 'visite' : 'visites'}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-6">
          {/* Filtres par catégorie */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Filtrer par catégorie :</span>
            {allCategories.map(category => (
              <Badge
                key={category}
                variant={selectedCategories.has(category) ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Badge>
            ))}
            {selectedCategories.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7"
              >
                <X className="h-3 w-3 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Barre de recherche et contrôles */}
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher une page par nom, description ou chemin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <div className="flex gap-2">
              {/* Compteur de Favoris */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFavoritesSection(!showFavoritesSection)}
                className={`h-12 w-12 relative transition-all duration-300 hover:scale-110 ${
                  animateFavorite ? 'scale-125' : ''
                }`}
                aria-label={`${favoriteCount} favoris`}
              >
                <Star className={`h-5 w-5 ${favoriteCount > 0 ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                {favoriteCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 ${
                    animateFavorite ? 'scale-150' : ''
                  }`}>
                    {favoriteCount}
                  </span>
                )}
              </Button>

              {/* Toggle Thème */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="h-12 w-12 transition-all duration-300 hover:scale-110"
                aria-label="Changer de thème"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
              </Button>

              {/* Toggle Vue */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Tri */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Par défaut</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="alphabetical">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      <span>Alphabétique</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="routeCount">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      <span>Nombre de routes</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exporter en PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exporter en CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {searchQuery && (
          <p className="text-sm text-muted-foreground text-center">
            {filteredRoutesCount} {filteredRoutesCount === 1 ? 'résultat trouvé' : 'résultats trouvés'}
          </p>
        )}

        {viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredSections.map((section, index) => {
              const Icon = section.icon;
              const isVisible = visibleCards.has(index);
              return (
                <div
                  key={section.title}
                  ref={(el) => (cardRefs.current[index] = el)}
                  data-index={index}
                  className={`transition-all duration-700 ${
                    isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${(index % 3) * 100}ms` }}
                >
                  <Card className="flex h-full flex-col hover-scale">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="w-fit">
                        {section.routes.length} {section.routes.length === 1 ? 'route' : 'routes'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">{section.description}</p>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-3">
                        {section.routes.map(route => (
                          <li key={route.path} className="relative group/item">
                            <Link
                              to={route.examplePath || route.path}
                              onClick={() => trackVisit(route.path)}
                              className="group block rounded-md border border-transparent p-2 pr-10 transition-colors hover:border-border hover:bg-muted/50"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                  {route.label}
                                </span>
                                {route.examplePath && (
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    Exemple
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                {route.description}
                              </p>
                              <code className="mt-1 block text-xs text-muted-foreground/70">
                                {route.path}
                              </code>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleFavorite(route.path);
                              }}
                              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover/item:opacity-100 transition-all duration-200"
                              aria-label={favorites.has(route.path) ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                              <Star 
                                className={`h-4 w-4 transition-all duration-300 ${
                                  favorites.has(route.path) 
                                    ? 'fill-yellow-400 text-yellow-400 scale-110' 
                                    : 'text-muted-foreground hover:text-yellow-400'
                                }`}
                              />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSections.map((section, sectionIndex) => {
              const Icon = section.icon;
              const isVisible = visibleCards.has(sectionIndex);
              return (
                <div
                  key={section.title}
                  ref={(el) => (cardRefs.current[sectionIndex] = el)}
                  data-index={sectionIndex}
                  className={`transition-all duration-700 ${
                    isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-10'
                  }`}
                >
                  <Card className="hover-scale">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {section.routes.length} {section.routes.length === 1 ? 'route' : 'routes'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {section.routes.map(route => (
                          <div key={route.path} className="relative group/list-item">
                            <Link
                              to={route.examplePath || route.path}
                              onClick={() => trackVisit(route.path)}
                              className="group flex items-center justify-between p-3 pr-12 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                    {route.label}
                                  </span>
                                  {route.examplePath && (
                                    <Badge variant="outline" className="text-xs">
                                      Exemple
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {route.description}
                                </p>
                                <code className="text-xs text-muted-foreground/70 mt-1 block">
                                  {route.path}
                                </code>
                              </div>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleFavorite(route.path);
                              }}
                              className="absolute top-1/2 -translate-y-1/2 right-2 h-8 w-8 opacity-0 group-hover/list-item:opacity-100 transition-all duration-200"
                              aria-label={favorites.has(route.path) ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                              <Star 
                                className={`h-4 w-4 transition-all duration-300 ${
                                  favorites.has(route.path) 
                                    ? 'fill-yellow-400 text-yellow-400 scale-110' 
                                    : 'text-muted-foreground hover:text-yellow-400'
                                }`}
                              />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {filteredRoutesCount === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucune route ne correspond à votre recherche. Essayez d'autres mots-clés.
            </p>
          </div>
        )}
      </div>

      {/* Bouton Scroll to Top */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 rounded-full shadow-lg z-50"
          aria-label="Retour en haut"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
