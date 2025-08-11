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
  const { pathname } = useLocation();

  const theme: ThemeConfig = useMemo(() => {
    // Route → distinct visual identity using semantic tokens only
    if (/^\/$/.test(pathname)) {
      return {
        classes:
          "min-h-screen bg-background bg-gradient-to-b from-primary/10 to-accent/10",
        title: "Accueil – MED‑MNG | Plateforme immersive",
        description:
          "Accueil MED‑MNG: explorez les expériences immersives et outils d’apprentissage médicaux.",
        canonical: "/",
      };
    }

    if (/^\/edn(\/|$)/.test(pathname)) {
      return {
        classes:
          "min-h-screen bg-background bg-gradient-to-tr from-primary/15 via-background to-muted/30",
        title: "EDN – Items immersifs et compétences | MED‑MNG",
        description:
          "EDN: items, rangs A/B/AB et contenus immersifs. Révisions intelligentes et interactives.",
        canonical: "/edn",
      };
    }

    if (/^\/med-mng(\/|$)/.test(pathname)) {
      return {
        classes:
          "min-h-screen bg-background bg-gradient-to-br from-secondary/15 to-primary/5",
        title: "MED‑MNG Suite – Création, Bibliothèque, Analytics",
        description:
          "Créez, organisez et analysez vos contenus musicaux médicaux avec la suite MED‑MNG.",
        canonical: "/med-mng",
      };
    }

    if (/^\/admin(\/|$)/.test(pathname)) {
      return {
        classes:
          "min-h-screen bg-background bg-gradient-to-b from-destructive/5 to-muted/20",
        title: "Administration – Imports, Audit, Extraction | MED‑MNG",
        description:
          "Console d’administration: import de données, audit qualité, extractions et supervision.",
        canonical: "/admin",
      };
    }

    if (/^\/audit(\/|$)/.test(pathname)) {
      return {
        classes:
          "min-h-screen bg-background bg-gradient-to-t from-warning/10 to-background",
        title: "Audit de complétude et qualité | MED‑MNG",
        description:
          "Audit des contenus: complétude, cohérence et indicateurs clés pour la réussite EDN.",
        canonical: "/audit",
      };
    }

    if (/^\/chat(\/|$)/.test(pathname)) {
      return {
        classes:
          "min-h-screen bg-background bg-gradient-to-r from-accent/10 to-secondary/10",
        title: "Chat IA – Assistance et coaching | MED‑MNG",
        description:
          "Assistance conversationnelle et coaching en temps réel pour vos révisions et créations.",
        canonical: "/chat",
      };
    }

    // Fallback generic theme (still distinct from default background)
    return {
      classes:
        "min-h-screen bg-background bg-gradient-to-b from-muted/15 to-background",
      title: "MED‑MNG | Expériences immersives médicales",
      description:
        "Expériences immersives, contenus médicaux et outils de création pour apprendre autrement.",
      canonical: pathname || "/",
    };
  }, [pathname]);

  return (
    <div className={theme.classes}>
      <Helmet>
        <title>{theme.title}</title>
        <meta name="description" content={theme.description} />
        <link rel="canonical" href={theme.canonical} />
      </Helmet>
      {children}
    </div>
  );
};
