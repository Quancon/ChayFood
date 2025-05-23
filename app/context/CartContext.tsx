'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { MenuItem } from '../lib/services/types';
import { CartItem } from '../lib/actions/cartActions';
import { 
  getCart, 
  addToCart as addToCartAction, 
  updateCartItem as updateCartItemAction,
  removeFromCart as removeFromCartAction, 
  clearCart as clearCartAction 
} from '../lib/actions/cartActions';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: MenuItem, quantity: number, specialInstructions?: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number, specialInstructions?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated, user } = useAuth();
  const lastFetchTimeRef = useRef<number>(0);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy giỏ hàng từ server
  const fetchCart = async () => {
    // Prevent multiple fetches within 500ms
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 500) {
      console.log('Skipping duplicate fetch, already fetched recently');
      return;
    }
    
    if (!isAuthenticated) {
      // Reset state if not authenticated
      setItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    lastFetchTimeRef.current = now;
    
    try {
      const response = await getCart();
      console.log("Fetched cart data:", response);
      if (response.success) {
        setItems(response.items || []);
      } else {
        setError(response.message || 'Failed to fetch cart');
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a refresh function that can be called from outside
  const refresh = async () => {
    await fetchCart();
  };

  // Load cart khi component mount và khi auth state thay đổi
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  // Forced refresh on window focus to keep cart in sync
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      const handleFocus = () => {
        console.log('Window focused, refreshing cart');
        fetchCart();
      };
      
      window.addEventListener('focus', handleFocus);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [isAuthenticated]);

  // Add single item to cart
  const addItem = async (menuItem: MenuItem, quantity: number, specialInstructions?: string) => {
    setError(null);
    
    if (!isAuthenticated) {
      setError('Please log in to add items to cart');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Calling addToCartAction with:", { menuItem, quantity });
      
      const response = await addToCartAction(menuItem, quantity, specialInstructions);
      console.log("addToCartAction response:", response);
      
      if (response.success) {
        if ('items' in response && Array.isArray(response.items)) {
          setItems(response.items);
        } else {
          await fetchCart();
        }
      } else {
        console.error("addToCartAction failed:", response.message);
        setError(response.message || 'Failed to add item to cart');
        await fetchCart();
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setError('Failed to add item to cart');
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  };

  // Update item in cart
  const updateItem = async (itemId: string, quantity: number, specialInstructions?: string) => {
    if (!isAuthenticated) {
      setError('Please log in to update cart');
      return;
    }
    
    setError(null);
    
    try {
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }
      
      setIsLoading(true);
      console.log(`Updating cart item with ID: ${itemId} to quantity: ${quantity}`);
      
      const response = await updateCartItemAction(itemId, quantity, specialInstructions);
      console.log("updateCartItem response:", response);
      
      if (response.success) {
        if ('items' in response && Array.isArray(response.items)) {
          setItems(response.items);
        } else {
          await fetchCart();
        }
      } else {
        setError(response.message || 'Failed to update cart item');
        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      setError('Failed to update cart item');
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    if (!isAuthenticated) {
      setError('Please log in to remove items');
      return;
    }
    
    setError(null);
    
    try {
      setIsLoading(true);
      console.log(`Removing cart item with ID: ${itemId}`);
      
      const response = await removeFromCartAction(itemId);
      console.log("removeFromCart response:", response);
      
      if (response.success) {
        if ('items' in response && Array.isArray(response.items)) {
          setItems(response.items);
        } else {
          await fetchCart();
        }
      } else {
        setError(response.message || 'Failed to remove item from cart');
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('Failed to remove item from cart');
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!isAuthenticated) {
      setError('Please log in to clear cart');
      return;
    }
    
    setError(null);
    
    try {
      setIsLoading(true);
      const response = await clearCartAction();
      
      if (response.success) {
        setItems([]);
      } else {
        setError(response.message || 'Failed to clear cart');
        await fetchCart();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const totalItems = Array.isArray(items) 
    ? items.reduce((total, item) => total + (item.quantity || 0), 0)
    : 0;
  
  // Log detailed cart info for debugging
  useEffect(() => {
    if (items && items.length > 0) {
      console.log('Cart Items Detail:', items);
      console.log('First item structure:', JSON.stringify(items[0], null, 2));
      console.log('Total Items:', totalItems);
    }
  }, [items]);
    
  const totalAmount = Array.isArray(items) 
    ? items.reduce((total, item) => {
        const price = item.menuItem && typeof item.menuItem.price === 'number' ? item.menuItem.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return total + (price * quantity);
      }, 0)
    : 0;

  const value = {
    items,
    totalItems,
    totalAmount,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    isLoading,
    error,
    refresh
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