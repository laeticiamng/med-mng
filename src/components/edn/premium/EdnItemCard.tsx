import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, Music, Users, Brain, Play, Headphones, 
  Image, FileText, Volume2, Gamepad2, Maximize2,
  Star, CheckCircle, AlertCircle
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { CompetencesBadges } from "@/components/edn/CompetencesBadges";
import { useEdnItemV2Process } from "@/hooks/useEdnItemV2Process";

interface EdnItemCardProps {
  item: {
    id: string;
    item_code: string;
    title: string;
    subtitle?: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
    paroles_musicales?: string[];
    scene_immersive?: any;
    quiz_questions?: any;
    audio_ambiance?: any;
    visual_ambiance?: any;
  };
  completionPercentage: number;
  onOpen: () => void;
}

export const EdnItemCard: React.FC<EdnItemCardProps> = ({
  item,
  completionPercentage,
  onOpen
}) => {
  const isMobile = useIsMobile();
  // Traitement des données V2 si nécessaire
  const processedItem = useEdnItemV2Process(item);
  const finalItem = processedItem || item;

  const getItemNumber = (itemCode: string) => {
    return parseInt(itemCode.replace('IC-', '') || '0');
  };

  const getFeatures = () => {
    const features = [];
    if (finalItem.tableau_rang_a) features.push({ icon: BookOpen, text: 'Rang A', color: 'text-blue-600' });
    if (finalItem.tableau_rang_b) features.push({ icon: BookOpen, text: 'Rang B', color: 'text-purple-600' });
    if (finalItem.paroles_musicales && finalItem.paroles_musicales.length > 0) {
      features.push({ icon: Music, text: 'Musique', color: 'text-green-600' });
    }
    if (finalItem.scene_immersive) features.push({ icon: Users, text: 'Scène', color: 'text-orange-600' });
    if (finalItem.quiz_questions) features.push({ icon: Brain, text: 'Quiz', color: 'text-red-600' });
    if (finalItem.audio_ambiance) features.push({ icon: Volume2, text: 'Audio', color: 'text-indigo-600' });
    return features;
  };

  const getCompletionColor = () => {
    if (completionPercentage === 100) return 'text-green-600';
    if (completionPercentage >= 80) return 'text-blue-600';
    if (completionPercentage >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getCompletionBadge = () => {
    if (completionPercentage === 100) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
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
    <Card className="group hover:shadow-2xl transition-all duration-500 border-2 hover:border-purple-300/50 bg-white/80 backdrop-blur-sm overflow-hidden">
      {/* Header avec gradient */}
      <div className={`bg-gradient-to-r from-purple-500 to-indigo-500 ${isMobile ? 'p-3' : 'p-4'} text-white`}>
        <div className={`flex items-start justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
          <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-white/20 rounded-lg flex items-center justify-center`}>
              <span className={`text-white font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{itemNumber}</span>
            </div>
            {!isMobile && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                {finalItem.item_code}
              </Badge>
            )}
          </div>
          {getCompletionBadge()}
        </div>
        
        <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} leading-tight text-white group-hover:text-purple-100 transition-colors`}>
          {isMobile ? `${itemNumber}. ${finalItem.title.length > 40 ? finalItem.title.substring(0, 40) + '...' : finalItem.title}` : `${itemNumber}. ${finalItem.title}`}
        </CardTitle>
        
        {finalItem.subtitle && !isMobile && (
          <p className="text-purple-100 text-sm mt-2 line-clamp-2">
            {finalItem.subtitle}
          </p>
        )}
      </div>

      <CardContent className={`${isMobile ? 'p-3 space-y-3' : 'p-4 space-y-4'}`}>
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Complétude</span>
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
                key={index} 
                className={`flex flex-col items-center ${isMobile ? 'p-1.5' : 'p-2'} bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors`}
              >
                <IconComponent className={`h-4 w-4 ${feature.color} mb-1`} />
                <span className="text-xs text-gray-600 font-medium">{feature.text}</span>
              </div>
            );
          })}
        </div>

        {/* Badges de compétences */}
        {!isMobile && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800">Compétences UNESS:</h4>
            <CompetencesBadges item={finalItem} />
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
            className={`${isMobile ? 'w-full py-3' : 'flex-1'} bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl`}
            type="button"
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            {isMobile ? 'Explorer le contenu' : 'Mode Immersif'}
          </Button>
          
          {isMobile ? (
            // Boutons secondaires sur mobile
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 active:scale-95"
                type="button"
              >
                <Play className="h-4 w-4 mr-1" />
                Lire
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 hover:bg-green-50 hover:border-green-300 transition-all duration-200 active:scale-95"
                type="button"
              >
                <Star className="h-4 w-4 mr-1" />
                Favoris
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              className="px-3 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 active:scale-95"
              type="button"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};