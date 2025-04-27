'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated, user } = useAuth();

  // Lấy giỏ hàng từ server nếu đã đăng nhập, hoặc từ localStorage nếu chưa đăng nhập
  const fetchCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        // Lấy giỏ hàng từ server nếu đã đăng nhập
        const response = await getCart();
        if (response.success) {
          setItems(response.items);
        } else {
          // Fallback to local storage if API fails
          loadFromLocalStorage();
        }
      } else {
        // Dùng giỏ hàng từ localStorage nếu chưa đăng nhập
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart');
      // Fallback to localStorage
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Load từ localStorage
  const loadFromLocalStorage = () => {
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
  };

  // Lưu vào localStorage (chỉ khi chưa đăng nhập)
  const saveToLocalStorage = (cartItems: CartItem[]) => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  };

  // Load cart khi component mount và khi auth state thay đổi
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  // Add single item to cart
  const addItem = async (menuItem: MenuItem, quantity: number, specialInstructions?: string) => {
    setError(null);
    
    try {
      if (isAuthenticated) {
        // Thêm vào giỏ hàng trên server
        setIsLoading(true);
        const response = await addToCartAction(menuItem, quantity, specialInstructions);
        
        if (response.success) {
          setItems(response.items);
        } else {
          setError(response.message || 'Failed to add item to cart');
        }
      } else {
        // Thêm vào localStorage nếu chưa đăng nhập
        setItems(prevItems => {
          // Check if item already exists
          const existingItemIndex = prevItems.findIndex(item => 
            item.menuItem._id === menuItem._id
          );
          
          let updatedItems;
          if (existingItemIndex >= 0) {
            // Update quantity if item exists
            updatedItems = [...prevItems];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity,
              specialInstructions: specialInstructions || updatedItems[existingItemIndex].specialInstructions
            };
          } else {
            // Add new item if it doesn't exist
            updatedItems = [...prevItems, { 
              menuItem, 
              quantity, 
              specialInstructions
            }];
          }
          
          saveToLocalStorage(updatedItems);
          return updatedItems;
        });
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setError('Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  // Update item in cart
  const updateItem = async (itemId: string, quantity: number, specialInstructions?: string) => {
    setError(null);
    
    try {
      if (quantity <= 0) {
        // Nếu số lượng <= 0, xóa sản phẩm
        await removeItem(itemId);
        return;
      }
      
      if (isAuthenticated) {
        // Cập nhật giỏ hàng trên server
        setIsLoading(true);
        const response = await updateCartItemAction(itemId, quantity, specialInstructions);
        
        if (response.success) {
          setItems(response.items);
        } else {
          setError(response.message || 'Failed to update cart item');
        }
      } else {
        // Cập nhật trong localStorage nếu chưa đăng nhập
        setItems(prevItems => {
          const updatedItems = prevItems.map(item => {
            if (item.menuItem._id === itemId) {
              return {
                ...item,
                quantity,
                specialInstructions: specialInstructions !== undefined ? specialInstructions : item.specialInstructions
              };
            }
            return item;
          });
          
          saveToLocalStorage(updatedItems);
          return updatedItems;
        });
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      setError('Failed to update cart item');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    setError(null);
    
    try {
      if (isAuthenticated) {
        // Xóa khỏi giỏ hàng trên server
        setIsLoading(true);
        const response = await removeFromCartAction(itemId);
        
        if (response.success) {
          setItems(response.items);
        } else {
          setError(response.message || 'Failed to remove item from cart');
        }
      } else {
        // Xóa khỏi localStorage nếu chưa đăng nhập
        setItems(prevItems => {
          const updatedItems = prevItems.filter(item => item.menuItem._id !== itemId);
          
          if (updatedItems.length === 0) {
            localStorage.removeItem('cart');
          } else {
            saveToLocalStorage(updatedItems);
          }
          
          return updatedItems;
        });
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('Failed to remove item from cart');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    setError(null);
    
    try {
      if (isAuthenticated) {
        // Xóa giỏ hàng trên server
        setIsLoading(true);
        const response = await clearCartAction();
        
        if (response.success) {
          setItems([]);
        } else {
          setError(response.message || 'Failed to clear cart');
        }
      } else {
        // Xóa trong localStorage nếu chưa đăng nhập
        setItems([]);
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
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
    clearCart,
    isLoading,
    error
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