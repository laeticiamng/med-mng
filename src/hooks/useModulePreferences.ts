import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

/**
 * Modules disponibles sur la plateforme MED-MNG
 * Chaque module peut être activé/désactivé par l'utilisateur
 */
export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'learning' | 'productivity' | 'social' | 'wellbeing';
  isCore: boolean;
  defaultEnabled: boolean;
}

export const AVAILABLE_MODULES: ModuleConfig[] = [
  // Core (non désactivables)
  { id: 'items', name: 'Items EDN', description: 'Bibliothèque des 362 items officiels', icon: 'BookOpen', category: 'core', isCore: true, defaultEnabled: true },
  { id: 'ecos', name: 'ECOS UNESS', description: 'Simulations officielles avec grilles', icon: 'Stethoscope', category: 'core', isCore: true, defaultEnabled: true },
  { id: 'music', name: 'Musique médicale', description: 'Chansons générées par IA', icon: 'Music', category: 'core', isCore: true, defaultEnabled: true },
  
  // Learning (désactivables)
  { id: 'flashcards', name: 'Flashcards', description: 'Révision par répétition espacée', icon: 'Layers', category: 'learning', isCore: false, defaultEnabled: true },
  { id: 'srs', name: 'SRS Review', description: 'Système de mémorisation avancé', icon: 'Brain', category: 'learning', isCore: false, defaultEnabled: true },
  { id: 'qcm', name: 'Mode Examen', description: 'QCM chronométrés', icon: 'FileQuestion', category: 'learning', isCore: false, defaultEnabled: true },
  { id: 'clinical_cases', name: 'Cas cliniques', description: 'Raisonnement clinique guidé', icon: 'ClipboardList', category: 'learning', isCore: false, defaultEnabled: true },
  { id: 'ai_chat', name: 'MedChat IA', description: 'Assistant IA médical', icon: 'MessageSquare', category: 'learning', isCore: false, defaultEnabled: true },
  
  // Productivity (désactivables)
  { id: 'study_planner', name: 'Planificateur', description: 'Planning de révision intelligent', icon: 'Calendar', category: 'productivity', isCore: false, defaultEnabled: true },
  { id: 'pomodoro', name: 'Pomodoro', description: 'Timer de productivité', icon: 'Timer', category: 'productivity', isCore: false, defaultEnabled: false },
  { id: 'goals', name: 'Mes objectifs', description: 'Suivi des objectifs personnels', icon: 'Target', category: 'productivity', isCore: false, defaultEnabled: true },
  
  // Social (désactivables)
  { id: 'community', name: 'Communauté', description: 'Échanges entre étudiants', icon: 'Users', category: 'social', isCore: false, defaultEnabled: false },
  { id: 'leaderboard', name: 'Classement', description: 'Leaderboard hebdomadaire', icon: 'Trophy', category: 'social', isCore: false, defaultEnabled: true },
  { id: 'challenges', name: 'Défis quotidiens', description: 'Défis et récompenses', icon: 'Award', category: 'social', isCore: false, defaultEnabled: true },
  
  // Wellbeing (désactivables)
  { id: 'mood_tracker', name: 'Suivi humeur', description: 'Tracking du bien-être', icon: 'Heart', category: 'wellbeing', isCore: false, defaultEnabled: false },
  { id: 'achievements', name: 'Succès', description: 'Badges et accomplissements', icon: 'Medal', category: 'wellbeing', isCore: false, defaultEnabled: true },
];

export interface ModulePreferences {
  [moduleId: string]: boolean;
}

/**
 * Hook pour gérer les préférences de modules de l'utilisateur
 * Utilise localStorage pour la persistance (compatible avec tous les utilisateurs)
 */
export function useModulePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ModulePreferences>(() => {
    // Initialiser avec les défauts
    const defaults: ModulePreferences = {};
    AVAILABLE_MODULES.forEach(m => {
      defaults[m.id] = m.defaultEnabled;
    });
    return defaults;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Charger les préférences depuis localStorage
  useEffect(() => {
    const storageKey = user?.id ? `med-mng-modules-${user.id}` : 'med-mng-modules-anon';
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as ModulePreferences;
        const mergedPrefs: ModulePreferences = {};
        
        AVAILABLE_MODULES.forEach(m => {
          if (m.isCore) {
            mergedPrefs[m.id] = true;
          } else {
            mergedPrefs[m.id] = parsed[m.id] ?? m.defaultEnabled;
          }
        });

        setPreferences(mergedPrefs);
      }
    } catch (err) {
      console.error('Failed to load module preferences:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Sauvegarder les préférences
  const savePreferences = useCallback((newPrefs: ModulePreferences) => {
    const storageKey = user?.id ? `med-mng-modules-${user.id}` : 'med-mng-modules-anon';
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(newPrefs));
      setPreferences(newPrefs);
    } catch (err) {
      console.error('Failed to save module preferences:', err);
    }
  }, [user?.id]);

  // Toggle un module spécifique
  const toggleModule = useCallback((moduleId: string) => {
    const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
    if (!module || module.isCore) return;

    const newPrefs = {
      ...preferences,
      [moduleId]: !preferences[moduleId],
    };
    savePreferences(newPrefs);
  }, [preferences, savePreferences]);

  // Activer tous les modules
  const enableAll = useCallback(() => {
    const newPrefs: ModulePreferences = {};
    AVAILABLE_MODULES.forEach(m => {
      newPrefs[m.id] = true;
    });
    savePreferences(newPrefs);
  }, [savePreferences]);

  // Mode minimaliste (core uniquement)
  const setMinimalMode = useCallback(() => {
    const newPrefs: ModulePreferences = {};
    AVAILABLE_MODULES.forEach(m => {
      newPrefs[m.id] = m.isCore;
    });
    savePreferences(newPrefs);
  }, [savePreferences]);

  // Vérifier si un module est activé
  const isModuleEnabled = useCallback((moduleId: string): boolean => {
    const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
    if (module?.isCore) return true;
    return preferences[moduleId] ?? true;
  }, [preferences]);

  // Obtenir les modules par catégorie
  const getModulesByCategory = useCallback((category: ModuleConfig['category']) => {
    return AVAILABLE_MODULES.filter(m => m.category === category);
  }, []);

  // Obtenir uniquement les modules activés
  const getEnabledModules = useCallback(() => {
    return AVAILABLE_MODULES.filter(m => isModuleEnabled(m.id));
  }, [isModuleEnabled]);

  return {
    preferences,
    isLoading,
    toggleModule,
    enableAll,
    setMinimalMode,
    isModuleEnabled,
    getModulesByCategory,
    getEnabledModules,
    modules: AVAILABLE_MODULES,
  };
}

export default useModulePreferences;
