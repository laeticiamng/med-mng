
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { ContentTypeSelector } from './ContentTypeSelector';
import { ItemSelector } from './ItemSelector';
import { SituationSelector } from './SituationSelector';
import { StyleSelector } from './StyleSelector';
import { SelectionPreview } from './SelectionPreview';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sélection du contenu</CardTitle>
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
          onClick={onGenerate}
          disabled={isGenerating || !canGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
