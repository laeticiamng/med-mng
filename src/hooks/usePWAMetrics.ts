import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef, useState } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

// Sequential counter for deterministic session IDs
let sessionCounter = 0;

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
  const pageViewsRef = useRef(0);
  const hasTrackedInitialView = useRef(false);

  // Générer un ID de session unique avec crypto.randomUUID
  useEffect(() => {
    sessionIdRef.current = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? `session_${crypto.randomUUID()}`
      : `session_${Date.now()}_${(++sessionCounter).toString(36).padStart(6, '0')}`;
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

  // Tracker les page views - using refs declared at top to avoid infinite loop
  useEffect(() => {
    const handlePageView = () => {
      pageViewsRef.current += 1;
      setMetrics(prev => ({ ...prev, pageViews: pageViewsRef.current }));
      sendMetricUpdate({ page_views: pageViewsRef.current });
    };

    // Initial page view - only once
    if (!hasTrackedInitialView.current) {
      hasTrackedInitialView.current = true;
      handlePageView();
    }

    // Listen to route changes
    window.addEventListener('popstate', handlePageView);
    
    return () => {
      window.removeEventListener('popstate', handlePageView);
    };
  }, []); // Empty deps - no infinite loop

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
  const sendMetricUpdate = async (data: any, _immediate = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Collecter les infos du device
      const deviceInfo = {
        device_type: getDeviceType(),
        browser: getBrowser(),
      };

      const payload = {
        user_id: user?.id || null,
        session_id: sessionIdRef.current,
        is_installed: metrics.isInstalled,
        is_offline: metrics.isOffline,
        page_views: metrics.pageViews,
        ...deviceInfo,
        ...data,
      };

      // Envoyer les métriques
      try {
        await supabase.from('pwa_metrics').upsert(payload, {
          onConflict: 'session_id',
        });
      } catch (err) {
        // Silencieux pour ne pas bloquer l'app
      }
    } catch (error) {
      // Silencieux pour ne pas perturber l'expérience utilisateur
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
