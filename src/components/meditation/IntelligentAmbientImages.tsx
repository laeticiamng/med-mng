import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image, 
  Sparkles, 
  Download, 
  Share2, 
  Heart,
  Eye,
  Palette,
  Mountain,
  Waves,
  TreePine,
  Sun,
  Moon,
  Star,
  Flower,
  Leaf,
  Cloud,
  Zap,
  Save,
  Shuffle,
  Timer,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ImageTheme {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: React.ComponentType<any>;
  prompts: string[];
  mood: 'calm' | 'energetic' | 'mystical' | 'natural';
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  theme: string;
  style: string;
  mood: string;
  resolution: string;
  created_at: string;
  likes: number;
  views: number;
  is_favorite: boolean;
}

interface ImageSettings {
  autoGenerate: boolean;
  syncWithMusic: boolean;
  transitionDuration: number;
  overlayOpacity: number;
  colorTemperature: string;
  dynamicLighting: boolean;
}

export const IntelligentAmbientImages: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [settings, setSettings] = useState<ImageSettings>({
    autoGenerate: true,
    syncWithMusic: false,
    transitionDuration: 3000,
    overlayOpacity: 20,
    colorTemperature: 'warm',
    dynamicLighting: true
  });

  const imageThemes: ImageTheme[] = [
    {
      id: 'zen_garden',
      name: 'Jardin Zen',
      description: 'Jardins japonais paisibles avec rochers et sable',
      color: 'from-green-500 to-emerald-600',
      icon: Leaf,
      prompts: [
        'jardin zen japonais avec rochers et sable ratissé, ambiance paisible',
        'temple bouddhiste entouré de cerisiers en fleurs',
        'bassin koi avec nénuphars dans jardin zen au coucher du soleil'
      ],
      mood: 'calm'
    },
    {
      id: 'ocean_depths',
      name: 'Profondeurs Océaniques',
      description: 'Paysages marins apaisants et mystérieux',
      color: 'from-blue-500 to-cyan-600',
      icon: Waves,
      prompts: [
        'fond marin paisible avec rayons de soleil filtrant à travers l\'eau',
        'récif corallien coloré avec poissons tropicaux, ambiance sereine',
        'plage tropicale au coucher du soleil avec vagues douces'
      ],
      mood: 'calm'
    },
    {
      id: 'mountain_peaks',
      name: 'Sommets Montagneux',
      description: 'Paysages de montagne majestueux et inspirants',
      color: 'from-purple-500 to-indigo-600',
      icon: Mountain,
      prompts: [
        'sommets enneigés au lever du soleil avec ciel rose et orange',
        'lac de montagne cristallin reflétant les pics environnants',
        'vallée alpine avec prairie fleurie et montagnes en arrière-plan'
      ],
      mood: 'energetic'
    },
    {
      id: 'cosmic_space',
      name: 'Espace Cosmique',
      description: 'Galaxies et nébuleuses pour méditation transcendante',
      color: 'from-indigo-600 to-purple-700',
      icon: Star,
      prompts: [
        'nébuleuse colorée avec étoiles scintillantes dans l\'espace profond',
        'galaxie spirale avec couleurs vives roses et bleues',
        'planète terrestre vue depuis l\'espace avec aurores boréales'
      ],
      mood: 'mystical'
    },
    {
      id: 'forest_sanctuary',
      name: 'Sanctuaire Forestier',
      description: 'Forêts enchantées avec lumière filtrée',
      color: 'from-green-600 to-teal-600',
      icon: TreePine,
      prompts: [
        'forêt ancienne avec rayons de soleil dorés filtrant à travers les arbres',
        'clairière magique avec champignons lumineux et brume mystique',
        'séquoias géants avec sentier en bois et lumière douce'
      ],
      mood: 'natural'
    },
    {
      id: 'celestial_skies',
      name: 'Ciels Célestes',
      description: 'Aurores boréales et phénomènes célestes',
      color: 'from-pink-500 to-purple-600',
      icon: Cloud,
      prompts: [
        'aurores boréales vertes et violettes dansant dans le ciel nocturne',
        'coucher de soleil spectaculaire avec nuages dorés et roses',
        'ciel étoilé avec voie lactée visible au-dessus d\'un lac'
      ],
      mood: 'mystical'
    }
  ];

  const imageStyles = [
    { id: 'photorealistic', name: 'Photoréaliste', description: 'Images hyper réalistes' },
    { id: 'artistic', name: 'Artistique', description: 'Style peinture impressionniste' },
    { id: 'dreamlike', name: 'Onirique', description: 'Ambiance rêveuse et surréaliste' },
    { id: 'minimalist', name: 'Minimaliste', description: 'Design épuré et simple' },
    { id: 'abstract', name: 'Abstrait', description: 'Formes et couleurs abstraites' }
  ];

  const generateImage = useCallback(async (customPrompt?: string) => {
    if (!selectedTheme && !customPrompt) {
      toast.error('Veuillez sélectionner un thème');
      return;
    }

    setIsGenerating(true);

    try {
      const theme = imageThemes.find(t => t.id === selectedTheme);
      const style = imageStyles.find(s => s.id === selectedStyle);
      
      const basePrompt = customPrompt || (theme?.prompts[Math.floor(Math.random() * theme.prompts.length)] || '');
      const enhancedPrompt = `${basePrompt}, ${style?.description}, ultra détaillé, éclairage cinématographique, 8K, composition parfaite`;

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: enhancedPrompt,
          style: selectedStyle,
          resolution: '1920x1080',
          quality: 'high'
        }
      });

      if (error) throw error;

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.image_url || '/api/placeholder/1920/1080',
        prompt: basePrompt,
        theme: theme?.name || 'Personnalisé',
        style: style?.name || selectedStyle,
        mood: theme?.mood || 'natural',
        resolution: '1920x1080',
        created_at: new Date().toISOString(),
        likes: 0,
        views: 0,
        is_favorite: false
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setCurrentImage(newImage);
      
      toast.success('🎨 Image générée avec succès !');
    } catch (error) {
      console.error('Erreur génération image:', error);
      toast.error('Erreur lors de la génération de l\'image');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTheme, selectedStyle, imageThemes, imageStyles]);

  // Auto-génération basée sur les paramètres
  useEffect(() => {
    if (settings.autoGenerate && selectedTheme) {
      const interval = setInterval(() => {
        if (!isGenerating) {
          generateImage();
        }
      }, 30000); // Nouvelle image toutes les 30 secondes

      return () => clearInterval(interval);
    }
  }, [settings.autoGenerate, selectedTheme, generateImage, isGenerating]);

  // Diaporama automatique
  useEffect(() => {
    if (slideshowActive && generatedImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % generatedImages.length);
      }, settings.transitionDuration);

      return () => clearInterval(interval);
    }
  }, [slideshowActive, generatedImages.length, settings.transitionDuration]);

  // Mise à jour de l'image courante lors du diaporama
  useEffect(() => {
    if (slideshowActive && generatedImages.length > 0) {
      setCurrentImage(generatedImages[currentImageIndex]);
    }
  }, [currentImageIndex, generatedImages, slideshowActive]);

  const toggleFavorite = (imageId: string) => {
    setGeneratedImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, is_favorite: !img.is_favorite } : img
    ));
  };

  return (
    <div className="space-y-6">
      {/* Interface Principale */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
              <Image className="w-6 h-6 text-white" />
            </div>
            Images d'Ambiance Intelligentes
            <Badge className="bg-gradient-to-r from-success to-success-glow text-white">
              IA DALL-E 3
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Sélection du Thème */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thèmes d'Ambiance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {imageThemes.map((theme) => {
                const IconComponent = theme.icon;
                return (
                  <motion.div
                    key={theme.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all ${
                        selectedTheme === theme.id 
                          ? 'ring-2 ring-primary shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedTheme(theme.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.color}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{theme.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {theme.description}
                            </p>
                            <Badge 
                              className={`mt-2 text-xs ${
                                theme.mood === 'calm' ? 'bg-blue-100 text-blue-800' :
                                theme.mood === 'energetic' ? 'bg-orange-100 text-orange-800' :
                                theme.mood === 'mystical' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                              }`}
                            >
                              {theme.mood}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Style et Paramètres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Style Artistique</label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageStyles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      <div>
                        <div className="font-medium">{style.name}</div>
                        <div className="text-xs text-muted-foreground">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Paramètres Intelligents</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Génération automatique</label>
                  <Switch
                    checked={settings.autoGenerate}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoGenerate: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm">Sync avec musique</label>
                  <Switch
                    checked={settings.syncWithMusic}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, syncWithMusic: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm">Éclairage dynamique</label>
                  <Switch
                    checked={settings.dynamicLighting}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, dynamicLighting: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contrôles de Génération */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => generateImage()}
              disabled={isGenerating || !selectedTheme}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Générer Image IA
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setSlideshowActive(!slideshowActive)}
              disabled={generatedImages.length < 2}
            >
              <Timer className="w-4 h-4 mr-2" />
              {slideshowActive ? 'Arrêter' : 'Diaporama'}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (generatedImages.length > 0) {
                  const randomIndex = Math.floor(Math.random() * generatedImages.length);
                  setCurrentImage(generatedImages[randomIndex]);
                }
              }}
              disabled={generatedImages.length === 0}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Galerie d'Images */}
      {generatedImages.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Principale */}
          <div className="lg:col-span-2">
            <Card className="relative overflow-hidden h-96">
              {currentImage && (
                <div className="relative w-full h-full">
                  <img
                    src={currentImage.url}
                    alt={currentImage.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Overlay d'informations */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-end justify-between">
                      <div className="text-white">
                        <h3 className="font-semibold">{currentImage.theme}</h3>
                        <p className="text-sm opacity-90">{currentImage.style}</p>
                        <p className="text-xs opacity-75 mt-1 line-clamp-2">
                          {currentImage.prompt}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={() => toggleFavorite(currentImage.id)}
                        >
                          <Heart 
                            className={`w-4 h-4 ${currentImage.is_favorite ? 'fill-red-500 text-red-500' : ''}`} 
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Miniatures */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Galerie ({generatedImages.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              <AnimatePresence>
                {generatedImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative cursor-pointer rounded-lg overflow-hidden ${
                      currentImage?.id === image.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setCurrentImage(image)}
                  >
                    <div className="aspect-video">
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <p className="text-xs font-medium">{image.theme}</p>
                          <p className="text-xs opacity-75">{image.style}</p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {image.is_favorite && (
                            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                          )}
                          <Eye className="w-3 h-3" />
                          <span className="text-xs">{image.views}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};