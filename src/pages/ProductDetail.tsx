import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Package, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CartDrawer } from '@/components/store/CartDrawer';
import { getProductByHandle, type ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { PremiumBackground } from '@/components/ui/premium-background';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
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
      <PremiumBackground>
        <div className="min-h-screen flex items-center justify-center">
          <PremiumCard variant="glass" className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement du produit...</p>
          </PremiumCard>
        </div>
      </PremiumBackground>
    );
  }

  if (!product) {
    return (
      <PremiumBackground>
        <div className="min-h-screen flex items-center justify-center">
          <PremiumCard variant="elevated" className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Produit non trouvé</h2>
            <PremiumButton variant="primary" size="lg" onClick={() => navigate('/store')}>
              Retour au store
            </PremiumButton>
          </PremiumCard>
        </div>
      </PremiumBackground>
    );
  }

  return (
    <PremiumBackground>
      {/* Back button and cart in header area */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <PremiumButton variant="glass" size="md" onClick={() => navigate('/store')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au store
          </PremiumButton>
          <CartDrawer />
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <PremiumCard variant="elevated" className="overflow-hidden">
              <div className="aspect-square bg-muted">
                {product.node.images.edges[0]?.node && (
                  <img
                    src={product.node.images.edges[0].node.url}
                    alt={product.node.images.edges[0].node.altText || product.node.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </PremiumCard>
            
            {product.node.images.edges.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.node.images.edges.slice(1, 5).map((image, idx) => (
                  <PremiumCard key={idx} variant="elevated" className="overflow-hidden">
                    <div className="aspect-square bg-muted">
                      <img
                        src={image.node.url}
                        alt={image.node.altText || `${product.node.title} ${idx + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </PremiumCard>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <PremiumCard variant="gradient" className="p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.node.title}</h1>
              <div className="text-4xl font-bold text-primary mb-4">
                {product.node.priceRange.minVariantPrice.currencyCode} {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
              </div>
              {selectedVariant?.availableForSale && (
                <Badge variant="outline" className="text-accent border-accent">
                  <Check className="h-3 w-3 mr-1" />
                  En stock
                </Badge>
              )}
              
              <div className="mt-6">
                <p className="text-gray-600 text-lg leading-relaxed">{product.node.description}</p>
              </div>
            </PremiumCard>

            {/* Variants */}
            {product.node.options.length > 0 && product.node.options[0].values.length > 1 && (
              <PremiumCard variant="elevated" className="p-6">
                <label className="text-sm font-semibold text-gray-900 block mb-4">Options</label>
                <div className="flex flex-wrap gap-3">
                  {product.node.variants.edges.map((variant) => (
                    <PremiumButton
                      key={variant.node.id}
                      variant={selectedVariantId === variant.node.id ? 'primary' : 'glass'}
                      size="md"
                      onClick={() => setSelectedVariantId(variant.node.id)}
                      disabled={!variant.node.availableForSale}
                    >
                      {variant.node.title}
                    </PremiumButton>
                  ))}
                </div>
              </PremiumCard>
            )}

            {/* Add to Cart */}
            <PremiumButton 
              variant="primary"
              size="xl"
              onClick={handleAddToCart}
              disabled={!selectedVariant?.availableForSale}
              className="w-full"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Ajouter au panier
            </PremiumButton>

            {/* Benefits */}
            <PremiumCard variant="glass" className="p-6 bg-accent/5 border-accent/20">
              <h3 className="font-bold text-lg mb-4 text-accent">✨ Avantages MedMNG</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>Débloquez un module numérique exclusif sur la plateforme MedMNG</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>Optimisé pour l'apprentissage médical</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>Livraison rapide et sécurisée</span>
                </li>
              </ul>
            </PremiumCard>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
