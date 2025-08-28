import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Music,
  Brain,
  Stethoscope,
  BarChart3,
  Settings,
  User,
  Bell,
  HelpCircle,
  Zap,
  Target,
  Clock,
  Star,
  Heart,
  Download,
  Upload,
  RefreshCw,
  Filter,
  SortAsc,
  Grid,
  List,
  Bookmark,
  Share2,
  MessageSquare,
  Users,
  Award,
  Activity,
  TrendingUp,
  Calendar,
  Lightbulb,
  PlusCircle,
  FileText,
  Headphones,
  Video,
  Camera,
  Mic,
  Volume2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Home,
  ArrowRight,
  ArrowLeft,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  FolderOpen,
  Folder,
  File,
  Image,
  Database,
  Server,
  Cloud,
  HardDrive,
  Smartphone,
  Monitor,
  Laptop,
  MapPin,
  Navigation,
  Compass,
  CreditCard,
  ShoppingCart,
  Coffee,
  Utensils,
  Leaf,
  Trees,
  Flower,
  Sun,
  Moon,
  CloudRain,
  Waves,
  Mountain,
  Bug,
  Fish,
  Cat,
  Dog,
  Smile,
  ThumbsUp,
  Crown,
  Trophy,
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  Glasses,
  Briefcase,
  Hammer,
  Wrench,
  Scissors,
  Pen,
  Pencil,
  Paintbrush,
  Gamepad2,
  Dice1,
  Diamond,
  Code,
  Terminal,
  Power,
  Battery,
  Wifi,
  Bluetooth,
  Disc,
  PlayCircle,
  VolumeX,
  Speaker,
  Radio,
  Tv,
  Webcam,
  Film,
  Images,
  Palette,
  Move,
  MousePointer,
  Square,
  Circle,
  Triangle,
  Sparkles,
  Flame,
  Sunrise,
  Eclipse,
  Rocket,
  Atom,
  Microscope,
  TestTube,
  Pill,
  Thermometer,
  Flashlight,
  Lamp,
  Fan,
  AlarmClock,
  Timer,
  CalendarDays,
  Map,
  Route,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  action: () => void;
  badge?: string;
}

export const QuickActions = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const quickActions: QuickAction[] = [
    // Navigation & Core Features
    {
      id: 'edn-platform',
      title: 'Plateforme EDN',
      description: 'Accéder à la plateforme EDN complète',
      icon: BookOpen,
      category: 'navigation',
      action: () => navigate('/edn'),
      badge: 'Principal'
    },
    {
      id: 'medmng-music',
      title: 'MED-MNG Musique',
      description: 'Générateur musical intelligent',
      icon: Music,
      category: 'creation',
      action: () => navigate('/med-mng')
    },
    {
      id: 'immersive-scene',
      title: 'Scène Immersive',
      description: 'Expérience immersive interactive',
      icon: Eye,
      category: 'immersive',
      action: () => navigate('/edn/immersive')
    },
    {
      id: 'comic-creation',
      title: 'Bande Dessinée',
      description: 'Création de BD interactive',
      icon: Images,
      category: 'creation',
      action: () => navigate('/edn/comic')
    },
    {
      id: 'quiz-system',
      title: 'Système de Quiz',
      description: 'Quiz interactifs et évaluations',
      icon: Brain,
      category: 'education',
      action: () => navigate('/edn/quiz')
    },

    // Dashboard & Analytics
    {
      id: 'dashboard',
      title: 'Tableau de Bord',
      description: 'Vue d\'ensemble des activités',
      icon: BarChart3,
      category: 'analytics',
      action: () => navigate('/dashboard')
    },
    {
      id: 'user-analytics',
      title: 'Analytics Utilisateur',
      description: 'Statistiques détaillées d\'usage',
      icon: TrendingUp,
      category: 'analytics',
      action: () => console.log('Analytics')
    },
    {
      id: 'performance-metrics',
      title: 'Métriques Performance',
      description: 'Mesure des performances système',
      icon: Activity,
      category: 'analytics',
      action: () => console.log('Metrics')
    },

    // Content Management
    {
      id: 'library-management',
      title: 'Gestion Bibliothèque',
      description: 'Organisation du contenu',
      icon: FolderOpen,
      category: 'content',
      action: () => navigate('/library')
    },
    {
      id: 'file-upload',
      title: 'Téléchargement Fichiers',
      description: 'Import de nouveaux contenus',
      icon: Upload,
      category: 'content',
      action: () => console.log('Upload')
    },
    {
      id: 'content-search',
      title: 'Recherche Avancée',
      description: 'Recherche dans tous les contenus',
      icon: Search,
      category: 'content',
      action: () => console.log('Search')
    },

    // User Management
    {
      id: 'user-profile',
      title: 'Profil Utilisateur',
      description: 'Gérer votre profil',
      icon: User,
      category: 'user',
      action: () => navigate('/profile')
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Centre de notifications',
      icon: Bell,
      category: 'user',
      action: () => console.log('Notifications')
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Configuration système',
      icon: Settings,
      category: 'user',
      action: () => navigate('/settings')
    },

    // Medical Features
    {
      id: 'medical-analysis',
      title: 'Analyse Médicale',
      description: 'Outils d\'analyse médicale',
      icon: Stethoscope,
      category: 'medical',
      action: () => console.log('Medical analysis')
    },
    {
      id: 'health-monitoring',
      title: 'Surveillance Santé',
      description: 'Monitoring des paramètres vitaux',
      icon: Heart,
      category: 'medical',
      action: () => console.log('Health monitoring')
    },
    {
      id: 'medical-reports',
      title: 'Rapports Médicaux',
      description: 'Génération de rapports',
      icon: FileText,
      category: 'medical',
      action: () => console.log('Medical reports')
    },

    // Creative Tools
    {
      id: 'music-creation',
      title: 'Création Musicale',
      description: 'Outils de composition',
      icon: Music,
      category: 'creation',
      action: () => navigate('/create/music')
    },
    {
      id: 'audio-processing',
      title: 'Traitement Audio',
      description: 'Edition et mixage audio',
      icon: Headphones,
      category: 'creation',
      action: () => console.log('Audio processing')
    },
    {
      id: 'video-editing',
      title: 'Edition Vidéo',
      description: 'Montage et post-production',
      icon: Video,
      category: 'creation',
      action: () => console.log('Video editing')
    },

    // System Tools
    {
      id: 'database-sync',
      title: 'Synchronisation BDD',
      description: 'Sync avec bases de données',
      icon: Database,
      category: 'system',
      action: () => console.log('Database sync')
    },
    {
      id: 'system-backup',
      title: 'Sauvegarde Système',
      description: 'Backup automatique',
      icon: Save,
      category: 'system',
      action: () => console.log('System backup')
    },
    {
      id: 'security-audit',
      title: 'Audit Sécurité',
      description: 'Vérification sécuritaire',
      icon: Shield,
      category: 'system',
      action: () => console.log('Security audit')
    }
  ];

  const categories = [
    { id: 'all', label: 'Toutes', icon: Grid },
    { id: 'navigation', label: 'Navigation', icon: Compass },
    { id: 'creation', label: 'Création', icon: Palette },
    { id: 'education', label: 'Éducation', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'content', label: 'Contenu', icon: Folder },
    { id: 'user', label: 'Utilisateur', icon: User },
    { id: 'medical', label: 'Médical', icon: Stethoscope },
    { id: 'system', label: 'Système', icon: Settings }
  ];

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Actions Rapides
          </CardTitle>
          <CardDescription>
            Accès rapide à toutes les fonctionnalités de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredActions.map((action) => (
          <Card 
            key={action.id} 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={action.action}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <action.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                {action.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {action.badge}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                {action.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {action.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredActions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucune action trouvée dans cette catégorie.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};