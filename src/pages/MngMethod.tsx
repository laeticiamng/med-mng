import { useEffect, useState } from 'react';
import { MngPresentation } from "@/components/MngPresentation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, Flame, Star, Trophy } from "lucide-react";
import { ROUTE_PATHS } from '@/config/routes';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';

const MngMethod = () => {
  const { stats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadStats(user.id);
        await logActivity({ activity_type: 'study', metadata: { action: 'mng_method_viewed' } });
      }
    };
    init();
  }, [loadStats, logActivity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={ROUTE_PATHS.home}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </Link>
            <Link to={ROUTE_PATHS.home}>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Accueil
              </Button>
            </Link>
          </div>
          
          {/* Gamification Stats */}
          {user && _stats && (
            <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-full border border-border">
              <div className="flex items-center gap-1 text-warning">
                <Flame className="h-4 w-4" />
                <span className="font-bold">{_stats.currentStreak}</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1 text-primary">
                <Star className="h-4 w-4" />
                <span className="font-bold">Niv. {_stats.level}</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-warning" />
                <Badge variant="secondary">{_stats.badges.length}</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Contenu complet de la méthode MNG */}
        <MngPresentation />
      </div>
    </div>
  );
};

export default MngMethod;
