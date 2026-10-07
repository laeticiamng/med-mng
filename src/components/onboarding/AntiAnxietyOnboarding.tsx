import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, VisuallyHidden } from '@/components/ui/dialog';
import { ITEMS_GRATUITS, NOMBRE_ITEMS_GRATUITS } from '@/config/offre';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { cheminItemEdn } from '@/pages/edn-item/ednItemTabs';
import { ArrowRight, BookOpen, Headphones, Music } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CONSTAT (audit du 07.10.2026, MM-A06) : l'onboarding demandait « Que
 * révisez-vous ? » puis « Quel style préférez-vous ? », envoyait ces choix vers
 * user_onboarding.revision_type / music_style (colonnes absentes : l'écriture
 * échouait) et finissait sur /generator, réservé à Premium : un compte gratuit
 * tombait sur un mur payant. Ces choix n'étaient lus nulle part.
 * Désormais : un écran d'accueil, puis le premier item d'essai gratuit.
 * L'état « onboarding terminé » est enregistré par `onComplete` (Index.tsx).
 */
const PREMIER_ITEM_ESSAI = cheminItemEdn(ITEMS_GRATUITS[0].toLowerCase());

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
  const [step, setStep] = useState<'welcome' | 'action'>('welcome');

  const terminer = (destination: string) => {
    onComplete();
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { action: 'onboarding_complete', destination },
    });
    navigate(destination);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-card border-border/50 overflow-hidden">
        {/* Accessible title and description for screen readers */}
        <VisuallyHidden>
          <DialogTitle>Bienvenue sur Med MNG</DialogTitle>
          <DialogDescription>
            Commencez par l'un des items d'essai gratuits
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
                🎧 Apprenez la médecine en musique
              </h2>
              <p className="text-muted-foreground">
                Écoutez. Retenez. Sans vous épuiser.
                <br />
                <span className="text-foreground font-medium">Commencez par un item d'essai, gratuit.</span>
              </p>
            </div>

            <Button 
              size="lg" 
              className="w-full py-6 text-lg bg-gradient-to-r from-primary to-primary/80"
              onClick={() => setStep('action')}
            >
              C'est parti !
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <Button 
              variant="ghost" 
              className="text-muted-foreground text-sm"
              onClick={onClose}
            >
              Explorer d'abord
            </Button>
          </div>
        )}

        {/* Step: Action - premier item d'essai gratuit */}
        {step === 'action' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-success/20 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="h-10 w-10 text-primary" aria-hidden="true" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                Par où commencer ?
              </h2>
              <p className="text-muted-foreground">
                {NOMBRE_ITEMS_GRATUITS} items d&apos;essai sont entièrement ouverts sans abonnement :
                fiche officielle rang A et rang B, paroles, récit, planches et quiz.
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-medium text-foreground">Comment ça marche ?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Lisez la fiche de l&apos;item (compétences officielles)</li>
                <li>• Faites le quiz : votre progression s&apos;enregistre</li>
                <li>• Revenez quand une révision est due</li>
              </ul>
            </div>

            <Button
              size="lg"
              className="w-full py-6 text-lg font-bold bg-gradient-to-r from-primary to-primary/80"
              onClick={() => terminer(PREMIER_ITEM_ESSAI)}
            >
              Ouvrir le premier item d&apos;essai
              <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => terminer(ROUTE_PATHS.ednComplete)}
            >
              Ou explorer les items d&apos;abord
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AntiAnxietyOnboarding;
