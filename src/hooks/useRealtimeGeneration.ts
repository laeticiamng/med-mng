/**
 * Hook pour les mises à jour en temps réel des générations musicales
 * Gère les subscriptions Supabase realtime de manière robuste
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeGenerationOptions {
  userId: string | undefined;
  onNewTrack?: (track: any) => void;
  onTrackUpdated?: (track: any) => void;
  onGenerationComplete?: (track: any) => void;
  enabled?: boolean;
}

export const useRealtimeGeneration = ({
  userId,
  onNewTrack,
  onTrackUpdated,
  onGenerationComplete,
  enabled = true
}: RealtimeGenerationOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const connexionsRef = useRef(0);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!userId || !enabled) {
      cleanup();
      return;
    }

    // Cleanup previous connection
    cleanup();

    // Nom unique à chaque connexion : supabase.channel() renvoie le canal existant
    // si le nom est déjà pris, et y ajouter des écouteurs après subscribe() lève
    // une exception qui faisait tomber toute la page Create (réseau qui bloque les
    // WebSocket : proxy d'hôpital, reconnexions rapprochées). Le temps réel n'est
    // qu'un confort (le suivi par interrogation prend le relais) : il ne doit
    // jamais casser la page.
    connexionsRef.current += 1;
    const channelName = `generation-realtime-${userId}-${Date.now()}-${connexionsRef.current}-${Math.random().toString(36).slice(2, 8)}`;

    let channel: ReturnType<typeof supabase.channel>;
    try {
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'generated_music_tracks',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (import.meta.env.DEV) console.log('🎵 Nouveau track reçu:', payload.new);
          onNewTrack?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generated_music_tracks',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (import.meta.env.DEV) console.log('📝 Track mis à jour:', payload.new);
          onTrackUpdated?.(payload.new);
          
          // Notifier si génération terminée
          const track = payload.new as any;
          if (track.generation_status === 'completed' && track.audio_url) {
            onGenerationComplete?.(track);
            toast.success('🎵 Nouvelle musique disponible !', {
              description: track.title || 'Votre musique est prête',
              action: {
                label: 'Écouter',
                onClick: () => {
                  // L'action sera gérée par le composant parent
                }
              }
            });
          } else if (track.generation_status === 'failed') {
            toast.error('❌ Génération échouée', {
              description: track.metadata?.error || 'Une erreur est survenue'
            });
          }
        }
      )
      .subscribe((status) => {
        if (import.meta.env.DEV) console.log(`📡 Realtime status (${channelName}):`, status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setConnectionError(null);
          reconnectAttemptsRef.current = 0;
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setConnectionError('Erreur de connexion realtime');
          
          // Tenter une reconnexion
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            reconnectTimeoutRef.current = setTimeout(() => {
              if (import.meta.env.DEV) console.log(`🔄 Tentative de reconnexion ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);
              connect();
            }, RECONNECT_DELAY * reconnectAttemptsRef.current);
          }
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          setConnectionError('Connexion expirée');
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });
    } catch (erreur) {
      console.warn('Temps réel indisponible, suivi par interrogation seulement :', erreur);
      setIsConnected(false);
      setConnectionError('Temps réel indisponible');
      return;
    }

    channelRef.current = channel;
  }, [userId, enabled, cleanup, onNewTrack, onTrackUpdated, onGenerationComplete]);

  // Forcer une reconnexion
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Connecter/déconnecter basé sur userId et enabled
  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);

  // Reconnexion automatique quand l'app devient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && enabled && userId) {
        if (import.meta.env.DEV) console.log('👁️ App redevient visible, reconnexion...');
        reconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected, enabled, userId, reconnect]);

  // Reconnexion sur retour en ligne
  useEffect(() => {
    const handleOnline = () => {
      if (!isConnected && enabled && userId) {
        if (import.meta.env.DEV) console.log('🌐 Retour en ligne, reconnexion...');
        reconnect();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isConnected, enabled, userId, reconnect]);

  return {
    isConnected,
    connectionError,
    reconnect
  };
};
