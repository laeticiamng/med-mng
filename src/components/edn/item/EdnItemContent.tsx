import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

// Import des composants avancés de production
import { AdvancedSceneImmersive } from '../advanced/AdvancedSceneImmersive';
import { AdvancedGenerationMusicale } from '../advanced/AdvancedGenerationMusicale';
import { AdvancedBandeDessinee } from '../advanced/AdvancedBandeDessinee';
import { AdvancedQuizInteractif } from '../advanced/AdvancedQuizInteractif';
import { EnhancedTableauDisplay } from '../advanced/EnhancedTableauDisplay';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

interface EdnItemData {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  paroles_musicales?: string[];
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  scene_immersive?: any;
  quiz_questions?: any;
  competences_oic_rang_a?: any[];
  competences_oic_rang_b?: any[];
  created_at: string;
  updated_at: string;
}

interface EdnItemContentProps {
  activeSection: SectionType;
  item: EdnItemData;
}

export const EdnItemContent = ({ activeSection, item }: EdnItemContentProps) => {
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'tableau-a':
        return (
          <EnhancedTableauDisplay
            item={item}
            rang="A"
          />
        );
      
      case 'tableau-b':
        return (
          <EnhancedTableauDisplay
            item={item}
            rang="B"
          />
        );
      
      case 'scene':
        return <AdvancedSceneImmersive item={item} />;
      
      case 'bd':
        return <AdvancedBandeDessinee item={item} />;
      
      case 'music':
        return <AdvancedGenerationMusicale item={item} />;
      
      case 'quiz':
        return <AdvancedQuizInteractif item={item} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="mb-8">
      {renderActiveSection()}
    </div>
  );
};