import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Users, 
  Settings, 
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export function Admin() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const systemStats = [
    { label: "Utilisateurs actifs", value: "1,247", icon: Users, color: "text-blue-600" },
    { label: "Erreurs système", value: "3", icon: AlertTriangle, color: "text-red-600" },
    { label: "Tâches en cours", value: "12", icon: Clock, color: "text-orange-600" },
    { label: "Système", value: "Opérationnel", icon: CheckCircle, color: "text-green-600" }
  ];

  const quickActions = [
    { title: "Import de données", href: "/admin/import", icon: Upload, description: "Importer des fichiers de données" },
    { title: "Audit système", href: "/admin/audit", description: "Vérifier l'intégrité du système", icon: Shield },
    { title: "Extraction EDN", href: "/admin/extract-edn", description: "Extraire les données EDN", icon: FileText },
    { title: "Extraction ECOS", href: "/admin/extract-ecos", description: "Extraire les données ECOS", icon: Database },
    { title: "Panel admin complet", href: "/admin-panel", description: "Interface d'administration avancée", icon: Settings }
  ];

  const recentLogs = [
    { user: "Système", action: "Sauvegarde automatique effectuée", time: "Il y a 10 min", status: "success" },
    { user: "Admin", action: "Mise à jour configuration", time: "Il y a 25 min", status: "success" },
    { user: "Système", action: "Erreur connexion DB détectée", time: "Il y a 1h", status: "error" },
    { user: "Admin", action: "Import données terminé", time: "Il y a 2h", status: "success" },
    { user: "Système", action: "Maintenance programmée", time: "Il y a 3h", status: "warning" }
  ];

  const handleQuickAction = (action: string) => {
    toast({
      title: "Action déclenchée",
      description: `${action} en cours d'exécution...`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Administration
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestion et supervision du système MedMNG
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau
            </Button>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.label}</CardDescription>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Actions rapides
                  </CardTitle>
                  <CardDescription>
                    Accès direct aux fonctions d'administration principales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.href}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{action.title}</p>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Accéder
                      </Button>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* System Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    État du système
                  </CardTitle>
                  <CardDescription>
                    Surveillance en temps réel des composants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Base de données</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Opérationnelle
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>API Gateway</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Opérationnelle
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span>Stockage</span>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                      Surveillance
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>Administration des comptes utilisateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">Interface de gestion des utilisateurs</p>
                  <Button asChild>
                    <Link to="/admin-panel">Accéder au panel complet</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du contenu</CardTitle>
                <CardDescription>Administration des données et du contenu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link to="/admin/extract-edn" className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8" />
                      <span>Extraction EDN</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link to="/admin/extract-ecos" className="flex flex-col items-center gap-2">
                      <Database className="h-8 w-8" />
                      <span>Extraction ECOS</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration système</CardTitle>
                <CardDescription>Paramètres et configuration avancée</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Configuration système en cours de développement</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Journaux système
                </CardTitle>
                <CardDescription>
                  Historique des actions et événements système
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{log.user}</p>
                      <p className="text-sm text-muted-foreground">{log.action}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <Badge variant={
                        log.status === 'success' ? 'default' : 
                        log.status === 'error' ? 'destructive' : 'secondary'
                      }>
                        {log.status === 'success' ? 'Succès' : 
                         log.status === 'error' ? 'Erreur' : 'Attention'}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{log.time}</p>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger les logs complets
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}