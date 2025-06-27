
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Search, Sparkles, Play, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const EdnIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [immersiveItems, setImmersiveItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImmersiveItems = async () => {
      try {
        setLoading(true);
        console.log('Fetching immersive items...');
        
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching immersive items:', error);
          setError('Erreur lors du chargement des items');
          return;
        }

        console.log('Fetched items:', data);
        setImmersiveItems(data || []);
      } catch (error) {
        console.error('Error:', error);
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    fetchImmersiveItems();
  }, []);

  const filteredItems = immersiveItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 text-white hover:text-purple-300 transition-colors">
                <Brain className="h-8 w-8" />
                <span className="text-2xl font-bold">DocFlemme EDN</span>
              </Link>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-12">
          {/* Hero section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Items EDN
              </h1>
              <Sparkles className="h-6 w-6 text-blue-400 animate-pulse" />
            </div>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Explorez les 367 items de l'Examen National Dématérialisé dans une expérience immersive unique
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-16">
              <div className="animate-pulse text-xl text-white/60 mb-2">Chargement des items EDN...</div>
              <p className="text-white/40">Préparation de l'expérience immersive</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-16">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl text-red-400 mb-2">Erreur de chargement</h3>
              <p className="text-white/60">{error}</p>
            </div>
          )}

          {/* Expériences immersives */}
          {!loading && !error && (
            <>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item, index) => (
                    <Link
                      key={item.id}
                      to={`/edn/immersive/${item.slug}`}
                      className="group"
                    >
                      <div className="bg-gradient-to-br from-amber-100 to-blue-100 rounded-2xl p-6 border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in"
                           style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-blue-600 flex items-center justify-center text-white font-bold">
                              <Play className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="text-amber-900 font-semibold text-lg group-hover:text-amber-700 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-amber-700 text-sm">{item.subtitle}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-200 text-amber-800">
                            {item.item_code}
                          </span>
                          <span className="text-amber-600 text-sm font-medium">
                            Expérience immersive 🎯
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Search className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl text-white/60 mb-2">Aucun item trouvé</h3>
                  <p className="text-white/40">Essayez de modifier votre recherche</p>
                </div>
              )}

              {/* Debug info */}
              {!loading && (
                <div className="text-center mt-8 text-white/40 text-sm">
                  {immersiveItems.length} item(s) disponible(s)
                  {searchTerm && ` • ${filteredItems.length} résultat(s) pour "${searchTerm}"`}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EdnIndex;
