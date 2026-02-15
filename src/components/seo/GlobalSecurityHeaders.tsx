/**
 * En-têtes de sécurité globaux pour toutes les pages
 * Optimisé SEO + Sécurité Grade A
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SUPABASE_URL } from '@/lib/supabaseConstants';

interface GlobalSecurityHeadersProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: object;
}

export const GlobalSecurityHeaders: React.FC<GlobalSecurityHeadersProps> = ({
  title,
  description,
  canonical,
  ogImage = '/og-image.png',
  noIndex = false,
  structuredData
}) => {
  const siteUrl = 'https://med-mng.lovable.app';
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const fullTitle = title.includes('MED-MNG') ? title : `${title} | MED-MNG`;

  // CSP stricte pour grade A sécurité
  const wssUrl = SUPABASE_URL.replace('https://', 'wss://');
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${SUPABASE_URL} https://cdn.jsdelivr.net https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    `connect-src 'self' ${SUPABASE_URL} ${wssUrl} https://api.sentry.io https://api.stripe.com https://api.openai.com https://api.perplexity.ai https://api.suno.ai`,
    "frame-src 'self' https://js.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <link rel="canonical" href={fullCanonical} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Security Headers - Grade A */}
      <meta httpEquiv="Content-Security-Policy" content={cspDirectives} />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=(self)" />
      <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload" />
      
      {/* Prevent format detection */}
      <meta name="format-detection" content="telephone=no" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MED-MNG" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@medmng" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Preconnect for performance */}
      <link rel="preconnect" href={SUPABASE_URL} crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={SUPABASE_URL.replace('https:', '//')} />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

      {/* Theme */}
      <meta name="theme-color" content="#3b82f6" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#1e3a8a" media="(prefers-color-scheme: dark)" />
      <meta name="color-scheme" content="light dark" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Structured data pour l'organisation
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'MED-MNG',
  description: 'Plateforme d\'apprentissage médical par la musique',
  url: 'https://med-mng.lovable.app',
  logo: 'https://med-mng.lovable.app/logo.png',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['French']
  }
});

// Structured data pour les cours/items
export const getCourseSchema = (item: { title: string; description: string; identifier: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: item.title,
  description: item.description,
  provider: {
    '@type': 'Organization',
    name: 'MED-MNG'
  },
  courseCode: item.identifier,
  educationalLevel: 'medical-student',
  inLanguage: 'fr'
});

export default GlobalSecurityHeaders;
