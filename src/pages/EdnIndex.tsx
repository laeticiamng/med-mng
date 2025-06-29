
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Music, Sparkles, Clock, Users, Target } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  created_at: string;
}

const EdnIndex = () => {
  const [items, setItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('id, item_code, title, subtitle, slug, created_at')
          .order('item_code', { ascending: true });

        if (error) {
          console.error('Erreur lors du chargement des items:', error);
          return;
        }

        if (data) {
          setItems(data);
        }
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
            <TranslatedText text="Chargement des items EDN..." />
          </div>
          <p className="text-amber-600">
            <TranslatedText text="Préparation de votre expérience d'apprentissage" />
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <TranslatedText text="Items EDN - Apprentissage Immersif" />
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            <TranslatedText text="Découvrez une nouvelle façon d'apprendre avec nos expériences immersives" />
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <Sparkles className="h-8 w-8 text-amber-600 mb-2" />
              <CardTitle className="text-amber-800">
                <TranslatedText text="Expérience Immersive" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                <TranslatedText text="Plongez dans des scénarios réalistes et interactifs" />
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <Music className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-blue-800">
                <TranslatedText text="Génération Musicale" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                <TranslatedText text="Créez vos propres chansons pédagogiques" />
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <Target className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-green-800">
                <TranslatedText text="Apprentissage Ciblé" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                <TranslatedText text="Contenu adapté aux objectifs EDN officiels" />
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Items Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="bg-white/90 backdrop-blur-sm border-amber-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    {item.item_code}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      <TranslatedText text="~30 min" />
                    </span>
                  </div>
                </div>
                <CardTitle className="text-xl text-gray-900">
                  <TranslatedText text={item.title} />
                </CardTitle>
                {item.subtitle && (
                  <CardDescription className="text-gray-600">
                    <TranslatedText text={item.subtitle} />
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span><TranslatedText text="Expérience interactive" /></span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      to={`/edn/item/${item.slug}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <TranslatedText text="Explorer" />
                      </Button>
                    </Link>
                    
                    <Link 
                      to={`/edn/immersive/${item.slug}`}
                      className="flex-1"
                    >
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        <TranslatedText text="Mode Immersif" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {items.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              <TranslatedText text="Aucun item EDN disponible" />
            </h3>
            <p className="text-gray-500">
              <TranslatedText text="Les contenus sont en cours de préparation" />
            </p>
          </div>
        )}

        {/* Quick Access to Music Library */}
        <div className="mt-12 text-center">
          <Link to="/edn/music-library">
            <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-amber-300 hover:bg-amber-50">
              <Music className="h-4 w-4 mr-2" />
              <TranslatedText text="Ma Bibliothèque Musicale" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EdnIndex;
