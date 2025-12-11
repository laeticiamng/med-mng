
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wand2, Flame, Star, Music } from 'lucide-react';
import { ContentTypeSelector } from './ContentTypeSelector';
import { ItemSelector } from './ItemSelector';
import { SituationSelector } from './SituationSelector';
import { StyleSelector } from './StyleSelector';
import { SelectionPreview } from './SelectionPreview';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';

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
          style,
          action: 'generate_attempt'
        }
      });
    }
    onGenerate();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sélection du contenu</CardTitle>
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
        <ContentTypeSelector
          contentType={contentType}
          onContentTypeChange={onContentTypeChange}
          disabled={isGenerating}
        />

        {contentType === 'item' && (
          <ItemSelector
            selectedItem={selectedItem}
            onItemSelect={onItemChange}
          />
        )}

        {contentType === 'situation' && (
          <SituationSelector
            selectedSituation={selectedSituation}
            onSituationChange={onSituationChange}
            disabled={isGenerating}
          />
        )}

        <StyleSelector
          style={style}
          onStyleChange={onStyleChange}
          disabled={isGenerating}
        />

        <SelectionPreview title={selectedTitle} />

        <Button
          onClick={handleGenerateWithTracking}
          disabled={isGenerating || !canGenerate}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
              Génération en cours...
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
