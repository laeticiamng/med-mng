import React, { useState } from 'react';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Users, 
  Database, 
  Activity, 
  Shield, 
  FileText, 
  BarChart3, 
  Upload,
  Download,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Server,
  Zap
} from 'lucide-react';

const adminModules = [
  {
    title: 'Gestion des utilisateurs',
    description: 'Administrer les comptes et permissions',
    icon: Users,
    link: '/admin-panel',
    status: 'active',
    badge: '1,247 utilisateurs'
  },
  {
    title: 'Base de données',
    description: 'Maintenance et sauvegarde des données',
    icon: Database,
    link: '/system-health',
    status: 'active',
    badge: '99.9% uptime'
  },
  {
    title: 'Monitoring système',
    description: 'Surveillance des performances',
    icon: Activity,
    link: '/system-health',
    status: 'warning',
    badge: 'CPU: 68%'
  },
  {
    title: 'Sécurité',
    description: 'Logs et contrôles de sécurité',
    icon: Shield,
    link: '/admin-panel',
    status: 'active',
    badge: 'Sécurisé'
  },
  {
    title: 'Audit complet',
    description: 'Audit et vérification des données',
    icon: FileText,
    link: '/admin/audit',
    status: 'active',
    badge: 'Dernière: Hier'
  },
  {
    title: 'Analytics',
    description: 'Statistiques d\'utilisation',
    icon: BarChart3,
    link: '/analytics',
    status: 'active',
    badge: '+12% ce mois'
  },
  {
    title: 'Import de données',
    description: 'Importer des nouvelles données',
    icon: Upload,
    link: '/admin/import',
    status: 'active',
    badge: 'Prêt'
  },
  {
    title: 'Export système',
    description: 'Exporter les données',
    icon: Download,
    link: '/export',
    status: 'active',
    badge: 'Disponible'
  },
  {
    title: 'Extraction EDN',
    description: 'Extraire et traiter les données EDN',
    icon: Wrench,
    link: '/admin/extract-edn',
    status: 'active',
    badge: 'Prêt'
  },
  {
    title: 'Extraction ECOS',
    description: 'Extraire et traiter les données ECOS',
    icon: Wrench,
    link: '/admin/extract-ecos',
    status: 'active',
    badge: 'Prêt'
  },
  {
    title: 'Qualité OIC',
    description: 'Gestionnaire de qualité des données OIC',
    icon: CheckCircle,
    link: '/admin/oic-quality',
    status: 'active',
    badge: 'Optimal'
  },
  {
    title: 'Processus complet',
    description: 'Processus d\'administration complet',
    icon: Settings,
    link: '/admin/complete',
    status: 'active',
    badge: 'Automatisé'
  }
];

const systemStats = [
  { label: 'Utilisateurs actifs', value: '1,247', change: '+8.2%', icon: Users },
  { label: 'Requêtes/min', value: '8,432', change: '+12.1%', icon: Zap },
  { label: 'Uptime', value: '99.98%', change: '+0.02%', icon: Server },
  { label: 'Stockage utilisé', value: '2.8TB', change: '+5.4%', icon: Database }
];

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      default:
        return 'bg-green-500/10 text-green-600 border-green-200';
    }
  };

  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 text-container break-words-force overflow-safe">
            Centre d'Administration MED-MNG
          </h1>
          <p className="text-white/80 text-lg text-container break-words-normal overflow-safe">
            Gestion complète de la plateforme et supervision système
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <PremiumCard key={index} className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </h3>
                      </div>
                      <Badge variant={stat.change.startsWith('+') ? 'default' : 'secondary'}>
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </PremiumCard>
                );
              })}
            </div>

            {/* Quick Actions */}
            <PremiumCard className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Actions rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/system-health" className="block">
                  <PremiumButton className="h-16 w-full flex flex-col space-y-1">
                    <Activity className="w-6 h-6" />
                    <span>Vérifier la santé système</span>
                  </PremiumButton>
                </Link>
                <Link to="/admin/audit" className="block">
                  <PremiumButton variant="outline" className="h-16 w-full flex flex-col space-y-1">
                    <FileText className="w-6 h-6" />
                    <span>Lancer un audit</span>
                  </PremiumButton>
                </Link>
                <Link to="/admin/import" className="block">
                  <PremiumButton variant="outline" className="h-16 w-full flex flex-col space-y-1">
                    <Upload className="w-6 h-6" />
                    <span>Importer des données</span>
                  </PremiumButton>
                </Link>
              </div>
            </PremiumCard>
          </TabsContent>

          <TabsContent value="modules" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminModules.map((module, index) => {
                const IconComponent = module.icon;
                return (
                  <PremiumCard key={index} className="p-6 hover:scale-105 transition-transform">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{module.title}</h3>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(module.status)}
                            <Badge className={getStatusColor(module.status)}>
                              {module.badge}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {module.description}
                    </p>
                    
                    <Link to={module.link} className="block">
                      <PremiumButton className="w-full">
                        Accéder
                      </PremiumButton>
                    </Link>
                  </PremiumCard>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-8">
            <PremiumCard className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Surveillance système</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">État des services</h3>
                  <div className="space-y-3">
                    {['API Principal', 'Base de données', 'Stockage fichiers', 'Service de mail'].map((service) => (
                      <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                        <span>{service}</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Opérationnel</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Alertes récentes</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-500/10 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">CPU usage élevé</span>
                        <span className="text-xs text-muted-foreground">Il y a 2h</span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Backup complété</span>
                        <span className="text-xs text-muted-foreground">Il y a 6h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </TabsContent>
        </Tabs>
      </div>
    </PremiumLayout>
  );
};

export default Admin;