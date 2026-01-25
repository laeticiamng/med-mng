import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { LucideIcon } from 'lucide-react';

interface Step {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  questions?: string[];
  actions?: string[];
  elements?: string[];
}

interface StepContentProps {
  step: Step;
  currentStep: number;
  totalSteps: number;
  responses: { [key: string]: string };
  onResponseChange: (field: string, value: string) => void;
  onNext: () => void;
}

export const StepContent = ({ 
  step, 
  currentStep, 
  totalSteps, 
  responses, 
  onResponseChange, 
  onNext 
}: StepContentProps) => {
  const { logActivity } = useActivityTracking();
  const IconComponent = step.icon;
  const handleNextWithTracking = () => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { 
        component: 'ecos_step', 
        action: 'step_completed', 
        currentStep, 
        totalSteps,
        stepTitle: step.title
      }
    });
    onNext();
  };

  return (
    <Card className="bg-card/5 backdrop-blur-sm border-border/10 mb-8">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center">
            <IconComponent className="h-8 w-8 text-success-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">{step.title}</h2>
            <p className="text-success text-lg">{step.subtitle}</p>
          </div>
        </div>

        <div className="space-y-6">
          {step.questions?.map((question, index) => (
            <div key={index} className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-semibold mb-3">{question}</h3>
              <textarea
                placeholder="Votre approche..."
                className="w-full bg-card/10 border border-border/20 rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 resize-none"
                rows={3}
                value={responses[`question_${index}`] || ''}
                onChange={(e) => onResponseChange(`question_${index}`, e.target.value)}
              />
            </div>
          ))}

          {step.actions?.map((action, index) => (
            <div key={index} className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-semibold mb-3">{action}</h3>
              <textarea
                placeholder="Décrivez ce que vous trouvez..."
                className="w-full bg-card/10 border border-border/20 rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 resize-none"
                rows={2}
                value={responses[`action_${index}`] || ''}
                onChange={(e) => onResponseChange(`action_${index}`, e.target.value)}
              />
            </div>
          ))}

          {step.elements?.map((element, index) => (
            <div key={index} className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-foreground font-semibold mb-3">{element}</h3>
              <textarea
                placeholder="Votre conclusion..."
                className="w-full bg-card/10 border border-border/20 rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 resize-none"
                rows={3}
                value={responses[`element_${index}`] || ''}
                onChange={(e) => onResponseChange(`element_${index}`, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            onClick={handleNextWithTracking}
            size="lg"
            className="bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-success-foreground px-8 py-4 text-lg"
          >
            {currentStep < totalSteps - 1 ? 'Étape suivante' : 'Terminer la station'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
