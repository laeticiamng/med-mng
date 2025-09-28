import { memo, useCallback, useMemo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useModernState } from '@/hooks/useModernState';
import { useOptimizedDebounce, useRequestDeduplication } from '@/hooks/usePerformanceOptimization';
import { OptimizedMusicPlayer } from './OptimizedMusicPlayer';
import { 
  Wand2, 
  Music, 
  Download, 
  Share2, 
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Styles musicaux optimisés
const MUSIC_STYLES = [
  { id: 'classical', name: 'Classique', description: 'Musique orchestrale apaisante' },
  { id: 'ambient', name: 'Ambiant', description: 'Sons atmosphériques relaxants' },
  { id: 'piano', name: 'Piano', description: 'Mélodies de piano douces' },
  { id: 'nature', name: 'Nature', description: 'Sons de la nature intégrés' },
  { id: 'electronic', name: 'Électronique', description: 'Synthés modernes relaxants' },
  { id: 'jazz', name: 'Jazz', description: 'Jazz doux et mélodieux' }
];

// Items EDN simulés
const EDN_ITEMS = Array.from({ length: 50 }, (_, i) => ({
  id: `IC-${i + 1}`,
  title: `Item ${i + 1}`,
  category: ['Cardiologie', 'Neurologie', 'Psychiatrie', 'Chirurgie', 'Médecine générale'][i % 5],
  difficulty: ['Rang A', 'Rang B'][i % 2]
}));

// Composant de sélection d'item optimisé
const ItemSelector = memo(({ selectedItems, onItemsChange, maxItems = 3 }) => {
  const [searchTerm, setSearchTerm] = useModernState('');
  
  const debouncedSearch = useOptimizedDebounce(setSearchTerm, 300);
  
  const filteredItems = useMemo(() => {
    return EDN_ITEMS.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20);
  }, [searchTerm]);

  const toggleItem = useCallback((item) => {
    const isSelected = selectedItems.some(selected => selected.id === item.id);
    
    if (isSelected) {
      onItemsChange(selectedItems.filter(selected => selected.id !== item.id));
    } else if (selectedItems.length < maxItems) {
      onItemsChange([...selectedItems, item]);
    }
  }, [selectedItems, onItemsChange, maxItems]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Sélection d'items EDN
          <Badge variant="outline" className="ml-auto">
            {selectedItems.length}/{maxItems}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Rechercher un item..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="w-full"
        />
        
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {filteredItems.map(item => {
            const isSelected = selectedItems.some(selected => selected.id === item.id);
            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => toggleItem(item)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <Badge variant={item.difficulty === 'Rang A' ? 'default' : 'secondary'}>
                    {item.difficulty}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

// Composant de génération optimisé
const GenerationPanel = memo(({ 
  selectedItems, 
  musicStyle, 
  onMusicStyleChange, 
  customPrompt, 
  onCustomPromptChange,
  onGenerate,
  isGenerating 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Configuration de génération
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Style musical */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Style musical</label>
          <Select value={musicStyle} onValueChange={onMusicStyleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un style" />
            </SelectTrigger>
            <SelectContent>
              {MUSIC_STYLES.map(style => (
                <SelectItem key={style.id} value={style.id}>
                  <div>
                    <p className="font-medium">{style.name}</p>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prompt personnalisé */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Instructions personnalisées</label>
          <Textarea
            placeholder="Décrivez l'ambiance souhaitée pour votre musique d'étude..."
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            rows={3}
          />
        </div>

        {/* Items sélectionnés */}
        {selectedItems.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Items sélectionnés</label>
            <div className="flex flex-wrap gap-1">
              {selectedItems.map(item => (
                <Badge key={item.id} variant="outline">
                  {item.title}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Bouton de génération */}
        <Button
          onClick={onGenerate}
          disabled={isGenerating || selectedItems.length === 0 || !musicStyle}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Générer la musique
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
});

// Composant de résultats optimisé
const GenerationResults = memo(({ results, onDownload, onShare }) => {
  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-500" />
        Musiques générées
      </h3>
      
      {results.map((result, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{result.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Style: {result.style} • Durée: {result.duration}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(result)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShare(result)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <OptimizedMusicPlayer
              audioUrl={result.audioUrl}
              title={result.title}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

// Composant principal du générateur optimisé
export const OptimizedGenerator = memo(() => {
  const [state, setState] = useModernState({
    selectedItems: [],
    musicStyle: '',
    customPrompt: '',
    isGenerating: false,
    generationProgress: 0,
    results: []
  });

  const { dedupedRequest } = useRequestDeduplication();

  // Simulation de génération avec progress
  const handleGenerate = useCallback(async () => {
    const generationId = `gen_${Date.now()}_${Math.random()}`;
    
    await dedupedRequest(generationId, async () => {
      setState(prev => ({ 
        ...prev, 
        isGenerating: true, 
        generationProgress: 0,
        results: []
      }));

      // Simuler le progrès de génération
      const steps = [10, 25, 50, 75, 90, 100];
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setState(prev => ({ ...prev, generationProgress: step }));
      }

      // Générer les résultats simulés
      const newResults = state.selectedItems.map((item, index) => ({
        id: `result_${index}`,
        title: `Musique pour ${item.title}`,
        style: MUSIC_STYLES.find(s => s.id === state.musicStyle)?.name || 'Inconnu',
        duration: '3:24',
        audioUrl: `https://example.com/audio_${index}.mp3`,
        items: [item]
      }));

      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        generationProgress: 100,
        results: newResults
      }));
    });
  }, [state.selectedItems, state.musicStyle, setState, dedupedRequest]);

  const handleDownload = useCallback((result) => {
    console.log('Download:', result);
    // Implémenter le téléchargement
  }, []);

  const handleShare = useCallback((result) => {
    console.log('Share:', result);
    // Implémenter le partage
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Générateur de musique EDN</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Créez des musiques personnalisées pour accompagner votre apprentissage médical
          </p>
        </div>

        {/* Barre de progression globale */}
        {state.isGenerating && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Génération en cours...</span>
                  <span className="text-sm text-muted-foreground">{state.generationProgress}%</span>
                </div>
                <Progress value={state.generationProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <div className="space-y-6">
            <ItemSelector
              selectedItems={state.selectedItems}
              onItemsChange={(items) => setState(prev => ({ ...prev, selectedItems: items }))}
            />
            
            <GenerationPanel
              selectedItems={state.selectedItems}
              musicStyle={state.musicStyle}
              onMusicStyleChange={(style) => setState(prev => ({ ...prev, musicStyle: style }))}
              customPrompt={state.customPrompt}
              onCustomPromptChange={(prompt) => setState(prev => ({ ...prev, customPrompt: prompt }))}
              onGenerate={handleGenerate}
              isGenerating={state.isGenerating}
            />
          </div>

          {/* Résultats */}
          <div>
            <Suspense fallback={<div>Chargement des résultats...</div>}>
              <GenerationResults
                results={state.results}
                onDownload={handleDownload}
                onShare={handleShare}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
});

OptimizedGenerator.displayName = 'OptimizedGenerator';