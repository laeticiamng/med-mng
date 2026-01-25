import { Progress } from '@/components/ui/progress';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Star } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const StepProgress = ({ currentStep, totalSteps }: StepProgressProps) => {
  const { logActivity } = useActivityTracking();
  const { _stats, loadStats, _addPoints } = useGamification();
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

  useEffect(() => {
    const handleCompletion = async () => {
      if (currentStep === totalSteps - 1 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        logActivity({
          activity_type: 'study',
          count: 1,
          score: 100,
          metadata: { component: 'step_progress', action: 'complete_all_steps', totalSteps }
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await _addPoints(user.id, 'itemMastered');
        }
      }
    };
    handleCompletion();
  }, [currentStep, totalSteps]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-foreground font-medium">Progression</span>
          {_stats && (
            <div className="flex items-center gap-2 px-2 py-0.5 bg-muted/30 rounded-full text-xs">
              <Flame className="h-3 w-3 text-warning" />
              <span className="font-bold text-warning">{_stats.currentStreak}</span>
              <Star className="h-3 w-3 text-primary ml-1" />
              <span className="font-bold text-primary">Nv.{_stats.level}</span>
            </div>
          )}
        </div>
        <span className="text-success font-bold">{currentStep + 1}/{totalSteps}</span>
      </div>
      <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-2" />
    </div>
  );
};
