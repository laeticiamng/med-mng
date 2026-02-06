import { Link } from "react-router-dom";
import { Music, ExternalLink, Flame, Star, Trophy, Lock } from "lucide-react";
import { ROUTE_PATHS } from "@/config/routes";
import { useGamification } from "@/hooks/useGamification";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const AppFooter = () => {
  const { stats, loadStats } = useGamification();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        await loadStats(user.id);
      }
    };
    checkAuth();
  }, [loadStats]);

  return (
    <footer className="bg-card border-t border-border pb-24 md:pb-0">
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats for logged-in users */}
        {isLoggedIn && stats && (
          <div className="flex justify-center gap-4 mb-6 pb-6 border-b border-border">
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Flame className="h-3 w-3 text-warning" />
              {stats.currentStreak} jours
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Star className="h-3 w-3 text-primary" />
              Niveau {stats.level}
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Trophy className="h-3 w-3 text-warning" />
              {stats.badges?.length || 0} badges
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-4">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <Music className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-foreground">MED MNG</span>
            </div>
            <p className="text-muted-foreground text-xs">
              Système anti-panique académique par EmotionsCare.
            </p>
          </div>
          
          {/* Apprendre */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground text-sm">Apprendre</h3>
            <div className="space-y-1.5">
              <Link to={ROUTE_PATHS.ednComplete} className="block text-muted-foreground hover:text-primary text-xs transition-colors">Items EDN</Link>
              <Link to={ROUTE_PATHS.flashcards} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Flashcards {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.srsReview} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Révision espacée {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.clinicalCases} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Cas cliniques {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.generator} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Musique médicale {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.mngMethod} className="block text-muted-foreground hover:text-primary text-xs transition-colors">Méthode MNG</Link>
            </div>
          </div>

          {/* S'entraîner */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground text-sm">S'entraîner</h3>
            <div className="space-y-1.5">
              <Link to={ROUTE_PATHS.examMode} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Mode examen {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.ecosIndex} className="block text-muted-foreground hover:text-primary text-xs transition-colors">Simulations ECOS</Link>
              <Link to={ROUTE_PATHS.chat} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Chat IA {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.smartStudyPlanner} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Planning intelligent {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.studyPlanner} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Planificateur {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
            </div>
          </div>
          
          {/* Motivation & Progression */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground text-sm">Motivation</h3>
            <div className="space-y-1.5">
              <Link to={ROUTE_PATHS.dailyChallenges} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Défis du jour {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.leaderboard} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Classement {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.myGoals} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Mes Objectifs {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.pomodoro} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Pomodoro {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.moodTracker} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Suivi humeur {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.progressDashboard} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Ma progression {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
              <Link to={ROUTE_PATHS.achievements} className="block text-muted-foreground hover:text-primary text-xs transition-colors flex items-center gap-1">Succès & Badges {!isLoggedIn && <Lock className="h-2.5 w-2.5" />}</Link>
            </div>
          </div>

          {/* Ressources */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground text-sm">Ressources</h3>
            <div className="space-y-1.5">
              <Link to={ROUTE_PATHS.library} className="block text-muted-foreground hover:text-primary text-xs transition-colors">Bibliothèque</Link>
              <Link to={ROUTE_PATHS.store} className="block text-muted-foreground hover:text-primary text-xs transition-colors">Boutique</Link>
              <Link to={ROUTE_PATHS.medMngPricing} className="block text-muted-foreground hover:text-primary text-xs transition-colors">Tarifs</Link>
              <Link to={ROUTE_PATHS.installPwa} className="block text-muted-foreground hover:text-primary text-xs transition-colors">Installer l'app</Link>
              <Link to={ROUTE_PATHS.settings} className="block text-muted-foreground hover:text-primary text-xs transition-colors">Paramètres</Link>
            </div>
          </div>
          
          {/* Légal */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground text-sm">Légal</h3>
            <div className="space-y-1.5">
              <Link to={ROUTE_PATHS.mentionsLegales} className="block text-muted-foreground hover:text-primary text-xs transition-colors">Mentions Légales</Link>
              <Link to={ROUTE_PATHS.politiqueConfidentialite} className="block text-muted-foreground hover:text-primary text-xs transition-colors">Confidentialité</Link>
              <Link to={ROUTE_PATHS.cgu} className="block text-muted-foreground hover:text-primary text-xs transition-colors">CGU</Link>
              <Link to={ROUTE_PATHS.declarationAccessibilite} className="block text-muted-foreground hover:text-primary text-xs transition-colors">Accessibilité</Link>
              <Link to={ROUTE_PATHS.mesDonneesRgpd} className="block text-muted-foreground hover:text-primary text-xs transition-colors">Données RGPD</Link>
              <a href="mailto:contact@emotionscare.com" className="flex items-center gap-1 text-muted-foreground hover:text-primary text-xs transition-colors">
                Contact <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-6 pt-6 text-center text-muted-foreground text-xs">
          <p>&copy; {new Date().getFullYear()} EmotionsCare - MED MNG. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};