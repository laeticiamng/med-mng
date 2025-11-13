import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface VisualRegressionData {
  regression_count: number;
  accessibility_issues: number;
  design_consistency: number;
  overall_score: number;
  analyzed_at: string;
}

export function VisualRegressionChart({ data }: { data: VisualRegressionData[] }) {
  const chartData = {
    labels: data.map((d) => new Date(d.analyzed_at).toLocaleDateString("fr-FR", { 
      month: "short", 
      day: "numeric",
      hour: "2-digit"
    })).reverse(),
    datasets: [
      {
        label: "Régressions",
        data: data.map((d) => d.regression_count).reverse(),
        backgroundColor: "hsl(var(--destructive) / 0.8)",
      },
      {
        label: "Problèmes d'accessibilité",
        data: data.map((d) => d.accessibility_issues).reverse(),
        backgroundColor: "hsl(var(--warning) / 0.8)",
      },
      {
        label: "Score global",
        data: data.map((d) => d.overall_score).reverse(),
        backgroundColor: "hsl(var(--primary) / 0.8)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "hsl(var(--foreground))",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "hsl(var(--muted-foreground))",
        },
        grid: {
          color: "hsl(var(--border))",
        },
      },
      x: {
        ticks: {
          color: "hsl(var(--muted-foreground))",
        },
        grid: {
          color: "hsl(var(--border))",
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Régressions Visuelles</CardTitle>
        <CardDescription>
          Analyse des changements visuels et problèmes d'accessibilité
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
