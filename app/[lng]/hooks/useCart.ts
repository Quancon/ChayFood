'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart as useCartContext } from '../context/CartContext';
import { MenuItem } from '../../lib/services/types';
import { useAuth } from '../context/AuthContext';

interface UseCartReturn {
  // Original cart context
  items: ReturnType<typeof useCartContext>['items'];
  totalItems: ReturnType<typeof useCartContext>['totalItems'];
  totalAmount: ReturnType<typeof useCartContext>['totalAmount'];
  addItem: ReturnType<typeof useCartContext>['addItem'];
  updateItem: ReturnType<typeof useCartContext>['updateItem'];
  removeItem: ReturnType<typeof useCartContext>['removeItem'];
  clearCart: ReturnType<typeof useCartContext>['clearCart'];
  refresh: ReturnType<typeof useCartContext>['refresh'];
  error: ReturnType<typeof useCartContext>['error'];
  
  // Enhanced functionality
  isCartEmpty: boolean;
  isItemInCart: (itemId: string) => boolean;
  getItemQuantity: (itemId: string) => number;
  addToCartWithMessage: (item: MenuItem, quantity: number, specialInstructions?: string) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  proceedToCheckout: () => void;
  hasMessage: boolean;
  message: string | null;
  dismissMessage: () => void;
}

export function useCart(): UseCartReturn {
  const router = useRouter();
  const cartContext = useCartContext();
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debug current state
  useEffect(() => {
    console.log("useCart state:", {
      hasMessage: message !== null || error !== null,
      message: error || message,
      isAuthenticated,
      cartItems: cartContext.items?.length || 0,
      itemsData: cartContext.items
    });
  }, [message, error, isAuthenticated, cartContext.items]);

  // Load cart data on mount and after auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      cartContext.refresh();
    }
  }, [isAuthenticated, cartContext]);

  // Check if an item is in the cart
  const isItemInCart = (itemId: string): boolean => {
    return cartContext.items?.some(item => item.menuItem._id === itemId) || false;
  };

  // Get quantity of an item
  const getItemQuantity = (itemId: string): number => {
    const item = cartContext.items?.find(item => item.menuItem._id === itemId);
    return item ? item.quantity : 0;
  };

  // Add item with feedback message
  const addToCartWithMessage = async (item: MenuItem, quantity: number, specialInstructions?: string) => {
    console.log("addToCartWithMessage called", { item, quantity, isAuthenticated });
    
    // Clear previous messages
    setError(null);
    setMessage(null);
    
    if (messageTimeout) {
      clearTimeout(messageTimeout);
      setMessageTimeout(null);
    }
    
    // Set a message immediately to ensure we always have some feedback
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để thêm vào giỏ hàng");
      console.log("Error set: authentication required");
      return;
    }
    
    // Set a temporary processing message
    setMessage("Đang thêm vào giỏ hàng...");
    
    try {
      await cartContext.addItem(item, quantity, specialInstructions);
      
      // Check if there was an error from the context
      if (cartContext.error) {
        setMessage(null); // Clear the processing message
        setError(cartContext.error);
        console.log("Error from context:", cartContext.error);
        return;
      }
      
      // Set success message
      setMessage(`Đã thêm ${item.name} vào giỏ hàng`);
      console.log("Success message set:", `Đã thêm ${item.name} vào giỏ hàng`);
      
    } catch (err) {
      setMessage(null); // Clear the processing message
      setError("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
      console.log("Error caught:", err);
    }
  };
  
  // Clear messages after 3 seconds
  useEffect(() => {
    if (message || error) {
      // Chỉ set timeout nếu message/error vừa được set (không phải do clear)
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
      const timeout = setTimeout(() => {
        setMessage(null);
        setError(null);
        setMessageTimeout(null);
      }, 3000);
      setMessageTimeout(timeout);
      return () => clearTimeout(timeout);
    }
    // Nếu message và error đều null, clear timeout nếu còn
    if (messageTimeout) {
      clearTimeout(messageTimeout);
      setMessageTimeout(null);
    }
    // eslint-disable-next-line
  }, [message, error]);

  // Increase quantity of an item by 1
  const increaseQuantity = (itemId: string) => {
    // First try to find by cart item _id
    let cartItem = cartContext.items?.find(item => item._id === itemId);
    
    // If not found, try to find by menuItem._id (backward compatibility)
    if (!cartItem) {
      cartItem = cartContext.items?.find(item => item.menuItem._id === itemId);
    }
    
    if (cartItem) {
      // If found by cart item _id, use that
      const idToUse = cartItem._id || itemId;
      cartContext.updateItem(idToUse, cartItem.quantity + 1);
      console.log(`Increasing quantity for item ID: ${idToUse}`);
    } else {
      console.error(`Could not find cart item with ID: ${itemId}`);
    }
  };

  // Decrease quantity of an item by 1
  const decreaseQuantity = (itemId: string) => {
    // First try to find by cart item _id
    let cartItem = cartContext.items?.find(item => item._id === itemId);
    
    // If not found, try to find by menuItem._id (backward compatibility)
    if (!cartItem) {
      cartItem = cartContext.items?.find(item => item.menuItem._id === itemId);
    }
    
    if (cartItem) {
      // If found by cart item _id, use that
      const idToUse = cartItem._id || itemId;
      
      if (cartItem.quantity > 1) {
        cartContext.updateItem(idToUse, cartItem.quantity - 1);
        console.log(`Decreasing quantity for item ID: ${idToUse}`);
      } else {
        cartContext.removeItem(idToUse);
        console.log(`Removing item with ID: ${idToUse} (quantity would be 0)`);
      }
    } else {
      console.error(`Could not find cart item with ID: ${itemId}`);
    }
  };

  // Navigate to checkout
  const proceedToCheckout = () => {
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để tiếp tục thanh toán");
      const timeout = setTimeout(() => {
        setError(null);
      }, 3000);
      setMessageTimeout(timeout);
      return;
    }
    router.push('/checkout');
  };

  // Dismiss message
  const dismissMessage = () => {
    setMessage(null);
    setError(null);
    if (messageTimeout) {
      clearTimeout(messageTimeout);
      setMessageTimeout(null);
    }
  };

  return {
    // Original cart context
    ...cartContext,
    
    // Enhanced functionality
    isCartEmpty: !cartContext.items || cartContext.items.length === 0,
    isItemInCart,
    getItemQuantity,
    addToCartWithMessage,
    increaseQuantity,
    decreaseQuantity,
    proceedToCheckout,
    hasMessage: message !== null || error !== null,
    message: error || message,
    dismissMessage
  };
}

export default useCart; 