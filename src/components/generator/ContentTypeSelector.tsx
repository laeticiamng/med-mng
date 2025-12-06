import React from 'react';
import { BookOpen, Users } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { TranslatedText } from '@/components/TranslatedText';

interface ContentTypeSelectorProps {
  contentType: string;
  onContentTypeChange: (type: string) => void;
  allEdnItems: any[];
  itemsLoading: boolean;
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  contentType,
  onContentTypeChange,
  allEdnItems,
  itemsLoading
}) => {
  return (
    <div className="space-y-4">
      <label className="text-lg font-semibold text-foreground">
        <TranslatedText text="Type de contenu" />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <PremiumCard 
          variant={contentType === 'edn' ? 'elevated' : 'default'}
          className={`cursor-pointer transition-all p-4 md:p-6 text-center hover-scale ${contentType === 'edn' ? 'ring-2 ring-warning shadow-warning/20' : 'hover:shadow-lg'}`}
          onClick={() => onContentTypeChange('edn')}
        >
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold text-foreground mb-2">EDN</h3>
          <p className="text-muted-foreground mb-3">Items à Choix Multiples</p>
          <p className="text-sm text-success font-semibold">
            {itemsLoading ? 'Chargement...' : `${allEdnItems.length} items disponibles`}
          </p>
        </PremiumCard>
        
        <PremiumCard 
          variant={contentType === 'ecos' ? 'elevated' : 'default'}
          className={`cursor-pointer transition-all p-4 md:p-6 text-center hover-scale ${contentType === 'ecos' ? 'ring-2 ring-warning shadow-warning/20' : 'hover:shadow-lg'}`}
          onClick={() => onContentTypeChange('ecos')}
        >
          <Users className="h-12 w-12 mx-auto mb-4 text-success" />
          <h3 className="text-xl font-bold text-foreground mb-2">ECOS</h3>
          <p className="text-muted-foreground mb-3">Situations de départ</p>
          <p className="text-sm text-primary font-semibold">3 situations disponibles</p>
        </PremiumCard>
      </div>
    </div>
  );
};