import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { EdnItemHeader } from '@/components/edn/item/EdnItemHeader';
import { EdnItemNavigation } from '@/components/edn/item/EdnItemNavigation';
import { EdnItemContent } from '@/components/edn/item/EdnItemContent';
import { useEdnItem } from '@/hooks/useEdnItem';
import { TranslatedText } from '@/components/TranslatedText';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

const EdnItem = () => {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading } = useEdnItem(slug);
  const [activeSection, setActiveSection] = useState<SectionType>('tableau-a');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95 flex items-center justify-center relative">
        {/* Suno-style aura effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-3">
            <TranslatedText text="Chargement de l'item EDN" />
          </h2>
          <p className="text-gray-300 text-lg">
            <TranslatedText text="Préparation du contenu pédagogique complet..." />
          </p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95 flex items-center justify-center relative">
        {/* Suno-style aura effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <h1 className="text-3xl font-bold text-white mb-6">
            <TranslatedText text="Item EDN non trouvé" />
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            <TranslatedText text="L'item demandé n'existe pas ou n'est pas disponible." />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95 relative">
      {/* Suno-style aura effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <EdnItemHeader item={item} />
        <EdnItemNavigation 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        {/* Content area with modern styling */}
        <div className="bg-black/10 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-8">
            <EdnItemContent activeSection={activeSection} item={item} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdnItem;