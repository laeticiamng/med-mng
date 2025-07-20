import React from 'react';
import { Wand2 } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { TranslatedText } from '@/components/TranslatedText';
import { ContentTypeSelector } from './ContentTypeSelector';
import { EdnItemSelector } from './EdnItemSelector'; 
import { EcosSelector } from './EcosSelector';
import { RangSelector } from './RangSelector';
import { StyleSelector } from './StyleSelector';
import { LyricsStatusDisplay } from './LyricsStatusDisplay';

interface GeneratorFormProps {
  contentType: string;
  setContentType: (type: string) => void;
  selectedItem: string;
  setSelectedItem: (item: string) => void;
  selectedRang: string;
  setSelectedRang: (rang: string) => void;
  selectedSituation: string;
  setSelectedSituation: (situation: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  allEdnItems: any[];
  itemsLoading: boolean;
  itemsError: string | null;
  ednLyrics: any;
  lyricsLoading: boolean;
  lyricsError: string | null;
  canGenerate: () => boolean;
  handleGenerate: () => void;
  resetForm: () => void;
  isGenerating: boolean;
  user: any;
  remainingFree: number;
  canGenerateMusic: () => boolean;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  contentType,
  setContentType,
  selectedItem,
  setSelectedItem,
  selectedRang,
  setSelectedRang,
  selectedSituation,
  setSelectedSituation,
  selectedStyle,
  setSelectedStyle,
  allEdnItems,
  itemsLoading,
  itemsError,
  ednLyrics,
  lyricsLoading,
  lyricsError,
  canGenerate,
  handleGenerate,
  resetForm,
  isGenerating,
  user,
  remainingFree,
  canGenerateMusic
}) => {
  const handleContentTypeChange = (type: string) => {
    setContentType(type);
    if (type === 'edn') {
      setSelectedSituation('');
    } else {
      setSelectedItem('');
      setSelectedRang('');
    }
  };

  return (
    <PremiumCard variant="glass" className="mb-12 p-8">
      <div className="flex items-center gap-4 mb-8">
        <Wand2 className="h-8 w-8 text-amber-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            <TranslatedText text="Configuration de génération" />
          </h2>
          <p className="text-gray-600">
            <TranslatedText text="Sélectionnez le type de contenu, l'item et le style musical" />
          </p>
        </div>
      </div>
      
      <div className="space-y-8">
        <ContentTypeSelector
          contentType={contentType}
          onContentTypeChange={handleContentTypeChange}
          allEdnItems={allEdnItems}
          itemsLoading={itemsLoading}
        />

        {contentType === 'edn' && (
          <>
            <EdnItemSelector
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              allEdnItems={allEdnItems}
              itemsLoading={itemsLoading}
              itemsError={itemsError}
            />

            <LyricsStatusDisplay
              selectedItem={selectedItem}
              lyricsLoading={lyricsLoading}
              lyricsError={lyricsError}
              ednLyrics={ednLyrics}
            />

            <RangSelector
              selectedRang={selectedRang}
              setSelectedRang={setSelectedRang}
            />
          </>
        )}

        {contentType === 'ecos' && (
          <EcosSelector
            selectedSituation={selectedSituation}
            setSelectedSituation={setSelectedSituation}
          />
        )}

        {contentType && (
          <StyleSelector
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
          />
        )}

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 pt-6">
          <PremiumButton
            variant="primary"
            size="xl"
            onClick={handleGenerate}
            disabled={!canGenerate() || isGenerating || (!user && remainingFree <= 0) || (user && !canGenerateMusic()) || lyricsLoading}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full" />
                <TranslatedText text="Génération en cours..." />
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-3" />
                <TranslatedText text="Générer la musique" />
              </>
            )}
          </PremiumButton>
          
          <PremiumButton
            variant="secondary"
            size="xl"
            onClick={resetForm}
          >
            <TranslatedText text="Réinitialiser" />
          </PremiumButton>
        </div>
      </div>
    </PremiumCard>
  );
};