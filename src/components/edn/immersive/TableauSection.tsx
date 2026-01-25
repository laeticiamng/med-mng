import React, { useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Star } from 'lucide-react';

interface TableauConcept {
  competence_id?: string;
  concept?: string;
  definition?: string;
  exemple?: string;
  cas?: string;
  piege?: string;
  ecueil?: string;
  application?: string;
  technique?: string;
}

interface TableauSectionData {
  title?: string;
  concepts?: TableauConcept[];
}

interface TableauData {
  sections?: TableauSectionData[];
  title?: string;
}

interface TableauSectionProps {
  data: TableauData | null;
  title: string;
  type: 'rang_a' | 'rang_b';
}

export const TableauSection: React.FC<TableauSectionProps> = ({ data, title, type }) => {
  const { logActivity } = useActivityTracking();
  const { _stats, loadStats, _addPoints } = useGamification();
  const hasTrackedRef = useRef(false);

  const loadUserStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) loadStats(user.id);
  }, [loadStats]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);
  
  useEffect(() => {
    const track = async () => {
      if (data && !hasTrackedRef.current) {
        hasTrackedRef.current = true;
        logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { component: 'tableau_section', type, title }
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await _addPoints(user.id, 'itemReviewed');
        }
      }
    };
    track();
  }, [data, type, title, logActivity, _addPoints]);

  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive">⚠️ {title} - Contenu indisponible</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Les données pour ce tableau ne sont pas encore disponibles dans Supabase.</p>
        </CardContent>
      </Card>
    );
  }

  const sections = data.sections || [];
  const theme = data.title || title;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={type === 'rang_a' ? 'default' : 'secondary'}>
              {type === 'rang_a' ? 'Rang A' : 'Rang B'}
            </Badge>
            {theme}
          </div>
          {_stats && (
            <div className="flex items-center gap-2 px-2 py-1 bg-muted/30 rounded-full text-xs">
              <Flame className="h-3 w-3 text-warning" />
              <span className="font-bold text-warning">{_stats.currentStreak ?? 0}</span>
              <Star className="h-3 w-3 text-primary ml-1" />
              <span className="font-bold text-primary">Nv.{_stats.level ?? 1}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            {section.title && (
              <h3 className="font-semibold text-lg mb-3 text-primary">
                {section.title}
              </h3>
            )}
            
            {/* Afficher les compétences de la section */}
            {section.concepts && section.concepts.map((concept, conceptIndex) => (
              <div key={`${sectionIndex}-${conceptIndex}`} className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {concept.competence_id}
                  </Badge>
                </div>
                
                <h4 className="font-semibold text-lg mb-3 text-primary">
                  {concept.concept}
                </h4>
                
                <div className="space-y-3">
                  {concept.definition && (
                    <div>
                      <span className="font-medium text-foreground">Définition : </span>
                      <p className="text-muted-foreground">{concept.definition}</p>
                    </div>
                  )}
                  
                  {type === 'rang_a' && concept.exemple && (
                    <div>
                      <span className="font-medium text-success">Exemple : </span>
                      <p className="text-muted-foreground italic">{concept.exemple}</p>
                    </div>
                  )}
                  
                  {type === 'rang_b' && concept.cas && (
                    <div>
                      <span className="font-medium text-success">Cas clinique : </span>
                      <p className="text-muted-foreground italic">{concept.cas}</p>
                    </div>
                  )}
                  
                  {type === 'rang_a' && concept.piege && (
                    <div className="bg-warning/10 p-3 rounded border-l-4 border-warning">
                      <span className="font-medium text-warning">⚠️ Piège à éviter : </span>
                      <p className="text-warning/80">{concept.piege}</p>
                    </div>
                  )}
                  
                  {type === 'rang_b' && concept.ecueil && (
                    <div className="bg-warning/10 p-3 rounded border-l-4 border-warning">
                      <span className="font-medium text-warning">⚠️ Écueil d'expert : </span>
                      <p className="text-warning/80">{concept.ecueil}</p>
                    </div>
                  )}
                  
                  {type === 'rang_a' && concept.application && (
                    <div className="bg-primary/10 p-3 rounded">
                      <span className="font-medium text-primary">🎯 Application : </span>
                      <p className="text-primary/80">{concept.application}</p>
                    </div>
                  )}
                  
                  {type === 'rang_b' && concept.technique && (
                    <div className="bg-primary/10 p-3 rounded">
                      <span className="font-medium text-primary">🎯 Technique : </span>
                      <p className="text-primary/80">{concept.technique}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
