import { Progress } from '@/components/ui/progress';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useEffect } from 'react';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const StepProgress = ({ currentStep, totalSteps }: StepProgressProps) => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    if (currentStep === totalSteps - 1) {
      logActivity({
        activity_type: 'study',
        count: 1,
        score: 100,
        metadata: { component: 'step_progress', action: 'complete_all_steps', totalSteps }
      });
    }
  }, [currentStep, totalSteps]);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-foreground font-medium">Progression</span>
        <span className="text-success">{currentStep + 1}/{totalSteps}</span>
      </div>
      <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-2" />
    </div>
  );
};
