/**
 * Feature Flags Configuration
 * Gère l'activation/désactivation des features de la plateforme
 */

export const FEATURE_FLAGS = {
  // 🔐 Authentication Features
  twoFactorAuth: {
    enabled: true,
    description: "Two-factor authentication (TOTP)",
  },
  rememberMe: {
    enabled: false, // À implémenter
    description: "Remember me sur la connexion",
  },
  socialLogin: {
    enabled: true,
    description: "Connexion via Google, Facebook, Apple",
  },

  // 👥 Collaboration Features
  collaborativePlaylists: {
    enabled: false, // À implémenter
    description: "Playlists collaboratives avec partage et édition en temps réel",
  },
  directMessaging: {
    enabled: false, // À implémenter
    description: "Messagerie directe entre utilisateurs",
  },
  groupCreation: {
    enabled: false, // À implémenter
    description: "Création de groupes d'étude",
  },

  // 📤 Export Features
  exportToCSV: {
    enabled: true,
    description: "Export données en CSV",
  },
  exportToPDF: {
    enabled: true, // ✅ Implémenté - pdfExport.ts avec jsPDF
    description: "Export rapports en PDF",
  },
  exportToExcel: {
    enabled: true,
    description: "Export données en Excel",
  },

  // 🤖 AI Features
  aiRecommendations: {
    enabled: true,
    description: "Recommandations basées sur l'IA",
  },
  aiGeneration: {
    enabled: true,
    description: "Génération musicale IA",
  },
  aiChat: {
    enabled: true,
    description: "Chat avec assistant médical IA",
  },

  // 📊 Analytics Features
  advancedAnalytics: {
    enabled: true,
    description: "Analytics détaillées et dashboards",
  },
  customReports: {
    enabled: false, // À implémenter
    description: "Rapports personnalisés",
  },
  exportReports: {
    enabled: true,
    description: "Export de rapports",
  },

  // 📱 Offline Features
  offlineMode: {
    enabled: true,
    description: "Mode offline avec PWA",
  },
  offlineSync: {
    enabled: true,
    description: "Synchronisation automatique",
  },

  // ⭐ Gamification
  badges: {
    enabled: true,
    description: "Système de badges et achievements",
  },
  streaks: {
    enabled: true,
    description: "Suivi des streaks d'étude",
  },
  leaderboard: {
    enabled: true, // ✅ Implémenté - LeaderboardDashboard + 4 pages leaderboard
    description: "Classement global utilisateurs",
  },

  // 💳 E-commerce Features
  shopifyIntegration: {
    enabled: true,
    description: "Intégration boutique Shopify",
  },
  wishlist: {
    enabled: false, // À implémenter
    description: "Liste de souhaits produits",
  },
  productReviews: {
    enabled: false, // À implémenter
    description: "Avis et notes sur les produits",
  },

  // 🔍 Search Features
  globalSearch: {
    enabled: true, // ✅ Implémenté - CommandPalette.tsx avec Fuse.js
    description: "Recherche globale (⌘K)",
  },
  advancedSearch: {
    enabled: true,
    description: "Recherche avancée avec filtres",
  },

  // 🎓 Learning Features
  studyPlanner: {
    enabled: true,
    description: "Planificateur d'études",
  },
  goalSetting: {
    enabled: true, // ✅ Implémenté - GoalManager + GoalTrackerWidget + useGoals hooks
    description: "Définition d'objectifs d'apprentissage",
  },
  practiceMode: {
    enabled: true,
    description: "Mode pratique avec quiz",
  },

  // 🔒 Security Features
  sessionManagement: {
    enabled: true,
    description: "Gestion des sessions utilisateur",
  },
  activityLogging: {
    enabled: true, // ✅ Implémenté - user-activity.service.ts avec audit trail complet
    description: "Logging complet des activités",
  },
  connectedDevices: {
    enabled: false, // À implémenter
    description: "Gestion des appareils connectés",
  },
};

/**
 * Fonction helper pour vérifier si une feature est activée
 */
export const isFeatureEnabled = (featurePath: string): boolean => {
  const keys = featurePath.split(".");
  let current: any = FEATURE_FLAGS;

  for (const key of keys) {
    if (current[key] === undefined) {
      console.warn(`Feature not found: ${featurePath}`);
      return false;
    }
    current = current[key];
  }

  return current.enabled === true;
};

/**
 * Type helper pour les features
 */
export type FeatureKey = keyof typeof FEATURE_FLAGS;
