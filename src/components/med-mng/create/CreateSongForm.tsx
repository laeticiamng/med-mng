import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wand2, Flame, Star, Music, Info } from 'lucide-react';
import { ContentTypeSelector } from './ContentTypeSelector';
import { ItemSelector } from './ItemSelector';
import { SituationSelector } from './SituationSelector';
import { StyleSelector } from './StyleSelector';
import { SelectionPreview } from './SelectionPreview';
import { RangSelector } from './RangSelector';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateSongFormProps {
  contentType: string;
  selectedItem: string;
  selectedRang: string;
  selectedSituation: string;
  style: string;
  isGenerating: boolean;
  selectedTitle: string;
  canGenerate: boolean;
  onContentTypeChange: (value: string) => void;
  onItemChange: (value: string) => void;
  onRangChange: (value: string) => void;
  onSituationChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onGenerate: () => void;
}

export const CreateSongForm: React.FC<CreateSongFormProps> = ({
  contentType,
  selectedItem,
  selectedRang,
  selectedSituation,
  style,
  isGenerating,
  selectedTitle,
  canGenerate,
  onContentTypeChange,
  onItemChange,
  onRangChange,
  onSituationChange,
  onStyleChange,
  onGenerate
}) => {
  const { stats } = useGamification();
  const { logActivity } = useActivityTracking();
  const [user, setUser] = React.useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleGenerateWithTracking = async () => {
    // Track generation attempt
    if (user) {
      await logActivity({
        activity_type: 'music_generation',
        count: 1,
        metadata: { 
          contentType, 
          selectedItem, 
          selectedRang,
          style,
          action: 'generate_attempt'
        }
      });
    }
    onGenerate();
  };

  // Calcul du statut de complétion
  const getCompletionStatus = () => {
    const steps = [];
    if (contentType === 'item') {
      steps.push({ done: !!selectedItem, label: 'Item sélectionné' });
      steps.push({ done: !!selectedRang, label: 'Rang choisi' });
    } else if (contentType === 'situation') {
      steps.push({ done: !!selectedSituation, label: 'Situation sélectionnée' });
    }
    steps.push({ done: !!style, label: 'Style musical choisi' });
    return steps;
  };

  const completionSteps = getCompletionStatus();
  const completedCount = completionSteps.filter(s => s.done).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Créer votre chanson</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {completedCount}/{completionSteps.length} étapes complétées
            </p>
          </div>
          {user && stats && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Flame className="h-3 w-3 text-warning" />
                {stats.currentStreak}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3 text-primary" />
                Nv.{stats.level}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Étape 1: Type de contenu */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
            Type de contenu
          </h3>
          <ContentTypeSelector
            contentType={contentType}
            onContentTypeChange={onContentTypeChange}
            disabled={isGenerating}
          />
        </div>

        {/* Étape 2: Sélection de l'item */}
        {contentType === 'item' && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              Item de formation
            </h3>
            <ItemSelector
              selectedItem={selectedItem}
              onItemSelect={onItemChange}
            />
          </div>
        )}

        {/* Étape 2bis: Sélection du Rang (si item sélectionné) */}
        {contentType === 'item' && selectedItem && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
              Rang de connaissances
            </h3>
            <RangSelector
              selectedRang={selectedRang as 'A' | 'B' | ''}
              onRangChange={onRangChange}
              disabled={isGenerating}
            />
          </div>
        )}

        {contentType === 'situation' && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              Situation clinique
            </h3>
            <SituationSelector
              selectedSituation={selectedSituation}
              onSituationChange={onSituationChange}
              disabled={isGenerating}
            />
          </div>
        )}

        {/* Étape 3/4: Style musical */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {contentType === 'item' && selectedItem ? '4' : '3'}
            </span>
            Style musical
          </h3>
          <StyleSelector
            style={style}
            onStyleChange={onStyleChange}
            disabled={isGenerating}
          />
        </div>

        {/* Aperçu de la sélection */}
        <SelectionPreview title={selectedTitle} />

        {/* Message d'info */}
        {!canGenerate && contentType && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {!selectedItem && contentType === 'item' && 'Sélectionnez un item pour continuer'}
              {selectedItem && !selectedRang && contentType === 'item' && 'Choisissez un rang (A ou B)'}
              {!selectedSituation && contentType === 'situation' && 'Sélectionnez une situation'}
              {(selectedItem || selectedSituation) && !style && 'Choisissez un style musical'}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleGenerateWithTracking}
          disabled={isGenerating || !canGenerate}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
              Génération en cours... (30-60 sec)
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Générer ma chanson
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
