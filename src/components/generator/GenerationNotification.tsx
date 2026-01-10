import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface GenerationNotificationProps {
  isGenerating: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  audioUrl?: string;
  error?: string;
  title?: string;
}

/**
 * Composant invisible qui gère les notifications de fin de génération
 * Utilise l'API Notification si disponible pour alerter même en arrière-plan
 */
export const GenerationNotification: React.FC<GenerationNotificationProps> = ({
  isGenerating,
  isCompleted,
  isFailed,
  audioUrl,
  error,
  title = 'Votre musique'
}) => {
  const wasGeneratingRef = useRef(false);
  const notifiedRef = useRef(false);

  useEffect(() => {
    // Demander la permission pour les notifications au montage
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Détecter la transition generating -> completed/failed
    if (wasGeneratingRef.current && !isGenerating && !notifiedRef.current) {
      if (isCompleted && audioUrl) {
        notifiedRef.current = true;
        
        // Notification sonner (toujours visible)
        toast.success('🎵 Musique générée !', {
          description: `${title} est prête à être écoutée`,
          duration: 10000,
          action: {
            label: 'Écouter',
            onClick: () => {
              // Scroll vers le player ou jouer l'audio
              const audio = new Audio(audioUrl);
              audio.play().catch(() => {});
            }
          }
        });

        // Notification système (si en arrière-plan)
        if ('Notification' in window && Notification.permission === 'granted') {
          if (document.hidden) {
            new Notification('🎵 MedSongs - Musique prête !', {
              body: `${title} a été générée avec succès`,
              icon: '/favicon.ico',
              tag: 'music-generation'
            });
          }
        }
      } else if (isFailed) {
        notifiedRef.current = true;
        
        toast.error('Échec de la génération', {
          description: error || 'Une erreur est survenue. Réessayez.',
          duration: 8000
        });
      }
    }

    // Réinitialiser quand une nouvelle génération commence
    if (isGenerating && !wasGeneratingRef.current) {
      notifiedRef.current = false;
    }

    wasGeneratingRef.current = isGenerating;
  }, [isGenerating, isCompleted, isFailed, audioUrl, error, title]);

  // Ce composant ne rend rien visuellement
  return null;
};
