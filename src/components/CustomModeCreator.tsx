import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Plus, 
  Settings, 
  Timer, 
  Volume2, 
  Waves,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ListeningMode } from '@/hooks/useListeningModes';

export const CustomModeCreator = () => {
  const { toast } = useToast();
  
  const [customMode, setCustomMode] = useState<Partial<ListeningMode>>({
    name: '',
    description: '',
    duration_minutes: 30,
    playlist_criteria: {
      tempo_range: [70, 90],
      mood: [],
      genres: [],
      energy_level: 0.7
    },
    effects: {
      background_sounds: 'none',
      volume_curve: 'steady',
      break_intervals: 25
    },
    icon: '🎵',
    color: 'blue'
  });

  const availableMoods = [
    'concentration', 'motivation', 'détente', 'énergie', 
    'mémorisation', 'créativité', 'confiance', 'zen'
  ];

  const availableGenres = [
    'ambient', 'classical', 'instrumental', 'electronic',
    'jazz', 'neoclassical', 'world', 'chillout'
  ];

  const backgroundSounds = [
    { value: 'none', label: 'Aucun' },
    { value: 'white_noise', label: 'Bruit blanc' },
    { value: 'nature', label: 'Sons naturels' },
    { value: 'rain', label: 'Pluie' },
    { value: 'cafe', label: 'Café' },
    { value: 'binaural_beats', label: 'Battements binauraux' }
  ];

  const volumeCurves = [
    { value: 'steady', label: 'Constant' },
    { value: 'gradual_increase', label: 'Augmentation graduelle' },
    { value: 'waves', label: 'Vagues' },
    { value: 'dynamic', label: 'Dynamique' },
    { value: 'soft', label: 'Doux' },
    { value: 'energizing', label: 'Énergisant' }
  ];

  const icons = ['🎵', '🎯', '⚡', '🧠', '🌿', '🚀', '🎨', '💡', '🔥', '⭐'];
  const colors = ['blue', 'orange', 'purple', 'green', 'red', 'pink', 'yellow', 'indigo'];

  const handleSaveMode = async () => {
    if (!customMode.name || !customMode.description) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le nom et la description.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Ici on sauvegarderait le mode personnalisé
      console.log('Mode personnalisé créé:', customMode);
      
      toast({
        title: "Mode créé !",
        description: `Le mode "${customMode.name}" a été sauvegardé.`
      });

      // Reset form
      setCustomMode({
        name: '',
        description: '',
        duration_minutes: 30,
        playlist_criteria: {
          tempo_range: [70, 90],
          mood: [],
          genres: [],
          energy_level: 0.7
        },
        effects: {
          background_sounds: 'none',
          volume_curve: 'steady',
          break_intervals: 25
        },
        icon: '🎵',
        color: 'blue'
      });
    } catch (error) {
      console.error('Erreur sauvegarde mode:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le mode.",
        variant: "destructive"
      });
    }
  };

  const toggleMood = (mood: string) => {
    setCustomMode(prev => ({
      ...prev,
      playlist_criteria: {
        ...prev.playlist_criteria!,
        mood: prev.playlist_criteria!.mood.includes(mood)
          ? prev.playlist_criteria!.mood.filter(m => m !== mood)
          : [...prev.playlist_criteria!.mood, mood]
      }
    }));
  };

  const toggleGenre = (genre: string) => {
    setCustomMode(prev => ({
      ...prev,
      playlist_criteria: {
        ...prev.playlist_criteria!,
        genres: prev.playlist_criteria!.genres.includes(genre)
          ? prev.playlist_criteria!.genres.filter(g => g !== genre)
          : [...prev.playlist_criteria!.genres, genre]
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Créateur de Mode Personnalisé
        </CardTitle>
        <CardDescription>
          Créez votre propre mode d'écoute adapté à vos besoins spécifiques
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Informations de base */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du mode *</Label>
            <Input
              id="name"
              value={customMode.name}
              onChange={(e) => setCustomMode(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Mon mode personnalisé"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Durée (minutes)</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[customMode.duration_minutes || 30]}
                onValueChange={([value]) => setCustomMode(prev => ({ ...prev, duration_minutes: value }))}
                min={5}
                max={120}
                step={5}
                className="flex-1"
              />
              <span className="min-w-[3rem] text-sm font-medium">
                {customMode.duration_minutes}min
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={customMode.description}
            onChange={(e) => setCustomMode(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Décrivez l'objectif et l'usage de ce mode..."
            rows={2}
          />
        </div>

        {/* Apparence */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Icône</Label>
            <div className="flex flex-wrap gap-2">
              {icons.map(icon => (
                <Button
                  key={icon}
                  variant={customMode.icon === icon ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCustomMode(prev => ({ ...prev, icon }))}
                  className="text-lg p-2 h-auto"
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <Button
                  key={color}
                  variant={customMode.color === color ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCustomMode(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 p-0 ${
                    color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                    color === 'orange' ? 'bg-orange-500 hover:bg-orange-600' :
                    color === 'purple' ? 'bg-purple-500 hover:bg-purple-600' :
                    color === 'green' ? 'bg-green-500 hover:bg-green-600' :
                    color === 'red' ? 'bg-red-500 hover:bg-red-600' :
                    color === 'pink' ? 'bg-pink-500 hover:bg-pink-600' :
                    color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' :
                    'bg-indigo-500 hover:bg-indigo-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Critères de playlist */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Critères de Playlist
          </h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Plage de tempo (BPM)</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={customMode.playlist_criteria?.tempo_range || [70, 90]}
                  onValueChange={(range) => setCustomMode(prev => ({
                    ...prev,
                    playlist_criteria: { ...prev.playlist_criteria!, tempo_range: range as [number, number] }
                  }))}
                  min={40}
                  max={180}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm">
                  {customMode.playlist_criteria?.tempo_range?.join('-')} BPM
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Niveau d'énergie</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[customMode.playlist_criteria?.energy_level || 0.7]}
                  onValueChange={([value]) => setCustomMode(prev => ({
                    ...prev,
                    playlist_criteria: { ...prev.playlist_criteria!, energy_level: value }
                  }))}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm">
                  {Math.round((customMode.playlist_criteria?.energy_level || 0.7) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Humeurs</Label>
            <div className="flex flex-wrap gap-2">
              {availableMoods.map(mood => (
                <Button
                  key={mood}
                  variant={customMode.playlist_criteria?.mood.includes(mood) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleMood(mood)}
                >
                  {mood}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Genres</Label>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map(genre => (
                <Button
                  key={genre}
                  variant={customMode.playlist_criteria?.genres.includes(genre) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Effets et paramètres */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Waves className="h-4 w-4" />
            Effets et Paramètres
          </h4>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Sons d'ambiance</Label>
              <Select
                value={customMode.effects?.background_sounds}
                onValueChange={(value) => setCustomMode(prev => ({
                  ...prev,
                  effects: { ...prev.effects!, background_sounds: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {backgroundSounds.map(sound => (
                    <SelectItem key={sound.value} value={sound.value}>
                      {sound.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Courbe de volume</Label>
              <Select
                value={customMode.effects?.volume_curve}
                onValueChange={(value) => setCustomMode(prev => ({
                  ...prev,
                  effects: { ...prev.effects!, volume_curve: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {volumeCurves.map(curve => (
                    <SelectItem key={curve.value} value={curve.value}>
                      {curve.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Pauses (minutes)</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[customMode.effects?.break_intervals || 25]}
                  onValueChange={([value]) => setCustomMode(prev => ({
                    ...prev,
                    effects: { ...prev.effects!, break_intervals: value }
                  }))}
                  min={0}
                  max={60}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm">
                  {customMode.effects?.break_intervals || 25}min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu */}
        <div className="border rounded-lg p-4 bg-secondary/20">
          <h4 className="font-medium mb-2">Aperçu</h4>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{customMode.icon}</span>
            <div>
              <div className="font-medium">{customMode.name || 'Mon mode personnalisé'}</div>
              <div className="text-sm text-muted-foreground">
                {customMode.duration_minutes}min • {customMode.playlist_criteria?.mood.length || 0} humeurs
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {customMode.description || 'Description du mode...'}
          </p>
        </div>

        <Button onClick={handleSaveMode} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder le Mode
        </Button>
      </CardContent>
    </Card>
  );
};