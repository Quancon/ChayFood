'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart as useCartContext } from '../context/CartContext';
import { MenuItem } from '../lib/api';

interface UseCartReturn {
  // Original cart context
  items: ReturnType<typeof useCartContext>['items'];
  totalItems: ReturnType<typeof useCartContext>['totalItems'];
  totalAmount: ReturnType<typeof useCartContext>['totalAmount'];
  addItem: ReturnType<typeof useCartContext>['addItem'];
  updateItem: ReturnType<typeof useCartContext>['updateItem'];
  removeItem: ReturnType<typeof useCartContext>['removeItem'];
  clearCart: ReturnType<typeof useCartContext>['clearCart'];
  
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
  const [message, setMessage] = useState<string | null>(null);
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(null);

  // Check if an item is in the cart
  const isItemInCart = (itemId: string): boolean => {
    return cartContext.items.some(item => item.menuItem._id === itemId);
  };

  // Get quantity of an item
  const getItemQuantity = (itemId: string): number => {
    const item = cartContext.items.find(item => item.menuItem._id === itemId);
    return item ? item.quantity : 0;
  };

  // Add item with feedback message
  const addToCartWithMessage = (item: MenuItem, quantity: number, specialInstructions?: string) => {
    cartContext.addItem(item, quantity, specialInstructions);
    
    // Clear any existing timeout
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
    
    // Set success message
    setMessage(`${item.name} added to cart`);
    
    // Clear message after 3 seconds
    const timeout = setTimeout(() => {
      setMessage(null);
    }, 3000);
    
    setMessageTimeout(timeout);
  };

  // Increase quantity of an item by 1
  const increaseQuantity = (itemId: string) => {
    const item = cartContext.items.find(item => item.menuItem._id === itemId);
    if (item) {
      cartContext.updateItem(itemId, item.quantity + 1);
    }
  };

  // Decrease quantity of an item by 1
  const decreaseQuantity = (itemId: string) => {
    const item = cartContext.items.find(item => item.menuItem._id === itemId);
    if (item) {
      if (item.quantity > 1) {
        cartContext.updateItem(itemId, item.quantity - 1);
      } else {
        cartContext.removeItem(itemId);
      }
    }
  };

  // Navigate to checkout
  const proceedToCheckout = () => {
    router.push('/order');
  };

  // Dismiss message
  const dismissMessage = () => {
    setMessage(null);
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
  };

  return {
    // Original cart context
    ...cartContext,
    
    // Enhanced functionality
    isCartEmpty: cartContext.items.length === 0,
    isItemInCart,
    getItemQuantity,
    addToCartWithMessage,
    increaseQuantity,
    decreaseQuantity,
    proceedToCheckout,
    hasMessage: message !== null,
    message,
    dismissMessage
  };
}

export default useCart; 