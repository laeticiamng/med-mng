import React, { PropsWithChildren, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

type ThemeConfig = {
  classes: string;
  title: string;
  description: string;
  canonical: string;
};

// Small, focused theming provider to make each major route visually unique
export const PageThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  let pathname = "/";
  
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch (e) {
    // Router context not available yet, use default pathname
    console.warn('PageThemeProvider: Router context not available yet, using default pathname');
  }

  const theme: ThemeConfig = useMemo(() => {
    const baseUrl = "https://med-mng.com";
    
    // Route → distinct visual identity using semantic tokens only
    if (/^\/$/.test(pathname)) {
      return {
        classes:
          "min-h-screen bg-background bg-gradient-to-b from-primary/10 to-accent/10",
        title: "Accueil – MED‑MNG | Plateforme immersive",
        description:
          "Accueil MED‑MNG: explorez les expériences immersives et outils d'apprentissage médicaux.",
        canonical: baseUrl,
      };
    }

    if (/^\/edn(\/|$)/.test(pathname)) {
      return {
        classes:
          "min-h-screen bg-background bg-gradient-to-tr from-primary/15 via-background to-muted/30",
        title: "EDN – Items immersifs et compétences | MED‑MNG",
        description:
          "EDN: items, rangs A/B/AB et contenus immersifs. Révisions intelligentes et interactives.",
        canonical: `${baseUrl}/edn`,
      };
    }

    if (/^\/med-mng(\/|$)/.test(pathname)) {
      return {
        classes:
          "min-h-screen bg-background bg-gradient-to-br from-secondary/15 to-primary/5",
        title: "MED‑MNG Suite – Création, Bibliothèque, Analytics",
        description:
          "Créez, organisez et analysez vos contenus musicaux médicaux avec la suite MED‑MNG.",
        canonical: `${baseUrl}/med-mng`,
      };
    }

    if (/^\/admin(\/|$)/.test(pathname)) {
      return {
        classes:
          "min-h-screen bg-background bg-gradient-to-b from-destructive/5 to-muted/20",
        title: "Administration – Imports, Audit, Extraction | MED‑MNG",
        description:
          "Console d'administration: import de données, audit qualité, extractions et supervision.",
        canonical: `${baseUrl}/admin`,
      };
    }

    if (/^\/audit(\/|$)/.test(pathname)) {
      return {
        classes:
          "min-h-screen bg-background bg-gradient-to-t from-warning/10 to-background",
        title: "Audit de complétude et qualité | MED‑MNG",
        description:
          "Audit des contenus: complétude, cohérence et indicateurs clés pour la réussite EDN.",
        canonical: `${baseUrl}/audit`,
      };
    }

    if (/^\/chat(\/|$)/.test(pathname)) {
      return {
        classes:
          "min-h-screen bg-background bg-gradient-to-r from-accent/10 to-secondary/10",
        title: "Chat IA – Assistance et coaching | MED‑MNG",
        description:
          "Assistance conversationnelle et coaching en temps réel pour vos révisions et créations.",
        canonical: `${baseUrl}/chat`,
      };
    }

    // Fallback generic theme (still distinct from default background)
    return {
      classes:
        "min-h-screen bg-background bg-gradient-to-b from-muted/15 to-background",
      title: "MED‑MNG | Expériences immersives médicales",
      description:
        "Expériences immersives, contenus médicaux et outils de création pour apprendre autrement.",
      canonical: `${baseUrl}${pathname || "/"}`,
    };
  }, [pathname]);

  // Use document.title directly to avoid any rendering issues with helmet
  React.useEffect(() => {
    document.title = theme.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', theme.description);
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = theme.description;
      document.head.appendChild(newMetaDescription);
    }
    
    // Handle canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = theme.canonical;
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = theme.canonical;
      document.head.appendChild(canonicalLink);
    }
  }, [theme.title, theme.description, theme.canonical]);

  return (
    <div className={theme.classes}>
      {children}
    </div>
  );
};