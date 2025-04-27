'use server';

import { cookies } from 'next/headers';
import { getCurrentUser } from './serverAuth';
import { MenuItem } from '../services/types';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

// Lấy giỏ hàng từ API
export async function getCart() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { items: [], success: false, message: 'Unauthorized' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    const response = await fetch(`${apiUrl}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }

    const data = await response.json();
    return { items: data.items || [], success: true };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { items: [], success: false, message: 'Failed to fetch cart' };
  }
}

// Thêm sản phẩm vào giỏ hàng
export async function addToCart(menuItem: MenuItem, quantity: number, specialInstructions?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    const response = await fetch(`${apiUrl}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        menuItemId: menuItem._id,
        quantity,
        specialInstructions
      })
    });

    if (!response.ok) {
      throw new Error('Failed to add item to cart');
    }

    const data = await response.json();
    return { success: true, items: data.items };
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return { success: false, message: 'Failed to add item to cart' };
  }
}

// Cập nhật sản phẩm trong giỏ hàng
export async function updateCartItem(itemId: string, quantity: number, specialInstructions?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    const response = await fetch(`${apiUrl}/cart/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        menuItemId: itemId,
        quantity,
        specialInstructions
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update cart item');
    }

    const data = await response.json();
    return { success: true, items: data.items };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return { success: false, message: 'Failed to update cart item' };
  }
}

// Xóa sản phẩm khỏi giỏ hàng
export async function removeFromCart(itemId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    const response = await fetch(`${apiUrl}/cart/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ menuItemId: itemId })
    });

    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }

    const data = await response.json();
    return { success: true, items: data.items };
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return { success: false, message: 'Failed to remove item from cart' };
  }
}

// Xóa toàn bộ giỏ hàng
export async function clearCart() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    const response = await fetch(`${apiUrl}/cart/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }

    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, message: 'Failed to clear cart' };
  }
} 