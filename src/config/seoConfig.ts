/**
 * SEO Configuration - Meta tags uniques par route
 * Chaque page a un title, description, keywords et structured data dédiés
 */

export interface RouteSEO {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogType?: 'website' | 'article' | 'profile';
  noindex?: boolean;
}

const BASE_KEYWORDS = 'médecine, EDN, ECOS, apprentissage médical, musique, MED-MNG';

export const SEO_CONFIG: Record<string, RouteSEO> = {
  // === HOME ===
  '/': {
    title: 'MED MNG - Apprends la médecine en musique | EDN & ECOS',
    description: 'Révolutionne tes révisions médicales. 367 items EDN et simulations ECOS transformés en chansons. Écoute, retiens, réussis. Gratuit pour commencer.',
    keywords: `${BASE_KEYWORDS}, révisions, mémorisation, étudiants médecine`,
    canonical: '/',
  },

  // === DASHBOARDS ===
  '/dashboard': {
    title: 'Tableau de bord',
    description: 'Suivez votre progression en médecine : statistiques de révision, items maîtrisés, objectifs et planning personnalisé.',
    keywords: `${BASE_KEYWORDS}, tableau de bord, progression, statistiques`,
    canonical: '/dashboard',
  },
  '/modular-dashboard': {
    title: 'Dashboard Modulaire',
    description: 'Tableau de bord personnalisable avec widgets : progression EDN, flashcards, examens, musique et plus.',
    keywords: `${BASE_KEYWORDS}, dashboard modulaire, widgets, personnalisation`,
    canonical: '/modular-dashboard',
  },
  '/learning-dashboard': {
    title: 'Dashboard Apprentissage',
    description: 'Visualisez votre courbe d\'apprentissage médical : rétention, sessions SRS, items à réviser et recommandations IA.',
    keywords: `${BASE_KEYWORDS}, apprentissage, rétention, courbe oubli, SRS`,
    canonical: '/learning-dashboard',
  },
  '/executive-dashboard': {
    title: 'Dashboard Exécutif',
    description: 'Vue d\'ensemble complète de la plateforme MED-MNG : métriques clés, KPIs et analyses avancées.',
    keywords: `${BASE_KEYWORDS}, exécutif, KPI, métriques, analytics`,
    canonical: '/executive-dashboard',
    noindex: true,
  },

  // === EDN ===
  '/edn-complete': {
    title: 'Items EDN Complets - 367 items',
    description: 'Explorez les 367 items EDN avec cours musicaux, QCM, flashcards et vidéos. Chaque item transformé en chanson pour une mémorisation optimale.',
    keywords: `${BASE_KEYWORDS}, items EDN, 367 items, R2C, programme national`,
    canonical: '/edn-complete',
    ogType: 'article',
  },
  '/edn/music-library': {
    title: 'Bibliothèque Musicale EDN',
    description: 'Écoutez les chansons EDN par spécialité : cardiologie, pneumologie, neurologie et plus. Mémorisation musicale des items médicaux.',
    keywords: `${BASE_KEYWORDS}, musique médicale, chansons EDN, bibliothèque musicale`,
    canonical: '/edn/music-library',
  },
  '/edn-audit': {
    title: 'Audit EDN',
    description: 'Audit de qualité des 367 items EDN : complétude, cohérence et couverture du programme national.',
    keywords: `${BASE_KEYWORDS}, audit, qualité, complétude EDN`,
    canonical: '/edn-audit',
    noindex: true,
  },

  // === APPRENTISSAGE ===
  '/srs-review': {
    title: 'Révision SRS - Répétition Espacée',
    description: 'Révisez avec la répétition espacée intelligente. Algorithme adaptatif qui optimise votre mémorisation des items EDN.',
    keywords: `${BASE_KEYWORDS}, SRS, répétition espacée, mémorisation, Anki`,
    canonical: '/srs-review',
  },
  '/exam-mode': {
    title: 'Mode Examen - Simulation EDN',
    description: 'Simulez un examen EDN en conditions réelles : QCM, QRU, QROC chronométrés. Correction détaillée et analyse de performance.',
    keywords: `${BASE_KEYWORDS}, examen, simulation, QCM, QRU, QROC, entraînement`,
    canonical: '/exam-mode',
  },
  '/clinical-cases': {
    title: 'Cas Cliniques Interactifs',
    description: 'Entraînez-vous sur des cas cliniques interactifs avec arbres décisionnels. Diagnostic, traitement et scoring de performance.',
    keywords: `${BASE_KEYWORDS}, cas cliniques, diagnostic, arbres décisionnels, simulation`,
    canonical: '/clinical-cases',
  },
  '/flashcards': {
    title: 'Flashcards Médicales',
    description: 'Flashcards intelligentes pour réviser les items EDN. Système de répétition espacée intégré avec scoring.',
    keywords: `${BASE_KEYWORDS}, flashcards, cartes mémoire, révision rapide`,
    canonical: '/flashcards',
  },
  '/progress-dashboard': {
    title: 'Progression & Statistiques',
    description: 'Visualisez votre progression détaillée : items maîtrisés, scores par spécialité, temps de révision et objectifs.',
    keywords: `${BASE_KEYWORDS}, progression, statistiques, performance, objectifs`,
    canonical: '/progress-dashboard',
  },
  '/smart-study-planner': {
    title: 'Planificateur d\'Études Intelligent',
    description: 'Planifiez vos révisions avec l\'IA : planning personnalisé, priorisation automatique et rappels intelligents.',
    keywords: `${BASE_KEYWORDS}, planificateur, planning, organisation, IA`,
    canonical: '/smart-study-planner',
  },

  // === GAMIFICATION ===
  '/leaderboard': {
    title: 'Classement - Leaderboard',
    description: 'Comparez votre progression avec la communauté MED-MNG. Classement par points, badges et séries.',
    keywords: `${BASE_KEYWORDS}, classement, leaderboard, compétition, badges`,
    canonical: '/leaderboard',
  },
  '/daily-challenges': {
    title: 'Défis Quotidiens',
    description: 'Relevez un nouveau défi médical chaque jour. Gagnez des points et badges en répondant aux questions du jour.',
    keywords: `${BASE_KEYWORDS}, défis quotidiens, challenge, questions du jour`,
    canonical: '/daily-challenges',
  },
  '/my-goals': {
    title: 'Mes Objectifs',
    description: 'Définissez et suivez vos objectifs de révision médicale. Tracking automatique et recommandations personnalisées.',
    keywords: `${BASE_KEYWORDS}, objectifs, goals, tracking, motivation`,
    canonical: '/my-goals',
  },
  '/mood-tracker': {
    title: 'Suivi d\'Humeur',
    description: 'Suivez votre état émotionnel pendant les révisions. Corrélation humeur-performance pour optimiser votre apprentissage.',
    keywords: `${BASE_KEYWORDS}, humeur, bien-être, santé mentale, étudiant`,
    canonical: '/mood-tracker',
  },
  '/pomodoro': {
    title: 'Pomodoro Timer',
    description: 'Timer Pomodoro adapté aux révisions médicales. Sessions chronométrées avec pauses et statistiques de productivité.',
    keywords: `${BASE_KEYWORDS}, pomodoro, timer, productivité, concentration`,
    canonical: '/pomodoro',
  },
  '/karaoke': {
    title: 'Karaoké Médical',
    description: 'Apprenez la médecine en chantant ! Mode karaoké sur les chansons EDN pour une mémorisation active et ludique.',
    keywords: `${BASE_KEYWORDS}, karaoké, chant, apprentissage ludique, mémorisation active`,
    canonical: '/karaoke',
  },
  '/achievements': {
    title: 'Mes Succès & Badges',
    description: 'Consultez vos badges, trophées et accomplissements sur MED-MNG. Célébrez votre progression médicale.',
    keywords: `${BASE_KEYWORDS}, succès, badges, trophées, gamification`,
    canonical: '/achievements',
  },

  // === ECOS ===
  '/ecos': {
    title: 'Simulations ECOS',
    description: 'Entraînez-vous aux ECOS (Examens Cliniques Objectifs Structurés) avec des scénarios réalistes et feedback détaillé.',
    keywords: `${BASE_KEYWORDS}, ECOS, simulation clinique, examen clinique, scénarios`,
    canonical: '/ecos',
  },

  // === STORE ===
  '/store': {
    title: 'Boutique MED-MNG',
    description: 'Découvrez les produits et abonnements MED-MNG. Accédez aux contenus premium, générations musicales illimitées et plus.',
    keywords: `${BASE_KEYWORDS}, boutique, premium, abonnement, achats`,
    canonical: '/store',
  },

  // === AUTH ===
  '/med-mng/login': {
    title: 'Connexion',
    description: 'Connectez-vous à MED-MNG pour accéder à vos révisions médicales en musique. 367 items EDN vous attendent.',
    keywords: `${BASE_KEYWORDS}, connexion, login, compte`,
    canonical: '/med-mng/login',
  },
  '/med-mng/signup': {
    title: 'Inscription Gratuite',
    description: 'Créez votre compte MED-MNG gratuit et commencez à apprendre la médecine en musique. Accès immédiat aux items EDN.',
    keywords: `${BASE_KEYWORDS}, inscription, créer compte, gratuit, démarrer`,
    canonical: '/med-mng/signup',
  },
  '/med-mng/pricing': {
    title: 'Tarifs & Abonnements',
    description: 'Choisissez votre formule MED-MNG : Gratuit, Pro Étudiant (19€) ou Premium (39€). Essai gratuit 7 jours pour réviser la médecine en musique.',
    keywords: `${BASE_KEYWORDS}, tarifs, prix, abonnement, premium, pro`,
    canonical: '/med-mng/pricing',
  },
  '/med-mng/reset-password': {
    title: 'Réinitialiser le mot de passe',
    description: 'Réinitialisez votre mot de passe MED-MNG. Recevez un lien sécurisé par email.',
    keywords: `${BASE_KEYWORDS}, mot de passe, réinitialisation`,
    canonical: '/med-mng/reset-password',
    noindex: true,
  },

  // === MED-MNG Protected (noindex) ===
  '/med-mng/create': {
    title: 'Créer une Chanson Médicale',
    description: 'Créez votre propre chanson médicale avec l\'IA. Choisissez un item EDN, un style musical et générez votre morceau.',
    keywords: `${BASE_KEYWORDS}, créer, génération musicale, IA, composition`,
    canonical: '/med-mng/create',
    noindex: true,
  },
  '/med-mng/music-library': {
    title: 'Ma Bibliothèque Musicale',
    description: 'Accédez à votre bibliothèque personnelle de chansons médicales générées par IA.',
    keywords: `${BASE_KEYWORDS}, bibliothèque, musique, collection`,
    canonical: '/med-mng/music-library',
    noindex: true,
  },
  '/med-mng/items-library': {
    title: 'Bibliothèque Items EDN',
    description: 'Explorez tous les items EDN avec contenus enrichis, musique et exercices.',
    keywords: `${BASE_KEYWORDS}, items, bibliothèque, contenus`,
    canonical: '/med-mng/items-library',
    noindex: true,
  },
  '/med-mng/profile': {
    title: 'Mon Profil',
    description: 'Gérez votre profil MED-MNG : informations personnelles, préférences et statistiques.',
    keywords: `${BASE_KEYWORDS}, profil, compte, paramètres`,
    canonical: '/med-mng/profile',
    noindex: true,
  },
  '/med-mng/playlists': {
    title: 'Mes Playlists',
    description: 'Organisez vos chansons médicales en playlists thématiques par spécialité.',
    keywords: `${BASE_KEYWORDS}, playlists, organisation, spécialités`,
    canonical: '/med-mng/playlists',
    noindex: true,
  },
  '/med-mng/analytics': {
    title: 'Mes Analytics',
    description: 'Statistiques détaillées de votre écoute musicale et apprentissage sur MED-MNG.',
    keywords: `${BASE_KEYWORDS}, analytics, statistiques, écoute`,
    canonical: '/med-mng/analytics',
    noindex: true,
  },
  '/med-mng/progress': {
    title: 'Ma Progression',
    description: 'Suivez votre progression détaillée sur MED-MNG : items maîtrisés, scores et recommandations.',
    keywords: `${BASE_KEYWORDS}, progression, suivi, performance`,
    canonical: '/med-mng/progress',
    noindex: true,
  },
  '/med-mng/favorites': {
    title: 'Mes Favoris',
    description: 'Retrouvez rapidement vos chansons et items EDN favoris.',
    keywords: `${BASE_KEYWORDS}, favoris, sauvegardés`,
    canonical: '/med-mng/favorites',
    noindex: true,
  },

  // === CONTENT ===
  '/generator': {
    title: 'Générateur de Musique Médicale',
    description: 'Générez des chansons médicales avec l\'IA. Transformez n\'importe quel item EDN en morceau mémorable.',
    keywords: `${BASE_KEYWORDS}, générateur, musique IA, composition automatique`,
    canonical: '/generator',
  },
  '/shared-music': {
    title: 'Musique Partagée',
    description: 'Découvrez les chansons médicales partagées par la communauté MED-MNG.',
    keywords: `${BASE_KEYWORDS}, partage, communauté, musique partagée`,
    canonical: '/shared-music',
  },
  '/library': {
    title: 'Bibliothèque Générale',
    description: 'Accédez à l\'ensemble des ressources MED-MNG : items EDN, chansons, flashcards et cas cliniques.',
    keywords: `${BASE_KEYWORDS}, bibliothèque, ressources, catalogue`,
    canonical: '/library',
  },
  '/mng-method': {
    title: 'La Méthode MNG',
    description: 'Découvrez la méthode MNG : l\'apprentissage médical par la musique. Science cognitive, répétition espacée et engagement actif.',
    keywords: `${BASE_KEYWORDS}, méthode MNG, science cognitive, pédagogie musicale`,
    canonical: '/mng-method',
  },
  '/statistics': {
    title: 'Statistiques de la Plateforme',
    description: 'Statistiques globales de MED-MNG : utilisateurs actifs, items les plus étudiés et tendances.',
    keywords: `${BASE_KEYWORDS}, statistiques, données, tendances`,
    canonical: '/statistics',
  },
  '/study-planner': {
    title: 'Planificateur d\'Études',
    description: 'Organisez vos sessions de révision médicale. Planning hebdomadaire avec rappels et objectifs.',
    keywords: `${BASE_KEYWORDS}, planificateur, planning, organisation`,
    canonical: '/study-planner',
  },
  '/community': {
    title: 'Communauté MED-MNG',
    description: 'Rejoignez la communauté d\'étudiants en médecine. Échangez, partagez et progressez ensemble.',
    keywords: `${BASE_KEYWORDS}, communauté, forum, échanges, entraide`,
    canonical: '/community',
  },
  '/favorites': {
    title: 'Mes Favoris',
    description: 'Retrouvez vos items EDN et chansons favoris en un clic.',
    keywords: `${BASE_KEYWORDS}, favoris, sauvegardés`,
    canonical: '/favorites',
  },
  '/settings': {
    title: 'Paramètres',
    description: 'Gérez vos paramètres MED-MNG : thème, notifications, langue, abonnement et confidentialité.',
    keywords: `${BASE_KEYWORDS}, paramètres, configuration, préférences`,
    canonical: '/settings',
    noindex: true,
  },
  '/chat': {
    title: 'Chat IA Médical',
    description: 'Posez vos questions médicales à notre IA. Assistant intelligent pour comprendre les items EDN.',
    keywords: `${BASE_KEYWORDS}, chat, IA, assistant médical, questions`,
    canonical: '/chat',
  },

  // === LEGAL ===
  '/mentions-legales': {
    title: 'Mentions Légales',
    description: 'Mentions légales de MED-MNG : éditeur, hébergeur, propriété intellectuelle et conditions d\'utilisation.',
    keywords: `${BASE_KEYWORDS}, mentions légales, éditeur, CGU`,
    canonical: '/mentions-legales',
  },
  '/politique-confidentialite': {
    title: 'Politique de Confidentialité',
    description: 'Politique de confidentialité MED-MNG : collecte de données, RGPD, cookies et droits des utilisateurs.',
    keywords: `${BASE_KEYWORDS}, confidentialité, RGPD, données personnelles, cookies`,
    canonical: '/politique-confidentialite',
  },
  '/cgu': {
    title: 'Conditions Générales d\'Utilisation',
    description: 'CGU de MED-MNG : conditions d\'accès, droits et obligations des utilisateurs de la plateforme.',
    keywords: `${BASE_KEYWORDS}, CGU, conditions utilisation, règlement`,
    canonical: '/cgu',
  },
  '/declaration-accessibilite': {
    title: 'Déclaration d\'Accessibilité',
    description: 'Déclaration d\'accessibilité de MED-MNG : conformité RGAA, aménagements et contact accessibilité.',
    keywords: `${BASE_KEYWORDS}, accessibilité, RGAA, handicap`,
    canonical: '/declaration-accessibilite',
  },
  '/mes-donnees-rgpd': {
    title: 'Mes Données RGPD',
    description: 'Exercez vos droits RGPD sur MED-MNG : export, suppression et gestion de vos données personnelles.',
    keywords: `${BASE_KEYWORDS}, RGPD, données personnelles, export, suppression`,
    canonical: '/mes-donnees-rgpd',
    noindex: true,
  },

  // === PWA & MISC ===
  '/install': {
    title: 'Installer MED-MNG',
    description: 'Installez MED-MNG sur votre appareil pour un accès rapide hors ligne. Application progressive (PWA).',
    keywords: `${BASE_KEYWORDS}, installer, PWA, application, hors ligne`,
    canonical: '/install',
  },
  '/pwa-analytics': {
    title: 'Analytics PWA',
    description: 'Métriques de performance PWA : Core Web Vitals, installations et utilisation hors ligne.',
    keywords: `${BASE_KEYWORDS}, PWA, analytics, performance, web vitals`,
    canonical: '/pwa-analytics',
    noindex: true,
  },
  '/diagnostics': {
    title: 'Diagnostics',
    description: 'Outils de diagnostic de la plateforme MED-MNG.',
    keywords: `${BASE_KEYWORDS}, diagnostics, debug`,
    canonical: '/diagnostics',
    noindex: true,
  },
  '/design-system': {
    title: 'Design System',
    description: 'Guide des composants et styles du Design System MED-MNG.',
    keywords: `${BASE_KEYWORDS}, design system, composants, UI`,
    canonical: '/design-system',
    noindex: true,
  },

  // === PLATFORM ADMIN (noindex) ===
  '/platform-status': {
    title: 'Statut de la Plateforme',
    description: 'État des services MED-MNG en temps réel.',
    keywords: `${BASE_KEYWORDS}, statut, uptime, services`,
    canonical: '/platform-status',
    noindex: true,
  },
  '/monitoring': {
    title: 'Monitoring',
    description: 'Monitoring de la plateforme MED-MNG.',
    keywords: `${BASE_KEYWORDS}, monitoring, surveillance`,
    canonical: '/monitoring',
    noindex: true,
  },
  '/system-management': {
    title: 'Gestion Système',
    description: 'Gestion système de la plateforme MED-MNG.',
    keywords: `${BASE_KEYWORDS}, système, gestion, administration`,
    canonical: '/system-management',
    noindex: true,
  },
  '/platform-settings': {
    title: 'Paramètres Plateforme',
    description: 'Configuration de la plateforme MED-MNG.',
    keywords: `${BASE_KEYWORDS}, paramètres, configuration`,
    canonical: '/platform-settings',
    noindex: true,
  },
  '/accessibility-dashboard': {
    title: 'Dashboard Accessibilité',
    description: 'Suivi de la conformité accessibilité RGAA de MED-MNG.',
    keywords: `${BASE_KEYWORDS}, accessibilité, RGAA, conformité`,
    canonical: '/accessibility-dashboard',
    noindex: true,
  },
  '/effectiveness-dashboard': {
    title: 'Dashboard Efficacité',
    description: 'Métriques d\'efficacité pédagogique de la plateforme MED-MNG.',
    keywords: `${BASE_KEYWORDS}, efficacité, pédagogie, métriques`,
    canonical: '/effectiveness-dashboard',
    noindex: true,
  },
  '/rls-documentation': {
    title: 'Documentation RLS',
    description: 'Documentation des politiques Row Level Security de Supabase.',
    keywords: `${BASE_KEYWORDS}, RLS, sécurité, Supabase`,
    canonical: '/rls-documentation',
    noindex: true,
  },
  '/security-monitoring': {
    title: 'Monitoring Sécurité',
    description: 'Surveillance de la sécurité de la plateforme MED-MNG.',
    keywords: `${BASE_KEYWORDS}, sécurité, monitoring, audit`,
    canonical: '/security-monitoring',
    noindex: true,
  },

  // === PILLAR PAGES SEO (contenu long-form, acquisition organique) ===
  '/preparation-ecos-2026': {
    title: 'Préparation ECOS 2026 - Guide Complet',
    description: 'Guide complet pour préparer les ECOS 2026. Méthodologie, simulations interactives, grilles d\'évaluation et conseils par spécialité.',
    keywords: `${BASE_KEYWORDS}, ECOS 2026, préparation, guide, simulation, grille évaluation`,
    canonical: '/preparation-ecos-2026',
    ogType: 'article',
  },
  '/reussir-edn': {
    title: 'Réussir l\'EDN 2026 - Stratégies & Méthodes',
    description: 'Stratégies éprouvées pour réussir l\'EDN. Planning de révision, priorisation des items, méthodes de mémorisation et erreurs à éviter.',
    keywords: `${BASE_KEYWORDS}, réussir EDN, stratégie, planning révision, méthodes`,
    canonical: '/reussir-edn',
    ogType: 'article',
  },
  '/fiches-ecos-interactives': {
    title: 'Fiches ECOS Interactives - Toutes Spécialités',
    description: 'Fiches ECOS interactives par spécialité. Scénarios réalistes, grilles de notation et feedback détaillé pour chaque station.',
    keywords: `${BASE_KEYWORDS}, fiches ECOS, interactives, scénarios, spécialités, grilles`,
    canonical: '/fiches-ecos-interactives',
    ogType: 'article',
  },
  '/simulation-examen-edn': {
    title: 'Simulation Examen EDN - Entraînement Réaliste',
    description: 'Simulez l\'examen EDN en conditions réelles. QCM, QRU, QROC chronométrés avec correction détaillée et analyse de performance.',
    keywords: `${BASE_KEYWORDS}, simulation examen, EDN, entraînement, conditions réelles, QCM`,
    canonical: '/simulation-examen-edn',
    ogType: 'article',
  },
  '/cas-cliniques-edn': {
    title: 'Cas Cliniques EDN - Entraînement Progressif',
    description: 'Entraînez-vous sur des cas cliniques EDN progressifs. Arbres décisionnels, diagnostics différentiels et plans thérapeutiques.',
    keywords: `${BASE_KEYWORDS}, cas cliniques, EDN, diagnostic, arbre décisionnel, thérapeutique`,
    canonical: '/cas-cliniques-edn',
    ogType: 'article',
  },
  '/erreurs-frequentes-ecos': {
    title: 'Erreurs Fréquentes aux ECOS - Les Éviter',
    description: 'Les erreurs les plus fréquentes aux ECOS et comment les éviter. Analyse par station, pièges classiques et conseils pratiques.',
    keywords: `${BASE_KEYWORDS}, erreurs ECOS, pièges, conseils, stations, éviter`,
    canonical: '/erreurs-frequentes-ecos',
    ogType: 'article',
  },
  '/classement-edn-explique': {
    title: 'Classement EDN Expliqué - Comprendre le Système',
    description: 'Comprendre le classement EDN : calcul du score, pondération, rang A vs B et stratégie pour maximiser son classement.',
    keywords: `${BASE_KEYWORDS}, classement EDN, score, pondération, rang, stratégie`,
    canonical: '/classement-edn-explique',
    ogType: 'article',
  },
  '/rang-a-vs-rang-b': {
    title: 'Rang A vs Rang B EDN - Différences & Stratégie',
    description: 'Différences entre Rang A et Rang B à l\'EDN. Quels items prioriser, stratégie de révision et impact sur le classement.',
    keywords: `${BASE_KEYWORDS}, rang A, rang B, différences, priorisation, stratégie EDN`,
    canonical: '/rang-a-vs-rang-b',
    ogType: 'article',
  },
  '/travailler-cas-cliniques': {
    title: 'Travailler les Cas Cliniques - Méthode Efficace',
    description: 'Méthode efficace pour travailler les cas cliniques en médecine. Approche systématique, raisonnement clinique et entraînement progressif.',
    keywords: `${BASE_KEYWORDS}, travailler cas cliniques, méthode, raisonnement clinique, progression`,
    canonical: '/travailler-cas-cliniques',
    ogType: 'article',
  },
  '/exemple-cas-clinique': {
    title: 'Exemple de Cas Clinique Corrigé - EDN',
    description: 'Exemple de cas clinique EDN entièrement corrigé. Démarche diagnostique, examens complémentaires et prise en charge commentée.',
    keywords: `${BASE_KEYWORDS}, exemple cas clinique, corrigé, démarche diagnostique, prise en charge`,
    canonical: '/exemple-cas-clinique',
    ogType: 'article',
  },

  // === AUDIT (noindex) ===
  '/audit': {
    title: 'Audit Complet',
    description: 'Audit complet de la plateforme MED-MNG.',
    keywords: `${BASE_KEYWORDS}, audit, qualité`,
    canonical: '/audit',
    noindex: true,
  },
  '/audit-completeness': {
    title: 'Audit Complétude',
    description: 'Audit de complétude des données MED-MNG.',
    keywords: `${BASE_KEYWORDS}, audit, complétude`,
    canonical: '/audit-completeness',
    noindex: true,
  },
  '/migration-dashboard': {
    title: 'Dashboard Migration',
    description: 'Suivi des migrations de données.',
    keywords: `${BASE_KEYWORDS}, migration, données`,
    canonical: '/migration-dashboard',
    noindex: true,
  },
};

/**
 * Récupère la config SEO pour une route donnée
 * Retourne un fallback si la route n'est pas configurée
 */
export function getRouteSEO(pathname: string): RouteSEO {
  // Exact match
  if (SEO_CONFIG[pathname]) {
    return SEO_CONFIG[pathname];
  }

  // Pattern matching for dynamic routes
  if (pathname.startsWith('/edn-complete/')) {
    return {
      title: 'Item EDN',
      description: 'Détail d\'un item EDN avec cours musical, QCM et flashcards sur MED-MNG.',
      keywords: `${BASE_KEYWORDS}, item EDN, cours, détail`,
      canonical: pathname,
      ogType: 'article',
    };
  }
  if (pathname.startsWith('/ecos/')) {
    return {
      title: 'Scénario ECOS',
      description: 'Simulation ECOS interactive avec feedback détaillé sur MED-MNG.',
      keywords: `${BASE_KEYWORDS}, ECOS, scénario, simulation`,
      canonical: pathname,
    };
  }
  if (pathname.startsWith('/med-mng/items/')) {
    return {
      title: 'Détail Item',
      description: 'Détail d\'un item médical avec contenu enrichi sur MED-MNG.',
      keywords: `${BASE_KEYWORDS}, item, détail`,
      canonical: pathname,
      noindex: true,
    };
  }
  if (pathname.startsWith('/med-mng/player/')) {
    return {
      title: 'Lecteur Musical',
      description: 'Écoutez une chanson médicale générée par IA sur MED-MNG.',
      keywords: `${BASE_KEYWORDS}, lecteur, musique, écoute`,
      canonical: pathname,
      noindex: true,
    };
  }
  if (pathname.startsWith('/product/')) {
    return {
      title: 'Produit',
      description: 'Découvrez ce produit sur la boutique MED-MNG.',
      keywords: `${BASE_KEYWORDS}, produit, boutique`,
      canonical: pathname,
    };
  }
  if (pathname.startsWith('/shared-music/')) {
    return {
      title: 'Musique Partagée',
      description: 'Écoutez cette chanson médicale partagée sur MED-MNG.',
      keywords: `${BASE_KEYWORDS}, musique partagée, partage`,
      canonical: pathname,
    };
  }

  // Admin routes - always noindex
  if (pathname.startsWith('/admin')) {
    return {
      title: 'Administration',
      description: 'Panneau d\'administration MED-MNG.',
      keywords: BASE_KEYWORDS,
      canonical: pathname,
      noindex: true,
    };
  }

  // Fallback
  return {
    title: 'MED-MNG',
    description: 'Plateforme d\'apprentissage médical innovante par la musique. 367 items EDN et simulations ECOS.',
    keywords: BASE_KEYWORDS,
    canonical: pathname,
  };
}

/**
 * Routes publiques pour le sitemap (exclut noindex, admin, et routes dynamiques avec paramètres)
 */
export function getPublicRoutes(): string[] {
  return Object.entries(SEO_CONFIG)
    .filter(([path, config]) => !config.noindex && !path.startsWith('/admin'))
    .map(([path]) => path);
}
