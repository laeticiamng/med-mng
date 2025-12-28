import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info, Flame, Star, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { useOicCompetences } from '@/hooks/useOicCompetences';
import { supabase } from '@/integrations/supabase/client';

interface CompetenceValidationProps {
  item: any;
}

export const CompetenceValidation: React.FC<CompetenceValidationProps> = ({ item }) => {
  const isMobile = useIsMobile();
  const { logActivity } = useActivityTracking();
  const { stats, loadStats } = useGamification();
  
  // Utiliser les vraies compétences OIC depuis la base de données
  const { competences: oicCompetencesA, loading: loadingA } = useOicCompetences(item?.item_code || '', 'A');
  const { competences: oicCompetencesB, loading: loadingB } = useOicCompetences(item?.item_code || '', 'B');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
        logActivity({ activity_type: 'study', metadata: { action: 'view_competence_validation', itemCode: item?.item_code } });
      }
    };
    load();
  }, [loadStats, logActivity, item?.item_code]);

  const validation = useMemo(() => {
    const result = {
      rangA: {
        present: false,
        count: 0,
        competences: [] as string[]
      },
      rangB: {
        present: false,
        count: 0,
        competences: [] as string[]
      },
      complete: false,
      issues: [] as string[]
    };

    // Utiliser les compétences OIC réelles si disponibles
    if (oicCompetencesA.length > 0) {
      result.rangA.present = true;
      result.rangA.count = oicCompetencesA.length;
      result.rangA.competences = oicCompetencesA.map(c => c.intitule || 'Compétence').filter(Boolean);
    } else if (item.tableau_rang_a) {
      result.rangA.present = true;
      // Fallback: données locales
      if (item.tableau_rang_a.competences_cles?.length > 0) {
        result.rangA.count = item.tableau_rang_a.competences_cles.length;
        result.rangA.competences = item.tableau_rang_a.competences_cles.map((c: any) => c.competence || c.title).filter(Boolean);
      } else if (Array.isArray(item.tableau_rang_a) && item.tableau_rang_a.length > 0) {
        result.rangA.count = item.tableau_rang_a.length;
        result.rangA.competences = item.tableau_rang_a.map((c: any) => c.intitule || c.title).filter(Boolean);
      }
    } else {
      result.issues.push("Tableau Rang A manquant");
    }

    // Rang B
    if (oicCompetencesB.length > 0) {
      result.rangB.present = true;
      result.rangB.count = oicCompetencesB.length;
      result.rangB.competences = oicCompetencesB.map(c => c.intitule || 'Compétence').filter(Boolean);
    } else if (item.tableau_rang_b) {
      result.rangB.present = true;
      if (item.tableau_rang_b.competences_cles?.length > 0) {
        result.rangB.count = item.tableau_rang_b.competences_cles.length;
        result.rangB.competences = item.tableau_rang_b.competences_cles.map((c: any) => c.competence || c.title).filter(Boolean);
      } else if (Array.isArray(item.tableau_rang_b) && item.tableau_rang_b.length > 0) {
        result.rangB.count = item.tableau_rang_b.length;
        result.rangB.competences = item.tableau_rang_b.map((c: any) => c.intitule || c.title).filter(Boolean);
      }
    } else {
      result.issues.push("Tableau Rang B manquant");
    }

    // Vérification des contenus complémentaires
    if (!item.paroles_musicales || item.paroles_musicales.length === 0) {
      result.issues.push("Paroles musicales manquantes");
    }
    if (!item.quiz_questions) {
      result.issues.push("Quiz manquant");
    }
    if (!item.scene_immersive) {
      result.issues.push("Scène immersive manquante");
    }

    // Déterminer si l'item est complet
    result.complete = result.rangA.present && 
                      result.rangB.present && 
                      result.rangA.count > 0 && 
                      result.rangB.count > 0 &&
                      result.issues.length === 0;

    return result;
  }, [item, oicCompetencesA, oicCompetencesB]);

  const isLoading = loadingA || loadingB;

  const getStatusColor = () => {
    if (validation.complete) return "border-success bg-success/5";
    if (validation.issues.length < 3) return "border-warning bg-warning/5";
    return "border-destructive bg-destructive/5";
  };

  const getStatusIcon = () => {
    if (validation.complete) return <CheckCircle className="h-5 w-5 text-success" />;
    if (validation.issues.length < 3) return <AlertTriangle className="h-5 w-5 text-warning" />;
    return <AlertTriangle className="h-5 w-5 text-destructive" />;
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-muted">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Chargement des compétences OIC...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardHeader className={isMobile ? "pb-2" : "pb-3"}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
            {getStatusIcon()}
            Validation des Compétences - {item.item_code}
          </CardTitle>
          {stats && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs">
                <Flame className="h-3 w-3 text-orange-500" />
                {stats.currentStreak}j
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs">
                <Star className="h-3 w-3 text-yellow-500" />
                Niv. {stats.level}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={`space-y-4 ${isMobile ? 'p-4' : ''}`}>
        {/* Résumé */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-4`}>
          <div className="text-center p-3 rounded-lg bg-background border">
            <div className="text-2xl font-bold text-primary">
              {validation.rangA.count}
            </div>
            <div className="text-sm text-muted-foreground">Compétences Rang A</div>
            {validation.rangA.present ? (
              <CheckCircle className="h-4 w-4 text-success mx-auto mt-1" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive mx-auto mt-1" />
            )}
          </div>
          
          <div className="text-center p-3 rounded-lg bg-background border">
            <div className="text-2xl font-bold text-accent">
              {validation.rangB.count}
            </div>
            <div className="text-sm text-muted-foreground">Compétences Rang B</div>
            {validation.rangB.present ? (
              <CheckCircle className="h-4 w-4 text-success mx-auto mt-1" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive mx-auto mt-1" />
            )}
          </div>
          
          <div className="text-center p-3 rounded-lg bg-background border">
            <div className="text-2xl font-bold text-success">
              {validation.complete ? "100%" : Math.round((6 - validation.issues.length) / 6 * 100) + "%"}
            </div>
            <div className="text-sm text-muted-foreground">Complétude</div>
            {validation.complete ? (
              <CheckCircle className="h-4 w-4 text-success mx-auto mt-1" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-warning mx-auto mt-1" />
            )}
          </div>
        </div>

        {/* Détails des compétences */}
        {validation.rangA.competences.length > 0 && (
          <div>
            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Compétences Rang A ({validation.rangA.count})
            </h4>
            <div className="flex flex-wrap gap-1">
              {validation.rangA.competences.slice(0, 5).map((competence, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-primary/5 text-primary border-primary/30">
                  {competence}
                </Badge>
              ))}
              {validation.rangA.competences.length > 5 && (
                <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                  +{validation.rangA.competences.length - 5} autres
                </Badge>
              )}
            </div>
          </div>
        )}

        {validation.rangB.competences.length > 0 && (
          <div>
            <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Compétences Rang B ({validation.rangB.count})
            </h4>
            <div className="flex flex-wrap gap-1">
              {validation.rangB.competences.slice(0, 5).map((competence, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-accent/5 text-accent border-accent/30">
                  {competence}
                </Badge>
              ))}
              {validation.rangB.competences.length > 5 && (
                <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                  +{validation.rangB.competences.length - 5} autres
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Issues */}
        {validation.issues.length > 0 && (
          <div>
            <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Éléments manquants ({validation.issues.length})
            </h4>
            <div className="space-y-1">
              {validation.issues.map((issue, index) => (
                <div key={index} className="text-sm text-destructive bg-destructive/5 p-2 rounded border border-destructive/20">
                  • {issue}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status final */}
        <div className={`p-3 rounded-lg border ${
          validation.complete 
            ? 'bg-success/5 border-success/20 text-success' 
            : 'bg-warning/5 border-warning/20 text-warning'
        }`}>
          <div className={`flex items-center gap-2 font-semibold ${isMobile ? 'text-sm' : ''}`}>
            {validation.complete ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Item complet - Toutes les compétences sont présentes
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                {validation.issues.length === 0 && (validation.rangA.count > 0 || validation.rangB.count > 0) 
                  ? `Item utilisable - ${validation.rangA.count + validation.rangB.count} compétences disponibles`
                  : `Item en cours de développement - ${validation.issues.length} éléments à compléter`
                }
              </>
            )}
          </div>
        </div>
        
        {/* Alerte spécifique pour les items avec 0 compétences mais présents */}
        {!validation.complete && validation.rangA.present && validation.rangB.present && 
         validation.rangA.count === 0 && validation.rangB.count === 0 && (
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              Les tableaux de compétences sont présents mais vides. Les compétences seront bientôt disponibles.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};