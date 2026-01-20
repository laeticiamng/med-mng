import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, Users, Clock, AlertTriangle, 
  ChevronRight, Zap, Shield, Database,
  RefreshCw, Eye, Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MobileStats {
  activeUsers: number;
  systemHealth: number;
  dataIntegrity: number;
  recentAlerts: number;
  quickActions: Array<{
    title: string;
    description: string;
    action: string;
    icon: React.ComponentType<{ className?: string }>;
    urgent?: boolean;
  }>;
}

export default function MobileOptimizedDashboard() {
  const [stats, setStats] = useState<MobileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMobileStats = async () => {
    try {
      // Requêtes parallèles pour les vraies données
      const [
        { data: extractionLogs },
        { data: integrityReports },
        { count: profilesCount },
        { count: recentActivityCount }
      ] = await Promise.all([
        supabase.from('extraction_logs').select('*').limit(50),
        supabase.from('data_integrity_reports').select('*').limit(20),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_activity_log').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Nombre réel d'utilisateurs depuis profiles
      const uniqueUsers = profilesCount || 0;
      const successfulExtractions = extractionLogs?.filter(log => log.status === 'completed').length || 0;
      const totalExtractions = extractionLogs?.length || 1;
      const systemHealth = (successfulExtractions / totalExtractions) * 100;
      
      const criticalIssues = integrityReports?.filter(
        report => report.issues_count > 0
      ).length || 0;

      setStats({
        activeUsers: uniqueUsers,
        systemHealth: Math.round(systemHealth),
        dataIntegrity: Math.max(0, 100 - (criticalIssues * 10)),
        recentAlerts: criticalIssues,
        quickActions: [
          {
            title: "Vérification Intégrité",
            description: "Scanner les données",
            action: "scan_integrity",
            icon: Shield,
            urgent: criticalIssues > 5
          },
          {
            title: "Export Rapide",
            description: "Exporter les données",
            action: "quick_export",
            icon: Download
          },
          {
            title: "Analytics Live",
            description: "Voir les métriques",
            action: "view_analytics",
            icon: TrendingUp
          },
          {
            title: "Monitoring Système",
            description: "État des services",
            action: "system_monitoring",
            icon: Database
          }
        ]
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats mobile:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMobileStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMobileStats();
    toast.success('Données actualisées');
  };

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'scan_integrity':
          await supabase.functions.invoke('data-integrity-checker');
          toast.success('Scan d\'intégrité lancé');
          break;
        case 'quick_export':
          await supabase.functions.invoke('admin-export', {
            body: { table: 'edn_items_immersive', format: 'json' }
          });
          toast.success('Export en cours...');
          break;
        case 'view_analytics':
          toast.info('Redirection vers analytics...');
          break;
        case 'system_monitoring':
          toast.info('Ouverture du monitoring...');
          break;
      }
    } catch (error) {
      toast.error('Erreur lors de l\'action');
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20"> {/* pb-20 pour éviter la nav bottom */}
      {/* Header Mobile */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble mobile
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* KPIs Compacts */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Utilisateurs</span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold">{stats.activeUsers}</span>
            <span className="text-xs text-muted-foreground ml-1">actifs</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-success" />
            <span className="text-xs font-medium">Système</span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold">{stats.systemHealth}%</span>
            <div className="mt-1">
              <Progress value={stats.systemHealth} className="h-1" />
            </div>
          </div>
        </Card>
      </div>

      {/* Alertes */}
      {stats.recentAlerts > 0 && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="font-medium text-warning">
                {stats.recentAlerts} alerte{stats.recentAlerts > 1 ? 's' : ''} récente{stats.recentAlerts > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-sm text-warning/80 mt-1">
              Vérification d'intégrité recommandée
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions Rapides */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`w-full justify-between h-auto p-3 ${
                action.urgent ? 'border border-warning/20 bg-warning/5 hover:bg-warning/10' : ''
              }`}
              onClick={() => handleQuickAction(action.action)}
            >
              <div className="flex items-center gap-3">
                <action.icon className={`h-4 w-4 ${
                  action.urgent ? 'text-warning' : 'text-muted-foreground'
                }`} />
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {action.urgent && (
                  <Badge variant="destructive" className="text-xs">
                    Urgent
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Métriques Détaillées */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">État du Système</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Intégrité des données</span>
              <span className="font-medium">{stats.dataIntegrity}%</span>
            </div>
            <Progress value={stats.dataIntegrity} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Performance système</span>
              <span className="font-medium">{stats.systemHealth}%</span>
            </div>
            <Progress value={stats.systemHealth} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="space-y-1">
          <div className="text-lg font-bold text-primary">{stats.activeUsers}</div>
          <div className="text-xs text-muted-foreground">DAU</div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-success">{stats.systemHealth}%</div>
          <div className="text-xs text-muted-foreground">Uptime</div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-warning">{stats.recentAlerts}</div>
          <div className="text-xs text-muted-foreground">Alertes</div>
        </div>
      </div>
    </div>
  );
}