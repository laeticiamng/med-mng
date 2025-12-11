import { useCallback, useRef, useEffect, useState } from 'react';

export type AnnouncementPriority = 'polite' | 'assertive' | 'off';
export type AnnouncementType = 'status' | 'alert' | 'log' | 'timer' | 'marquee';

export interface AnnouncementOptions {
  priority?: AnnouncementPriority;
  type?: AnnouncementType;
  delay?: number;
  clearAfter?: number;
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
}

export interface AnnouncementLog {
  id: string;
  message: string;
  timestamp: Date;
  priority: AnnouncementPriority;
  type?: AnnouncementType;
}

export interface UseAccessibilityAnnouncementReturn {
  // Annonces de base
  announce: (message: string, options?: AnnouncementOptions) => void;
  announcePolite: (message: string) => void;
  announceAssertive: (message: string) => void;

  // Annonces contextuelles
  announceNavigation: (location: string, details?: string) => void;
  announceAction: (action: string, result: 'success' | 'error' | 'pending', details?: string) => void;
  announceLoading: (isLoading: boolean, context?: string) => void;
  announceProgress: (current: number, total: number, context?: string) => void;
  announceError: (error: string, recoverable?: boolean) => void;
  announceFormValidation: (field: string, isValid: boolean, message?: string) => void;
  announceSelection: (item: string, selected: boolean, context?: string) => void;
  announceModal: (isOpen: boolean, title?: string) => void;
  announceNotification: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
  announceCountdown: (seconds: number) => void;
  announceListUpdate: (action: 'added' | 'removed' | 'updated', item: string, listName?: string) => void;

  // Gestion de la file d'attente
  clearQueue: () => void;
  pauseAnnouncements: () => void;
  resumeAnnouncements: () => void;
  isPaused: boolean;

  // Historique
  history: AnnouncementLog[];
  clearHistory: () => void;

  // État
  lastAnnouncement: string | null;
  announcementCount: number;
}

const DEFAULT_CLEAR_AFTER = 1000;
const MAX_HISTORY = 50;

export const useAccessibilityAnnouncement = (): UseAccessibilityAnnouncementReturn => {
  const [isPaused, setIsPaused] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string | null>(null);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [history, setHistory] = useState<AnnouncementLog[]>([]);

  const queueRef = useRef<Array<{ message: string; options: AnnouncementOptions }>>([]);
  const processingRef = useRef(false);
  const pausedRef = useRef(false);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // Créer la région live persistante
  useEffect(() => {
    // Créer les régions live persistantes pour polite et assertive
    const politeRegion = document.createElement('div');
    politeRegion.id = 'a11y-announcer-polite';
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'true');
    politeRegion.setAttribute('role', 'status');
    politeRegion.className = 'sr-only';
    politeRegion.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';

    const assertiveRegion = document.createElement('div');
    assertiveRegion.id = 'a11y-announcer-assertive';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.setAttribute('role', 'alert');
    assertiveRegion.className = 'sr-only';
    assertiveRegion.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';

    document.body.appendChild(politeRegion);
    document.body.appendChild(assertiveRegion);

    liveRegionRef.current = politeRegion;

    return () => {
      politeRegion.remove();
      assertiveRegion.remove();
    };
  }, []);

  // Ajouter à l'historique
  const addToHistory = useCallback((message: string, priority: AnnouncementPriority, type?: AnnouncementType) => {
    const log: AnnouncementLog = {
      id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      message,
      timestamp: new Date(),
      priority,
      type
    };

    setHistory(prev => [log, ...prev].slice(0, MAX_HISTORY));
  }, []);

  // Fonction d'annonce principale
  const announce = useCallback((message: string, options: AnnouncementOptions = {}) => {
    if (pausedRef.current || !message.trim()) return;

    const {
      priority = 'polite',
      type,
      delay = 0,
      clearAfter = DEFAULT_CLEAR_AFTER,
      atomic = true,
      relevant = 'additions'
    } = options;

    const doAnnounce = () => {
      const regionId = priority === 'assertive' ? 'a11y-announcer-assertive' : 'a11y-announcer-polite';
      const region = document.getElementById(regionId);

      if (region) {
        // Vider d'abord pour forcer la ré-annonce
        region.textContent = '';

        // Mettre à jour les attributs si nécessaire
        region.setAttribute('aria-atomic', atomic.toString());
        region.setAttribute('aria-relevant', relevant);

        // Petit délai pour permettre au lecteur d'écran de détecter le changement
        requestAnimationFrame(() => {
          region.textContent = message;
        });

        // Nettoyer après un délai
        setTimeout(() => {
          if (region.textContent === message) {
            region.textContent = '';
          }
        }, clearAfter);
      }

      // Mettre à jour l'état
      setLastAnnouncement(message);
      setAnnouncementCount(prev => prev + 1);
      addToHistory(message, priority, type);
    };

    if (delay > 0) {
      setTimeout(doAnnounce, delay);
    } else {
      doAnnounce();
    }
  }, [addToHistory]);

  // Raccourcis pour les priorités
  const announcePolite = useCallback((message: string) => {
    announce(message, { priority: 'polite' });
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, { priority: 'assertive' });
  }, [announce]);

  // Annonces contextuelles
  const announceNavigation = useCallback((location: string, details?: string) => {
    const message = details
      ? `Navigation vers ${location}. ${details}`
      : `Navigation vers ${location}`;
    announce(message, { priority: 'polite', type: 'status' });
  }, [announce]);

  const announceAction = useCallback((action: string, result: 'success' | 'error' | 'pending', details?: string) => {
    let message: string;
    let priority: AnnouncementPriority = 'polite';

    switch (result) {
      case 'success':
        message = `${action} réalisé avec succès${details ? `. ${details}` : ''}`;
        break;
      case 'error':
        message = `Erreur lors de ${action}${details ? `. ${details}` : ''}`;
        priority = 'assertive';
        break;
      case 'pending':
        message = `${action} en cours${details ? `. ${details}` : ''}`;
        break;
    }

    announce(message, { priority, type: result === 'error' ? 'alert' : 'status' });
  }, [announce]);

  const announceLoading = useCallback((isLoading: boolean, context?: string) => {
    const message = isLoading
      ? `Chargement ${context ? `de ${context}` : ''} en cours`
      : `Chargement ${context ? `de ${context}` : ''} terminé`;
    announce(message, { priority: 'polite', type: 'status' });
  }, [announce]);

  const announceProgress = useCallback((current: number, total: number, context?: string) => {
    const percentage = Math.round((current / total) * 100);
    const message = context
      ? `${context}: ${percentage}% complété (${current} sur ${total})`
      : `Progression: ${percentage}% (${current} sur ${total})`;
    announce(message, { priority: 'polite', type: 'log' });
  }, [announce]);

  const announceError = useCallback((error: string, recoverable = true) => {
    const message = recoverable
      ? `Erreur: ${error}. Veuillez réessayer.`
      : `Erreur critique: ${error}`;
    announce(message, { priority: 'assertive', type: 'alert' });
  }, [announce]);

  const announceFormValidation = useCallback((field: string, isValid: boolean, message?: string) => {
    const validationMessage = isValid
      ? `${field} est valide`
      : `${field} invalide${message ? `: ${message}` : ''}`;
    announce(validationMessage, {
      priority: isValid ? 'polite' : 'assertive',
      type: isValid ? 'status' : 'alert'
    });
  }, [announce]);

  const announceSelection = useCallback((item: string, selected: boolean, context?: string) => {
    const action = selected ? 'sélectionné' : 'désélectionné';
    const message = context
      ? `${item} ${action} dans ${context}`
      : `${item} ${action}`;
    announce(message, { priority: 'polite', type: 'status' });
  }, [announce]);

  const announceModal = useCallback((isOpen: boolean, title?: string) => {
    const message = isOpen
      ? `Fenêtre modale ${title ? `"${title}"` : ''} ouverte. Appuyez sur Échap pour fermer.`
      : `Fenêtre modale fermée`;
    announce(message, { priority: 'assertive', type: 'alert' });
  }, [announce]);

  const announceNotification = useCallback((type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const prefixes: Record<string, string> = {
      info: 'Information',
      success: 'Succès',
      warning: 'Attention',
      error: 'Erreur'
    };
    const fullMessage = `${prefixes[type]}: ${message}`;
    announce(fullMessage, {
      priority: type === 'error' || type === 'warning' ? 'assertive' : 'polite',
      type: type === 'error' ? 'alert' : 'status'
    });
  }, [announce]);

  const announceCountdown = useCallback((seconds: number) => {
    if (seconds <= 0) {
      announce('Temps écoulé', { priority: 'assertive', type: 'timer' });
    } else if (seconds <= 10) {
      announce(`${seconds} seconde${seconds > 1 ? 's' : ''} restante${seconds > 1 ? 's' : ''}`, {
        priority: 'polite',
        type: 'timer'
      });
    }
  }, [announce]);

  const announceListUpdate = useCallback((action: 'added' | 'removed' | 'updated', item: string, listName?: string) => {
    const actions: Record<string, string> = {
      added: 'ajouté à',
      removed: 'supprimé de',
      updated: 'mis à jour dans'
    };
    const message = listName
      ? `${item} ${actions[action]} ${listName}`
      : `${item} ${actions[action]} la liste`;
    announce(message, { priority: 'polite', type: 'status' });
  }, [announce]);

  // Gestion de la file d'attente
  const clearQueue = useCallback(() => {
    queueRef.current = [];
  }, []);

  const pauseAnnouncements = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
  }, []);

  const resumeAnnouncements = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    // Annonces de base
    announce,
    announcePolite,
    announceAssertive,

    // Annonces contextuelles
    announceNavigation,
    announceAction,
    announceLoading,
    announceProgress,
    announceError,
    announceFormValidation,
    announceSelection,
    announceModal,
    announceNotification,
    announceCountdown,
    announceListUpdate,

    // Gestion de la file d'attente
    clearQueue,
    pauseAnnouncements,
    resumeAnnouncements,
    isPaused,

    // Historique
    history,
    clearHistory,

    // État
    lastAnnouncement,
    announcementCount
  };
};

export default useAccessibilityAnnouncement;
