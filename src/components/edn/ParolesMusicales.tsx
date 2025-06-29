
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Music, AlertTriangle } from 'lucide-react';
import { MusicStyleSelector } from './music/MusicStyleSelector';
import { MusicDurationSelector } from './music/MusicDurationSelector';
import { GenerateButton } from './music/GenerateButton';
import { ParolesDisplay } from './music/ParolesDisplay';
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
  console.log('🎵 ParolesMusicales - DÉBUT DU RENDU');
  console.log('🎵 Props reçues:', { paroles, itemCode, tableauRangA: !!tableauRangA, tableauRangB: !!tableauRangB });

  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(120);
  const [activeTab, setActiveTab] = useState<'rang-a' | 'rang-b'>('rang-a');

  console.log('🎵 State local initialisé');

  let hookResult;
  try {
    console.log('🎵 Tentative d\'utilisation du hook useMusicGenerationWithTranslation');
    hookResult = useMusicGenerationWithTranslation();
    console.log('🎵 Hook exécuté avec succès:', hookResult);
  } catch (error) {
    console.error('❌ ERREUR dans le hook useMusicGenerationWithTranslation:', error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="text-red-800 font-bold">Erreur de hook</h3>
        <p className="text-red-600">Erreur lors de l'initialisation du hook: {error.message}</p>
      </div>
    );
  }

  const {
    generateMusicInLanguage,
    isGenerating,
    generatedAudio,
    lastError,
    currentLanguage
  } = hookResult;

  console.log('🎵 Données du hook extraites:', {
    isGenerating,
    generatedAudio,
    lastError,
    currentLanguage
  });

  // Vérifier si nous avons des données suffisantes
  const hasParoles = paroles && paroles.length > 0;
  const hasTableauData = tableauRangA || tableauRangB;
  
  console.log('🎵 Vérifications des données:', {
    hasParoles,
    hasTableauData,
    parolesLength: paroles?.length
  });

  const handleGenerate = async (rang: 'A' | 'B') => {
    console.log('🎵 handleGenerate appelé pour rang:', rang);
    if (!selectedStyle) {
      alert('Veuillez sélectionner un style musical');
      return;
    }

    const parolesData = hasParoles ? paroles : [];
    console.log('🎵 Génération avec parolesData:', parolesData);
    await generateMusicInLanguage(rang, parolesData, selectedStyle, selectedDuration);
  };

  const handleGenerateA = () => {
    console.log('🎵 handleGenerateA appelé');
    handleGenerate('A');
  };

  const handleGenerateB = () => {
    console.log('🎵 handleGenerateB appelé');
    handleGenerate('B');
  };

  console.log('🎵 Début du rendu conditionnel');

  // État vide - pas de données
  if (!hasParoles && !hasTableauData) {
    console.log('🎵 Rendu de l\'état vide (pas de données)');
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-6 w-6 text-amber-600" />
              Génération Musicale - {itemCode}
            </CardTitle>
            <CardDescription>
              Créez des chansons pédagogiques personnalisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Données manquantes
              </h3>
              <p className="text-gray-600 mb-6">
                Les paroles et les tableaux de données ne sont pas encore disponibles pour cet item.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  📝 <strong>En cours de développement</strong> - Le contenu musical sera ajouté prochainement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('🎵 Rendu du contenu principal');

  try {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-6 w-6 text-amber-600" />
              Génération Musicale - {itemCode}
            </CardTitle>
            <CardDescription>
              Créez des chansons pédagogiques personnalisées basées sur les tableaux d'apprentissage
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Warning si pas de paroles */}
        {!hasParoles && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">Paroles manquantes</span>
              </div>
              <p className="text-yellow-700 mt-2">
                Cet item ne contient pas encore de paroles. La génération musicale utilisera les données des tableaux uniquement.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sélecteurs de style et durée */}
        <div className="grid gap-6 md:grid-cols-2">
          <MusicStyleSelector
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
          />
          <MusicDurationSelector
            duration={selectedDuration}
            onDurationChange={setSelectedDuration}
          />
        </div>

        {/* Tabs pour Rang A et B */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'rang-a' | 'rang-b')}>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-800">Génération Rang A - Fondamentaux</CardTitle>
                <CardDescription>Concepts essentiels et connaissances de base</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasParoles && (
                  <div>
                    <h4 className="font-semibold mb-3">Paroles disponibles :</h4>
                    <ParolesDisplay 
                      parolesArray={paroles} 
                      rang="A" 
                      textColor="text-amber-800" 
                    />
                  </div>
                )}
                
                <GenerateButton
                  rang="A"
                  isGenerating={isGenerating?.rangA || false}
                  isDisabled={!selectedStyle || !tableauRangA}
                  musicDuration={selectedDuration}
                  buttonColor="bg-amber-600 hover:bg-amber-700"
                  onGenerate={handleGenerateA}
                />
                
                {!tableauRangA && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-600 text-sm">
                      ⚠️ Tableau Rang A non disponible pour cet item
                    </p>
                  </div>
                )}

                {generatedAudio?.rangA && (
                  <div className="mt-4 p-4 bg-amber-50 border-amber-200 border rounded-lg">
                    <h5 className="font-semibold text-amber-800 mb-2">Musique générée - Rang A</h5>
                    <audio controls className="w-full">
                      <source src={generatedAudio.rangA} type="audio/mpeg" />
                      Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rang-b" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-800">Génération Rang B - Approfondissements</CardTitle>
                <CardDescription>Connaissances avancées et spécialisées</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasParoles && (
                  <div>
                    <h4 className="font-semibold mb-3">Paroles disponibles :</h4>
                    <ParolesDisplay 
                      parolesArray={paroles} 
                      rang="B" 
                      textColor="text-blue-800" 
                    />
                  </div>
                )}
                
                <GenerateButton
                  rang="B"
                  isGenerating={isGenerating?.rangB || false}
                  isDisabled={!selectedStyle || !tableauRangB}
                  musicDuration={selectedDuration}
                  buttonColor="bg-blue-600 hover:bg-blue-700"
                  onGenerate={handleGenerateB}
                />
                
                {!tableauRangB && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-600 text-sm">
                      ⚠️ Tableau Rang B non disponible pour cet item
                    </p>
                  </div>
                )}

                {generatedAudio?.rangB && (
                  <div className="mt-4 p-4 bg-blue-50 border-blue-200 border rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">Musique générée - Rang B</h5>
                    <audio controls className="w-full">
                      <source src={generatedAudio.rangB} type="audio/mpeg" />
                      Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Affichage des erreurs */}
        {lastError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">Erreur de génération</span>
              </div>
              <p className="text-red-600 mt-2">{lastError}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error('❌ ERREUR lors du rendu du composant:', error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="text-red-800 font-bold">Erreur de rendu</h3>
        <p className="text-red-600">Erreur lors du rendu du composant: {error.message}</p>
        <pre className="mt-2 text-xs text-red-500">{error.stack}</pre>
      </div>
    );
  }
};
