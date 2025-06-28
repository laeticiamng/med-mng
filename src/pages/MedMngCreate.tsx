
import React, { useState } from 'react';
import { withAuth } from '@/components/med-mng/withAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [style, setStyle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSong, setGeneratedSong] = useState<any>(null);

  const { data: quota } = useQuery({
    queryKey: ['med-mng-quota'],
    queryFn: () => medMngApi.getRemainingQuota(),
  });

  const handleGenerate = async () => {
    if (!title.trim() || !lyrics.trim() || !style) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (quota?.remaining_credits <= 0) {
      toast.error('Crédits insuffisants. Veuillez améliorer votre abonnement.');
      navigate('/med-mng/pricing');
      return;
    }

    setIsGenerating(true);
    try {
      // Appel à l'Edge Function de génération musicale
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lyrics,
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
              Générez votre musique personnalisée avec l'IA
            </p>
            <div className="inline-flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
              <Music className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">
                Crédits restants: {quota?.remaining_credits || 0}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulaire de création */}
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de génération</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Titre de la chanson</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Ma Chanson Inspirante"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>

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

                <div>
                  <Label htmlFor="lyrics">Paroles</Label>
                  <Textarea
                    id="lyrics"
                    placeholder="Écrivez ici les paroles de votre chanson..."
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    disabled={isGenerating}
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {lyrics.length}/3000 caractères
                  </p>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !title.trim() || !lyrics.trim() || !style}
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
                      Votre chanson apparaîtra ici une fois générée
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conseils */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">💡 Conseils pour une meilleure génération</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold mb-2">Pour les paroles :</h4>
                  <ul className="space-y-1">
                    <li>• Utilisez un langage simple et expressif</li>
                    <li>• Structurez en couplets et refrains</li>
                    <li>• Évitez les mots trop techniques</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Pour le style :</h4>
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
