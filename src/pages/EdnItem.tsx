
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Music, Palette, BookOpen, Play } from 'lucide-react';
import { BandeDessinee } from '@/components/edn/BandeDessinee';
import { TableauRangA } from '@/components/edn/TableauRangA';
import { TableauRangB } from '@/components/edn/TableauRangB';
import { SceneImmersive } from '@/components/edn/SceneImmersive';
import { ParolesMusicales } from '@/components/edn/ParolesMusicales';
import { QuizFinal } from '@/components/edn/QuizFinal';
import { TranslatedText } from '@/components/TranslatedText';

interface EdnItemData {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  content: any;
  paroles_musicales?: string[];
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  scene_immersive?: any;
  quiz_questions?: any;
  created_at: string;
  updated_at: string;
}

const EdnItem = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<EdnItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz'>('tableau-a');

  useEffect(() => {
    const fetchItem = async () => {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Erreur lors du chargement de l\'item:', error);
          return;
        }

        if (data) {
          setItem(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug]);

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

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'tableau-a':
        return item.tableau_rang_a ? (
          <TableauRangA data={item.tableau_rang_a} />
        ) : (
          <div className="text-center py-8">
            <TranslatedText text="Tableau Rang A en cours de développement" />
          </div>
        );
      
      case 'tableau-b':
        return item.tableau_rang_b ? (
          <TableauRangB data={item.tableau_rang_b} />
        ) : (
          <div className="text-center py-8">
            <TranslatedText text="Tableau Rang B en cours de développement" />
          </div>
        );
      
      case 'scene':
        return item.scene_immersive ? (
          <SceneImmersive data={item.scene_immersive} />
        ) : (
          <div className="text-center py-8">
            <TranslatedText text="Scène immersive en cours de développement" />
          </div>
        );
      
      case 'bd':
        return <BandeDessinee itemData={item} />;
      
      case 'music':
        return (
          <ParolesMusicales 
            paroles={item.paroles_musicales || []} 
            itemCode={item.item_code}
            itemTitle={item.title}
          />
        );
      
      case 'quiz':
        return item.quiz_questions ? (
          <QuizFinal questions={item.quiz_questions} />
        ) : (
          <div className="text-center py-8">
            <TranslatedText text="Quiz en cours de développement" />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/edn" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <TranslatedText text="Retour aux items EDN" />
          </Link>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-amber-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="outline" className="mb-2 text-amber-700 border-amber-300">
                  {item.item_code}
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  <TranslatedText text={item.title} />
                </h1>
                {item.subtitle && (
                  <p className="text-lg text-gray-600">
                    <TranslatedText text={item.subtitle} />
                  </p>
                )}
              </div>
              <Link
                to={`/edn/immersive/${item.slug}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                <Play className="h-4 w-4" />
                <TranslatedText text="Mode Immersif" />
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeSection === 'tableau-a' ? 'default' : 'outline'}
                onClick={() => setActiveSection('tableau-a')}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <TranslatedText text="Tableau Rang A" />
              </Button>
              
              <Button
                variant={activeSection === 'tableau-b' ? 'default' : 'outline'}
                onClick={() => setActiveSection('tableau-b')}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <TranslatedText text="Tableau Rang B" />
              </Button>
              
              <Button
                variant={activeSection === 'scene' ? 'default' : 'outline'}
                onClick={() => setActiveSection('scene')}
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                <TranslatedText text="Scène Immersive" />
              </Button>
              
              <Button
                variant={activeSection === 'bd' ? 'default' : 'outline'}
                onClick={() => setActiveSection('bd')}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <TranslatedText text="Bande Dessinée" />
              </Button>
              
              <Button
                variant={activeSection === 'music' ? 'default' : 'outline'}
                onClick={() => setActiveSection('music')}
                className="flex items-center gap-2"
              >
                <Music className="h-4 w-4" />
                <TranslatedText text="Génération Musicale" />
              </Button>
              
              <Button
                variant={activeSection === 'quiz' ? 'default' : 'outline'}
                onClick={() => setActiveSection('quiz')}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <TranslatedText text="Quiz Final" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default EdnItem;
