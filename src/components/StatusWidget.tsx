import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Statut MED-MNG</h3>
            {stateBadge}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                setIsRefreshing(true);
                await refresh();
                setLastUpdated(new Date());
                setIsRefreshing(false);
              }}
              disabled={isRefreshing}
              className="text-xs"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Complétude Globale</span>
              <span className="font-medium">{globalScore}%</span>
            </div>
            <Progress value={globalScore} className="h-2" />
          </div>
          
          {oicScore !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Qualité OIC</span>
                <span className="font-medium">{Math.round(oicScore)}%</span>
              </div>
              <Progress value={oicScore} className="h-2" />
            </div>
          )}
          
          <div className="space-y-2 text-xs text-gray-500">
            <div>Version: {version}</div>
            {lastUpdated && (
              <div>Mis à jour: {lastUpdated.toLocaleTimeString('fr-FR')}</div>
            )}
          </div>
        </div>
        
        {/* Liens d'accès rapide pour les administrateurs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-200/30">
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link to="/admin-panel">Administration</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link to="/monitoring">Monitoring</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link to="/system-health">Santé Système</Link>
          </Button>
        </div>
      </div>
    </section>;
};
export default StatusWidget;