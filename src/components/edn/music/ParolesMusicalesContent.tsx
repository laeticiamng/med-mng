
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MusicStyleSelector } from './MusicStyleSelector';
import { MusicDurationSelector } from './MusicDurationSelector';
import { MissingParolesWarning } from './MissingParolesWarning';
import { ParolesMusicalesRangTab } from './ParolesMusicalesRangTab';

interface ParolesMusicalesContentProps {
  paroles: string[];
  hasParoles: boolean;
  tableauRangA: any;
  tableauRangB: any;
  selectedStyle: string;
  selectedDuration: number;
  activeTab: 'rang-a' | 'rang-b';
  isGenerating: { rangA: boolean; rangB: boolean };
  generatedAudio: { rangA?: string; rangB?: string };
  onStyleChange: (style: string) => void;
  onDurationChange: (duration: number) => void;
  onTabChange: (tab: 'rang-a' | 'rang-b') => void;
  onGenerateA: () => void;
  onGenerateB: () => void;
}

export const ParolesMusicalesContent: React.FC<ParolesMusicalesContentProps> = ({
  paroles,
  hasParoles,
  tableauRangA,
  tableauRangB,
  selectedStyle,
  selectedDuration,
  activeTab,
  isGenerating,
  generatedAudio,
  onStyleChange,
  onDurationChange,
  onTabChange,
  onGenerateA,
  onGenerateB
}) => {
  return (
    <>
      <MissingParolesWarning isVisible={!hasParoles} />

      <div className="grid gap-6 md:grid-cols-2">
        <MusicStyleSelector
          selectedStyle={selectedStyle}
          onStyleChange={onStyleChange}
        />
        <MusicDurationSelector
          duration={selectedDuration}
          onDurationChange={onDurationChange}
        />
      </div>

      {/* Disposition côte à côte pour Rang A et Rang B */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Colonne Rang A à gauche */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-200">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
              Rang A
            </Badge>
            <span className="font-semibold text-amber-800">Fondamentaux</span>
          </div>
          
          <ParolesMusicalesRangTab
            rang="A"
            title="Génération Rang A - Fondamentaux"
            description="Concepts essentiels et connaissances de base"
            paroles={paroles}
            hasParoles={hasParoles}
            tableauData={tableauRangA}
            selectedStyle={selectedStyle}
            selectedDuration={selectedDuration}
            isGenerating={isGenerating.rangA}
            generatedAudio={generatedAudio.rangA}
            onGenerate={onGenerateA}
          />
        </div>

        {/* Colonne Rang B à droite */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-blue-200">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              Rang B
            </Badge>
            <span className="font-semibold text-blue-800">Approfondissements</span>
          </div>
          
          <ParolesMusicalesRangTab
            rang="B"
            title="Génération Rang B - Approfondissements"
            description="Connaissances avancées et spécialisées"
            paroles={paroles}
            hasParoles={hasParoles}
            tableauData={tableauRangB}
            selectedStyle={selectedStyle}
            selectedDuration={selectedDuration}
            isGenerating={isGenerating.rangB}
            generatedAudio={generatedAudio.rangB}
            onGenerate={onGenerateB}
          />
        </div>
      </div>

      {/* Version mobile avec onglets pour petits écrans */}
      <div className="md:hidden">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => onTabChange('rang-a')}
            className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
              activeTab === 'rang-a'
                ? 'border-b-2 border-amber-500 text-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 mr-2">
              Rang A
            </Badge>
            Fondamentaux
          </button>
          <button
            onClick={() => onTabChange('rang-b')}
            className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
              activeTab === 'rang-b'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 mr-2">
              Rang B
            </Badge>
            Approfondissements
          </button>
        </div>

        {activeTab === 'rang-a' && (
          <ParolesMusicalesRangTab
            rang="A"
            title="Génération Rang A - Fondamentaux"
            description="Concepts essentiels et connaissances de base"
            paroles={paroles}
            hasParoles={hasParoles}
            tableauData={tableauRangA}
            selectedStyle={selectedStyle}
            selectedDuration={selectedDuration}
            isGenerating={isGenerating.rangA}
            generatedAudio={generatedAudio.rangA}
            onGenerate={onGenerateA}
          />
        )}

        {activeTab === 'rang-b' && (
          <ParolesMusicalesRangTab
            rang="B"
            title="Génération Rang B - Approfondissements"
            description="Connaissances avancées et spécialisées"
            paroles={paroles}
            hasParoles={hasParoles}
            tableauData={tableauRangB}
            selectedStyle={selectedStyle}
            selectedDuration={selectedDuration}
            isGenerating={isGenerating.rangB}
            generatedAudio={generatedAudio.rangB}
            onGenerate={onGenerateB}
          />
        )}
      </div>
    </>
  );
};
