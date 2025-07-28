// Configuration centralisée pour les optimisations de vitesse de génération musicale

export const SPEED_OPTIMIZATIONS = {
  // Modèle le plus rapide selon la documentation officielle
  model: "chirp-v4.5", // 2x plus rapide que v4.0
  
  // Paramètres de vitesse pour l'API Suno
  api: {
    fastMode: true,           // Mode rapide activé
    priority: "high",         // Priorité haute dans la queue
    streamingEnabled: true,   // Streaming pour résultats rapides
    optimizeForSpeed: true,   // Flag optimisation vitesse
    quality: "balanced",      // Équilibre vitesse/qualité
    maxPromptLength: 2800,    // Prompts plus courts pour vitesse
    maxStyleLength: 800       // Styles condensés
  },
  
  // Paramètres de durée optimisés
  duration: {
    default: 180,             // 3 minutes par défaut
    maximum: 240,             // 4 minutes max
    minimum: 60               // 1 minute min
  },
  
  // Configuration du polling optimisé
  polling: {
    interval: 3000,           // 3 secondes entre chaque vérification
    maxAttempts: 60,          // 5 minutes max (60 * 3s = 180s)
    timeoutMinutes: 5,        // Timeout global
    initialDelay: 100         // Délai avant premier poll
  },
  
  // Temps attendus avec optimisations v4.5
  expectedTimes: {
    minimal: 20,              // Cas optimal (secondes)
    average: 45,              // Cas moyen (secondes)
    maximum: 90,              // Cas complexe (secondes)
    timeout: 300              // Timeout absolu (secondes)
  },
  
  // Messages d'interface utilisateur
  ui: {
    generatingTitle: "🚀 Génération Ultra-Rapide",
    modelBadge: "v4.5 - 2x Plus Rapide",
    estimatedTime: "20-60 secondes",
    optimizationsActive: "Modèle v4.5, Streaming, Polling rapide, Priorité haute"
  },
  
  // Configuration des notifications
  notifications: {
    successTitle: "🎵 Musique générée !",
    successDescription: "Génération ultra-rapide terminée avec succès",
    timeoutTitle: "⏰ Génération en cours...",
    timeoutDescription: "La musique sera disponible bientôt. Vérifiez votre bibliothèque.",
    errorTitle: "❌ Génération échouée"
  }
} as const;

// Types pour TypeScript
export type SpeedOptimizationConfig = typeof SPEED_OPTIMIZATIONS;
export type ExpectedTimes = typeof SPEED_OPTIMIZATIONS.expectedTimes;
export type PollingConfig = typeof SPEED_OPTIMIZATIONS.polling;

// Fonctions utilitaires pour les optimisations
export const createOptimizedPayload = (basePayload: any) => ({
  ...basePayload,
  model: SPEED_OPTIMIZATIONS.model,
  ...SPEED_OPTIMIZATIONS.api,
  duration: Math.min(basePayload.duration || SPEED_OPTIMIZATIONS.duration.default, SPEED_OPTIMIZATIONS.duration.maximum)
});

export const getEstimatedCompletionTime = () => {
  const now = new Date();
  const estimatedSeconds = SPEED_OPTIMIZATIONS.expectedTimes.average;
  return new Date(now.getTime() + estimatedSeconds * 1000);
};

export const isWithinOptimalTime = (startTime: number) => {
  const elapsed = Date.now() - startTime;
  return elapsed <= SPEED_OPTIMIZATIONS.expectedTimes.maximum * 1000;
};

export const calculateProgress = (startTime: number, maxTime: number = SPEED_OPTIMIZATIONS.expectedTimes.average * 1000) => {
  const elapsed = Date.now() - startTime;
  return Math.min((elapsed / maxTime) * 95, 95); // Ne jamais dépasser 95% avant completion
};