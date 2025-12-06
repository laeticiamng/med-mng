
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
    return isRangB ? 'text-accent' : 'text-warning';
  };

  const getBadgeColor = () => {
    return isRangB ? 'bg-accent/10 text-accent border-accent/30' : 'bg-warning/10 text-warning border-warning/30';
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex items-center justify-center gap-3">
        {getRangIcon()}
        <h2 className={`text-3xl font-serif ${getRangColor()}`}>
          {theme}
        </h2>
        {isRangB ? <Star className="h-6 w-6 text-accent" /> : <BookOpen className="h-6 w-6 text-warning" />}
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
      
      <div className={`text-sm ${isRangB ? 'text-accent' : 'text-warning'} font-medium`}>
        {isRangB 
          ? '🎯 Expertise approfondie et maîtrise complète des enjeux'
          : '📚 Connaissances essentielles pour la pratique médicale'
        }
      </div>
    </div>
  );
};
