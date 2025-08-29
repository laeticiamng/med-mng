import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Activity,
  Download,
  Calendar,
  Eye,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Analytics() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    // Simulation d'export
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    toast({
      title: "Export réussi",
      description: "Les données d'analytics ont été exportées avec succès.",
    });
  };

  const analyticsData = [
    { label: "Utilisateurs actifs", value: "1,247", change: "+12%", icon: Users, color: "text-blue-600" },
    { label: "Sessions totales", value: "8,524", change: "+8%", icon: Activity, color: "text-green-600" },
    { label: "Temps moyen", value: "4m 32s", change: "+15%", icon: Clock, color: "text-purple-600" },
    { label: "Taux d'engagement", value: "68%", change: "+5%", icon: Target, color: "text-orange-600" }
  ];

  const recentActivity = [
    { user: "Marie Dubois", action: "Consultation EDN", time: "Il y a 5 min", status: "success" },
    { user: "Jean Martin", action: "Génération musique", time: "Il y a 12 min", status: "success" },
    { user: "Sophie Laurent", action: "Audit complet", time: "Il y a 20 min", status: "warning" },
    { user: "Pierre Durand", action: "Export données", time: "Il y a 35 min", status: "success" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Analytics & Statistiques
            </h1>
            <p className="text-muted-foreground mt-2">
              Tableau de bord des performances et de l'utilisation
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Derniers 30 jours
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isLoading}
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? "Export..." : "Exporter"}
            </Button>
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsData.map((item, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{item.label}</CardDescription>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">{item.change}</span>
                  <span className="text-muted-foreground">vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Utilisation quotidienne
                  </CardTitle>
                  <CardDescription>
                    Activité des utilisateurs sur les 7 derniers jours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Graphique d'utilisation</p>
                      <p className="text-sm">Intégration à venir</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Activité récente
                  </CardTitle>
                  <CardDescription>
                    Actions des utilisateurs en temps réel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                          {activity.status === 'success' ? 'Succès' : 'En cours'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyse des utilisateurs</CardTitle>
                <CardDescription>Comportement et engagement des utilisateurs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">247</div>
                    <div className="text-sm text-muted-foreground">Nouveaux utilisateurs</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">89%</div>
                    <div className="text-sm text-muted-foreground">Taux de rétention</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-sm text-muted-foreground">Sessions par utilisateur</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyse du contenu</CardTitle>
                <CardDescription>Performance et utilisation du contenu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Analyse du contenu en cours de développement</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance système</CardTitle>
                <CardDescription>Métriques techniques et temps de réponse</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Monitoring de performance en cours de développement</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}