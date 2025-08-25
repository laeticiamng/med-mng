import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Share2, 
  Copy, 
  Edit, 
  Heart, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  FileText,
  Music,
  Image,
  Video,
  Brain,
  Stethoscope,
  Eye,
  Code,
  Settings,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GenerationRequest {
  id: string;
  type: 'text' | 'music' | 'image' | 'video' | 'quiz' | 'scenario';
  prompt: string;
  parameters: Record<string, any>;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  result?: any;
  createdAt: Date;
  progress: number;
}

interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: GenerationRequest | null;
  onRegenerate?: () => void;
  onSave?: () => void;
  onEdit?: () => void;
}

export const ContentPreviewModal = ({
  isOpen,
  onClose,
  request,
  onRegenerate,
  onSave,
  onEdit
}: ContentPreviewModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  if (!request) return null;

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copié !",
        description: "Le contenu a été copié dans le presse-papiers.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le contenu.",
        variant: "destructive"
      });
    }
  };

  const handleExport = (format: string) => {
    const data = format === 'json' ? 
      JSON.stringify(request.result, null, 2) :
      format === 'txt' ? 
      (request.result?.content || JSON.stringify(request.result)) :
      request.result?.content || '';

    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generation-${request.id}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Contenu généré - ${request.type}`,
          text: request.result?.content?.substring(0, 100) + '...' || 'Contenu généré par IA',
          url: window.location.href
        });
      } catch (error) {
        // Fallback to clipboard
        handleCopy(window.location.href);
      }
    } else {
      handleCopy(window.location.href);
    }
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    toast({
      title: type === 'like' ? "Merci !" : "Feedback reçu",
      description: type === 'like' ? 
        "Votre évaluation positive nous aide à améliorer l'IA." :
        "Nous prendrons en compte votre retour pour améliorer la génération.",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'music': return <Music className="h-5 w-5 text-amber-600" />;
      case 'image': return <Image className="h-5 w-5 text-green-600" />;
      case 'video': return <Video className="h-5 w-5 text-purple-600" />;
      case 'quiz': return <Brain className="h-5 w-5 text-red-600" />;
      case 'scenario': return <Stethoscope className="h-5 w-5 text-indigo-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderContentPreview = () => {
    if (!request?.result) return null;

    switch (request.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{request.result.wordCount} mots</span>
              <span>{request.result.readingTime} min de lecture</span>
              <Badge variant={request.result.quality === 'high' ? 'default' : 'secondary'}>
                {request.result.quality === 'high' ? 'Haute qualité' : 'Qualité standard'}
              </Badge>
            </div>
            <ScrollArea className="h-96 w-full border rounded-lg p-4">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm">
                  {request.result.content}
                </pre>
              </div>
            </ScrollArea>
          </div>
        );

      case 'music':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {Math.floor(request.result.duration / 60)}:
                {(request.result.duration % 60).toString().padStart(2, '0')}
              </span>
              {request.result.metadata && (
                <>
                  <span>•</span>
                  <span>{request.result.metadata.title}</span>
                </>
              )}
            </div>
            
            {/* Lecteur audio simulé */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="rounded-full w-12 h-12"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <div className="flex-1">
                  <div className="h-2 bg-amber-200 rounded-full">
                    <div className="h-2 bg-amber-500 rounded-full w-1/3"></div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Waveform simulée */}
              <div className="flex items-center justify-center gap-1 h-16 mb-4">
                {request.result.waveform?.map((height: number, index: number) => (
                  <div
                    key={index}
                    className="bg-amber-400 rounded-full"
                    style={{
                      width: '3px',
                      height: `${height * 100}%`,
                      opacity: index < 33 ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
              
              {/* Paroles */}
              {request.result.lyrics && (
                <div className="space-y-2">
                  <h4 className="font-medium">Paroles :</h4>
                  <div className="text-sm space-y-1">
                    {request.result.lyrics.map((line: string, index: number) => (
                      <div key={index} className="p-2 bg-white/50 rounded">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{request.result.width} × {request.result.height}</span>
              <span>{request.result.format.toUpperCase()}</span>
              {request.result.elements && (
                <Badge variant="outline">
                  {request.result.elements.length} éléments
                </Badge>
              )}
            </div>
            
            {/* Image placeholder */}
            <div className="relative">
              <div 
                className="bg-gradient-to-br from-green-100 to-emerald-200 border-2 border-dashed border-green-300 rounded-lg flex items-center justify-center text-green-700"
                style={{ aspectRatio: `${request.result.width}/${request.result.height}`, minHeight: '300px' }}
              >
                <div className="text-center">
                  <Image className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm font-medium">Image générée</p>
                  <p className="text-xs text-muted-foreground">
                    {request.result.width} × {request.result.height}
                  </p>
                </div>
              </div>
              
              {/* Annotations overlay */}
              {request.result.elements && (
                <div className="absolute inset-0 pointer-events-none">
                  {request.result.elements.map((element: string, index: number) => (
                    <div
                      key={index}
                      className="absolute bg-black/70 text-white text-xs px-2 py-1 rounded"
                      style={{
                        top: `${Math.random() * 70 + 10}%`,
                        left: `${Math.random() * 70 + 10}%`
                      }}
                    >
                      {element}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {Math.floor(request.result.duration / 60)}:
                {(request.result.duration % 60).toString().padStart(2, '0')}
              </span>
              <span>{request.result.resolution}</span>
              <span>{request.result.frames} frames</span>
            </div>
            
            {/* Video player simulé */}
            <div className="relative bg-gradient-to-br from-purple-100 to-violet-200 border border-purple-300 rounded-lg overflow-hidden">
              <div className="aspect-video flex items-center justify-center text-purple-700">
                <div className="text-center">
                  <Video className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">Vidéo générée</p>
                  <p className="text-sm text-muted-foreground">{request.result.resolution}</p>
                </div>
              </div>
              
              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="text-white hover:text-white">
                    <Play className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 h-1 bg-white/30 rounded-full">
                    <div className="h-1 bg-white rounded-full w-1/4"></div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-white hover:text-white">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{request.result.questions.length} questions</span>
              <span>{request.result.estimatedTime} min</span>
              <Badge variant="outline">{request.result.difficulty}</Badge>
            </div>
            
            <ScrollArea className="h-96 w-full">
              <div className="space-y-4 pr-4">
                {request.result.questions.map((question: any, index: number) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-red-100 text-red-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{question.question}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 ml-11">
                      {question.options.map((option: string, optIndex: number) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded border ${
                            optIndex === question.correct 
                              ? 'bg-green-50 border-green-200 text-green-800' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          {option}
                        </div>
                      ))}
                      
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Explication :</strong> {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        );

      case 'scenario':
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-medium text-indigo-900 mb-2">{request.result.title}</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Patient :</span>
                  <p>{request.result.patient.gender}, {request.result.patient.age} ans</p>
                </div>
                <div>
                  <span className="font-medium">Symptômes :</span>
                  <p>{request.result.patient.symptoms.join(', ')}</p>
                </div>
                <div>
                  <span className="font-medium">Étapes :</span>
                  <p>{request.result.stages.length} phases</p>
                </div>
              </div>
            </div>
            
            <ScrollArea className="h-80 w-full">
              <div className="space-y-4 pr-4">
                {request.result.stages.map((stage: any, index: number) => (
                  <div key={stage.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <h4 className="font-medium">{stage.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground ml-11">
                      {stage.content}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Objectifs pédagogiques :</h4>
              <ul className="text-sm text-green-800 space-y-1">
                {request.result.learningObjectives.map((objective: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aperçu non disponible pour ce type de contenu</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getTypeIcon(request.type)}
            <span className="capitalize">Contenu {request.type} généré</span>
            <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
              {request.status === 'completed' ? 'Terminé' : request.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Généré le {request.createdAt.toLocaleString()} • {request.prompt.substring(0, 100)}...
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Code
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 mt-4">
            {renderContentPreview()}
          </TabsContent>

          <TabsContent value="details" className="flex-1 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-6 pr-4">
                <div>
                  <h3 className="font-medium mb-3">Prompt utilisé</h3>
                  <div className="bg-muted/50 border rounded-lg p-3">
                    <p className="text-sm">{request.prompt}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Paramètres de génération</h3>
                  <div className="bg-muted/50 border rounded-lg p-3">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(request.parameters, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Métadonnées</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">ID :</span>
                      <p className="text-muted-foreground">{request.id}</p>
                    </div>
                    <div>
                      <span className="font-medium">Type :</span>
                      <p className="text-muted-foreground capitalize">{request.type}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status :</span>
                      <p className="text-muted-foreground capitalize">{request.status}</p>
                    </div>
                    <div>
                      <span className="font-medium">Créé le :</span>
                      <p className="text-muted-foreground">{request.createdAt.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="code" className="flex-1 mt-4">
            <ScrollArea className="h-full">
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4">
                <pre className="text-sm">
                  <code>
                    {JSON.stringify(request, null, 2)}
                  </code>
                </pre>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="feedback" className="flex-1 mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Évaluez ce contenu</h3>
                <div className="flex gap-4">
                  <Button
                    variant={feedback === 'like' ? 'default' : 'outline'}
                    onClick={() => handleFeedback('like')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    J'aime
                  </Button>
                  <Button
                    variant={feedback === 'dislike' ? 'destructive' : 'outline'}
                    onClick={() => handleFeedback('dislike')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Je n'aime pas
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Commentaires</h3>
                <textarea
                  className="w-full h-24 p-3 border rounded-lg resize-none"
                  placeholder="Partagez vos commentaires pour nous aider à améliorer la génération..."
                />
                <Button size="sm" className="mt-2">
                  Envoyer le feedback
                </Button>
              </div>

              <div>
                <h3 className="font-medium mb-3">Suggestions d'amélioration</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Plus de détails techniques</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Meilleure structure</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Exemples pratiques</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Références médicales</span>
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleFeedback('like')}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Favoris
            </Button>
            <Button
              variant="outline"
              onClick={() => request.result?.content && handleCopy(request.result.content)}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copier
            </Button>
          </div>

          <div className="flex gap-2">
            {onRegenerate && (
              <Button variant="outline" onClick={onRegenerate}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Régénérer
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
            <Button variant="outline" onClick={() => handleExport('txt')}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
            {onSave && (
              <Button onClick={onSave}>
                <Star className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};