import { MusicGenerationActions } from '@/components/home/MusicGenerationActions';
import { MusicGenerationCTA } from '@/components/home/MusicGenerationCTA';
import { MusicGenerationFeatures } from '@/components/home/MusicGenerationFeatures';
import { MusicGenerationHeader } from '@/components/home/MusicGenerationHeader';
import { MusicGenerationHowItWorks } from '@/components/home/MusicGenerationHowItWorks';
import { Badge } from '@/components/ui/badge';
import { useFreeTrialLimit } from '@/hooks/useFreeTrialLimit';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Music, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

const MusicGenerationSection = () => {
  const { getRemainingGenerations, maxFreeGenerations } = useFreeTrialLimit();
  const remainingFree = getRemainingGenerations();
  const { _stats } = useGamification();
  const [user, setUser] = useState<any>(null);
  const [totalGenerations, setTotalGenerations] = useState(0);

  useEffect(() => {
    const loadUserStats = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      
      if (authUser) {
        // Count total music generations
        const { count } = await supabase
          .from('user_activity_log')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authUser.id)
          .eq('activity_type', 'music_generation');
        
        setTotalGenerations(count || 0);
      }
    };
    loadUserStats();
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-warning/10 via-warning/5 to-destructive/10">
      <div className="container mx-auto px-4">
        {/* Gamification stats banner for logged-in users */}
        {user && _stats && (
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 p-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium">{_stats.currentStreak} jours</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Niveau {_stats.level}</span>
            </div>
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">{totalGenerations} musiques créées</span>
            </div>
            {_stats.badges.some(b => b.id === 'music_master') && (
              <Badge variant="secondary" className="bg-accent/20 text-accent">
                🎵 Music Master
              </Badge>
            )}
          </div>
        )}

        <MusicGenerationHeader 
          remainingFree={remainingFree}
          maxFreeGenerations={maxFreeGenerations}
        />
        
        <MusicGenerationActions remainingFree={remainingFree} />

        <div className="mt-12">
          <MusicGenerationFeatures />
        </div>

        <div className="mt-12 bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <MusicGenerationHowItWorks />
            <MusicGenerationCTA remainingFree={remainingFree} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MusicGenerationSection;
