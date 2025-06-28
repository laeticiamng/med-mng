
import React, { useState } from 'react';
import { withAuth } from '@/components/med-mng/withAuth';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { useSongGeneration } from '@/hooks/useSongGeneration';
import { MedMngNavigation } from '@/components/med-mng/MedMngNavigation';
import { CreateSongHeader } from '@/components/med-mng/create/CreateSongHeader';
import { CreateSongContainer } from '@/components/med-mng/create/CreateSongContainer';
import { InformationCard } from '@/components/med-mng/create/InformationCard';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

  const { data: quota, isLoading: quotaLoading, error: quotaError } = useQuery({
    queryKey: ['med-mng-quota'],
    queryFn: () => medMngApi.getRemainingQuota(),
    retry: 1,
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

  const canGenerate = (): boolean => {
    if (contentType === 'item') {
      return !!(selectedItem && selectedRang && style);
    }
    if (contentType === 'situation') {
      return !!(selectedSituation && style);
    }
    return false;
  };

  const handleGenerate = async () => {
    if (!canGenerate()) {
      toast.error('Veuillez sélectionner tous les paramètres requis');
      return;
    }

    // Vérifier les crédits avant de générer
    if (!quota || quota.remaining_credits <= 0) {
      toast.error('Crédits insuffisants. Veuillez souscrire à un abonnement.');
      navigate('/med-mng/pricing');
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

  // Affichage d'erreur si problème de chargement des quotas
  if (quotaError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <MedMngNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-red-800">Erreur de connexion</CardTitle>
                <CardDescription className="text-red-600">
                  Impossible de charger vos informations d'abonnement
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-red-700">
                  Veuillez vérifier votre connexion et réessayer
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Réessayer
                  </Button>
                  <Button 
                    onClick={() => navigate('/med-mng/pricing')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Voir les abonnements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Affichage spécial si pas d'abonnement ou crédits épuisés
  if (!quotaLoading && (!quota || quota.remaining_credits === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <MedMngNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="text-center">
                <CreditCard className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <CardTitle className="text-amber-800">Crédits épuisés</CardTitle>
                <CardDescription className="text-amber-600">
                  Vous n'avez plus de crédits pour générer de la musique
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-amber-700">
                  Pour continuer à créer des chansons personnalisées, souscrivez à un abonnement.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">🎵 Avec un abonnement :</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Génération musicale IA illimitée</li>
                    <li>• Styles musicaux variés</li>
                    <li>• Qualité audio premium</li>
                    <li>• Sauvegarde dans votre bibliothèque</li>
                  </ul>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => navigate('/med-mng/library')}
                    variant="outline"
                  >
                    Ma Bibliothèque
                  </Button>
                  <Button 
                    onClick={() => navigate('/med-mng/pricing')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Choisir un abonnement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <MedMngNavigation />
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
