import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, Music, Users, Brain, Volume2,
  CheckCircle, AlertCircle, Heart, StickyNote
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEdnItemV2Process } from "@/hooks/useEdnItemV2Process";
import { useEdnNotes } from "@/hooks/useEdnNotes";

interface TableauRang {
  title?: string;
  sections?: Array<{ title?: string; content?: string }>;
}

interface SceneImmersive {
  id?: string;
  title?: string;
  description?: string;
}

interface QuizQuestions {
  questions?: Array<{ question: string; options: string[] }>;
}

interface AudioAmbiance {
  url?: string;
  title?: string;
}

interface EdnItemCardProps {
  item: {
    id: string;
    item_code: string;
    title: string;
    subtitle?: string;
    tableau_rang_a?: TableauRang;
    tableau_rang_b?: TableauRang;
    paroles_musicales?: string[];
    scene_immersive?: SceneImmersive;
    quiz_questions?: QuizQuestions;
    audio_ambiance?: AudioAmbiance;
    visual_ambiance?: { url?: string };
    competences_count_rang_a?: number;
    competences_count_rang_b?: number;
  };
  completionPercentage: number;
  onOpen: (tab?: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const EdnItemCard: React.FC<EdnItemCardProps> = ({
  item,
  completionPercentage,
  onOpen,
  isFavorite = false,
  onToggleFavorite
}) => {
  const isMobile = useIsMobile();
  // Traitement des données V2 si nécessaire
  const processedItem = useEdnItemV2Process(item);
  const finalItem = processedItem || item;
  
  // Check if user has notes for this item
  const { hasNote } = useEdnNotes();
  const hasNotes = hasNote(finalItem.item_code);

  const getItemNumber = (itemCode: string) => {
    return parseInt(itemCode.replace('IC-', '') || '0');
  };

  const getFeatures = () => {
    const features = [];
    // Utiliser les comptages réels OIC
    const rangACount = finalItem.competences_count_rang_a || 0;
    const rangBCount = finalItem.competences_count_rang_b || 0;
    
    if (rangACount > 0) features.push({ icon: BookOpen, text: `Rang A: ${rangACount}`, color: 'text-primary' });
    if (rangBCount > 0) features.push({ icon: BookOpen, text: `Rang B: ${rangBCount}`, color: 'text-accent' });
    if (finalItem.paroles_musicales && finalItem.paroles_musicales.length > 0) {
      features.push({ icon: Music, text: 'Musique', color: 'text-success' });
    }
    if (finalItem.scene_immersive) features.push({ icon: Users, text: 'Scène', color: 'text-warning' });
    if (finalItem.quiz_questions) features.push({ icon: Brain, text: 'Quiz', color: 'text-destructive' });
    if (finalItem.audio_ambiance) features.push({ icon: Volume2, text: 'Audio', color: 'text-primary' });
    return features;
  };

  const getCompletionColor = () => {
    if (completionPercentage === 100) return 'text-success';
    if (completionPercentage >= 80) return 'text-primary';
    if (completionPercentage >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getCompletionBadge = () => {
    if (completionPercentage === 100) {
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Complet
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className={`${getCompletionColor()} border-current`}>
        <AlertCircle className="h-3 w-3 mr-1" />
        {completionPercentage}%
      </Badge>
    );
  };

  const itemNumber = getItemNumber(finalItem.item_code);
  const features = getFeatures();

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-2 hover:border-accent/30 bg-background/80 backdrop-blur-sm overflow-hidden">
      {/* Header avec gradient */}
      <div className={`bg-gradient-to-r from-accent to-primary ${isMobile ? 'p-3' : 'p-4'} text-accent-foreground`}>
        <div className={`flex items-start justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
          <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-background/20 rounded-lg flex items-center justify-center`}>
              <span className={`text-accent-foreground font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{itemNumber}</span>
            </div>
            {!isMobile && (
              <Badge variant="secondary" className="bg-background/20 text-accent-foreground border-background/20">
                {finalItem.item_code}
              </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasNotes && (
            <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30 text-xs">
              <StickyNote className="h-3 w-3 mr-1" />
              Notes
            </Badge>
          )}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`h-8 w-8 ${isFavorite ? 'text-red-500' : 'text-accent-foreground/60'} hover:text-red-500`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          )}
          {getCompletionBadge()}
        </div>
        </div>
        
        <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} leading-tight text-accent-foreground group-hover:text-accent-foreground/80 transition-colors`}>
          {isMobile ? `${itemNumber}. ${finalItem.title.length > 40 ? finalItem.title.substring(0, 40) + '...' : finalItem.title}` : `${itemNumber}. ${finalItem.title}`}
        </CardTitle>
        
        {finalItem.subtitle && !isMobile && (
          <p className="text-accent-foreground/80 text-sm mt-2 line-clamp-2">
            {finalItem.subtitle}
          </p>
        )}
      </div>

      <CardContent className={`${isMobile ? 'p-3 space-y-3' : 'p-4 space-y-4'}`}>
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Complétude</span>
            <span className={`text-sm font-bold ${getCompletionColor()}`}>
              {completionPercentage}%
            </span>
          </div>
          <Progress 
            value={completionPercentage} 
            className="h-2"
          />
        </div>

        {/* Features Grid */}
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
          {features.slice(0, isMobile ? 4 : features.length).map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={`${item.id}-feature-${feature.text}-${index}`}
                className={`flex flex-col items-center ${isMobile ? 'p-1.5' : 'p-2'} bg-muted rounded-lg hover:bg-muted/80 transition-colors`}
              >
                <IconComponent className={`h-4 w-4 ${feature.color} mb-1`} />
                <span className="text-xs text-muted-foreground font-medium">{feature.text}</span>
              </div>
            );
          })}
        </div>

        {/* Badges de compétences - version simplifiée pour les cartes */}
        {!isMobile && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Compétences UNESS:</h4>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-primary border-primary/30">
                Rang A: {finalItem.competences_count_rang_a || 0}
              </Badge>
              <Badge variant="outline" className="text-accent border-accent/30">
                Rang B: {finalItem.competences_count_rang_b || 0}
              </Badge>
            </div>
          </div>
        )}

        {/* Action Buttons Premium Mobile */}
        <div className={`flex gap-2 pt-2 ${isMobile ? 'flex-col' : ''}`}>
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpen();
            }}
            className={`${isMobile ? 'w-full py-3' : 'flex-1'} bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-primary-foreground transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl`}
            type="button"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {isMobile ? '📖 Réviser cet item' : '📖 Réviser le contenu'}
          </Button>
          
          {isMobile ? (
            // Boutons secondaires sur mobile
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpen('music');
                }}
                className="flex-1 hover:bg-accent/10 hover:border-accent/30 transition-all duration-200 active:scale-95"
                type="button"
              >
                <Music className="h-4 w-4 mr-1" />
                🎵 Musique
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpen('quiz');
                }}
                className="flex-1 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 active:scale-95"
                type="button"
              >
                <Brain className="h-4 w-4 mr-1" />
                ✅ Quiz
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpen('music');
              }}
              className="px-3 hover:bg-accent/10 hover:border-accent/30 transition-all duration-200 active:scale-95"
              type="button"
              title="Écouter la musique mnémotechnique"
            >
              <Music className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};