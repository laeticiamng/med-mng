import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Star, Crown } from 'lucide-react';

interface RangSelectorProps {
  selectedRang: string;
  onRangChange: (rang: string) => void;
  disabled?: boolean;
}

const RANG_OPTIONS = [
  {
    value: 'A',
    title: 'Rang A',
    subtitle: 'Compétences fondamentales',
    description: 'Maîtrise des bases et des connaissances essentielles',
    icon: GraduationCap,
    color: 'bg-blue-500',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    value: 'B',
    title: 'Rang B',
    subtitle: 'Compétences approfondies',
    description: 'Expertise avancée et applications pratiques complexes',
    icon: Star,
    color: 'bg-purple-500',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  {
    value: 'AB',
    title: 'Rang A+B',
    subtitle: 'Compétences complètes',
    description: 'Maîtrise totale du domaine, de la base à l\'expertise',
    icon: Crown,
    color: 'bg-amber-500',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700'
  }
];

export const RangSelector: React.FC<RangSelectorProps> = ({
  selectedRang,
  onRangChange,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sélectionnez le niveau de compétence
        </h3>
        <p className="text-sm text-gray-600">
          Choisissez le rang qui correspond au niveau d'apprentissage souhaité
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {RANG_OPTIONS.map((rang) => (
          <Card
            key={rang.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedRang === rang.value 
                ? `${rang.borderColor} border-2 ${rang.bgColor} shadow-lg transform scale-105` 
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onRangChange(rang.value)}
          >
            <CardHeader className="text-center pb-3">
              <div className={`mx-auto w-12 h-12 rounded-full ${rang.color} flex items-center justify-center mb-3`}>
                <rang.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">{rang.title}</CardTitle>
              <Badge 
                variant="secondary" 
                className={selectedRang === rang.value ? rang.textColor : ''}
              >
                {rang.subtitle}
              </Badge>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <p className="text-sm text-gray-600 leading-relaxed">
                {rang.description}
              </p>
              
              {selectedRang === rang.value && (
                <div className="mt-3">
                  <Badge className={`${rang.color} text-white`}>
                    ✓ Sélectionné
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Indicateurs de progression */}
      <div className="flex items-center justify-center space-x-2 mt-6">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-gray-500">Étape 2/3</span>
        </div>
      </div>
    </div>
  );
};