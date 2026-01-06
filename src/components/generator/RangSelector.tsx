import React from 'react';
import { PremiumCard } from '@/components/ui/premium-card';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Star, Zap, Crown } from 'lucide-react';

interface RangSelectorProps {
  selectedRang: string;
  setSelectedRang: (rang: string) => void;
  lyricsAvailability?: {
    hasA: boolean;
    hasB: boolean;
    hasAB: boolean;
  };
}

const rangConfig = [
  {
    value: 'A',
    title: 'Rang A',
    subtitle: 'Essentiel',
    description: 'Notions fondamentales - incontournables pour l\'examen',
    tip: '80% des questions de l\'examen',
    icon: Star,
    colorClass: 'ring-primary shadow-primary/20',
    iconColor: 'text-primary',
    badgeVariant: 'default' as const
  },
  {
    value: 'B',
    title: 'Rang B',
    subtitle: 'Approfondissement',
    description: 'Connaissances avancées pour différencier les meilleurs',
    tip: 'Pour viser l\'excellence',
    icon: Zap,
    colorClass: 'ring-accent shadow-accent/20',
    iconColor: 'text-accent',
    badgeVariant: 'secondary' as const
  },
  {
    value: 'AB',
    title: 'Rang A+B',
    subtitle: 'Complet',
    description: 'Maîtrise totale - combine A et B pour une préparation optimale',
    tip: 'Recommandé pour révisions finales',
    icon: Crown,
    colorClass: 'ring-warning shadow-warning/20',
    iconColor: 'text-warning',
    badgeVariant: 'outline' as const
  }
];

export const RangSelector: React.FC<RangSelectorProps> = ({
  selectedRang,
  setSelectedRang,
  lyricsAvailability
}) => {
  const isAvailable = (rang: string) => {
    if (!lyricsAvailability) return true;
    switch (rang) {
      case 'A': return lyricsAvailability.hasA;
      case 'B': return lyricsAvailability.hasB;
      case 'AB': return lyricsAvailability.hasAB;
      default: return true;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold text-foreground">
          <TranslatedText text="Rang" />
        </label>
        <Badge variant="outline" className="text-xs">
          <TranslatedText text="Sélectionnez le niveau" />
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {rangConfig.map((rang) => {
          const Icon = rang.icon;
          const available = isAvailable(rang.value);
          const isSelected = selectedRang === rang.value;
          
          return (
            <PremiumCard 
              key={rang.value}
              variant={isSelected ? 'elevated' : 'default'}
              className={`cursor-pointer transition-all duration-300 p-4 text-center hover-scale relative overflow-hidden ${
                isSelected ? `ring-2 ${rang.colorClass}` : 'hover:shadow-lg'
              } ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => available && setSelectedRang(rang.value)}
            >
              {/* Indicateur de sélection */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className={`h-5 w-5 ${rang.iconColor}`} />
                </div>
              )}
              
              <Icon className={`h-8 w-8 mx-auto mb-2 ${rang.iconColor} ${isSelected ? 'animate-pulse' : ''}`} />
              <h3 className="text-xl font-bold text-foreground mb-0.5">{rang.title}</h3>
              <p className="text-xs font-medium text-primary mb-1">{rang.subtitle}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">{rang.description}</p>
              <p className="text-xs text-primary/80 mt-1 font-medium">💡 {rang.tip}</p>
              
              {/* Badge disponibilité */}
              {lyricsAvailability && (
                <Badge 
                  variant={available ? rang.badgeVariant : "secondary"} 
                  className={`mt-2 text-xs ${!available ? 'bg-muted text-muted-foreground' : ''}`}
                >
                  {available ? '✓ Paroles disponibles' : '✗ Non disponible'}
                </Badge>
              )}
            </PremiumCard>
          );
        })}
      </div>
    </div>
  );
};