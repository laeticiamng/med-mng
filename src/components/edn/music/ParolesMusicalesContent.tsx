
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'rang-a' | 'rang-b')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rang-a" className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
              Rang A
            </Badge>
            Fondamentaux
          </TabsTrigger>
          <TabsTrigger value="rang-b" className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              Rang B
            </Badge>
            Approfondissements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rang-a" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="rang-b" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </>
  );
};
