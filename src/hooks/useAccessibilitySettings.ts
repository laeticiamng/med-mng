/**
 * useAccessibilitySettings - Hook pour gérer les paramètres d'accessibilité
 * Intégré avec la table accessibility_settings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface AccessibilitySettings {
  id: string;
  user_id: string;
  high_contrast: boolean;
  reduce_motion: boolean;
  screen_reader_optimized: boolean;
  font_size_scale: number;
  dyslexia_friendly_font: boolean;
  color_blind_mode: 'protanopia' | 'deuteranopia' | 'tritanopia' | null;
  keyboard_only_navigation: boolean;
  audio_descriptions: boolean;
  captions_enabled: boolean;
  focus_indicators_enhanced: boolean;
  created_at: string;
  updated_at: string;
}

const defaultSettings: Omit<AccessibilitySettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  high_contrast: false,
  reduce_motion: false,
  screen_reader_optimized: false,
  font_size_scale: 1.0,
  dyslexia_friendly_font: false,
  color_blind_mode: null,
  keyboard_only_navigation: false,
  audio_descriptions: false,
  captions_enabled: true,
  focus_indicators_enhanced: false
};

export const useAccessibilitySettings = () => {
  const queryClient = useQueryClient();

  // Récupérer les paramètres actuels
  const { data: settings, isLoading } = useQuery({
    queryKey: ['accessibility-settings'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return defaultSettings as AccessibilitySettings;

      const { data, error } = await supabase
        .from('accessibility_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Si pas de paramètres, créer avec valeurs par défaut
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('accessibility_settings')
          .insert({ user_id: user.user.id, ...defaultSettings })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData as AccessibilitySettings;
      }

      return data as AccessibilitySettings;
    }
  });

  // Mettre à jour les paramètres
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<AccessibilitySettings>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('accessibility_settings')
        .update(updates)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;
      return data as AccessibilitySettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessibility-settings'] });
      toast.success('Paramètres d\'accessibilité mis à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Appliquer les styles CSS dynamiquement
  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // High contrast
    if (settings.high_contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduce motion
    if (settings.reduce_motion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Font size
    root.style.setProperty('--font-scale', String(settings.font_size_scale));

    // Dyslexia font
    if (settings.dyslexia_friendly_font) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }

    // Color blind mode
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (settings.color_blind_mode) {
      root.classList.add(settings.color_blind_mode);
    }

    // Enhanced focus indicators
    if (settings.focus_indicators_enhanced) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Screen reader optimized
    if (settings.screen_reader_optimized) {
      root.setAttribute('data-sr-optimized', 'true');
    } else {
      root.removeAttribute('data-sr-optimized');
    }
  }, [settings]);

  // Toggle rapide pour un paramètre
  const toggleSetting = (key: keyof AccessibilitySettings) => {
    if (!settings) return;
    const currentValue = settings[key];
    if (typeof currentValue === 'boolean') {
      updateSettings.mutate({ [key]: !currentValue });
    }
  };

  // Réinitialiser aux valeurs par défaut
  const resetToDefaults = () => {
    updateSettings.mutate(defaultSettings);
  };

  return {
    settings: settings || defaultSettings,
    isLoading,
    isUpdating: updateSettings.isPending,
    updateSettings: updateSettings.mutate,
    toggleSetting,
    resetToDefaults
  };
};

export default useAccessibilitySettings;
