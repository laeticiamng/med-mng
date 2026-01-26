import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Package, Flame, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CartDrawer } from '@/components/store/CartDrawer';
import { getProducts, type ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

export default function Store() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const addItem = useCartStore(state => state.addItem);
  const { stats, loadStats } = useGamification();

  useEffect(() => {
    loadProducts();
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    checkUser();
  }, [loadStats]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;

    const cartItem = {
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success('Produit ajouté au panier', {
      position: 'top-center',
    });
  };

  return (
    <MedMngLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Gamification Stats Banner */}
        {user && stats && (
          <Card className="p-4 mb-6 bg-card/80 backdrop-blur-sm border-border">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-warning" />
                  <span className="font-medium">{stats.currentStreak} jours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-medium">Niveau {stats.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent" />
                  <span className="font-medium">{stats.totalPoints} XP</span>
                </div>
              </div>
              <div className="flex gap-2">
                {stats.badges.slice(0, 3).map(badge => (
                  <Badge key={badge.id} variant="secondary" className="bg-accent/20">
                    {badge.icon} {badge.name}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Hero Section */}
        <PremiumCard variant="glass" className="p-8 md:p-12 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                🧠 MedMNG Store
              </h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              La première boutique dédiée aux étudiants en médecine qui veulent apprendre mieux, plus vite, et avec plaisir.
            </p>
            <p className="text-muted-foreground">
              Chaque produit optimise la concentration, la mémoire et le bien-être pendant vos études médicales.
            </p>
            <div className="mt-8">
              <CartDrawer />
            </div>
          </div>
        </PremiumCard>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <PremiumCard key={i} className="animate-pulse">
                <div className="h-64 bg-muted rounded-t-xl"></div>
                <div className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </PremiumCard>
            ))}
          </div>
        ) : products.length === 0 ? (
          <PremiumCard variant="elevated" className="p-12 md:p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Aucun produit disponible</h3>
              <p className="text-muted-foreground mb-6">
                Les produits MedMNG Store arrivent bientôt ! Dites-moi quel produit vous souhaitez créer et je l'ajouterai pour vous.
              </p>
              <p className="text-sm text-muted-foreground">
                Exemple : "Ajoute une lampe de lecture Baseus à 45€"
              </p>
            </div>
          </PremiumCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const variant = product.node.variants.edges[0]?.node;
              const image = product.node.images.edges[0]?.node;
              
              return (
                <PremiumCard 
                  key={product.node.id} 
                  variant="gradient"
                  className="group hover:scale-105 overflow-hidden transition-all duration-300"
                >
                  <Link to={`/product/${product.node.handle}`}>
                    <div className="h-64 bg-muted overflow-hidden">
                      {image && (
                        <img 
                          src={image.url} 
                          alt={image.altText || product.node.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">{product.node.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                      {product.node.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-primary">
                        € {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                      </div>
                      {variant?.availableForSale && (
                        <Badge variant="outline" className="text-success border-success">
                          En stock
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link to={`/product/${product.node.handle}`} className="flex-1">
                        <Button variant="outline" size="default" className="w-full">
                          Détails
                        </Button>
                      </Link>
                      <Button 
                        variant="default"
                        size="default"
                        onClick={() => handleAddToCart(product)}
                        disabled={!variant?.availableForSale}
                        className="flex-1"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Panier
                      </Button>
                    </div>
                  </div>
                </PremiumCard>
              );
            })}
          </div>
        )}
      </div>
    </MedMngLayout>
  );
}
