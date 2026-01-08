import { useState, useEffect, useCallback } from 'react';

interface GeneratorPreferences {
  contentType: string;
  selectedItem: string;
  selectedRang: string;
  selectedStyle: string;
  lastUpdated: string;
}

const STORAGE_KEY = 'generator_preferences';

export const useGeneratorPreferences = () => {
  const [preferences, setPreferences] = useState<GeneratorPreferences | null>(null);

  // Charger les préférences au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Vérifier que les préférences ne sont pas trop anciennes (7 jours)
        const lastUpdated = new Date(parsed.lastUpdated);
        const daysDiff = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) {
          setPreferences(parsed);
        }
      }
    } catch (err) {
      console.warn('Erreur chargement préférences:', err);
    }
  }, []);

  // Sauvegarder les préférences
  const savePreferences = useCallback((prefs: Omit<GeneratorPreferences, 'lastUpdated'>) => {
    const data: GeneratorPreferences = {
      ...prefs,
      lastUpdated: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setPreferences(data);
    } catch (err) {
      console.warn('Erreur sauvegarde préférences:', err);
    }
  }, []);

  // Effacer les préférences
  const clearPreferences = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPreferences(null);
    } catch (err) {
      console.warn('Erreur suppression préférences:', err);
    }
  }, []);

  return {
    preferences,
    savePreferences,
    clearPreferences,
  };
};
