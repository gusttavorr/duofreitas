import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem, Size } from '../types';

export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'CAMISETA OVERSIZED BLACK',
    category: 'Camisetas',
    description: 'Camiseta oversized preta com caimento perfeito.',
    priceOld: 179.90,
    priceCurrent: 149.90,
    badge: '-20%',
    visible: true,
    imageFront: '/imagens/tee-black-front.jpg',
    imageBack: '/imagens/tee-black-back.jpg',
    stock: { P: 10, M: 15, G: 20, GG: 5 },
    order: 1,
  },
  {
    id: '2',
    name: 'CAMISETA OVERSIZED OFF-WHITE',
    category: 'Camisetas',
    description: 'Camiseta oversized off-white.',
    priceOld: 179.90,
    priceCurrent: 149.90,
    badge: 'COMPRE 3 PAGUE 2',
    visible: true,
    imageFront: '/imagens/tee-white-front.jpg',
    imageBack: '/imagens/tee-white-back.jpg',
    stock: { P: 5, M: 10, G: 15, GG: 2 },
    order: 2,
  },
  {
    id: '3',
    name: 'CALÇA CARGO BAGGY BLACK',
    category: 'Calças',
    description: 'Calça cargo baggy preta.',
    priceOld: 349.90,
    priceCurrent: 299.00,
    badge: 'FRETE GRÁTIS',
    visible: true,
    imageFront: '/imagens/pants-black-front.jpg',
    imageBack: '/imagens/pants-black-back.jpg',
    stock: { P: 8, M: 12, G: 10, GG: 4 },
    order: 3,
  },
  {
    id: '4',
    name: 'CALÇA WIDE LEG SAND',
    category: 'Calças',
    description: 'Calça wide leg cor areia/bege.',
    priceOld: 339.90,
    priceCurrent: 289.00,
    visible: true,
    imageFront: '/imagens/pants-beige-front.jpg',
    imageBack: '/imagens/pants-beige-back.jpg',
    stock: { P: 10, M: 20, G: 15, GG: 5 },
    order: 4,
  },
  {
    id: '5',
    name: 'CAMISETA BOXY FIT BLACK',
    category: 'Camisetas',
    description: 'Camiseta boxy fit preta.',
    priceOld: 169.90,
    priceCurrent: 139.90,
    badge: '-18%',
    visible: true,
    imageFront: '/imagens/tee-black-back.jpg',
    imageBack: '/imagens/tee-black-front.jpg',
    stock: { P: 12, M: 18, G: 22, GG: 8 },
    order: 5,
  },
  {
    id: '6',
    name: 'CALÇA CARGO UTILITY BLACK',
    category: 'Calças',
    description: 'Calça cargo utility preta.',
    priceOld: 399.90,
    priceCurrent: 339.00,
    badge: 'NOVIDADE',
    visible: true,
    imageFront: '/imagens/pants-black-back.jpg',
    imageBack: '/imagens/pants-black-front.jpg',
    stock: { P: 5, M: 8, G: 12, GG: 3 },
    order: 6,
  },
  {
    id: '7',
    name: 'CAMISETA HEAVY OFF-WHITE',
    category: 'Camisetas',
    description: 'Camiseta heavy off-white.',
    priceOld: 189.90,
    priceCurrent: 159.90,
    visible: true,
    imageFront: '/imagens/tee-white-back.jpg',
    imageBack: '/imagens/tee-white-front.jpg',
    stock: { P: 8, M: 10, G: 14, GG: 6 },
    order: 7,
  },
  {
    id: '8',
    name: 'CALÇA PLEATED SAND',
    category: 'Calças',
    description: 'Calça pleated areia/bege.',
    priceOld: 359.90,
    priceCurrent: 305.00,
    badge: '-15%',
    visible: true,
    imageFront: '/imagens/pants-beige-back.jpg',
    imageBack: '/imagens/pants-beige-front.jpg',
    stock: { P: 6, M: 14, G: 10, GG: 4 },
    order: 8,
  }
];

interface AppState {
  products: Product[];
  cart: CartItem[];
  isCartOpen: boolean;
  coupon: string | null;
  siteSettings: {
    heroSlides: string[];
    themeColorOffwhite: string;
    themeColorWhite: string;
    themeColorBlack: string;
  };

  fetchSettings: () => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  toggleCart: (isOpen?: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: [],
      cart: [],
      isCartOpen: false,
      coupon: null,
      siteSettings: {
        heroSlides: ['/imagens/hero-1.jpg'],
        themeColorOffwhite: '#fce8eb',
        themeColorWhite: '#fff5f7',
        themeColorBlack: '#3a2e30'
      },

      fetchSettings: async () => {
        try {
          const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
          if (data && !error) {
            const settings = {
              heroSlides: data.hero_slides || ['/imagens/hero-1.jpg'],
              themeColorOffwhite: data.theme_color_offwhite || '#fce8eb',
              themeColorWhite: data.theme_color_white || '#fff5f7',
              themeColorBlack: data.theme_color_black || '#3a2e30'
            };
            set({ siteSettings: settings });
            document.documentElement.style.setProperty('--color-offwhite', settings.themeColorOffwhite);
            document.documentElement.style.setProperty('--color-white', settings.themeColorWhite);
            document.documentElement.style.setProperty('--color-black', settings.themeColorBlack);
          }
        } catch (e) { console.error(e) }
      },

      updateSettings: async (settings) => {
        try {
          const { error } = await supabase.from('site_settings').upsert({
            id: 1,
            hero_slides: settings.heroSlides,
            theme_color_offwhite: settings.themeColorOffwhite,
            theme_color_white: settings.themeColorWhite,
            theme_color_black: settings.themeColorBlack,
            updated_at: new Date().toISOString()
          });
          if (!error) get().fetchSettings();
        } catch (e) { console.error(e) }
      },

      fetchProducts: async () => {
        try {
          const { data, error } = await supabase.from('products').select('*').order('sort_order', { ascending: true });
          if (data && !error) {
            const products: Product[] = data.map((row: any) => ({
              id: row.id,
              name: row.name,
              category: row.category,
              description: row.description,
              priceOld: row.price_old,
              priceCurrent: row.price_current,
              badge: row.badge,
              visible: row.visible,
              imageFront: row.image_front,
              imageBack: row.image_back,
              stock: {
                P: row.stock_p,
                M: row.stock_m,
                G: row.stock_g,
                GG: row.stock_gg
              },
              order: row.sort_order
            }));
            set({ products });
          }
        } catch (e) { console.error(e) }
      },
      
      addProduct: async (p) => {
        try {
          const { error } = await supabase.from('products').insert({
            id: p.id,
            name: p.name,
            category: p.category,
            description: p.description,
            price_old: p.priceOld || null,
            price_current: p.priceCurrent,
            badge: p.badge || null,
            visible: p.visible,
            image_front: p.imageFront,
            image_back: p.imageBack,
            stock_p: p.stock?.P || 0,
            stock_m: p.stock?.M || 0,
            stock_g: p.stock?.G || 0,
            stock_gg: p.stock?.GG || 0,
            sort_order: p.order
          });
          if (!error) get().fetchProducts();
          else console.error(error);
        } catch (e) { console.error(e) }
      },

      updateProduct: async (p) => {
        try {
          const { error } = await supabase.from('products').update({
            name: p.name,
            category: p.category,
            description: p.description,
            price_old: p.priceOld || null,
            price_current: p.priceCurrent,
            badge: p.badge || null,
            visible: p.visible,
            image_front: p.imageFront,
            image_back: p.imageBack,
            stock_p: p.stock?.P || 0,
            stock_m: p.stock?.M || 0,
            stock_g: p.stock?.G || 0,
            stock_gg: p.stock?.GG || 0,
            sort_order: p.order
          }).eq('id', p.id);
          if (!error) get().fetchProducts();
          else console.error(error);
        } catch (e) { console.error(e) }
      },

      deleteProduct: async (id) => {
        try {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (!error) get().fetchProducts();
          else console.error(error);
        } catch (e) { console.error(e) }
      },

      toggleCart: (isOpen) => set((state) => ({ isCartOpen: isOpen ?? !state.isCartOpen })),
      addToCart: (item) => {
        const id = `${item.productId}-${item.size}`;
        const state = get();
        const existing = state.cart.find(i => i.id === id);
        
        if (existing) {
          set({
            cart: state.cart.map(i => i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i),
            isCartOpen: true
          });
        } else {
          set({
            cart: [...state.cart, { ...item, id }],
            isCartOpen: true
          });
        }
      },
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(i => i.id !== id)
      })),
      updateQuantity: (id, qty) => set((state) => ({
        cart: state.cart.map(i => i.id === id ? { ...i, quantity: qty } : i)
      })),
      applyCoupon: (code) => {
        if (code.toUpperCase() === 'PRIMEIRA10') {
          set({ coupon: 'PRIMEIRA10' });
          return true;
        }
        return false;
      },
      removeCoupon: () => set({ coupon: null }),
    }),
    {
      name: 'duofreitas.catalog.v2', // Mudei a key para limpar estado velho
      partialize: (state) => ({ cart: state.cart, coupon: state.coupon }) // Só salvar carrinho
    }
  )
);
