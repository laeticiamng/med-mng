
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ParolesMusicalesHeader } from './music/ParolesMusicalesHeader';
import { ParolesMusicalesContent } from './music/ParolesMusicalesContent';
import { ParolesMusicalesEmptyState } from './music/ParolesMusicalesEmptyState';
import { ParolesMusicalesErrorDisplay } from './music/ParolesMusicalesErrorDisplay';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';

interface ParolesMusicalesProps {
  paroles?: string[];
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
}

export const ParolesMusicales: React.FC<ParolesMusicalesProps> = ({
  paroles = [],
  itemCode,
  tableauRangA,
  tableauRangB
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(120);
  const [activeTab, setActiveTab] = useState<'rang-a' | 'rang-b'>('rang-a');

  const {
    generateMusicInLanguage,
    isGenerating,
    generatedAudio,
    lastError,
    currentLanguage
  } = useMusicGenerationWithTranslation();

  // Vérifier si nous avons des données suffisantes
  const hasParoles = paroles && paroles.length > 0;
  const hasTableauData = tableauRangA || tableauRangB;
  
  console.log('🎵 ParolesMusicales rendu avec:', {
    paroles: paroles,
    parolesLength: paroles?.length,
    hasParoles,
    hasTableauData,
    itemCode,
    isGenerating,
    generatedAudio
  });

  const handleGenerate = async (rang: 'A' | 'B') => {
    if (!selectedStyle) {
      alert('Veuillez sélectionner un style musical');
      return;
    }

    const parolesData = hasParoles ? paroles : [];
    await generateMusicInLanguage(rang, parolesData, selectedStyle, selectedDuration);
  };

  const handleGenerateA = () => handleGenerate('A');
  const handleGenerateB = () => handleGenerate('B');

  if (!hasParoles && !hasTableauData) {
    return (
      <div className="space-y-6">
        <ParolesMusicalesEmptyState itemCode={itemCode} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ParolesMusicalesHeader itemCode={itemCode} />

      <ParolesMusicalesContent
        paroles={paroles}
        hasParoles={hasParoles}
        tableauRangA={tableauRangA}
        tableauRangB={tableauRangB}
        selectedStyle={selectedStyle}
        selectedDuration={selectedDuration}
        activeTab={activeTab}
        isGenerating={isGenerating}
        generatedAudio={generatedAudio}
        onStyleChange={setSelectedStyle}
        onDurationChange={setSelectedDuration}
        onTabChange={setActiveTab}
        onGenerateA={handleGenerateA}
        onGenerateB={handleGenerateB}
      />

      <ParolesMusicalesErrorDisplay lastError={lastError} />
    </div>
  );
};
