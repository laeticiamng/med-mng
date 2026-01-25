import { PriorityMode } from '@/components/priority/PriorityMode';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ROUTE_PATHS } from '@/config/routes';
import {
    ArrowRight,
    BookOpen,
    Flame,
    Headphones,
    Play,
    Target
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      <div className="text-center mb-8 md:mb-12 px-2 sm:px-4">
        {/* Headline studieux - Direct et rassurant */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-foreground leading-tight tracking-tight break-word">
          Qu'est-ce que tu veux réviser aujourd'hui ?
        </h1>
        
        {/* Sous-texte émotionnel */}
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-lg mx-auto px-2">
          Un espace pour organiser et avancer dans ta révision.
        </p>

        {/* Barre de recherche - Point d'entrée principal */}
        <div className="max-w-2xl mx-auto mb-8 md:mb-10 px-2">
          <div 
            className="relative group cursor-pointer"
            onClick={() => navigate(ROUTE_PATHS.medMngItemsLibrary)}
          >
            <div className="flex items-center bg-card/80 backdrop-blur-sm border-2 border-border/50 hover:border-primary/40 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 transition-all shadow-sm hover:shadow-lg">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mr-2 sm:mr-3 flex-shrink-0" />
              <span className="text-muted-foreground text-left flex-1 text-sm sm:text-base truncate">
                Rechercher un item EDN, une spécialité...
              </span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Bloc "Reprendre ma révision" - Valorisé */}
        {showGamification && stats && (
          <div className="max-w-md mx-auto mb-8 md:mb-10 px-2">
            <div 
              className="bg-card/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border/50 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
              onClick={() => navigate(ROUTE_PATHS.medMngProgress)}
            >
              <p className="text-xs text-muted-foreground mb-2 sm:mb-3 font-medium uppercase tracking-wider">
                Reprendre ma révision
              </p>
              <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                  <span className="text-lg sm:text-xl font-bold text-foreground">{stats.currentStreak}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">jours</span>
                </div>
                <div className="w-px h-5 sm:h-6 bg-border hidden sm:block" />
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {stats.weeklyGoalProgress}/{stats.weeklyGoal} cette semaine
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags rapides - Accès directs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-10 px-2">
          <Badge 
            variant="secondary" 
            className="py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => navigate(ROUTE_PATHS.medMngItemsLibrary)}
          >
            <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
            367 items EDN
          </Badge>
          <Badge 
            variant="secondary" 
            className="py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => navigate(ROUTE_PATHS.ecosIndex)}
          >
            <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
            ECOS
          </Badge>
          <Badge 
            variant="secondary" 
            className="py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => navigate(ROUTE_PATHS.generator)}
          >
            <Headphones className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
            Écoute musicale
          </Badge>
        </div>
        
        {/* CTA Principal - Session de révision */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center px-2">
          <Button 
            size="lg" 
            className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
            onClick={() => navigate(ROUTE_PATHS.medMngItemsLibrary)}
          >
            <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Commencer à réviser
          </Button>
          <Button 
            variant="ghost" 
            size="lg"
            className="h-12 sm:h-14 px-4 sm:px-6 text-muted-foreground hover:text-foreground w-full sm:w-auto"
            onClick={() => navigate(ROUTE_PATHS.generator)}
          >
            <Headphones className="h-4 w-4 mr-2" />
            Écouter en musique
          </Button>
        </div>

        {/* Message rassurant */}
        <p className="text-xs sm:text-sm text-muted-foreground/70 mt-6 sm:mt-8 px-4">
          Prends ton temps. La régularité fait la différence.
        </p>
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
