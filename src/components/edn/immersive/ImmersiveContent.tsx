import { Badge } from '@/components/ui/badge';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { Flame, Star, Trophy } from 'lucide-react';
import React, { useCallback, useEffect, useRef } from 'react';
import { BandeDessinee } from '../BandeDessinee';
import { ParolesMusicales } from '../ParolesMusicales';
import { InteractionSection } from './InteractionSection';
import { QuizSection } from './QuizSection';
import { TableauSection } from './TableauSection';

interface ImmersiveItem {
  item_code: string;
  slug: string;
  title: string;
  subtitle?: string;
  pitch_intro?: string;
  scene_immersive?: Json;
  tableau_rang_a?: Json;
  tableau_rang_b?: Json;
  paroles_musicales?: string[];
  interaction_config?: Json;
  quiz_questions?: Json;
}

interface ImmersiveContentProps {
  item: ImmersiveItem;
  currentSection: number;
  sections: string[];
}

export const ImmersiveContent: React.FC<ImmersiveContentProps> = ({
  item,
  currentSection,
  sections
}) => {
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();
  const hasTrackedRef = useRef(false);

  // Reset tracking when item changes
  useEffect(() => {
    hasTrackedRef.current = false;
  }, [item.item_code]);

  const loadUserStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) loadStats(user.id);
  }, [loadStats]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { 
        component: 'immersive_content', 
        itemCode: item.item_code, 
        section: currentSection,
        sectionName: sections[currentSection]
      }
    });

    // Award points for first section view
    const awardPoints = async () => {
      if (!hasTrackedRef.current) {
        hasTrackedRef.current = true;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await addPoints(user.id, 'itemReviewed');
        }
      }
    };
    awardPoints();
  }, [currentSection, item.item_code, sections, logActivity, addPoints]);

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Pitch d'introduction
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            {item.pitch_intro ? (
              <p className="text-lg leading-relaxed">{item.pitch_intro}</p>
            ) : (
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded">
                <p className="text-destructive">⚠️ Pitch d'introduction non disponible dans Supabase</p>
              </div>
            )}
          </div>
        );

      case 1: // Scène immersive
        const sceneData = item.scene_immersive as { setting?: string; scenario?: string; characters?: Array<{ name: string; role: string; description: string }> } | null;
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">Scène immersive</h2>
            {sceneData ? (
              <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Contexte</h3>
                <p className="text-muted-foreground mb-4">{sceneData.setting || 'Contexte médical professionnel'}</p>
                
                {sceneData.characters && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Personnages :</h4>
                    <div className="space-y-2">
                      {sceneData.characters.map((char, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="outline">{char.role}</Badge>
                          <span>{char.name} - {char.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {sceneData.scenario && (
                  <div>
                    <h4 className="font-semibold mb-2">Scénario :</h4>
                    <p className="text-muted-foreground">{sceneData.scenario}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded">
                <p className="text-destructive">⚠️ Scène immersive non disponible dans Supabase</p>
              </div>
            )}
          </div>
        );

      case 2: // Tableau Rang A
        return (
          <TableauSection
            key={`rang-a-${item.slug}-${currentSection}`}
            data={item.tableau_rang_a as { sections?: Array<{ title?: string; concepts?: unknown[] }>; title?: string } | null}
            title="Fondamentaux - Rang A"
            type="rang_a"
          />
        );

      case 3: // Tableau Rang B
        return (
          <TableauSection
            key={`rang-b-${item.slug}-${currentSection}`}
            data={item.tableau_rang_b as { sections?: Array<{ title?: string; concepts?: unknown[] }>; title?: string } | null}
            title="Approfondissements - Rang B"
            type="rang_b"
          />
        );

      case 4: // Paroles musicales
        return (
          <div>
            {/* Toujours afficher la section, même si les paroles sont incomplètes */}
            <ParolesMusicales
              paroles={item.paroles_musicales || []}
              itemCode={item.item_code}
              _tableauRangA={item.tableau_rang_a as { title?: string; sections?: Array<{ title?: string; content?: string }> } | undefined}
              _tableauRangB={item.tableau_rang_b as { title?: string; sections?: Array<{ title?: string; content?: string }> } | undefined}
            />
            
            {/* Afficher un avertissement si les paroles sont insuffisantes */}
            {(!item.paroles_musicales || item.paroles_musicales.length < 2) && (
              <div className="mt-4 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-warning">
                  ⚠️ <strong>Paroles incomplètes</strong> - Cet item nécessite des paroles plus complètes avec au moins 3 couplets et un refrain répété.
                </p>
                <p className="text-warning/80 mt-2 text-sm">
                  Données actuelles : {item.paroles_musicales?.length || 0} paragraphe(s) trouvé(s)
                </p>
              </div>
            )}
          </div>
        );

      case 5: // Bande dessinée
        return (
          <BandeDessinee
            itemData={{
              title: item.title,
              subtitle: item.subtitle || '',
              slug: item.slug,
              item_code: item.item_code,
              tableau_rang_a: item.tableau_rang_a as { title?: string; sections?: Array<{ title?: string; content?: string }> } | undefined,
              tableau_rang_b: item.tableau_rang_b as { title?: string; sections?: Array<{ title?: string; content?: string }> } | undefined
            }}
          />
        );

      case 6: // Interaction
        return (
          <InteractionSection
            interactionConfig={item.interaction_config as Parameters<typeof InteractionSection>[0]['interactionConfig']}
            itemCode={item.item_code}
          />
        );

      case 7: // Quiz final
        return (
          <QuizSection
            quizData={item.quiz_questions as Parameters<typeof QuizSection>[0]['quizData']}
            itemCode={item.item_code}
          />
        );

      default:
        return (
          <div className="p-4 bg-warning/10 border border-warning/30 rounded">
            <p className="text-warning">Section en cours de développement...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[600px]">
      {stats && (
        <div className="flex items-center gap-3 mb-4 p-2 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-warning" />
            <span className="font-bold text-warning">{stats.currentStreak ?? 0}j</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-primary" />
            <span className="font-bold text-primary">Nv.{stats.level ?? 1}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-success" />
            <span className="text-sm text-muted-foreground">{stats.badges?.length || 0} badges</span>
          </div>
        </div>
      )}
      {renderSection()}
    </div>
  );
};
