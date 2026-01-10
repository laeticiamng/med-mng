/**
 * 🔔 Gestionnaire des notifications de génération
 * - Notifications push (si permission accordée)
 * - Toast enrichi avec actions
 * - Son de notification optionnel
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/med-mng/AuthProvider';

interface GenerationNotificationHandlerProps {
  onGenerationComplete?: (track: any) => void;
  playNotificationSound?: boolean;
}

export const useGenerationNotifications = ({
  onGenerationComplete,
  playNotificationSound = true
}: GenerationNotificationHandlerProps = {}) => {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Son de notification court
  const playSound = useCallback(() => {
    if (!playNotificationSound) return;
    
    try {
      if (!audioRef.current) {
        // Utiliser un son système léger
        audioRef.current = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYZHk1HmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+9REAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
        audioRef.current.volume = 0.3;
      }
      audioRef.current.play().catch(() => {});
    } catch (err) {
      console.warn('Erreur lecture son notification:', err);
    }
  }, [playNotificationSound]);

  // Demander permission notifications au montage
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Ne pas demander immédiatement, attendre une interaction
    }
  }, []);

  // Envoyer notification push
  const sendPushNotification = useCallback((title: string, body: string, icon?: string) => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          tag: 'music-generation',
          requireInteraction: false,
          silent: false
        });
        playSound();
      } catch (err) {
        console.warn('Erreur notification push:', err);
        // Fallback sur toast
        toast.success(title, { description: body });
      }
    } else {
      // Fallback sur toast si pas de permission
      toast.success(title, { description: body });
    }
  }, [playSound]);

  // Handler de génération complète
  const handleGenerationComplete = useCallback((track: any) => {
    const title = track.title || 'Nouvelle musique';
    
    sendPushNotification(
      '🎵 Musique prête !',
      `Votre musique "${title}" est disponible`
    );

    onGenerationComplete?.(track);
  }, [sendPushNotification, onGenerationComplete]);

  // Demander la permission de notification
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return Notification.permission === 'granted';
  }, []);

  return {
    sendPushNotification,
    handleGenerationComplete,
    requestNotificationPermission,
    notificationsEnabled: 'Notification' in window && Notification.permission === 'granted'
  };
};
