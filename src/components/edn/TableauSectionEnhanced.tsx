import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, CheckCircle2, Lightbulb, AlertCircle, Flame, Star } from 'lucide-react';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

interface CompetenceDetail {
  competence_id: string;
  concept: string;
  definition: string;
  exemple?: string;
  application?: string;
  niveau?: string;
  intitule?: string;
  description?: string;
  objectif_id?: string;
  rubrique?: string;
}

interface TableauSectionEnhancedProps {
  section: {
    title: string;
    content?: string;
    competences?: CompetenceDetail[];
    keywords?: string[];
  };
  rang: 'A' | 'B';
  index: number;
}

export const TableauSectionEnhanced: React.FC<TableauSectionEnhancedProps> = ({ 
  section, 
  rang, 
  index 
}) => {
  const { logActivity } = useActivityTracking();
  const { _stats, loadStats, _addPoints } = useGamification();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

  useEffect(() => {
    const trackView = async () => {
      if (!hasTrackedRef.current && section.title) {
        hasTrackedRef.current = true;
        logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { 
            component: 'tableau_section_enhanced', 
            action: 'view',
            rang,
            sectionTitle: section.title,
            competencesCount: section.competences?.length || 0
          }
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await _addPoints(user.id, 'itemReviewed');
        }
      }
    };
    trackView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.title, rang]);

  const themeColors = rang === 'A' 
    ? 'from-primary to-primary/80'
    : 'from-accent to-accent/80';

  const bgColor = rang === 'A'
    ? 'bg-primary/5 dark:bg-primary/10'
    : 'bg-accent/5 dark:bg-accent/10';

  return (
    <Card className="overflow-hidden border-2 hover:shadow-lg transition-all duration-300">
      <CardHeader className={`${bgColor} border-b-2`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${themeColors} text-primary-foreground flex items-center justify-center text-lg font-bold shadow-lg`}>
            {index + 1}
          </div>
          <CardTitle className="text-xl font-bold text-foreground flex-1">
            {section.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {_stats && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-background/50 rounded-full text-xs">
                <Flame className="h-3 w-3 text-warning" />
                <span className="font-bold text-warning">{_stats.currentStreak ?? 0}</span>
                <Star className="h-3 w-3 text-primary ml-1" />
                <span className="font-bold text-primary">Nv.{_stats.level ?? 1}</span>
              </div>
            )}
            {section.competences && section.competences.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {section.competences.length} compétence{section.competences.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Contenu textuel */}
        {section.content && (
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        )}

        {/* Compétences détaillées */}
        {section.competences && section.competences.length > 0 && (
          <div className="space-y-4">
            {section.competences.map((comp, compIndex) => (
              <Card key={compIndex} className="border border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    {/* En-tête de compétence */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {comp.objectif_id && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {comp.objectif_id}
                            </Badge>
                          )}
                          {comp.niveau && (
                            <Badge className={`${rang === 'A' ? 'bg-primary' : 'bg-accent'} text-primary-foreground`}>
                              {comp.niveau}
                            </Badge>
                          )}
                          {comp.rubrique && (
                            <Badge variant="secondary" className="text-xs">
                              {comp.rubrique}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-bold text-lg text-foreground mb-2">
                          {comp.intitule || comp.concept}
                        </h4>
                      </div>
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${themeColors} text-primary-foreground flex items-center justify-center flex-shrink-0`}>
                        <Book className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Définition */}
                    {(comp.definition || comp.description) && (
                      <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">Définition</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {comp.definition || comp.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Exemple */}
                    {comp.exemple && (
                      <div className="flex gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                        <Lightbulb className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-warning mb-1">Exemple clinique</p>
                          <p className="text-sm text-warning/80 leading-relaxed">
                            {comp.exemple}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Application */}
                    {comp.application && (
                      <div className="flex gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                        <AlertCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-success mb-1">Application pratique</p>
                          <p className="text-sm text-success/80 leading-relaxed">
                            {comp.application}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mots-clés */}
        {section.keywords && section.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <span className="text-sm font-semibold text-muted-foreground">Mots-clés :</span>
            {section.keywords.map((keyword, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
