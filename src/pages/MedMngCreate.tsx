
import React, { useState } from 'react';
import { withAuth } from '@/components/med-mng/withAuth';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { useSongGeneration } from '@/hooks/useSongGeneration';
import { CreateSongHeader } from '@/components/med-mng/create/CreateSongHeader';
import { CreateSongContainer } from '@/components/med-mng/create/CreateSongContainer';
import { InformationCard } from '@/components/med-mng/create/InformationCard';

// Simuler la récupération des items EDN (à remplacer par votre vraie source de données)
const ednitems = [
  { code: 'IC1', title: 'Item à Choix Multiples 1' },
  { code: 'IC2', title: 'Item à Choix Multiples 2' },
  { code: 'IC3', title: 'Item à Choix Multiples 3' },
  { code: 'IC4', title: 'Item à Choix Multiples 4' },
  { code: 'IC5', title: 'Item à Choix Multiples 5' },
];

const situations = [
  { code: 'S1', title: 'Situation de départ 1' },
  { code: 'S2', title: 'Situation de départ 2' },
  { code: 'S3', title: 'Situation de départ 3' },
];

const MedMngCreateComponent = () => {
  const medMngApi = useMedMngApi();
  
  const [contentType, setContentType] = useState(''); // 'item' ou 'situation'
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedRang, setSelectedRang] = useState(''); // 'A' ou 'B'
  const [selectedSituation, setSelectedSituation] = useState('');
  const [style, setStyle] = useState('');

  const { data: quota } = useQuery({
    queryKey: ['med-mng-quota'],
    queryFn: () => medMngApi.getRemainingQuota(),
  });

  const {
    isGenerating,
    generatedSong,
    generateSong,
    playGeneratedSong,
    addToLibrary
  } = useSongGeneration();

  const getSelectedTitle = () => {
    if (contentType === 'item' && selectedItem && selectedRang) {
      const item = ednitems.find(i => i.code === selectedItem);
      return `${item?.title} - Rang ${selectedRang}`;
    }
    if (contentType === 'situation' && selectedSituation) {
      const situation = situations.find(s => s.code === selectedSituation);
      return situation?.title;
    }
    return '';
  };

  const canGenerate = () => {
    if (contentType === 'item') {
      return selectedItem && selectedRang && style;
    }
    if (contentType === 'situation') {
      return selectedSituation && style;
    }
    return false;
  };

  const handleGenerate = async () => {
    if (!canGenerate()) {
      toast.error('Veuillez sélectionner tous les paramètres requis');
      return;
    }

    const title = getSelectedTitle();
    await generateSong(
      contentType,
      selectedItem,
      selectedRang,
      selectedSituation,
      style,
      title,
      quota
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <CreateSongHeader remainingCredits={quota?.remaining_credits} />

        <div className="max-w-4xl mx-auto">
          <CreateSongContainer
            contentType={contentType}
            selectedItem={selectedItem}
            selectedRang={selectedRang}
            selectedSituation={selectedSituation}
            style={style}
            isGenerating={isGenerating}
            generatedSong={generatedSong}
            selectedTitle={getSelectedTitle()}
            canGenerate={canGenerate()}
            onContentTypeChange={setContentType}
            onItemChange={setSelectedItem}
            onRangChange={setSelectedRang}
            onSituationChange={setSelectedSituation}
            onStyleChange={setStyle}
            onGenerate={handleGenerate}
            onPlay={playGeneratedSong}
            onAddToLibrary={addToLibrary}
          />

          <InformationCard />
        </div>
      </div>
    </div>
  );
};

export const MedMngCreate = withAuth(MedMngCreateComponent);
