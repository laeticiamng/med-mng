import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

interface PWAMetrics {
  sessionId: string;
  isInstalled: boolean;
  isOffline: boolean;
  pageViews: number;
  sessionStart: number;
}

/**
 * Hook pour tracker les métriques PWA
 * - Core Web Vitals (FCP, LCP, FID, CLS, TTFB, INP)
 * - Installation PWA
 * - Utilisation offline
 * - Session et page views
 */
export const usePWAMetrics = () => {
  const [metrics, setMetrics] = useState<PWAMetrics>({
    sessionId: '',
    isInstalled: false,
    isOffline: false,
    pageViews: 0,
    sessionStart: Date.now(),
  });

  const metricsRef = useRef<any>({});
  const sessionIdRef = useRef<string>('');

  // Générer un ID de session unique
  useEffect(() => {
    sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setMetrics(prev => ({ ...prev, sessionId: sessionIdRef.current }));
  }, []);

  // Détecter si l'app est installée
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isInstalled = isStandalone || isFullscreen || 
                         (window.navigator as any).standalone === true;
      
      setMetrics(prev => ({ ...prev, isInstalled }));
      return isInstalled;
    };

    checkInstalled();

    // Écouter l'événement d'installation
    window.addEventListener('appinstalled', () => {
      setMetrics(prev => ({ ...prev, isInstalled: true }));
      sendMetricUpdate({ is_installed: true, install_date: new Date().toISOString() });
    });
  }, []);

  // Détecter le mode offline
  useEffect(() => {
    const updateOnlineStatus = () => {
      const isOffline = !navigator.onLine;
      setMetrics(prev => ({ ...prev, isOffline }));
      sendMetricUpdate({ is_offline: isOffline });
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Tracker les Core Web Vitals
  useEffect(() => {
    onCLS((metric) => {
      metricsRef.current.cls = metric.value;
      sendMetricUpdate({ cls: metric.value });
    });

    onFCP((metric) => {
      metricsRef.current.fcp = metric.value;
      sendMetricUpdate({ fcp: metric.value });
    });

    onLCP((metric) => {
      metricsRef.current.lcp = metric.value;
      sendMetricUpdate({ lcp: metric.value });
    });

    onTTFB((metric) => {
      metricsRef.current.ttfb = metric.value;
      sendMetricUpdate({ ttfb: metric.value });
    });

    onINP((metric) => {
      metricsRef.current.inp = metric.value;
      sendMetricUpdate({ inp: metric.value });
    });
  }, []);

  // Tracker les page views
  useEffect(() => {
    const handlePageView = () => {
      setMetrics(prev => ({ ...prev, pageViews: prev.pageViews + 1 }));
      sendMetricUpdate({ page_views: metrics.pageViews + 1 });
    };

    // Initial page view
    handlePageView();

    // Listen to route changes
    window.addEventListener('popstate', handlePageView);
    
    return () => {
      window.removeEventListener('popstate', handlePageView);
    };
  }, [metrics.pageViews]);

  // Envoyer la durée de session avant fermeture
  useEffect(() => {
    const sendSessionDuration = () => {
      const duration = Math.floor((Date.now() - metrics.sessionStart) / 1000);
      sendMetricUpdate({ session_duration: duration }, true);
    };

    window.addEventListener('beforeunload', sendSessionDuration);
    
    return () => {
      window.removeEventListener('beforeunload', sendSessionDuration);
      sendSessionDuration();
    };
  }, [metrics.sessionStart]);

  // Fonction pour envoyer les métriques à Supabase
  const sendMetricUpdate = async (data: any, immediate = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Collecter les infos du device
      const deviceInfo = {
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        screen_width: window.screen.width,
        screen_height: window.screen.height,
      };

      const payload = {
        user_id: user.id,
        session_id: sessionIdRef.current,
        ...deviceInfo,
        ...data,
      };

      // Envoyer les métriques (ignoré en cas d'erreur pour ne pas bloquer l'app)
      if (!immediate) {
        try {
          await supabase.from('pwa_metrics' as any).upsert(payload, {
            onConflict: 'session_id',
          });
        } catch (err) {
          console.debug('Metrics error:', err);
        }
      }
    } catch (error) {
      // Silencieux pour ne pas perturber l'expérience utilisateur
      console.debug('Error sending PWA metrics:', error);
    }
  };

  return { metrics, sendMetricUpdate };
};

// Helper functions
function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
}
