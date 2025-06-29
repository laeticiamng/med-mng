
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Music, AlertTriangle, Plus, Sparkles } from 'lucide-react';
import { MusicStyleSelector } from './music/MusicStyleSelector';
import { MusicDurationSelector } from './music/MusicDurationSelector';
import { GenerateButton } from './music/GenerateButton';
import { MusicCardsSection } from './music/MusicCardsSection';
import { ParolesDisplay } from './music/ParolesDisplay';
import { MissingParolesWarning } from './music/MissingParolesWarning';
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
  const [selectedDuration, setSelectedDuration] = useState<string>('2min');
  const [activeTab, setActiveTab] = useState<'rang-a' | 'rang-b'>('rang-a');

  const {
    generateMusic,
    isGenerating,
    generatedMusic,
    error,
    clearError
  } = useMusicGenerationWithTranslation();

  // Vérifier si nous avons des données suffisantes
  const hasParoles = paroles && paroles.length > 0;
  const hasTableauData = tableauRangA || tableauRangB;
  
  console.log('🎵 ParolesMusicales rendu avec:', {
    paroles: paroles,
    parolesLength: paroles?.length,
    hasParoles,
    hasTableauData,
    itemCode
  });

  const handleGenerate = async (rang: 'A' | 'B') => {
    if (!selectedStyle) {
      alert('Veuillez sélectionner un style musical');
      return;
    }

    const tableauData = rang === 'A' ? tableauRangA : tableauRangB;
    const parolesData = hasParoles ? paroles : [];

    await generateMusic({
      itemCode,
      rang,
      musicStyle: selectedStyle,
      duration: selectedDuration,
      tableauData,
      paroles: parolesData
    });
  };

  if (!hasParoles && !hasTableauData) {
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

  return (
    <div className="space-y-6">
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

      {/* Afficher un avertissement si les paroles sont manquantes */}
      <MissingParolesWarning isVisible={!hasParoles} />

      {/* Configuration de génération */}
      <div className="grid gap-6 md:grid-cols-2">
        <MusicStyleSelector
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
        />
        <MusicDurationSelector
          selectedDuration={selectedDuration}
          onDurationChange={setSelectedDuration}
        />
      </div>

      {/* Onglets pour Rang A et Rang B */}
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
              <CardDescription>
                Concepts essentiels et connaissances de base
              </CardDescription>
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
                isGenerating={isGenerating}
                hasStyle={!!selectedStyle}
                rang="A"
                onGenerate={() => handleGenerate('A')}
                disabled={!tableauRangA}
              />
              
              {!tableauRangA && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 text-sm">
                    ⚠️ Tableau Rang A non disponible pour cet item
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rang-b" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-800">Génération Rang B - Approfondissements</CardTitle>
              <CardDescription>
                Connaissances avancées et spécialisées
              </CardDescription>
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
                isGenerating={isGenerating}
                hasStyle={!!selectedStyle}
                rang="B"
                onGenerate={() => handleGenerate('B')}
                disabled={!tableauRangB}
              />
              
              {!tableauRangB && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 text-sm">
                    ⚠️ Tableau Rang B non disponible pour cet item
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Section des musiques générées */}
      <MusicCardsSection 
        generatedMusic={generatedMusic}
        error={error}
        onClearError={clearError}
      />
    </div>
  );
};
