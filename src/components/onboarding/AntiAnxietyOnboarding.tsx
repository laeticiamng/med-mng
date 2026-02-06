import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, VisuallyHidden } from '@/components/ui/dialog';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import {
    ArrowRight,
    BookOpen,
    Brain,
    Headphones,
    Music,
    Sparkles,
    Target
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type RevisionType = 'edn' | 'ecos' | 'both';
type MusicStyle = 'rap' | 'lofi' | 'spoken' | 'mix';

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
  const [step, setStep] = useState<'welcome' | 'revision' | 'style' | 'action'>('welcome');
  const [revisionType, setRevisionType] = useState<RevisionType | null>(null);
  const [musicStyle, setMusicStyle] = useState<MusicStyle | null>(null);

  const handleRevisionSelect = (type: RevisionType) => {
    setRevisionType(type);
    setStep('style');
  };

  const handleStyleSelect = async (style: MusicStyle) => {
    setMusicStyle(style);
    
    // Passer à l'étape action au lieu de fermer immédiatement
    setStep('action');
  };

  const handleStartAction = () => {
    onComplete();
    
    // Log the onboarding completion en arrière-plan
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { 
        action: 'music_onboarding_complete',
        revisionType,
        musicStyle
      }
    });

    // Store preferences in Supabase for logged-in users en arrière-plan
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        await supabase.from('user_onboarding').upsert({
          user_id: user.id,
          onboarding_completed: true,
          revision_type: revisionType,
          music_style: musicStyle,
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      } else {
        sessionStorage.setItem('med-mng-onboarding-seen', 'true');
      }
    });
    
    navigate(ROUTE_PATHS.generator);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-card border-border/50 overflow-hidden">
        {/* Accessible title and description for screen readers */}
        <VisuallyHidden>
          <DialogTitle>Personnalisation de ton expérience musicale</DialogTitle>
          <DialogDescription>
            Configure tes préférences de révision et ton style musical en 2 étapes rapides
          </DialogDescription>
        </VisuallyHidden>
        
        {/* Step: Welcome - Identité musicale */}
        {step === 'welcome' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto relative">
              <Headphones className="h-10 w-10 text-primary" />
              <Music className="h-5 w-5 text-accent-foreground absolute -bottom-1 -right-1" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                🎧 Apprends la médecine en musique
              </h2>
              <p className="text-muted-foreground">
                Écoute. Retiens. Sans t'épuiser.
                <br />
                <span className="text-foreground font-medium">30 secondes pour personnaliser ton expérience.</span>
              </p>
            </div>

            <Button 
              size="lg" 
              className="w-full py-6 text-lg bg-gradient-to-r from-primary to-primary/80"
              onClick={() => setStep('revision')}
            >
              C'est parti !
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

        {/* Step: Révision - Tu révises quoi ? */}
        {step === 'revision' && (
          <div className="p-8 text-center space-y-6">
            <Badge variant="outline" className="mb-2 px-4 py-1">
              <BookOpen className="h-3 w-3 mr-2" />
              Étape 1/2
            </Badge>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                📚 Tu révises quoi ?
              </h2>
              <p className="text-muted-foreground">
                On adapte les musiques à ton objectif
              </p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'edn' as RevisionType, label: 'Items EDN', desc: '367 items - Rang A & B', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
                { value: 'ecos' as RevisionType, label: 'Simulations ECOS', desc: 'Situations cliniques', icon: Target, color: 'text-success', bg: 'bg-success/10' },
                { value: 'both' as RevisionType, label: 'Les deux', desc: 'EDN + ECOS en alternance', icon: Brain, color: 'text-accent-foreground', bg: 'bg-accent/10' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={`w-full h-auto py-4 flex items-center justify-start gap-4 hover:${option.bg} hover:border-current transition-all`}
                  onClick={() => handleRevisionSelect(option.value)}
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
          </div>
        )}

        {/* Step: Style - Tu préfères quel style ? */}
        {step === 'style' && (
          <div className="p-8 text-center space-y-6">
            <Badge variant="outline" className="mb-2 px-4 py-1">
              <Headphones className="h-3 w-3 mr-2" />
              Étape 2/2
            </Badge>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                🎵 Tu préfères quel style ?
              </h2>
              <p className="text-muted-foreground">
                La musique qui te parle le plus
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'rap' as MusicStyle, label: '🎤 Rap', desc: 'Flow & rimes' },
                { value: 'lofi' as MusicStyle, label: '🎹 Lo-Fi', desc: 'Chill & focus' },
                { value: 'spoken' as MusicStyle, label: '🎙️ Spoken', desc: 'Narration claire' },
                { value: 'mix' as MusicStyle, label: '🎧 Mix', desc: 'Un peu de tout' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                  onClick={() => handleStyleSelect(option.value)}
                >
                  <span className="text-2xl">{option.label.split(' ')[0]}</span>
                  <span className="font-semibold">{option.label.split(' ')[1]}</span>
                  <span className="text-xs text-muted-foreground">{option.desc}</span>
                </Button>
              ))}
            </div>

            <Button 
              variant="ghost" 
              className="text-muted-foreground text-sm"
              onClick={() => setStep('revision')}
            >
              ← Retour
            </Button>
          </div>
        )}

        {/* Step: Action - Prêt à écouter */}
        {step === 'action' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-success/20 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                🎉 C'est prêt !
              </h2>
              <p className="text-lg text-muted-foreground">
                Tu peux maintenant générer ta première musique de révision.
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-medium text-foreground">💡 Comment ça marche ?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Choisis un item EDN ou une situation ECOS</li>
                <li>• L'IA génère une chanson avec les points clés</li>
                <li>• Écoute en boucle → mémorisation passive</li>
              </ul>
            </div>

            <Button 
              size="lg" 
              className="w-full py-6 text-lg font-bold bg-gradient-to-r from-primary to-primary/80"
              onClick={handleStartAction}
            >
              <Headphones className="h-5 w-5 mr-2" />
              Générer ma première musique
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <Button 
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => {
                onComplete();
                navigate(ROUTE_PATHS.ednComplete);
              }}
            >
              Ou explorer les items d'abord
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AntiAnxietyOnboarding;
