import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendingChartProps {
  period: '7d' | '30d' | '90d';
}

export function TrendingChart({ period }: TrendingChartProps) {
  const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  
  const { data: codeReports } = useQuery({
    queryKey: ['code-quality-trending', period],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      const { data, error } = await supabase
        .from('code_quality_reports')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: visualReports } = useQuery({
    queryKey: ['visual-quality-trending', period],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      const { data, error } = await supabase
        .from('visual_quality_reports')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const codeData = {
    labels: codeReports?.map(r => new Date(r.created_at).toLocaleDateString('fr-FR')) || [],
    datasets: [
      {
        label: 'Bugs',
        data: codeReports?.map(r => r.metrics?.bugs || 0) || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Vulnérabilités',
        data: codeReports?.map(r => r.metrics?.vulnerabilities || 0) || [],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Code Smells',
        data: codeReports?.map(r => r.metrics?.code_smells || 0) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const visualData = {
    labels: visualReports?.map(r => new Date(r.created_at).toLocaleDateString('fr-FR')) || [],
    datasets: [
      {
        label: 'Régressions visuelles',
        data: visualReports?.map(r => r.regressions_detected || 0) || [],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Problèmes accessibilité',
        data: visualReports?.map(r => r.accessibility_issues?.length || 0) || [],
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const periodLabel = period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : '90 jours';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tendance Qualité du Code - {periodLabel}</CardTitle>
          <CardDescription>
            Évolution des métriques de qualité sur les {periodLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line data={codeData} options={options} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tendance Qualité Visuelle - {periodLabel}</CardTitle>
          <CardDescription>
            Évolution des régressions visuelles sur les {periodLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line data={visualData} options={options} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
