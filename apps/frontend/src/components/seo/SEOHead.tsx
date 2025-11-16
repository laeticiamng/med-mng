import { Helmet } from 'react-helmet-async';

/**
 * SEOHead - Composant réutilisable pour le SEO
 * 
 * Inclut automatiquement:
 * - Meta tags essentiels
 * - Open Graph pour réseaux sociaux
 * - Twitter Cards
 * - Structured data (Schema.org)
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

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage,
  twitterCard = 'summary_large_image',
  structuredData,
  noindex = false,
}) => {
  const siteUrl = 'https://med-mng.lovable.app';
  const fullTitle = `${title} - MED-MNG`;
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : undefined;
  const defaultImage = `${siteUrl}/og-image.jpg`;
  const fullOgImage = ogImage || defaultImage;

  return (
    <Helmet>
      {/* Essential Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={fullCanonical} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Viewport & Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Open Graph / Facebook - Complete Implementation */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical || siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:secure_url" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${title} - MED-MNG`} />
      <meta property="og:site_name" content="MED-MNG" />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Card - Complete Implementation */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@MEDMNG" />
      <meta name="twitter:creator" content="@MEDMNG" />
      <meta name="twitter:url" content={fullCanonical || siteUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={`${title} - MED-MNG`} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#5BA3F5" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="MED-MNG" />
      <meta name="application-name" content="MED-MNG" />
      <meta name="msapplication-TileColor" content="#5BA3F5" />
      
      {/* Author & Copyright */}
      <meta name="author" content="MED-MNG" />
      <meta name="copyright" content="MED-MNG © 2025" />

      {/* Structured Data (Schema.org) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

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
