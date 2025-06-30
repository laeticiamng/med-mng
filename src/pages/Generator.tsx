import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TranslatedText } from '@/components/TranslatedText';
import { Music, Wand2, BookOpen, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFreeTrialLimit } from '@/hooks/useFreeTrialLimit';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { toast } from 'sonner';

const Generator = () => {
  const navigate = useNavigate();
  const { getRemainingGenerations, maxFreeGenerations } = useFreeTrialLimit();
  const musicGeneration = useMusicGenerationWithTranslation();
  
  const [contentType, setContentType] = useState(''); // 'edn' ou 'ecos'
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedRang, setSelectedRang] = useState(''); // 'A' ou 'B'
  const [selectedSituation, setSelectedSituation] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  
  const remainingFree = getRemainingGenerations();

  // Check if any generation is in progress
  const isGenerating = musicGeneration.isGenerating?.rangA || musicGeneration.isGenerating?.rangB;

  // Items EDN avec les vrais noms
  const ednItems = [
    { code: 'IC1', title: 'La relation médecin-malade' },
    { code: 'IC2', title: 'Les valeurs professionnelles du médecin' },
    { code: 'IC3', title: 'Raisonnement et décision en médecine' },
    { code: 'IC4', title: 'Qualité et sécurité des soins' },
    { code: 'IC5', title: 'Organisation du système de santé' },
  ];

  // Situations ECOS disponibles
  const ecosSituations = [
    { code: 'S1', title: 'Situation de départ 1 - Consultation' },
    { code: 'S2', title: 'Situation de départ 2 - Urgence' },
    { code: 'S3', title: 'Situation de départ 3 - Prévention' },
  ];

  // Styles musicaux disponibles
  const musicStyles = [
    { value: 'pop', label: 'Pop' },
    { value: 'rock', label: 'Rock' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'classical', label: 'Classique' },
    { value: 'reggae', label: 'Reggae' },
    { value: 'hip-hop', label: 'Hip-Hop' },
    { value: 'folk', label: 'Folk' },
    { value: 'electronic', label: 'Électronique' },
  ];

  const canGenerate = () => {
    if (contentType === 'edn') {
      return selectedItem && selectedRang && selectedStyle;
    }
    if (contentType === 'ecos') {
      return selectedSituation && selectedStyle;
    }
    return false;
  };

  const handleGenerate = async () => {
    if (!canGenerate()) {
      toast.error('Veuillez sélectionner tous les paramètres requis');
      return;
    }

    if (remainingFree <= 0) {
      toast.error('Plus de générations gratuites disponibles');
      navigate('/med-mng/pricing');
      return;
    }

    try {
      // Simuler les paroles (normalement récupérées depuis la base de données)
      const mockLyrics = [
        `Paroles pour ${contentType === 'edn' ? selectedItem : selectedSituation} Rang A`,
        `Paroles pour ${contentType === 'edn' ? selectedItem : selectedSituation} Rang B`
      ];

      const rang = contentType === 'edn' ? selectedRang as 'A' | 'B' : 'A';
      
      await musicGeneration.generateMusicInLanguage(rang, mockLyrics, selectedStyle, 240);
      
      toast.success('Génération musicale réussie !');
      
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error('Erreur lors de la génération musicale');
    }
  };

  const resetForm = () => {
    setContentType('');
    setSelectedItem('');
    setSelectedRang('');
    setSelectedSituation('');
    setSelectedStyle('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <TranslatedText text="Retour" />
            </Button>
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8 text-amber-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  <TranslatedText text="Générateur Musical IA" />
                </h1>
                <p className="text-sm text-gray-600">
                  <TranslatedText text="Générez rapidement vos contenus en musique" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Badge générations restantes */}
          {remainingFree > 0 && (
            <div className="text-center mb-8">
              <Badge variant="secondary" className="px-4 py-2 text-lg bg-green-100 text-green-800">
                <Music className="h-4 w-4 mr-2" />
                <TranslatedText text={`${remainingFree}/${maxFreeGenerations} générations gratuites restantes`} />
              </Badge>
            </div>
          )}

          {/* Formulaire de génération */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-6 w-6 text-amber-600" />
                <TranslatedText text="Configuration de génération" />
              </CardTitle>
              <CardDescription>
                <TranslatedText text="Sélectionnez le type de contenu, l'item et le style musical" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Sélection du type de contenu */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  <TranslatedText text="Type de contenu" />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${contentType === 'edn' ? 'ring-2 ring-amber-500 bg-amber-50' : 'hover:bg-gray-50'}`}
                    onClick={() => {
                      setContentType('edn');
                      setSelectedSituation('');
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold">EDN</h3>
                      <p className="text-sm text-gray-600">Items à Choix Multiples</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${contentType === 'ecos' ? 'ring-2 ring-amber-500 bg-amber-50' : 'hover:bg-gray-50'}`}
                    onClick={() => {
                      setContentType('ecos');
                      setSelectedItem('');
                      setSelectedRang('');
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold">ECOS</h3>
                      <p className="text-sm text-gray-600">Situations de départ</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sélection EDN */}
              {contentType === 'edn' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      <TranslatedText text="Item EDN" />
                    </label>
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un item EDN" />
                      </SelectTrigger>
                      <SelectContent>
                        {ednItems.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.code} - {item.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      <TranslatedText text="Rang" />
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <Card 
                        className={`cursor-pointer transition-all ${selectedRang === 'A' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedRang('A')}
                      >
                        <CardContent className="p-4 text-center">
                          <h3 className="font-bold text-lg">Rang A</h3>
                          <p className="text-sm text-gray-600">Niveau débutant</p>
                        </CardContent>
                      </Card>
                      <Card 
                        className={`cursor-pointer transition-all ${selectedRang === 'B' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedRang('B')}
                      >
                        <CardContent className="p-4 text-center">
                          <h3 className="font-bold text-lg">Rang B</h3>
                          <p className="text-sm text-gray-600">Niveau avancé</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}

              {/* Sélection ECOS */}
              {contentType === 'ecos' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    <TranslatedText text="Situation ECOS" />
                  </label>
                  <Select value={selectedSituation} onValueChange={setSelectedSituation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une situation ECOS" />
                    </SelectTrigger>
                    <SelectContent>
                      {ecosSituations.map((situation) => (
                        <SelectItem key={situation.code} value={situation.code}>
                          {situation.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sélection du style musical */}
              {contentType && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    <TranslatedText text="Style musical" />
                  </label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez un style musical" />
                    </SelectTrigger>
                    <SelectContent>
                      {musicStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate() || isGenerating || remainingFree <= 0}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      <TranslatedText text="Génération en cours..." />
                    </>
                  ) : (
                    <>
                      <Music className="h-4 w-4 mr-2" />
                      <TranslatedText text="Générer la musique" />
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  size="lg"
                >
                  <TranslatedText text="Réinitialiser" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informations d'aide */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                <TranslatedText text="Comment utiliser le générateur ?" />
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• <TranslatedText text="Choisissez le type de contenu (EDN ou ECOS)" /></p>
                <p>• <TranslatedText text="Sélectionnez l'item ou la situation spécifique" /></p>
                <p>• <TranslatedText text="Pour EDN : choisissez le rang A (débutant) ou B (avancé)" /></p>
                <p>• <TranslatedText text="Sélectionnez votre style musical préféré" /></p>
                <p>• <TranslatedText text="Cliquez sur 'Générer' pour créer votre musique personnalisée" /></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Generator;
