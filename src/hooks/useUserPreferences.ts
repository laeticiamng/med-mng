import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserPreferences {
  // Apparence
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en' | 'es' | 'de';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  highContrast: boolean;

  // Audio
  defaultVolume: number;
  autoPlay: boolean;
  audioQuality: 'low' | 'medium' | 'high';
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundNotifications: boolean;
  marketingEmails: boolean;

  // Génération de musique
  defaultStyle: string;
  defaultDuration: number;
  autoSave: boolean;
  qualityPreference: 'speed' | 'balanced' | 'quality';

  // Interface
  compactMode: boolean;
  showTips: boolean;
  autoRefresh: boolean;
  keyboardShortcuts: boolean;

  // Confidentialité
  analytics: boolean;
  crashReporting: boolean;
  personalizedContent: boolean;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'fr',
  fontSize: 'medium',
  animations: true,
  highContrast: false,
  defaultVolume: 0.8,
  autoPlay: false,
  audioQuality: 'high',
  emailNotifications: true,
  pushNotifications: true,
  soundNotifications: true,
  marketingEmails: false,
  defaultStyle: 'pop',
  defaultDuration: 240,
  autoSave: true,
  qualityPreference: 'balanced',
  compactMode: false,
  showTips: true,
  autoRefresh: true,
  keyboardShortcuts: true,
  analytics: true,
  crashReporting: true,
  personalizedContent: true
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger depuis localStorage d'abord
      const localPrefs = localStorage.getItem('user-preferences');
      if (localPrefs) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(localPrefs) });
      }

      // Puis charger depuis Supabase si connecté
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        // Table user_preferences pas encore créée - utiliser localStorage seulement
        console.log('Using localStorage for preferences storage');
      }
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    try {
      setSyncing(true);
      const updatedPrefs = { ...preferences, ...newPreferences };
      
      setPreferences(updatedPrefs);
      localStorage.setItem('user-preferences', JSON.stringify(updatedPrefs));

      // Table user_preferences pas encore créée - localStorage seulement
      console.log('Preferences saved to localStorage only');

      toast({
        title: "Préférences sauvegardées",
        description: "Vos préférences ont été mises à jour"
      });
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  }, [preferences, toast]);

  const resetPreferences = useCallback(async () => {
    try {
      setSyncing(true);
      setPreferences(defaultPreferences);
      localStorage.setItem('user-preferences', JSON.stringify(defaultPreferences));

      // Table user_preferences pas encore créée - localStorage seulement
      console.log('Preferences reset in localStorage only');

      toast({
        title: "Préférences réinitialisées",
        description: "Les paramètres par défaut ont été restaurés"
      });
    } catch (error) {
      console.error('Erreur reset préférences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les préférences",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  }, [toast]);

  const exportPreferences = useCallback(() => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `preferences-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "Vos préférences ont été exportées"
    });
  }, [preferences, toast]);

  const importPreferences = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importedPrefs = JSON.parse(text);
      
      // Valider que les préférences sont conformes
      const validatedPrefs = { ...defaultPreferences, ...importedPrefs };
      await savePreferences(validatedPrefs);

      toast({
        title: "Import réussi",
        description: "Vos préférences ont été importées"
      });
    } catch (error) {
      console.error('Erreur import préférences:', error);
      toast({
        title: "Erreur d'import",
        description: "Fichier de préférences invalide",
        variant: "destructive"
      });
    }
  }, [savePreferences, toast]);

  // Appliquer les préférences CSS
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme);
    document.documentElement.setAttribute('data-font-size', preferences.fontSize);
    document.documentElement.style.setProperty('--default-volume', preferences.defaultVolume.toString());
    
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (!preferences.animations) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }
  }, [preferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    syncing,
    savePreferences,
    resetPreferences,
    exportPreferences,
    importPreferences,
    loadPreferences
  };
}