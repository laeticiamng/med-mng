import React, { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, AlertCircle, XCircle, Clock, 
  BookOpen, Brain, Music, Users, Gamepad2, Flame, Star, Trophy 
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

interface TableauSection {
  competences?: unknown[];
  concepts?: unknown[];
}

interface TableauData {
  competences_cles?: unknown[];
  sections?: TableauSection[];
  competences?: unknown[];
  concepts?: unknown[];
}

interface CompetencesBadgesProps {
  item: {
    tableau_rang_a?: TableauData;
    tableau_rang_b?: TableauData;
    paroles_musicales?: string[];
    scene_immersive?: Record<string, unknown>;
    quiz_questions?: unknown[] | Record<string, unknown>;
    competences_count_rang_a?: number;
    competences_count_rang_b?: number;
  };
}

export const CompetencesBadges: React.FC<CompetencesBadgesProps> = React.memo(function CompetencesBadges({ item }) {
  const isMobile = useIsMobile();
  const { logActivity } = useActivityTracking();
  const { stats, loadStats } = useGamification();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

  useEffect(() => {
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'competences_badges', action: 'view' }
      });
    }
  }, [logActivity]);
  
  const getCompetencesCount = (rang: 'A' | 'B') => {
    // 1. Priorité: utiliser les compteurs pré-calculés (plus rapide)
    if (rang === 'A' && item.competences_count_rang_a && item.competences_count_rang_a > 0) {
      return item.competences_count_rang_a;
    }
    if (rang === 'B' && item.competences_count_rang_b && item.competences_count_rang_b > 0) {
      return item.competences_count_rang_b;
    }
    
    // 2. Fallback: extraire depuis les tableaux si chargés
    const tableau = rang === 'A' ? item.tableau_rang_a : item.tableau_rang_b;
    if (!tableau) return 0;
    
    // Chercher dans competences_cles (format OIC principal)
    if (tableau.competences_cles && Array.isArray(tableau.competences_cles)) {
      return tableau.competences_cles.length;
    }
    // Fallback: sections
    if (tableau.sections && Array.isArray(tableau.sections)) {
      return tableau.sections.reduce((total: number, section: TableauSection) => {
        if (section.competences && Array.isArray(section.competences)) {
          return total + section.competences.length;
        }
        if (section.concepts && Array.isArray(section.concepts)) {
          return total + section.concepts.length;
        }
        return total;
      }, 0);
    }
    // Fallback: competences ou concepts
    if (tableau.competences && Array.isArray(tableau.competences)) {
      return tableau.competences.length;
    }
    if (tableau.concepts && Array.isArray(tableau.concepts)) {
      return tableau.concepts.length;
    }
    
    return 0;
  };

  const rangACount = getCompetencesCount('A');
  const rangBCount = getCompetencesCount('B');
  
  const features = [
    {
      id: 'rang-a',
      label: 'Rang A',
      icon: BookOpen,
      available: !!item.tableau_rang_a,
      count: rangACount,
      description: 'Compétences fondamentales',
      color: rangACount > 0 ? 'text-primary bg-primary/10 border-primary/20' : 'text-muted-foreground bg-muted border-border'
    },
    {
      id: 'rang-b',
      label: 'Rang B',
      icon: Brain,
      available: !!item.tableau_rang_b,
      count: rangBCount,
      description: 'Compétences expertes',
      color: rangBCount > 0 ? 'text-accent bg-accent/10 border-accent/20' : 'text-muted-foreground bg-muted border-border'
    },
    {
      id: 'music',
      label: 'Musique',
      icon: Music,
      available: !!(item.paroles_musicales && item.paroles_musicales.length > 0),
      count: item.paroles_musicales?.length || 0,
      description: 'Chansons d\'apprentissage',
      color: item.paroles_musicales?.length > 0 ? 'text-success bg-success/10 border-success/20' : 'text-muted-foreground bg-muted border-border'
    },
    {
      id: 'scene',
      label: 'Scène',
      icon: Users,
      available: !!item.scene_immersive,
      count: item.scene_immersive ? 1 : 0,
      description: 'Expérience immersive',
      color: item.scene_immersive ? 'text-warning bg-warning/10 border-warning/20' : 'text-muted-foreground bg-muted border-border'
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: Gamepad2,
      available: !!item.quiz_questions,
      count: Array.isArray(item.quiz_questions) ? item.quiz_questions.length : (item.quiz_questions ? 1 : 0),
      description: 'Questions interactives',
      color: item.quiz_questions ? 'text-destructive bg-destructive/10 border-destructive/20' : 'text-muted-foreground bg-muted border-border'
    }
  ];

  const getStatusIcon = (available: boolean) => {
    if (available) {
      return <CheckCircle className="h-3 w-3 text-success" />;
    } else {
      return <XCircle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const calculateGlobalCompletion = () => {
    const availableFeatures = features.filter(f => f.available).length;
    const totalFeatures = features.length;
    return Math.round((availableFeatures / totalFeatures) * 100);
  };

  const globalCompletion = calculateGlobalCompletion();
  const isComplete = globalCompletion === 100;

  return (
    <div className="space-y-4">
      {/* Badge de statut global avec gamification */}
      <div className="flex items-center justify-center gap-3">
        {isComplete ? (
          <Badge className="bg-success/10 text-success border-success/30 px-3 py-1">
            <CheckCircle className="h-4 w-4 mr-1" />
            Item Complet 100%
          </Badge>
        ) : (
          <Badge variant="outline" className="text-warning border-warning/30 px-3 py-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {globalCompletion}% Complété
          </Badge>
        )}
        {stats && (
          <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
            <Flame className="h-4 w-4 text-warning" />
            <span className="text-sm font-bold text-warning">{stats.currentStreak ?? 0}j</span>
            <Star className="h-4 w-4 text-primary ml-1" />
            <span className="text-sm font-bold text-primary">Nv.{stats.level ?? 1}</span>
            <Trophy className="h-4 w-4 text-accent ml-1" />
            <span className="text-sm font-bold text-accent">{Array.isArray(stats.badges) ? stats.badges.length : 0}</span>
          </div>
        )}
      </div>

      {/* Badges détaillés par fonctionnalité */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'} gap-2`}>
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <div key={feature.id} className="space-y-1">
              <Badge 
                variant="outline" 
                className={`w-full flex items-center justify-between p-2 ${feature.color}`}
              >
                <div className="flex items-center gap-1">
                  <IconComponent className="h-3 w-3" />
                  <span className="text-xs font-medium">{feature.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {feature.count > 0 && (
                    <span className="text-xs font-bold">{feature.count}</span>
                  )}
                  {getStatusIcon(feature.available)}
                </div>
              </Badge>
              <div className="text-xs text-muted-foreground text-center px-1">
                {feature.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Détail des compétences par rang */}
      <div className="space-y-2">
        {rangACount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-primary font-medium">Compétences Rang A:</span>
            <Badge variant="outline" className="text-primary border-primary/30">
              {rangACount} compétences fondamentales
            </Badge>
          </div>
        )}
        
        {rangBCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-accent font-medium">Compétences Rang B:</span>
            <Badge variant="outline" className="text-accent border-accent/30">
              {rangBCount} compétences expertes
            </Badge>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm font-bold">
          <span className="text-foreground">Total Compétences:</span>
          <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            {rangACount + rangBCount} compétences UNESS
          </Badge>
        </div>
      </div>

      {/* Alerte si compétences manquantes */}
      {!isComplete && (
        <div className="text-center p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-warning">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">
              Contenu en cours de finalisation
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
