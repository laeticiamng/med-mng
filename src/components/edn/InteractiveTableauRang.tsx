// Interactive Tableau Rang with clickable sections and progress tracking
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, BookOpen, Play, RotateCcw, Search, SortAsc, SortDesc, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

type SortType = 'default' | 'alpha' | 'mastered' | 'unmastered';
type FilterType = 'all' | 'mastered' | 'unmastered';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('default');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const { logActivity } = useActivityTracking();
  const { toast } = useToast();

  // Load mastered competences from Supabase (migré depuis localStorage)
  useEffect(() => {
    const loadMastered = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback: charger depuis localStorage pour utilisateurs non connectés
        try {
          const key = `tableau_progress_${itemCode}_${rang}`;
          const saved = localStorage.getItem(key);
          if (saved) {
            setMasteredCompetences(new Set(JSON.parse(saved)));
          }
        } catch (e) {
          // Error handled silently
        }
        return;
      }
      
      const { data } = await supabase
        .from('user_competence_progress')
        .select('competence_id')
        .eq('user_id', user.id)
        .eq('item_code', itemCode)
        .eq('rang', rang)
        .eq('mastered', true);
      
      if (data) {
        setMasteredCompetences(new Set(data.map((d: any) => d.competence_id)));
      }
    };
    loadMastered();
  }, [itemCode, rang]);

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

    // Persist to Supabase (nouvelle table user_competence_progress)
    if (user) {
      try {
        if (wasMastered) {
          // Supprimer la maîtrise
          await supabase
            .from('user_competence_progress')
            .delete()
            .eq('user_id', user.id)
            .eq('item_code', itemCode)
            .eq('rang', rang)
            .eq('competence_id', competenceId);
        } else {
          // Ajouter la maîtrise
          await supabase
            .from('user_competence_progress')
            .upsert({
              user_id: user.id,
              item_code: itemCode,
              rang: rang,
              competence_id: competenceId,
              mastered: true,
              mastered_at: new Date().toISOString()
            }, { onConflict: 'user_id,item_code,rang,competence_id' });
        }
      } catch (e) {
        // Error handled silently
      }
    } else {
      // Fallback localStorage pour utilisateurs non connectés
      try {
        const key = `tableau_progress_${itemCode}_${rang}`;
        localStorage.setItem(key, JSON.stringify(Array.from(newMastered)));
      } catch (e) {
        // Error handled silently
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masteredCompetences, itemCode, rang]);

  const resetProgress = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    setLoading(true);
    try {
      if (user) {
        // Supprimer depuis Supabase
        await supabase
          .from('user_competence_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('item_code', itemCode)
          .eq('rang', rang);
      } else {
        // Supprimer depuis localStorage
        const key = `tableau_progress_${itemCode}_${rang}`;
        localStorage.removeItem(key);
      }
      
      setMasteredCompetences(new Set());
      toast({ title: 'Progression réinitialisée' });
    } catch (e) {
      // Error handled silently
      toast({ title: 'Erreur lors de la réinitialisation', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [itemCode, rang, toast]);

  const handleCompetenceClick = (competence: Competence) => {
    logActivity({ activity_type: 'study', metadata: { competenceId: competence.competence_id, itemCode, action: 'competence_viewed' } });
    onCompetenceClick?.(competence);
  };

  // Filter and sort sections with competences
  const processedSections = useMemo(() => {
    return sections.map(section => {
      let competences = section.competences || [];
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        competences = competences.filter(c => 
          c.competence_id.toLowerCase().includes(query) ||
          (c.concept || '').toLowerCase().includes(query) ||
          (c.title || '').toLowerCase().includes(query) ||
          (c.definition || '').toLowerCase().includes(query)
        );
      }
      
      // Apply mastery filter
      if (filterType === 'mastered') {
        competences = competences.filter(c => masteredCompetences.has(c.competence_id));
      } else if (filterType === 'unmastered') {
        competences = competences.filter(c => !masteredCompetences.has(c.competence_id));
      }
      
      // Apply sorting
      if (sortType === 'alpha') {
        competences = [...competences].sort((a, b) => 
          (a.concept || a.title || '').localeCompare(b.concept || b.title || '')
        );
      } else if (sortType === 'mastered') {
        competences = [...competences].sort((a, b) => {
          const aMastered = masteredCompetences.has(a.competence_id) ? 1 : 0;
          const bMastered = masteredCompetences.has(b.competence_id) ? 1 : 0;
          return bMastered - aMastered;
        });
      } else if (sortType === 'unmastered') {
        competences = [...competences].sort((a, b) => {
          const aMastered = masteredCompetences.has(a.competence_id) ? 1 : 0;
          const bMastered = masteredCompetences.has(b.competence_id) ? 1 : 0;
          return aMastered - bMastered;
        });
      }
      
      return { ...section, competences };
    });
  }, [sections, searchQuery, filterType, sortType, masteredCompetences]);

  const totalCompetences = sections.reduce((sum, s) => sum + (s.competences?.length || 0), 0);
  const masteredCount = masteredCompetences.size;
  const progressPercentage = totalCompetences > 0 ? (masteredCount / totalCompetences) * 100 : 0;

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
                aria-label="Réinitialiser la progression"
              >
                <RotateCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
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

      {/* Search and Filter Bar */}
      <CardContent className="pb-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une compétence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-8">
                {sortType === 'alpha' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                Trier
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortType('default')}>Par défaut</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortType('alpha')}>Alphabétique</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortType('mastered')}>Maîtrisées d'abord</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortType('unmastered')}>À revoir d'abord</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-8">
                <Filter className="h-3 w-3" />
                {filterType === 'all' ? 'Toutes' : filterType === 'mastered' ? 'Maîtrisées' : 'À revoir'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterType('all')}>Toutes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('mastered')}>Maîtrisées seulement</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('unmastered')}>À revoir seulement</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      <CardContent className="space-y-3 pt-4">
        {processedSections.map((section, sectionIndex) => {
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
