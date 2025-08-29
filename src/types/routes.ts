// Unified Route Management System
export interface RouteConfig {
  id: string;
  path: string;
  label: string;
  description: string;
  component: string;
  category: 'main' | 'tools' | 'community' | 'admin' | 'auth' | 'legal';
  icon?: string;
  isProtected?: boolean;
  isPremium?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  isDeprecated?: boolean;
  redirectTo?: string;
  subRoutes?: RouteConfig[];
}

export const UNIFIED_ROUTES: RouteConfig[] = [
  // Main Routes - Core Platform
  {
    id: 'home',
    path: '/',
    label: 'Accueil',
    description: 'Page d\'accueil de la plateforme MED-MNG',
    component: 'Index',
    category: 'main',
    icon: 'Home',
    isPopular: true
  },
  {
    id: 'platform',
    path: '/platform',
    label: 'Vue Plateforme',
    description: 'Navigation master et vue d\'ensemble complète',
    component: 'PlatformOverview',
    category: 'main',
    icon: 'Globe',
    isNew: true,
    isPopular: true
  },
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    description: 'Tableau de bord principal avec analytics',
    component: 'SuperDashboard',
    category: 'main',
    icon: 'BarChart3'
  },
  {
    id: 'features',
    path: '/features',
    label: 'Fonctionnalités',
    description: 'Toutes les fonctionnalités disponibles',
    component: 'AllFeaturesPage',
    category: 'main',
    icon: 'Layers'
  },

  // EDN System
  {
    id: 'edn',
    path: '/edn',
    label: 'Items EDN',
    description: 'Interface unifiée pour les 367 items EDN',
    component: 'EdnComplete',
    category: 'main',
    icon: 'BookOpen',
    isPopular: true,
    subRoutes: [
      {
        id: 'edn-item',
        path: '/edn/:slug',
        label: 'Item EDN Détail',
        description: 'Détail d\'un item EDN spécifique',
        component: 'EdnItem',
        category: 'main'
      },
      {
        id: 'edn-immersive',
        path: '/edn/:slug/immersive',
        label: 'Mode Immersif',
        description: 'Expérience immersive pour un item EDN',
        component: 'EdnImmersive',
        category: 'main'
      }
    ]
  },

  // Tools & Generators
  {
    id: 'generator',
    path: '/generator',
    label: 'Générateur IA',
    description: 'Créez des contenus pédagogiques avec l\'IA',
    component: 'Generator',
    category: 'tools',
    icon: 'Music',
    isPremium: true,
    isPopular: true
  },
  {
    id: 'chat',
    path: '/chat',
    label: 'Assistant IA',
    description: 'Assistant médical intelligent',
    component: 'MedChat',
    category: 'tools',
    icon: 'Brain',
    isNew: true
  },
  {
    id: 'ecos',
    path: '/ecos',
    label: 'Simulations ECOS',
    description: 'Examens Cliniques Objectifs Structurés',
    component: 'EcosIndex',
    category: 'tools',
    icon: 'Stethoscope',
    subRoutes: [
      {
        id: 'ecos-scenario',
        path: '/ecos/:scenarioId',
        label: 'Scénario ECOS',
        description: 'Simulation d\'un scénario ECOS spécifique',
        component: 'EcosScenario',
        category: 'tools'
      }
    ]
  },
  {
    id: 'analytics',
    path: '/analytics',
    label: 'Analytics',
    description: 'Analyses avancées de performance',
    component: 'Analytics',
    category: 'tools',
    icon: 'BarChart3'
  },

  // MED-MNG Studio (Premium)
  {
    id: 'med-mng-dashboard',
    path: '/med-mng/dashboard',
    label: 'MED-MNG Studio',
    description: 'Studio de création musicale premium',
    component: 'MedMngDashboard',
    category: 'community',
    icon: 'Heart',
    isPremium: true,
    isProtected: true
  },
  {
    id: 'med-mng-create',
    path: '/med-mng/create',
    label: 'Créer Musique',
    description: 'Interface de création musicale',
    component: 'MedMngCreate',
    category: 'community',
    icon: 'Plus',
    isPremium: true,
    isProtected: true
  },
  {
    id: 'med-mng-library',
    path: '/med-mng/library',
    label: 'Bibliothèque',
    description: 'Votre collection musicale',
    component: 'MedMngLibrary',
    category: 'community',
    icon: 'Library',
    isPremium: true,
    isProtected: true
  },

  // Community
  {
    id: 'community',
    path: '/community',
    label: 'Communauté',
    description: 'Échangez avec la communauté médicale',
    component: 'Community',
    category: 'community',
    icon: 'Users'
  },
  {
    id: 'profile',
    path: '/profile',
    label: 'Profil',
    description: 'Gérez votre profil utilisateur',
    component: 'Profile',
    category: 'community',
    icon: 'User'
  },

  // Administration
  {
    id: 'admin',
    path: '/admin',
    label: 'Administration',
    description: 'Panneau d\'administration',
    component: 'Admin',
    category: 'admin',
    icon: 'Shield',
    isProtected: true
  },
  {
    id: 'monitoring',
    path: '/monitoring',
    label: 'Monitoring',
    description: 'Surveillance système',
    component: 'Monitoring',
    category: 'admin',
    icon: 'Activity',
    isProtected: true
  },
  {
    id: 'audit',
    path: '/audit',
    label: 'Audit',
    description: 'Audit unifié du système',
    component: 'AuditComplete',
    category: 'admin',
    icon: 'Search',
    isProtected: true
  },

  // Settings & Support
  {
    id: 'settings',
    path: '/settings',
    label: 'Paramètres',
    description: 'Configuration utilisateur',
    component: 'UserSettings',
    category: 'main',
    icon: 'Settings'
  },
  {
    id: 'help',
    path: '/help',
    label: 'Aide',
    description: 'Centre d\'aide et documentation',
    component: 'HelpCenter',
    category: 'main',
    icon: 'HelpCircle'
  },
  {
    id: 'faq',
    path: '/faq',
    label: 'FAQ',
    description: 'Questions fréquemment posées',
    component: 'FAQ',
    category: 'main',
    icon: 'HelpCircle'
  },

  // Legal
  {
    id: 'mentions-legales',
    path: '/mentions-legales',
    label: 'Mentions Légales',
    description: 'Mentions légales de la plateforme',
    component: 'MentionsLegales',
    category: 'legal',
    icon: 'FileText'
  },
  {
    id: 'politique-confidentialite',
    path: '/politique-confidentialite',
    label: 'Politique de Confidentialité',
    description: 'Politique de confidentialité',
    component: 'PolitiqueConfidentialite',
    category: 'legal',
    icon: 'Shield'
  },
  {
    id: 'conditions',
    path: '/conditions',
    label: 'Conditions d\'Utilisation',
    description: 'Conditions générales d\'utilisation',
    component: 'Conditions',
    category: 'legal',
    icon: 'FileText'
  },

  // Redirects & Deprecated
  {
    id: 'edn-complete-redirect',
    path: '/edn-complete',
    label: 'Redirect EDN',
    description: 'Redirection vers EDN unifié',
    component: '',
    category: 'main',
    isDeprecated: true,
    redirectTo: '/edn'
  }
];

// Helper functions
export const getRouteById = (id: string): RouteConfig | undefined => 
  UNIFIED_ROUTES.find(route => route.id === id);

export const getRoutesByCategory = (category: RouteConfig['category']): RouteConfig[] =>
  UNIFIED_ROUTES.filter(route => route.category === category && !route.isDeprecated);

export const getPopularRoutes = (): RouteConfig[] =>
  UNIFIED_ROUTES.filter(route => route.isPopular && !route.isDeprecated);

export const getNewRoutes = (): RouteConfig[] =>
  UNIFIED_ROUTES.filter(route => route.isNew && !route.isDeprecated);

export const getPremiumRoutes = (): RouteConfig[] =>
  UNIFIED_ROUTES.filter(route => route.isPremium && !route.isDeprecated);

export const getMainRoutes = (): RouteConfig[] =>
  getRoutesByCategory('main').filter(route => !route.subRoutes);

export const getAllActiveRoutes = (): RouteConfig[] =>
  UNIFIED_ROUTES.filter(route => !route.isDeprecated);