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
  Heart,
  Users,
  TrendingUp,
  BookOpen,
  Stethoscope,
  Brain,
  Zap,
  Clock,
  Star,
  Filter,
  Search,
  Grid,
  List,
  Plus,
  History,
  Globe,
  Upload,
  MessageSquare,
  Eye,
  Edit
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AIContentGenerator } from '@/components/generator/AIContentGenerator';
import { ContentPreviewModal } from '@/components/generator/ContentPreviewModal';

export const GeneratorPage = () => {
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    request: any;
  }>({ isOpen: false, request: null });

  const handlePreview = (request: any) => {
    setPreviewModal({ isOpen: true, request });
  };

  const handleClosePreview = () => {
    setPreviewModal({ isOpen: false, request: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wand2 className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Générateur de Contenu IA
            </h1>
            <Sparkles className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Créez du contenu médical personnalisé avec l'intelligence artificielle avancée
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="default" className="text-lg px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600">
              <Zap className="h-4 w-4 mr-2" />
              IA Avancée
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Globe className="h-4 w-4 mr-2" />
              Multilingue
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <BookOpen className="h-4 w-4 mr-2" />
              Médical
            </Badge>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">250K+</div>
              <div className="text-sm text-muted-foreground">Textes générés</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-4">
              <Music className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <div className="text-2xl font-bold text-amber-600">45K+</div>
              <div className="text-sm text-muted-foreground">Musiques créées</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <Image className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">128K+</div>
              <div className="text-sm text-muted-foreground">Images produites</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">12K+</div>
              <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
            </CardContent>
          </Card>
        </div>

        {/* Générateur principal */}
        <AIContentGenerator />

        {/* Modal de prévisualisation */}
        <ContentPreviewModal
          isOpen={previewModal.isOpen}
          onClose={handleClosePreview}
          request={previewModal.request}
          onRegenerate={() => {
            // Logic pour régénérer le contenu
            toast({
              title: "Régénération en cours",
              description: "Le contenu est en cours de régénération...",
            });
          }}
          onSave={() => {
            // Logic pour sauvegarder
            toast({
              title: "Sauvegardé !",
              description: "Le contenu a été ajouté à votre bibliothèque.",
            });
          }}
          onEdit={() => {
            // Logic pour éditer
            handleClosePreview();
            toast({
              title: "Mode édition",
              description: "Vous pouvez maintenant modifier le contenu.",
            });
          }}
        />
      </div>
    </div>
  );
};