import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ADMIN_NAV_ITEMS } from '@/config/navigation';
import { ROUTE_PATHS } from '@/config/routes';
import {
  Activity,
  BarChart3,
  Database,
  FileText,
  LayoutDashboard,
  Settings,
  Shield,
  Sparkles,
  Target,
  Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickLinkCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  links: Array<{
    path: string;
    label: string;
    badge?: string;
  }>;
}

const categories: QuickLinkCategory[] = [
  {
    title: 'Dashboards',
    description: 'Tableaux de bord et vues d\'ensemble',
    icon: <LayoutDashboard className="h-5 w-5" />,
    links: [
      { path: ROUTE_PATHS.adminPanel, label: 'Panneau Admin' },
      { path: ROUTE_PATHS.dashboard, label: 'Dashboard Standard' },
      { path: ROUTE_PATHS.modularDashboard, label: 'Dashboard Modulaire' },
      { path: ROUTE_PATHS.learningDashboard, label: 'Learning Dashboard', badge: 'Nouveau' },
    ]
  },
  {
    title: 'Import & Extraction',
    description: 'Gestion des données EDN/ECOS',
    icon: <Database className="h-5 w-5" />,
    links: [
      { path: ROUTE_PATHS.adminImport, label: 'Import Données' },
      { path: ROUTE_PATHS.adminExtractEdn, label: 'Extraction EDN' },
      { path: ROUTE_PATHS.adminExtractEcos, label: 'Extraction ECOS' },
      { path: ROUTE_PATHS.adminExtractObjectifs, label: 'Extraction Objectifs' },
      { path: ROUTE_PATHS.adminComplete, label: 'Process Complet' },
    ]
  },
  {
    title: 'Qualité & Audit',
    description: 'Contrôle qualité et audits',
    icon: <Target className="h-5 w-5" />,
    links: [
      { path: ROUTE_PATHS.adminOicQuality, label: 'Qualité OIC' },
      { path: ROUTE_PATHS.adminExtractionQuality, label: 'Qualité Extraction' },
      { path: ROUTE_PATHS.adminAudit, label: 'Audit Admin' },
      { path: ROUTE_PATHS.audit, label: 'Audit Global' },
      { path: ROUTE_PATHS.auditCompleteness, label: 'Audit Complétude' },
      { path: ROUTE_PATHS.ednAudit, label: 'Audit EDN' },
    ]
  },
  {
    title: 'Monitoring & Sécurité',
    description: 'Surveillance et sécurité système',
    icon: <Shield className="h-5 w-5" />,
    links: [
      { path: ROUTE_PATHS.monitoring, label: 'Monitoring' },
      { path: ROUTE_PATHS.securityMonitoring, label: 'Sécurité' },
      { path: ROUTE_PATHS.rlsDocumentation, label: 'Documentation RLS' },
      { path: ROUTE_PATHS.diagnostics, label: 'Diagnostics', badge: 'Dev' },
    ]
  },
  {
    title: 'Plateforme',
    description: 'Configuration et gestion système',
    icon: <Settings className="h-5 w-5" />,
    links: [
      { path: ROUTE_PATHS.platformStatus, label: 'Status Plateforme' },
      { path: ROUTE_PATHS.platformSettings, label: 'Configuration' },
      { path: ROUTE_PATHS.systemManagement, label: 'Gestion Système' },
      { path: ROUTE_PATHS.migrationDashboard, label: 'Migrations' },
    ]
  },
  {
    title: 'Analytics & Performance',
    description: 'Métriques et analyses',
    icon: <BarChart3 className="h-5 w-5" />,
    links: [
      { path: ROUTE_PATHS.accessibilityDashboard, label: 'Accessibilité' },
      { path: ROUTE_PATHS.effectivenessDashboard, label: 'Efficacité' },
      { path: ROUTE_PATHS.pwaAnalytics, label: 'PWA Analytics' },
      { path: ROUTE_PATHS.statistics, label: 'Statistiques' },
    ]
  },
  {
    title: 'Outils Dev',
    description: 'Outils de développement',
    icon: <Wrench className="h-5 w-5" />,
    links: [
      { path: ROUTE_PATHS.designSystem, label: 'Design System', badge: 'Dev' },
    ]
  },
];

export const AdminQuickLinks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Accès Rapide Admin</h2>
          <p className="text-muted-foreground">
            Toutes les pages d'administration accessibles ({ADMIN_NAV_ITEMS.length} pages)
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" />
          {categories.reduce((acc, cat) => acc + cat.links.length, 0)} routes
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.title} className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {category.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {category.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {category.links.map((link) => (
                  <Button
                    key={link.path}
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(link.path)}
                    className="gap-1.5 text-xs h-8"
                  >
                    {link.label}
                    {link.badge && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        {link.badge}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
