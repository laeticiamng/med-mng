
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEdnItem } from '@/hooks/useEdnItem';
import { EdnItemHeader } from '@/components/edn/item/EdnItemHeader';
import { EdnItemNavigation } from '@/components/edn/item/EdnItemNavigation';
import { EdnItemContent } from '@/components/edn/item/EdnItemContent';
import { TranslatedText } from '@/components/TranslatedText';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

const EdnItem = () => {
  const { slug } = useParams();
  const { item, loading } = useEdnItem(slug);
  const [activeSection, setActiveSection] = useState<SectionType>('tableau-a');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl text-amber-800 mb-2">
            <TranslatedText text="Chargement du contenu pédagogique..." />
          </div>
          <p className="text-amber-600">
            <TranslatedText text="Préparation de l'expérience d'apprentissage" />
          </p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-800 mb-4">
            <TranslatedText text="Item non trouvé" />
          </h1>
          <Link to="/edn" className="text-blue-600 hover:text-blue-800">
            <TranslatedText text="Retour à la liste des items EDN" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <EdnItemHeader item={item} />
        <EdnItemNavigation 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <EdnItemContent 
          activeSection={activeSection}
          item={item}
        />
      </div>
    </div>
  );
};

export default EdnItem;
