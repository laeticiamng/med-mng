import React, { useMemo } from 'react';
import { BookOpen, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';

interface ContentTypeSelectorProps {
  contentType: string;
  onContentTypeChange: (type: string) => void;
  allEdnItems: any[];
  itemsLoading: boolean;
}

const contentTypes = [
  {
    value: 'edn',
    title: 'EDN',
    description: 'Items à Choix Multiples',
    icon: BookOpen,
    iconColor: 'text-primary',
    selectedRing: 'ring-warning shadow-warning/20',
    gradient: 'from-primary/10 to-primary/5'
  },
  {
    value: 'ecos',
    title: 'ECOS',
    description: 'Situations de départ',
    icon: Users,
    iconColor: 'text-success',
    selectedRing: 'ring-warning shadow-warning/20',
    gradient: 'from-success/10 to-success/5'
  }
];

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  contentType,
  onContentTypeChange,
  allEdnItems,
  itemsLoading
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-warning" />
          <TranslatedText text="Type de contenu" />
        </label>
        <Badge variant="outline" className="text-xs">
          <TranslatedText text="Étape 1" />
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = contentType === type.value;
          const itemCount = type.value === 'edn' ? allEdnItems.length : 3;
          
          return (
            <PremiumCard 
              key={type.value}
              variant={isSelected ? 'elevated' : 'default'}
              className={`cursor-pointer transition-all duration-300 p-4 md:p-6 text-center hover-scale relative overflow-hidden ${
                isSelected ? `ring-2 ${type.selectedRing}` : 'hover:shadow-lg hover:scale-[1.02]'
              }`}
              onClick={() => onContentTypeChange(type.value)}
            >
              {/* Fond gradient subtil */}
              <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-50`} />
              
              {/* Indicateur de sélection */}
              {isSelected && (
                <div className="absolute top-3 right-3 animate-scale-in">
                  <CheckCircle2 className="h-6 w-6 text-warning" />
                </div>
              )}
              
              <div className="relative z-10">
                <Icon className={`h-12 w-12 mx-auto mb-4 ${type.iconColor} ${isSelected ? 'animate-bounce' : ''}`} />
                <h3 className="text-xl font-bold text-foreground mb-2">{type.title}</h3>
                <p className="text-muted-foreground mb-3">{type.description}</p>
                <Badge 
                  variant={isSelected ? "default" : "secondary"} 
                  className={`text-sm font-semibold ${isSelected ? 'bg-success text-success-foreground' : ''}`}
                >
                  {type.value === 'edn' && itemsLoading ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                      Chargement...
                    </span>
                  ) : (
                    `${itemCount} ${type.value === 'edn' ? 'items' : 'situations'} disponibles`
                  )}
                </Badge>
              </div>
            </PremiumCard>
          );
        })}
      </div>
    </div>
  );
};