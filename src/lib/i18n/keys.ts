// i18n Translation Keys - Centralized translation definitions
export const I18N_KEYS = {
  // Navigation
  nav: {
    home: "Accueil",
    learn: "Apprendre",
    "learn.ecos": "ECOS",
    "learn.edn": "Items EDN",
    "learn.chat": "Chat Médical",
    medmng: "MED-MNG",
    "medmng.dashboard": "Tableau de bord",
    "medmng.create": "Créer",
    "medmng.library": "Bibliothèque",
    "medmng.playlists": "Playlists",
    audit: "Audit",
    admin: "Administration",
    "admin.panel": "Panneau Admin",
    "admin.import": "Import",
    "admin.monitoring": "Monitoring",
    account: "Compte",
    "account.profile": "Profil",
    "account.settings": "Paramètres",
    "account.billing": "Facturation",
    "account.logout": "Déconnexion",
    auth: "Authentification",
    "auth.login": "Connexion",
    "auth.signup": "Inscription"
  },

  // Common actions
  actions: {
    create: "Créer",
    edit: "Modifier",
    delete: "Supprimer",
    save: "Enregistrer",
    cancel: "Annuler",
    submit: "Soumettre",
    search: "Rechercher",
    filter: "Filtrer",
    sort: "Trier",
    export: "Exporter",
    import: "Importer",
    refresh: "Actualiser",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",
    close: "Fermer",
    open: "Ouvrir",
    view: "Voir",
    download: "Télécharger",
    upload: "Téléverser"
  },

  // States
  states: {
    loading: "Chargement...",
    empty: "Aucun élément",
    error: "Erreur",
    success: "Succès",
    warning: "Attention",
    info: "Information",
    draft: "Brouillon",
    published: "Publié",
    archived: "Archivé",
    active: "Actif",
    inactive: "Inactif",
    pending: "En attente",
    completed: "Terminé",
    failed: "Échec"
  },

  // Forms
  forms: {
    required: "Champ obligatoire",
    invalid: "Format invalide",
    tooShort: "Trop court",
    tooLong: "Trop long",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    firstName: "Prénom",
    lastName: "Nom",
    phone: "Téléphone",
    address: "Adresse",
    city: "Ville",
    postalCode: "Code postal",
    country: "Pays"
  },

  // Messages
  messages: {
    welcome: "Bienvenue sur MED-MNG",
    loginSuccess: "Connexion réussie",
    loginError: "Erreur de connexion",
    logoutSuccess: "Déconnexion réussie",
    saveSuccess: "Sauvegarde réussie",
    saveError: "Erreur de sauvegarde",
    deleteSuccess: "Suppression réussie",
    deleteError: "Erreur de suppression",
    uploadSuccess: "Téléversement réussi",
    uploadError: "Erreur de téléversement",
    networkError: "Erreur réseau",
    serverError: "Erreur serveur",
    unauthorizedError: "Non autorisé",
    forbiddenError: "Accès refusé",
    notFoundError: "Élément non trouvé"
  },

  // Features
  features: {
    ecos: {
      title: "Simulations ECOS",
      description: "Entraînez-vous avec des cas cliniques interactifs",
      start: "Commencer une simulation",
      continue: "Continuer",
      results: "Résultats",
      feedback: "Feedback"
    },
    edn: {
      title: "Items EDN",
      description: "Explorez les items de connaissances avec du contenu immersif",
      browse: "Parcourir les items",
      search: "Rechercher un item",
      immersive: "Mode immersif",
      music: "Contenu musical"
    },
    medmng: {
      title: "MED-MNG",
      description: "Plateforme de création musicale médicale",
      create: "Créer une chanson",
      library: "Ma bibliothèque",
      playlists: "Mes playlists",
      analytics: "Statistiques"
    }
  },

  // Accessibility
  a11y: {
    skipToMain: "Aller au contenu principal",
    skipToNav: "Aller à la navigation",
    closeModal: "Fermer la modal",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    loading: "Chargement en cours",
    searchResults: "Résultats de recherche",
    pageOf: "Page {current} sur {total}",
    sortBy: "Trier par {field}",
    filterBy: "Filtrer par {field}"
  }
} as const;

// Helper function to get translation
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = I18N_KEYS;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation key is not a string: ${key}`);
    return key;
  }
  
  // Replace parameters
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }
  
  return value;
}