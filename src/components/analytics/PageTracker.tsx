import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '@/services/analyticsService';
import { useAuth } from '@/components/med-mng/AuthProvider';

/**
 * Interface pour les métriques de page
 */
interface PageMetrics {
  pageName: string;
  startTime: number;
  scrollDepth: number;
  isActive: boolean;
}

/**
 * PageTracker Component
 *
 * Composant automatique de tracking qui doit être placé une fois
 * dans le layout principal (App.tsx).
 *
 * Responsabilités:
 * - Track page views (automatiquement)
 * - Mesurer le temps passé sur chaque page
 * - Tracker la profondeur de scroll
 * - Détacher les utilisateurs à la sortie
 * - Intégrer l'ID utilisateur automatiquement
 *
 * @example
 * // Use in App.tsx root
 * <PageTracker />
 *
 * Metrics tracked:
 * - page_view (entry)
 * - page_exit (leave)
 * - time_on_page (duration in seconds)
 * - scroll_depth (percentage 0-100)
 */
export const PageTracker: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const metricsRef = useRef<PageMetrics>({
    pageName: location.pathname,
    startTime: Date.now(),
    scrollDepth: 0,
    isActive: true,
  });

  // Set user ID whenever it changes
  useEffect(() => {
    if (user?.id) {
      analyticsService.setUserId(user.id);
    }
  }, [user?.id]);

  /**
   * Track page view on route change
   */
  useEffect(() => {
    const currentMetrics = metricsRef.current;

    // Track exit from previous page
    if (currentMetrics.isActive) {
      const timeOnPage = Math.round((Date.now() - currentMetrics.startTime) / 1000);

      analyticsService.trackEvent('page_exit', {
        pageName: currentMetrics.pageName,
        timeOnPageSeconds: timeOnPage,
        scrollDepth: currentMetrics.scrollDepth,
      });
    }

    // Reset for new page
    const newPageName = location.pathname;
    metricsRef.current = {
      pageName: newPageName,
      startTime: Date.now(),
      scrollDepth: 0,
      isActive: true,
    };

    // Track page view entry
    analyticsService.trackPageView(newPageName);
  }, [location.pathname]);

  /**
   * Track scroll depth
   */
  useEffect(() => {
    const handleScroll = () => {
      if (!metricsRef.current.isActive) return;

      // Calculer la profondeur de scroll
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset;

      // Calculer le pourcentage scrollé (0-100)
      const totalScroll = documentHeight - windowHeight;
      const scrollDepth =
        totalScroll > 0
          ? Math.round((scrollTop / totalScroll) * 100)
          : 0;

      // Update metric tous les 25% de scroll
      const currentDepth = metricsRef.current.scrollDepth;
      if (
        scrollDepth >= currentDepth + 25 ||
        scrollDepth === 100
      ) {
        metricsRef.current.scrollDepth = scrollDepth;

        // Track milestone
        analyticsService.trackEvent('scroll_depth_milestone', {
          pageName: metricsRef.current.pageName,
          scrollDepth,
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Track page visibility changes (tab focus/blur)
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';

      if (isVisible && !metricsRef.current.isActive) {
        // User returned to tab
        metricsRef.current.isActive = true;
        metricsRef.current.startTime = Date.now();

        analyticsService.trackEvent('page_visibility_change', {
          pageName: metricsRef.current.pageName,
          isVisible: true,
        });
      } else if (!isVisible && metricsRef.current.isActive) {
        // User left tab
        metricsRef.current.isActive = false;

        analyticsService.trackEvent('page_visibility_change', {
          pageName: metricsRef.current.pageName,
          isVisible: false,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  /**
   * Track page unload (user leaving site)
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round(
        (Date.now() - metricsRef.current.startTime) / 1000
      );

      // Use sendBeacon for reliability (won't be blocked by unload)
      const data = new FormData();
      data.append('event', 'page_unload');
      data.append('pageName', metricsRef.current.pageName);
      data.append('timeOnPageSeconds', timeOnPage.toString());
      data.append('scrollDepth', metricsRef.current.scrollDepth.toString());

      // Try to flush analytics queue
      analyticsService.flush().catch(() => {
        // Silently fail - user is leaving anyway
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  /**
   * Track user interactions (clicks, form submissions)
   */
  useEffect(() => {
    const handleInteraction = (event: Event) => {
      if (!(event.target instanceof HTMLElement)) return;

      const target = event.target;

      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        const buttonText = (button as HTMLElement)?.textContent?.trim().slice(0, 50);

        analyticsService.trackEvent('button_clicked', {
          pageName: metricsRef.current.pageName,
          buttonText,
          buttonId: (button as HTMLElement)?.id,
        });
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target : target.closest('a');
        const href = (link as HTMLAnchorElement)?.href;
        const text = (link as HTMLElement)?.textContent?.trim().slice(0, 50);

        // Don't track internal navigation (handled by route change)
        if (href && !href.includes(window.location.origin)) {
          analyticsService.trackEvent('external_link_clicked', {
            pageName: metricsRef.current.pageName,
            linkText: text,
            linkHref: href,
          });
        }
      }

      // Track form submissions
      if (target.tagName === 'FORM' || target.closest('form')) {
        const form = target.tagName === 'FORM' ? target : target.closest('form');
        const formId = (form as HTMLElement)?.id;
        const formName = (form as HTMLFormElement)?.name;

        analyticsService.trackEvent('form_submitted', {
          pageName: metricsRef.current.pageName,
          formId,
          formName,
        });
      }
    };

    // Use capture phase for more reliable tracking
    document.addEventListener('click', handleInteraction as EventListener, true);
    document.addEventListener('submit', handleInteraction as EventListener, true);

    return () => {
      document.removeEventListener('click', handleInteraction as EventListener, true);
      document.removeEventListener('submit', handleInteraction as EventListener, true);
    };
  }, []);

  /**
   * Track Web Vitals (optional - can be extended)
   */
  useEffect(() => {
    // Check if browser supports PerformanceObserver
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];

          analyticsService.trackPerformanceMetric('LCP', lastEntry.renderTime || lastEntry.loadTime, {
            pageName: metricsRef.current.pageName,
          });
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        return () => lcpObserver.disconnect();
      } catch (error) {
        console.debug('Failed to track Web Vitals:', error);
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
};

PageTracker.displayName = 'PageTracker';

export default PageTracker;
