import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Wand2, 
  Save, 
  Share2, 
  Download, 
  Settings,
  Palette,
  Volume2,
  Clock,
  Sparkles,
  Users,
  Eye,
  Heart,
  Star,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratorTemplate {
  id: string;
  name: string;
  description: string;
  category: 'medical' | 'educational' | 'creative';
  style: string;
  mood: string;
  tempo: number;
  instruments: string[];
  preview?: string;
}

interface CollaborationUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'editing';
}

export const AdvancedGeneratorFeatures: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCollaborating, setIsCollaborating] = useState(false);

  const templates: GeneratorTemplate[] = [
    {
      id: '1',
      name: 'Cardiologie Classique',
      description: 'Template optimisé pour les items de cardiologie avec rythme adapté',
      category: 'medical',
      style: 'Classical',
      mood: 'Focused',
      tempo: 120,
      instruments: ['Piano', 'Strings', 'Soft Percussion'],
      preview: '/audio/cardio-preview.mp3'
    },
    {
      id: '2',
      name: 'Urgences Dynamique',
      description: 'Pour les situations d\'urgence avec tempo énergique',
      category: 'medical', 
      style: 'Electronic',
      mood: 'Energetic',
      tempo: 140,
      instruments: ['Synth', 'Bass', 'Drums'],
      preview: '/audio/urgence-preview.mp3'
    },
    {
      id: '3',
      name: 'Anatomie Mnémotechnique',
      description: 'Mélodie répétitive pour faciliter la mémorisation',
      category: 'educational',
      style: 'Pop',
      mood: 'Catchy',
      tempo: 110,
      instruments: ['Guitar', 'Bass', 'Drums', 'Vocals'],
      preview: '/audio/anatomie-preview.mp3'
    }
  ];

  const collaborators: CollaborationUser[] = [
    { id: '1', name: 'Dr. Martin', avatar: '👨‍⚕️', status: 'online' },
    { id: '2', name: 'Sarah L.', avatar: '👩‍🎓', status: 'editing' },
    { id: '3', name: 'Prof. Dubois', avatar: '👨‍🏫', status: 'offline' }
  ];

  const [generatorSettings, setGeneratorSettings] = useState({
    creativity: [75],
    coherence: [85],
    repetition: [60],
    complexity: [70],
    autoHarmonize: true,
    includeIntro: true,
    includeOutro: false,
    fadeInOut: true
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    toast({
      title: "Template sélectionné",
      description: `"${template?.name}" appliqué avec succès`,
    });
  };

  const handleSaveAsTemplate = () => {
    toast({
      title: "Template sauvegardé",
      description: "Vos paramètres ont été enregistrés comme nouveau template",
    });
  };

  const handleStartCollaboration = () => {
    setIsCollaborating(!isCollaborating);
    toast({
      title: isCollaborating ? "Collaboration arrêtée" : "Collaboration démarrée",
      description: isCollaborating ? "Session de collaboration terminée" : "Invitez des collaborateurs à rejoindre la session",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'educational': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'creative': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-400" />
          Fonctionnalités Avancées
        </CardTitle>
        <CardDescription className="text-gray-300">
          Outils professionnels pour la création musicale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="templates" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Templates
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Paramètres IA
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Collaboration
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Export/Partage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 border ${
                    selectedTemplate === template.id 
                      ? 'border-purple-400/50 bg-purple-500/20' 
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm">{template.name}</CardTitle>
                      <Badge className={getCategoryColor(template.category)} variant="outline">
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-400 text-xs">{template.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Style:</span>
                        <span className="text-white">{template.style}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Tempo:</span>
                        <span className="text-white">{template.tempo} BPM</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.instruments.slice(0, 2).map((instrument, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-white/5 text-gray-300">
                            {instrument}
                          </Badge>
                        ))}
                        {template.instruments.length > 2 && (
                          <Badge variant="outline" className="text-xs bg-white/5 text-gray-300">
                            +{template.instruments.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {template.preview && (
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        <Play className="h-3 w-3 mr-1" />
                        Aperçu
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveAsTemplate} variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder comme template
              </Button>
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                Importer template
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-white font-medium">Paramètres de Génération IA</h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <label className="text-gray-300">Créativité</label>
                      <span className="text-white">{generatorSettings.creativity[0]}%</span>
                    </div>
                    <Slider 
                      value={generatorSettings.creativity} 
                      onValueChange={(value) => setGeneratorSettings(prev => ({ ...prev, creativity: value }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <label className="text-gray-300">Cohérence musicale</label>
                      <span className="text-white">{generatorSettings.coherence[0]}%</span>
                    </div>
                    <Slider 
                      value={generatorSettings.coherence} 
                      onValueChange={(value) => setGeneratorSettings(prev => ({ ...prev, coherence: value }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <label className="text-gray-300">Répétition pédagogique</label>
                      <span className="text-white">{generatorSettings.repetition[0]}%</span>
                    </div>
                    <Slider 
                      value={generatorSettings.repetition} 
                      onValueChange={(value) => setGeneratorSettings(prev => ({ ...prev, repetition: value }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <label className="text-gray-300">Complexité</label>
                      <span className="text-white">{generatorSettings.complexity[0]}%</span>
                    </div>
                    <Slider 
                      value={generatorSettings.complexity} 
                      onValueChange={(value) => setGeneratorSettings(prev => ({ ...prev, complexity: value }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Options Avancées</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-300 text-sm">Harmonisation automatique</label>
                    <Switch 
                      checked={generatorSettings.autoHarmonize}
                      onCheckedChange={(checked) => setGeneratorSettings(prev => ({ ...prev, autoHarmonize: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-gray-300 text-sm">Inclure introduction</label>
                    <Switch 
                      checked={generatorSettings.includeIntro}
                      onCheckedChange={(checked) => setGeneratorSettings(prev => ({ ...prev, includeIntro: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-gray-300 text-sm">Inclure outro</label>
                    <Switch 
                      checked={generatorSettings.includeOutro}
                      onCheckedChange={(checked) => setGeneratorSettings(prev => ({ ...prev, includeOutro: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-gray-300 text-sm">Fade in/out automatique</label>
                    <Switch 
                      checked={generatorSettings.fadeInOut}
                      onCheckedChange={(checked) => setGeneratorSettings(prev => ({ ...prev, fadeInOut: checked }))}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">
                    <Settings className="h-4 w-4 mr-2" />
                    Réinitialiser paramètres
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Session de Collaboration</h4>
              <Button 
                onClick={handleStartCollaboration}
                className={`${isCollaborating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {isCollaborating ? 'Arrêter' : 'Démarrer'} collaboration
              </Button>
            </div>

            {isCollaborating && (
              <div className="space-y-4">
                <Card className="bg-white/5 border border-white/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-400" />
                      Collaborateurs connectés
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {collaborators.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{user.avatar}</span>
                          <span className="text-white text-sm">{user.name}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            user.status === 'online' 
                              ? 'bg-green-500/20 text-green-300 border-green-400/30'
                              : user.status === 'editing'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                              : 'bg-gray-500/20 text-gray-300 border-gray-400/30'
                          }
                        >
                          {user.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Input 
                    placeholder="Inviter par email..." 
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                  <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                    Inviter
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h5 className="text-white font-medium text-sm">Permissions de collaboration</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Modification des paroles</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Changement de style</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Paramètres avancés</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Export final</span>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-white font-medium">Formats d'Export</h4>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10 justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    MP3 (320 kbps)
                  </Button>
                  <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10 justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    WAV (Lossless)
                  </Button>
                  <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10 justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    MIDI (Projet)
                  </Button>
                  <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10 justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Paroles PDF
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Partage Social</h4>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10 justify-start">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager sur la communauté
                  </Button>
                  <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10 justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Lien de partage public
                  </Button>
                  <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10 justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Ajouter aux favoris
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/20">
                  <h5 className="text-white font-medium text-sm mb-2">Statistiques de partage</h5>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Vues:</span>
                      <span className="text-white">1,247</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Likes:</span>
                      <span className="text-white">89</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Partages:</span>
                      <span className="text-white">23</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};