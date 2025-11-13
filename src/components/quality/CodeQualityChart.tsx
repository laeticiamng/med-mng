import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CodeQualityData {
  bugs: number;
  vulnerabilities: number;
  code_smells: number;
  coverage: number;
  analyzed_at: string;
}

export function CodeQualityChart({ data }: { data: CodeQualityData[] }) {
  const chartData = {
    labels: data.map((d) => new Date(d.analyzed_at).toLocaleDateString("fr-FR", { 
      month: "short", 
      day: "numeric",
      hour: "2-digit"
    })).reverse(),
    datasets: [
      {
        label: "Bugs",
        data: data.map((d) => d.bugs).reverse(),
        borderColor: "hsl(var(--destructive))",
        backgroundColor: "hsl(var(--destructive) / 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Vulnérabilités",
        data: data.map((d) => d.vulnerabilities).reverse(),
        borderColor: "hsl(var(--warning))",
        backgroundColor: "hsl(var(--warning) / 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Code Smells",
        data: data.map((d) => d.code_smells).reverse(),
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.1)",
        tension: 0.4,
        fill: true,
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
      title: {
        display: false,
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
        <CardTitle>Évolution de la Qualité du Code</CardTitle>
        <CardDescription>
          Analyse des bugs, vulnérabilités et code smells au fil du temps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
