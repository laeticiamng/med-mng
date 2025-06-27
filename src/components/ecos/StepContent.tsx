
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const IconComponent = step.icon;

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{step.title}</h2>
            <p className="text-emerald-300 text-lg">{step.subtitle}</p>
          </div>
        </div>

        <div className="space-y-6">
          {step.questions?.map((question, index) => (
            <div key={index} className="bg-black/20 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">{question}</h3>
              <textarea
                placeholder="Votre approche..."
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/40 resize-none"
                rows={3}
                value={responses[`question_${index}`] || ''}
                onChange={(e) => onResponseChange(`question_${index}`, e.target.value)}
              />
            </div>
          ))}

          {step.actions?.map((action, index) => (
            <div key={index} className="bg-black/20 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">{action}</h3>
              <textarea
                placeholder="Décrivez ce que vous trouvez..."
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/40 resize-none"
                rows={2}
                value={responses[`action_${index}`] || ''}
                onChange={(e) => onResponseChange(`action_${index}`, e.target.value)}
              />
            </div>
          ))}

          {step.elements?.map((element, index) => (
            <div key={index} className="bg-black/20 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">{element}</h3>
              <textarea
                placeholder="Votre conclusion..."
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/40 resize-none"
                rows={3}
                value={responses[`element_${index}`] || ''}
                onChange={(e) => onResponseChange(`element_${index}`, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            onClick={onNext}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-4 text-lg"
          >
            {currentStep < totalSteps - 1 ? 'Étape suivante' : 'Terminer la station'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
