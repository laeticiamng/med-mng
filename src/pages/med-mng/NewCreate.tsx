import React, { useState } from 'react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Music, 
  Wand2, 
  Play, 
  Pause, 
  Download,
  Heart,
  Brain,
  Zap,
  Waves,
  Sparkles,
  Clock,
  Volume2,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

const NewCreate = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedSong, setGeneratedSong] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    mood: '',
    duration: [180], // 3 minutes par défaut
    medicalFocus: '',
    complexity: [5],
    instruments: []
  });

  const genres = [
    { value: 'ambient', label: 'Ambient', description: 'Sons atmosphériques relaxants' },
    { value: 'classical', label: 'Classique', description: 'Compositions classiques apaisantes' },
    { value: 'electronic', label: 'Électronique', description: 'Musique électronique douce' },
    { value: 'nature', label: 'Nature', description: 'Sons de la nature' },
    { value: 'binaural', label: 'Binaural', description: 'Battements binauraux' },
    { value: 'meditation', label: 'Méditation', description: 'Musique de méditation' }
  ];

  const moods = [
    { value: 'relaxing', label: 'Relaxant', icon: Heart, color: 'text-blue-500' },
    { value: 'focusing', label: 'Concentration', icon: Brain, color: 'text-purple-500' },
    { value: 'energizing', label: 'Énergisant', icon: Zap, color: 'text-yellow-500' },
    { value: 'healing', label: 'Guérison', icon: Waves, color: 'text-green-500' }
  ];

  const medicalFocus = [
    'Anatomie', 'Physiologie', 'Pathologie', 'Pharmacologie', 
    'Chirurgie', 'Cardiologie', 'Neurologie', 'Pédiatrie', 
    'Psychiatrie', 'Radiologie', 'Général'
  ];

  const availableInstruments = [
    'Piano', 'Violon', 'Flûte', 'Guitare', 'Synthétiseur', 
    'Harpe', 'Violoncelle', 'Chœur', 'Bol tibétain', 'Cloches'
  ];

  const handleGenerate = async () => {
    if (!formData.title || !formData.genre || !formData.mood) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    toast.info('Génération de votre chanson en cours...');

    // Simulation du processus de génération
    const intervals = [
      { progress: 25, message: 'Analyse des paramètres...' },
      { progress: 50, message: 'Création de la mélodie...' },
      { progress: 75, message: 'Ajout des harmonies...' },
      { progress: 100, message: 'Finalisation...' }
    ];

    for (const interval of intervals) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGenerationProgress(interval.progress);
      toast.info(interval.message);
    }

    // Simulation d'une chanson générée
    const mockSong = {
      id: Date.now(),
      title: formData.title,
      duration: formData.duration[0],
      genre: formData.genre,
      mood: formData.mood,
      medicalFocus: formData.medicalFocus,
      audioUrl: '/placeholder-audio.mp3',
      waveform: Array.from({length: 100}, () => Math.random() * 100)
    };

    setGeneratedSong(mockSong);
    setIsGenerating(false);
    toast.success('Chanson générée avec succès!');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleInstrument = (instrument) => {
    const current = formData.instruments;
    if (current.includes(instrument)) {
      setFormData({
        ...formData,
        instruments: current.filter(i => i !== instrument)
      });
    } else if (current.length < 5) {
      setFormData({
        ...formData,
        instruments: [...current, instrument]
      });
    } else {
      toast.error('Maximum 5 instruments sélectionnables');
    }
  };

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <Wand2 className="inline h-10 w-10 mr-3 text-purple-600" />
              Créateur Musical IA
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Générez de la musique thérapeutique personnalisée pour vos études médicales 
              grâce à l'intelligence artificielle
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire de création */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Paramètres de base
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre de la chanson *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Relaxation pour anatomie..."
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez l'ambiance ou l'objectif de cette musique..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Genre musical *</Label>
                    <Select value={formData.genre} onValueChange={(value) => setFormData({...formData, genre: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre.value} value={genre.value}>
                            <div>
                              <div className="font-medium">{genre.label}</div>
                              <div className="text-xs text-gray-500">{genre.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Focus médical</Label>
                    <Select value={formData.medicalFocus} onValueChange={(value) => setFormData({...formData, medicalFocus: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez votre domaine d'étude" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicalFocus.map((focus) => (
                          <SelectItem key={focus} value={focus}>{focus}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ambiance et émotions *</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {moods.map((mood) => {
                      const IconComponent = mood.icon;
                      return (
                        <div
                          key={mood.value}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            formData.mood === mood.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData({...formData, mood: mood.value})}
                        >
                          <div className="text-center">
                            <IconComponent className={`h-8 w-8 mx-auto mb-2 ${mood.color}`} />
                            <p className="font-medium">{mood.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Paramètres avancés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Durée: {formatDuration(formData.duration[0])}</Label>
                    <Slider
                      value={formData.duration}
                      onValueChange={(value) => setFormData({...formData, duration: value})}
                      max={600}
                      min={60}
                      step={30}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 min</span>
                      <span>10 min</span>
                    </div>
                  </div>

                  <div>
                    <Label>Complexité: {formData.complexity[0]}/10</Label>
                    <Slider
                      value={formData.complexity}
                      onValueChange={(value) => setFormData({...formData, complexity: value})}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Simple</span>
                      <span>Complexe</span>
                    </div>
                  </div>

                  <div>
                    <Label>Instruments (max 5)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableInstruments.map((instrument) => (
                        <Badge
                          key={instrument}
                          variant={formData.instruments.includes(instrument) ? 'default' : 'outline'}
                          className="cursor-pointer justify-center p-2"
                          onClick={() => toggleInstrument(instrument)}
                        >
                          {instrument}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full h-12 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5 mr-2" />
                    Générer la musique
                  </>
                )}
              </Button>
            </div>

            {/* Aperçu et résultat */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    {generatedSong ? 'Chanson générée' : 'Aperçu'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="text-center py-8">
                      <div className="mb-6">
                        <Sparkles className="h-16 w-16 mx-auto text-purple-500 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-medium mb-4">Création en cours...</h3>
                      <Progress value={generationProgress} className="mb-4" />
                      <p className="text-sm text-gray-600">{generationProgress}% terminé</p>
                    </div>
                  ) : generatedSong ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mb-4 flex items-center justify-center">
                          <Music className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">{generatedSong.title}</h3>
                        <p className="text-gray-600">{formatDuration(generatedSong.duration)}</p>
                      </div>

                      <div className="bg-gray-100 rounded-lg p-4 h-24 flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          {generatedSong.waveform.slice(0, 50).map((height, index) => (
                            <div
                              key={index}
                              className="bg-purple-500 rounded-full"
                              style={{
                                width: '2px',
                                height: `${Math.max(height / 4, 4)}px`
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-center gap-3">
                        <Button variant="outline">
                          <Play className="h-4 w-4 mr-2" />
                          Écouter
                        </Button>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Genre:</span>
                          <span className="font-medium">{genres.find(g => g.value === generatedSong.genre)?.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ambiance:</span>
                          <span className="font-medium">{moods.find(m => m.value === generatedSong.mood)?.label}</span>
                        </div>
                        {generatedSong.medicalFocus && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Focus médical:</span>
                            <span className="font-medium">{generatedSong.medicalFocus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Votre chanson apparaîtra ici une fois générée</p>
                      <p className="text-sm mt-2">Remplissez le formulaire et cliquez sur "Générer"</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {formData.title && !isGenerating && !generatedSong && (
                <Card>
                  <CardHeader>
                    <CardTitle>Aperçu des paramètres</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Titre:</span>
                      <span className="font-medium">{formData.title}</span>
                    </div>
                    {formData.genre && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Genre:</span>
                        <span className="font-medium">{genres.find(g => g.value === formData.genre)?.label}</span>
                      </div>
                    )}
                    {formData.mood && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ambiance:</span>
                        <span className="font-medium">{moods.find(m => m.value === formData.mood)?.label}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durée:</span>
                      <span className="font-medium">{formatDuration(formData.duration[0])}</span>
                    </div>
                    {formData.medicalFocus && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Focus médical:</span>
                        <span className="font-medium">{formData.medicalFocus}</span>
                      </div>
                    )}
                    {formData.instruments.length > 0 && (
                      <div>
                        <span className="text-gray-600">Instruments:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.instruments.map(instrument => (
                            <Badge key={instrument} variant="outline" className="text-xs">
                              {instrument}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </MedMngLayout>
  );
};

export default NewCreate;