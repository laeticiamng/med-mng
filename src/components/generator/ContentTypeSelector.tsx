import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { PremiumCard } from '@/components/ui/premium-card';
import { BookOpen, CheckCircle2, Sparkles, Users } from 'lucide-react';
import React from 'react';

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
    subtitle: 'Connaissances théoriques',
    description: '367 items pour les ECNi',
    icon: BookOpen,
    iconColor: 'text-primary',
    selectedRing: 'ring-warning shadow-warning/20',
    gradient: 'from-primary/10 to-primary/5'
  },
  {
    value: 'ecos',
    title: 'ECOS',
    subtitle: 'Pratique clinique',
    description: 'Scénarios de situations cliniques',
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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
          <TranslatedText text="Type de contenu" />
        </label>
        <Badge variant="outline" className="text-xs">
          <TranslatedText text="Étape 1" />
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = contentType === type.value;
          const itemCount = type.value === 'edn' ? allEdnItems.length : 3;
          
          return (
            <PremiumCard 
              key={type.value}
              variant={isSelected ? 'elevated' : 'default'}
              className={`cursor-pointer transition-all duration-300 p-3 sm:p-4 md:p-6 text-center hover-scale relative overflow-hidden min-h-[120px] sm:min-h-[160px] ${
                isSelected ? `ring-2 ${type.selectedRing}` : 'hover:shadow-lg hover:scale-[1.02]'
              }`}
              onClick={() => onContentTypeChange(type.value)}
            >
              {/* Fond gradient subtil */}
              <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-50`} />
              
              {/* Indicateur de sélection */}
              {isSelected && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 animate-scale-in">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
                </div>
              )}
              
              <div className="relative z-10">
                <Icon className={`h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 ${type.iconColor} ${isSelected ? 'animate-bounce' : ''}`} />
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-0.5">{type.title}</h3>
                <p className="text-xs font-medium text-primary mb-1 hidden sm:block">{type.subtitle}</p>
                <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{type.description}</p>
                <Badge 
                  variant={isSelected ? "default" : "secondary"} 
                  className={`text-xs sm:text-sm font-semibold ${isSelected ? 'bg-success text-success-foreground' : ''}`}
                >
                  {type.value === 'edn' && itemsLoading ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                      <span className="hidden sm:inline">Chargement...</span>
                      <span className="sm:hidden">...</span>
                    </span>
                  ) : (
                    <>
                      <span className="hidden sm:inline">{itemCount} {type.value === 'edn' ? 'items' : 'situations'}</span>
                      <span className="sm:hidden">{itemCount}</span>
                    </>
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