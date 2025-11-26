import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { CartItem, Dish } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  heartValue: number;
  addToCart: (dish: Dish) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  fetchHeartValue: () => Promise<void>;
  canAfford: (amount: number) => boolean;
  submitRechargeRequest: (amount: number) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user, updateHeartValue: updateUserHeartValue } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [heartValue, setHeartValue] = useState<number>(user?.heartValue || 0);

  // Fetch heart value from backend
  const fetchHeartValue = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await axios.get('/api/heart-value');
      const newHeartValue = response.data.heartValue;
      setHeartValue(newHeartValue);
      updateUserHeartValue(newHeartValue);
    } catch (error) {
      console.error('Failed to fetch heart value:', error);
    }
  }, [user, updateUserHeartValue]);

  // Fetch heart value when user changes
  useEffect(() => {
    if (user) {
      setHeartValue(user.heartValue || 0);
      fetchHeartValue();
    }
  }, [user, fetchHeartValue]);

  const addToCart = (dish: Dish) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === dish.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...dish, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const canAfford = (amount: number) => {
    return heartValue >= amount;
  };

  // Submit recharge request
  const submitRechargeRequest = async (amount: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await axios.post('/api/recharge-requests', {
        amount,
        userId: user.id,
        username: user.username
      });
      return response.data.success;
    } catch (error) {
      console.error('Failed to submit recharge request:', error);
      return false;
    }
  };

  const value: CartContextType = {
    cartItems,
    heartValue,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    fetchHeartValue,
    canAfford,
    submitRechargeRequest,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 