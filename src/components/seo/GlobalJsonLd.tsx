import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  createSoftwareApplicationSchema,
  createEducationalApplicationSchema,
  createOrganizationSchemaFull,
  createFAQPageSchema,
  createProductSchema,
} from './jsonLdSchemas';
import {
  createSpeakableSchema,
  createHowToSchema,
  createDefinedTermSchema,
  createDatasetSchema,
  createGEOFAQSchema,
  createExpertiseSchema,
} from './geoSchemas';

/**
 * GlobalJsonLd - Injecte les JSON-LD globaux dans le <head>
 *
 * SEO classique + GEO (Generative Engine Optimization)
 * Optimisé pour Google ET les moteurs IA (ChatGPT, Perplexity, Claude)
 */
export const GlobalJsonLd: React.FC = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const isPricing = pathname === '/med-mng/pricing';
  const isEDN = pathname.startsWith('/edn');

  return (
    <Helmet>
      {/* === SEO CLASSIQUE === */}

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

      {/* Product - page pricing */}
      {isPricing && (
        <script type="application/ld+json">
          {JSON.stringify(createProductSchema())}
        </script>
      )}

      {/* === GEO - OPTIMISATION MOTEURS GÉNÉRATIFS === */}

      {/* Speakable - Indique aux IA quel contenu citer (accueil) */}
      {isHome && (
        <script type="application/ld+json">
          {JSON.stringify(createSpeakableSchema())}
        </script>
      )}

      {/* HowTo - Méthodologie unique citable (accueil + EDN) */}
      {(isHome || isEDN) && (
        <script type="application/ld+json">
          {JSON.stringify(createHowToSchema())}
        </script>
      )}

      {/* DefinedTerm - Concept MNG comme référence (accueil) */}
      {isHome && (
        <script type="application/ld+json">
          {JSON.stringify(createDefinedTermSchema())}
        </script>
      )}

      {/* Dataset - Base EDN comme source de données (EDN) */}
      {(isHome || isEDN) && (
        <script type="application/ld+json">
          {JSON.stringify(createDatasetSchema())}
        </script>
      )}

      {/* FAQ GEO - Questions conversationnelles IA (accueil + pricing) */}
      {(isHome || isPricing) && (
        <script type="application/ld+json">
          {JSON.stringify(createGEOFAQSchema())}
        </script>
      )}

      {/* Expertise - Signaux E-E-A-T pour les IA (toujours) */}
      <script type="application/ld+json">
        {JSON.stringify(createExpertiseSchema())}
      </script>
    </Helmet>
  );
};
