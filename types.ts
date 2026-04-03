export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  soldCount: number;
  description: string;
  images: string[];
  category: string;
  options: string[];
}

export interface StoreData {
  products: Product[];
  categories: string[];
}

export interface CartItem extends Product {
  cartId: string;
  selectedOption: string;
  quantity: number;
}

export enum VisualizerMode {
  PERSON = 'PERSON', 
  room = 'ROOM',    
}

export interface AIResponse {
  generatedImageBase64: string;
  text?: string;
}

export type ViewState = 'HOME' | 'PRODUCT_DETAIL' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';
