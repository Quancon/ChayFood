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
  } catch (error) {
    console.error('Error adding item to cart:', error);
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
  } catch (error) {
    console.error('Error updating cart item:', error);
   
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
  } catch (error) {
    console.error('Error removing item from cart:', error);
  
  }
}

export async function clearCart() {
  try {
    await cartService.clearCart();
    return { success: true };
  } catch (error: unknown) {
    console.error('Error clearing cart:', error);
  }
}

// Define a type for raw cart items that we might receive from API
interface RawCartItem {
  _id?: string;
  menuItem?: {
    _id?: string;
    name?: string;
    price?: number;
    image?: string;
    description?: string;
  };
  name?: string;
  price?: number;
  image?: string;
  description?: string;
  quantity?: number;
  notes?: string;
  specialInstructions?: string;
}

// Update the normalizeCartItems function to be async
export async function normalizeCartItems(items: unknown[]): Promise<CartItem[]> {
  if (!Array.isArray(items)) return [];
  
  return items.map((item) => {
    // Cast the unknown item to RawCartItem
    const rawItem = item as RawCartItem;
    
    // Ensure we have a valid menuItem object
    const menuItem = rawItem.menuItem || {};
    
    // Debug log to see the item structure
    console.log('Raw item data:', JSON.stringify(rawItem, null, 2));
    
    // Check if we have a valid name or if it's "Unknown Item"
    let name = menuItem.name;
    if (!name || name === 'Unknown Item') {
      // Try to find name in alternate locations
      name = rawItem.name || '';
      console.log('Replacing Unknown Item name with:', name);
    }
    
    return {
      _id: rawItem._id || undefined,
      menuItem: {
        _id: menuItem._id || '',
        name: name || 'Sản phẩm', // Use default name in Vietnamese if all else fails
        price: typeof menuItem.price === 'number' ? menuItem.price : (typeof rawItem.price === 'number' ? rawItem.price : 0),
        image: menuItem.image || (rawItem.image || ''),
        description: menuItem.description || (rawItem.description || '')
      },
      quantity: typeof rawItem.quantity === 'number' ? rawItem.quantity : 0,
      specialInstructions: rawItem.notes || rawItem.specialInstructions || '',
      notes: rawItem.notes || ''
    };
  });
} 