import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  SearchCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  TrendingUp,
  Database,
  FileText,
  Users,
  Settings,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export const AuditPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isScanning, setIsScanning] = useState(false);

  const auditStats = {
    totalItems: 1247,
    checkedItems: 892,
    issuesFound: 45,
    resolved: 38,
    pending: 7,
    completionRate: 89.2
  };

  const recentAudits = [
    { 
      id: 1, 
      type: 'data', 
      title: 'Vérification base EDN', 
      status: 'completed', 
      issues: 3, 
      date: '2024-01-15',
      duration: '45min'
    },
    { 
      id: 2, 
      type: 'content', 
      title: 'Audit contenu ECOS', 
      status: 'pending', 
      issues: 12, 
      date: '2024-01-14',
      duration: '1h 20min'
    },
    { 
      id: 3, 
      type: 'system', 
      title: 'Contrôle sécurité', 
      status: 'running', 
      issues: 0, 
      date: '2024-01-14',
      duration: '30min'
    },
    { 
      id: 4, 
      type: 'performance', 
      title: 'Audit performance', 
      status: 'completed', 
      issues: 8, 
      date: '2024-01-13',
      duration: '2h 15min'
    },
  ];

  const issueCategories = [
    { name: 'Données manquantes', count: 18, severity: 'high', color: 'text-red-600' },
    { name: 'Incohérences', count: 12, severity: 'medium', color: 'text-amber-600' },
    { name: 'Duplicatas', count: 8, severity: 'low', color: 'text-blue-600' },
    { name: 'Liens cassés', count: 7, severity: 'medium', color: 'text-amber-600' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'data':
        return <Database className="h-4 w-4 text-blue-600" />;
      case 'content':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'system':
        return <Settings className="h-4 w-4 text-purple-600" />;
      case 'performance':
        return <TrendingUp className="h-4 w-4 text-amber-600" />;
      default:
        return <SearchCheck className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleRunAudit = async () => {
    setIsScanning(true);
    // Simulate audit process
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Centre d'Audit & Qualité
          </h1>
          <p className="text-xl text-muted-foreground">
            Surveillance et contrôle qualité des données médicales
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{auditStats.totalItems}</div>
              <div className="text-sm text-muted-foreground">Total items</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{auditStats.checkedItems}</div>
              <div className="text-sm text-muted-foreground">Vérifiés</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <div className="text-2xl font-bold">{auditStats.issuesFound}</div>
              <div className="text-sm text-muted-foreground">Problèmes</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">{auditStats.pending}</div>
              <div className="text-sm text-muted-foreground">En attente</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{auditStats.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Complétude</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Button 
                onClick={handleRunAudit}
                disabled={isScanning}
                className="w-full h-full flex flex-col gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isScanning ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <SearchCheck className="h-6 w-6" />
                )}
                <span className="text-xs">
                  {isScanning ? 'Scan...' : 'Lancer audit'}
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="issues">Problèmes</TabsTrigger>
                <TabsTrigger value="reports">Rapports</TabsTrigger>
                <TabsTrigger value="settings">Config</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Progress Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Progression des audits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Items vérifiés</span>
                          <span className="text-sm text-muted-foreground">
                            {auditStats.checkedItems}/{auditStats.totalItems}
                          </span>
                        </div>
                        <Progress value={(auditStats.checkedItems / auditStats.totalItems) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Problèmes résolus</span>
                          <span className="text-sm text-muted-foreground">
                            {auditStats.resolved}/{auditStats.issuesFound}
                          </span>
                        </div>
                        <Progress value={(auditStats.resolved / auditStats.issuesFound) * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Audits */}
                <Card>
                  <CardHeader>
                    <CardTitle>Audits récents</CardTitle>
                    <CardDescription>Historique des dernières vérifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentAudits.map((audit) => (
                        <div key={audit.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(audit.type)}
                            <div>
                              <div className="font-medium text-sm">{audit.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {audit.date} • {audit.duration}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {audit.issues > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {audit.issues} problèmes
                              </Badge>
                            )}
                            {getStatusIcon(audit.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="issues" className="space-y-4">
                {/* Issue Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Catégories de problèmes</CardTitle>
                    <CardDescription>Classification des anomalies détectées</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {issueCategories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={`h-4 w-4 ${category.color}`} />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={category.severity === 'high' ? 'destructive' : 
                                      category.severity === 'medium' ? 'default' : 'secondary'}
                            >
                              {category.count}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Voir
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Issue List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Liste des problèmes</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Filter className="h-4 w-4 mr-2" />
                          Filtrer
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { id: 1, title: 'Item EDN-234 sans contenu', severity: 'high', module: 'EDN' },
                        { id: 2, title: 'Lien cassé dans ECOS-45', severity: 'medium', module: 'ECOS' },
                        { id: 3, title: 'Duplication dans base musicale', severity: 'low', module: 'MED-MNG' },
                        { id: 4, title: 'Métadonnées manquantes', severity: 'medium', module: 'EDN' },
                      ].map((issue) => (
                        <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={`h-4 w-4 ${
                              issue.severity === 'high' ? 'text-red-600' :
                              issue.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                            }`} />
                            <div>
                              <div className="font-medium text-sm">{issue.title}</div>
                              <div className="text-xs text-muted-foreground">Module: {issue.module}</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Générateur de rapports</CardTitle>
                    <CardDescription>Créez des rapports d'audit personnalisés</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Période</label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7d">7 derniers jours</SelectItem>
                            <SelectItem value="30d">30 derniers jours</SelectItem>
                            <SelectItem value="90d">3 derniers mois</SelectItem>
                            <SelectItem value="1y">1 année</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Format</label>
                        <Select defaultValue="pdf">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="xlsx">Excel</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Générer le rapport
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration des audits</CardTitle>
                    <CardDescription>Paramètres et règles de vérification</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Fréquence d'audit automatique</label>
                        <Select defaultValue="weekly">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Quotidien</SelectItem>
                            <SelectItem value="weekly">Hebdomadaire</SelectItem>
                            <SelectItem value="monthly">Mensuel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Seuil d'alerte (%)</label>
                        <Input type="number" defaultValue="85" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email notifications</label>
                        <Input type="email" placeholder="admin@medmng.com" />
                      </div>
                    </div>
                    <Button className="w-full">
                      Sauvegarder les paramètres
                    </Button>
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
                  <SearchCheck className="h-4 w-4 mr-2" />
                  Audit complet
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Vérifier base EDN
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Audit contenu
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Contrôle utilisateurs
                </Button>
              </CardContent>
            </Card>

            {/* Health Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">État du système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base de données</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    OK
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
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
              </CardContent>
            </Card>

            {/* Recent Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Logs récents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs font-mono">
                  <div className="text-green-600">[INFO] Audit completed successfully</div>
                  <div className="text-amber-600">[WARN] 3 items need review</div>
                  <div className="text-blue-600">[INFO] Database connection OK</div>
                  <div className="text-red-600">[ERROR] Failed to validate item-234</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};