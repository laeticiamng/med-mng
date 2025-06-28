
import React, { useState } from 'react';
import { withAuth } from '@/components/med-mng/withAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Music, Wand2, ArrowLeft, Play, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const musicStyles = [
  { value: 'lofi-piano', label: 'Lo-Fi Piano' },
  { value: 'afrobeat', label: 'Afrobeat' },
  { value: 'jazz-moderne', label: 'Jazz Moderne' },
  { value: 'hip-hop-conscient', label: 'Hip-Hop Conscient' },
  { value: 'soul-rnb', label: 'Soul & R&B' },
  { value: 'electro-chill', label: 'Electro Chill' },
];

const MedMngCreateComponent = () => {
  const navigate = useNavigate();
  const medMngApi = useMedMngApi();
  
  const [contentType, setContentType] = useState(''); // 'item' ou 'situation'
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedRang, setSelectedRang] = useState(''); // 'A' ou 'B'
  const [selectedSituation, setSelectedSituation] = useState('');
  const [style, setStyle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSong, setGeneratedSong] = useState<any>(null);

  const { data: quota } = useQuery({
    queryKey: ['med-mng-quota'],
    queryFn: () => medMngApi.getRemainingQuota(),
  });

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

    if (quota?.remaining_credits <= 0) {
      toast.error('Crédits insuffisants. Veuillez améliorer votre abonnement.');
      navigate('/med-mng/pricing');
      return;
    }

    setIsGenerating(true);
    try {
      const title = getSelectedTitle();
      
      // Appel à l'Edge Function de génération musicale
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          selectedItem: contentType === 'item' ? selectedItem : null,
          selectedRang: contentType === 'item' ? selectedRang : null,
          selectedSituation: contentType === 'situation' ? selectedSituation : null,
          style,
          title,
          duration: 240,
          fastMode: true
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération');
      }

      const result = await response.json();
      
      // Créer la chanson en base
      const song = await medMngApi.createSong(title, result.audioUrl, {
        style,
        contentType,
        selectedItem: contentType === 'item' ? selectedItem : undefined,
        selectedRang: contentType === 'item' ? selectedRang : undefined,
        selectedSituation: contentType === 'situation' ? selectedSituation : undefined,
        duration: result.duration,
        generationTime: result.generationTime
      });

      // Ajouter automatiquement à la bibliothèque
      await medMngApi.addToLibrary(song.id);

      setGeneratedSong({
        ...song,
        audioUrl: result.audioUrl
      });

      toast.success('🎵 Chanson générée avec succès !');
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error('Erreur lors de la génération. Réessayez.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayGenerated = () => {
    if (generatedSong) {
      navigate(`/med-mng/player/${generatedSong.id}`);
    }
  };

  const handleAddToLibrary = async () => {
    if (generatedSong) {
      try {
        await medMngApi.addToLibrary(generatedSong.id);
        toast.success('Ajouté à votre bibliothèque !');
        navigate('/med-mng/library');
      } catch (error) {
        toast.error('Erreur lors de l\'ajout');
      }
    }
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
                <div>
                  <Label htmlFor="contentType">Type de contenu</Label>
                  <Select value={contentType} onValueChange={setContentType} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez le type de contenu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="item">Item EDN</SelectItem>
                      <SelectItem value="situation">Situation de départ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {contentType === 'item' && (
                  <>
                    <div>
                      <Label htmlFor="item">Item EDN</Label>
                      <Select value={selectedItem} onValueChange={setSelectedItem} disabled={isGenerating}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un item" />
                        </SelectTrigger>
                        <SelectContent>
                          {ednitems.map((item) => (
                            <SelectItem key={item.code} value={item.code}>
                              {item.code} - {item.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="rang">Rang</Label>
                      <Select value={selectedRang} onValueChange={setSelectedRang} disabled={isGenerating}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le rang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Rang A - Colloque singulier</SelectItem>
                          <SelectItem value="B">Rang B - Outils pratiques</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {contentType === 'situation' && (
                  <div>
                    <Label htmlFor="situation">Situation de départ</Label>
                    <Select value={selectedSituation} onValueChange={setSelectedSituation} disabled={isGenerating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une situation" />
                      </SelectTrigger>
                      <SelectContent>
                        {situations.map((situation) => (
                          <SelectItem key={situation.code} value={situation.code}>
                            {situation.code} - {situation.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="style">Style musical</Label>
                  <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez un style" />
                    </SelectTrigger>
                    <SelectContent>
                      {musicStyles.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {getSelectedTitle() && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Aperçu de la sélection :</h3>
                    <p className="text-blue-800">{getSelectedTitle()}</p>
                    <p className="text-sm text-blue-600 mt-1">
                      Les paroles correspondantes seront automatiquement utilisées
                    </p>
                  </div>
                )}

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
                  <div className="space-y-4">
                    <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <Music className="h-16 w-16 text-white/80" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {generatedSong.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Style: {musicStyles.find(s => s.value === style)?.label}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handlePlayGenerated}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Écouter
                      </Button>
                      <Button
                        onClick={handleAddToLibrary}
                        variant="outline"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Bibliothèque
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <Music className="h-16 w-16 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      {getSelectedTitle() ? 
                        `Prêt à générer : ${getSelectedTitle()}` : 
                        'Sélectionnez vos paramètres pour commencer'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Informations */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">ℹ️ Comment ça fonctionne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold mb-2">Contenu garanti :</h4>
                  <ul className="space-y-1">
                    <li>• Paroles pré-validées et complètes</li>
                    <li>• Toutes les compétences du rang incluses</li>
                    <li>• Contenu pédagogiquement vérifié</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Styles disponibles :</h4>
                  <ul className="space-y-1">
                    <li>• Lo-Fi Piano : relaxant et méditatif</li>
                    <li>• Afrobeat : énergique et rythmé</li>
                    <li>• Jazz Moderne : sophistiqué et smooth</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const MedMngCreate = withAuth(MedMngCreateComponent);
