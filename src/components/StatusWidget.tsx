import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Activity, RotateCcw } from 'lucide-react';
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
  
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [oicScore, setOicScore] = useState<number | null>(null);
  
  const version = status?.version ?? '—';
  const globalScore = Math.max(0, Math.min(100, Math.round(completenessScore)));
  
  const stateBadge = useMemo(() => {
    if (isOperational) {
      return (
        <Badge variant="default" className="gap-1 text-container break-words-normal">
          <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
          Opérationnel
        </Badge>
      );
    }
    
    if (status?.status === 'degraded') {
      return (
        <Badge variant="destructive" className="gap-1 text-container break-words-normal">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          Dégradé
        </Badge>
      );
    }
    
    if (status?.status === 'maintenance') {
      return (
        <Badge variant="secondary" className="gap-1 text-container break-words-normal">
          <Activity className="w-3 h-3 flex-shrink-0" />
          Maintenance
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="text-container break-words-normal">
        Vérification…
      </Badge>
    );
  }, [isOperational, status?.status]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Rafraîchissement automatique
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
          if (comp.description?.includes('&lt;') || 
              comp.description?.includes('&gt;') || 
              comp.description?.includes('<') || 
              comp.description?.includes('>') || 
              comp.description?.startsWith('-') || 
              comp.intitule?.includes('[[')) {
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
      await Promise.allSettled([refresh(), loadOIC()]);
      if (mounted) setLastUpdate(new Date());
    };

    tick();
    const id = setInterval(tick, 15000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [refresh]);

  return (
    <section aria-label="Statut de la plateforme" className="w-full max-w-3xl mx-auto overflow-safe">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50 p-4 space-y-4 overflow-safe">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 overflow-safe">
            <Activity className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 text-container break-words-force">
              Statut MED-MNG
            </h3>
            {stateBadge}
          </div>
          <div className="flex items-center gap-2 overflow-safe">
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              className="h-8 px-2 text-container break-words-normal"
              aria-label="Actualiser le statut"
            >
              <RotateCcw className="w-3 h-3 flex-shrink-0" />
            </Button>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-words-normal">
              {formatTime(lastUpdate)}
            </code>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-safe">
          <div className="space-y-2 overflow-safe">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 text-container break-words-normal">Complétude Globale</span>
              <span className="font-medium break-words-normal">{globalScore}%</span>
            </div>
            <Progress value={globalScore} className="h-2" />
          </div>
          
          {oicScore !== null && (
            <div className="space-y-2 overflow-safe">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 text-container break-words-normal">Qualité OIC</span>
                <span className="font-medium break-words-normal">{Math.round(oicScore)}%</span>
              </div>
              <Progress value={oicScore} className="h-2" />
            </div>
          )}
          
          <div className="space-y-2 text-xs text-gray-500 overflow-safe">
            <div className="text-container break-words-normal">Version: {version}</div>
            <div className="text-container break-words-normal">
              Mis à jour: {formatTime(lastUpdate)}
            </div>
          </div>
        </div>
        
        {/* Liens d'accès rapide pour les administrateurs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-200/30 overflow-safe">
          <Button asChild variant="ghost" size="sm" className="text-xs text-container break-words-normal">
            <Link to="/admin-panel">Administration</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-xs text-container break-words-normal">
            <Link to="/monitoring">Monitoring</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-xs text-container break-words-normal">
            <Link to="/system-health">Santé Système</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StatusWidget;