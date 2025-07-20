
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Award, Star } from 'lucide-react';

interface TableauRangAHeaderProps {
  theme: string;
  itemCode: string;
  totalCompetences: number;
  isRangB?: boolean;
}

export const TableauRangAHeader: React.FC<TableauRangAHeaderProps> = ({
  theme,
  itemCode,
  totalCompetences,
  isRangB = false
}) => {
  const getRangIcon = () => {
    return isRangB ? <Award className="h-6 w-6" /> : <Target className="h-6 w-6" />;
  };

  const getRangColor = () => {
    return isRangB ? 'text-purple-700' : 'text-amber-700';
  };

  const getBadgeColor = () => {
    return isRangB ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-amber-100 text-amber-700 border-amber-300';
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex items-center justify-center gap-3">
        {getRangIcon()}
        <h2 className={`text-3xl font-serif ${getRangColor()}`}>
          {theme}
        </h2>
        {isRangB ? <Star className="h-6 w-6 text-purple-600" /> : <BookOpen className="h-6 w-6 text-amber-600" />}
      </div>
      
      <div className="flex flex-wrap justify-center gap-3">
        <Badge variant="outline" className={getBadgeColor()}>
          {itemCode}
        </Badge>
        <Badge variant="outline" className={getBadgeColor()}>
          {totalCompetences} {isRangB ? 'concepts experts' : 'concepts fondamentaux'}
        </Badge>
        <Badge variant="outline" className={getBadgeColor()}>
          {isRangB ? 'Niveau Expert' : 'Niveau Fondamental'}
        </Badge>
      </div>
      
      <div className={`text-sm ${isRangB ? 'text-purple-600' : 'text-amber-600'} font-medium`}>
        {isRangB 
          ? '🎯 Expertise approfondie et maîtrise complète des enjeux'
          : '📚 Connaissances essentielles pour la pratique médicale'
        }
      </div>
    </div>
  );
};
