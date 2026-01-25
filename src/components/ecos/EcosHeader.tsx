import { Link } from 'react-router-dom';
import { Stethoscope, ArrowLeft, Clock, Flame, Star } from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EcosHeaderProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
  scenarioId: string;
  specialty: string;
}

export const EcosHeader = ({ timeLeft, formatTime, scenarioId, specialty }: EcosHeaderProps) => {
  const { _stats: gamificationStats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'ecos_header', scenarioId, specialty }
    });
  }, [logActivity, scenarioId, specialty]);
  return (
    <div className="bg-muted/20 backdrop-blur-sm border-b border-border/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to={ROUTE_PATHS.ecosIndex} className="flex items-center gap-3 text-foreground hover:text-success transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <Stethoscope className="h-6 w-6" />
            <span className="font-semibold">Retour aux ECOS</span>
          </Link>
          <div className="flex items-center gap-4 text-foreground">
            {gamificationStats && (
              <div className="flex items-center gap-3 px-3 py-1 bg-muted/30 rounded-full">
                <div className="flex items-center gap-1 text-warning">
                  <Flame className="h-4 w-4" />
                  <span className="font-bold text-sm">{gamificationStats.currentStreak}</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-4 w-4" />
                  <span className="font-bold text-sm">Nv.{gamificationStats.level}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-success">
              {scenarioId} • {specialty}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
