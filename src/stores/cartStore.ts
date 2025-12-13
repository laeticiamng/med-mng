import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ShopifyProduct } from '@/lib/shopify';
import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  quantity: number;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  
  // Actions
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  setCartId: (cartId: string) => void;
  setCheckoutUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  createCheckout: () => Promise<void>;
  syncWithSupabase: () => Promise<void>;
}

// Helper to sync cart with Supabase
const syncCartToSupabase = async (items: CartItem[], checkoutUrl: string | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await (supabase as any)
      .from('user_cart')
      .upsert({
        user_id: user.id,
        items: items,
        checkout_url: checkoutUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
  }
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,

      addItem: (item) => {
        const { items, checkoutUrl } = get();
        const existingItem = items.find(i => i.variantId === item.variantId);
        
        let newItems: CartItem[];
        if (existingItem) {
          newItems = items.map(i =>
            i.variantId === item.variantId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          newItems = [...items, item];
        }
        
        set({ items: newItems });
        syncCartToSupabase(newItems, checkoutUrl);
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        
        const { checkoutUrl } = get();
        const newItems = get().items.map(item =>
          item.variantId === variantId ? { ...item, quantity } : item
        );
        
        set({ items: newItems });
        syncCartToSupabase(newItems, checkoutUrl);
      },

      removeItem: (variantId) => {
        const { checkoutUrl } = get();
        const newItems = get().items.filter(item => item.variantId !== variantId);
        set({ items: newItems });
        syncCartToSupabase(newItems, checkoutUrl);
      },

      clearCart: () => {
        set({ items: [], cartId: null, checkoutUrl: null });
        syncCartToSupabase([], null);
      },

      setCartId: (cartId) => set({ cartId }),
      setCheckoutUrl: (checkoutUrl) => {
        set({ checkoutUrl });
        syncCartToSupabase(get().items, checkoutUrl);
      },
      setLoading: (isLoading) => set({ isLoading }),

      createCheckout: async () => {
        const { items, setLoading, setCheckoutUrl } = get();
        if (items.length === 0) return;

        setLoading(true);
        try {
          const { createStorefrontCheckout } = await import('@/lib/shopify');
          const checkoutUrl = await createStorefrontCheckout(items);
          setCheckoutUrl(checkoutUrl);
        } catch (error) {
          console.error('Failed to create checkout:', error);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      syncWithSupabase: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await (supabase as any)
            .from('user_cart')
            .select('items, checkout_url')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (data?.items && Array.isArray(data.items)) {
            set({ 
              items: data.items as CartItem[], 
              checkoutUrl: data.checkout_url 
            });
          }
        }
      }
    }),
    {
      name: 'medmng-cart',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for temporary cart, Supabase is source of truth
      onRehydrateStorage: () => (state) => {
        // Sync with Supabase after rehydration - Supabase is the source of truth
        state?.syncWithSupabase();
      }
    }
  )
);
