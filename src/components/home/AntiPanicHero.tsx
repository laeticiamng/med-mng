import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Clock, 
  ArrowRight, 
  Play,
  Sparkles,
  Brain,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { PriorityMode } from '@/components/priority/PriorityMode';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AntiPanicHeroProps {
  showGamification?: boolean;
  stats?: {
    currentStreak: number;
    level: number;
    badges: any[];
    weeklyGoalProgress: number;
    weeklyGoal: number;
  };
}

export const AntiPanicHero: React.FC<AntiPanicHeroProps> = ({ showGamification, stats }) => {
  const navigate = useNavigate();
  const [showPriorityMode, setShowPriorityMode] = useState(false);

  return (
    <>
      <div className="text-center mb-16">
        {/* Subtle badge */}
        <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full mb-8 border border-primary/10">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary/80 font-medium">Système anti-panique académique</span>
        </div>
        
        {/* Main headline - anti-panic */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
          Tu ne sais plus par quoi commencer ?
        </h1>
        
        {/* Subheadline - direct */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          On te dit quoi faire. <span className="text-foreground font-semibold">Maintenant.</span>
        </p>
        
        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            size="lg" 
            className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            onClick={() => setShowPriorityMode(true)}
          >
            <Zap className="h-5 w-5 mr-2" />
            Donne-moi la prochaine étape
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="h-12 px-6 text-muted-foreground border-border/50 hover:bg-muted/50"
            onClick={() => navigate(ROUTE_PATHS.flashcards)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Moins de 10 minutes
          </Button>
        </div>

        {/* Social proof / reassurance */}
        <p className="text-sm text-muted-foreground/60">
          Tu n'as pas besoin d'être motivé. Juste de commencer.
        </p>

        {/* Gamification widget for logged in users */}
        {showGamification && stats && (
          <div className="mt-12 max-w-xl mx-auto">
            <div 
              className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/30 cursor-pointer hover:bg-card/70 transition-colors"
              onClick={() => navigate(ROUTE_PATHS.progressDashboard)}
            >
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="flex items-center gap-2 text-warning">
                  <span className="text-2xl">🔥</span>
                  <span className="font-bold">{stats.currentStreak}</span>
                  <span className="text-sm text-muted-foreground">jours</span>
                </div>
                <div className="w-px h-6 bg-border hidden sm:block" />
                <div className="flex items-center gap-2 text-primary">
                  <Target className="h-5 w-5" />
                  <span className="font-bold">Nv.{stats.level}</span>
                </div>
                <div className="w-px h-6 bg-border hidden sm:block" />
                <div className="flex items-center gap-2 text-success">
                  <span className="text-xl">🏆</span>
                  <span className="font-bold">{stats.badges.length}</span>
                  <span className="text-sm text-muted-foreground">badges</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Priority Mode Dialog */}
      <Dialog open={showPriorityMode} onOpenChange={setShowPriorityMode}>
        <DialogContent className="max-w-lg p-0 bg-transparent border-none shadow-none">
          <PriorityMode 
            embedded 
            onComplete={() => setShowPriorityMode(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AntiPanicHero;
