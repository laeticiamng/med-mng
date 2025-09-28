import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import OptimizedApp from './components/optimized/OptimizedApp';
import './index.css';

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Web Vitals monitoring
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}

// Error boundary global
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Performance observer pour surveiller les métriques
if ('PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime);
        }
      });
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
  } catch (e) {
    console.warn('Performance Observer not fully supported');
  }
}

// Préchargement critique des ressources
const preloadCriticalResources = () => {
  // Précharger les polices importantes
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.as = 'font';
  fontPreload.type = 'font/woff2';
  fontPreload.crossOrigin = 'anonymous';
  document.head.appendChild(fontPreload);
};

// Optimisation des images lazy loading
if ('loading' in HTMLImageElement.prototype) {
  // Browser supporte le lazy loading natif
  document.documentElement.classList.add('native-lazy-loading');
} else {
  // Fallback pour les navigateurs plus anciens
  import('./utils/lazyLoadingPolyfill').then(({ initLazyLoading }) => {
    initLazyLoading();
  });
}

// Service Worker registration pour PWA
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Initialize app
const container = document.getElementById('root');
const root = createRoot(container);

// Préchargement des ressources critiques
preloadCriticalResources();

// Render de l'application avec gestion d'erreur
try {
  root.render(
    <StrictMode>
      <OptimizedApp />
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  
  // Fallback UI simple en cas d'erreur critique
  root.render(
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1>Erreur de chargement</h1>
      <p>Une erreur est survenue lors du chargement de l'application.</p>
      <button 
        onClick={() => window.location.reload()} 
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Recharger la page
      </button>
    </div>
  );
}