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
      
      // Charger directement depuis Supabase (source of truth)
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data?.preferences) {
          setPreferences({ ...defaultPreferences, ...(data.preferences as any) });
        }
      }
      // Pour utilisateurs non connectés, utiliser les defaults
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

      // Sync directement avec Supabase (source of truth)
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.user.id,
            preferences: updatedPrefs as any
          }, { onConflict: 'user_id' });

        if (error) throw error;
        
        toast({
          title: "Préférences sauvegardées",
          description: "Vos préférences ont été mises à jour"
        });
      } else {
        // Non connecté - préférences en mémoire seulement
        toast({
          title: "Préférences appliquées",
          description: "Connectez-vous pour les sauvegarder"
        });
      }
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

      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.user.id,
            preferences: defaultPreferences as any
          }, { onConflict: 'user_id' });

        if (error) throw error;
      }

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

  // Get a specific preference value
  const getPreference = useCallback(<K extends keyof UserPreferences>(key: K): UserPreferences[K] => {
    return preferences[key];
  }, [preferences]);

  // Update a single preference
  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    await savePreferences({ [key]: value } as Partial<UserPreferences>);
  }, [savePreferences]);

  // Toggle boolean preferences
  const togglePreference = useCallback(async (key: keyof Pick<UserPreferences,
    'animations' | 'highContrast' | 'autoPlay' | 'emailNotifications' |
    'pushNotifications' | 'soundNotifications' | 'marketingEmails' |
    'autoSave' | 'compactMode' | 'showTips' | 'autoRefresh' |
    'keyboardShortcuts' | 'analytics' | 'crashReporting' | 'personalizedContent'
  >) => {
    await savePreferences({ [key]: !preferences[key] } as Partial<UserPreferences>);
  }, [preferences, savePreferences]);

  // Check if preference differs from default
  const isCustomized = useCallback((key: keyof UserPreferences): boolean => {
    return preferences[key] !== defaultPreferences[key];
  }, [preferences]);

  // Get all customized preferences
  const getCustomizedPreferences = useCallback((): Partial<UserPreferences> => {
    const customized: Partial<UserPreferences> = {};
    (Object.keys(preferences) as Array<keyof UserPreferences>).forEach(key => {
      if (isCustomized(key)) {
        (customized as any)[key] = preferences[key];
      }
    });
    return customized;
  }, [preferences, isCustomized]);

  // Get preferences by category
  const getPreferencesByCategory = useCallback((category: 'appearance' | 'audio' | 'notifications' | 'music' | 'interface' | 'privacy'): Partial<UserPreferences> => {
    const categoryKeys: Record<string, Array<keyof UserPreferences>> = {
      appearance: ['theme', 'language', 'fontSize', 'animations', 'highContrast'],
      audio: ['defaultVolume', 'autoPlay', 'audioQuality'],
      notifications: ['emailNotifications', 'pushNotifications', 'soundNotifications', 'marketingEmails'],
      music: ['defaultStyle', 'defaultDuration', 'autoSave', 'qualityPreference'],
      interface: ['compactMode', 'showTips', 'autoRefresh', 'keyboardShortcuts'],
      privacy: ['analytics', 'crashReporting', 'personalizedContent']
    };

    const result: Partial<UserPreferences> = {};
    categoryKeys[category]?.forEach(key => {
      (result as any)[key] = preferences[key];
    });
    return result;
  }, [preferences]);

  // Validate preference value
  const validatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): boolean => {
    const validators: Partial<Record<keyof UserPreferences, (v: any) => boolean>> = {
      theme: (v) => ['light', 'dark', 'system'].includes(v),
      language: (v) => ['fr', 'en', 'es', 'de'].includes(v),
      fontSize: (v) => ['small', 'medium', 'large'].includes(v),
      audioQuality: (v) => ['low', 'medium', 'high'].includes(v),
      qualityPreference: (v) => ['speed', 'balanced', 'quality'].includes(v),
      defaultVolume: (v) => typeof v === 'number' && v >= 0 && v <= 1,
      defaultDuration: (v) => typeof v === 'number' && v >= 30 && v <= 600
    };

    const validator = validators[key];
    if (!validator) return true;
    return validator(value);
  }, []);

  // Get theme-aware class
  const getThemeClass = useCallback((lightClass: string, darkClass: string): string => {
    if (preferences.theme === 'dark') return darkClass;
    if (preferences.theme === 'light') return lightClass;
    // System theme detection
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return darkClass;
    return lightClass;
  }, [preferences.theme]);

  // Check if dark mode is active
  const isDarkMode = useCallback((): boolean => {
    if (preferences.theme === 'dark') return true;
    if (preferences.theme === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
  }, [preferences.theme]);

  // Get font size multiplier
  const getFontSizeMultiplier = useCallback((): number => {
    switch (preferences.fontSize) {
      case 'small': return 0.875;
      case 'large': return 1.125;
      default: return 1;
    }
  }, [preferences.fontSize]);

  // Sync preferences when auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loadPreferences();
      } else if (event === 'SIGNED_OUT') {
        setPreferences(defaultPreferences);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadPreferences]);

  // Get preference description for UI
  const getPreferenceDescription = useCallback((key: keyof UserPreferences): string => {
    const descriptions: Record<keyof UserPreferences, string> = {
      theme: 'Apparence visuelle de l\'application',
      language: 'Langue de l\'interface',
      fontSize: 'Taille du texte dans l\'application',
      animations: 'Activer les animations et transitions',
      highContrast: 'Mode contraste élevé pour accessibilité',
      defaultVolume: 'Volume par défaut pour les médias',
      autoPlay: 'Lecture automatique des médias',
      audioQuality: 'Qualité de lecture audio',
      emailNotifications: 'Recevoir des notifications par email',
      pushNotifications: 'Recevoir des notifications push',
      soundNotifications: 'Sons pour les notifications',
      marketingEmails: 'Recevoir les actualités et offres',
      defaultStyle: 'Style musical par défaut',
      defaultDuration: 'Durée par défaut des générations',
      autoSave: 'Sauvegarder automatiquement les créations',
      qualityPreference: 'Priorité vitesse ou qualité',
      compactMode: 'Interface condensée',
      showTips: 'Afficher les conseils et astuces',
      autoRefresh: 'Actualiser automatiquement les données',
      keyboardShortcuts: 'Activer les raccourcis clavier',
      analytics: 'Partager les données d\'utilisation anonymes',
      crashReporting: 'Envoyer les rapports d\'erreur',
      personalizedContent: 'Contenu personnalisé basé sur l\'utilisation'
    };
    return descriptions[key];
  }, []);

  return {
    preferences,
    loading,
    syncing,
    savePreferences,
    resetPreferences,
    exportPreferences,
    importPreferences,
    loadPreferences,
    getPreference,
    updatePreference,
    togglePreference,
    isCustomized,
    getCustomizedPreferences,
    getPreferencesByCategory,
    validatePreference,
    getThemeClass,
    isDarkMode,
    getFontSizeMultiplier,
    getPreferenceDescription,
    defaultPreferences
  };
}