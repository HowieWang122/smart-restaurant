export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Dish {
  id: number;
  categoryId: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface CartItem extends Dish {
  quantity: number;
}

export interface Order {
  id: number;
  items: CartItem[];
  total: number;
  customerInfo: CustomerInfo;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface CustomerInfo {
  taste: string;
  expectedTime: string;
  notes?: string;
} 