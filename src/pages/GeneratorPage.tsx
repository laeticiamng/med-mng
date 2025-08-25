import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Wand2, 
  FileText, 
  Music, 
  Image, 
  Video, 
  Sparkles,
  Download,
  Share2,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Save,
  Heart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const GeneratorPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState<'text' | 'music' | 'image' | 'video'>('text');
  const [progress, setProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedContent(null);

    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setGeneratedContent(getSimulatedContent());
          toast({
            title: "Génération terminée !",
            description: "Votre contenu a été généré avec succès.",
          });
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const getSimulatedContent = () => {
    switch (generationType) {
      case 'text':
        return "Contenu médical généré : La cardiologie est une spécialité médicale qui s'occupe des troubles du cœur et des vaisseaux sanguins...";
      case 'music':
        return "audio-url-generated.mp3";
      case 'image':
        return "image-url-generated.jpg";
      case 'video':
        return "video-url-generated.mp4";
      default:
        return "Contenu généré";
    }
  };

  const generationTypes = [
    { id: 'text', label: 'Texte médical', icon: FileText, color: 'text-blue-600' },
    { id: 'music', label: 'Musique éducative', icon: Music, color: 'text-amber-600' },
    { id: 'image', label: 'Schémas médicaux', icon: Image, color: 'text-green-600' },
    { id: 'video', label: 'Vidéos pédagogiques', icon: Video, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Générateur de Contenu IA
          </h1>
          <p className="text-xl text-muted-foreground">
            Créez du contenu médical personnalisé avec l'intelligence artificielle
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Generation Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  Type de contenu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {generationTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={generationType === type.id ? "default" : "outline"}
                      onClick={() => setGenerationType(type.id as any)}
                      className="h-20 flex-col gap-2"
                    >
                      <type.icon className={`h-6 w-6 ${type.color}`} />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de génération</CardTitle>
                <CardDescription>
                  Configurez les détails de votre contenu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basique</TabsTrigger>
                    <TabsTrigger value="advanced">Avancé</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Sujet médical</Label>
                      <Input
                        id="topic"
                        placeholder="Ex: Anatomie cardiaque, Pharmacologie..."
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="audience">Public cible</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Étudiant en médecine</SelectItem>
                          <SelectItem value="resident">Interne</SelectItem>
                          <SelectItem value="doctor">Médecin praticien</SelectItem>
                          <SelectItem value="specialist">Spécialiste</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description détaillée</Label>
                      <Textarea
                        id="description"
                        placeholder="Décrivez précisément ce que vous souhaitez générer..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Créativité</Label>
                      <Slider
                        defaultValue={[70]}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Conservateur</span>
                        <span>Créatif</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Longueur du contenu</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez la longueur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Court (200-500 mots)</SelectItem>
                          <SelectItem value="medium">Moyen (500-1000 mots)</SelectItem>
                          <SelectItem value="long">Long (1000+ mots)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Style</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academic">Académique</SelectItem>
                          <SelectItem value="practical">Pratique</SelectItem>
                          <SelectItem value="simplified">Simplifié</SelectItem>
                          <SelectItem value="detailed">Détaillé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Générer
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generation Progress */}
            {isGenerating && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Génération en cours...</span>
                      <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Content */}
            {generatedContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Contenu généré</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Heart className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generationType === 'text' && (
                    <div className="prose max-w-none">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {generatedContent}
                      </p>
                    </div>
                  )}
                  {generationType === 'music' && (
                    <div className="bg-muted/30 rounded-lg p-6 text-center">
                      <Music className="h-12 w-12 mx-auto mb-4 text-amber-600" />
                      <p className="font-medium mb-2">Piste audio générée</p>
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Écouter
                        </Button>
                      </div>
                    </div>
                  )}
                  {(generationType === 'image' || generationType === 'video') && (
                    <div className="bg-muted/30 rounded-lg p-6 text-center">
                      {generationType === 'image' ? (
                        <Image className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      ) : (
                        <Video className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                      )}
                      <p className="font-medium mb-2">
                        {generationType === 'image' ? 'Image générée' : 'Vidéo générée'}
                      </p>
                      <Button size="sm" variant="outline">
                        Voir le contenu
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Utilisation aujourd'hui</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Générations</span>
                  <Badge variant="outline">5/20</Badge>
                </div>
                <Progress value={25} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  15 générations restantes
                </p>
              </CardContent>
            </Card>

            {/* Recent Generations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Générations récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'text', title: 'Cours sur l\'hypertension', time: '2h' },
                    { type: 'music', title: 'Chanson anatomie', time: '1j' },
                    { type: 'image', title: 'Schéma cardiaque', time: '2j' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                      {item.type === 'text' && <FileText className="h-4 w-4 text-blue-600" />}
                      {item.type === 'music' && <Music className="h-4 w-4 text-amber-600" />}
                      {item.type === 'image' && <Image className="h-4 w-4 text-green-600" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  Conseils
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Soyez précis dans vos descriptions</li>
                  <li>• Utilisez des termes médicaux spécifiques</li>
                  <li>• Ajustez la créativité selon vos besoins</li>
                  <li>• Sauvegardez vos meilleurs résultats</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};