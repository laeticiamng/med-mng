import { useLocation } from 'react-router-dom';
import { SEOHead } from './SEOHead';
import { getRouteSEO } from '@/config/seoConfig';
import {
  createSoftwareApplicationSchema,
  createEducationalApplicationSchema,
  createOrganizationSchemaFull,
  createFAQPageSchema,
} from './jsonLdSchemas';

/**
 * AutoSEO - Composant qui applique automatiquement les meta tags SEO
 * basé sur la route courante. Placé une fois dans App.tsx.
 *
 * Inclut les JSON-LD globaux sur la page d'accueil.
 */
export const AutoSEO: React.FC = () => {
  const { pathname } = useLocation();
  const seo = getRouteSEO(pathname);

  // JSON-LD global uniquement sur la page d'accueil
  const isHome = pathname === '/';
  const structuredData = isHome
    ? [
        createOrganizationSchemaFull(),
        createSoftwareApplicationSchema(),
        createEducationalApplicationSchema(),
        createFAQPageSchema(),
      ]
    : undefined;

  return (
    <SEOHead
      title={seo.title}
      description={seo.description}
      keywords={seo.keywords}
      canonical={seo.canonical}
      ogType={seo.ogType}
      noindex={seo.noindex}
      structuredData={structuredData ? structuredData[0] : undefined}
    />
  );
};
