import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CartDrawer } from '@/components/store/CartDrawer';
import { getProductByHandle, type ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    if (handle) {
      loadProduct();
    }
  }, [handle]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductByHandle(handle!);
      setProduct(data);
      if (data) {
        setSelectedVariantId(data.node.variants.edges[0]?.node.id || '');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Erreur lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const selectedVariant = product?.node.variants.edges.find(
    v => v.node.id === selectedVariantId
  )?.node;

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const cartItem = {
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success('Produit ajouté au panier', {
      position: 'top-center',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground mt-4">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Produit non trouvé</h2>
          <Link to="/store">
            <Button>Retour au store</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/store">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au store
              </Button>
            </Link>
            <CartDrawer />
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-square bg-muted">
                {product.node.images.edges[0]?.node && (
                  <img
                    src={product.node.images.edges[0].node.url}
                    alt={product.node.images.edges[0].node.altText || product.node.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </Card>
            
            {product.node.images.edges.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.node.images.edges.slice(1, 5).map((image, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <div className="aspect-square bg-muted">
                      <img
                        src={image.node.url}
                        alt={image.node.altText || `${product.node.title} ${idx + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">{product.node.title}</h1>
              <div className="text-3xl font-bold text-primary mb-4">
                {product.node.priceRange.minVariantPrice.currencyCode} {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
              </div>
              {selectedVariant?.availableForSale && (
                <Badge variant="outline" className="text-accent border-accent">
                  <Check className="h-3 w-3 mr-1" />
                  En stock
                </Badge>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-muted-foreground text-lg">{product.node.description}</p>
            </div>

            {/* Variants */}
            {product.node.options.length > 0 && product.node.options[0].values.length > 1 && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Options</label>
                <div className="flex flex-wrap gap-2">
                  {product.node.variants.edges.map((variant) => (
                    <Button
                      key={variant.node.id}
                      variant={selectedVariantId === variant.node.id ? 'default' : 'outline'}
                      onClick={() => setSelectedVariantId(variant.node.id)}
                      disabled={!variant.node.availableForSale}
                    >
                      {variant.node.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button 
                onClick={handleAddToCart}
                className="flex-1"
                size="lg"
                disabled={!selectedVariant?.availableForSale}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Ajouter au panier
              </Button>
            </div>

            {/* Benefits */}
            <Card className="p-6 bg-accent/10 border-accent/30">
              <h3 className="font-semibold mb-3 text-accent">Avantages MedMNG</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Débloquez un module numérique exclusif sur la plateforme MedMNG</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Optimisé pour l'apprentissage médical</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Livraison rapide et sécurisée</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
