import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';

interface NotificationSettings {
  push: boolean;
  email: boolean;
  generationComplete: boolean;
  weeklyReport: boolean;
  newFeatures: boolean;
  studyReminders: boolean;
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
  showNotification: (title: string, options?: NotificationOptions) => void;
}

const defaultSettings: NotificationSettings = {
  push: false,
  email: true,
  generationComplete: true,
  weeklyReport: true,
  newFeatures: false,
  studyReminders: true
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [hasPermission, setHasPermission] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  // Load user notification settings
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        const { data } = await supabase
          .from('med_mng_user_preferences' as any)
          .select('notification_settings')
          .eq('user_id', user.id)
          .single();

        const typedData = data as any;
        if (typedData?.notification_settings) {
          setSettings({ ...defaultSettings, ...typedData.notification_settings });
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    };

    loadSettings();
  }, [user]);

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications non supportées",
        description: "Votre navigateur ne supporte pas les notifications",
        variant: "destructive"
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      setHasPermission(true);
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: "Notifications bloquées",
        description: "Vous avez bloqué les notifications. Activez-les dans les paramètres du navigateur.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      setHasPermission(granted);
      
      if (granted) {
        toast({
          title: "Notifications activées",
          description: "Vous recevrez maintenant des notifications pour vos générations musicales"
        });
      } else {
        toast({
          title: "Notifications refusées",
          description: "Vous ne recevrez pas de notifications push",
          variant: "destructive"
        });
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Update notification settings
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // If push notifications are being enabled, request permission
    if (newSettings.push && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        setSettings({ ...updatedSettings, push: false });
        return;
      }
    }

    // Save to database if user is logged in
    if (user) {
      try {
        await supabase
          .from('med_mng_user_preferences' as any)
          .upsert({
            user_id: user.id,
            notification_settings: updatedSettings,
            updated_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Failed to save notification settings:', error);
        toast({
          title: "Erreur de sauvegarde",
          description: "Impossible de sauvegarder les paramètres de notification",
          variant: "destructive"
        });
      }
    }
  };

  // Show notification
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!hasPermission || !settings.push) return;

    try {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  // Listen for generation completion
  useEffect(() => {
    if (!user || !settings.generationComplete) return;

      const channel = supabase
        .channel(`music-generation-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'med_mng_music_generations',
            filter: `user_id=eq.${user.id}`
          },
          (payload: any) => {
            const generation = payload.new;
          
          if (generation.status === 'completed') {
            showNotification(
              'Génération musicale terminée !',
              {
                body: `"${generation.title}" est prêt à écouter`,
                tag: 'generation-complete',
                requireInteraction: true
              }
            );

            toast({
              title: "Musique générée !",
              description: `"${generation.title}" est maintenant disponible dans votre bibliothèque`
            });
          } else if (generation.status === 'failed') {
            showNotification(
              'Échec de génération',
              {
                body: `La génération de "${generation.title}" a échoué`,
                tag: 'generation-failed'
              }
            );

            toast({
              title: "Génération échouée",
              description: `Impossible de générer "${generation.title}"`,
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, settings.generationComplete, showNotification, toast]);

  // Schedule study reminders
  useEffect(() => {
    if (!settings.studyReminders) return;

    const scheduleReminder = () => {
      const now = new Date();
      const nextReminder = new Date(now);
      
      // Set reminder for next day at 9 AM
      nextReminder.setDate(now.getDate() + 1);
      nextReminder.setHours(9, 0, 0, 0);

      const timeout = nextReminder.getTime() - now.getTime();

      return setTimeout(() => {
        showNotification(
          'Rappel d\'étude MED-MNG',
          {
            body: 'Il est temps de réviser vos connaissances médicales avec de la musique !',
            tag: 'study-reminder',
            requireInteraction: true
          }
        );

        // Schedule next reminder
        scheduleReminder();
      }, timeout);
    };

    const timeoutId = scheduleReminder();
    return () => clearTimeout(timeoutId);
  }, [settings.studyReminders, showNotification]);

  const contextValue: NotificationContextType = {
    settings,
    updateSettings,
    requestPermission,
    hasPermission,
    showNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};