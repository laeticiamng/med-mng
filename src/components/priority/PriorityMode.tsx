import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertCircle,
    ArrowRight,
    Battery,
    BatteryLow,
    BatteryWarning,
    Brain,
    Calendar,
    Clock,
    Play,
    Target,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type UserLevel = 'dfasm1' | 'dfasm2' | 'dfasm3' | 'ecn';
type Deadline = 'today' | 'this_week' | 'this_month';
type UserState = 'ok' | 'tired' | 'saturated';

interface NextAction {
  type: 'item' | 'ecos' | 'flashcard' | 'exam' | 'break';
  title: string;
  subtitle: string;
  duration: string;
  path: string;
  itemCode?: string;
  urgency: 'high' | 'medium' | 'low';
}

interface PriorityModeProps {
  onComplete?: () => void;
  embedded?: boolean;
}

export const PriorityMode: React.FC<PriorityModeProps> = ({ onComplete, embedded = false }) => {
  const navigate = useNavigate();
  const { logActivity } = useActivityTracking();
  const [step, setStep] = useState<'level' | 'deadline' | 'state' | 'action'>('level');
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [deadline, setDeadline] = useState<Deadline | null>(null);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [_priorityItems, _setPriorityItems] = useState<any[]>([]);

  // Fetch priority items based on user profile
  useEffect(() => {
    if (step === 'action' && userLevel && deadline && userState) {
      generateNextAction();
    }
  }, [step, userLevel, deadline, userState]);

  const generateNextAction = async () => {
    setIsLoading(true);
    
    try {
      // Fetch items with lowest mastery for the user
      await supabase.auth.getUser();

      const query = supabase
        .from('edn_items_immersive')
        .select('id, item_code, title, slug')
        .limit(10);

      const { data } = await query;
      const items = data as any[] | null;
      
      // Determine action based on user state
      let action: NextAction;
      
      if (userState === 'saturated') {
        // User is overwhelmed - suggest a break or very short action
        action = {
          type: 'break',
          title: 'Pause stratégique',
          subtitle: 'Tu as besoin de récupérer. 5 minutes de pause, puis on reprend.',
          duration: '5 min',
          path: ROUTE_PATHS.home,
          urgency: 'low'
        };
      } else if (userState === 'tired') {
        // User is tired - suggest flashcards or light review
        // Select first item (deterministic)
        const selectedItem = items?.[0];
        action = {
          type: 'flashcard',
          title: 'Révision légère',
          subtitle: selectedItem ? `Flashcards : ${selectedItem.title}` : 'Revoir tes points faibles',
          duration: '8 min',
          path: ROUTE_PATHS.flashcards,
          itemCode: selectedItem?.item_code,
          urgency: 'medium'
        };
      } else {
        // User is OK - full action based on deadline
        // Select first item needing attention (deterministic)
        const selectedItem = items?.[0];
        
        if (deadline === 'today') {
          action = {
            type: 'exam',
            title: 'Action prioritaire',
            subtitle: selectedItem ? `Maîtriser : ${selectedItem.title}` : 'QCM intensif sur tes lacunes',
            duration: '15 min',
            path: selectedItem ? `/edn/${selectedItem.slug}/immersive` : ROUTE_PATHS.examMode,
            itemCode: selectedItem?.item_code,
            urgency: 'high'
          };
        } else if (deadline === 'this_week') {
          action = {
            type: 'item',
            title: 'Bloc de révision',
            subtitle: selectedItem ? `Approfondir : ${selectedItem.title}` : 'Consolider un item EDN',
            duration: '20 min',
            path: selectedItem ? `/edn/${selectedItem.slug}/immersive` : ROUTE_PATHS.ednComplete,
            itemCode: selectedItem?.item_code,
            urgency: 'medium'
          };
        } else {
          action = {
            type: 'ecos',
            title: 'Entraînement ECOS',
            subtitle: 'Simulation clinique complète',
            duration: '25 min',
            path: ROUTE_PATHS.ecosIndex,
            urgency: 'low'
          };
        }
      }
      
      setNextAction(action);
    } catch (error) {
      console.error('Error generating next action:', error);
      // Fallback action
      setNextAction({
        type: 'item',
        title: 'Commence par là',
        subtitle: 'Un item au hasard pour débloquer',
        duration: '10 min',
        path: ROUTE_PATHS.ednComplete,
        urgency: 'medium'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelSelect = (level: UserLevel) => {
    setUserLevel(level);
    setStep('deadline');
  };

  const handleDeadlineSelect = (d: Deadline) => {
    setDeadline(d);
    setStep('state');
  };

  const handleStateSelect = (state: UserState) => {
    setUserState(state);
    setStep('action');
  };

  const handleActionStart = () => {
    if (nextAction) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { 
          action: 'priority_mode_action_started',
          actionType: nextAction.type,
          userLevel,
          deadline,
          userState
        }
      });
      navigate(nextAction.path);
      onComplete?.();
    }
  };

  const urgencyColors = {
    high: 'bg-destructive text-destructive-foreground',
    medium: 'bg-warning text-warning-foreground',
    low: 'bg-success text-success-foreground'
  };

  const containerClass = embedded 
    ? 'p-0' 
    : 'min-h-[60vh] flex items-center justify-center p-4';

  return (
    <div className={containerClass}>
      <Card className="w-full max-w-lg p-8 bg-card/80 backdrop-blur-sm border-border/50">
        {/* Step 1: Level */}
        {step === 'level' && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <Badge variant="outline" className="mb-4 px-4 py-1">
                <Target className="h-3 w-3 mr-2" />
                Étape 1/3
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">
                Tu es en quelle année ?
              </h2>
              <p className="text-muted-foreground">
                Pour adapter le contenu à ton niveau
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'dfasm1' as UserLevel, label: 'DFASM1', desc: '4ème année' },
                { value: 'dfasm2' as UserLevel, label: 'DFASM2', desc: '5ème année' },
                { value: 'dfasm3' as UserLevel, label: 'DFASM3', desc: '6ème année' },
                { value: 'ecn' as UserLevel, label: 'ECN/EDN', desc: 'Prépa intensive' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-1 hover:bg-primary/10 hover:border-primary transition-all"
                  onClick={() => handleLevelSelect(option.value)}
                >
                  <span className="font-bold text-lg">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.desc}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Deadline */}
        {step === 'deadline' && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <Badge variant="outline" className="mb-4 px-4 py-1">
                <Calendar className="h-3 w-3 mr-2" />
                Étape 2/3
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">
                C'est pour quand ?
              </h2>
              <p className="text-muted-foreground">
                Ton échéance la plus proche
              </p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'today' as Deadline, label: 'Aujourd\'hui', icon: AlertCircle, color: 'text-destructive' },
                { value: 'this_week' as Deadline, label: 'Cette semaine', icon: Clock, color: 'text-warning' },
                { value: 'this_month' as Deadline, label: 'Ce mois-ci', icon: Calendar, color: 'text-success' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className="w-full h-auto py-4 flex items-center justify-start gap-4 hover:bg-primary/10 hover:border-primary transition-all"
                  onClick={() => handleDeadlineSelect(option.value)}
                >
                  <option.icon className={`h-6 w-6 ${option.color}`} />
                  <span className="font-semibold text-lg">{option.label}</span>
                </Button>
              ))}
            </div>

            <Button 
              variant="ghost" 
              className="text-muted-foreground"
              onClick={() => setStep('level')}
            >
              ← Retour
            </Button>
          </div>
        )}

        {/* Step 3: State */}
        {step === 'state' && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <Badge variant="outline" className="mb-4 px-4 py-1">
                <Brain className="h-3 w-3 mr-2" />
                Étape 3/3
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">
                Tu te sens comment là ?
              </h2>
              <p className="text-muted-foreground">
                Honnêtement, pas de jugement
              </p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'ok' as UserState, label: 'Ça va, je suis opérationnel', icon: Battery, color: 'text-success' },
                { value: 'tired' as UserState, label: 'Fatigué, mais je peux avancer', icon: BatteryWarning, color: 'text-warning' },
                { value: 'saturated' as UserState, label: 'Saturé, je ne sais plus où j\'en suis', icon: BatteryLow, color: 'text-destructive' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className="w-full h-auto py-4 flex items-center justify-start gap-4 hover:bg-primary/10 hover:border-primary transition-all text-left"
                  onClick={() => handleStateSelect(option.value)}
                >
                  <option.icon className={`h-6 w-6 flex-shrink-0 ${option.color}`} />
                  <span className="font-medium">{option.label}</span>
                </Button>
              ))}
            </div>

            <Button 
              variant="ghost" 
              className="text-muted-foreground"
              onClick={() => setStep('deadline')}
            >
              ← Retour
            </Button>
          </div>
        )}

        {/* Step 4: Action */}
        {step === 'action' && (
          <div className="space-y-6 text-center">
            {isLoading ? (
              <div className="py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Analyse de ta situation...</p>
              </div>
            ) : nextAction ? (
              <>
                <div className="space-y-2">
                  <Badge className={`mb-4 px-4 py-1 ${urgencyColors[nextAction.urgency]}`}>
                    <Zap className="h-3 w-3 mr-2" />
                    {nextAction.urgency === 'high' ? 'Priorité haute' : 
                     nextAction.urgency === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                  </Badge>
                  <h2 className="text-2xl font-bold text-foreground">
                    {nextAction.title}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {nextAction.subtitle}
                  </p>
                </div>

                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span className="text-lg font-medium">{nextAction.duration}</span>
                  </div>
                  
                  {nextAction.itemCode && (
                    <Badge variant="secondary" className="text-sm">
                      {nextAction.itemCode}
                    </Badge>
                  )}
                </div>

                <Button 
                  size="lg" 
                  className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90"
                  onClick={handleActionStart}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Commencer maintenant
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>

                <p className="text-sm text-muted-foreground">
                  Fais juste ça. Rien d'autre.
                </p>

                <Button 
                  variant="ghost" 
                  className="text-muted-foreground"
                  onClick={() => {
                    setStep('level');
                    setNextAction(null);
                  }}
                >
                  Recommencer
                </Button>
              </>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PriorityMode;
