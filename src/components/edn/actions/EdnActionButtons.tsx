import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  BookOpen,
  Music,
  Brain,
  Share2,
  Download,
  Heart,
  Star,
  Clock,
  Trophy,
  Target,
  Zap,
  CheckCircle2,
  RefreshCw,
  Volume2,
  VolumeX,
  Bookmark,
  FileText,
  PenTool,
  MessageSquare,
  Settings,
  BarChart3,
  Users,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Lightbulb,
  Award,
  Sparkles,
  Activity,
  Timer,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EdnActionButtonsProps {
  itemCode: string;
  slug: string;
  title: string;
  isCompleted?: boolean;
  isFavorite?: boolean;
  progress?: number;
  hasMusic?: boolean;
  hasQuiz?: boolean;
  className?: string;
}

interface ActionButton {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  badge?: string;
  tooltip?: string;
  primary?: boolean;
}

export const EdnActionButtons = ({
  itemCode,
  slug,
  title,
  isCompleted = false,
  isFavorite = false,
  progress = 0,
  hasMusic = false,
  hasQuiz = false,
  className
}: EdnActionButtonsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [currentFavorite, setCurrentFavorite] = useState(isFavorite);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Actions principales
  const handleStartStudy = () => {
    navigate(`/edn/${slug}`);
    toast({
      title: "📚 Étude commencée",
      description: `Début de l'étude de l'item ${itemCode}`,
    });
  };

  const handleImmersiveMode = () => {
    navigate(`/edn/${slug}/immersive`);
    toast({
      title: "🌟 Mode immersif activé",
      description: "Expérience d'apprentissage immersive lancée",
    });
  };

  const handleQuizStart = () => {
    navigate(`/edn/${slug}?tab=quiz`);
    toast({
      title: "🧠 Quiz démarré",
      description: "Test de connaissances en cours...",
    });
  };

  const handleMusicPlay = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "⏸️ Musique pausée" : "🎵 Musique lancée",
      description: isPlaying ? "Lecture mise en pause" : "Paroles musicales en cours...",
    });
  };

  const handleToggleFavorite = () => {
    setCurrentFavorite(!currentFavorite);
    toast({
      title: currentFavorite ? "💔 Retiré des favoris" : "❤️ Ajouté aux favoris",
      description: `Item ${itemCode} ${currentFavorite ? 'retiré de' : 'ajouté à'} vos favoris`,
    });
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${itemCode} - ${title}`,
          text: `Découvrez cet item EDN immersif : ${title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "🔗 Lien copié",
          description: "Le lien a été copié dans le presse-papiers",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erreur de partage",
        description: "Impossible de partager cet item",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    toast({
      title: "⬇️ Téléchargement préparé",
      description: "Préparation du contenu pour téléchargement hors-ligne...",
    });
    // Simuler téléchargement
    setTimeout(() => {
      toast({
        title: "✅ Téléchargement terminé",
        description: `${itemCode} disponible hors-ligne`,
      });
    }, 2000);
  };

  const handleProgress = () => {
    navigate(`/edn/${slug}?tab=progress`);
  };

  const handleAnalytics = () => {
    navigate(`/analytics?item=${itemCode}`);
  };

  const handleNote = () => {
    toast({
      title: "📝 Carnet de notes",
      description: "Fonctionnalité de prise de notes en développement",
    });
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "🔖 Marque-page retiré" : "🔖 Marque-page ajouté",
      description: `Position ${isBookmarked ? 'supprimée' : 'sauvegardée'}`,
    });
  };

  const handleCommunity = () => {
    navigate(`/med-mng/community?topic=${itemCode}`);
  };

  // Configuration des boutons d'action
  const actionButtons: ActionButton[] = [
    // Actions principales
    {
      key: 'study',
      label: 'Étudier',
      icon: BookOpen,
      action: handleStartStudy,
      variant: 'default',
      primary: true,
      tooltip: 'Commencer l\'étude de cet item'
    },
    {
      key: 'immersive',
      label: 'Immersif',
      icon: Sparkles,
      action: handleImmersiveMode,
      variant: 'secondary',
      badge: 'VR',
      tooltip: 'Mode d\'apprentissage immersif'
    },
    
    // Actions conditionnelles
    ...(hasQuiz ? [{
      key: 'quiz',
      label: 'Quiz',
      icon: Brain,
      action: handleQuizStart,
      variant: 'outline' as const,
      badge: isCompleted ? '✓' : undefined,
      tooltip: 'Tester vos connaissances'
    }] : []),
    
    ...(hasMusic ? [{
      key: 'music',
      label: isPlaying ? 'Pause' : 'Musique',
      icon: isPlaying ? Pause : Music,
      action: handleMusicPlay,
      variant: 'outline' as const,
      tooltip: 'Paroles musicales mnémotechniques'
    }] : []),

    // Actions de gestion
    {
      key: 'favorite',
      label: currentFavorite ? 'Favoris ❤️' : 'Favoris',
      icon: Heart,
      action: handleToggleFavorite,
      variant: currentFavorite ? 'default' : 'ghost',
      tooltip: currentFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'
    },
    {
      key: 'bookmark',
      label: 'Marquer',
      icon: Bookmark,
      action: handleToggleBookmark,
      variant: isBookmarked ? 'default' : 'ghost',
      size: 'sm' as const,
      tooltip: 'Marquer la position actuelle'
    },
    
    // Actions de partage et sauvegarde
    {
      key: 'share',
      label: 'Partager',
      icon: Share2,
      action: handleShare,
      variant: 'ghost',
      size: 'sm' as const,
      loading: isSharing,
      tooltip: 'Partager cet item'
    },
    {
      key: 'download',
      label: 'Hors-ligne',
      icon: Download,
      action: handleDownload,
      variant: 'ghost',
      size: 'sm' as const,
      tooltip: 'Télécharger pour usage hors-ligne'
    },

    // Actions d'analyse
    {
      key: 'progress',
      label: 'Progression',
      icon: Activity,
      action: handleProgress,
      variant: 'ghost',
      size: 'sm' as const,
      badge: `${Math.round(progress)}%`,
      tooltip: 'Voir votre progression'
    },
    {
      key: 'analytics',
      label: 'Stats',
      icon: BarChart3,
      action: handleAnalytics,
      variant: 'ghost',
      size: 'sm' as const,
      tooltip: 'Statistiques détaillées'
    },

    // Actions secondaires
    {
      key: 'notes',
      label: 'Notes',
      icon: PenTool,
      action: handleNote,
      variant: 'ghost',
      size: 'sm' as const,
      tooltip: 'Prendre des notes'
    },
    {
      key: 'community',
      label: 'Communauté',
      icon: Users,
      action: handleCommunity,
      variant: 'ghost',
      size: 'sm' as const,
      tooltip: 'Discussions communautaires'
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Actions principales */}
      <div className="flex flex-wrap gap-3">
        {actionButtons
          .filter(btn => btn.primary)
          .map((button) => (
            <Tooltip key={button.key}>
              <TooltipTrigger asChild>
                <Button
                  variant={button.variant}
                  size={button.size}
                  onClick={button.action}
                  disabled={button.disabled}
                  className={cn(
                    "gap-2 transition-all duration-200 hover:scale-105",
                    button.primary && "shadow-lg hover:shadow-xl"
                  )}
                >
                  <button.icon className="h-4 w-4" />
                  {button.label}
                  {button.badge && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {button.badge}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              {button.tooltip && (
                <TooltipContent>
                  <p>{button.tooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
      </div>

      {/* Actions secondaires */}
      <div className="flex flex-wrap gap-2">
        {actionButtons
          .filter(btn => !btn.primary)
          .map((button) => (
            <Tooltip key={button.key}>
              <TooltipTrigger asChild>
                <Button
                  variant={button.variant}
                  size={button.size}
                  onClick={button.action}
                  disabled={button.disabled}
                  className="gap-1 transition-all duration-200"
                >
                  <button.icon className="h-3 w-3" />
                  {button.size !== 'sm' && button.label}
                  {button.badge && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {button.badge}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              {button.tooltip && (
                <TooltipContent>
                  <p>{button.tooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
      </div>

      {/* Barre de progression */}
      {progress > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{Math.round(progress)}%</span>
              {isCompleted && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Terminé
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Informations contextuelles */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {hasMusic && (
          <div className="flex items-center gap-1">
            <Music className="h-3 w-3" />
            <span>Avec musique</span>
          </div>
        )}
        {hasQuiz && (
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            <span>Quiz inclus</span>
          </div>
        )}
        {isCompleted && (
          <div className="flex items-center gap-1 text-green-600">
            <Trophy className="h-3 w-3" />
            <span>Maîtrisé</span>
          </div>
        )}
      </div>
    </div>
  );
};