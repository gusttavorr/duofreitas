export type Size = 'P' | 'M' | 'G' | 'GG';

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  priceOld?: number;
  priceCurrent: number;
  badge?: string;
  visible: boolean;
  imageFront: string;
  imageBack: string;
  stock: Record<Size, number>;
  order: number;
}

export interface CartItem {
  id: string; // product id + size
  productId: string;
  name: string;
  size: Size;
  quantity: number;
  price: number;
  image: string;
}
