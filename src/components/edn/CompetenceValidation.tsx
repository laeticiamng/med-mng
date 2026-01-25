import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { useOicCompetences } from '@/hooks/useOicCompetences';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Check, CheckCircle, Flame, Info, Loader2, RotateCcw, Star } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
interface CompetenceItem {
  competence?: string;
  title?: string;
  intitule?: string;
}

interface TableauRangData {
  competences_cles?: CompetenceItem[];
  sections?: Array<{ title?: string }>;
}

interface EdnItem {
  item_code?: string;
  tableau_rang_a?: TableauRangData | CompetenceItem[];
  tableau_rang_b?: TableauRangData | CompetenceItem[];
  paroles_musicales?: string[];
  quiz_questions?: unknown;
  scene_immersive?: unknown;
}

interface CompetenceValidationProps {
  item: EdnItem;
}

interface CompetenceMastery {
  objectif_id: string;
  is_mastered: boolean;
  mastery_level: number;
  review_count: number;
}

export const CompetenceValidation: React.FC<CompetenceValidationProps> = ({ item }) => {
  const isMobile = useIsMobile();
  const { logActivity } = useActivityTracking();
  const { loadStats } = useGamification();
  const { toast } = useToast();

  const [masteryData, setMasteryData] = useState<Map<string, CompetenceMastery>>(new Map());
  const [, setLoadingMastery] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  
  // Utiliser les vraies compétences OIC depuis la base de données
  const { competences: oicCompetencesA, loading: loadingA } = useOicCompetences(item?.item_code || '', 'A');
  const { competences: oicCompetencesB, loading: loadingB } = useOicCompetences(item?.item_code || '', 'B');

  // Charger les données de maîtrise de l'utilisateur + sync avec quiz
  const loadMasteryData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !item?.item_code) return;
    
    setLoadingMastery(true);
    
    // Charger les données de maîtrise existantes
    const { data: masteryResults } = await supabase
      .from('user_competence_mastery')
      .select('objectif_id, is_mastered, mastery_level, review_count')
      .eq('user_id', user.id)
      .eq('item_code', item.item_code);

    // Si score moyen > 80%, marquer comme partiellement maîtrisé
    const map = new Map<string, CompetenceMastery>();
    if (masteryResults) {
      masteryResults.forEach(d => map.set(d.objectif_id, d as CompetenceMastery));
    }
    
    setMasteryData(map);
    setLoadingMastery(false);
  }, [item?.item_code]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
        logActivity({ activity_type: 'study', metadata: { action: 'view_competence_validation', itemCode: item?.item_code } });
        loadMasteryData();
      }
    };
    load();
  }, [item?.item_code, loadStats, logActivity, loadMasteryData]);

  // Toggle mastery d'une compétence
  const toggleMastery = async (objectifId: string, rang: 'A' | 'B', currentlyMastered: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour suivre votre progression", variant: "destructive" });
      return;
    }
    
    setSavingId(objectifId);
    
    const newMastered = !currentlyMastered;
    const existing = masteryData.get(objectifId);
    
    if (existing) {
      // Update
      await supabase
        .from('user_competence_mastery')
        .update({ 
          is_mastered: newMastered, 
          mastery_level: newMastered ? 100 : 50,
          review_count: existing.review_count + 1,
          last_reviewed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('item_code', item.item_code)
        .eq('objectif_id', objectifId);
    } else {
      // Insert
      await supabase
        .from('user_competence_mastery')
        .insert({
          user_id: user.id,
          item_code: item.item_code,
          objectif_id: objectifId,
          rang,
          is_mastered: newMastered,
          mastery_level: newMastered ? 100 : 50,
          review_count: 1,
          last_reviewed_at: new Date().toISOString()
        });
    }
    
    // Ajouter des points si maîtrisé
    if (newMastered) {
      await _addPoints(user.id, 'itemReviewed');
    }
    
    // Mettre à jour le state local
    setMasteryData(prev => {
      const newMap = new Map(prev);
      newMap.set(objectifId, {
        objectif_id: objectifId,
        is_mastered: newMastered,
        mastery_level: newMastered ? 100 : 50,
        review_count: (existing?.review_count || 0) + 1
      });
      return newMap;
    });
    
    setSavingId(null);
    toast({ 
      title: newMastered ? "✅ Compétence maîtrisée !" : "📝 Marquée à revoir",
      description: newMastered ? "+10 XP" : "Continuez à réviser"
    });
  };

  // Bulk toggle - marquer toutes les compétences d'un rang
  const bulkToggleMastery = async (rang: 'A' | 'B', setAsMastered: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return;
    }
    
    const competences = rang === 'A' ? oicCompetencesA : oicCompetencesB;
    if (competences.length === 0) return;
    
    setSavingId('bulk');
    
    for (const comp of competences) {
      const existing = masteryData.get(comp.objectif_id);
      
      if (existing) {
        await supabase
          .from('user_competence_mastery')
          .update({ 
            is_mastered: setAsMastered, 
            mastery_level: setAsMastered ? 100 : 50,
            review_count: existing.review_count + 1,
            last_reviewed_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('item_code', item.item_code)
          .eq('objectif_id', comp.objectif_id);
      } else {
        await supabase
          .from('user_competence_mastery')
          .insert({
            user_id: user.id,
            item_code: item.item_code,
            objectif_id: comp.objectif_id,
            rang,
            is_mastered: setAsMastered,
            mastery_level: setAsMastered ? 100 : 50,
            review_count: 1,
            last_reviewed_at: new Date().toISOString()
          });
      }
    }
    
    // Mettre à jour le state local
    setMasteryData(prev => {
      const newMap = new Map(prev);
      competences.forEach(comp => {
        newMap.set(comp.objectif_id, {
          objectif_id: comp.objectif_id,
          is_mastered: setAsMastered,
          mastery_level: setAsMastered ? 100 : 50,
          review_count: (prev.get(comp.objectif_id)?.review_count || 0) + 1
        });
      });
      return newMap;
    });
    
    if (setAsMastered) {
      await _addPoints(user.id, 'perfectExam');
    }
    
    setSavingId(null);
    toast({ 
      title: setAsMastered ? `✅ ${competences.length} compétences maîtrisées !` : `📝 ${competences.length} compétences à revoir`,
      description: setAsMastered ? `Rang ${rang} validé` : `Rang ${rang} réinitialisé`
    });
  };

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
      if (!Array.isArray(item.tableau_rang_a) && item.tableau_rang_a.competences_cles && item.tableau_rang_a.competences_cles.length > 0) {
        result.rangA.count = item.tableau_rang_a.competences_cles.length;
        result.rangA.competences = item.tableau_rang_a.competences_cles.map((c: CompetenceItem) => c.competence || c.title || '').filter(Boolean);
      } else if (Array.isArray(item.tableau_rang_a) && item.tableau_rang_a.length > 0) {
        result.rangA.count = item.tableau_rang_a.length;
        result.rangA.competences = item.tableau_rang_a.map((c: CompetenceItem) => c.intitule || c.title || '').filter(Boolean);
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
      if (!Array.isArray(item.tableau_rang_b) && item.tableau_rang_b.competences_cles && item.tableau_rang_b.competences_cles.length > 0) {
        result.rangB.count = item.tableau_rang_b.competences_cles.length;
        result.rangB.competences = item.tableau_rang_b.competences_cles.map((c: CompetenceItem) => c.competence || c.title || '').filter(Boolean);
      } else if (Array.isArray(item.tableau_rang_b) && item.tableau_rang_b.length > 0) {
        result.rangB.count = item.tableau_rang_b.length;
        result.rangB.competences = item.tableau_rang_b.map((c: CompetenceItem) => c.intitule || c.title || '').filter(Boolean);
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
          {_stats && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs">
                <Flame className="h-3 w-3 text-orange-500" />
                {_stats?.currentStreak ?? 0}j
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs">
                <Star className="h-3 w-3 text-yellow-500" />
                Niv. {_stats?.level ?? 1}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={`space-y-4 ${isMobile ? 'p-4' : ''}`}>
        {/* Barre de progression de maîtrise */}
        {(oicCompetencesA.length > 0 || oicCompetencesB.length > 0) && (
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Votre progression sur cet item</span>
              <span className="text-sm font-bold text-primary">
                {Array.from(masteryData.values()).filter(m => m.is_mastered).length} / {oicCompetencesA.length + oicCompetencesB.length} maîtrisées
              </span>
            </div>
            <Progress 
              value={(Array.from(masteryData.values()).filter(m => m.is_mastered).length / Math.max(1, oicCompetencesA.length + oicCompetencesB.length)) * 100} 
              className="h-2"
            />
          </div>
        )}

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

        {/* Compétences Rang A avec tracking */}
        {oicCompetencesA.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <Info className="h-4 w-4" />
                Compétences Rang A ({oicCompetencesA.length})
              </h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => bulkToggleMastery('A', true)}
                  disabled={savingId === 'bulk'}
                  className="text-xs"
                >
                  {savingId === 'bulk' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                  Tout valider
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => bulkToggleMastery('A', false)}
                  disabled={savingId === 'bulk'}
                  className="text-xs text-muted-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Réinitialiser
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {oicCompetencesA.map((comp) => {
                const mastery = masteryData.get(comp.objectif_id);
                const isMastered = mastery?.is_mastered || false;
                const isSaving = savingId === comp.objectif_id;
                
                return (
                  <div 
                    key={comp.objectif_id} 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isMastered ? 'bg-success/10 border-success/30' : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs shrink-0">{comp.objectif_id}</Badge>
                        <span className="text-sm font-medium truncate">{comp.intitule}</span>
                      </div>
                      {mastery?.review_count && mastery.review_count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Révisée {mastery.review_count} fois
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={isMastered ? "default" : "outline"}
                      className={`shrink-0 ml-2 ${isMastered ? 'bg-success hover:bg-success/90' : ''}`}
                      onClick={() => toggleMastery(comp.objectif_id, 'A', isMastered)}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isMastered ? (
                        <><Check className="h-4 w-4 mr-1" /> Maîtrisée</>
                      ) : (
                        <><RotateCcw className="h-4 w-4 mr-1" /> À revoir</>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Compétences Rang B avec tracking */}
        {oicCompetencesB.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-accent flex items-center gap-2">
                <Info className="h-4 w-4" />
                Compétences Rang B ({oicCompetencesB.length})
              </h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => bulkToggleMastery('B', true)}
                  disabled={savingId === 'bulk'}
                  className="text-xs"
                >
                  {savingId === 'bulk' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                  Tout valider
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => bulkToggleMastery('B', false)}
                  disabled={savingId === 'bulk'}
                  className="text-xs text-muted-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Réinitialiser
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {oicCompetencesB.map((comp) => {
                const mastery = masteryData.get(comp.objectif_id);
                const isMastered = mastery?.is_mastered || false;
                const isSaving = savingId === comp.objectif_id;
                
                return (
                  <div 
                    key={comp.objectif_id} 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isMastered ? 'bg-success/10 border-success/30' : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs shrink-0">{comp.objectif_id}</Badge>
                        <span className="text-sm font-medium truncate">{comp.intitule}</span>
                      </div>
                      {mastery?.review_count && mastery.review_count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Révisée {mastery.review_count} fois
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={isMastered ? "default" : "outline"}
                      className={`shrink-0 ml-2 ${isMastered ? 'bg-success hover:bg-success/90' : ''}`}
                      onClick={() => toggleMastery(comp.objectif_id, 'B', isMastered)}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isMastered ? (
                        <><Check className="h-4 w-4 mr-1" /> Maîtrisée</>
                      ) : (
                        <><RotateCcw className="h-4 w-4 mr-1" /> À revoir</>
                      )}
                    </Button>
                  </div>
                );
              })}
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