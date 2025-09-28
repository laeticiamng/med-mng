// Polyfill pour le lazy loading des images sur les navigateurs plus anciens

let observer;

// Configuration par défaut
const defaultConfig = {
  rootMargin: '50px 0px',
  threshold: 0.01
};

// Fonction pour charger une image
const loadImage = (img) => {
  return new Promise((resolve, reject) => {
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Remplacer le src de l'image originale
      img.src = img.dataset.src;
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      
      // Supprimer les attributs de données
      delete img.dataset.src;
      
      resolve(img);
    };
    
    imageLoader.onerror = () => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
      reject(new Error(`Failed to load image: ${img.dataset.src}`));
    };
    
    // Démarrer le chargement
    imageLoader.src = img.dataset.src;
  });
};

// Callback pour l'intersection observer
const handleIntersection = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      
      // Ajouter la classe de loading
      img.classList.add('lazy-loading');
      
      // Charger l'image
      loadImage(img).catch(error => {
        console.warn('Lazy loading error:', error);
      });
      
      // Arrêter d'observer cette image
      observer.unobserve(img);
    }
  });
};

// Initialiser le lazy loading
export const initLazyLoading = (config = defaultConfig) => {
  // Vérifier le support d'IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    // Fallback: charger toutes les images immédiatement
    console.warn('IntersectionObserver not supported, loading all images');
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      loadImage(img).catch(console.warn);
    });
    return;
  }

  // Créer l'observer
  observer = new IntersectionObserver(handleIntersection, config);
  
  // Observer toutes les images lazy
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => {
    // Ajouter un placeholder si pas de src
    if (!img.src) {
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
    
    observer.observe(img);
  });
  
  console.log(`Lazy loading initialized for ${lazyImages.length} images`);
};

// Fonction pour ajouter une nouvelle image au lazy loading
export const addLazyImage = (img) => {
  if (observer && img.dataset.src) {
    observer.observe(img);
  }
};

// Fonction pour supprimer une image du lazy loading
export const removeLazyImage = (img) => {
  if (observer) {
    observer.unobserve(img);
  }
};

// Nettoyer les observers
export const cleanupLazyLoading = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

// Hook React pour le lazy loading
export const useLazyLoading = () => {
  const addImage = (ref) => {
    if (ref.current && ref.current.dataset.src) {
      addLazyImage(ref.current);
    }
  };
  
  const removeImage = (ref) => {
    if (ref.current) {
      removeLazyImage(ref.current);
    }
  };
  
  return { addImage, removeImage };
};

// Utilitaire pour créer des placeholders d'images
export const createImagePlaceholder = (width, height, color = '#f0f0f0') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
};

// CSS pour les états de loading
export const lazyLoadingCSS = `
  .lazy-loading {
    opacity: 0.5;
    filter: blur(2px);
    transition: opacity 0.3s ease, filter 0.3s ease;
  }
  
  .lazy-loaded {
    opacity: 1;
    filter: blur(0);
  }
  
  .lazy-error {
    opacity: 0.3;
    background-color: #f5f5f5;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
  }
`;

// Injecter le CSS si nécessaire
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = lazyLoadingCSS;
  document.head.appendChild(style);
}