import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Database,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Couleurs sémantiques pour les graphiques
const CHART_COLORS = {
  critical: 'hsl(var(--destructive))',
  high: 'hsl(var(--warning))',
  medium: 'hsl(var(--chart-4))',
  low: 'hsl(var(--primary))',
};

const SecurityMonitoring = () => {
  const {
    corrections,
    correctionsLoading,
    alerts,
    alertsLoading,
    metrics,
    metricsLoading,
    latestMetrics,
    openAlerts,
    criticalAlerts,
    refreshMetrics,
    refreshing,
    updateAlertStatus,
  } = useSecurityMonitoring();

  const [selectedTab, setSelectedTab] = useState("overview");

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive";
      case "high":
        return "bg-warning";
      case "medium":
        return "bg-warning/70";
      case "low":
        return "bg-primary";
      case "info":
        return "bg-muted-foreground";
      default:
        return "bg-muted-foreground";
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "outline";
      case "low":
        return "secondary";
      case "info":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      case "acknowledged":
        return <Eye className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "dismissed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Prepare chart data
  const chartData =
    metrics?.map((m) => ({
      date: format(new Date(m.recorded_at), "dd/MM HH:mm", { locale: fr }),
      score: m.security_score,
      tables_with_rls: m.tables_with_rls,
      total_policies: m.total_policies,
    })) || [];

  const trendData =
    metrics?.slice(0, 7).map((m) => ({
      date: format(new Date(m.recorded_at), "dd/MM", { locale: fr }),
      critical: m.critical_issues,
      high: m.high_issues,
      medium: m.medium_issues,
      low: m.low_issues,
    })) || [];

  const scoreChange =
    metrics && metrics.length > 1
      ? metrics[0].security_score - metrics[1].security_score
      : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Monitoring de Sécurité
            </h1>
            <p className="text-muted-foreground">
              Surveillance en temps réel de la sécurité de la base de données
            </p>
          </div>
          <Button
            onClick={() => refreshMetrics()}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Score de sécurité</div>
                <div className="text-3xl font-bold text-primary">
                  {latestMetrics?.security_score || 0}%
                </div>
                {scoreChange !== 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    {scoreChange > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-success" />
                        <span className="text-success">+{scoreChange}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-destructive" />
                        <span className="text-destructive">{scoreChange}%</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Shield className="h-8 w-8 text-primary opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Alertes actives</div>
                <div className="text-3xl font-bold">{openAlerts.length}</div>
                <div className="text-xs text-muted-foreground">
                  {criticalAlerts.length} critiques
                </div>
              </div>
              <AlertTriangle
                className={`h-8 w-8 ${
                  criticalAlerts.length > 0 ? "text-destructive" : "text-warning"
                } opacity-20`}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Tables RLS</div>
                <div className="text-3xl font-bold">
                  {latestMetrics?.tables_with_rls || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  sur {latestMetrics?.total_tables || 0} tables
                </div>
              </div>
              <Database className="h-8 w-8 text-success opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Policies actives</div>
                <div className="text-3xl font-bold">
                  {latestMetrics?.total_policies || 0}
                </div>
                <div className="text-xs text-muted-foreground">RLS policies</div>
              </div>
              <Lock className="h-8 w-8 text-accent opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Corrections</div>
                <div className="text-3xl font-bold">{corrections?.length || 0}</div>
                <div className="text-xs text-muted-foreground">appliquées</div>
              </div>
              <CheckCircle className="h-8 w-8 text-primary opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Évolution du Score de Sécurité
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData.reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendance des Issues
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData.reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="critical" stroke={CHART_COLORS.critical} name="Critiques" />
                <Line type="monotone" dataKey="high" stroke={CHART_COLORS.high} name="Hautes" />
                <Line type="monotone" dataKey="medium" stroke={CHART_COLORS.medium} name="Moyennes" />
                <Line type="monotone" dataKey="low" stroke={CHART_COLORS.low} name="Basses" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="alerts">
              Alertes ({openAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Métriques Actuelles</h3>
              {metricsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : latestMetrics ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Issues Critiques</div>
                    <div className="text-2xl font-bold text-destructive">
                      {latestMetrics.critical_issues}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Issues Hautes</div>
                    <div className="text-2xl font-bold text-warning">
                      {latestMetrics.high_issues}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Issues Moyennes</div>
                    <div className="text-2xl font-bold text-warning/80">
                      {latestMetrics.medium_issues}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Issues Basses</div>
                    <div className="text-2xl font-bold text-primary">
                      {latestMetrics.low_issues}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Alertes de Sécurité</h3>
              {alertsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : alerts && alerts.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <Card key={alert.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(alert.status)}
                              <h4 className="font-semibold">{alert.title}</h4>
                              <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">{alert.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {alert.description}
                            </p>
                            {alert.recommendation && (
                              <p className="text-sm text-primary">
                                💡 {alert.recommendation}
                              </p>
                            )}
                            {alert.affected_resource && (
                              <p className="text-xs text-muted-foreground">
                                Ressource: <code>{alert.affected_resource}</code>
                              </p>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(alert.created_at), "PPpp", { locale: fr })}
                            </div>
                          </div>
                          {alert.status === "open" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateAlertStatus({
                                    alertId: alert.id,
                                    status: "acknowledged",
                                  })
                                }
                              >
                                Vu
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateAlertStatus({
                                    alertId: alert.id,
                                    status: "resolved",
                                  })
                                }
                              >
                                Résolu
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
                  Aucune alerte active
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Historique des Corrections</h3>
              {correctionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : corrections && corrections.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {corrections.map((correction) => (
                      <Card key={correction.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 mt-2 rounded-full ${getSeverityColor(
                              correction.severity
                            )}`}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">
                                {correction.table_or_function_name}
                              </h4>
                              <Badge variant={getSeverityBadgeVariant(correction.severity)}>
                                {correction.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {correction.issue_description}
                            </p>
                            <p className="text-sm text-success">
                              ✓ {correction.correction_applied}
                            </p>
                            {correction.notes && (
                              <p className="text-xs text-muted-foreground">
                                {correction.notes}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(correction.applied_at), "PPpp", {
                                locale: fr,
                              })}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune correction enregistrée
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SecurityMonitoring;
