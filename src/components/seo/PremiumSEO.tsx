/**
 * 🎯 PREMIUM SEO - MED-MNG v4.0
 * Composant SEO centralisé avec Helmet
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

interface PremiumSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const PremiumSEO: React.FC<PremiumSEOProps> = ({
  title = "MED-MNG v4.0 Premium - Plateforme Médicale Avancée",
  description = "La plateforme médicale la plus avancée au monde. Interface premium, sécurité maximale, accessibilité totale.",
  keywords = "médical, premium, santé, plateforme, sécurisé, accessible, professionnel",
  image = "/og-image.png",
  url = "https://med-mng.com",
  type = "website"
}) => {
  return (
    <Helmet
      titleTemplate="%s | MED-MNG v4.0 Premium"
      defaultTitle={title}
    >
      <html lang="fr" />
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="MED-MNG Premium" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Apple */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="MED-MNG Premium" />
      
      {/* Microsoft */}
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Preconnect pour les performances */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Performance hints */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
    </Helmet>
  );
};