import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingDown, TrendingUp, AlertTriangle, Bug, Shield, Code } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { supabase } from "@/integrations/supabase/client";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface QualityReport {
  id: string;
  project_name: string;
  analyzed_at: string;
  metrics: {
    bugs: number;
    vulnerabilities: number;
    code_smells: number;
    files_analyzed: number;
  };
  summary: string;
  recommendations: string[];
}

interface QualityStats {
  total_reports: number;
  total_bugs: number;
  total_vulnerabilities: number;
  total_code_smells: number;
  avg_bugs: string;
  avg_vulnerabilities: string;
}

interface TimeSeriesDataPoint {
  date: string;
  bugs: number;
  vulnerabilities: number;
  code_smells: number;
  files_analyzed: number;
  project_name: string;
}

export function QualityDashboard() {
  const [reports, setReports] = useState<QualityReport[]>([]);
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const fetchQualityHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (projectFilter !== "all") {
        params.append("project_name", projectFilter);
      }
      
      if (startDate) {
        params.append("start_date", startDate.toISOString());
      }
      
      if (endDate) {
        params.append("end_date", endDate.toISOString());
      }

      params.append("limit", "100");

      const { data, error } = await supabase.functions.invoke("get-quality-history", {
        body: {},
        method: "GET",
      });

      if (error) throw error;

      if (data?.success) {
        setReports(data.data.reports);
        setStats(data.data.stats);
        setTimeSeries(data.data.timeSeries);
      }
    } catch (error) {
      console.error("Erreur récupération historique:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityHistory();
  }, [projectFilter, startDate, endDate]);

  // Préparer les données pour les graphiques
  const lineChartData = {
    labels: timeSeries.map((d) => format(new Date(d.date), "dd/MM")),
    datasets: [
      {
        label: "Bugs",
        data: timeSeries.map((d) => d.bugs),
        borderColor: "hsl(var(--destructive))",
        backgroundColor: "hsl(var(--destructive) / 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Vulnérabilités",
        data: timeSeries.map((d) => d.vulnerabilities),
        borderColor: "hsl(var(--warning))",
        backgroundColor: "hsl(var(--warning) / 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Code Smells",
        data: timeSeries.map((d) => d.code_smells),
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: timeSeries.slice(0, 10).map((d) => format(new Date(d.date), "dd/MM")),
    datasets: [
      {
        label: "Fichiers analysés",
        data: timeSeries.slice(0, 10).map((d) => d.files_analyzed),
        backgroundColor: "hsl(var(--primary) / 0.7)",
        borderColor: "hsl(var(--primary))",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Qualité</h1>
          <p className="text-muted-foreground">
            Visualisation et analyse de la qualité du code
          </p>
        </div>
        <Button onClick={fetchQualityHistory}>Actualiser</Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un projet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les projets</SelectItem>
                {Array.from(new Set(reports.map((r) => r.project_name))).map(
                  (project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Date début"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Date fin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Statistiques */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Rapports
              </CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_reports}</div>
              <p className="text-xs text-muted-foreground">
                Analyses effectuées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugs Totaux</CardTitle>
              <Bug className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_bugs}</div>
              <p className="text-xs text-muted-foreground">
                Moyenne: {stats.avg_bugs} par analyse
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vulnérabilités
              </CardTitle>
              <Shield className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_vulnerabilities}
              </div>
              <p className="text-xs text-muted-foreground">
                Moyenne: {stats.avg_vulnerabilities} par analyse
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Code Smells
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_code_smells}</div>
              <p className="text-xs text-muted-foreground">
                À améliorer
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphique d'évolution */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution de la Qualité</CardTitle>
          <CardDescription>
            Suivi temporel des bugs, vulnérabilités et code smells
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Graphique fichiers analysés */}
      <Card>
        <CardHeader>
          <CardTitle>Fichiers Analysés</CardTitle>
          <CardDescription>
            Nombre de fichiers analysés par rapport (10 derniers)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Liste des derniers rapports */}
      <Card>
        <CardHeader>
          <CardTitle>Derniers Rapports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.slice(0, 5).map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">{report.project_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(report.analyzed_at), "PPP à HH:mm")}
                  </p>
                  <p className="text-sm">{report.summary}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-destructive">
                      {report.metrics.bugs}
                    </div>
                    <div className="text-xs text-muted-foreground">Bugs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-warning">
                      {report.metrics.vulnerabilities}
                    </div>
                    <div className="text-xs text-muted-foreground">Vuln.</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-primary">
                      {report.metrics.code_smells}
                    </div>
                    <div className="text-xs text-muted-foreground">Smells</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
