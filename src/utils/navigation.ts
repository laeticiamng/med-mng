// Utilitaires de navigation pour MED-MNG

export const medMngRoutes = {
  // Routes publiques
  login: '/med-mng/login',
  signup: '/med-mng/signup',
  pricing: '/med-mng/pricing',
  
  // Routes protégées
  dashboard: '/med-mng/dashboard',
  create: '/med-mng/create',
  library: '/med-mng/library',
  player: (trackId: string) => `/med-mng/player/${trackId}`,
  playlists: '/med-mng/playlists',
  playlistDetail: (playlistId: string) => `/med-mng/playlists/${playlistId}`,
  profile: '/med-mng/profile',
  settings: '/med-mng/settings',
  analytics: '/med-mng/analytics',
  community: '/med-mng/community',
  success: '/med-mng/success',
  
  // Routes d'abonnement
  subscribe: (planId: string) => `/med-mng/subscribe/${planId}`,
} as const;

export const navigationItems = [
  {
    path: medMngRoutes.dashboard,
    label: 'Dashboard',
    icon: 'BarChart3',
    description: 'Vue d\'ensemble de votre apprentissage'
  },
  {
    path: medMngRoutes.create,
    label: 'Créer',
    icon: 'Music',
    description: 'Générer de nouvelles musiques pédagogiques'
  },
  {
    path: medMngRoutes.library,
    label: 'Bibliothèque',
    icon: 'BookOpen',
    description: 'Vos musiques et collections'
  },
  {
    path: medMngRoutes.playlists,
    label: 'Playlists',
    icon: 'List',
    description: 'Organiser vos apprentissages'
  },
  {
    path: medMngRoutes.analytics,
    label: 'Analytics',
    icon: 'TrendingUp',
    description: 'Suivre votre progression'
  },
  {
    path: medMngRoutes.community,
    label: 'Communauté',
    icon: 'Users',
    description: 'Connecter avec d\'autres étudiants'
  }
];

// Helper pour vérifier si une route est active
export const isActiveRoute = (currentPath: string, targetPath: string): boolean => {
  if (targetPath === medMngRoutes.dashboard) {
    return currentPath === targetPath;
  }
  return currentPath.startsWith(targetPath);
};

// Helper pour obtenir le titre de la page
export const getPageTitle = (pathname: string): string => {
  const routes: Record<string, string> = {
    [medMngRoutes.dashboard]: 'Dashboard',
    [medMngRoutes.create]: 'Créateur Musical',
    [medMngRoutes.library]: 'Ma Bibliothèque',
    [medMngRoutes.playlists]: 'Mes Playlists',
    [medMngRoutes.analytics]: 'Analytics',
    [medMngRoutes.community]: 'Communauté',
    [medMngRoutes.profile]: 'Mon Profil',
    [medMngRoutes.settings]: 'Paramètres',
    [medMngRoutes.login]: 'Connexion',
    [medMngRoutes.signup]: 'Inscription',
    [medMngRoutes.pricing]: 'Tarifs',
    [medMngRoutes.success]: 'Succès'
  };

  // Vérifier les routes dynamiques
  if (pathname.includes('/player/')) {
    return 'Lecteur Musical';
  }
  if (pathname.includes('/playlists/') && pathname !== medMngRoutes.playlists) {
    return 'Détails Playlist';
  }
  if (pathname.includes('/subscribe/')) {
    return 'Abonnement';
  }

  return routes[pathname] || 'MED-MNG';
};

// Breadcrumbs helpers
export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

export const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Accueil', path: medMngRoutes.dashboard }
  ];

  if (segments.length > 1 && segments[0] === 'med-mng') {
    const page = segments[1];
    
    switch (page) {
      case 'create':
        breadcrumbs.push({ label: 'Créateur', isActive: true });
        break;
      case 'library':
        breadcrumbs.push({ label: 'Bibliothèque', isActive: true });
        break;
      case 'playlists':
        if (segments[2]) {
          breadcrumbs.push({ 
            label: 'Playlists', 
            path: medMngRoutes.playlists 
          });
          breadcrumbs.push({ 
            label: 'Détails', 
            isActive: true 
          });
        } else {
          breadcrumbs.push({ label: 'Playlists', isActive: true });
        }
        break;
      case 'player':
        if (segments[2]) {
          breadcrumbs.push({ 
            label: 'Bibliothèque', 
            path: medMngRoutes.library 
          });
          breadcrumbs.push({ 
            label: 'Lecteur', 
            isActive: true 
          });
        }
        break;
      default:
        breadcrumbs.push({ 
          label: getPageTitle(pathname), 
          isActive: true 
        });
    }
  }

  return breadcrumbs;
};