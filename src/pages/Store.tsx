import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CartDrawer } from '@/components/store/CartDrawer';
import { getProducts, type ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

export default function Store() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    loadProducts();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">MedMNG Store</h1>
                <p className="text-sm text-muted-foreground">Boostez votre apprentissage médical</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost">Retour</Button>
              </Link>
              <CartDrawer />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-accent animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              🧠 MedMNG Store
            </h2>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La première boutique dédiée aux étudiants en médecine qui veulent apprendre mieux, plus vite, et avec plaisir.
          </p>
          <p className="mt-4 text-muted-foreground">
            Chaque produit optimise la concentration, la mémoire et le bien-être pendant vos études médicales.
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-64 bg-muted"></div>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Aucun produit disponible</h3>
              <p className="text-muted-foreground mb-6">
                Les produits MedMNG Store arrivent bientôt ! Dites-moi quel produit vous souhaitez créer et je l'ajouterai pour vous.
              </p>
              <p className="text-sm text-muted-foreground">
                Exemple : "Ajoute une lampe de lecture Baseus à 45€"
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const variant = product.node.variants.edges[0]?.node;
              const image = product.node.images.edges[0]?.node;
              
              return (
                <Card key={product.node.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
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
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{product.node.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.node.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {product.node.priceRange.minVariantPrice.currencyCode} {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                      </div>
                      {variant?.availableForSale && (
                        <Badge variant="outline" className="text-accent border-accent">
                          En stock
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex gap-2">
                    <Link to={`/product/${product.node.handle}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Voir les détails
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className="flex-1"
                      disabled={!variant?.availableForSale}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Ajouter au panier
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
