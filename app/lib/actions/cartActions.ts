'use client';

import { cartService } from '../../services/cartService';
import { MenuItem } from '../services/types';

export interface CartItem {
  _id?: string;
  menuItem: MenuItem | {
    _id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
  quantity: number;
  specialInstructions?: string;
  notes?: string;
}

export async function getCart() {
  try {
    const data = await cartService.getCart();
    // Giả sử backend trả về { cart: { items: [...] } }
    if (data && data.cart && Array.isArray(data.cart.items)) {
      return { items: data.cart.items, success: true };
    } else {
      return { items: [], success: true };
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { items: [], success: false, message: 'Failed to fetch cart' };
  }
}

export async function addToCart(menuItem: MenuItem, quantity: number, specialInstructions?: string) {
  try {
    const data = await cartService.addToCart(menuItem._id, quantity, specialInstructions);
    if (data && data.cart && Array.isArray(data.cart.items)) {
      return { success: true, items: data.cart.items };
    } else {
      return await getCart();
    }
  } catch (error: any) {
    console.error('Error adding item to cart:', error);
    return { success: false, message: error?.response?.data?.message || 'Failed to add item to cart' };
  }
}

export async function updateCartItem(itemId: string, quantity: number, specialInstructions?: string) {
  try {
    const data = await cartService.updateCartItem(itemId, quantity, specialInstructions);
    if (data && data.cart && Array.isArray(data.cart.items)) {
      return { success: true, items: data.cart.items };
    } else {
      return await getCart();
    }
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return { success: false, message: error?.response?.data?.message || 'Failed to update cart item' };
  }
}

export async function removeFromCart(itemId: string) {
  try {
    const data = await cartService.removeFromCart(itemId);
    if (data && data.cart && Array.isArray(data.cart.items)) {
      return { success: true, items: data.cart.items };
    } else {
      return await getCart();
    }
  } catch (error: any) {
    console.error('Error removing item from cart:', error);
    return { success: false, message: error?.response?.data?.message || 'Failed to remove item from cart' };
  }
}

export async function clearCart() {
  try {
    await cartService.clearCart();
    return { success: true };
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return { success: false, message: error?.response?.data?.message || 'Failed to clear cart' };
  }
}

// Update the normalizeCartItems function to be async
export async function normalizeCartItems(items: unknown[]): Promise<CartItem[]> {
  if (!Array.isArray(items)) return [];
  
  return items.map((item: any) => {
    // Ensure we have a valid menuItem object
    const menuItem = item.menuItem || {};
    
    // Debug log to see the item structure
    console.log('Raw item data:', JSON.stringify(item, null, 2));
    
    // Check if we have a valid name or if it's "Unknown Item"
    let name = menuItem.name;
    if (!name || name === 'Unknown Item') {
      // Try to find name in alternate locations
      name = item.name || '';
      console.log('Replacing Unknown Item name with:', name);
    }
    
    return {
      _id: item._id || undefined,
      menuItem: {
        _id: menuItem._id || '',
        name: name || 'Sản phẩm', // Use default name in Vietnamese if all else fails
        price: typeof menuItem.price === 'number' ? menuItem.price : (typeof item.price === 'number' ? item.price : 0),
        image: menuItem.image || (item.image || ''),
        description: menuItem.description || (item.description || '')
      },
      quantity: typeof item.quantity === 'number' ? item.quantity : 0,
      specialInstructions: item.notes || item.specialInstructions || '',
      notes: item.notes || ''
    };
  });
} 