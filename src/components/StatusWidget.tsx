import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Activity, RefreshCw } from 'lucide-react';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { supabase } from '@/integrations/supabase/client';
export const StatusWidget: React.FC = () => {
  const { status, completenessScore, isLoading, refresh, isOperational } = useSystemStatus({ silent: true });
const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [oicScore, setOicScore] = useState<number | null>(null);
  const version = status?.version ?? '—';
  const globalScore = Math.max(0, Math.min(100, Math.round(completenessScore)));

  const stateBadge = useMemo(() => {
    if (isOperational) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Opérationnel
        </Badge>
      );
    }
    if (status?.status === 'degraded') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          Dégradé
        </Badge>
      );
    }
    if (status?.status === 'maintenance') {
      return (
        <Badge variant="secondary" className="gap-1">
          <Activity className="w-3 h-3" />
          Maintenance
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">Vérification…</Badge>
    );
  }, [isOperational, status?.status]);

  // Rafraîchissement toutes les 15s
  useEffect(() => {
    let mounted = true;

    const loadOIC = async () => {
      try {
        const { data, error } = await supabase
          .from('oic_competences')
          .select('description,intitule')
          .limit(10);
        if (error) {
          if (mounted) setOicScore(null);
          return;
        }
        let problems = 0;
        data?.forEach((comp: any) => {
          if (
            comp.description?.includes('&lt;') ||
            comp.description?.includes('&gt;') ||
            comp.description?.includes('<') ||
            comp.description?.includes('>') ||
            comp.description?.startsWith('-') ||
            comp.intitule?.includes('[[')
          ) {
            problems++;
          }
        });
        const score = ((10 - problems) / 10) * 100;
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
  }, [refresh]);

  return (
    <section aria-label="Statut de la plateforme" className="w-full max-w-3xl mx-auto">
      <div className="rounded-xl border p-4 md:p-5 shadow-sm bg-white">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Statut plateforme</h2>
            {stateBadge}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>v{version}</span>
            <Button size="sm" variant="outline" onClick={() => refresh()} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Complétude globale</p>
              <span className="text-sm tabular-nums">{isLoading ? '—' : `${globalScore}%`}</span>
            </div>
            <Progress value={isLoading ? 0 : globalScore} aria-label="Complétude globale" />
            <p className="mt-1 text-xs text-gray-500">Basé sur les items EDN et la cohérence des données.</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Corrections OIC</p>
              <span className="text-sm tabular-nums">{oicScore === null ? '—' : `${Math.round(oicScore)}%`}</span>
            </div>
            <Progress value={oicScore === null ? 0 : Math.round(oicScore)} aria-label="Avancement corrections OIC" />
            <p className="mt-1 text-xs text-gray-500">Échantillon en direct des compétences (15s).</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Compatibilité: {status?.compatibility?.frontendShouldUpgrade ? 'Mise à jour recommandée' : 'OK'}</span>
          <span>Dernière mise à jour: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}</span>
        </div>
      </div>
    </section>
  );
};

export default StatusWidget;
