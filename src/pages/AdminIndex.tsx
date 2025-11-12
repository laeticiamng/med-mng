import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UploadCloud,
  ClipboardCheck,
  Database,
  Users,
  Target,
  ShieldCheck,
  Workflow,
  LayoutDashboard,
  ArrowRight,
  Activity,
  ShieldAlert,
  Rocket
} from 'lucide-react';

interface AdminToolCard {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  metrics: string;
  highlights: string[];
}

const adminTools: AdminToolCard[] = [
  {
    id: 'import',
    title: 'Importation intelligente',
    description: 'Piloter les pipelines d\'ingestion CSV/Supabase avec validation et rollback automatisés.',
    href: ROUTE_PATHS.adminImport,
    icon: UploadCloud,
    badge: 'Automatisé',
    badgeVariant: 'secondary',
    metrics: 'Dernier import: il y a 2h',
    highlights: ['Contrôles d\'intégrité', 'Journalisation détaillée']
  },
  {
    id: 'audit',
    title: 'Centre d\'audits',
    description: 'Lancer les audits base de données, code et UI pour suivre la conformité globale.',
    href: ROUTE_PATHS.adminAudit,
    icon: ClipboardCheck,
    badge: 'Qualité',
    badgeVariant: 'secondary',
    metrics: '4 audits disponibles',
    highlights: ['Rapports consolidés', 'Suivi des corrections']
  },
  {
    id: 'extract-edn',
    title: 'Extraction EDN',
    description: 'Relancer les extractions des 367 items EDN avec traçabilité complète.',
    href: ROUTE_PATHS.adminExtractEdn,
    icon: Database,
    badge: 'EDN',
    badgeVariant: 'secondary',
    metrics: '367 items synchronisés',
    highlights: ['Export CSV sécurisé', 'Monitoring temps réel']
  },
  {
    id: 'extract-ecos',
    title: 'Extraction ECOS',
    description: 'Superviser les scénarios ECOS et gérer les sessions de simulation clinique.',
    href: ROUTE_PATHS.adminExtractEcos,
    icon: Users,
    badge: 'ECOS',
    badgeVariant: 'secondary',
    metrics: '12 scénarios actifs',
    highlights: ['Suivi par cohorte', 'Exports harmonisés']
  },
  {
    id: 'extract-objectifs',
    title: 'Objectifs pédagogiques',
    description: 'Gérer les extractions des objectifs EDN et la cartographie avec les items.',
    href: ROUTE_PATHS.adminExtractObjectifs,
    icon: Target,
    badge: 'Programmes',
    badgeVariant: 'secondary',
    metrics: '98 objectifs synchronisés',
    highlights: ['Mapping compétences', 'Historique des mises à jour']
  },
  {
    id: 'oic-quality',
    title: 'Qualité OIC',
    description: 'Analyser la complétude des OIC et traiter les anomalies signalées.',
    href: ROUTE_PATHS.adminOicQuality,
    icon: ShieldCheck,
    badge: 'Surveillance',
    badgeVariant: 'secondary',
    metrics: '5 alertes ouvertes',
    highlights: ['Scores de complétude', 'Alertes priorisées']
  },
  {
    id: 'complete-process',
    title: 'Processus automatisé',
    description: 'Orchestrer l\'extraction + audits en une seule opération entièrement supervisée.',
    href: ROUTE_PATHS.adminComplete,
    icon: Workflow,
    badge: 'Pipeline',
    badgeVariant: 'secondary',
    metrics: 'Flux complet en 25 min',
    highlights: ['Orchestration sécurisée', 'Suivi des phases']
  },
  {
    id: 'advanced-panel',
    title: 'Panel avancé',
    description: 'Accéder au dashboard administrateur complet et aux paramètres système.',
    href: ROUTE_PATHS.adminPanel,
    icon: LayoutDashboard,
    badge: 'Pilotage',
    badgeVariant: 'secondary',
    metrics: 'Vue 360° plateforme',
    highlights: ['Statistiques temps réel', 'Gestion des utilisateurs']
  }
];

const systemHighlights = [
  {
    label: 'Incidents critiques',
    value: '0',
    icon: ShieldAlert,
    tone: 'text-emerald-500'
  },
  {
    label: 'Jobs en file',
    value: '3',
    icon: Activity,
    tone: 'text-blue-500'
  },
  {
    label: 'Déploiements récents',
    value: 'v2.4.1',
    icon: Rocket,
    tone: 'text-purple-500'
  }
];

export const AdminIndex: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Administration • MED MNG"
        description="Accès centralisé à tous les outils d'administration MED MNG : import, audits, extractions et monitoring."
        keywords="admin, med mng, import, audit, extraction, monitoring"
        canonical={ROUTE_PATHS.adminIndex}
      />
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
          <div className="absolute inset-0 opacity-40" aria-hidden="true">
            <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
          </div>
          <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16">
            <Badge variant="outline" className="w-fit border-white/40 bg-white/10 text-xs uppercase tracking-widest text-white/80">
              Portail Administrateur
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Gouvernance &amp; Opérations MED MNG</h1>
            <p className="max-w-3xl text-lg text-slate-200/80">
              Centralisez vos actions critiques : importations massives, audits qualité, extractions et supervision des pipelines.
              Chaque carte ouvre directement l\'outil protégé correspondant.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {systemHighlights.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                >
                  <item.icon className={`h-5 w-5 ${item.tone}`} />
                  <div>
                    <p className="text-xs uppercase text-white/60">{item.label}</p>
                    <p className="text-lg font-semibold text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            {adminTools.map((tool) => (
              <Card
                key={tool.id}
                className="group relative overflow-hidden border-white/10 bg-white/5 text-white transition hover:border-blue-400/40 hover:bg-white/10"
              >
                <div className="pointer-events-none absolute -right-12 top-12 hidden h-32 w-32 rounded-full bg-blue-500/10 blur-2xl transition group-hover:scale-110 md:block" />
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200">
                        <tool.icon className="h-6 w-6" />
                      </span>
                      <div>
                        <CardTitle className="text-xl font-semibold text-white">{tool.title}</CardTitle>
                        <CardDescription className="text-sm text-white/60">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>
                    {tool.badge && (
                      <Badge variant={tool.badgeVariant ?? 'secondary'} className="bg-blue-500/15 text-blue-100">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-2 text-sm text-white/70">
                    {tool.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-400" aria-hidden="true" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>{tool.metrics}</span>
                    <Button
                      asChild
                      size="sm"
                      className="group/btn bg-blue-500/90 text-white hover:bg-blue-400"
                    >
                      <Link to={tool.href}>
                        Accéder
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminIndex;
