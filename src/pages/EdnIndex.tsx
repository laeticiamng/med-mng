
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Sparkles, Play, Music } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

const EdnIndex = () => {
  const [items, setItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('id, item_code, title, subtitle, slug, created_at, updated_at')
          .order('item_code');

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

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-pulse text-2xl text-white mb-2">
              <TranslatedText text="Chargement des items EDN..." />
            </div>
            <p className="text-emerald-300">
              <TranslatedText text="Préparation du contenu pédagogique" />
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Link to="/" className="inline-block mb-8 text-white hover:text-emerald-300 transition-colors">
              ← <TranslatedText text="Retour à l'accueil" />
            </Link>
            
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <BookOpen className="h-12 w-12 text-emerald-400" />
                <TranslatedText text="Items EDN" />
              </h1>
              <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
                <TranslatedText text="Explorez les items de l'Examen National Dématérialisé avec des contenus pédagogiques interactifs, des tableaux de connaissances, et des expériences d'apprentissage immersives." />
              </p>
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher un item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{filteredItems.length}</div>
                  <div className="text-emerald-200 text-sm">
                    <TranslatedText text="Items disponibles" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <Music className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    <TranslatedText text="Musique" />
                  </div>
                  <div className="text-emerald-200 text-sm">
                    <TranslatedText text="Génération musicale" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <Play className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    <TranslatedText text="Immersif" />
                  </div>
                  <div className="text-emerald-200 text-sm">
                    <TranslatedText text="Expérience interactive" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-emerald-300 border-emerald-300 bg-emerald-900/30">
                      {item.item_code}
                    </Badge>
                    <div className="flex gap-2">
                      <Link
                        to={`/edn/${item.slug}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/20">
                          <BookOpen className="h-3 w-3 mr-1" />
                          <TranslatedText text="Étudier" />
                        </Button>
                      </Link>
                      <Link
                        to={`/edn/immersive/${item.slug}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                          <Play className="h-3 w-3 mr-1" />
                          <TranslatedText text="Immersif" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <CardTitle className="text-white group-hover:text-emerald-200 transition-colors">
                    <TranslatedText text={item.title} />
                  </CardTitle>
                  {item.subtitle && (
                    <CardDescription className="text-emerald-200">
                      <TranslatedText text={item.subtitle} />
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Link to={`/edn/${item.slug}`}>
                        <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/20">
                          <BookOpen className="h-4 w-4 mr-2" />
                          <TranslatedText text="Consulter l'item" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <p className="text-white text-lg">
                <TranslatedText text="Aucun item trouvé pour" /> "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EdnIndex;
