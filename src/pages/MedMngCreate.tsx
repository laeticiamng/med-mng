
import React, { useState } from 'react';
import { withAuth } from '@/components/med-mng/withAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Wand2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { useSongGeneration } from '@/hooks/useSongGeneration';
import { ContentTypeSelector } from '@/components/med-mng/create/ContentTypeSelector';
import { ItemSelector } from '@/components/med-mng/create/ItemSelector';
import { SituationSelector } from '@/components/med-mng/create/SituationSelector';
import { StyleSelector } from '@/components/med-mng/create/StyleSelector';
import { SelectionPreview } from '@/components/med-mng/create/SelectionPreview';
import { GeneratedSongDisplay } from '@/components/med-mng/create/GeneratedSongDisplay';
import { PreviewPlaceholder } from '@/components/med-mng/create/PreviewPlaceholder';
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
  const navigate = useNavigate();
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/med-mng/library')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la bibliothèque
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Créer une chanson
            </h1>
            <p className="text-gray-600 mb-4">
              Sélectionnez votre contenu EDN et générez votre musique personnalisée
            </p>
            <div className="inline-flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
              <Music className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">
                Crédits restants: {quota?.remaining_credits || 0}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulaire de sélection */}
            <Card>
              <CardHeader>
                <CardTitle>Sélection du contenu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ContentTypeSelector
                  contentType={contentType}
                  onContentTypeChange={setContentType}
                  disabled={isGenerating}
                />

                {contentType === 'item' && (
                  <ItemSelector
                    selectedItem={selectedItem}
                    selectedRang={selectedRang}
                    onItemChange={setSelectedItem}
                    onRangChange={setSelectedRang}
                    disabled={isGenerating}
                  />
                )}

                {contentType === 'situation' && (
                  <SituationSelector
                    selectedSituation={selectedSituation}
                    onSituationChange={setSelectedSituation}
                    disabled={isGenerating}
                  />
                )}

                <StyleSelector
                  style={style}
                  onStyleChange={setStyle}
                  disabled={isGenerating}
                />

                <SelectionPreview title={getSelectedTitle()} />

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !canGenerate()}
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

            {/* Prévisualisation / Résultat */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {generatedSong ? 'Chanson générée' : 'Aperçu'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedSong ? (
                  <GeneratedSongDisplay
                    generatedSong={generatedSong}
                    style={style}
                    onPlay={playGeneratedSong}
                    onAddToLibrary={addToLibrary}
                  />
                ) : (
                  <PreviewPlaceholder selectedTitle={getSelectedTitle()} />
                )}
              </CardContent>
            </Card>
          </div>

          <InformationCard />
        </div>
      </div>
    </div>
  );
};

export const MedMngCreate = withAuth(MedMngCreateComponent);
