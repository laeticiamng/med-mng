import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info, XCircle, Flame, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

interface CompetenceValidationProps {
  item: any;
}

export const CompetenceValidation: React.FC<CompetenceValidationProps> = ({ item }) => {
  const isMobile = useIsMobile();
  const { logActivity } = useActivityTracking();
  const { stats, loadStats } = useGamification();

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

  const validateCompetences = () => {
    const validation = {
      rangA: {
        present: false,
        count: 0,
        competences: []
      },
      rangB: {
        present: false,
        count: 0,
        competences: []
      },
      complete: false,
      issues: []
    };

    // Validation Rang A - logique améliorée
    if (item.tableau_rang_a) {
      validation.rangA.present = true;
      
      if (item.tableau_rang_a.sections && Array.isArray(item.tableau_rang_a.sections)) {
        const concepts = item.tableau_rang_a.sections.flatMap((section: any) => 
          section.concepts || section.competences || []
        );
        validation.rangA.count = concepts.length;
        validation.rangA.competences = concepts.map((c: any) => 
          c.competence_id || c.concept || c.title || 'Compétence'
        ).filter(Boolean);
      } else if (item.tableau_rang_a.competences && Array.isArray(item.tableau_rang_a.competences)) {
        validation.rangA.count = item.tableau_rang_a.competences.length;
        validation.rangA.competences = item.tableau_rang_a.competences.map((c: any) => 
          c.competence_id || c.concept || c.title || 'Compétence'
        );
      }
    } else {
      validation.issues.push("Tableau Rang A manquant");
    }

    // Validation Rang B - logique améliorée
    if (item.tableau_rang_b) {
      validation.rangB.present = true;
      
      if (item.tableau_rang_b.sections && Array.isArray(item.tableau_rang_b.sections)) {
        const concepts = item.tableau_rang_b.sections.flatMap((section: any) => 
          section.concepts || section.competences || []
        );
        validation.rangB.count = concepts.length;
        validation.rangB.competences = concepts.map((c: any) => 
          c.competence_id || c.concept || c.title || 'Compétence'
        ).filter(Boolean);
      } else if (item.tableau_rang_b.competences && Array.isArray(item.tableau_rang_b.competences)) {
        validation.rangB.count = item.tableau_rang_b.competences.length;
        validation.rangB.competences = item.tableau_rang_b.competences.map((c: any) => 
          c.competence_id || c.concept || c.title || 'Compétence'
        );
      }
    } else {
      validation.issues.push("Tableau Rang B manquant");
    }

    // Vérification des contenus complémentaires
    if (!item.paroles_musicales || item.paroles_musicales.length === 0) {
      validation.issues.push("Paroles musicales manquantes");
    }

    if (!item.quiz_questions) {
      validation.issues.push("Quiz manquant");
    }

    if (!item.scene_immersive) {
      validation.issues.push("Scène immersive manquante");
    }

    // Déterminer si l'item est complet
    validation.complete = validation.rangA.present && 
                        validation.rangB.present && 
                        validation.rangA.count > 0 && 
                        validation.rangB.count > 0 &&
                        validation.issues.length === 0;

    return validation;
  };

  const validation = validateCompetences();

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