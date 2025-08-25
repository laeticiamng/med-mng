import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { EdnItemHeader } from '@/components/edn/item/EdnItemHeader';
import { EdnItemNavigation } from '@/components/edn/item/EdnItemNavigation';
import { EdnItemContent } from '@/components/edn/item/EdnItemContent';
import { useEdnItem } from '@/hooks/useEdnItem';
import { TranslatedText } from '@/components/TranslatedText';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { BookOpen } from 'lucide-react';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

const EdnItem = () => {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading } = useEdnItem(slug);
  const [activeSection, setActiveSection] = useState<SectionType>('tableau-a');

  if (loading) {
    return (
      <ConsistentBackground variant="secondary">
        <div className="min-h-screen flex items-center justify-center">        
          <div className="text-center relative z-10">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              <TranslatedText text="Chargement de l'item EDN" />
            </h2>
            <p className="text-muted-foreground text-lg">
              <TranslatedText text="Préparation du contenu pédagogique complet..." />
            </p>
          </div>
        </div>
      </ConsistentBackground>
    );
  }

  if (!item) {
    return (
      <ConsistentBackground variant="secondary">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center relative z-10">
            <h1 className="text-3xl font-bold text-foreground mb-6">
              <TranslatedText text="Item EDN non trouvé" />
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              <TranslatedText text="L'item demandé n'existe pas ou n'est pas disponible." />
            </p>
          </div>
        </div>
      </ConsistentBackground>
    );
  }

  return (
    <ConsistentBackground variant="secondary">
      <PageHeader
        title={item.title}
        subtitle={`Item EDN ${item.item_code} - Contenu pédagogique complet`}
        icon={BookOpen}
        badge={{
          text: item.item_code,
          variant: "outline"
        }}
        showBackButton
        backTo="/edn"
      />
      
      <div className="container mx-auto px-4 py-8">
        <EdnItemNavigation 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        {/* Content area with modern styling */}
        <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-2xl overflow-hidden">
          <div className="p-8">
            <EdnItemContent activeSection={activeSection} item={item} />
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default EdnItem;