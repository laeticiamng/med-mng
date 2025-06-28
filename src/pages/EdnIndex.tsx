
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Music, Play, Palette, Brain, Users } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  subtitle: string;
  slug: string;
  created_at: string;
}

const EdnIndex = () => {
  const [items, setItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('id, item_code, title, subtitle, slug, created_at')
          .order('item_code');

        if (error) {
          console.error('Erreur lors du chargement des items:', error);
          return;
        }

        setItems(data || []);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl text-amber-800 mb-2">
            <TranslatedText text="Chargement des contenus pédagogiques..." />
          </div>
          <p className="text-amber-600">
            <TranslatedText text="Préparation de l'expérience d'apprentissage" />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-amber-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <TranslatedText text="Épreuves Dossier Numérique (EDN)" />
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              <TranslatedText text="Expérience d'apprentissage immersive et interactive" />
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full">
                <BookOpen className="h-5 w-5 text-amber-600" />
                <span className="text-amber-800 font-medium">
                  <TranslatedText text="Contenus Pédagogiques" />
                </span>
              </div>
              <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                <Music className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  <TranslatedText text="Génération Musicale" />
                </span>
              </div>
              <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
                <Palette className="h-5 w-5 text-purple-600" />
                <span className="text-purple-800 font-medium">
                  <TranslatedText text="Expérience Immersive" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-amber-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <TranslatedText text="Accès Rapide" />
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/edn/music-library">
                <Button className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                  <Music className="h-4 w-4" />
                  <TranslatedText text="Ma Bibliothèque Musicale" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-amber-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="mb-2 text-amber-700 border-amber-300">
                    {item.item_code}
                  </Badge>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/edn/immersive/${item.slug}`}
                      className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full hover:from-amber-600 hover:to-orange-600 transition-all"
                    >
                      <Play className="h-3 w-3" />
                      <TranslatedText text="Immersif" />
                    </Link>
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">
                  <TranslatedText text={item.title} />
                </CardTitle>
                {item.subtitle && (
                  <p className="text-sm text-gray-600 mt-1">
                    <TranslatedText text={item.subtitle} />
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    <BookOpen className="h-3 w-3" />
                    <TranslatedText text="Tableaux" />
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                    <Music className="h-3 w-3" />
                    <TranslatedText text="Musique" />
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                    <Palette className="h-3 w-3" />
                    <TranslatedText text="Scène" />
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                    <Brain className="h-3 w-3" />
                    <TranslatedText text="Quiz" />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link to={`/edn/${item.slug}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <TranslatedText text="Explorer" />
                    </Button>
                  </Link>
                  <Link to={`/edn/immersive/${item.slug}`}>
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                      <Play className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              <TranslatedText text="Aucun contenu disponible" />
            </h3>
            <p className="text-gray-600">
              <TranslatedText text="Les contenus pédagogiques seront bientôt disponibles." />
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EdnIndex;
