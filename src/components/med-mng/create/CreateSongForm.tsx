
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, CheckCircle } from 'lucide-react';
import { ItemSelector } from './ItemSelector';
import { RangSelector } from './RangSelector';
import { StyleSelector } from './StyleSelector';
import { SelectionPreview } from './SelectionPreview';

interface CreateSongFormProps {
  selectedItem: string;
  selectedRang: string;
  style: string;
  isGenerating: boolean;
  selectedTitle: string;
  canGenerate: boolean;
  onItemChange: (value: string) => void;
  onRangChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onGenerate: () => void;
}

export const CreateSongForm: React.FC<CreateSongFormProps> = ({
  selectedItem,
  selectedRang,
  style,
  isGenerating,
  selectedTitle,
  canGenerate,
  onItemChange,
  onRangChange,
  onStyleChange,
  onGenerate
}) => {
  // Logique pour activer/désactiver les étapes
  const rangDisabled = !selectedItem || isGenerating;
  const styleDisabled = !selectedItem || !selectedRang || isGenerating;
  const generateDisabled = !canGenerate || isGenerating;

  return (
    <div className="space-y-6">
      {/* Étape 1: Sélection de l'item */}
      <ItemSelector
        selectedItem={selectedItem}
        onItemSelect={onItemChange}
        disabled={isGenerating}
      />

      {/* Étape 2: Sélection du rang (activée seulement si item sélectionné) */}
      <RangSelector
        selectedRang={selectedRang}
        onRangSelect={onRangChange}
        disabled={rangDisabled}
      />

      {/* Étape 3: Sélection du style (activée seulement si item et rang sélectionnés) */}
      <StyleSelector
        style={style}
        onStyleChange={onStyleChange}
        disabled={styleDisabled}
      />

      {/* Aperçu de la sélection */}
      {selectedTitle && (
        <SelectionPreview title={selectedTitle} />
      )}

      {/* Bouton de génération */}
      <div className="flex flex-col gap-4 pt-4">
        <Button
          onClick={onGenerate}
          disabled={generateDisabled}
          className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Génération en cours...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-3" />
              Générer ma chanson médicale
            </>
          )}
        </Button>

        {/* Indicateur de progression des étapes */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className={`flex items-center gap-1 ${selectedItem ? 'text-green-600' : ''}`}>
            {selectedItem ? <CheckCircle className="h-4 w-4" /> : <span className="w-4 h-4 rounded-full bg-gray-300" />}
            Item
          </div>
          <div className="w-8 h-px bg-gray-300" />
          <div className={`flex items-center gap-1 ${selectedRang ? 'text-green-600' : ''}`}>
            {selectedRang ? <CheckCircle className="h-4 w-4" /> : <span className="w-4 h-4 rounded-full bg-gray-300" />}
            Rang
          </div>
          <div className="w-8 h-px bg-gray-300" />
          <div className={`flex items-center gap-1 ${style ? 'text-green-600' : ''}`}>
            {style ? <CheckCircle className="h-4 w-4" /> : <span className="w-4 h-4 rounded-full bg-gray-300" />}
            Style
          </div>
        </div>
      </div>
    </div>
  );
};
