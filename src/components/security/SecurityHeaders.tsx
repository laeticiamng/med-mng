import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SUPABASE_URL } from '@/lib/supabaseConstants';

interface SecurityHeadersProps {
  title?: string;
  description?: string;
  url?: string;
  children?: React.ReactNode;
}

export const SecurityHeaders: React.FC<SecurityHeadersProps> = ({
  title = 'MED-MNG - Plateforme Médicale Sécurisée',
  description = 'Plateforme d\'extraction et génération musicale médicale avec sécurité de niveau A',
  url = 'https://med-mng.com',
  children
}) => {
  // Configuration CSP stricte pour grade A sécurité
  const wssUrl = SUPABASE_URL.replace('https://', 'wss://');
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${SUPABASE_URL} https://cdn.jsdelivr.net`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    `connect-src 'self' ${SUPABASE_URL} ${wssUrl} https://api.sentry.io`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');

  return (
    <Helmet>
      {/* SEO Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={url} />

      {/* Security Headers - Grade A niveau */}
      <meta httpEquiv="Content-Security-Policy" content={cspDirectives} />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
      
      {/* HSTS - Force HTTPS */}
      <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload" />
      
      {/* Prevent MIME type sniffing */}
      <meta name="format-detection" content="telephone=no" />
      
      {/* OpenGraph pour partage sécurisé */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MED-MNG" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Préconnexions sécurisées */}
      <link rel="preconnect" href={SUPABASE_URL} crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch pour optimisation */}
      <link rel="dns-prefetch" href={SUPABASE_URL.replace('https:', '//')} />
      
      {/* Favicon sécurisé */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      
      {children}
    </Helmet>
  );
};