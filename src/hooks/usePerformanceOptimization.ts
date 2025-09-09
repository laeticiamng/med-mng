import { useEffect, useCallback } from 'react';

// Hook pour optimisations de performance avancées
export const usePerformanceOptimization = () => {
  
  // Préchargement intelligent des ressources critiques
  const preloadCriticalResources = useCallback(() => {
    // Précharger les routes principales
    const criticalRoutes = ['/med-mng/dashboard', '/med-mng/create', '/platform'];
    
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });

    // Précharger les fonts critiques
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    fontPreload.as = 'style';
    document.head.appendChild(fontPreload);

    // Précharger les composants lazy
    import('@/components/home/FeatureShowcase').catch(() => {});
    import('@/components/home/TestimonialCarousel').catch(() => {});
  }, []);

  // Optimisation des images avec Intersection Observer
  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    images.forEach(img => imageObserver.observe(img));
    
    return () => images.forEach(img => imageObserver.unobserve(img));
  }, []);

  // Optimisation GPU et animations
  const enableGPUAcceleration = useCallback(() => {
    const animatedElements = document.querySelectorAll('.animate-gentle-float, .animate-shimmer-medical');
    
    animatedElements.forEach(el => {
      (el as HTMLElement).style.willChange = 'transform';
      (el as HTMLElement).style.transform = 'translateZ(0)'; // Force GPU layer
    });
  }, []);

  // Monitoring des Core Web Vitals
  const monitorWebVitals = useCallback(() => {
    if ('web-vital' in window) return;

    // Mesurer LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Mesurer CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      console.log('CLS:', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Mesurer FID (First Input Delay)
    const fidObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const fidEntry = entry as any; // PerformanceEventTiming
        if (fidEntry.processingStart) {
          console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
        }
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  }, []);

  // Service Worker pour mise en cache avancée
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Mise à jour automatique
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouvelle version disponible
                if (confirm('Une nouvelle version est disponible. Actualiser ?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Exécuter les optimisations de manière séquentielle
    const runOptimizations = async () => {
      preloadCriticalResources();
      enableGPUAcceleration();
      
      // Délai pour éviter de bloquer le thread principal
      await new Promise(resolve => setTimeout(resolve, 100));
      
      optimizeImages();
      monitorWebVitals();
      
      // Service Worker en dernier
      await registerServiceWorker();
    };

    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runOptimizations);
    } else {
      runOptimizations();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', runOptimizations);
    };
  }, [preloadCriticalResources, optimizeImages, enableGPUAcceleration, monitorWebVitals, registerServiceWorker]);

  return {
    preloadCriticalResources,
    optimizeImages,
    enableGPUAcceleration,
    monitorWebVitals
  };
};