import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * NavigatorBridge - Pont entre React Router et l'API Navigator
 * 
 * Ce composant permet de synchroniser la navigation React Router
 * avec les événements natifs de navigation du navigateur,
 * améliorant l'accessibilité et l'intégration système.
 */
const NavigatorBridge = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Mettre à jour le titre de la page selon la route
    const updatePageTitle = () => {
      const routeTitles: Record<string, string> = {
        '/': 'MED-MNG - Accueil',
        '/platform': 'Plateforme - MED-MNG',
        '/generator': 'Générateur Musical - MED-MNG',
        '/edn': 'EDN Complete - MED-MNG',
        '/ecos': 'ECOS Scenarios - MED-MNG',
        '/chat': 'Chat IA Médical - MED-MNG',
        '/med-mng/dashboard': 'Tableau de bord - MED-MNG',
        '/med-mng/create': 'Créer - MED-MNG',
        '/med-mng/library': 'Bibliothèque - MED-MNG',
        '/med-mng/profile': 'Profil - MED-MNG',
      };

      const title = routeTitles[location.pathname] || 'MED-MNG';
      document.title = title;
    };

    updatePageTitle();

    // Gérer les événements de navigation du navigateur
    const handlePopState = (event: PopStateEvent) => {
      // Synchroniser avec l'état de React Router si nécessaire
      if (event.state && event.state.path !== location.pathname) {
        navigate(event.state.path, { replace: true });
      }
    };

    // Mettre à jour l'historique du navigateur avec des métadonnées
    const updateBrowserHistory = () => {
      if (window.history.replaceState) {
        window.history.replaceState(
          { 
            path: location.pathname,
            timestamp: Date.now(),
            source: 'med-mng'
          },
          document.title,
          location.pathname + location.search
        );
      }
    };

    updateBrowserHistory();

    // Écouter les événements de navigation
    window.addEventListener('popstate', handlePopState);

    // Optimisation SEO - Meta tags dynamiques selon la route
    const updateMetaTags = () => {
      const metaDescriptions: Record<string, string> = {
        '/': 'Plateforme d\'apprentissage médical révolutionnaire avec génération musicale IA',
        '/platform': 'Découvrez toutes les fonctionnalités de MED-MNG pour révolutionner votre apprentissage médical',
        '/generator': 'Créez des chansons personnalisées à partir de vos cours de médecine avec l\'IA',
        '/edn': 'Accédez à tous les items EDN dans une interface moderne et interactive',
        '/ecos': 'Explorez les scénarios ECOS pour préparer vos examens pratiques',
        '/chat': 'Posez vos questions médicales à notre IA spécialisée avec sources automatiques'
      };

      const description = metaDescriptions[location.pathname] || 
        'MED-MNG - Apprentissage médical par la musique avec intelligence artificielle';

      // Mettre à jour ou créer la meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      // Mettre à jour les Open Graph tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', document.title);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', description);

      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', window.location.href);
    };

    updateMetaTags();

    // Nettoyage
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, location.search, navigate]);

  // Gestion des raccourcis clavier globaux
  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      // Alt + H : Accueil
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        navigate('/');
      }
      
      // Alt + G : Générateur
      if (event.altKey && event.key === 'g') {
        event.preventDefault();
        navigate('/generator');
      }
      
      // Alt + C : Chat
      if (event.altKey && event.key === 'c') {
        event.preventDefault();
        navigate('/chat');
      }
      
      // Alt + D : Dashboard (si connecté)
      if (event.altKey && event.key === 'd') {
        event.preventDefault();
        navigate('/med-mng/dashboard');
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [navigate]);

  // Analytics et tracking de navigation
  useEffect(() => {
    // Simuler un événement de page vue pour analytics
    const trackPageView = () => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: location.pathname + location.search
        });
      }
      
      // Event personnalisé pour tracking interne
      window.dispatchEvent(new CustomEvent('med-mng:page-view', {
        detail: {
          path: location.pathname,
          title: document.title,
          timestamp: Date.now()
        }
      }));
    };

    // Petit délai pour permettre au DOM de se mettre à jour
    const timeoutId = setTimeout(trackPageView, 100);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, location.search]);

  // Ce composant ne rend rien - il ne fait que des effets de bord
  return null;
};

export default NavigatorBridge;