
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Créer votre chanson médicale
        </CardTitle>
        <p className="text-sm text-gray-600">
          Suivez les étapes pour générer une chanson personnalisée basée sur un item EDN
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Étape 1: Sélection de l'item */}
        <ItemSelector
          selectedItem={selectedItem}
          onItemSelect={onItemChange}
        />

        {/* Étape 2: Sélection du rang (seulement si un item est sélectionné) */}
        {selectedItem && (
          <RangSelector
            selectedRang={selectedRang}
            onRangChange={onRangChange}
            disabled={isGenerating}
          />
        )}

        {/* Étape 3: Sélection du style (seulement si un rang est sélectionné) */}
        {selectedItem && selectedRang && (
          <StyleSelector
            style={style}
            onStyleChange={onStyleChange}
            disabled={isGenerating}
            allowCombinations={true}
          />
        )}

        {/* Récapitulatif de la sélection */}
        {selectedTitle && (
          <SelectionPreview title={selectedTitle} />
        )}

        {/* Indicateurs de progression */}
        <div className="flex items-center justify-center space-x-4 py-4">
          <div className={`flex items-center space-x-2 ${selectedItem ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${selectedItem ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">Item</span>
          </div>
          <div className={`w-8 h-0.5 ${selectedItem ? 'bg-green-300' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center space-x-2 ${selectedRang ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${selectedRang ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">Rang</span>
          </div>
          <div className={`w-8 h-0.5 ${selectedRang ? 'bg-green-300' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center space-x-2 ${style ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${style ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">Style</span>
          </div>
        </div>

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
