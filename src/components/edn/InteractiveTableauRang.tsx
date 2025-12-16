// Interactive Tableau Rang with clickable sections and progress tracking
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, BookOpen, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface Competence {
  competence_id: string;
  concept?: string;
  title?: string;
  definition?: string;
  exemple?: string;
  application?: string;
  mastered?: boolean;
}

interface Section {
  title: string;
  content?: string;
  competences?: Competence[];
  keywords?: string[];
}

interface InteractiveTableauRangProps {
  rang: 'A' | 'B';
  sections: Section[];
  itemCode: string;
  onCompetenceClick?: (competence: Competence) => void;
  onStartRevision?: (section: Section) => void;
}

export const InteractiveTableauRang: React.FC<InteractiveTableauRangProps> = ({
  rang,
  sections,
  itemCode,
  onCompetenceClick,
  onStartRevision
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [masteredCompetences, setMasteredCompetences] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { logActivity } = useActivityTracking();
  const { toast } = useToast();

  // Load mastered competences from Supabase
  useEffect(() => {
    const loadMastered = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await (supabase as any)
        .from('user_item_progress')
        .select('competence_id')
        .eq('user_id', user.id)
        .eq('item_code', itemCode)
        .eq('mastered', true);
      
      if (data) {
        setMasteredCompetences(new Set(data.map((d: any) => d.competence_id)));
      }
    };
    loadMastered();
  }, [itemCode]);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const toggleMastered = useCallback(async (competenceId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const newMastered = new Set(masteredCompetences);
    const wasMastered = newMastered.has(competenceId);
    
    if (wasMastered) {
      newMastered.delete(competenceId);
    } else {
      newMastered.add(competenceId);
      logActivity({ activity_type: 'srs_review', metadata: { competenceId, itemCode, rang, action: 'competence_mastered' } });
    }
    setMasteredCompetences(newMastered);

    // Persist to localStorage (user_item_progress table doesn't have competence_id column)
    try {
      const key = `tableau_progress_${itemCode}_${rang}`;
      localStorage.setItem(key, JSON.stringify(Array.from(newMastered)));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }, [masteredCompetences, itemCode, rang, logActivity]);

  const resetProgress = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setLoading(true);
    try {
      await (supabase as any)
        .from('user_item_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('item_code', itemCode);
      
      setMasteredCompetences(new Set());
      toast({ title: 'Progression réinitialisée' });
    } catch (e) {
      console.error('Error resetting:', e);
    } finally {
      setLoading(false);
    }
  }, [itemCode, toast]);

  const handleCompetenceClick = (competence: Competence) => {
    logActivity({ activity_type: 'study', metadata: { competenceId: competence.competence_id, itemCode, action: 'competence_viewed' } });
    onCompetenceClick?.(competence);
  };

  const totalCompetences = sections.reduce((sum, s) => sum + (s.competences?.length || 0), 0);
  const masteredCount = masteredCompetences.size;
  const progressPercentage = totalCompetences > 0 ? (masteredCount / totalCompetences) * 100 : 0;

  const rangColor = rang === 'A' ? 'primary' : 'warning';

  return (
    <Card className={cn("border-2", rang === 'A' ? 'border-primary/30' : 'border-warning/30')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Badge className={rang === 'A' ? 'bg-primary' : 'bg-warning'}>
              Rang {rang}
            </Badge>
            <span className="text-lg">Compétences {rang === 'A' ? 'Fondamentales' : 'Approfondies'}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              {masteredCount}/{totalCompetences} maîtrisées
            </Badge>
            {masteredCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetProgress}
                disabled={loading}
                className="h-6 w-6 p-0"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {Math.round(progressPercentage)}% complété
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {sections.map((section, sectionIndex) => {
          const isExpanded = expandedSections.has(sectionIndex);
          const sectionMasteredCount = section.competences?.filter(c => 
            masteredCompetences.has(c.competence_id)
          ).length || 0;
          const sectionTotal = section.competences?.length || 0;

          return (
            <Collapsible
              key={sectionIndex}
              open={isExpanded}
              onOpenChange={() => toggleSection(sectionIndex)}
            >
              <CollapsibleTrigger asChild>
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                  rang === 'A' ? 'bg-primary/5 hover:bg-primary/10' : 'bg-warning/5 hover:bg-warning/10'
                )}>
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{section.title}</span>
                    {sectionTotal > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {sectionMasteredCount}/{sectionTotal}
                      </Badge>
                    )}
                  </div>
                  
                  {onStartRevision && sectionTotal > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartRevision(section);
                      }}
                      className="gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Réviser
                    </Button>
                  )}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2 pl-6 space-y-2">
                {section.content && (
                  <p className="text-sm text-muted-foreground pb-2">{section.content}</p>
                )}

                {section.competences?.map((competence, compIndex) => {
                  const isMastered = masteredCompetences.has(competence.competence_id);
                  
                  return (
                    <Card
                      key={competence.competence_id || compIndex}
                      className={cn(
                        "p-3 cursor-pointer transition-all hover:shadow-md",
                        isMastered ? 'bg-success/10 border-success/30' : 'hover:bg-muted/50'
                      )}
                      onClick={() => handleCompetenceClick(competence)}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMastered(competence.competence_id);
                          }}
                          className="mt-0.5"
                        >
                          {isMastered ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          )}
                        </button>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {competence.competence_id}
                            </Badge>
                            <span className={cn(
                              "font-medium text-sm",
                              isMastered && "text-success"
                            )}>
                              {competence.concept || competence.title}
                            </span>
                          </div>
                          
                          {competence.definition && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {competence.definition}
                            </p>
                          )}
                          
                          {competence.exemple && (
                            <div className="text-xs bg-muted/50 p-1.5 rounded">
                              <span className="font-medium">Ex:</span> {competence.exemple}
                            </div>
                          )}
                        </div>

                        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </Card>
                  );
                })}

                {section.keywords && section.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {section.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
};
