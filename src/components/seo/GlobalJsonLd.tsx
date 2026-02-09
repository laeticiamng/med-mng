import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  createSoftwareApplicationSchema,
  createEducationalApplicationSchema,
  createOrganizationSchemaFull,
  createFAQPageSchema,
} from './jsonLdSchemas';

/**
 * GlobalJsonLd - Injecte les JSON-LD globaux dans le <head>
 *
 * Inclut :
 * - Organization (toutes les pages)
 * - SoftwareApplication (page d'accueil)
 * - EducationalApplication (page d'accueil)
 * - FAQPage (page d'accueil et pricing)
 */
export const GlobalJsonLd: React.FC = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const isPricing = pathname === '/med-mng/pricing';

  return (
    <Helmet>
      {/* Organization - toujours présent */}
      <script type="application/ld+json">
        {JSON.stringify(createOrganizationSchemaFull())}
      </script>

      {/* SoftwareApplication - page d'accueil */}
      {isHome && (
        <script type="application/ld+json">
          {JSON.stringify(createSoftwareApplicationSchema())}
        </script>
      )}

      {/* EducationalApplication - page d'accueil */}
      {isHome && (
        <script type="application/ld+json">
          {JSON.stringify(createEducationalApplicationSchema())}
        </script>
      )}

      {/* FAQPage - accueil et pricing */}
      {(isHome || isPricing) && (
        <script type="application/ld+json">
          {JSON.stringify(createFAQPageSchema())}
        </script>
      )}
    </Helmet>
  );
};
