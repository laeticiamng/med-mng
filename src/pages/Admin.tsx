import React from 'react';
import { SubPageLayout } from '@/components/platform/SubPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, FileText, BarChart3, Users, Settings, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const Admin: React.FC = () => {
  const navigate = useNavigate();

  const adminSections = [
    {
      title: 'Audit & Contrôle',
      icon: Shield,
      description: 'Audits complets et contrôles qualité',
      actions: [
        { label: 'Audit Général', path: '/audit', color: 'primary' },
        { label: 'Audit Admin', path: '/admin/audit', color: 'secondary' },
        { label: 'Complétude', path: '/audit-completeness', color: 'outline' },
      ]
    },
    {
      title: 'Import & Export',
      icon: Database,
      description: 'Gestion des données et migrations',
      actions: [
        { label: 'Import Données', path: '/admin/import', color: 'primary' },
        { label: 'Export EDN', path: '/admin/extract-edn', color: 'secondary' },
        { label: 'Export ECOS', path: '/admin/extract-ecos', color: 'outline' },
      ]
    },
    {
      title: 'Qualité des Données',
      icon: BarChart3,
      description: 'Surveillance et amélioration continue',
      actions: [
        { label: 'Tableau de Bord', path: '/content-quality', color: 'primary' },
        { label: 'OIC Quality', path: '/admin/oic-quality', color: 'secondary' },
        { label: 'Santé Système', path: '/system-health', color: 'outline' },
      ]
    },
    {
      title: 'Processus Avancés',
      icon: Settings,
      description: 'Outils et processus spécialisés',
      actions: [
        { label: 'Processus Complet', path: '/admin/complete', color: 'primary' },
        { label: 'Extract Objectifs', path: '/admin/extract-objectifs', color: 'secondary' },
        { label: 'Test Extraction', path: '/test-extraction', color: 'outline' },
      ]
    }
  ];

  const quickStats = [
    { label: 'Total Items EDN', value: '2,847', icon: FileText },
    { label: 'Utilisateurs', value: '8,523', icon: Users },
    { label: 'Taux de Qualité', value: '94.2%', icon: BarChart3 },
    { label: 'Dernière Sync', value: '2 min', icon: Database },
  ];

  return (
    <SubPageLayout
      title="Administration"
      subtitle="Gestion avancée de la plateforme MED-MNG"
      breadcrumbs={[
        { label: 'Accueil', href: '/' },
        { label: 'Administration', href: '/admin' }
      ]}
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {adminSections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant={action.color as any}
                      className="w-full justify-start"
                      onClick={() => navigate(action.path)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" onClick={() => navigate('/admin-panel')}>
                <Shield className="h-4 w-4 mr-2" />
                Panel Admin
              </Button>
              <Button variant="outline" onClick={() => navigate('/validation-ux')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Validation UX
              </Button>
              <Button variant="outline" onClick={() => navigate('/export')}>
                <Download className="h-4 w-4 mr-2" />
                Export Global
              </Button>
              <Button variant="outline" onClick={() => navigate('/test-subscriptions')}>
                <Users className="h-4 w-4 mr-2" />
                Test Abonnements
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>État du Système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Base de données: Opérationnelle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">API: Fonctionnelle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Cache: En cours de mise à jour</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default Admin;