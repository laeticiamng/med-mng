import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, AlertCircle, XCircle, Clock, 
  BookOpen, Brain, Music, Users, Gamepad2 
} from 'lucide-react';

interface CompetencesBadgesProps {
  item: {
    tableau_rang_a?: any;
    tableau_rang_b?: any;
    paroles_musicales?: string[];
    scene_immersive?: any;
    quiz_questions?: any;
  };
}

export const CompetencesBadges: React.FC<CompetencesBadgesProps> = ({ item }) => {
  
  const getCompetencesCount = (rang: 'A' | 'B') => {
    const tableau = rang === 'A' ? item.tableau_rang_a : item.tableau_rang_b;
    if (!tableau) return 0;
    
    if (tableau.sections) {
      return tableau.sections.reduce((total: number, section: any) => {
        return total + (section.concepts?.length || 0);
      }, 0);
    }
    
    return 0;
  };

  const rangACount = getCompetencesCount('A');
  const rangBCount = getCompetencesCount('B');
  
  const features = [
    {
      id: 'rang-a',
      label: 'Rang A',
      icon: BookOpen,
      available: !!item.tableau_rang_a,
      count: rangACount,
      description: 'Compétences fondamentales',
      color: rangACount > 0 ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-gray-400 bg-gray-50 border-gray-200'
    },
    {
      id: 'rang-b',
      label: 'Rang B',
      icon: Brain,
      available: !!item.tableau_rang_b,
      count: rangBCount,
      description: 'Compétences expertes',
      color: rangBCount > 0 ? 'text-purple-600 bg-purple-50 border-purple-200' : 'text-gray-400 bg-gray-50 border-gray-200'
    },
    {
      id: 'music',
      label: 'Musique',
      icon: Music,
      available: !!(item.paroles_musicales && item.paroles_musicales.length > 0),
      count: item.paroles_musicales?.length || 0,
      description: 'Chansons d\'apprentissage',
      color: item.paroles_musicales?.length > 0 ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-400 bg-gray-50 border-gray-200'
    },
    {
      id: 'scene',
      label: 'Scène',
      icon: Users,
      available: !!item.scene_immersive,
      count: item.scene_immersive ? 1 : 0,
      description: 'Expérience immersive',
      color: item.scene_immersive ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-gray-400 bg-gray-50 border-gray-200'
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: Gamepad2,
      available: !!item.quiz_questions,
      count: Array.isArray(item.quiz_questions) ? item.quiz_questions.length : (item.quiz_questions ? 1 : 0),
      description: 'Questions interactives',
      color: item.quiz_questions ? 'text-red-600 bg-red-50 border-red-200' : 'text-gray-400 bg-gray-50 border-gray-200'
    }
  ];

  const getStatusIcon = (available: boolean) => {
    if (available) {
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    } else {
      return <XCircle className="h-3 w-3 text-gray-400" />;
    }
  };

  const calculateGlobalCompletion = () => {
    const availableFeatures = features.filter(f => f.available).length;
    const totalFeatures = features.length;
    return Math.round((availableFeatures / totalFeatures) * 100);
  };

  const globalCompletion = calculateGlobalCompletion();
  const isComplete = globalCompletion === 100;

  return (
    <div className="space-y-4">
      {/* Badge de statut global */}
      <div className="flex items-center justify-center">
        {isComplete ? (
          <Badge className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
            <CheckCircle className="h-4 w-4 mr-1" />
            Item Complet 100%
          </Badge>
        ) : (
          <Badge variant="outline" className="text-orange-600 border-orange-300 px-3 py-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {globalCompletion}% Complété
          </Badge>
        )}
      </div>

      {/* Badges détaillés par fonctionnalité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <div key={feature.id} className="space-y-1">
              <Badge 
                variant="outline" 
                className={`w-full flex items-center justify-between p-2 ${feature.color}`}
              >
                <div className="flex items-center gap-1">
                  <IconComponent className="h-3 w-3" />
                  <span className="text-xs font-medium">{feature.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {feature.count > 0 && (
                    <span className="text-xs font-bold">{feature.count}</span>
                  )}
                  {getStatusIcon(feature.available)}
                </div>
              </Badge>
              <div className="text-xs text-gray-500 text-center px-1">
                {feature.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Détail des compétences par rang */}
      <div className="space-y-2">
        {rangACount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium">Compétences Rang A:</span>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              {rangACount} compétences fondamentales
            </Badge>
          </div>
        )}
        
        {rangBCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-700 font-medium">Compétences Rang B:</span>
            <Badge variant="outline" className="text-purple-700 border-purple-300">
              {rangBCount} compétences expertes
            </Badge>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm font-bold">
          <span className="text-gray-800">Total Compétences:</span>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            {rangACount + rangBCount} compétences UNESS
          </Badge>
        </div>
      </div>

      {/* Alerte si compétences manquantes */}
      {!isComplete && (
        <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-orange-700">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">
              Contenu en cours de finalisation
            </span>
          </div>
        </div>
      )}
    </div>
  );
};