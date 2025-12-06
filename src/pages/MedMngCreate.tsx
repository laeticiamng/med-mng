
import React, { useState } from 'react';
import { withAuth } from '@/components/med-mng/withAuth';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { useSongGeneration } from '@/hooks/useSongGeneration';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { CreateSongHeader } from '@/components/med-mng/create/CreateSongHeader';
import { CreateSongContainer } from '@/components/med-mng/create/CreateSongContainer';
import { InformationCard } from '@/components/med-mng/create/InformationCard';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/config/routes';

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
      navigate(ROUTE_PATHS.medMngPricing);
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
      <MedMngLayout className="bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <CardTitle className="text-destructive">Erreur de connexion</CardTitle>
                <CardDescription className="text-destructive/80">
                  Impossible de charger vos informations d'abonnement
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-destructive/70">
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
                    onClick={() => navigate(ROUTE_PATHS.medMngPricing)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Voir les abonnements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MedMngLayout>
    );
  }

  // Affichage spécial si pas d'abonnement ou crédits épuisés
  if (!quotaLoading && quota && quota.remaining_credits !== undefined && quota.remaining_credits <= 0) {
    return (
      <MedMngLayout className="bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-warning/20 bg-warning/5">
              <CardHeader className="text-center">
                <CreditCard className="h-12 w-12 text-warning mx-auto mb-4" />
                <CardTitle className="text-warning">Crédits épuisés</CardTitle>
                <CardDescription className="text-warning/80">
                  Vous n'avez plus de crédits pour générer de la musique
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-warning/70">
                  Pour continuer à créer des chansons personnalisées, souscrivez à un abonnement.
                </p>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary mb-2">🎵 Avec un abonnement :</h3>
                  <ul className="text-sm text-primary/80 space-y-1">
                    <li>• Génération musicale IA illimitée</li>
                    <li>• Styles musicaux variés</li>
                    <li>• Qualité audio premium</li>
                    <li>• Sauvegarde dans votre bibliothèque</li>
                  </ul>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => navigate(ROUTE_PATHS.medMngLibrary)}
                    variant="outline"
                  >
                    Ma Bibliothèque
                  </Button>
                  <Button 
                    onClick={() => navigate(ROUTE_PATHS.medMngPricing)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Choisir un abonnement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MedMngLayout>
    );
  }

  return (
    <MedMngLayout className="bg-gradient-to-br from-primary/5 to-accent/10">
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
    </MedMngLayout>
  );
};

export const MedMngCreate = withAuth(MedMngCreateComponent);
