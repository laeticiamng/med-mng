import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Headphones, 
  Play, 
  ArrowRight, 
  Sparkles,
  Brain,
  Target,
  Music,
  BookOpen,
  Flame
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
        {/* Badge musical - visible immédiatement */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-2.5 rounded-full mb-8 border border-primary/20">
          <Headphones className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-sm text-foreground font-semibold">Apprends la médecine en musique</span>
          <Music className="h-4 w-4 text-accent-foreground" />
        </div>
        
        {/* Main headline - Étudiant + Musique */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
          <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            Révise la médecine
          </span>
          <br />
          <span className="text-foreground">en musique</span>
        </h1>
        
        {/* Subheadline - Bénéfice clair */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
          🎧 La musique fait le travail de mémorisation.
          <br />
          <span className="text-foreground font-semibold">Toi, tu écoutes. Tu retiens.</span>
        </p>

        {/* Micro-preuves étudiantes */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Badge variant="secondary" className="py-1.5 px-3 text-sm">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            367 items EDN
          </Badge>
          <Badge variant="secondary" className="py-1.5 px-3 text-sm">
            <Target className="h-3.5 w-3.5 mr-1.5" />
            Simulations ECOS
          </Badge>
          <Badge variant="secondary" className="py-1.5 px-3 text-sm">
            <Brain className="h-3.5 w-3.5 mr-1.5" />
            Mémorisation passive
          </Badge>
        </div>
        
        {/* Primary CTA - Lanceur de session */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            size="lg" 
            className="h-16 px-10 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/30 group"
            onClick={() => navigate(ROUTE_PATHS.generator)}
          >
            <Play className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
            Lancer ma session de révision
            <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Secondary CTA */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button 
            variant="outline" 
            size="lg"
            className="h-12 px-6 text-muted-foreground border-border/50 hover:bg-muted/50 hover:text-foreground"
            onClick={() => navigate(ROUTE_PATHS.ednComplete)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Explorer les items EDN
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="h-12 px-6 text-muted-foreground border-border/50 hover:bg-muted/50 hover:text-foreground"
            onClick={() => navigate(ROUTE_PATHS.ecosIndex)}
          >
            <Target className="h-4 w-4 mr-2" />
            Simulations ECOS
          </Button>
        </div>

        {/* Reassurance text */}
        <p className="text-sm text-muted-foreground/70 mt-8 italic">
          "Écoute en marchant, en cuisinant, en te reposant. Le cerveau mémorise tout seul."
        </p>

        {/* Gamification widget for logged in users */}
        {showGamification && stats && (
          <div className="mt-12 max-w-xl mx-auto">
            <div 
              className="bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-sm rounded-xl p-5 border border-primary/20 cursor-pointer hover:border-primary/40 transition-all group"
              onClick={() => navigate(ROUTE_PATHS.progressDashboard)}
            >
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Ta progression</p>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <Flame className="h-6 w-6 text-warning" />
                  <span className="text-2xl font-bold text-foreground">{stats.currentStreak}</span>
                  <span className="text-sm text-muted-foreground">jours</span>
                </div>
                <div className="w-px h-8 bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="text-xl font-bold text-foreground">Niveau {stats.level}</span>
                </div>
                <div className="w-px h-8 bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <span className="text-xl font-bold text-foreground">{stats.badges.length}</span>
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
