import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ui/theme-provider';
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
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Charger les favoris depuis localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('sitemap-favorites');
    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

  // Sauvegarder les favoris dans localStorage
  const saveFavorites = (newFavorites: Set<string>) => {
    setFavorites(newFavorites);
    localStorage.setItem('sitemap-favorites', JSON.stringify(Array.from(newFavorites)));
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
