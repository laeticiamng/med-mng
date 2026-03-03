import { forwardRef } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEOHead - Composant réutilisable pour le SEO
 * 
 * Wrapped with forwardRef to prevent warnings when React Router
 * or other wrappers pass refs to route components.
 */

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: object;
  noindex?: boolean;
}

export const SEOHead = forwardRef<HTMLDivElement, SEOHeadProps>(({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage,
  twitterCard = 'summary_large_image',
  structuredData,
  noindex = false,
}, _ref) => {
  const siteUrl = 'https://med-mng.lovable.app';
  const fullTitle = `${title} - MED-MNG`;
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : undefined;
  const defaultImage = `${siteUrl}/og-image.png`;

  return (
    <Helmet>
      {/* Essential Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={fullCanonical} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical || siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:site_name" content="MED-MNG" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={fullCanonical || siteUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="MED-MNG" />

      {/* Structured Data (Schema.org) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
});

SEOHead.displayName = 'SEOHead';

/**
 * Exemples d'utilisation:
 * 
 * ```tsx
 * // Page simple
 * <SEOHead
 *   title="Tableau de bord"
 *   description="Gérez vos révisions médicales avec notre tableau de bord intelligent"
 *   keywords="médecine, EDN, révisions, dashboard"
 *   canonical="/dashboard"
 * />
 * 
 * // Article avec structured data
 * <SEOHead
 *   title="Item EDN 123 - Cardiologie"
 *   description="Cours complet sur la cardiologie..."
 *   ogType="article"
 *   structuredData={{
 *     "@context": "https://schema.org",
 *     "@type": "Article",
 *     "headline": "Item EDN 123 - Cardiologie",
 *     "author": {
 *       "@type": "Organization",
 *       "name": "MED-MNG"
 *     },
 *     "datePublished": "2024-01-01",
 *   }}
 * />
 * ```
 */

/**
 * Structured Data Helpers
 */

export const createOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MED-MNG',
  url: 'https://med-mng.lovable.app',
  logo: 'https://med-mng.lovable.app/logo.png',
  description: 'Plateforme d\'apprentissage médical innovante',
  sameAs: [
    // Ajouter les réseaux sociaux si disponibles
  ],
});

export const createWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MED-MNG',
  url: 'https://med-mng.lovable.app',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://med-mng.lovable.app/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
});

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `https://med-mng.lovable.app${item.url}`,
  })),
});
