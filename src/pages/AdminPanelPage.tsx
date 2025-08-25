import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Users, 
  Settings, 
  Database, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  TrendingUp,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';

export const AdminPanelPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('users');

  const systemStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalContent: 3456,
    serverLoad: 67,
    memoryUsage: 45,
    diskUsage: 78,
    apiCalls: 12847
  };

  const users = [
    { id: 1, name: 'Dr. Martin Dubois', email: 'martin.dubois@medecin.fr', role: 'admin', status: 'active', lastLogin: '2024-01-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.j@student.com', role: 'student', status: 'active', lastLogin: '2024-01-14' },
    { id: 3, name: 'Prof. Claire Moreau', email: 'c.moreau@univ.fr', role: 'teacher', status: 'inactive', lastLogin: '2024-01-10' },
    { id: 4, name: 'Alex Chen', email: 'alex.chen@med.com', role: 'student', status: 'suspended', lastLogin: '2024-01-12' },
  ];

  const systemLogs = [
    { id: 1, level: 'info', message: 'User login successful', timestamp: '2024-01-15 14:30:25', source: 'auth' },
    { id: 2, level: 'warning', message: 'High memory usage detected', timestamp: '2024-01-15 14:25:10', source: 'system' },
    { id: 3, level: 'error', message: 'Database connection timeout', timestamp: '2024-01-15 14:20:15', source: 'database' },
    { id: 4, level: 'info', message: 'Backup completed successfully', timestamp: '2024-01-15 14:15:00', source: 'backup' },
  ];

  const featureFlags = [
    { id: 'new-ui', name: 'Nouvelle interface', description: 'Interface utilisateur redesignée', enabled: true },
    { id: 'ai-chat', name: 'Chat IA avancé', description: 'Fonctionnalités IA étendues', enabled: false },
    { id: 'mobile-app', name: 'Application mobile', description: 'Support application mobile', enabled: true },
    { id: 'analytics', name: 'Analytics avancés', description: 'Suivi détaillé des performances', enabled: false },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <CheckCircle2 className="h-3 w-3 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-amber-600" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-4">
            Panneau d'Administration
          </h1>
          <p className="text-xl text-muted-foreground">
            Gestion et supervision de la plateforme MED-MNG
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold">{systemStats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Utilisateurs</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Activity className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold">{systemStats.activeUsers}</div>
              <div className="text-xs text-muted-foreground">Actifs</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Database className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-xl font-bold">{systemStats.totalContent}</div>
              <div className="text-xs text-muted-foreground">Contenus</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Cpu className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <div className="text-xl font-bold">{systemStats.serverLoad}%</div>
              <div className="text-xs text-muted-foreground">CPU</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <MemoryStick className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <div className="text-xl font-bold">{systemStats.memoryUsage}%</div>
              <div className="text-xs text-muted-foreground">RAM</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <HardDrive className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
              <div className="text-xl font-bold">{systemStats.diskUsage}%</div>
              <div className="text-xs text-muted-foreground">Disque</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-teal-600" />
              <div className="text-xl font-bold">{systemStats.apiCalls}</div>
              <div className="text-xs text-muted-foreground">API Calls</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="system">Système</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                {/* User Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Gestion des utilisateurs</span>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-64"
                          />
                        </div>
                        <Button size="sm" variant="outline">
                          <Filter className="h-4 w-4 mr-2" />
                          Filtrer
                        </Button>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Nouveau
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(user.status)}
                            <div>
                              <div className="font-medium text-sm">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                            <Badge variant="outline">{user.role}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Dernière connexion: {user.lastLogin}
                            </span>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Voir
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3 mr-1" />
                              Modifier
                            </Button>
                            <Button size="sm" variant="outline">
                              {user.status === 'suspended' ? (
                                <Unlock className="h-3 w-3 mr-1" />
                              ) : (
                                <Lock className="h-3 w-3 mr-1" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestion du contenu</CardTitle>
                    <CardDescription>Supervision du contenu éducatif</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">280</div>
                        <div className="text-sm text-muted-foreground">Items EDN</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">45</div>
                        <div className="text-sm text-muted-foreground">Simulations ECOS</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">127</div>
                        <div className="text-sm text-muted-foreground">Chansons</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">89</div>
                        <div className="text-sm text-muted-foreground">Vidéos</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Importer contenu
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter données
                      </Button>
                      <Button variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Synchroniser
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Monitoring système</CardTitle>
                    <CardDescription>Surveillance des performances</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Charge CPU</span>
                          <span className="text-sm text-muted-foreground">{systemStats.serverLoad}%</span>
                        </div>
                        <Progress value={systemStats.serverLoad} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Utilisation RAM</span>
                          <span className="text-sm text-muted-foreground">{systemStats.memoryUsage}%</span>
                        </div>
                        <Progress value={systemStats.memoryUsage} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Espace disque</span>
                          <span className="text-sm text-muted-foreground">{systemStats.diskUsage}%</span>
                        </div>
                        <Progress value={systemStats.diskUsage} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Flags</CardTitle>
                    <CardDescription>Activation/désactivation des fonctionnalités</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {featureFlags.map((flag) => (
                      <div key={flag.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{flag.name}</div>
                          <div className="text-xs text-muted-foreground">{flag.description}</div>
                        </div>
                        <Switch checked={flag.enabled} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Logs système</CardTitle>
                    <CardDescription>Journal des événements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-2">
                        {systemLogs.map((log) => (
                          <div key={log.id} className="flex items-center gap-3 p-2 text-sm font-mono bg-muted/30 rounded">
                            {getLogIcon(log.level)}
                            <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                            <span className="font-medium">[{log.source.toUpperCase()}]</span>
                            <span>{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Backup base de données
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Redémarrer services
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import en masse
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuration
                </Button>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">État des services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Gateway</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    OK
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base de données</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    OK
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Attention
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CDN</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    OK
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alertes récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2 bg-amber-50 border border-amber-200 rounded">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Espace disque faible</div>
                      <div className="text-xs text-muted-foreground">il y a 2h</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-red-50 border border-red-200 rounded">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Connexion DB échouée</div>
                      <div className="text-xs text-muted-foreground">il y a 4h</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};