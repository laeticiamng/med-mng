import { Link } from "react-router-dom";
import { Music, ExternalLink, Flame, Star, Trophy } from "lucide-react";
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
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats for logged-in users */}
        {isLoggedIn && stats && (
          <div className="flex justify-center gap-4 mb-6 pb-6 border-b border-border">
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Flame className="h-3 w-3 text-orange-500" />
              {stats.currentStreak} jours
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Star className="h-3 w-3 text-yellow-500" />
              Niveau {stats.level}
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Trophy className="h-3 w-3 text-amber-500" />
              {stats.badges?.length || 0} badges
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Music className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-foreground">MED MNG</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Par EmotionsCare - L'apprentissage médical révolutionnaire avec la méthode MNG
            </p>
          </div>
          
          {/* Formations */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Formations</h3>
            <div className="space-y-2">
              <Link to={ROUTE_PATHS.ednComplete} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Items EDN
              </Link>
              <Link to={ROUTE_PATHS.ecosIndex} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Situations ECOS
              </Link>
              <Link to={ROUTE_PATHS.generator} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Générateur Musical
              </Link>
              <Link to={ROUTE_PATHS.chat} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Assistant IA
              </Link>
            </div>
          </div>
          
          {/* Outils */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Outils</h3>
            <div className="space-y-2">
              <Link to={ROUTE_PATHS.learningDashboard} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Analytics
              </Link>
              <Link to={ROUTE_PATHS.medMngLibrary} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Bibliothèque
              </Link>
              <Link to={ROUTE_PATHS.favorites} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Favoris
              </Link>
              <Link to={ROUTE_PATHS.achievements} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Succès
              </Link>
              <Link to={ROUTE_PATHS.studyPlanner} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Planificateur
              </Link>
              <Link to={ROUTE_PATHS.statistics} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Statistiques
              </Link>
              <Link to={ROUTE_PATHS.community} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Communauté
              </Link>
              <Link to={ROUTE_PATHS.designSystem} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Design System
              </Link>
              <Link to={ROUTE_PATHS.installPwa} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Installer l'App
              </Link>
            </div>
          </div>
          
          {/* Légal */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Légal</h3>
            <div className="space-y-2">
              <Link to={ROUTE_PATHS.mentionsLegales} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Mentions Légales
              </Link>
              <Link to={ROUTE_PATHS.politiqueConfidentialite} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Politique de Confidentialité
              </Link>
              <Link to={ROUTE_PATHS.cgu} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                CGU
              </Link>
              <Link to={ROUTE_PATHS.declarationAccessibilite} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Accessibilité
              </Link>
              <Link to={ROUTE_PATHS.mesDonneesRgpd} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Mes données RGPD
              </Link>
              <a href="mailto:contact@emotionscare.com" className="flex items-center gap-1 text-muted-foreground hover:text-primary text-sm transition-colors">
                Contact
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} EmotionsCare - MED MNG. Tous droits réservés.</p>
          <p className="mt-1">Méthode MNG - Music Neuro Learning Generator par Laëticia Motongane</p>
        </div>
      </div>
    </footer>
  );
};