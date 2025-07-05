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
      <label className="text-lg font-semibold text-gray-900">
        <TranslatedText text="Type de contenu" />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <PremiumCard 
          variant={contentType === 'edn' ? 'elevated' : 'default'}
          className={`cursor-pointer transition-all p-4 md:p-6 text-center hover-scale ${contentType === 'edn' ? 'ring-2 ring-amber-500 shadow-amber-500/20' : 'hover:shadow-lg'}`}
          onClick={() => onContentTypeChange('edn')}
        >
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">EDN</h3>
          <p className="text-gray-700 mb-3">Items à Choix Multiples</p>
          <p className="text-sm text-green-600 font-semibold">
            {itemsLoading ? 'Chargement...' : `${allEdnItems.length} items disponibles`}
          </p>
        </PremiumCard>
        
        <PremiumCard 
          variant={contentType === 'ecos' ? 'elevated' : 'default'}
          className={`cursor-pointer transition-all p-4 md:p-6 text-center hover-scale ${contentType === 'ecos' ? 'ring-2 ring-amber-500 shadow-amber-500/20' : 'hover:shadow-lg'}`}
          onClick={() => onContentTypeChange('ecos')}
        >
          <Users className="h-12 w-12 mx-auto mb-4 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">ECOS</h3>
          <p className="text-gray-700 mb-3">Situations de départ</p>
          <p className="text-sm text-blue-600 font-semibold">3 situations disponibles</p>
        </PremiumCard>
      </div>
    </div>
  );
};