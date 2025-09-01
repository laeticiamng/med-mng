import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Music, 
  Mic, 
  Image, 
  Play, 
  Download,
  Trash2,
  Clock,
  Calendar,
  Volume2,
  Eye,
  Pause
} from 'lucide-react';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { useToast } from '@/hooks/use-toast';

interface GeneratedItem {
  id: string;
  type: 'music' | 'voice' | 'image';
  title?: string;
  text?: string;
  prompt?: string;
  audio_url?: string;
  audio_base64?: string;
  image_base64?: string;
  metadata?: any;
  created_at: string;
}

export const ContentLibrary = () => {
  const { getUserGeneratedContent } = useContentGeneration();
  const { toast } = useToast();
  
  const [content, setContent] = useState<GeneratedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [playingItem, setPlayingItem] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await getUserGeneratedContent();
      setContent(data as GeneratedItem[]);
    } catch (error) {
      console.error('Erreur chargement contenu:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger votre bibliothèque.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = content.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const playAudio = async (item: GeneratedItem) => {
    if (playingItem === item.id) {
      setPlayingItem(null);
      return;
    }

    try {
      let audioUrl: string;
      
      if (item.audio_url) {
        audioUrl = item.audio_url;
      } else if (item.audio_base64) {
        // Convertir base64 en blob URL
        const byteCharacters = atob(item.audio_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mpeg' });
        audioUrl = URL.createObjectURL(blob);
      } else {
        throw new Error('Pas d\'audio disponible');
      }

      const audio = new Audio(audioUrl);
      setPlayingItem(item.id);
      
      audio.onended = () => {
        setPlayingItem(null);
        if (item.audio_base64) {
          URL.revokeObjectURL(audioUrl);
        }
      };
      
      audio.onerror = () => {
        setPlayingItem(null);
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire cet audio.",
          variant: "destructive"
        });
      };
      
      await audio.play();
    } catch (error) {
      console.error('Erreur lecture audio:', error);
      setPlayingItem(null);
      toast({
        title: "Erreur",
        description: "Impossible de lire cet audio.",
        variant: "destructive"
      });
    }
  };

  const downloadContent = (item: GeneratedItem) => {
    try {
      let url: string;
      let filename: string;

      if (item.type === 'music' || item.type === 'voice') {
        if (item.audio_base64) {
          const byteCharacters = atob(item.audio_base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'audio/mpeg' });
          url = URL.createObjectURL(blob);
          filename = `${item.type}-${item.id}.mp3`;
        } else if (item.audio_url) {
          url = item.audio_url;
          filename = `${item.type}-${item.id}.mp3`;
        } else {
          throw new Error('Pas de contenu à télécharger');
        }
      } else if (item.type === 'image') {
        if (item.image_base64) {
          const blob = new Blob([atob(item.image_base64)], { type: 'image/png' });
          url = URL.createObjectURL(blob);
          filename = `image-${item.id}.png`;
        } else {
          throw new Error('Pas d\'image à télécharger');
        }
      } else {
        throw new Error('Type de contenu non supporté');
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      if (item.audio_base64 || item.image_base64) {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger ce contenu.",
        variant: "destructive"
      });
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'music': return <Music className="h-4 w-4" />;
      case 'voice': return <Mic className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return null;
    }
  };

  const getItemTitle = (item: GeneratedItem) => {
    return item.title || 
           (item.prompt && item.prompt.substring(0, 50) + '...') ||
           (item.text && item.text.substring(0, 50) + '...') ||
           `Contenu ${item.type}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Bibliothèque de Contenu</h1>
          <p className="text-muted-foreground">Chargement de vos créations...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Bibliothèque de Contenu</h1>
        <p className="text-muted-foreground">
          Vos créations IA : musiques, voix et images générées
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tout ({content.length})</TabsTrigger>
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Musique ({content.filter(i => i.type === 'music').length})
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voix ({content.filter(i => i.type === 'voice').length})
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Images ({content.filter(i => i.type === 'image').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredContent.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Aucun contenu trouvé</p>
                  <p>Utilisez le Studio de Création pour générer votre premier contenu IA.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getItemIcon(item.type)}
                        {item.type}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                    <CardTitle className="text-sm line-clamp-2 text-container break-words-force">
                      {getItemTitle(item)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Aperçu du contenu */}
                      {item.type === 'image' && item.image_base64 && (
                        <div className="relative">
                          <img
                            src={`data:image/png;base64,${item.image_base64}`}
                            alt="Image générée"
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      
                      {(item.type === 'music' || item.type === 'voice') && (
                        <div className="bg-muted/50 p-3 rounded-md">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Volume2 className="h-4 w-4" />
                            {item.metadata?.duration ? `${item.metadata.duration}s` : 'Audio généré'}
                          </div>
                          {item.type === 'voice' && item.text && (
                            <p className="text-xs mt-1 line-clamp-2 text-container break-words-normal">{item.text}</p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {(item.type === 'music' || item.type === 'voice') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playAudio(item)}
                            className="flex-1"
                          >
                            {playingItem === item.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        
                        {item.type === 'image' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadContent(item)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};