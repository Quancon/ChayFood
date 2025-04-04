'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '../lib/api';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: MenuItem, quantity: number, specialInstructions?: string) => void;
  updateItem: (itemId: string, quantity: number, specialInstructions?: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          setItems(JSON.parse(storedCart));
        } catch (error) {
          console.error('Failed to parse cart data:', error);
          localStorage.removeItem('cart');
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  // Add single item to cart
  const addItem = (menuItem: MenuItem, quantity: number, specialInstructions?: string) => {
    setItems(prevItems => {
      // Check if item already exists
      const existingItemIndex = prevItems.findIndex(item => 
        item.menuItem._id === menuItem._id
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          specialInstructions: specialInstructions || updatedItems[existingItemIndex].specialInstructions
        };
        return updatedItems;
      } else {
        // Add new item if it doesn't exist
        return [...prevItems, { 
          menuItem, 
          quantity, 
          specialInstructions
        }];
      }
    });
  };

  // Update item in cart
  const updateItem = (itemId: string, quantity: number, specialInstructions?: string) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.menuItem._id === itemId) {
          return {
            ...item,
            quantity,
            specialInstructions: specialInstructions !== undefined ? specialInstructions : item.specialInstructions
          };
        }
        return item;
      });
    });
    
    // Remove item if quantity is 0
    if (quantity === 0) {
      removeItem(itemId);
    }
  };

  // Remove item from cart
  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.menuItem._id !== itemId));
    
    // Remove cart from localStorage if empty
    if (items.length === 1) {
      localStorage.removeItem('cart');
    }
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  // Calculate totals
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);

  const value = {
    items,
    totalItems,
    totalAmount,
    addItem,
    updateItem,
    removeItem,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext; 