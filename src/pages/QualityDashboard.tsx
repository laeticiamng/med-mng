import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react";
import { CodeQualityChart } from "@/components/quality/CodeQualityChart";
import { VisualRegressionChart } from "@/components/quality/VisualRegressionChart";
import { NotificationsList } from "@/components/quality/NotificationsList";

interface QualityMetrics {
  bugs: number;
  vulnerabilities: number;
  code_smells: number;
  coverage: number;
  maintainability_rating: string;
  security_rating: string;
}

interface VisualMetrics {
  regression_count: number;
  accessibility_issues: number;
  design_consistency: number;
  overall_score: number;
}

export default function QualityDashboard() {
  const [codeMetrics, setCodeMetrics] = useState<QualityMetrics[]>([]);
  const [visualMetrics, setVisualMetrics] = useState<VisualMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    
    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const [codeData, visualData] = await Promise.all([
        supabase
          .from("code_quality_reports")
          .select("*")
          .order("analyzed_at", { ascending: false })
          .limit(10),
        supabase
          .from("visual_quality_reports")
          .select("*")
          .order("analyzed_at", { ascending: false })
          .limit(10),
      ]);

      if (codeData.data) setCodeMetrics(codeData.data);
      if (visualData.data) setVisualMetrics(visualData.data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const latestCode = codeMetrics[0];
  const latestVisual = visualMetrics[0];

  const getSeverityColor = (value: number, thresholds: [number, number]) => {
    if (value >= thresholds[1]) return "destructive";
    if (value >= thresholds[0]) return "warning";
    return "success";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Activity className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Qualité IA</h1>
          <p className="text-muted-foreground">Analyse en temps réel par OpenAI</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="w-4 h-4 animate-pulse" />
          Actif
        </Badge>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugs</CardTitle>
            {latestCode?.bugs === 0 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestCode?.bugs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Détectés par IA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnérabilités</CardTitle>
            {latestCode?.vulnerabilities === 0 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestCode?.vulnerabilities || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sécurité: {latestCode?.security_rating || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Régressions Visuelles</CardTitle>
            {latestVisual?.regression_count === 0 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestVisual?.regression_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Score: {latestVisual?.overall_score || 0}/100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenabilité</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestCode?.maintainability_rating || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              Code smells: {latestCode?.code_smells || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertes critiques */}
      {(latestCode?.vulnerabilities > 0 || latestCode?.bugs > 5) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Problèmes critiques détectés: {latestCode.vulnerabilities} vulnérabilités et {latestCode.bugs} bugs nécessitent une attention immédiate.
          </AlertDescription>
        </Alert>
      )}

      {/* Graphiques et détails */}
      <Tabs defaultValue="code" className="space-y-4">
        <TabsList>
          <TabsTrigger value="code">Qualité du Code</TabsTrigger>
          <TabsTrigger value="visual">Régressions Visuelles</TabsTrigger>
          <TabsTrigger value="notifications">Notifications IA</TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="space-y-4">
          <CodeQualityChart data={codeMetrics} />
        </TabsContent>

        <TabsContent value="visual" className="space-y-4">
          <VisualRegressionChart data={visualMetrics} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
