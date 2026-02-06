import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Lightbulb, Layers } from 'lucide-react';

interface RangSelectorProps {
  selectedRang: 'A' | 'B' | 'A+B' | '';
  onRangChange: (rang: 'A' | 'B' | 'A+B') => void;
  disabled?: boolean;
}

export const RangSelector: React.FC<RangSelectorProps> = ({
  selectedRang,
  onRangChange,
  disabled = false,
}) => {
  const rangs = [
    {
      value: 'A' as const,
      title: 'Rang A',
      subtitle: 'Connaissances fondamentales',
      description: 'Notions essentielles à maîtriser parfaitement pour l\'examen',
      icon: Star,
      color: 'bg-primary',
      borderColor: 'border-primary',
    },
    {
      value: 'B' as const,
      title: 'Rang B',
      subtitle: 'Connaissances approfondies',
      description: 'Notions complémentaires pour une maîtrise complète',
      icon: Lightbulb,
      color: 'bg-accent',
      borderColor: 'border-accent',
    },
    {
      value: 'A+B' as const,
      title: 'Rang A+B',
      subtitle: 'Couverture complète',
      description: 'Combine les connaissances fondamentales et approfondies en une seule chanson',
      icon: Layers,
      color: 'bg-secondary',
      borderColor: 'border-secondary',
    },
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Sélectionnez le rang de connaissances
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rangs.map((rang) => {
          const Icon = rang.icon;
          const isSelected = selectedRang === rang.value;
          
          return (
            <Card
              key={rang.value}
              className={`cursor-pointer transition-all duration-200 ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
              } ${
                isSelected 
                  ? `ring-2 ${rang.borderColor} ${rang.color}/10` 
                  : 'hover:border-muted-foreground/30'
              }`}
              onClick={() => !disabled && onRangChange(rang.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${rang.color}/10`}>
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{rang.title}</h4>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{rang.subtitle}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {rang.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
