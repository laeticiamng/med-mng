import React from 'react';
import { PremiumCard } from '@/components/ui/premium-card';
import { TranslatedText } from '@/components/TranslatedText';

interface RangSelectorProps {
  selectedRang: string;
  setSelectedRang: (rang: string) => void;
}

export const RangSelector: React.FC<RangSelectorProps> = ({
  selectedRang,
  setSelectedRang
}) => {
  return (
    <div className="space-y-4">
      <label className="text-lg font-semibold text-foreground">
        <TranslatedText text="Rang" />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <PremiumCard 
          variant={selectedRang === 'A' ? 'elevated' : 'default'}
          className={`cursor-pointer transition-all p-4 text-center hover-scale ${selectedRang === 'A' ? 'ring-2 ring-primary shadow-primary/20' : 'hover:shadow-lg'}`}
          onClick={() => setSelectedRang('A')}
        >
          <h3 className="text-xl font-bold text-foreground mb-2">Rang A</h3>
          <p className="text-muted-foreground text-sm">Compétences fondamentales</p>
        </PremiumCard>
        
        <PremiumCard 
          variant={selectedRang === 'B' ? 'elevated' : 'default'}
          className={`cursor-pointer transition-all p-4 text-center hover-scale ${selectedRang === 'B' ? 'ring-2 ring-accent shadow-accent/20' : 'hover:shadow-lg'}`}
          onClick={() => setSelectedRang('B')}
        >
          <h3 className="text-xl font-bold text-foreground mb-2">Rang B</h3>
          <p className="text-muted-foreground text-sm">Compétences approfondies</p>
        </PremiumCard>
        
        <PremiumCard 
          variant={selectedRang === 'AB' ? 'elevated' : 'default'}
          className={`cursor-pointer transition-all p-4 text-center hover-scale ${selectedRang === 'AB' ? 'ring-2 ring-warning shadow-warning/20' : 'hover:shadow-lg'}`}
          onClick={() => setSelectedRang('AB')}
        >
          <h3 className="text-xl font-bold text-foreground mb-2">Rang A+B</h3>
          <p className="text-muted-foreground text-sm">Compétences complètes</p>
        </PremiumCard>
      </div>
    </div>
  );
};