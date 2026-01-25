import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BookOpen, Users, BarChart3, Sparkles, Flame, Star, Trophy } from "lucide-react";
import { ROUTE_PATHS } from '@/config/routes';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

export const HeroSection = () => {
  const [user, setUser] = useState<any>(null);
  const { _stats: gamificationStats, loadStats } = useGamification();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    checkUser();
  }, [loadStats]);

  return (
    <div className="text-center space-y-6 mb-12">
      <div className="flex items-center justify-center space-x-2">
        <Sparkles className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold text-foreground">
          MED MNG
        </h1>
      </div>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Plateforme d'apprentissage immersive pour les étudiants en médecine avec contenus EDN et simulations ECOS
      </p>
      
      {/* Gamification Stats for logged in users */}
      {user && gamificationStats && (
        <div className="flex justify-center">
          <div className="flex items-center gap-4 px-6 py-3 bg-card/80 backdrop-blur-sm rounded-full border border-border shadow-lg">
            <div className="flex items-center gap-2 text-warning">
              <Flame className="h-5 w-5" />
              <span className="font-bold">{gamificationStats.currentStreak}</span>
              <span className="text-sm text-muted-foreground">jours</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2 text-primary">
              <Star className="h-5 w-5" />
              <span className="font-bold">Niv. {gamificationStats.level}</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              <Badge variant="secondary">{gamificationStats.badges.length} badges</Badge>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation rapide */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Link to={ROUTE_PATHS.ednComplete}>
          <Button size="lg" className="flex items-center space-x-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            <BookOpen className="h-5 w-5" />
            <span>Items EDN (Interface unifiée)</span>
          </Button>
        </Link>
        <Link to={ROUTE_PATHS.ecosIndex}>
          <Button variant="outline" size="lg" className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Simulations ECOS</span>
          </Button>
        </Link>
        <Link to={ROUTE_PATHS.auditGeneral}>
          <Button variant="outline" size="lg" className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Audit EDN</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
