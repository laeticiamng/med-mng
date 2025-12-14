import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Brain, 
  Zap, 
  ArrowRight,
  Clock,
  AlertCircle,
  Battery,
  BatteryLow,
  BatteryWarning,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { supabase } from '@/integrations/supabase/client';
import { useActivityTracking } from '@/hooks/useActivityTracking';

type Deadline = 'today' | 'this_week' | 'this_month';
type UserState = 'ok' | 'tired' | 'saturated';

interface AntiAnxietyOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const AntiAnxietyOnboarding: React.FC<AntiAnxietyOnboardingProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const navigate = useNavigate();
  const { logActivity } = useActivityTracking();
  const [step, setStep] = useState<'welcome' | 'deadline' | 'state' | 'action'>('welcome');
  const [deadline, setDeadline] = useState<Deadline | null>(null);
  const [userState, setUserState] = useState<UserState | null>(null);

  const handleDeadlineSelect = (d: Deadline) => {
    setDeadline(d);
    setStep('state');
  };

  const handleStateSelect = async (state: UserState) => {
    setUserState(state);
    
    // Log the onboarding completion
    await logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { 
        action: 'anti_anxiety_onboarding_complete',
        deadline,
        userState: state
      }
    });

    // Store preferences in Supabase for logged-in users
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from('user_onboarding').upsert({
        user_id: user.id,
        onboarding_completed: true,
        preferred_deadline: deadline,
        last_state: state,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    } else {
      // Use sessionStorage for anonymous users (clears on browser close)
      sessionStorage.setItem('med-mng-onboarding-seen', 'true');
    }
    
    setStep('action');
  };

  const getActionPath = () => {
    if (userState === 'saturated') {
      return ROUTE_PATHS.flashcards; // Light activity
    } else if (deadline === 'today') {
      return ROUTE_PATHS.examMode; // Intensive
    } else {
      return ROUTE_PATHS.ednComplete; // Standard revision
    }
  };

  const getActionText = () => {
    if (userState === 'saturated') {
      return {
        title: 'On y va doucement',
        subtitle: 'Une petite révision légère pour débloquer',
        duration: '5 min'
      };
    } else if (deadline === 'today') {
      return {
        title: 'Action immédiate',
        subtitle: 'QCM ciblé sur ce qui compte vraiment',
        duration: '10 min'
      };
    } else {
      return {
        title: 'Prêt à avancer',
        subtitle: 'Un bloc de révision efficace',
        duration: '15 min'
      };
    }
  };

  const handleStartAction = () => {
    onComplete();
    navigate(getActionPath());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-card border-border/50 overflow-hidden">
        {/* Step: Welcome */}
        {step === 'welcome' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                Si tu es ici, c'est probablement que tu es en retard sur quelque chose.
              </h2>
              <p className="text-muted-foreground">
                Pas de panique. On va te dire exactement quoi faire.
              </p>
            </div>

            <Button 
              size="lg" 
              className="w-full py-6 text-lg"
              onClick={() => setStep('deadline')}
            >
              OK, on y va
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <Button 
              variant="ghost" 
              className="text-muted-foreground text-sm"
              onClick={onClose}
            >
              Je veux juste explorer
            </Button>
          </div>
        )}

        {/* Step: Deadline */}
        {step === 'deadline' && (
          <div className="p-8 text-center space-y-6">
            <Badge variant="outline" className="mb-2 px-4 py-1">
              <Calendar className="h-3 w-3 mr-2" />
              Étape 1/2
            </Badge>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                C'est pour quand ?
              </h2>
              <p className="text-muted-foreground">
                Ta prochaine échéance importante
              </p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'today' as Deadline, label: 'Aujourd\'hui', icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
                { value: 'this_week' as Deadline, label: 'Cette semaine', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
                { value: 'this_month' as Deadline, label: 'Ce mois-ci', icon: Calendar, color: 'text-success', bg: 'bg-success/10' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={`w-full h-auto py-4 flex items-center justify-start gap-4 hover:${option.bg} hover:border-current transition-all`}
                  onClick={() => handleDeadlineSelect(option.value)}
                >
                  <div className={`p-2 rounded-lg ${option.bg}`}>
                    <option.icon className={`h-5 w-5 ${option.color}`} />
                  </div>
                  <span className="font-semibold text-lg">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step: State */}
        {step === 'state' && (
          <div className="p-8 text-center space-y-6">
            <Badge variant="outline" className="mb-2 px-4 py-1">
              <Brain className="h-3 w-3 mr-2" />
              Étape 2/2
            </Badge>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Tu te sens comment là, honnêtement ?
              </h2>
              <p className="text-muted-foreground">
                Pas de jugement, c'est pour t'aider
              </p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'ok' as UserState, label: 'OK', desc: 'Je peux bosser', icon: Battery, color: 'text-success', bg: 'bg-success/10' },
                { value: 'tired' as UserState, label: 'Fatigué', desc: 'Mais je veux avancer', icon: BatteryWarning, color: 'text-warning', bg: 'bg-warning/10' },
                { value: 'saturated' as UserState, label: 'Saturé', desc: 'Je ne sais plus où j\'en suis', icon: BatteryLow, color: 'text-destructive', bg: 'bg-destructive/10' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={`w-full h-auto py-4 flex items-center justify-start gap-4 hover:${option.bg} hover:border-current transition-all`}
                  onClick={() => handleStateSelect(option.value)}
                >
                  <div className={`p-2 rounded-lg ${option.bg}`}>
                    <option.icon className={`h-5 w-5 ${option.color}`} />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-lg block">{option.label}</span>
                    <span className="text-sm text-muted-foreground">{option.desc}</span>
                  </div>
                </Button>
              ))}
            </div>

            <Button 
              variant="ghost" 
              className="text-muted-foreground text-sm"
              onClick={() => setStep('deadline')}
            >
              ← Retour
            </Button>
          </div>
        )}

        {/* Step: Action */}
        {step === 'action' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                {getActionText().title}
              </h2>
              <p className="text-lg text-muted-foreground">
                {getActionText().subtitle}
              </p>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-medium">{getActionText().duration}</span>
            </div>

            <Button 
              size="lg" 
              className="w-full py-6 text-lg font-bold"
              onClick={handleStartAction}
            >
              Commencer maintenant
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <p className="text-sm text-muted-foreground">
              Tu n'as pas besoin d'être motivé.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AntiAnxietyOnboarding;
