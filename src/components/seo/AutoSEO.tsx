import { useLocation } from 'react-router-dom';
import { SEOHead } from './SEOHead';
import { getRouteSEO } from '@/config/seoConfig';

/**
 * AutoSEO - Composant qui applique automatiquement les meta tags SEO
 * basé sur la route courante. Placé une fois dans App.tsx.
 *
 * Note : Les JSON-LD globaux sont gérés par GlobalJsonLd (pas ici)
 * pour éviter les doublons.
 */
export const AutoSEO: React.FC = () => {
  const { pathname } = useLocation();
  const seo = getRouteSEO(pathname);

  return (
    <SEOHead
      title={seo.title}
      description={seo.description}
      keywords={seo.keywords}
      canonical={seo.canonical}
      ogType={seo.ogType}
      noindex={seo.noindex}
    />
  );
};
