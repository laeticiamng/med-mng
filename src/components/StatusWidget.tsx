import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Activity, RefreshCw } from 'lucide-react';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { supabase } from '@/integrations/supabase/client';
export const StatusWidget: React.FC = () => {
  const {
    status,
    completenessScore,
    isLoading,
    refresh,
    isOperational
  } = useSystemStatus({
    silent: true
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [oicScore, setOicScore] = useState<number | null>(null);
  const version = status?.version ?? '—';
  const globalScore = Math.max(0, Math.min(100, Math.round(completenessScore)));
  const stateBadge = useMemo(() => {
    if (isOperational) {
      return <Badge variant="default" className="gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Opérationnel
        </Badge>;
    }
    if (status?.status === 'degraded') {
      return <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          Dégradé
        </Badge>;
    }
    if (status?.status === 'maintenance') {
      return <Badge variant="secondary" className="gap-1">
          <Activity className="w-3 h-3" />
          Maintenance
        </Badge>;
    }
    return <Badge variant="secondary">Vérification…</Badge>;
  }, [isOperational, status?.status]);

  // Rafraîchissement toutes les 15s
  useEffect(() => {
    let mounted = true;
    const loadOIC = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('oic_competences').select('description,intitule').limit(10);
        if (error) {
          if (mounted) setOicScore(null);
          return;
        }
        let problems = 0;
        data?.forEach((comp: any) => {
          if (comp.description?.includes('&lt;') || comp.description?.includes('&gt;') || comp.description?.includes('<') || comp.description?.includes('>') || comp.description?.startsWith('-') || comp.intitule?.includes('[[')) {
            problems++;
          }
        });
        const score = (10 - problems) / 10 * 100;
        if (mounted) setOicScore(Math.max(0, Math.min(100, score)));
      } catch {
        if (mounted) setOicScore(null);
      }
    };
    const tick = async () => {
      setIsRefreshing(true);
      await Promise.allSettled([refresh(), loadOIC()]);
      if (mounted) setLastUpdated(new Date());
      setIsRefreshing(false);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []); // Removed refresh dependency to prevent infinite loop
  return <section aria-label="Statut de la plateforme" className="w-full max-w-3xl mx-auto">
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Statut plateforme MED-MNG</h3>
          {stateBadge}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing || isLoading}
          className="gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Mise à jour...' : 'Actualiser'}
        </Button>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Complétude des données</span>
            <span>{globalScore}%</span>
          </div>
          <Progress value={globalScore} className="h-2" />
        </div>
        
        {oicScore !== null && (
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Qualité OIC</span>
              <span>{oicScore}%</span>
            </div>
            <Progress value={oicScore} className="h-2" />
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Version: {version}</span>
        {lastUpdated && (
          <span>Mise à jour: {lastUpdated.toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  </section>;
};
export default StatusWidget;