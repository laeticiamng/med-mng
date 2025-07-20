
import { Progress } from '@/components/ui/progress';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const StepProgress = ({ currentStep, totalSteps }: StepProgressProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">Progression</span>
        <span className="text-emerald-300">{currentStep + 1}/{totalSteps}</span>
      </div>
      <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-2" />
    </div>
  );
};
