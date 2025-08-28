import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Target, Trophy } from 'lucide-react';

interface RangSelectorProps {
  selectedRang: string;
  onRangSelect: (rang: string) => void;
  disabled?: boolean;
}

const rangs = [
  {
    value: 'A',
    label: 'Rang A',
    description: 'Compétences fondamentales',
    icon: Star,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    selectedColor: 'bg-blue-100 border-blue-500 ring-2 ring-blue-200',
    badgeColor: 'bg-blue-500'
  },
  {
    value: 'B',
    label: 'Rang B',
    description: 'Compétences approfondies',
    icon: Target,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    selectedColor: 'bg-purple-100 border-purple-500 ring-2 ring-purple-200',
    badgeColor: 'bg-purple-500'
  },
  {
    value: 'AB',
    label: 'Rang A+B',
    description: 'Compétences complètes',
    icon: Trophy,
    color: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    selectedColor: 'bg-amber-100 border-amber-500 ring-2 ring-amber-200',
    badgeColor: 'bg-amber-500'
  }
];

export const RangSelector: React.FC<RangSelectorProps> = ({
  selectedRang,
  onRangSelect,
  disabled = false
}) => {
  return (
    <Card className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      <CardHeader>
        <CardTitle>2. Choisissez le rang de compétence</CardTitle>
        <CardDescription>
          Sélectionnez le niveau de compétence pour adapter le contenu musical
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rangs.map((rang) => {
            const IconComponent = rang.icon;
            const isSelected = selectedRang === rang.value;
            
            return (
              <div
                key={rang.value}
                className={`
                  relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
                  ${isSelected ? rang.selectedColor : rang.color}
                  ${disabled ? 'cursor-not-allowed' : ''}
                `}
                onClick={() => !disabled && onRangSelect(rang.value)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${rang.badgeColor} text-white`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{rang.label}</h3>
                      {isSelected && (
                        <Badge variant="secondary" className="text-xs">
                          Sélectionné
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{rang.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};