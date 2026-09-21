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
          const res = await fetch('/api/settings');
          if (res.ok) {
            const data = await res.json();
            set({ siteSettings: data });
            // Atualizar variáveis CSS no root
            document.documentElement.style.setProperty('--color-offwhite', data.themeColorOffwhite);
            document.documentElement.style.setProperty('--color-white', data.themeColorWhite);
            document.documentElement.style.setProperty('--color-black', data.themeColorBlack);
          }
        } catch (e) { console.error(e) }
      },

      updateSettings: async (settings) => {
        try {
          await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
          });
          get().fetchSettings();
        } catch (e) { console.error(e) }
      },

      fetchProducts: async () => {
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const products = await res.json();
            set({ products });
          }
        } catch (e) { console.error(e) }
      },
      
      addProduct: async (product) => {
        try {
          await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
          });
          get().fetchProducts();
        } catch (e) { console.error(e) }
      },

      updateProduct: async (product) => {
        try {
          await fetch(`/api/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
          });
          get().fetchProducts();
        } catch (e) { console.error(e) }
      },

      deleteProduct: async (id) => {
        try {
          await fetch(`/api/products/${id}`, { method: 'DELETE' });
          get().fetchProducts();
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
