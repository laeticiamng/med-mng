import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SitemapRoute {
  label: string;
  path: string;
  description: string;
  examplePath?: string;
}

interface SitemapSection {
  title: string;
  description: string;
  routes: SitemapRoute[];
}

const sitemapSections: SitemapSection[] = [
  {
    title: 'Navigation & Accueil',
    description: 'Portails d\'entrée de la plateforme et plan du site.',
    routes: [
      {
        label: 'Accueil principal',
        path: ROUTE_PATHS.home,
        description: 'Point d\'entrée par défaut vers l\'expérience Med-MNG.',
      },
      {
        label: 'Accueil optimisé',
        path: ROUTE_PATHS.optimizedIndex,
        description: 'Version allégée et rapide de la page d\'accueil pour les tests de performance.',
      },
      {
        label: 'Accueil marketing',
        path: ROUTE_PATHS.homepage,
        description: 'Landing page moderne présentant la proposition de valeur Med-MNG.',
      },
      {
        label: 'Plan du site',
        path: ROUTE_PATHS.sitemap,
        description: 'Vue d\'ensemble des 75 routes avec catégorisation et liens directs.',
      },
    ],
  },
  {
    title: 'Dashboards & Pilotage',
    description: 'Tableaux de bord stratégiques pour suivre la performance et la conformité.',
    routes: [
      {
        label: 'Dashboard modulable',
        path: ROUTE_PATHS.modularDashboard,
        description: 'Tableau de bord personnalisable pour composer ses propres widgets.',
      },
      {
        label: 'Dashboard global',
        path: ROUTE_PATHS.dashboard,
        description: 'Vue d\'ensemble consolidée des indicateurs clés de la plateforme.',
      },
      {
        label: 'Dashboard apprentissage',
        path: ROUTE_PATHS.learningDashboard,
        description: 'Pilotage des parcours de formation et de la progression pédagogique.',
      },
      {
        label: 'Statut plateforme',
        path: ROUTE_PATHS.platformStatus,
        description: 'Suivi de l\'état opérationnel des services critiques et SLA.',
      },
      {
        label: 'Monitoring temps réel',
        path: ROUTE_PATHS.monitoring,
        description: 'Surveillance live des métriques techniques et des alertes.',
      },
      {
        label: 'Gestion du système',
        path: ROUTE_PATHS.systemManagement,
        description: 'Administration technique des services et automatisations clés.',
      },
      {
        label: 'Paramètres plateforme',
        path: ROUTE_PATHS.platformSettings,
        description: 'Configuration globale des modules, intégrations et accès.',
      },
      {
        label: 'Migration Dashboard',
        path: ROUTE_PATHS.migrationDashboard,
        description: 'Suivi des migrations de données et couverture fonctionnelle.',
      },
      {
        label: 'Accessibilité',
        path: ROUTE_PATHS.accessibilityDashboard,
        description: 'Contrôle de conformité accessibilité et recommandations WCAG.',
      },
      {
        label: 'Efficacité opérationnelle',
        path: ROUTE_PATHS.effectivenessDashboard,
        description: 'Analyse de l\'impact des actions et productivité des équipes.',
      },
      {
        label: 'Audit unifié',
        path: ROUTE_PATHS.audit,
        description: 'Vue centralisée des audits EDN/ECOS avec scoring global.',
      },
      {
        label: 'Complétude de l\'audit',
        path: ROUTE_PATHS.auditCompleteness,
        description: 'Suivi des champs manquants et du niveau de complétude des audits.',
      },
      {
        label: 'Dashboard audit EDN',
        path: ROUTE_PATHS.ednAudit,
        description: 'Analyse détaillée des audits EDN et priorisation des corrections.',
      },
    ],
  },
  {
    title: 'Espace EDN',
    description: 'Outils dédiés à la diffusion et à la musique thérapeutique EDN.',
    routes: [
      {
        label: 'EDN complet',
        path: ROUTE_PATHS.ednComplete,
        description: 'Expérience EDN unifiée combinant préparation, diffusion et suivi.',
      },
      {
        label: 'Détail EDN',
        path: ROUTE_PATHS.ednCompleteDetail,
        examplePath: ROUTE_PATHS.ednCompleteDetail.replace(':slug', 'module-introduction'),
        description: 'Accès direct à un module EDN spécifique (exemple : module-introduction).',
      },
      {
        label: 'Immersion EDN',
        path: ROUTE_PATHS.ednImmersive,
        examplePath: ROUTE_PATHS.ednImmersive.replace(':slug', 'module-introduction'),
        description: 'Lecture immersive d\'un module EDN en plein écran.',
      },
      {
        label: 'Bibliothèque musicale EDN',
        path: ROUTE_PATHS.ednMusicLibrary,
        description: 'Catalogue sonore spécialisé pour les protocoles EDN.',
      },
      {
        label: 'Ancienne page EDN',
        path: ROUTE_PATHS.ednLegacy,
        description: 'Ancienne route redirigée vers l\'interface EDN unifiée.',
      },
      {
        label: 'Ancien module EDN',
        path: ROUTE_PATHS.ednLegacyWithSlug,
        examplePath: ROUTE_PATHS.ednLegacyWithSlug.replace(':slug', 'module'),
        description: 'Ancienne route paramétrée redirigée vers la nouvelle expérience.',
      },
      {
        label: 'Items EDN legacy',
        path: ROUTE_PATHS.ednItemsLegacy,
        description: 'Ancien inventaire EDN maintenu pour compatibilité.',
      },
    ],
  },
  {
    title: 'Espace ECOS',
    description: 'Simulations cliniques et scénarios interactifs ECOS.',
    routes: [
      {
        label: 'Portail ECOS',
        path: ROUTE_PATHS.ecosIndex,
        description: 'Accueil des scénarios ECOS et sélection des sessions.',
      },
      {
        label: 'Scénario ECOS',
        path: ROUTE_PATHS.ecosScenario,
        examplePath: ROUTE_PATHS.ecosScenario.replace(':scenarioId', 'scenario-1'),
        description: 'Accès direct à un scénario ECOS donné (exemple : scenario-1).',
      },
    ],
  },
  {
    title: 'Administration & OIC',
    description: 'Outils réservés aux administrateurs et à la gouvernance des données.',
    routes: [
      {
        label: 'Imports administrateur',
        path: ROUTE_PATHS.adminImport,
        description: 'Interface d\'ingestion de données massives pour les contenus.',
      },
      {
        label: 'Audit administrateur',
        path: ROUTE_PATHS.adminAudit,
        description: 'Vue consolidée des audits et alertes réservées aux administrateurs.',
      },
      {
        label: 'Extraction EDN',
        path: ROUTE_PATHS.adminExtractEdn,
        description: 'Outil d\'export des données EDN pour analyses externes.',
      },
      {
        label: 'Extraction ECOS',
        path: ROUTE_PATHS.adminExtractEcos,
        description: 'Génération d\'exports dédiés aux scénarios ECOS.',
      },
      {
        label: 'Extraction objectifs',
        path: ROUTE_PATHS.adminExtractObjectifs,
        description: 'Extraction des objectifs pédagogiques et cliniques.',
      },
      {
        label: 'Qualité des données OIC',
        path: ROUTE_PATHS.adminOicQuality,
        description: 'Suivi des contrôles qualité sur les données OIC.',
      },
      {
        label: 'Processus complet',
        path: ROUTE_PATHS.adminComplete,
        description: 'Orchestration complète des workflows d\'extraction et de contrôle.',
      },
      {
        label: 'Panel administrateur',
        path: ROUTE_PATHS.adminPanel,
        description: 'Accès centralisé aux outils d\'administration avancés.',
      },
    ],
  },
  {
    title: 'Espace Med-MNG',
    description: 'Parcours d\'inscription, de gestion de playlists et d\'analyses musicales.',
    routes: [
      {
        label: 'Connexion Med-MNG',
        path: ROUTE_PATHS.medMngLogin,
        description: 'Authentification sécurisée pour les professionnels.',
      },
      {
        label: 'Inscription Med-MNG',
        path: ROUTE_PATHS.medMngSignup,
        description: 'Création de compte et onboarding des nouveaux utilisateurs.',
      },
      {
        label: 'Tarifs Med-MNG',
        path: ROUTE_PATHS.medMngPricing,
        description: 'Présentation des plans d\'abonnement et comparatif des offres.',
      },
      {
        label: 'Souscription plan',
        path: ROUTE_PATHS.medMngSubscribe,
        examplePath: ROUTE_PATHS.medMngSubscribe.replace(':planId', 'premium'),
        description: 'Choix d\'un plan d\'abonnement spécifique (exemple : premium).',
      },
      {
        label: 'Confirmation souscription',
        path: ROUTE_PATHS.medMngSuccess,
        description: 'Récapitulatif après activation de l\'abonnement.',
      },
      {
        label: 'Création de contenus',
        path: ROUTE_PATHS.medMngCreate,
        description: 'Atelier de création pour concevoir des protocoles personnalisés.',
      },
      {
        label: 'Bibliothèque Med-MNG',
        path: ROUTE_PATHS.medMngLibrary,
        description: 'Accès sécurisé à la médiathèque Med-MNG.',
      },
      {
        label: 'Profil Med-MNG',
        path: ROUTE_PATHS.medMngProfile,
        description: 'Gestion du profil professionnel et des préférences.',
      },
      {
        label: 'Lecteur Med-MNG',
        path: ROUTE_PATHS.medMngPlayer,
        examplePath: ROUTE_PATHS.medMngPlayer.replace(':songId', 'relaxation-1'),
        description: 'Lecture d\'un titre thérapeutique ciblé (exemple : relaxation-1).',
      },
      {
        label: 'Gestion des playlists',
        path: ROUTE_PATHS.medMngPlaylists,
        description: 'Organisation, tri et partage des playlists thérapeutiques.',
      },
      {
        label: 'Détail playlist',
        path: ROUTE_PATHS.medMngPlaylistDetail,
        examplePath: ROUTE_PATHS.medMngPlaylistDetail.replace(':playlistId', 'playlist-123'),
        description: 'Vue détaillée d\'une playlist sélectionnée (exemple : playlist-123).',
      },
      {
        label: 'Analytics musicaux',
        path: ROUTE_PATHS.medMngAnalytics,
        description: 'Mesure de l\'impact des playlists et statistiques d\'écoute.',
      },
    ],
  },
  {
    title: 'Contenus & Ressources',
    description: 'Modules de formation, bibliothèques et ressources pédagogiques.',
    routes: [
      {
        label: 'Générateur de contenus',
        path: ROUTE_PATHS.generator,
        description: 'Assistant de création de contenus guidée par l\'IA.',
      },
      {
        label: 'Bibliothèque générale',
        path: ROUTE_PATHS.library,
        description: 'Catalogue transversal des ressources éducatives.',
      },
      {
        label: 'Méthode Med-MNG',
        path: ROUTE_PATHS.mngMethod,
        description: 'Présentation détaillée de la méthodologie Med-MNG.',
      },
      {
        label: 'Communauté',
        path: ROUTE_PATHS.community,
        description: 'Espace collaboratif entre pairs pour partager expériences et cas.',
      },
      {
        label: 'Réalisations',
        path: ROUTE_PATHS.achievements,
        description: 'Badges, certifications et paliers atteints par les utilisateurs.',
      },
      {
        label: 'Favoris',
        path: ROUTE_PATHS.favorites,
        description: 'Raccourci vers les ressources marquées pour un accès rapide.',
      },
      {
        label: 'Planificateur d\'études',
        path: ROUTE_PATHS.studyPlanner,
        description: 'Planification des révisions et suivi des sessions de travail.',
      },
      {
        label: 'Statistiques avancées',
        path: ROUTE_PATHS.statistics,
        description: 'Analyses pédagogiques et rapports détaillés.',
      },
    ],
  },
  {
    title: 'Commerce & Monétisation',
    description: 'Pages orientées vente de contenus et produits additionnels.',
    routes: [
      {
        label: 'Boutique',
        path: ROUTE_PATHS.store,
        description: 'Catalogue des offres, packs et contenus premium.',
      },
      {
        label: 'Détail produit',
        path: ROUTE_PATHS.productDetail,
        examplePath: ROUTE_PATHS.productDetail.replace(':handle', 'son-relaxant'),
        description: 'Fiche détaillée d\'un produit (exemple : son-relaxant).',
      },
    ],
  },
  {
    title: 'Paramètres & Expérience',
    description: 'Configuration personnelle et outils pour améliorer l\'expérience.',
    routes: [
      {
        label: 'Paramètres utilisateur',
        path: ROUTE_PATHS.settings,
        description: 'Gestion des préférences personnelles et de la sécurité.',
      },
      {
        label: 'Design System',
        path: ROUTE_PATHS.designSystem,
        description: 'Documentation interne du design system et composants UI.',
      },
      {
        label: 'Installation PWA',
        path: ROUTE_PATHS.installPwa,
        description: 'Guide pour installer l\'application en mode PWA.',
      },
      {
        label: 'Analytics PWA',
        path: ROUTE_PATHS.pwaAnalytics,
        description: 'Suivi des métriques propres à l\'expérience progressive.',
      },
    ],
  },
  {
    title: 'Communication & Assistance',
    description: 'Interactions en direct et support utilisateur.',
    routes: [
      {
        label: 'Med Chat',
        path: ROUTE_PATHS.chat,
        description: 'Assistant conversationnel pour guider les utilisateurs.',
      },
    ],
  },
  {
    title: 'Conformité & Sécurité',
    description: 'Pages légales, RGPD et documentation de sécurité.',
    routes: [
      {
        label: 'Mentions légales',
        path: ROUTE_PATHS.mentionsLegales,
        description: 'Informations juridiques obligatoires et responsabilité.',
      },
      {
        label: 'Politique de confidentialité',
        path: ROUTE_PATHS.politiqueConfidentialite,
        description: 'Transparence sur le traitement des données personnelles.',
      },
      {
        label: 'Conditions générales d\'utilisation',
        path: ROUTE_PATHS.cgu,
        description: 'Cadre contractuel d\'utilisation de la plateforme.',
      },
      {
        label: 'Déclaration d\'accessibilité',
        path: ROUTE_PATHS.declarationAccessibilite,
        description: 'Engagements et conformité en matière d\'accessibilité.',
      },
      {
        label: 'Mes données RGPD',
        path: ROUTE_PATHS.mesDonneesRgpd,
        description: 'Espace pour consulter et exporter ses données personnelles.',
      },
      {
        label: 'Documentation RLS',
        path: ROUTE_PATHS.rlsDocumentation,
        description: 'Référentiel documentaire pour le dispositif RLS.',
      },
      {
        label: 'Surveillance sécurité',
        path: ROUTE_PATHS.securityMonitoring,
        description: 'Vue consolidée des alertes de sécurité et incidents.',
      },
    ],
  },
  {
    title: 'Audit & Redirections historiques',
    description: 'Routes d\'audit héritées conservées pour compatibilité.',
    routes: [
      {
        label: 'Audit général (legacy)',
        path: ROUTE_PATHS.auditGeneral,
        description: 'Ancien point d\'entrée global redirigé vers l\'audit unifié.',
      },
      {
        label: 'Audit EDN (legacy)',
        path: ROUTE_PATHS.auditEdn,
        description: 'Ancienne vue EDN réorientée vers la nouvelle interface.',
      },
      {
        label: 'Audit unifié (legacy)',
        path: ROUTE_PATHS.auditUnified,
        description: 'Ancien alias préservé pour rétro-compatibilité.',
      },
      {
        label: 'Audit IC1 (legacy)',
        path: ROUTE_PATHS.auditIc1,
        description: 'Route historique pour le volet indicateur IC1.',
      },
      {
        label: 'Audit IC2 (legacy)',
        path: ROUTE_PATHS.auditIc2,
        description: 'Route historique pour le volet indicateur IC2.',
      },
      {
        label: 'Audit IC4 (legacy)',
        path: ROUTE_PATHS.auditIc4,
        description: 'Route historique pour le volet indicateur IC4.',
      },
      {
        label: 'Audit complet (legacy)',
        path: ROUTE_PATHS.auditCompleteLegacy,
        description: 'Ancienne page complète conservée pour redirection.',
      },
    ],
  },
];

const totalRoutes = sitemapSections.reduce((count, section) => count + section.routes.length, 0);

export default function Sitemap() {
  return (
    <div className="min-h-screen bg-muted/10 py-16">
      <Helmet>
        <title>Plan du site | Med-MNG</title>
        <meta
          name="description"
          content="Parcourez l'ensemble des routes Med-MNG classées par catégories fonctionnelles."
        />
      </Helmet>

      <div className="container mx-auto flex max-w-6xl flex-col gap-12 px-4">
        <header className="space-y-4 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Plan du site</h1>
          <p className="text-muted-foreground md:text-lg">
            Retrouvez l'ensemble des {totalRoutes} routes actives classées par domaines fonctionnels. Chaque lien
            pointe vers la page correspondante ou vers un exemple lorsqu'un paramètre est requis.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sitemapSections.map(section => (
            <Card key={section.title} className="flex h-full flex-col">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xl font-semibold">{section.title}</CardTitle>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                    {section.routes.length} routes
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {section.routes.map(route => (
                    <li
                      key={`${section.title}-${route.path}`}
                      className="rounded-lg border bg-card/60 p-3 text-left shadow-sm transition hover:border-primary/60 hover:shadow"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link
                          to={route.examplePath ?? route.path}
                          className="font-medium text-primary transition hover:text-primary/80 hover:underline"
                        >
                          {route.label}
                        </Link>
                        <code className="whitespace-nowrap rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {route.path}
                        </code>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{route.description}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
