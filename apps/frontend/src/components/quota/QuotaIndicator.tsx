import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIAQuota } from '@/hooks/useIAQuota';
import { AlertTriangle, Zap, TrendingUp } from 'lucide-react';

interface QuotaIndicatorProps {
  showDetails?: boolean;
  compact?: boolean;
}

export const QuotaIndicator = ({ showDetails = false, compact = false }: QuotaIndicatorProps) => {
  const { quota, loading, fetchQuota, getStats } = useIAQuota();
  const [maxQuota] = useState(160); // Standard: 10+50+100
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (showDetails) {
      getStats(30).then(setStats);
    }
  }, [showDetails, getStats]);

  const quotaPercentage = Math.max(0, Math.min(100, (quota / maxQuota) * 100));
  
  const getQuotaStatus = () => {
    if (quota <= 0) return { status: 'critical', color: 'destructive' as const, icon: AlertTriangle };
    if (quota <= maxQuota * 0.2) return { status: 'warning', color: 'secondary' as const, icon: AlertTriangle };
    return { status: 'good', color: 'default' as const, icon: Zap };
  };

  const { status, color, icon: StatusIcon } = getQuotaStatus();

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <StatusIcon className="h-4 w-4" />
        <span className="font-medium">{quota}</span>
        <span className="text-muted-foreground">/ {maxQuota} crédits</span>
        <Progress value={quotaPercentage} className="w-16 h-2" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <StatusIcon className="h-5 w-5" />
          Crédits IA restants
          <Badge variant={color} className="ml-auto">
            {status === 'critical' ? 'Épuisé' : status === 'warning' ? 'Faible' : 'Suffisant'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Utilisation</span>
            <span className="font-medium">{quota} / {maxQuota} crédits</span>
          </div>
          <Progress value={quotaPercentage} className="h-2" />
        </div>

        {loading && (
          <p className="text-sm text-muted-foreground">Mise à jour...</p>
        )}

        {showDetails && stats && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Statistiques (30 derniers jours)
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total opérations</p>
                <p className="font-medium">{stats.total_operations || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Crédits utilisés</p>
                <p className="font-medium">{stats.total_credits_used || 0}</p>
              </div>
            </div>

            {stats.by_service && stats.by_service.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Par service :</p>
                {stats.by_service.map((service: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="capitalize">{service.service_type}</span>
                    <span>{service.total_credits} crédits</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button 
          onClick={fetchQuota}
          disabled={loading}
          className="w-full text-sm text-primary hover:underline disabled:opacity-50"
        >
          Actualiser
        </button>
      </CardContent>
    </Card>
  );
};