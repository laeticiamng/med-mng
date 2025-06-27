
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Search, Sparkles, Play, AlertCircle, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const EdnIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [immersiveItems, setImmersiveItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Background effects - optimisés pour mobile */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse hidden md:block"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header - responsive mobile-first */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 sm:gap-3 text-white hover:text-purple-300 transition-colors">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="text-lg sm:text-2xl font-bold">DocFlemme EDN</span>
              </Link>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-white hover:bg-white/10"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>

              {/* Desktop search */}
              <div className="hidden md:flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Mobile search - collapsible */}
            <div className={`md:hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-20 mt-4' : 'max-h-0 overflow-hidden'}`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                <Input
                  placeholder="Rechercher un item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main content - optimisé mobile */}
        <div className="container mx-auto px-4 py-8 sm:py-12">
          {/* Hero section - responsive */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 animate-pulse" />
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Items EDN
              </h1>
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 animate-pulse" />
            </div>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto px-4">
              Explorez les 367 items de l'Examen National Dématérialisé dans une expérience immersive unique
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12 sm:py-16">
              <div className="animate-pulse text-lg sm:text-xl text-white/60 mb-2">Chargement des items EDN...</div>
              <p className="text-sm sm:text-base text-white/40">Préparation de l'expérience immersive</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-12 sm:py-16">
              <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl text-red-400 mb-2">Erreur de chargement</h3>
              <p className="text-sm sm:text-base text-white/60">{error}</p>
            </div>
          )}

          {/* Items grid - responsive premium */}
          {!loading && !error && (
            <>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredItems.map((item, index) => (
                    <Link
                      key={item.id}
                      to={`/edn/immersive/${item.slug}`}
                      className="group block"
                    >
                      <div className="bg-gradient-to-br from-amber-100 to-blue-100 rounded-2xl p-4 sm:p-6 border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl animate-fade-in"
                           style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-amber-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                              <Play className="h-4 w-4 sm:h-6 sm:w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-amber-900 font-semibold text-base sm:text-lg group-hover:text-amber-700 transition-colors line-clamp-2">
                                {item.title}
                              </h3>
                              <p className="text-amber-700 text-xs sm:text-sm line-clamp-2 mt-1">{item.subtitle}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-amber-200 text-amber-800">
                            {item.item_code}
                          </span>
                          <span className="text-amber-600 text-xs sm:text-sm font-medium">
                            Expérience immersive 🎯
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <Search className="h-12 w-12 sm:h-16 sm:w-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl text-white/60 mb-2">Aucun item trouvé</h3>
                  <p className="text-sm sm:text-base text-white/40">Essayez de modifier votre recherche</p>
                </div>
              )}

              {/* Debug info - responsive */}
              {!loading && (
                <div className="text-center mt-6 sm:mt-8 text-white/40 text-xs sm:text-sm">
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
